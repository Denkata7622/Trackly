"use client";

import { useState } from "react";
import type { SongMatch } from "../features/recognition/api";
import { t, type Language } from "../lib/translations";
import { Card } from "../src/components/ui/Card";
import { Button } from "../src/components/ui/Button";
import { Badge } from "../src/components/ui/Badge";

type ResultCardProps = {
  language: Language;
  song: SongMatch | null;
  onSave: (song: SongMatch) => void;
  onPlay: (song: SongMatch) => void;
  onFavorite?: (song: SongMatch) => void;
};

export default function ResultCard({ language, song, onSave, onPlay, onFavorite }: ResultCardProps) {
  const { isAuthenticated, shareSong } = useUser();
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareHint, setShareHint] = useState<string | null>(null);

  if (!song) {
    return (
      <Card className="rounded-3xl p-8 text-center">
        <p className="text-2xl font-semibold">{t("empty_results_title", language)}</p>
        <p className="mt-3 text-text-muted">{t("empty_results_hint", language)}</p>
      </Card>
    );
  }

  async function handleShare() {
    if (!song) return;
    if (!isAuthenticated) {
      setShareHint("Sign in to share");
      return;
    }

    const url = await shareSong({
      title: song.songName,
      artist: song.artist,
      album: song.album,
      coverUrl: song.albumArtUrl,
    });

    if (url) {
      setShareUrl(url);
      setShareHint(null);
    }
  }

  return (
    <Card className="resultCardAnimated rounded-3xl p-6">
      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        <img src={song.albumArtUrl} alt={t("album_cover", language)} className="h-[220px] w-[220px] rounded-2xl object-cover shadow-xl" />

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-text-muted">{t("recognition_result", language)}</p>
          <h2 className="mt-3 text-3xl font-bold leading-tight">{song.songName}</h2>
          <p className="mt-2 text-xl text-text-muted">{song.artist}</p>
          <p className="mt-3 text-sm text-text-muted">{song.album} • {song.genre} • {song.releaseYear ?? "—"}</p>

          {song.confidence >= 0.8 && (
            <div className="mt-5 flex items-center gap-2">
              <Badge variant="success">{t("confidence", language)}</Badge>
              <div className="h-2 w-full rounded-full bg-surface-raised">
                <div className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400" style={{ width: `${Math.round(song.confidence * 100)}%` }} />
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <button className="pillAction" onClick={() => onPlay(song)}>▶ {t("btn_play", language)}</button>
            <button className="pillAction" onClick={() => onSave(song)}>💾 {t("btn_save", language)}</button>
            <button className="glassBtn" onClick={() => void handleShare()}>🔗 Share</button>
            {song.platformLinks.spotify && <a className="pillAction bg-[#1db954]/20" href={song.platformLinks.spotify} target="_blank" rel="noreferrer">🟢 {t("btn_spotify", language)}</a>}
            {song.platformLinks.appleMusic && <a className="pillAction bg-rose-500/20" href={song.platformLinks.appleMusic} target="_blank" rel="noreferrer">🍎 {t("btn_apple_music", language)}</a>}
            {song.platformLinks.youtubeMusic && <a className="pillAction bg-red-500/20" href={song.platformLinks.youtubeMusic} target="_blank" rel="noreferrer">▶ {t("btn_youtube_music", language)}</a>}
            {onFavorite && <Button variant="ghost" size="sm" onClick={() => onFavorite(song)}>❤️ Favorite</Button>}
          </div>

          {(shareHint || shareUrl) && (
            <div className="mt-3 rounded-xl border border-white/15 bg-black/25 p-3 text-sm">
              {shareHint && <p>{shareHint}</p>}
              {shareUrl && (
                <div className="flex items-center gap-2">
                  <a className="underline" href={shareUrl} target="_blank" rel="noreferrer">{shareUrl}</a>
                  <button className="glassBtn !px-2 !py-1" onClick={() => void navigator.clipboard.writeText(shareUrl)}>Copy link</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
