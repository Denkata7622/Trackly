"use client";

import { useMemo } from "react";
import { usePlayer } from "./PlayerProvider";

function formatTime(seconds: number) {
  const safe = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  const minutes = Math.floor(safe / 60)
    .toString()
    .padStart(2, "0");
  const secs = (safe % 60).toString().padStart(2, "0");
  return `${minutes}:${secs}`;
}

export default function BottomPlayBar() {
  const { currentTrack, isPlaying, currentTime, duration, volume, togglePlayPause, skipNext, skipPrevious, seekToPercent, setVolume } =
    usePlayer();

  const progress = useMemo(() => {
    if (!duration) return 0;
    return Math.min(100, (currentTime / duration) * 100);
  }, [currentTime, duration]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#0b0d12]/95 px-3 py-3 backdrop-blur-xl sm:px-5">
      <div className="mx-auto flex max-w-7xl flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{currentTrack?.title ?? "No song selected"}</p>
            <div className="flex items-center gap-2 text-xs text-white/65">
              <span className="truncate">{currentTrack?.artist ?? "Pick a track to start playback"}</span>
              <span aria-hidden>•</span>
              <span className="inline-flex items-center gap-1 rounded-full border border-red-400/40 bg-red-500/10 px-2 py-0.5 text-[11px] text-red-200">
                ▶ YouTube
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={skipPrevious} className="h-10 w-10 rounded-full border border-white/15 text-sm text-white/90" aria-label="Previous track">
              ⏮
            </button>
            <button
              onClick={togglePlayPause}
              className="h-11 w-11 rounded-full bg-white text-lg text-black"
              aria-label={isPlaying ? "Pause playback" : "Start playback"}
            >
              {isPlaying ? "⏸" : "▶"}
            </button>
            <button onClick={skipNext} className="h-10 w-10 rounded-full border border-white/15 text-sm text-white/90" aria-label="Next track">
              ⏭
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 items-center gap-2 text-xs text-white/70 sm:grid-cols-[52px_1fr_52px_120px] sm:gap-3">
          <span>{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={100}
            step={0.1}
            value={progress}
            onChange={(event) => seekToPercent(Number(event.target.value))}
            className="w-full accent-violet-400"
            aria-label="Track progress"
          />
          <span className="text-right sm:text-left">{formatTime(duration)}</span>
          <div className="flex items-center gap-2">
            <span>🔊</span>
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={(event) => setVolume(Number(event.target.value))}
              className="w-full accent-cyan-400"
              aria-label="Volume"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
