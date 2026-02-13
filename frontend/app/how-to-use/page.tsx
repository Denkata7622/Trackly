import Link from "next/link";

export default function HowToUsePage() {
  const steps = [
    {
      n: "01",
      title: "Tap Listen",
      text: "Start recognition in real time. Trackly captures a short audio sample and prepares it for analysis.",
    },
    {
      n: "02",
      title: "Track Identified",
      text: "We match the audio fingerprint and display verified song + artist details with match confidence.",
    },
    {
      n: "03",
      title: "Get Legal Access",
      text: "If it’s available for legal download you’ll see the source. If not, we send you to official platforms.",
    },
    {
      n: "04",
      title: "Save & History",
      text: "The result can be saved to your library, and all recognized tracks appear in your Recent history.",
    },
  ];

  const tips = [
    { title: "Best results", text: "Keep the phone close to the speaker and avoid loud background noise." },
    { title: "Quick retry", text: "If match is low, try again for 3–5 seconds longer." },
    { title: "Legal first", text: "We prioritize official sources to support artists and avoid piracy." },
  ];

  return (
    <main className="min-h-screen px-6 py-14 text-[var(--text)]">
      {/* HERO */}
      <section className="mx-auto max-w-5xl">
        <div className="rounded-3xl border border-white/10 bg-white/5 px-10 py-12 backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">
            How to use Trackly
          </p>

          <h1
            className="mt-4 text-5xl font-semibold tracking-tight"
            style={{
              background: "linear-gradient(90deg,#9b8cff,#6c4dff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            From sound → to official access.
          </h1>

          <p className="mt-5 max-w-2xl text-[var(--muted)] leading-relaxed">
            A simple flow designed for speed. Recognize a song in seconds, then
            choose legal options instantly — without digging through random websites.
          </p>

          {/* mini progress / pills */}
          <div className="mt-8 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/90">
              Listen
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
              Match
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
              Legal access
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
              History
            </span>
          </div>
        </div>
      </section>

      {/* STEPS */}
      <section className="mx-auto mt-14 max-w-6xl">
        <div className="grid gap-6 md:grid-cols-2">
          {steps.map((s) => (
            <div
              key={s.n}
              className="group rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-xl transition hover:bg-white/10"
            >
              <div className="flex items-start justify-between">
                <div className="text-sm font-semibold text-white/80">{s.n}</div>

                <div
                  className="h-10 w-10 rounded-full border border-white/10 bg-white/5 transition group-hover:scale-105"
                  style={{
                    boxShadow: "0 0 0 1px rgba(255,255,255,0.06)",
                  }}
                />
              </div>

              <h3 className="mt-4 text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-[var(--muted)] leading-relaxed">
                {s.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* “WHAT YOU SEE” PANEL (like a clean slide) */}
      <section className="mx-auto mt-16 max-w-6xl">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-10 backdrop-blur-xl">
          <h2 className="text-2xl font-semibold">What you see after recognition</h2>
          <p className="mt-2 text-sm text-[var(--muted)] max-w-3xl">
            Trackly keeps the result screen minimal: the song, the artist, license status
            and official platforms — nothing extra.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs text-[var(--muted)]">Song</p>
              <p className="mt-2 font-semibold">Title + cover</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs text-[var(--muted)]">Artist</p>
              <p className="mt-2 font-semibold">Profile link</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs text-[var(--muted)]">License</p>
              <p className="mt-2 font-semibold">FREE / COPYRIGHTED</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs text-[var(--muted)]">Platforms</p>
              <p className="mt-2 font-semibold">Spotify / Apple / YouTube</p>
            </div>
          </div>
        </div>
      </section>

      {/* TIPS */}
      <section className="mx-auto mt-16 max-w-6xl">
        <h2 className="text-2xl font-semibold">Quick tips</h2>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {tips.map((t) => (
            <div
              key={t.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-xl"
            >
              <h3 className="font-semibold">{t.title}</h3>
              <p className="mt-2 text-sm text-[var(--muted)] leading-relaxed">
                {t.text}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link
            href="/"
            className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm hover:bg-white/10"
          >
            Back to App
          </Link>

          <Link
            href="/founders"
            className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-white/80 hover:bg-white/10"
          >
            View the Founders
          </Link>
        </div>
      </section>
    </main>
  );
}
