export default function FoundersPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16 text-white">
      {/* HERO */}
<section className="text-center mb-16">

  {/* small label */}
  

  <h1 className="mt-6 text-5xl font-semibold tracking-tight leading-tight">
    Founders{" "}
    <span className="text-[var(--accent)] drop-shadow-[0_0_18px_rgba(124,92,255,0.35)]">
      Trackly
    </span>
  </h1>

  <p className="mx-auto mt-5 max-w-2xl text-lg text-white/65 leading-relaxed">
    A student developer duo building a modern music-recognition experience —
    focused on legal access, clean UX, and a demo-ready presentation for juries.
  </p>

</section>


      {/* ABOUT BOTH */}
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl mb-14">
        <div className="absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-[var(--accent)]/20 blur-3xl" />
        <h2 className="relative text-2xl font-semibold mb-3">Who we are</h2>

        <p className="relative text-white/75 leading-relaxed">
          We are a competitive STEM and programming team working on projects that
          combine design, software engineering, and AI. Trackly is built to solve
          a real problem: identifying music instantly and guiding users to official,
          legal sources — supporting artists and respecting copyrights.
        </p>

        <div className="relative mt-6 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="text-xs text-white/55">Focus</div>
            <div className="mt-2 text-sm text-white/90">Real-world product design</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="text-xs text-white/55">Strength</div>
            <div className="mt-2 text-sm text-white/90">Fast iteration & teamwork</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="text-xs text-white/55">Goal</div>
            <div className="mt-2 text-sm text-white/90">Demo-ready, scalable MVP</div>
          </div>
        </div>
      </section>

      {/* Yana */}
      <section className="grid md:grid-cols-2 gap-10 items-center mb-14">
        {/* IMAGE CARD */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-3">
          <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-[var(--accent)]/25 blur-3xl" />
          <div className="h-80 w-full rounded-xl border border-white/10 bg-black/20 flex items-center justify-center text-white/40">
            Your Photo
          </div>
        </div>

        {/* TEXT */}
        <div>
          <h2 className="text-3xl font-semibold">Yana Angelova</h2>
          <p className="mt-2 text-sm text-white/70">
            <span className="text-[var(--accent)] font-medium">Frontend Developer</span>{" "}
            • UI/UX • Product Presentation
          </p>

          <p className="mt-5 text-white/78 leading-relaxed">
            I focus on building the interface, the overall experience, and how the
            project is presented. My role is to make Trackly feel premium and simple:
            one action → clear result → official access.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75">
              Next.js
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75">
              Tailwind
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75">
              UX/UI
            </span>
          </div>
        </div>
      </section>

      {/* Denislav */}
      <section className="grid md:grid-cols-2 gap-10 items-center mb-14">
        {/* TEXT */}
        <div>
          <h2 className="text-3xl font-semibold">Denislav Tsenov</h2>
          <p className="mt-2 text-sm text-white/70">
            <span className="text-[var(--accent)] font-medium">Backend Developer</span>{" "}
            • API • Integrations
          </p>

          <p className="mt-5 text-white/78 leading-relaxed">
            Responsible for the backend architecture and logic — communication with
            recognition services, managing track metadata, and building endpoints
            for history and legal routing.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75">
              API Design
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75">
              Data Flow
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75">
              Reliability
            </span>
          </div>
        </div>

        {/* IMAGE CARD */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-3">
          <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-[var(--accent)]/25 blur-3xl" />
          <div className="h-80 w-full rounded-xl border border-white/10 bg-black/20 flex items-center justify-center text-white/40">
            Teammate Photo
          </div>
        </div>
      </section>

      {/* EXPERIENCE */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        <h2 className="text-2xl font-semibold mb-3">Competitions & experience</h2>

        <p className="text-white/78 leading-relaxed">
          We have experience with programming and STEM competitions, teamwork under
          time pressure, and building projects with clear goals. Trackly represents
          our combined strengths: design + engineering + real-world usefulness.
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="text-xs text-white/55">Teamwork</div>
            <div className="mt-2 text-sm text-white/90">
              Clear roles, fast feedback, clean commits
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="text-xs text-white/55">Skills</div>
            <div className="mt-2 text-sm text-white/90">
              UI/UX, APIs, architecture, iteration
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="text-xs text-white/55">Direction</div>
            <div className="mt-2 text-sm text-white/90">
              Scale MVP → integrations → full product
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
