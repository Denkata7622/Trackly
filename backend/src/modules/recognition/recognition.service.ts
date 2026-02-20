import Tesseract from "tesseract.js";
import { interpretOcr, type InterpretedLine, type OcrBlock } from "./ocrInterpreter";
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

type OcrCandidateMetadata = {
  songName: string;
  artist: string;
  album: string;
  confidenceScore: number;
};

type TesseractWord = {
  text?: string;
  confidence?: number;
  bbox?: {
    x0?: number;
    y0?: number;
    x1?: number;
    y1?: number;
  };
};

const UNKNOWN_METADATA: OcrCandidateMetadata = {
  songName: "Unknown Song",
  artist: "Unknown Artist",
  album: "Unknown Album",
  confidenceScore: 0,
};

const OCR_CHAR_WHITELIST =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 &-_'\"():,./+!?[]";

const VISION_SYSTEM_PROMPT = `You are analyzing a music player screenshot (Spotify, Apple Music, YouTube Music, etc.).

Your task: Extract the COMPLETE song title and COMPLETE artist name exactly as displayed.

CRITICAL RULES:
1. The song title is usually the largest, most prominent text
2. The artist name is usually directly below or next to the song title
3. Artist names can be multiple words (e.g., "Mason Jar Moonshine", "The Weeknd", "Post Malone")
4. Song titles can be multiple words (e.g., "I'm Legendary", "Blinding Lights")
5. DO NOT extract fragments - capture the ENTIRE text for each field
6. DO NOT extract UI elements like "Play", "Pause", timestamps, or progress bars

Look for the NOW PLAYING section of the interface and extract from there.

Respond with ONLY this JSON format, no other text:
{"songName":"complete song title here","artist":"complete artist name here","album":"album name or empty string","confidence":0.95}

If you cannot clearly identify both song and artist, respond:
{"songName":"","artist":"","album":"","confidence":0}`;

type VisionExtractedMetadata = {
  songName: string;
  artist: string;
  album: string;
  confidence: number;
};

function scoreLineForTitle(line: InterpretedLine): number {
  return (
    line.features.heightPercentile * 0.45 +
    line.features.widthPercentile * 0.2 +
    line.features.letterRatio * 0.2 +
    (line.avgConfidence / 100) * 0.15
  );
}

export function deriveBestEffortMetadata(lines: InterpretedLine[]): OcrCandidateMetadata | null {
  if (lines.length === 0) {
    return null;
  }

  const eligible = lines.filter((line) => line.features.letterRatio >= 0.45 && line.features.length >= 2 && line.features.length <= 80);
  if (eligible.length === 0) {
    return null;
  }

  const titleLine = [...eligible].sort((a, b) => scoreLineForTitle(b) - scoreLineForTitle(a))[0];
  const artistLine = [...eligible]
    .filter((line) => line !== titleLine && line.bbox.y >= titleLine.bbox.y)
    .sort((a, b) => {
      const aDistance = Math.abs(a.bbox.y - (titleLine.bbox.y + titleLine.bbox.height));
      const bDistance = Math.abs(b.bbox.y - (titleLine.bbox.y + titleLine.bbox.height));
      if (Math.abs(aDistance - bDistance) > 0.001) {
        return aDistance - bDistance;
      }
      return Math.abs(a.bbox.x - titleLine.bbox.x) - Math.abs(b.bbox.x - titleLine.bbox.x);
    })[0];

  return {
    songName: titleLine.text,
    artist: artistLine?.text ?? UNKNOWN_METADATA.artist,
    album: UNKNOWN_METADATA.album,
    confidenceScore: Math.max(0.25, Math.min(0.59, titleLine.avgConfidence / 100)),
  };
}

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

function toOcrBlocks(words: TesseractWord[]): OcrBlock[] {
  const blocks: OcrBlock[] = [];

  for (const word of words) {
    const text = typeof word.text === "string" ? word.text : "";
    const bbox = word.bbox;
    if (!bbox) {
      continue;
    }

    const x0 = bbox.x0 ?? 0;
    const y0 = bbox.y0 ?? 0;
    const x1 = bbox.x1 ?? x0;
    const y1 = bbox.y1 ?? y0;

    blocks.push({
      text,
      confidence: typeof word.confidence === "number" ? word.confidence : 0,
      bbox: {
        x: x0,
        y: y0,
        width: Math.max(1, x1 - x0),
        height: Math.max(1, y1 - y0),
      },
    });
  }

  return blocks;
}

function parseVisionResponse(text: string): VisionExtractedMetadata {
  const trimmed = text.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new NoVerifiedResultError("Vision extraction did not return JSON metadata.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    throw new NoVerifiedResultError("Vision extraction returned invalid JSON metadata.");
  }

  const candidate = parsed as Partial<VisionExtractedMetadata>;
  return {
    songName: typeof candidate.songName === "string" ? candidate.songName.trim() : "",
    artist: typeof candidate.artist === "string" ? candidate.artist.trim() : "",
    album: typeof candidate.album === "string" ? candidate.album.trim() : "",
    confidence: typeof candidate.confidence === "number" ? candidate.confidence : 0,
  };
}

async function extractMetadataWithHuggingFaceVision(buffer: Buffer): Promise<OcrCandidateMetadata> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    throw new NoVerifiedResultError("Hugging Face vision is not configured.");
  }

  const modelUrl = process.env.HUGGINGFACE_VISION_URL ?? "https://router.huggingface.co/v1/chat/completions";
  const response = await fetch(modelUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.HUGGINGFACE_VISION_MODEL ?? "Qwen/Qwen2.5-VL-7B-Instruct",
      messages: [
        { role: "system", content: VISION_SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract the currently playing track metadata from this screenshot.",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/png;base64,${buffer.toString("base64")}`,
              },
            },
          ],
        },
      ],
      temperature: 0,
      max_tokens: 250,
    }),
  });

  if (!response.ok) {
    throw new NoVerifiedResultError(`Vision extraction failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    throw new NoVerifiedResultError("Vision extraction returned an empty response.");
  }

  const extracted = parseVisionResponse(content);
  console.log("[recognition] Vision extracted JSON:", extracted);

  // Reject obviously fragmented results
  if (extracted.songName.length < 3 || extracted.artist.length < 3) {
    console.warn(`[recognition] Vision returned suspiciously short metadata: "${extracted.songName}" by "${extracted.artist}"`);
    throw new NoVerifiedResultError("Vision extraction produced incomplete metadata.");
  }

  // Reject single-word artist names that look like fragments
  // (allow intentional single names like "Drake", "Adele" but flag "Jar", "Moon")
  const commonSingleWordArtists = ["drake", "adele", "rihanna", "beyonce", "eminem", "metallica"];
  const artistLower = extracted.artist.toLowerCase();
  if (!artistLower.includes(" ") &&
      extracted.artist.length < 6 &&
      !commonSingleWordArtists.includes(artistLower)) {
    console.warn(`[recognition] Vision returned likely fragment artist: "${extracted.artist}"`);
    throw new NoVerifiedResultError("Vision extraction produced incomplete metadata.");
  }

  return {
    songName: extracted.songName,
    artist: extracted.artist,
    album: extracted.album || UNKNOWN_METADATA.album,
    confidenceScore: extracted.confidence,
  };
}

async function extractMetadataWithOcr(buffer: Buffer, language = "eng"): Promise<OcrCandidateMetadata> {
  const worker = await Tesseract.createWorker(language);

  await worker.setParameters({
    tessedit_char_whitelist: OCR_CHAR_WHITELIST,
    preserve_interword_spaces: "1",
  });

  try {
    const ocrResult = await worker.recognize(buffer);
    const words = ((ocrResult.data as { words?: TesseractWord[] }).words ?? []) as TesseractWord[];
    const interpreted = interpretOcr(toOcrBlocks(words));

    if (interpreted.music?.title) {
      return {
        songName: interpreted.music.title,
        artist: interpreted.music.artist ?? UNKNOWN_METADATA.artist,
        album: UNKNOWN_METADATA.album,
        confidenceScore: interpreted.music.confidenceScore,
      };
    }

    const fallback = deriveBestEffortMetadata(interpreted.lines);
    if (!fallback) {
      throw new NoVerifiedResultError("Could not extract readable song text from the uploaded image.");
    }

    return fallback;
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
    console.warn("[recognition] Vision extraction unavailable or rejected, falling back to OCR.", error);
    candidate = await extractMetadataWithOcr(buffer, fallbackLanguage);
  }

  if (!candidate.songName || !candidate.artist || candidate.artist === UNKNOWN_METADATA.artist) {
    return toFallbackResponse(candidate);
  }

  const providerResult = await lookupSongByTitleAndArtist(candidate.songName, candidate.artist);
  if (providerResult) {
    return toProviderResponse(providerResult);
  }

  return toFallbackResponse(candidate);
}
