export default function HowToUsePage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-10">
        <span className="badge">How to use</span>
        <h1 className="mt-4 text-4xl font-semibold cardTitle">
          Simple flow for the user
        </h1>
        <p className="mt-3 cardText max-w-3xl">
          The UI is designed like a “1-minute demo”: one main action, then clear results.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-6">
          <h2 className="text-lg font-semibold cardTitle">Step-by-step</h2>
          <ol className="mt-4 space-y-3 cardText">
            <li>1) Tap <b className="text-white/90">LISTEN</b></li>
            <li>2) Trackly detects the song and confidence match</li>
            <li>3) Show license status (FREE / COPYRIGHTED)</li>
            <li>4) Provide official buttons (Spotify / YouTube / Apple)</li>
            <li>5) Optional: open Artist Page + save in Library</li>
          </ol>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold cardTitle">What the user sees</h2>
          <ul className="mt-4 space-y-2 cardText">
            <li>• Track title + artist + cover</li>
            <li>• “Safe access” actions (official platforms)</li>
            <li>• Clear call to action depending on license</li>
            <li>• Recent History so it’s easy to re-open</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
