"use client";

import { useMemo, useState } from "react";
import { useLanguage } from "../../lib/LanguageContext";
import { t } from "../../lib/translations";
import type { Playlist } from "../../features/library/types";

type HistoryItem = {
  id: string;
  song?: { songName?: string; artist?: string };
};

function parseStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    return JSON.parse(window.localStorage.getItem(key) ?? JSON.stringify(fallback)) as T;
  } catch {
    return fallback;
  }
}

export default function LibraryPage() {
  const { language } = useLanguage();
  const [favorites] = useState<string[]>(() => parseStorage<string[]>("ponotai.library.favorites", []));
  const [playlists] = useState<Playlist[]>(() => parseStorage<Playlist[]>("ponotai.library.playlists", []));
  const [history] = useState<HistoryItem[]>(() => parseStorage<HistoryItem[]>("ponotai-history", []));

  const recentSongs = useMemo(() => history.slice(0, 8), [history]);

  return (
    <section className="space-y-6">
      <div className="card p-6">
        <h1 className="cardTitle text-2xl font-bold">{t("nav_library", language)}</h1>
        <p className="cardText mt-2">
          {language === "bg" ? "Управлявай любимите си песни и плейлистите си на едно място." : "Manage your favorites and playlists in one place."}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card p-5">
          <p className="cardText text-sm">{t("library_favorites", language)}</p>
          <p className="cardTitle mt-2 text-3xl font-semibold">{favorites.length}</p>
        </div>
        <div className="card p-5">
          <p className="cardText text-sm">{t("library_playlists", language)}</p>
          <p className="cardTitle mt-2 text-3xl font-semibold">{playlists.length}</p>
        </div>
        <div className="card p-5">
          <p className="cardText text-sm">{t("history_title", language)}</p>
          <p className="cardTitle mt-2 text-3xl font-semibold">{history.length}</p>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="cardTitle text-xl font-semibold">{t("library_playlists", language)}</h2>
        <div className="mt-3 space-y-2">
          {playlists.length === 0 && <p className="cardText">{t("no_playlists_created", language)}</p>}
          {playlists.map((playlist) => (
            <div key={playlist.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
              <p className="font-medium">{playlist.name}</p>
              <p className="cardText text-sm">{t("library_songs_count", language, { count: playlist.songIds.length })}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="cardTitle text-xl font-semibold">{t("history_recent", language)}</h2>
        <div className="mt-3 space-y-2">
          {recentSongs.length === 0 && <p className="cardText">{t("history_empty", language)}</p>}
          {recentSongs.map((item) => (
            <p key={item.id} className="cardText">• {item.song?.songName ?? t("unknown_song", language)} — {item.song?.artist ?? "-"}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
