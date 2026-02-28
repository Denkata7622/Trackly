"use client";

import { useEffect, useState } from "react";
import { use } from "react";

type SharedPayload = {
  title: string;
  artist: string;
  album?: string;
  coverUrl?: string;
  sharedBy: string;
  createdAt: string;
};

export default function SharedSongPage({ params }: { params: Promise<{ shareCode: string }> }) {
  const { shareCode } = use(params);
  const [data, setData] = useState<SharedPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
    fetch(`${base}/api/share/${shareCode}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("NOT_FOUND");
        setData((await res.json()) as SharedPayload);
      })
      .catch(() => setError("Shared song not found"));
  }, [shareCode]);

  if (error) return <section className="card p-6">{error}</section>;
  if (!data) return <section className="card p-6">Loading…</section>;

  return (
    <section className="resultCardAnimated mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-6">
      <p className="text-xs uppercase tracking-[0.2em] text-white/60">Shared song</p>
      <h1 className="mt-2 text-3xl font-bold">{data.title}</h1>
      <p className="mt-2 text-xl text-white/70">{data.artist}</p>
      <p className="mt-2 text-sm text-white/60">{data.album || "Unknown Album"}</p>
      <p className="mt-4 text-sm text-white/50">Shared by {data.sharedBy}</p>
    </section>
  );
}
