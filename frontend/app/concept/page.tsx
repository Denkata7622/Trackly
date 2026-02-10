export default function ConceptPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-10">
        <span className="badge">Concept</span>
        <h1 className="mt-4 text-4xl font-semibold cardTitle">
          How Trackly works (high level)
        </h1>
        <p className="mt-3 cardText max-w-3xl">
          Clean architecture: UI → API → recognition → metadata → official links.
        </p>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold cardTitle">Flow</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-5 cardText">
          <div className="kpi">UI (Listen)</div>
          <div className="kpi">Backend API</div>
          <div className="kpi">Recognition</div>
          <div className="kpi">Metadata</div>
          <div className="kpi">Links + Status</div>
        </div>

        <ul className="mt-6 space-y-2 cardText">
          <li>• Recognition returns track + confidence</li>
          <li>• Backend enriches with artist/album + platform IDs</li>
          <li>• UI shows actions based on license status</li>
          <li>• Save result in History / Library</li>
        </ul>
      </div>
    </div>
  );
}
