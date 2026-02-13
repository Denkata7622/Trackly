import Link from "next/link";
import { useState } from "react";
import type { Playlist } from "../features/library/types";
import type { Track } from "../features/tracks/types";

type TrackCardProps = {
  track: Track;
  playlists: Playlist[];
  isFavorite: boolean;
  onToggleFavorite: (trackId: string) => void;
  onAddToPlaylist: (trackId: string, playlistId: string) => void;
  onCreatePlaylist: (playlistName: string) => void;
  onDeletePlaylist: (playlistId: string) => void;
};

export default function TrackCard({
  track,
  playlists,
  isFavorite,
  onToggleFavorite,
  onAddToPlaylist,
  onCreatePlaylist,
  onDeletePlaylist,
}: TrackCardProps) {
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>("");
  const [newPlaylistName, setNewPlaylistName] = useState("");

  const badge =
    track.license === "FREE"
      ? "bg-emerald-500/15 text-emerald-300"
      : "bg-white/10 text-white/60";

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/10">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 overflow-hidden rounded-lg bg-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={track.artworkUrl} alt={`${track.title} cover`} className="h-full w-full object-cover" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium">{track.title}</div>
          <div className="truncate text-xs text-white/60">{track.artistName}</div>
        </div>

        <button
          type="button"
          onClick={() => onToggleFavorite(track.id)}
          className="text-xl leading-none"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          title={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          {isFavorite ? "♥" : "♡"}
        </button>

        <span className={`rounded-full px-3 py-1 text-xs ${badge}`}>
          {track.license === "FREE" ? "Free" : "Copyrighted"}
        </span>

        <Link href={`/track/${track.id}`} className="text-xs text-white/70 hover:text-white">
          Open
        </Link>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <select
          className="rounded border border-white/15 bg-black/20 px-2 py-1"
          value={selectedPlaylistId}
          onChange={(event) => setSelectedPlaylistId(event.target.value)}
        >
          <option value="">Select playlist</option>
          {playlists.map((playlist) => (
            <option key={playlist.id} value={playlist.id}>
              {playlist.name}
            </option>
          ))}
        </select>

        <button
          type="button"
          className="rounded border border-white/20 px-2 py-1 hover:bg-white/10"
          disabled={!selectedPlaylistId}
          onClick={() => {
            if (!selectedPlaylistId) return;
            onAddToPlaylist(track.id, selectedPlaylistId);
          }}
        >
          Add to playlist
        </button>

        <input
          className="rounded border border-white/15 bg-black/20 px-2 py-1"
          placeholder="New playlist"
          value={newPlaylistName}
          onChange={(event) => setNewPlaylistName(event.target.value)}
        />

        <button
          type="button"
          className="rounded border border-white/20 px-2 py-1 hover:bg-white/10"
          onClick={() => {
            if (!newPlaylistName.trim()) return;
            onCreatePlaylist(newPlaylistName);
            setNewPlaylistName("");
          }}
        >
          Create
        </button>

        <button
          type="button"
          className="rounded border border-red-400/40 px-2 py-1 text-red-200 hover:bg-red-500/10"
          disabled={!selectedPlaylistId}
          onClick={() => {
            if (!selectedPlaylistId) return;
            onDeletePlaylist(selectedPlaylistId);
            setSelectedPlaylistId("");
          }}
        >
          Delete playlist
        </button>
      </div>
    </div>
  );
}
