import type { Track } from "../tracks/types";

type RecognizeResponse = {
  trackId: string;
  title: string;
  artist: {
    id: string;
    name: string;
  };
  license: "FREE" | "COPYRIGHTED";
  artworkUrl?: string;
};

const FALLBACK_COVER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cdefs%3E%3CradialGradient id='g' cx='35%25' cy='30%25'%3E%3Cstop offset='0%25' stop-color='%23b7a8ff'/%3E%3Cstop offset='60%25' stop-color='%237c5cff'/%3E%3Cstop offset='100%25' stop-color='%230b0d12'/%3E%3C/radialGradient%3E%3C/defs%3E%3Crect width='240' height='240' fill='url(%23g)'/%3E%3C/svg%3E";

function toTrack(data: RecognizeResponse): Track {
  return {
    id: data.trackId,
    title: data.title,
    artistName: data.artist.name,
    artistId: data.artist.id,
    artworkUrl: data.artworkUrl || FALLBACK_COVER,
    license: data.license,
  };
}

export async function recognizeTrack(): Promise<Track> {
  const response = await fetch("/api/recognize", {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`Recognition failed with status ${response.status}`);
  }

  const payload = (await response.json()) as RecognizeResponse;
  return toTrack(payload);
}
