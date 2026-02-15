import { parseBuffer } from "music-metadata";
import Tesseract from "tesseract.js";
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

const UNKNOWN_METADATA: OcrCandidateMetadata = {
  songName: "Unknown Song",
  artist: "Unknown Artist",
  album: "Unknown Album",
};

const OCR_CHAR_WHITELIST =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 &-_'\"():,./+!?[]";

function enrichSong(song: SongMetadata, confidence: number): SongMatch {
  const seed = buildSeed(song);
  const genre = GENRES[seed % GENRES.length];
  const releaseYear = 1998 + (seed % 27);
  const durationSec = 140 + (seed % 140);
  const artistSlug = slugify(song.artist);
  const songSlug = slugify(song.songName);

  return {
    ...metadata,
    genre: "Unknown Genre",
    platformLinks: {},
    releaseYear: null,
    source: "ocr_fallback",
    verificationStatus: "not_found",
  };
}

function toProviderResponse(metadata: ProviderSongMetadata): SongMetadata {
  return {
    ...metadata,
    source: "provider",
    verificationStatus: metadata.youtubeVideoId ? "verified" : "not_found",
  };
}

function cleanValue(value?: string): string {
  const normalized = value?.trim();
  return normalized && normalized.length > 0 ? normalized : "";
}

function parseFromFilename(filename: string): SongMetadata {
  const cleaned = filename.replace(/\.[^/.]+$/, "").replace(/[_]+/g, " ").trim();
  const separators = [" - ", " – ", " — "];

  for (const separator of separators) {
    if (cleaned.includes(separator)) {
      const [artist, title] = cleaned.split(separator).map((part) => part.trim());
      if (title && artist) {
        return {
          ...UNKNOWN_METADATA,
          songName: title,
          artist,
        };
      }
    }
  }

  return {
    ...UNKNOWN_METADATA,
    songName: cleaned || UNKNOWN_METADATA.songName,
  };
}

async function preprocessImage(buffer: Buffer): Promise<Buffer> {
  return buffer;
}

async function recognizeFromLocalTags(buffer: Buffer, originalName: string): Promise<SongMetadata> {
  try {
    const metadata = await parseBuffer(buffer);
    const songName = metadata.common.title?.trim();
    const artist = metadata.common.artist?.trim();
    const album = metadata.common.album?.trim();

    if (songName || artist || album) {
      return toFallbackResponse({
        songName: songName || UNKNOWN_METADATA.songName,
        artist: artist || UNKNOWN_METADATA.artist,
        album: album || UNKNOWN_METADATA.album,
      });
    }
  } catch {
    // fall through to filename parser
  }

  throw new NoVerifiedResultError("Recognition succeeded but no verified YouTube result was found.");
}

export async function recognizeSongFromAudio(buffer: Buffer, originalName: string): Promise<SongMetadata> {
  const providerResult = await recognizeAudioWithAudd(buffer, originalName);

  if (providerResult?.youtubeVideoId) {
    return toProviderResponse(providerResult);
  }

  throw new NoVerifiedResultError("Recognition succeeded but no verified YouTube result was found.");
}

export async function recognizeSongFromImage(buffer: Buffer, language = "eng"): Promise<SongMetadata> {
  const preprocessedImage = await preprocessImage(buffer);
  const worker = await Tesseract.createWorker(language);

  await worker.setParameters({
    tessedit_char_whitelist: OCR_CHAR_WHITELIST,
    preserve_interword_spaces: "1",
  });

  try {
    const ocrResult = await worker.recognize(preprocessedImage);
    const candidate = parseOcrCandidateText(ocrResult.data.text, UNKNOWN_METADATA.album);

    if (!candidate) {
      throw new NoVerifiedResultError("Could not parse a valid Song - Artist pair from the uploaded image.");
    }

    const providerResult = await lookupSongByTitleAndArtist(candidate.songName, candidate.artist);

    if (!providerResult) {
      throw new NoVerifiedResultError("No verified YouTube result found for the OCR track candidate.");
    }

    return toProviderResponse(providerResult);
  } finally {
    await worker.terminate();
  }
}

export { recognizeFromLocalTags };
