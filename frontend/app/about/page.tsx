import Link from "next/link";

export default function AboutPage() {
  return (
    <section className="card p-6">
      <h1 className="cardTitle text-2xl font-bold">About Trackly</h1>
      <p className="cardText mt-3">Trackly helps you recognize songs and save what you find into your personal library.</p>
      <div className="mt-4 flex gap-3 text-sm">
        <Link className="navItem" href="/idea">Idea</Link>
        <Link className="navItem" href="/concept">Concept</Link>
        <Link className="navItem" href="/founders">Founders</Link>
        <Link className="navItem" href="/the-future">The Future</Link>
      </div>
    </section>
  );
}
