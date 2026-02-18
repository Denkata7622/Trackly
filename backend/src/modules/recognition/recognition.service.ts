// Gemini 1.5 Flash is chosen as the primary vision provider here because it is reliable in production,
// fast for image understanding, and already available in this environment via GEMINI_API_KEY.
import Tesseract from "tesseract.js";
import { GEMINI_API_KEY } from "../../config/env";
import { parseOcrCandidateText, type OcrCandidateMetadata } from "./ocr-parser";
import {
  lookupSongByTitleAndArtist,
  NoVerifiedResultError,
  recognizeAudioWithAudd,
  type ProviderSongMetadata,
} from "./providers/audd.provider";

export type SongMetadata = ProviderSongMetadata & {
  source: "provider" | "ocr_fallback";
  verificationStatus: "verified" | "not_found";
};

type VisionExtraction = {
  artist?: string;
  album?: string;
  title?: string;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

const UNKNOWN_METADATA: OcrCandidateMetadata = {
  songName: "Unknown Song",
  artist: "Unknown Artist",
  album: "Unknown Album",
};

const OCR_CHAR_WHITELIST =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 &-_'\"():,./+!?[]";

const GEMINI_VISION_PROMPT =
  'Identify the album art or music screenshot and extract metadata. Respond ONLY with valid JSON in exactly this shape: {"artist":"...","album":"...","title":"..."}. Use empty strings if unknown. No markdown, no explanation.';

function toProviderResponse(metadata: ProviderSongMetadata): SongMetadata {
  return {
    ...metadata,
    source: "provider",
    verificationStatus: metadata.youtubeVideoId ? "verified" : "not_found",
  };
}

function toFallbackResponse(metadata: OcrCandidateMetadata): SongMetadata {
  return {
    songName: metadata.songName,
    artist: metadata.artist,
    album: metadata.album,
    genre: "Unknown Genre",
    platformLinks: {},
    youtubeVideoId: undefined,
    releaseYear: null,
    source: "ocr_fallback",
    verificationStatus: "not_found",
  };
}

function parseVisionJsonResponse(text: string): VisionExtraction {
  const withoutFences = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  const jsonCandidate = withoutFences.startsWith("{")
    ? withoutFences
    : (withoutFences.match(/\{[\s\S]*\}/)?.[0] ?? "");

  if (!jsonCandidate) {
    throw new NoVerifiedResultError("Could not parse song metadata from vision output.");
  }

  try {
    const parsed = JSON.parse(jsonCandidate) as Partial<VisionExtraction>;
    return {
      artist: typeof parsed.artist === "string" ? parsed.artist.trim() : "",
      album: typeof parsed.album === "string" ? parsed.album.trim() : "",
      title: typeof parsed.title === "string" ? parsed.title.trim() : "",
    };
  } catch {
    throw new NoVerifiedResultError("Could not parse song metadata from vision output.");
  }
}

async function extractMetadataWithGeminiVision(buffer: Buffer): Promise<OcrCandidateMetadata> {
  const geminiApiKey = process.env.GEMINI_API_KEY?.trim() || GEMINI_API_KEY.trim();
  if (!geminiApiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
  const imageBase64 = buffer.toString("base64");

  const response = await fetch(`${endpoint}?key=${encodeURIComponent(geminiApiKey)}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: GEMINI_VISION_PROMPT },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: imageBase64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini Vision API failed with status ${response.status}`);
  }

  const payload = (await response.json()) as GeminiResponse;
  const responseText = payload.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!responseText) {
    throw new NoVerifiedResultError("Could not parse song metadata from vision output.");
  }

  const extracted = parseVisionJsonResponse(responseText);

  if (!extracted.title || !extracted.artist) {
    throw new NoVerifiedResultError("Could not identify song metadata from the image.");
  }

  console.log("[recognition] Gemini Vision extracted:", {
    title: extracted.title,
    artist: extracted.artist,
    album: extracted.album || "",
  });

  return {
    songName: extracted.title,
    artist: extracted.artist,
    album: extracted.album || UNKNOWN_METADATA.album,
  };
}

async function extractMetadataWithOcrFallback(buffer: Buffer, language = "eng"): Promise<OcrCandidateMetadata> {
  const worker = await Tesseract.createWorker(language);

  await worker.setParameters({
    tessedit_char_whitelist: OCR_CHAR_WHITELIST,
    preserve_interword_spaces: "1",
  });

  try {
    const ocrResult = await worker.recognize(buffer);
    const candidate = parseOcrCandidateText(ocrResult.data.text, UNKNOWN_METADATA.album);

    if (!candidate) {
      throw new NoVerifiedResultError("Could not parse a valid Song - Artist pair from the uploaded image.");
    }

    return candidate;
  } finally {
    await worker.terminate();
  }
}

export async function recognizeSongFromAudio(buffer: Buffer, originalName: string): Promise<SongMetadata> {
  const providerResult = await recognizeAudioWithAudd(buffer, originalName);

  if (providerResult?.youtubeVideoId) {
    return toProviderResponse(providerResult);
  }

  throw new NoVerifiedResultError("Recognition succeeded but no verified YouTube result was found.");
}

export async function recognizeSongFromImage(buffer: Buffer, fallbackLanguage = "eng"): Promise<SongMetadata> {
  let candidate: OcrCandidateMetadata;

  try {
    candidate = await extractMetadataWithGeminiVision(buffer);
  } catch (error) {
    if (error instanceof NoVerifiedResultError) {
      throw error;
    }

    console.warn(`[recognition] Gemini Vision failed; falling back to Tesseract OCR: ${(error as Error).message}`);
    candidate = await extractMetadataWithOcrFallback(buffer, fallbackLanguage);
  }

  const providerResult = await lookupSongByTitleAndArtist(candidate.songName, candidate.artist);
  if (providerResult) {
    return toProviderResponse(providerResult);
  }

  return toFallbackResponse(candidate);
}
