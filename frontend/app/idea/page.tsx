export default function IdeaPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-10">
        <span className="badge">Idea</span>
        <h1 className="mt-4 text-4xl font-semibold cardTitle">
          One tap → identify → legal access
        </h1>
        <p className="mt-3 cardText max-w-3xl">
          Trackly recognizes music in real time and routes the user to official
          sources (Spotify/YouTube/Apple) or legal downloads when available.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="kpi">
          <div className="text-xs cardText">Problem</div>
          <div className="mt-2 text-sm text-white/90">
            People find songs but download them illegally or from unsafe sites.
          </div>
        </div>
        <div className="kpi">
          <div className="text-xs cardText">Solution</div>
          <div className="mt-2 text-sm text-white/90">
            Recognition + license status + official platforms in one place.
          </div>
        </div>
        <div className="kpi">
          <div className="text-xs cardText">Value</div>
          <div className="mt-2 text-sm text-white/90">
            Fast, safe, and respectful to artists & copyrights.
          </div>
        </div>
      </div>

      <div className="mt-6 card p-6">
        <h2 className="text-lg font-semibold cardTitle">Key features</h2>
        <ul className="mt-4 space-y-2 cardText">
          <li>• Live recognition (microphone) + file upload</li>
          <li>• License label: FREE / COPYRIGHTED</li>
          <li>• “Open in Spotify / YouTube Music / Apple Music”</li>
          <li>• Artist page button + track details</li>
          <li>• History of recent recognitions</li>
        </ul>
      </div>
    </div>
  );
}
