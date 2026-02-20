import Link from "next/link";
import { useState } from "react";
import type { Playlist } from "../features/library/types";
import type { Track } from "../features/tracks/types";
import { useLanguage } from "../lib/LanguageContext";
import { t } from "../lib/translations";

type TrackCardProps = {
  track: Track;
  playlists: Playlist[];
  isFavorite: boolean;
  onToggleFavorite: (trackId: string) => void;
  onAddToPlaylist: (trackId: string, playlistId: string) => void;
  onCreatePlaylist: (playlistName: string) => void;
  onDeletePlaylist: (playlistId: string) => void;
  onPlayTrack?: (track: Track) => void;
  onPlay?: (track: Track) => void;
};

export default function TrackCard({
  track,
  playlists,
  isFavorite,
  onToggleFavorite,
  onAddToPlaylist,
  onCreatePlaylist,
  onDeletePlaylist,
  onPlayTrack,
  onPlay,
}: TrackCardProps) {
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>("");
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const { language } = useLanguage();

  const badge =
    track.license === "FREE"
      ? "bg-emerald-500/15 text-emerald-300 border-emerald-300/20"
      : "bg-white/10 text-white/60 border-white/15";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 transition-all hover:-translate-y-0.5 hover:border-violet-300/30 hover:bg-white/10">
      <div className="flex flex-wrap items-center gap-3">
        <div className="h-12 w-12 overflow-hidden rounded-lg border border-white/10 bg-white/10">
          <img src={track.artworkUrl} alt={`${track.title} cover`} className="h-full w-full object-cover" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-white">{track.title}</div>
          <div className="truncate text-xs text-white/60">{track.artistName}</div>
        </div>

        <button
          type="button"
          onClick={() => (onPlayTrack ?? onPlay)?.(track)}
          className="rounded-lg border border-cyan-300/40 bg-cyan-500/10 px-2.5 py-1.5 text-xs font-medium text-cyan-100 hover:bg-cyan-500/20"
        >
          ▶ {t("btn_play", language)}
        </button>

        <button
          type="button"
          onClick={() => onToggleFavorite(track.id)}
          className="rounded-lg border border-white/10 bg-black/20 px-2 py-1 text-lg leading-none"
          aria-label={isFavorite ? t("track_remove_from_favorites", language) : t("track_add_to_favorites", language)}
          title={isFavorite ? t("track_remove_from_favorites", language) : t("track_add_to_favorites", language)}
        >
          {isFavorite ? "♥" : "♡"}
        </button>

        <span className={`rounded-full border px-3 py-1 text-xs ${badge}`}>
          {track.license === "FREE" ? t("license_free", language) : t("license_copyrighted", language)}
        </span>

        <Link href={`/track/${track.id}`} className="text-xs text-violet-200 hover:text-violet-100">
          {t("btn_open", language)}
        </Link>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <select
          className="rounded-lg border border-white/15 bg-black/20 px-2 py-1.5"
          value={selectedPlaylistId}
          onChange={(event) => setSelectedPlaylistId(event.target.value)}
        >
          <option value="">{t("track_select_playlist", language)}</option>
          {playlists.map((playlist) => (
            <option key={playlist.id} value={playlist.id}>
              {playlist.name}
            </option>
          ))}
        </select>

        <button
          type="button"
          className="rounded-lg border border-white/20 px-2 py-1.5 hover:bg-white/10 disabled:opacity-50"
          disabled={!selectedPlaylistId}
          onClick={() => {
            if (!selectedPlaylistId) return;
            onAddToPlaylist(track.id, selectedPlaylistId);
          }}
        >
          {t("track_add_to_playlist", language)}
        </button>

        <input
          className="rounded-lg border border-white/15 bg-black/20 px-2 py-1.5"
          placeholder={t("track_new_playlist_placeholder", language)}
          value={newPlaylistName}
          onChange={(event) => setNewPlaylistName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && newPlaylistName.trim()) {
              onCreatePlaylist(newPlaylistName);
              setNewPlaylistName("");
            }
          }}
        />

        <button
          type="button"
          className="rounded-lg border border-white/20 px-2 py-1.5 hover:bg-white/10"
          onClick={() => {
            if (!newPlaylistName.trim()) return;
            onCreatePlaylist(newPlaylistName);
            setNewPlaylistName("");
          }}
        >
          {t("track_create", language)}
        </button>

        <button
          type="button"
          className="rounded-lg border border-red-400/40 px-2 py-1.5 text-red-200 hover:bg-red-500/10 disabled:opacity-50"
          disabled={!selectedPlaylistId}
          onClick={() => {
            if (!selectedPlaylistId) return;
            onDeletePlaylist(selectedPlaylistId);
            setSelectedPlaylistId("");
          }}
        >
          {t("track_delete_playlist", language)}
        </button>
      </div>
    </div>
  );
}
