"use client";

import type { SongMatch } from "../features/recognition/api";
import { t, type Language } from "../lib/translations";

type ResultCardProps = {
  language: Language;
  song: SongMatch | null;
  onSave: (song: SongMatch) => void;
  onPlay: (song: SongMatch) => void;
};

export default function ResultCard({ language, song, onSave, onPlay }: ResultCardProps) {
  if (!song) {
    return (
      <section className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
        <p className="text-2xl font-semibold">{t("empty_results_title", language)}</p>
        <p className="mt-3 text-white/65">{t("empty_results_hint", language)}</p>
      </section>
    );
  }

  return (
    <section className="resultCardAnimated rounded-3xl border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.10),rgba(255,255,255,0.02))] p-6 shadow-2xl">
      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        <img src={song.albumArtUrl} alt={t("album_cover", language)} className="h-[220px] w-[220px] rounded-2xl object-cover shadow-xl" />

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/60">{t("recognition_result", language)}</p>
          <h2 className="mt-3 text-3xl font-bold leading-tight">{song.songName}</h2>
          <p className="mt-2 text-xl text-white/75">{song.artist}</p>
          <p className="mt-3 text-sm text-white/70">{song.album} • {song.genre} • {song.releaseYear ?? "—"}</p>

          {song.confidence >= 0.8 && (
            <div className="mt-5">
              <p className="mb-1 text-xs uppercase tracking-[0.2em] text-white/60">{t("confidence", language)}</p>
              <div className="h-2 w-full rounded-full bg-white/10">
                <div className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400" style={{ width: `${Math.round(song.confidence * 100)}%` }} />
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <button className="pillAction" onClick={() => onPlay(song)}>▶ {t("btn_play", language)}</button>
            <button className="pillAction" onClick={() => onSave(song)}>💾 {t("btn_save", language)}</button>
            {song.platformLinks.spotify && <a className="pillAction bg-[#1db954]/20" href={song.platformLinks.spotify} target="_blank" rel="noreferrer">🟢 {t("btn_spotify", language)}</a>}
            {song.platformLinks.appleMusic && <a className="pillAction bg-rose-500/20" href={song.platformLinks.appleMusic} target="_blank" rel="noreferrer">🍎 {t("btn_apple_music", language)}</a>}
            {song.platformLinks.youtubeMusic && <a className="pillAction bg-red-500/20" href={song.platformLinks.youtubeMusic} target="_blank" rel="noreferrer">▶ {t("btn_youtube_music", language)}</a>}
          </div>
        </div>
      </div>
    </section>
  );
}
