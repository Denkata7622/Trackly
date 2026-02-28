import { randomUUID } from "node:crypto";
import { readHistory, writeHistory } from "../../db/client";
import type { HistoryEntry } from "../../db/models";
import {
  clearUserHistory as clearUserHistoryInStore,
  createUserHistory,
  deleteUserHistoryItem as deleteUserHistoryItemInStore,
  listUserHistory as listUserHistoryInStore,
} from "../../db/authStore";

export type HistoryFilter = "all" | "recognized" | "unrecognized" | "audio-record" | "audio-file" | "album-image";

export async function listHistory(limit = 20): Promise<HistoryEntry[]> {
  const all = await readHistory();
  return all.slice(0, Math.max(1, Math.min(100, limit)));
}

export async function listUserHistory(userId: string, limit = 20, offset = 0, filter: HistoryFilter = "all") {
  const all = await listUserHistoryInStore(userId);
  const filtered = all.filter((item) => {
    if (filter === "all") return true;
    if (filter === "recognized") return item.recognized;
    if (filter === "unrecognized") return !item.recognized;
    return item.method === filter;
  });
  return {
    items: filtered.slice(offset, offset + limit),
    total: filtered.length,
  };
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

export async function addUserHistoryEntry(userId: string, input: {
  method: string;
  title?: string;
  artist?: string;
  album?: string;
  coverUrl?: string;
  recognized: boolean;
}) {
  return createUserHistory({ userId, ...input });
}

export async function deleteUserHistoryItem(userId: string, id: string): Promise<boolean> {
  const status = await deleteUserHistoryItemInStore(userId, id);
  if (status === "forbidden") throw new Error("FORBIDDEN");
  return status === "ok";
}

export async function clearUserHistory(userId: string): Promise<number> {
  return clearUserHistoryInStore(userId);
}
