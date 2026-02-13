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

// Unified shape used by the UI (page.tsx, TrackCard, etc.)
export type SongRecognitionResult = {
  songName: string;
  artist: string;
  album: string;
  genre: string;
  releaseYear: number;
  platformLinks: {
    spotify?: string;
    appleMusic?: string;
    youtubeMusic?: string;
  };
  source: "audio" | "image";
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:4000";

async function postMultipart<TResponse>(
  endpoint: string,
  fieldName: string,
  file: Blob,
  filename: string,
  extraFields?: Record<string, string>,
): Promise<TResponse> {
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
    try {
      const errorPayload = (await response.json()) as { message?: string };
      if (errorPayload.message) message = errorPayload.message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  return (await response.json()) as TResponse;
}

function matchToResult(match: SongMatch, source: SongRecognitionResult["source"]): SongRecognitionResult {
  return {
    songName: match.songName,
    artist: match.artist,
    album: match.album,
    genre: match.genre,
    releaseYear: match.releaseYear,
    platformLinks: match.platformLinks,
    source,
  };
}

export async function recognizeFromAudio(audioBlob: Blob): Promise<SongRecognitionResult> {
  const raw = await postMultipart<AudioRecognitionResult>(
    "/api/recognition/audio",
    "audio",
    audioBlob,
    "recording.webm",
  );
  return matchToResult(raw.primaryMatch, "audio");
}

export async function recognizeFromImage(
  imageFile: File,
  maxSongs = 10,
  language = "eng",
): Promise<SongRecognitionResult> {
  const raw = await postMultipart<ImageRecognitionResult>(
    "/api/recognition/image",
    "image",
    imageFile,
    imageFile.name,
    { maxSongs: String(maxSongs), language },
  );

  const top = raw.songs[0];
  if (!top) throw new Error("No songs detected in the image.");
  return matchToResult(top, "image");
}