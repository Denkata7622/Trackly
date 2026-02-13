export type SongRecognitionResult = {
  songName: string;
  artist: string;
  album: string;
  genre: string;
  platformLinks: {
    appleMusic?: string;
    preview?: string;
  };
  releaseYear: number | null;
  source: "provider" | "ocr_fallback";
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:4000";

async function postMultipart(endpoint: string, fieldName: string, file: Blob, filename: string) {
  const formData = new FormData();
  formData.append(fieldName, file, filename);

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const errorPayload = (await response.json()) as { message?: string };
      if (errorPayload.message) {
        message = errorPayload.message;
      }
    } catch {
      // Ignore JSON parse errors from error responses.
    }
    throw new Error(message);
  }

  return (await response.json()) as SongRecognitionResult;
}

export async function recognizeFromAudio(audioBlob: Blob): Promise<SongRecognitionResult> {
  return postMultipart("/api/recognition/audio", "audio", audioBlob, "recording.webm");
}

export async function recognizeFromImage(imageFile: File): Promise<SongRecognitionResult> {
  return postMultipart("/api/recognition/image", "image", imageFile, imageFile.name);
}
