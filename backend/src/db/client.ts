import { promises as fs } from "node:fs";
import path from "node:path";
import type { HistoryEntry } from "./models";

const DB_DIR = path.join(process.cwd(), "backend", "data");
const HISTORY_FILE = path.join(DB_DIR, "history.json");

async function ensureHistoryFile() {
  await fs.mkdir(DB_DIR, { recursive: true });
  try {
    await fs.access(HISTORY_FILE);
  } catch {
    await fs.writeFile(HISTORY_FILE, "[]", "utf8");
  }
}

export async function readHistory(): Promise<HistoryEntry[]> {
  await ensureHistoryFile();
  const raw = await fs.readFile(HISTORY_FILE, "utf8");
  return JSON.parse(raw) as HistoryEntry[];
}

export async function writeHistory(entries: HistoryEntry[]): Promise<void> {
  await ensureHistoryFile();
  await fs.writeFile(HISTORY_FILE, JSON.stringify(entries, null, 2), "utf8");
}
