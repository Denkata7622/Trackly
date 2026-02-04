import Link from "next/link";

type Track = {
  id: string;
  title: string;
  artistName: string;
  artistId: string;
  artworkUrl?: string;
  license: "FREE" | "COPYRIGHTED";
};

export default function TrackCard({ track }: { track: Track }) {
  const badge =
    track.license === "FREE"
      ? "bg-emerald-500/15 text-emerald-300"
      : "bg-white/10 text-white/60";

  return (
    <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/10">
      <div className="h-12 w-12 overflow-hidden rounded-lg bg-white/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={track.artworkUrl} alt="" className="h-full w-full object-cover" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{track.title}</div>
        <div className="truncate text-xs text-white/60">{track.artistName}</div>
      </div>

      <span className={`rounded-full px-3 py-1 text-xs ${badge}`}>
        {track.license === "FREE" ? "Free" : "Copyrighted"}
      </span>

      <Link href={`/track/${track.id}`} className="text-xs text-white/70 hover:text-white">
        Open
      </Link>
    </div>
  );
}
