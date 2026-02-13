import { NextResponse } from "next/server";

type RecognizeResponse = {
  trackId: string;
  title: string;
  artist: {
    id: string;
    name: string;
  };
  license: "FREE" | "COPYRIGHTED";
  artworkUrl?: string;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:4000";

export async function POST() {
  try {
    const upstream = await fetch(`${API_BASE_URL}/recognize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
      cache: "no-store",
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { message: "Upstream recognize endpoint failed." },
        { status: upstream.status }
      );
    }

    const data = (await upstream.json()) as RecognizeResponse;
    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "Could not reach recognition API." },
      { status: 502 }
    );
  }
}
