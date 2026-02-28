"use client";

import type { SongMatch } from "../features/recognition/api";
import { t, type Language } from "../lib/translations";

type HistoryEntry = {
  id: string;
  createdAt: string;
  song: SongMatch;
};

type HistoryGridProps = {
  language: Language;
  items: HistoryEntry[];
  onDelete: (id: string) => void;
  onPlay?: (song: SongMatch) => void;
};

export default function HistoryGrid({ language, items, onDelete, onPlay }: HistoryGridProps) {
  return (
    <section className="rounded-3xl border border-border bg-surface p-6">
      <h2 className="text-2xl font-semibold">{t("history_recent", language)}</h2>
      {items.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-border bg-surface-overlay p-8 text-center">
          <p className="text-lg">{t("history_empty", language)}</p>
          <p className="mt-2 text-sm text-text-muted">{t("history_empty_hint", language)}</p>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((entry) => (
            <article key={entry.id} className="group relative overflow-hidden rounded-2xl border border-border bg-surface-overlay transition hover:-translate-y-1 hover:shadow-xl">
              <img src={entry.song.albumArtUrl} alt={t("album_cover", language)} className="h-40 w-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition group-hover:opacity-100">
                {onPlay && (
                  <button
                    onClick={() => onPlay(entry.song)}
                    className="rounded-full bg-[var(--accent)] p-3 text-white transition hover:opacity-90"
                    title={t("btn_play", language)}
                  >
                    ▶
                  </button>
                )}
                <button
                  onClick={() => onDelete(entry.id)}
                  className="rounded-full bg-red-500/75 px-3 py-2 text-xs text-white transition hover:bg-red-600"
                  title={t("history_delete", language)}
                >
                  ✕
                </button>
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-semibold">{entry.song.songName}</p>
                <p className="truncate text-xs text-text-muted">{entry.song.artist}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
