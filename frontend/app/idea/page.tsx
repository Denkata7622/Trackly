export default function IdeaPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16 text-white">
     {/* HERO */}
<section className="text-center mb-16">

  {/* small label */}
  

  <h1 className="mt-6 text-5xl font-semibold tracking-tight leading-tight">
    The team behind{" "}
    <span className="text-[var(--accent)] drop-shadow-[0_0_18px_rgba(124,92,255,0.35)]">
      Trackly
    </span>
  </h1>

  <p className="mx-auto mt-5 max-w-2xl text-lg text-white/65 leading-relaxed">
    A student developer duo building a modern music-recognition experience —
    focused on legal access, clean UX, and a demo-ready presentation for juries.
  </p>

</section>


      {/* QUICK SUMMARY */}
      <section className="mb-14 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <div className="text-xs text-white/55">Problem</div>
          <h3 className="mt-2 text-lg font-semibold">Recognition without a “next step”</h3>
          <p className="mt-3 text-sm leading-relaxed text-white/70">
            After recognizing a song, users still need to manually search where to
            listen to it (Spotify/YouTube/Apple) and may end up on unofficial sources.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <div className="text-xs text-white/55">Solution</div>
          <h3 className="mt-2 text-lg font-semibold">One result → legal access</h3>
          <p className="mt-3 text-sm leading-relaxed text-white/70">
            Trackly provides clear actions: “Open in Spotify/YouTube/Apple”, “Artist page”,
            “Save in history” — all in one place.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <div className="text-xs text-white/55">Implementation</div>
          <h3 className="mt-2 text-lg font-semibold">UI + API integrations</h3>
          <p className="mt-3 text-sm leading-relaxed text-white/70">
            A modern frontend (Next.js) with a backend API for recognition,
            metadata, platform links and history.
          </p>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="relative mb-14 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        <div className="absolute -top-24 left-10 h-64 w-64 rounded-full bg-[var(--accent)]/20 blur-3xl" />

        <h2 className="relative mb-3 text-2xl font-semibold">The Problem</h2>

        <p className="relative leading-relaxed text-white/75">
          In everyday life we often hear a song (in a video, store, car, or public place)
          and want to find it quickly. Recognition is only the first step. The real difficulty
          comes after that:
          <span className="text-white/90"> where to listen to it legally</span>,
          how to reach the <span className="text-white/90">official artist</span>,
          and how to save it for later.
        </p>

        <div className="relative mt-6 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="text-xs text-white/55">Pain</div>
            <div className="mt-2 text-sm text-white/90">Searching in multiple places</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="text-xs text-white/55">Risk</div>
            <div className="mt-2 text-sm text-white/90">Unofficial links/websites</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="text-xs text-white/55">Missing</div>
            <div className="mt-2 text-sm text-white/90">Artist and album context</div>
          </div>
        </div>
      </section>

      {/* SOLUTION */}
      <section className="mb-14 rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        <h2 className="mb-3 text-2xl font-semibold">The Solution</h2>

        <p className="leading-relaxed text-white/75">
          Trackly completes the recognition process — after the result it immediately
          provides <span className="text-white/90">clear buttons to official platforms</span>,
          an artist page and a history of recognized tracks.
          The user performs one action → receives a full result → gets legal access.
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-black/20 p-5">
            <h3 className="text-sm font-semibold">What the user sees</h3>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              <li>• Title + artist + cover</li>
              <li>• Buttons: Spotify / YouTube Music / Apple Music</li>
              <li>• Artist page (more information)</li>
              <li>• History of recently recognized tracks</li>
              <li>• Clear UX behavior (one main function)</li>
            </ul>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-5">
            <h3 className="text-sm font-semibold">Project value</h3>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              <li>• Speed: minimal searching</li>
              <li>• Security: official links</li>
              <li>• Artist support</li>
              <li>• Suitable for jury demonstration</li>
              <li>• Expandable (Library, profiles)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* IMPLEMENTATION */}
      <section className="mb-14 rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        <h2 className="mb-3 text-2xl font-semibold">Implementation</h2>

        <p className="leading-relaxed text-white/75">
          The architecture is divided into two parts: frontend and backend.
          The frontend displays the interface (Listen, history, presentation pages),
          while the backend returns recognition results, metadata and official links.
        </p>

        <div className="mt-6 grid gap-3 text-sm text-white/80 md:grid-cols-5">
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            Interface<br /><span className="text-white/60">Listen</span>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            API<br /><span className="text-white/60">Backend</span>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            Recognition<br /><span className="text-white/60">Provider</span>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            Metadata<br /><span className="text-white/60">Track/Artist</span>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            Links + History<br /><span className="text-white/60">Official</span>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-black/20 p-5">
            <h3 className="text-sm font-semibold">Frontend (Next.js)</h3>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              <li>• Premium UI (dark + accent)</li>
              <li>• Listen button (main function)</li>
              <li>• Recent history</li>
              <li>• Presentation pages for the jury</li>
            </ul>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-5">
            <h3 className="text-sm font-semibold">Backend (planned)</h3>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              <li>• Recognition endpoint</li>
              <li>• History endpoint</li>
              <li>• Platform integration (IDs/links)</li>
              <li>• Caching and performance optimization</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CHALLENGES */}
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        <div className="absolute -bottom-24 right-10 h-64 w-64 rounded-full bg-[var(--accent)]/18 blur-3xl" />

        <h2 className="relative mb-3 text-2xl font-semibold">Development Challenges</h2>

        <p className="relative leading-relaxed text-white/75">
          During development we encountered real technical problems that were solved
          through iteration and proper project structure:
        </p>

        <ul className="relative mt-5 space-y-3 text-sm text-white/70">
          <li>
            • <span className="text-white/90">Routing structure:</span> organizing
            pages to function both as an application and a presentation.
          </li>
          <li>
            • <span className="text-white/90">CSS design system:</span> using color
            variables (palette) to control the visual style easily.
          </li>
          <li>
            • <span className="text-white/90">UI details:</span> balancing a premium
            look with readability (contrast, spacing, sizes).
          </li>
          <li>
            • <span className="text-white/90">TypeScript types:</span> synchronizing
            data and components (e.g. FREE / COPYRIGHTED status).
          </li>
          <li>
            • <span className="text-white/90">Teamwork (GitHub):</span> repository
            structure, commits and task distribution.
          </li>
        </ul>
      </section>
    </main>
  );
}
