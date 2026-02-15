export type SongMatch = {
  songName: string;
  artist: string;
  album: string;
  confidence: number;
  albumArtUrl: string;
  releaseYear: number;
  genre: string;
  durationSec: number;
  platformLinks: {
    spotify: string;
    appleMusic: string;
    youtubeMusic: string;
  };
};

export type AudioRecognitionResult = {
  primaryMatch: SongMatch;
  alternatives: SongMatch[];
};

export type ImageRecognitionResult = {
  songs: SongMatch[];
  count: number;
  language: string;
};

export type SongRecognitionResult = {
  songName: string;
  artist: string;
  album: string;
  genre: string;
  releaseYear: number | null;
  platformLinks: {
    youtube?: string;
    appleMusic?: string;
    spotify?: string;
    preview?: string;
  };
  youtubeVideoId?: string;
  source: "provider" | "ocr_fallback";
  verificationStatus?: "verified" | "not_found";
};

export class RecognitionError extends Error {
  code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = "RecognitionError";
    this.code = code;
  }
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:4000";

async function postMultipart<T>(
  endpoint: string,
  fieldName: string,
  file: Blob,
  filename: string,
  extraFields?: Record<string, string>,
): Promise<T> {
  const formData = new FormData();
  formData.append(fieldName, file, filename);

  if (extraFields) {
    for (const [key, value] of Object.entries(extraFields)) {
      formData.append(key, value);
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    let code: string | undefined;

    try {
      const errorPayload = (await response.json()) as { message?: string; code?: string };
      if (errorPayload.message) {
        message = errorPayload.message;
      }
      code = errorPayload.code;
    } catch {
      // ignore
    }

    throw new RecognitionError(message, code);
  }

  return (await response.json()) as T;
}

export async function recognizeFromAudio(audioBlob: Blob): Promise<AudioRecognitionResult> {
  const primary = await postMultipart<SongMatch>(
    "/api/recognition/audio",
    "audio",
    audioBlob,
    "recording.webm",
  );

  return {
    primaryMatch: primary,
    alternatives: [],
  };
}

export async function recognizeFromImage(
  imageFile: File,
  maxSongs = 10,
  language = "eng",
): Promise<SongMatch> {
  const raw = await postMultipart<ImageRecognitionResult>(
    "/api/recognition/image",
    "image",
    imageFile,
    imageFile.name,
    { maxSongs: String(maxSongs), language },
  );

  const top = raw.songs[0];
  if (!top) throw new Error("No songs detected in the image.");
  return top;
}
