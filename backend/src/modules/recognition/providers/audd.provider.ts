const AUDD_API_URL = "https://api.audd.io/";
const AUDD_TIMEOUT_MS = Number(process.env.AUDD_TIMEOUT_MS || 8000);

export const enum RecognitionErrorCode {
  PROVIDER_TIMEOUT = "PROVIDER_TIMEOUT",
  PROVIDER_RATE_LIMIT = "PROVIDER_RATE_LIMIT",
  PROVIDER_REQUEST_FAILED = "PROVIDER_REQUEST_FAILED",
}

export class RecognitionProviderError extends Error {
  constructor(
    message: string,
    public readonly code: RecognitionErrorCode,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = "RecognitionProviderError";
  }
}

type AudDResult = {
  title?: string;
  artist?: string;
  album?: string;
  release_date?: string;
  genre?: string;
  song_link?: string;
  timecode?: string;
  spotify?: {
    external_urls?: {
      spotify?: string;
    };
  };
  apple_music?: {
    url?: string;
  };
};

type AudDResponse = {
  status?: string;
  result?: AudDResult | null;
  error?: {
    error_code?: number;
    error_message?: string;
  };
};

function parseReleaseYear(releaseDate?: string): number | null {
  if (!releaseDate) {
    return null;
  }

  const yearMatch = releaseDate.match(/^(\d{4})/);
  return yearMatch ? Number(yearMatch[1]) : null;
}

export type AudDRecognition = {
  title: string;
  artist: string;
  genre: string | null;
  platformLinks: Record<string, string>;
  confidence: number;
  album: string | null;
  releaseYear: number | null;
};

export async function recognizeWithAudD(audioBuffer: Buffer): Promise<AudDRecognition | null> {
  const apiToken = process.env.AUDD_API_TOKEN?.trim();
  if (!apiToken) {
    return null;
  }

  const formData = new FormData();
  formData.append("api_token", apiToken);
  formData.append("return", "spotify,apple_music");
  formData.append("file", new Blob([new Uint8Array(audioBuffer)]), "recording.webm");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AUDD_TIMEOUT_MS);

  try {
    const response = await fetch(AUDD_API_URL, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });

    if (response.status === 429) {
      throw new RecognitionProviderError("AudD rate limit exceeded.", RecognitionErrorCode.PROVIDER_RATE_LIMIT, 429);
    }

    if (!response.ok) {
      throw new RecognitionProviderError(
        `AudD request failed with status ${response.status}.`,
        RecognitionErrorCode.PROVIDER_REQUEST_FAILED,
        response.status,
      );
    }

    const payload = (await response.json()) as AudDResponse;
    if (payload.status !== "success" || !payload.result) {
      return null;
    }

    const result = payload.result;
    const platformLinks: Record<string, string> = {};

    if (result.song_link) {
      platformLinks.audd = result.song_link;
    }
    const spotifyLink = result.spotify?.external_urls?.spotify;
    if (spotifyLink) {
      platformLinks.spotify = spotifyLink;
    }
    const appleMusicLink = result.apple_music?.url;
    if (appleMusicLink) {
      platformLinks.appleMusic = appleMusicLink;
    }

    return {
      title: result.title?.trim() || "Unknown Song",
      artist: result.artist?.trim() || "Unknown Artist",
      genre: result.genre?.trim() || null,
      platformLinks,
      confidence: result.timecode ? 0.9 : 0.75,
      album: result.album?.trim() || null,
      releaseYear: parseReleaseYear(result.release_date),
    };
  } catch (error) {
    if (error instanceof RecognitionProviderError) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new RecognitionProviderError("AudD request timed out.", RecognitionErrorCode.PROVIDER_TIMEOUT);
    }

    throw new RecognitionProviderError(
      `AudD request failed: ${(error as Error).message}`,
      RecognitionErrorCode.PROVIDER_REQUEST_FAILED,
    );
  } finally {
    clearTimeout(timeout);
  }
}
