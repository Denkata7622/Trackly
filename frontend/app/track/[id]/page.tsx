import Link from "next/link";

type TrackPageProps = {
  params: Promise<{ id: string }>;
};

export default async function TrackDetailsPage({ params }: TrackPageProps) {
  const { id } = await params;

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="rounded-2xl border border-white/15 bg-white/5 p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-violet-200/80">Track details</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Track ID: {id}</h1>
        <p className="mt-4 text-sm text-white/70">
          This page is a placeholder details view so the track links from the song cards no longer lead to a 404.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-lg border border-white/20 px-3 py-2 text-sm text-white hover:bg-white/10"
        >
          ← Back to recognition
        </Link>
      </div>
    </main>
  );
}
