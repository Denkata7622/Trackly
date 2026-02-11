export default function TheFuturePage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16 text-[var(--text)]">
      {/* HERO */}
      <section className="text-center mb-16">
        

        <h1 className="mt-6 text-5xl font-semibold tracking-tight">
          Where{" "}
          <span className="text-[var(--accent)] drop-shadow-[0_0_18px_rgba(124,92,255,0.35)]">
            Trackly
          </span>{" "}
          goes next
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-lg text-white/65 leading-relaxed">
          Our goal is to evolve Trackly from “recognize a song” into a complete, legal-first
          music access + discovery experience.
        </p>
      </section>

      {/* BIG PROMISE */}
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-10 backdrop-blur-xl mb-14">
        <div className="absolute -top-28 left-12 h-72 w-72 rounded-full bg-[var(--accent)]/20 blur-3xl" />
        <div className="absolute -bottom-28 right-12 h-72 w-72 rounded-full bg-[var(--accent)]/15 blur-3xl" />

        <h2 className="relative text-2xl font-semibold mb-3 text-white">
          One tap → real value
        </h2>
        <p className="relative text-white/75 leading-relaxed">
          In future versions, Trackly will not only identify music, but will also help users
          build their library, explore official artist pages, and discover new tracks — without
          falling into unofficial sources.
        </p>

        <div className="relative mt-6 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-black/20 p-5">
            <div className="text-xs text-white/55">Focus</div>
            <div className="mt-2 text-sm text-white/90">Fast, clean UX</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-5">
            <div className="text-xs text-white/55">Principle</div>
            <div className="mt-2 text-sm text-white/90">Legal-first access</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-5">
            <div className="text-xs text-white/55">Direction</div>
            <div className="mt-2 text-sm text-white/90">Discovery & library</div>
          </div>
        </div>
      </section>

      {/* ROADMAP */}
      <section className="mb-14">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white/95">Roadmap</h2>
          <span className="text-xs text-white/50">Next steps after the demo</span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-xl">
            <div className="text-xs text-white/55">Phase 1</div>
            <h3 className="mt-2 text-lg font-semibold text-white">Real recognition + backend</h3>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              <li>• /recognize endpoint (audio → track result)</li>
              <li>• Store recent history (per device / per user)</li>
              <li>• Official platform links (Spotify/Apple/YouTube)</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-xl">
            <div className="text-xs text-white/55">Phase 2</div>
            <h3 className="mt-2 text-lg font-semibold text-white">Library & profiles</h3>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              <li>• Save to library (favorites + playlists)</li>
              <li>• User accounts (optional, simple)</li>
              <li>• Sync across devices</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-xl">
            <div className="text-xs text-white/55">Phase 3</div>
            <h3 className="mt-2 text-lg font-semibold text-white">Discovery mode</h3>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              <li>• Similar tracks / artist-based recommendations</li>
              <li>• Explore official artist pages</li>
              <li>• Smart filters (genre, vibe, popularity)</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-xl">
            <div className="text-xs text-white/55">Phase 4</div>
            <h3 className="mt-2 text-lg font-semibold text-white">Premium polish</h3>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              <li>• Shareable “result cards” (beautiful summary)</li>
              <li>• Analytics (listening habits & trends)</li>
              <li>• Performance optimizations + caching</li>
            </ul>
          </div>
        </div>
      </section>

      {/* FINAL IMPRESSION */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-10 backdrop-blur-xl text-center">
        <h2 className="text-2xl font-semibold text-white mb-3">
          Final message to the jury
        </h2>
        <p className="mx-auto max-w-2xl text-white/70 leading-relaxed">
          Trackly is not just a recognizer. It’s a bridge between identification and legal access —
          designed with premium UX and built to scale into a real product.
        </p>

        <div className="mt-7 inline-flex items-center gap-3 rounded-full border border-white/10 bg-black/20 px-5 py-3 text-sm text-white/80">
          <span className="h-2 w-2 rounded-full bg-[var(--accent)] shadow-[0_0_18px_rgba(124,92,255,0.9)]" />
          Next: backend integration + real recognition demo
        </div>
      </section>
    </main>
  );
}
