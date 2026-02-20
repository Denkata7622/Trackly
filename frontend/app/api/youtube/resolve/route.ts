import { NextRequest, NextResponse } from "next/server";

const VIDEO_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

function extractVideoId(source: string): string | null {
  const trimmed = source.trim();
  if (VIDEO_ID_PATTERN.test(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed);

    if (url.hostname.includes("youtu.be")) {
      const id = url.pathname.replace(/^\//, "").split("/")[0];
      return VIDEO_ID_PATTERN.test(id) ? id : null;
    }

    if (url.hostname.includes("youtube.com")) {
      const fromWatch = url.searchParams.get("v");
      if (fromWatch && VIDEO_ID_PATTERN.test(fromWatch)) return fromWatch;

      const parts = url.pathname.split("/").filter(Boolean);
      const embedLike = parts[0] === "embed" || parts[0] === "shorts";
      if (embedLike && parts[1] && VIDEO_ID_PATTERN.test(parts[1])) return parts[1];
    }
  } catch {
    // not a URL, continue with regex extraction from blob text below
  }

  return null;
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query")?.trim();
  if (!query) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  const direct = extractVideoId(query);
  if (direct) return NextResponse.json({ videoId: direct });

  try {
    const encoded = encodeURIComponent(query);
    const response = await fetch(`https://www.youtube.com/results?search_query=${encoded}`, {
      cache: "no-store",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; PonotAI/1.0)",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return NextResponse.json({ error: "YouTube lookup failed" }, { status: 502 });
    }

    const html = await response.text();
    const match = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
    if (!match?.[1]) {
      return NextResponse.json({ error: "No matching YouTube video" }, { status: 404 });
    }

    return NextResponse.json({ videoId: match[1] });
  } catch {
    return NextResponse.json({ error: "YouTube lookup unavailable" }, { status: 502 });
  }
}
