import Tesseract from "tesseract.js";
import { interpretOcr, type OcrBlock } from "./ocrInterpreter";
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

    if (!interpreted.music?.title || !interpreted.music.artist) {
      throw new NoVerifiedResultError("Could not parse a valid title and artist pair from the uploaded image.");
    }

    return {
      songName: interpreted.music.title,
      artist: interpreted.music.artist,
      album: UNKNOWN_METADATA.album,
      confidenceScore: interpreted.music.confidenceScore,
    };
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
  const candidate = await extractMetadataWithOcr(buffer, fallbackLanguage);

  const providerResult = await lookupSongByTitleAndArtist(candidate.songName, candidate.artist);
  if (providerResult) {
    return toProviderResponse(providerResult);
  }

  return toFallbackResponse(candidate);
}
