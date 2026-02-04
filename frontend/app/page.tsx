import TrackCard from "../components/TrackCard";
import { recentTracks } from "../data/mockTracks";


export default function Home() {
  return (
   <main
  className="min-h-screen text-[var(--text)]"
  style={{
    background:
      "radial-gradient(900px 500px at 50% 20%, rgba(124,92,255,0.16), transparent 60%), radial-gradient(700px 380px at 20% 80%, rgba(76,211,255,0.08), transparent 55%), linear-gradient(180deg, var(--bg), var(--bg-2))",
  }}
>

      <div className="mx-auto max-w-5xl px-6 py-10">

        {/* HEADER */}
        <header className="flex items-center justify-between">
          <div className="text-lg font-semibold tracking-wide">
            Trackly
          </div>

          <nav className="flex items-center gap-2">
            <button className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm hover:bg-white/10">
              Home
            </button>
            <button className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/60 hover:bg-white/10">
              Library
            </button>
          </nav>
        </header>

        {/* LISTEN SECTION */}
        <section className="mt-10 rounded-2xl border border-white/10 bg-white/5 px-6 py-14">
          <div className="mx-auto flex max-w-xl flex-col items-center text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">
              Music recognition
            </p>

            <h1 className="mt-3 text-3xl font-semibold">
              Identify music. Access it legally.
            </h1>

            <p className="mt-3 text-sm text-white/60">
              Tap listen to recognize a song and get official access.
            </p>

            <button className="mt-10 h-36 w-36 rounded-full border border-white/10 bg-white/5 text-lg font-semibold tracking-wide transition hover:bg-white/10">
              LISTEN
            </button>

            <button className="mt-6 text-xs text-white/60 hover:text-white">
              Upload audio file
            </button>
          </div>
        </section>

        {/* RECENT HISTORY */}
        <section className="mt-10">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white/90">
              Recent
            </h2>
            <button className="text-xs text-white/60 hover:text-white/90">
              View all
            </button>
          </div>

          <div className="space-y-3">
            {recentTracks.map((track) => (
              <TrackCard key={track.id} track={track} />
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}
