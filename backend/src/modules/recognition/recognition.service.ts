import Tesseract from "tesseract.js";
import { HF_API_TOKEN } from "../../config/env";
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
  songName: string;
  artist: string;
  album: string;
  confidence: number;
};

const UNKNOWN_METADATA: OcrCandidateMetadata = {
  songName: "Unknown Song",
  artist: "Unknown Artist",
  album: "Unknown Album",
};

const OCR_CHAR_WHITELIST =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 &-_'\"():,./+!?[]";

const HF_VISION_PROMPT =
  'Extract the song title and artist from this music player screenshot. Respond with ONLY valid JSON: {"songName":"title","artist":"artist","album":"album","confidence":0.95}';

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

  let parsed: Partial<VisionExtraction>;
  try {
    parsed = JSON.parse(jsonCandidate) as Partial<VisionExtraction>;
  } catch {
    throw new NoVerifiedResultError("Could not identify song metadata from the image.");
  }

  return {
    songName: typeof parsed.songName === "string" ? parsed.songName.trim() : "",
    artist: typeof parsed.artist === "string" ? parsed.artist.trim() : "",
    album: typeof parsed.album === "string" ? parsed.album.trim() : "",
    confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0,
  };
}

async function callHFWithRetry(url: string, options: RequestInit): Promise<Response> {
  const response = await fetch(url, options);

  if (response.status === 503) {
    const errorPayload = (await response.json().catch(() => ({}))) as { error?: string };
    if (errorPayload.error?.toLowerCase().includes("loading")) {
      console.log("[recognition] Vision model is loading, retrying in 5 seconds...");
      await new Promise((resolve) => setTimeout(resolve, 5000));
      return fetch(url, options);
    }
  }

  return response;
}

async function extractMetadataWithHuggingFaceVision(buffer: Buffer): Promise<OcrCandidateMetadata> {
  const hfApiToken = process.env.HF_API_TOKEN?.trim() || HF_API_TOKEN.trim();
  if (!hfApiToken) {
    throw new Error("HF_API_TOKEN is not configured.");
  }

  const endpoint =
    "https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-11B-Vision-Instruct";
  const imageBase64 = buffer.toString("base64");

  const response = await callHFWithRetry(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${hfApiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: {
        image: `data:image/jpeg;base64,${imageBase64}`,
        prompt: HF_VISION_PROMPT,
      },
      parameters: {
        max_new_tokens: 200,
        temperature: 0.1,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Hugging Face API failed with status ${response.status}`);
  }

  const payload = (await response.json()) as Array<{ generated_text?: string }> | { generated_text?: string };
  const generatedText = Array.isArray(payload) ? payload[0]?.generated_text : payload.generated_text;

  if (!generatedText || typeof generatedText !== "string") {
    throw new NoVerifiedResultError("Could not identify song metadata from the image.");
  }

  const extracted = parseVisionJsonResponse(generatedText);

  if (!extracted.songName || !extracted.artist) {
    throw new NoVerifiedResultError("Could not identify song metadata from the image.");
  }

  return {
    songName: extracted.songName,
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
    candidate = await extractMetadataWithHuggingFaceVision(buffer);
  } catch (error) {
    if (error instanceof NoVerifiedResultError) {
      throw error;
    }

    console.warn(`[recognition] Hugging Face Vision failed; falling back to Tesseract OCR: ${(error as Error).message}`);
    candidate = await extractMetadataWithOcrFallback(buffer, fallbackLanguage);
  }

  const providerResult = await lookupSongByTitleAndArtist(candidate.songName, candidate.artist);
  if (providerResult) {
    return toProviderResponse(providerResult);
  }

  return toFallbackResponse(candidate);
}
