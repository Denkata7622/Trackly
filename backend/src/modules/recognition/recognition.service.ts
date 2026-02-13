import { parseBuffer } from "music-metadata";
import Tesseract from "tesseract.js";
import { lookupSongByTitleAndArtist } from "./providers/audd.provider";

export type RecognitionSource = "provider" | "ocr_fallback";

export type SongMetadata = {
  songName: string;
  artist: string;
  album: string;
  genre?: string;
  platform?: string;
  confidence?: {
    songName: number;
    artist: number;
    genre?: number;
    platform?: number;
    overall: number;
  };
  alternatives?: Array<{
    songName: string;
    artist: string;
    genre?: string;
    platform?: string;
    overallConfidence: number;
  }>;
};

type CandidateField = {
  value: string;
  confidence: number;
};

type ParsedCandidate = {
  title?: CandidateField;
  artist?: CandidateField;
  genre?: CandidateField;
  platform?: CandidateField;
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
const MIN_FIELD_CONFIDENCE = 0.55;
const MIN_OVERALL_CONFIDENCE = 0.68;
const ALTERNATIVE_DELTA = 0.08;

function normalize(text: string): string {
  return text
    .replace(/[|]/g, "I")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function toFallbackResponse(metadata: OcrCandidateMetadata): SongMetadata {
  return {
    ...metadata,
    genre: "Unknown Genre",
    platformLinks: {},
    releaseYear: null,
    source: "ocr_fallback",
  };
}

function parseFromFilename(filename: string): OcrCandidateMetadata {
  const cleaned = filename.replace(/\.[^/.]+$/, "").replace(/[_]+/g, " ").trim();
  const separators = [" - ", " – ", " — "];

  for (const separator of separators) {
    if (cleaned.includes(separator)) {
      const [artist, songName] = cleaned.split(separator).map((part) => part.trim());
      if (songName && artist) {
        return { songName, artist, album: UNKNOWN_METADATA.album };
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

function asField(value: string, confidence: number): CandidateField {
  return { value: normalize(value), confidence: Math.max(0, Math.min(1, confidence)) };
}

function parseLabeledLine(line: string, confidence: number): ParsedCandidate {
  const normalizedLine = normalize(line);
  const labelPatterns: Array<[keyof ParsedCandidate, RegExp]> = [
    ["title", /^(song|title|track)\s*[:\-]\s*(.+)$/i],
    ["artist", /^(artist|singer|by)\s*[:\-]\s*(.+)$/i],
    ["genre", /^(genre)\s*[:\-]\s*(.+)$/i],
    ["platform", /^(platform|service|app)\s*[:\-]\s*(.+)$/i],
  ];

  for (const [key, pattern] of labelPatterns) {
    const match = normalizedLine.match(pattern);
    if (match?.[2]) {
      return { [key]: asField(match[2], confidence) };
    }
  }

  const byMatch = normalizedLine.match(/^(.+)\s+by\s+(.+)$/i);
  if (byMatch) {
    return {
      title: asField(byMatch[1], confidence),
      artist: asField(byMatch[2], confidence),
    };
  }

  const dashMatch = normalizedLine.match(/^(.+?)\s[-–—]\s(.+)$/);
  if (dashMatch) {
    return {
      artist: asField(dashMatch[1], confidence * 0.9),
      title: asField(dashMatch[2], confidence * 0.9),
    };
  }

  return {};
}

function chooseBestField(candidates: Array<CandidateField | undefined>): CandidateField | undefined {
  return candidates.filter(Boolean).sort((a, b) => (b?.confidence ?? 0) - (a?.confidence ?? 0))[0];
}

function buildCandidates(
  lines: Array<{ text: string; confidence: number }>,
): { primary?: SongMetadata; alternatives: SongMetadata["alternatives"] } {
  const parsedLines = lines
    .map((line) => parseLabeledLine(line.text, line.confidence))
    .filter((candidate) => Object.keys(candidate).length > 0);

  const aggregate: ParsedCandidate = {
    title: chooseBestField(parsedLines.map((line) => line.title)),
    artist: chooseBestField(parsedLines.map((line) => line.artist)),
    genre: chooseBestField(parsedLines.map((line) => line.genre)),
    platform: chooseBestField(parsedLines.map((line) => line.platform)),
  };

  if (!aggregate.title || !aggregate.artist) {
    return { alternatives: [] };
  }

  const overall = (aggregate.title.confidence + aggregate.artist.confidence) / 2;
  const hasMinimumConfidence =
    aggregate.title.confidence >= MIN_FIELD_CONFIDENCE &&
    aggregate.artist.confidence >= MIN_FIELD_CONFIDENCE &&
    overall >= MIN_OVERALL_CONFIDENCE;

  if (!hasMinimumConfidence) {
    return { alternatives: [] };
  }

  const primary: SongMetadata = {
    songName: aggregate.title.value,
    artist: aggregate.artist.value,
    album: UNKNOWN_METADATA.album,
    genre: aggregate.genre?.value,
    platform: aggregate.platform?.value,
    confidence: {
      songName: aggregate.title.confidence,
      artist: aggregate.artist.confidence,
      genre: aggregate.genre?.confidence,
      platform: aggregate.platform?.confidence,
      overall,
    },
  };

  const alternatives = parsedLines
    .filter((line) => line.title && line.artist)
    .map((line) => {
      const altOverall = ((line.title?.confidence ?? 0) + (line.artist?.confidence ?? 0)) / 2;
      return {
        songName: line.title!.value,
        artist: line.artist!.value,
        genre: line.genre?.value,
        platform: line.platform?.value,
        overallConfidence: altOverall,
      };
    })
    .filter((alt) =>
      alt.songName !== primary.songName &&
      alt.artist !== primary.artist &&
      primary.confidence &&
      Math.abs(primary.confidence.overall - alt.overallConfidence) <= ALTERNATIVE_DELTA,
    )
    .sort((a, b) => b.overallConfidence - a.overallConfidence);

  return { primary, alternatives };
}

async function canonicalizeFromProvider(candidate: OcrCandidateMetadata): Promise<SongMetadata> {
  const providerResult = await lookupSongByTitleAndArtist(candidate.songName, candidate.artist);

  if (!providerResult) {
    return toFallbackResponse(candidate);
  }

  return {
    songName: providerResult.songName,
    artist: providerResult.artist,
    album: providerResult.album,
    genre: providerResult.genre,
    platformLinks: providerResult.platformLinks,
    releaseYear: providerResult.releaseYear,
    source: "provider",
  };
}

export async function recognizeSongFromAudio(buffer: Buffer, originalName: string): Promise<SongMetadata> {
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
    // If audio tags cannot be parsed, fallback to file name extraction.
  }

  return toFallbackResponse(parseFromFilename(originalName));
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
    const lines = (ocrResult.data.lines ?? []).map((line: { text: string; confidence?: number }) => ({
      text: line.text,
      confidence: (line.confidence ?? ocrResult.data.confidence ?? 0) / 100,
    }));

    const { primary, alternatives } = buildCandidates(lines);

    if (!primary) {
      throw new Error("No high-confidence metadata candidate detected from OCR.");
    }

    if (alternatives && alternatives.length > 0) {
      primary.alternatives = alternatives;
    }

    return primary;
  } finally {
    await worker.terminate();
  }
}
