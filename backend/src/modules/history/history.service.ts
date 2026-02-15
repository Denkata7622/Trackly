import { randomUUID } from "node:crypto";
import { readHistory, writeHistory } from "../../db/client";
import type { HistoryEntry } from "../../db/models";

export async function listHistory(limit = 20): Promise<HistoryEntry[]> {
  const all = await readHistory();
  return all.slice(0, Math.max(1, Math.min(100, limit)));
}

export async function addHistoryEntry(input: {
  songName: string;
  artist: string;
  youtubeVideoId?: string;
}): Promise<HistoryEntry> {
  const all = await readHistory();
  const entry: HistoryEntry = {
    id: randomUUID(),
    songName: input.songName,
    artist: input.artist,
    youtubeVideoId: input.youtubeVideoId,
    createdAt: new Date().toISOString(),
  };

  const next = [entry, ...all].slice(0, 200);
  await writeHistory(next);
  return entry;
}
