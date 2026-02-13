import { parseBuffer } from "music-metadata";
import Tesseract from "tesseract.js";
import { recognizeWithAudD, RecognitionErrorCode, RecognitionProviderError } from "./providers/audd.provider";

export type SongMetadata = {
  title: string;
  artist: string;
  genre: string | null;
  platformLinks: Record<string, string>;
  confidence: number;
  album: string | null;
  releaseYear: number | null;
  errorCode?: RecognitionErrorCode;
};

const UNKNOWN_METADATA: SongMetadata = {
  title: "Unknown Song",
  artist: "Unknown Artist",
  genre: null,
  platformLinks: {},
  confidence: 0,
  album: "Unknown Album",
  releaseYear: null,
};

function normalize(text: string): string {
  return text
    .replace(/[|]/g, "I")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .trim();
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
          title,
          artist,
        };
      }
    }
  }

  return {
    ...UNKNOWN_METADATA,
    title: cleaned || UNKNOWN_METADATA.title,
  };
}

function extractSongMetadata(ocrText: string): SongMetadata {
  const normalizedText = normalize(ocrText);
  const lines = normalizedText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const songLine = lines.find((line) => /^song\s*:/i.test(line));
  const artistLine = lines.find((line) => /^artist\s*:/i.test(line));
  const albumLine = lines.find((line) => /^album\s*:/i.test(line));

  const title = songLine?.split(/:/).slice(1).join(":").trim() || lines[0] || UNKNOWN_METADATA.title;
  const artist = artistLine?.split(/:/).slice(1).join(":").trim() || lines[1] || UNKNOWN_METADATA.artist;
  const album = albumLine?.split(/:/).slice(1).join(":").trim() || lines[2] || UNKNOWN_METADATA.album;

  return {
    ...UNKNOWN_METADATA,
    title: title || UNKNOWN_METADATA.title,
    artist: artist || UNKNOWN_METADATA.artist,
    album: album || UNKNOWN_METADATA.album,
  };
}

async function recognizeFromLocalTags(
  buffer: Buffer,
  originalName: string,
  errorCode?: RecognitionErrorCode,
): Promise<SongMetadata> {
  try {
    const metadata = await parseBuffer(buffer);
    const title = metadata.common.title?.trim();
    const artist = metadata.common.artist?.trim();
    const album = metadata.common.album?.trim();
    const genre = metadata.common.genre?.[0]?.trim() || null;

    if (title || artist || album || genre) {
      return {
        ...UNKNOWN_METADATA,
        title: title || UNKNOWN_METADATA.title,
        artist: artist || UNKNOWN_METADATA.artist,
        album: album || UNKNOWN_METADATA.album,
        genre,
        confidence: 0.4,
        ...(errorCode ? { errorCode } : {}),
      };
    }
  } catch {
    // If audio tags cannot be parsed, fallback to file name extraction.
  }

  const parsed = parseFromFilename(originalName);
  return errorCode ? { ...parsed, errorCode } : parsed;
}

export async function recognizeSongFromAudio(buffer: Buffer, originalName: string): Promise<SongMetadata> {
  try {
    const auddRecognition = await recognizeWithAudD(buffer);
    if (auddRecognition) {
      return auddRecognition;
    }
  } catch (error) {
    if (
      error instanceof RecognitionProviderError &&
      [RecognitionErrorCode.PROVIDER_TIMEOUT, RecognitionErrorCode.PROVIDER_RATE_LIMIT].includes(error.code)
    ) {
      return recognizeFromLocalTags(buffer, originalName, error.code);
    }

    return recognizeFromLocalTags(buffer, originalName);
  }

  return recognizeFromLocalTags(buffer, originalName);
}

export async function recognizeSongFromImage(buffer: Buffer): Promise<SongMetadata> {
  const ocrResult = await Tesseract.recognize(buffer, "eng");
  return extractSongMetadata(ocrResult.data.text);
}
