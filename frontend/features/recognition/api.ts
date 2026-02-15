export type SongRecognitionResult = {
  songName: string;
  artist: string;
  album: string;
  genre: string;
  platformLinks: {
    youtube?: string;
    appleMusic?: string;
    spotify?: string;
    preview?: string;
  };
  youtubeVideoId?: string;
  releaseYear: number | null;
  source: "provider" | "ocr_fallback";
  verificationStatus?: "verified" | "not_found";
};

export type AudioRecognitionResult = {
  primaryMatch: SongRecognitionResult;
  alternatives: SongRecognitionResult[];
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

async function postMultipart<T>(endpoint: string, fieldName: string, file: Blob, filename: string): Promise<T> {
  const formData = new FormData();
  formData.append(fieldName, file, filename);

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
      // Ignore JSON parse errors from error responses.
    }

    throw new RecognitionError(message, code);
  }

  return (await response.json()) as T;
}

export async function recognizeFromAudio(audioBlob: Blob): Promise<AudioRecognitionResult> {
  const primary = await postMultipart<SongRecognitionResult>(
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

export async function recognizeFromImage(imageFile: File): Promise<SongRecognitionResult> {
  return postMultipart<SongRecognitionResult>("/api/recognition/image", "image", imageFile, imageFile.name);
}
