import { scopedKey } from "../../lib/ProfileContext";
import type { LibraryState, Playlist } from "./types";

const FAVORITES_KEY = "ponotai.library.favorites";
const PLAYLISTS_KEY = "ponotai.library.playlists";

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

export function loadLibraryState(profileId: string): LibraryState {
  if (typeof window === "undefined") return initialState;

  const rawFavorites = safeJsonParse<unknown>(window.localStorage.getItem(scopedKey(FAVORITES_KEY, profileId)), []);
  const rawPlaylists = safeJsonParse<unknown>(window.localStorage.getItem(scopedKey(PLAYLISTS_KEY, profileId)), []);

  const favorites = Array.isArray(rawFavorites)
    ? rawFavorites.filter((id): id is string => typeof id === "string")
    : [];

  const playlists = Array.isArray(rawPlaylists) ? rawPlaylists.filter(isPlaylist) : [];

  return { favorites, playlists };
}

export function persistLibraryState(state: LibraryState, profileId: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(scopedKey(FAVORITES_KEY, profileId), JSON.stringify(state.favorites));
  window.localStorage.setItem(scopedKey(PLAYLISTS_KEY, profileId), JSON.stringify(state.playlists));
}
