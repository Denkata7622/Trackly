export default function FuturePage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-10">
        <span className="badge">The Future</span>
        <h1 className="mt-4 text-4xl font-semibold cardTitle">
          What we can add next
        </h1>
        <p className="mt-3 cardText max-w-3xl">
          After the demo MVP, we can scale to a full product experience.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card p-6">
          <h2 className="text-lg font-semibold cardTitle">Library</h2>
          <p className="mt-3 cardText">User collections, tags, favorites, playlists.</p>
        </div>
        <div className="card p-6">
          <h2 className="text-lg font-semibold cardTitle">Accounts</h2>
          <p className="mt-3 cardText">Login, sync history across devices.</p>
        </div>
        <div className="card p-6">
          <h2 className="text-lg font-semibold cardTitle">Better matching</h2>
          <p className="mt-3 cardText">Noise handling, shorter samples, offline cache.</p>
        </div>
      </div>
    </div>
  );
}
