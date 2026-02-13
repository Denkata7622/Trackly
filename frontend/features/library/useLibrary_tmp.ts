import { useEffect, useMemo, useState } from "react";
import { syncLibraryState } from "./api";
import { loadLibraryState, persistLibraryState } from "./storage";
import type { LibraryState, Playlist } from "./types_tmp";

function createPlaylistId(): string {
  return `pl-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

export function useLibrary() {
  const [libraryState, setLibraryState] = useState<LibraryState>(() => loadLibraryState());

  useEffect(() => {
    persistLibraryState(libraryState);
    void syncLibraryState(libraryState);
  }, [libraryState]);

  const favoritesSet = useMemo(() => new Set(libraryState.favorites), [libraryState.favorites]);

  function toggleFavorite(songId: string): void {
    setLibraryState((prev) => {
      const exists = prev.favorites.includes(songId);
      return {
        ...prev,
        favorites: exists
          ? prev.favorites.filter((id) => id !== songId)
          : [...prev.favorites, songId],
      };
    });
  }

  function createPlaylist(name: string): Playlist | null {
    const trimmed = name.trim();
    if (!trimmed) return null;

    const playlist: Playlist = {
      id: createPlaylistId(),
      name: trimmed,
      songIds: [],
    };

    setLibraryState((prev) => ({
      ...prev,
      playlists: [...prev.playlists, playlist],
    }));

    return playlist;
  }

  function deletePlaylist(playlistId: string): void {
    setLibraryState((prev) => ({
      ...prev,
      playlists: prev.playlists.filter((p) => p.id !== playlistId),
    }));
  }

  function addSongToPlaylist(songId: string, playlistId: string): void {
    setLibraryState((prev) => ({
      ...prev,
      playlists: prev.playlists.map((p) => {
        if (p.id !== playlistId || p.songIds.includes(songId)) return p;
        return { ...p, songIds: [...p.songIds, songId] };
      }),
    }));
  }

  return {
    playlists: libraryState.playlists,
    favoritesSet,
    toggleFavorite,
    createPlaylist,
    deletePlaylist,
    addSongToPlaylist,
  };
}