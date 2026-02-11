"use client";

import TrackCard from "../components/TrackCard";
import { recentTracks as seedTracks } from "../data/mockTracks";
import { useEffect, useMemo, useState } from "react";

/* ---------- TYPES ---------- */
type TrackResult = {
  id: string;
  title: string;
  artist: string;
  cover: string;
  isFree: boolean;
};

/* ---------- FALLBACK COVER (никога няма да има празна снимка) ---------- */
const FALLBACK_COVER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cdefs%3E%3CradialGradient id='g' cx='35%25' cy='30%25'%3E%3Cstop offset='0%25' stop-color='%23b7a8ff'/%3E%3Cstop offset='60%25' stop-color='%237c5cff'/%3E%3Cstop offset='100%25' stop-color='%230b0d12'/%3E%3C/radialGradient%3E%3C/defs%3E%3Crect width='240' height='240' fill='url(%23g)'/%3E%3C/svg%3E";

/* ---------- helper: гарантира снимка ---------- */
function withCover(t: any) {
  const cover = t.cover || t.image || t.artwork || FALLBACK_COVER;
  return {
    ...t,
    cover,
    image: cover,
    artwork: cover,
  };
}

export default function Home() {
  const [listening, setListening] = useState(false);
  const [recognizing, setRecognizing] = useState(false);
  const [result, setResult] = useState<TrackResult | null>(null);

  /* ---------- Dynamic History ---------- */
  const [history, setHistory] = useState<TrackResult[]>(
    () =>
      (seedTracks as any[]).map((t, i) =>
        withCover({
          id: String(t.id ?? i),
          title: t.title ?? t.name ?? "Unknown title",
          artist: t.artist ?? t.subtitle ?? "Unknown artist",
          cover: t.cover ?? t.image ?? t.artwork,
          isFree: Boolean(t.isFree),
        })
      ) as TrackResult[]
  );

  const [highlightId, setHighlightId] = useState<string | null>(null);

  /* ---------- Demo recognition ---------- */
  const demoResult: TrackResult = useMemo(
    () => ({
      id: String(Date.now()),
      title: "Blinding Lights",
      artist: "The Weeknd",
      cover:
        "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=600&q=80",
      isFree: false,
    }),
    []
  );

  function handleListen() {
    if (recognizing) return;

    setListening(true);
    setRecognizing(true);
    setResult(null);

    setTimeout(() => {
      setResult(demoResult);

      /* добавя в history */
      setHistory((prev) => [withCover(demoResult), ...prev].slice(0, 8));

      setHighlightId(demoResult.id);
      setRecognizing(false);
      setListening(false);
    }, 1800);
  }

  /* маха highlight ефекта */
  useEffect(() => {
    if (!highlightId) return;
    const t = setTimeout(() => setHighlightId(null), 1800);
    return () => clearTimeout(t);
  }, [highlightId]);

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-12">

        {/* HERO */}
        <section className="text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70 backdrop-blur-xl">
            <span className="h-2 w-2 rounded-full bg-[var(--accent)] shadow-[0_0_16px_rgba(124,92,255,0.9)]" />
            Music recognition • Legal access • History
          </div>

          <h1 className="mt-7 text-5xl font-semibold tracking-tight">
            <span className="text-[var(--accent)] drop-shadow-[0_0_18px_rgba(124,92,255,0.35)]">
              Trackly
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[var(--muted)]">
            Identify songs in seconds and instantly open the official source —
            Spotify, YouTube Music, Apple Music — plus keep a clean history.
          </p>
        </section>

        {/* LISTEN SECTION */}
        <section
          className="relative mt-10 overflow-visible rounded-2xl border px-6 py-14 backdrop-blur-xl"
          style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div className="mx-auto flex max-w-xl flex-col items-center text-center">

            <h2 className="mt-3 text-2xl font-semibold text-white/90">
              One tap. Full result.
            </h2>

            <p className="mt-6 max-w-md text-sm text-[var(--muted)] leading-relaxed">
              Tap Listen to recognize a song and get official access immediately.
            </p>

            {/* LISTEN BUTTON */}
            <div className="relative mt-20 mb-10 flex items-center justify-center">
              <div className="absolute h-[420px] w-[420px] rounded-full listenAura" />
              <div className={`absolute h-[300px] w-[300px] rounded-full listenWave ${listening ? "active" : ""}`} />
              <div className={`absolute h-[220px] w-[220px] rounded-full listenRing ${listening ? "active" : ""}`} />

              <button
                onClick={handleListen}
                className={`relative z-10 flex h-40 w-40 items-center justify-center rounded-full listenButton ${
                  listening ? "listeningActive" : ""
                }`}
              >
                {recognizing ? "SCANNING..." : "LISTEN"}
              </button>
            </div>

            {/* RESULT HERO CARD */}
            {result && (
              <div className="mt-3 w-full max-w-2xl resultCardPro resultEnter">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">

                  <div className="flex items-center gap-4">
                    <img
                      src={result.cover || FALLBACK_COVER}
                      alt="cover"
                      className="h-24 w-24 rounded-2xl border border-white/10 object-cover shadow-[0_0_24px_rgba(124,92,255,0.18)]"
                    />

                    <div className="min-w-0 text-left">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-lg font-semibold text-white/95">
                          {result.title}
                        </p>
                        <span className={`licensePill ${result.isFree ? "free" : "copyright"}`}>
                          {result.isFree ? "FREE" : "COPYRIGHTED"}
                        </span>
                      </div>

                      <p className="truncate text-sm text-white/60">{result.artist}</p>

                      
                    </div>
                  </div>

                  <div className="sm:ml-auto flex flex-col gap-2 sm:w-48">
                    <button className="primaryBtn">
                      {result.isFree ? "Download" : "Open official"}
                    </button>
                    <button className="secondaryBtn">Learn more</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* RECENT HISTORY */}
        <section className="mt-10">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white/90">Recent</h3>
              <p className="mt-1 text-xs text-white/55">
                Your latest recognized tracks
              </p>
            </div>

            <button className="text-xs text-white/60 hover:text-white/90">
              View all
            </button>
          </div>

          <div className="space-y-3">
            {history.map((track) => (
              <div key={track.id} className={highlightId === track.id ? "recentHighlight" : ""}>
                <TrackCard track={withCover(track) as any} />
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}
