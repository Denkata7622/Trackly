import type { Playlist } from "../features/library/types_tmp";
import type { Track } from "../features/tracks/types";

type LibrarySidebarProps = {
  playlists: Playlist[];
  tracks: Track[];
  favoritesSet: Set<string>;
};

export default function LibrarySidebar({ playlists, tracks, favoritesSet }: LibrarySidebarProps) {
  const favoriteTracks = tracks.filter((t) => favoritesSet.has(t.id));

  return (
    <aside className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-5 self-start sticky top-6">

      {/* Favorites */}
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <span>♥</span> Favorites
          {favoriteTracks.length > 0 && (
            <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/70">
              {favoriteTracks.length}
            </span>
          )}
        </h2>
        <div className="mt-2 space-y-1">
          {favoriteTracks.length === 0 && (
            <p className="text-sm text-white/60">No favorites yet. Heart a track to add it.</p>
          )}
          {favoriteTracks.map((track) => (
            <div key={track.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={track.artworkUrl}
                alt={track.title}
                className="h-7 w-7 rounded object-cover flex-shrink-0"
              />
              <div className="min-w-0">
                <p className="truncate text-xs font-medium">{track.title}</p>
                <p className="truncate text-xs text-white/55">{track.artistName}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10" />

      {/* Playlists */}
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <span>🎵</span> Playlists
          {playlists.length > 0 && (
            <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/70">
              {playlists.length}
            </span>
          )}
        </h2>
        <div className="mt-2 space-y-3">
          {playlists.length === 0 && (
            <p className="text-sm text-white/60">No playlists yet. Create one from any track.</p>
          )}
          {playlists.map((playlist) => (
            <div key={playlist.id} className="rounded-lg border border-white/10 bg-black/20 p-3">
              <h3 className="text-sm font-medium flex items-center justify-between">
                {playlist.name}
                <span className="text-xs text-white/45">{playlist.songIds.length} songs</span>
              </h3>
              <ul className="mt-2 space-y-1 text-xs text-white/75">
                {playlist.songIds.length === 0 && (
                  <li className="text-white/40 italic">No songs yet.</li>
                )}
                {playlist.songIds.map((songId) => {
                  const song = tracks.find((track) => track.id === songId);
                  return (
                    <li key={songId} className="truncate">
                      {song ? `${song.title} — ${song.artistName}` : "Unknown song"}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}