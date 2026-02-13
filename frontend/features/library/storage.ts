import type { LibraryState, Playlist } from "./types";

const FAVORITES_KEY = "trackly.library.favorites";
const PLAYLISTS_KEY = "trackly.library.playlists";

const initialState: LibraryState = {
  favorites: [],
  playlists: [],
};

function isPlaylist(value: unknown): value is Playlist {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<Playlist>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    Array.isArray(candidate.songIds) &&
    candidate.songIds.every((id) => typeof id === "string")
  );
}

function safeJsonParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function loadLibraryState(): LibraryState {
  if (typeof window === "undefined") {
    return initialState;
  }

  const rawFavorites = safeJsonParse<unknown>(window.localStorage.getItem(FAVORITES_KEY), []);
  const rawPlaylists = safeJsonParse<unknown>(window.localStorage.getItem(PLAYLISTS_KEY), []);

  const favorites = Array.isArray(rawFavorites)
    ? rawFavorites.filter((id): id is string => typeof id === "string")
    : [];

  const playlists = Array.isArray(rawPlaylists) ? rawPlaylists.filter(isPlaylist) : [];

  return { favorites, playlists };
}

export function persistLibraryState(state: LibraryState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(state.favorites));
  window.localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(state.playlists));
}
