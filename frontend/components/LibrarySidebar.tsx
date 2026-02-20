import type { Playlist } from "../features/library/types";
import type { Track } from "../features/tracks/types";
import { useLanguage } from "../lib/LanguageContext";
import { t } from "../lib/translations";

type LibrarySidebarProps = {
  playlists: Playlist[];
  tracks: Track[];
  favoritesSet?: Set<string>;
};

export default function LibrarySidebar({ playlists, tracks }: LibrarySidebarProps) {
  const { language } = useLanguage();

  return (
    <aside className="rounded-xl border border-white/10 bg-white/5 p-4">
      <h2 className="text-lg font-semibold">{t("library_playlists", language)}</h2>
      <div className="mt-3 space-y-3">
        {playlists.length === 0 && <p className="text-sm text-white/60">{t("no_playlists_created", language)}</p>}
        {playlists.map((playlist) => (
          <div key={playlist.id} className="rounded-lg border border-white/10 bg-black/20 p-3">
            <h3 className="text-sm font-medium">{playlist.name}</h3>
            <ul className="mt-2 space-y-1 text-xs text-white/75">
              {playlist.songIds.length === 0 && <li>{t("no_songs_yet", language)}</li>}
              {playlist.songIds.map((songId) => {
                const song = tracks.find((track) => track.id === songId);
                return <li key={songId}>{song ? `${song.title} — ${song.artistName}` : t("unknown_song", language)}</li>;
              })}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
}
