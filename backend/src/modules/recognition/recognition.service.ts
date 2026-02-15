import { parseBuffer } from "music-metadata";
import Tesseract from "tesseract.js";
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
};

const UNKNOWN_METADATA: OcrCandidateMetadata = {
  songName: "Unknown Song",
  artist: "Unknown Artist",
  album: "Unknown Album",
};

const OCR_CHAR_WHITELIST =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 &-_'\"():,./+!?[]";

function toFallbackResponse(metadata: OcrCandidateMetadata): SongMetadata {
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

function parseFromFilename(filename: string): OcrCandidateMetadata {
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
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const sharpProcessor = require("sharp") as (input: Buffer) => {
    rotate: () => any;
  };

  return sharpProcessor(buffer)
    .rotate()
    .resize({ width: 1800, height: 1800, fit: "inside", withoutEnlargement: true })
    .grayscale()
    .normalize()
    .threshold(155)
    .png()
    .toBuffer();
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

  return toFallbackResponse(parseFromFilename(originalName));
}

function extractMetadataFromText(text: string): OcrCandidateMetadata | null {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const labeled = {
    songName: "",
    artist: "",
    album: "",
  };

  for (const line of lines) {
    const songMatch = line.match(/^(song|title|track)\s*[:\-]\s*(.+)$/i);
    if (songMatch?.[2]) {
      labeled.songName = songMatch[2].trim();
      continue;
    }

    const artistMatch = line.match(/^(artist|singer|by)\s*[:\-]\s*(.+)$/i);
    if (artistMatch?.[2]) {
      labeled.artist = artistMatch[2].trim();
      continue;
    }

    const albumMatch = line.match(/^(album)\s*[:\-]\s*(.+)$/i);
    if (albumMatch?.[2]) {
      labeled.album = albumMatch[2].trim();
    }
  }

  if (labeled.songName && labeled.artist) {
    return {
      songName: labeled.songName,
      artist: labeled.artist,
      album: labeled.album || UNKNOWN_METADATA.album,
    };
  }

  for (const line of lines) {
    const byPattern = line.match(/^(.+?)\s+by\s+(.+)$/i);
    if (byPattern?.[1] && byPattern?.[2]) {
      return {
        songName: byPattern[1].trim(),
        artist: byPattern[2].trim(),
        album: UNKNOWN_METADATA.album,
      };
    }

    const dashPattern = line.match(/^(.+?)\s[-–—]\s(.+)$/);
    if (dashPattern?.[1] && dashPattern?.[2]) {
      return {
        songName: dashPattern[2].trim(),
        artist: dashPattern[1].trim(),
        album: UNKNOWN_METADATA.album,
      };
    }
  }

  return null;
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
    const candidate = extractMetadataFromText(ocrResult.data.text);

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
