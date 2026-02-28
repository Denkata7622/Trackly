import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

export type UserRecord = {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  avatarBase64?: string;
  bio?: string;
  createdAt: string;
};

export type SearchHistoryRecord = {
  id: string;
  userId: string;
  method: string;
  title?: string;
  artist?: string;
  album?: string;
  coverUrl?: string;
  recognized: boolean;
  createdAt: string;
};

export type FavoriteRecord = {
  id: string;
  userId: string;
  title: string;
  artist: string;
  album?: string;
  coverUrl?: string;
  savedAt: string;
};

export type SharedSongRecord = {
  id: string;
  shareCode: string;
  userId: string;
  title: string;
  artist: string;
  album?: string;
  coverUrl?: string;
  createdAt: string;
};

type AppDb = {
  users: UserRecord[];
  searchHistory: SearchHistoryRecord[];
  favorites: FavoriteRecord[];
  sharedSongs: SharedSongRecord[];
};

const DB_PATH = path.join(process.cwd(), "backend", "data", "appdb.json");

async function ensureDb() {
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
  try {
    await fs.access(DB_PATH);
  } catch {
    const initial: AppDb = { users: [], searchHistory: [], favorites: [], sharedSongs: [] };
    await fs.writeFile(DB_PATH, JSON.stringify(initial, null, 2));
  }
}

async function readDb(): Promise<AppDb> {
  await ensureDb();
  return JSON.parse(await fs.readFile(DB_PATH, "utf8")) as AppDb;
}

async function writeDb(db: AppDb): Promise<void> {
  await ensureDb();
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

export async function listUsers() { return (await readDb()).users; }

export async function createUser(input: Omit<UserRecord, "id" | "createdAt">): Promise<UserRecord> {
  const db = await readDb();
  const user: UserRecord = { id: randomUUID(), createdAt: new Date().toISOString(), ...input };
  db.users.push(user);
  await writeDb(db);
  return user;
}

export async function updateUser(id: string, updates: Partial<Omit<UserRecord, "id" | "createdAt">>): Promise<UserRecord | null> {
  const db = await readDb();
  const idx = db.users.findIndex((u) => u.id === id);
  if (idx < 0) return null;
  db.users[idx] = { ...db.users[idx], ...updates };
  await writeDb(db);
  return db.users[idx];
}

export async function deleteUserCascade(id: string): Promise<void> {
  const db = await readDb();
  db.users = db.users.filter((u) => u.id !== id);
  db.searchHistory = db.searchHistory.filter((h) => h.userId !== id);
  db.favorites = db.favorites.filter((f) => f.userId !== id);
  db.sharedSongs = db.sharedSongs.filter((s) => s.userId !== id);
  await writeDb(db);
}

export async function findUserByEmail(email: string) { return (await readDb()).users.find((u) => u.email === email) || null; }
export async function findUserByUsername(username: string) { return (await readDb()).users.find((u) => u.username === username) || null; }
export async function findUserById(id: string) { return (await readDb()).users.find((u) => u.id === id) || null; }

export async function createUserHistory(item: Omit<SearchHistoryRecord, "id" | "createdAt">): Promise<SearchHistoryRecord> {
  const db = await readDb();
  const rec: SearchHistoryRecord = { id: randomUUID(), createdAt: new Date().toISOString(), ...item };
  db.searchHistory.unshift(rec);
  await writeDb(db);
  return rec;
}

export async function listUserHistory(userId: string): Promise<SearchHistoryRecord[]> {
  return (await readDb()).searchHistory.filter((h) => h.userId === userId).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
}

export async function deleteUserHistoryItem(userId: string, id: string): Promise<"ok" | "forbidden" | "missing"> {
  const db = await readDb();
  const item = db.searchHistory.find((h) => h.id === id);
  if (!item) return "missing";
  if (item.userId !== userId) return "forbidden";
  db.searchHistory = db.searchHistory.filter((h) => h.id !== id);
  await writeDb(db);
  return "ok";
}

export async function clearUserHistory(userId: string): Promise<number> {
  const db = await readDb();
  const before = db.searchHistory.length;
  db.searchHistory = db.searchHistory.filter((h) => h.userId !== userId);
  await writeDb(db);
  return before - db.searchHistory.length;
}

export async function listFavorites(userId: string): Promise<FavoriteRecord[]> {
  return (await readDb()).favorites.filter((f) => f.userId === userId).sort((a,b)=>b.savedAt.localeCompare(a.savedAt));
}

export async function findDuplicateFavorite(userId: string, title: string, artist: string) {
  return (await readDb()).favorites.find((f) => f.userId===userId && f.title===title && f.artist===artist) || null;
}

export async function createFavorite(item: Omit<FavoriteRecord, "id" | "savedAt">): Promise<FavoriteRecord> {
  const db = await readDb();
  const rec: FavoriteRecord = { id: randomUUID(), savedAt: new Date().toISOString(), ...item };
  db.favorites.unshift(rec);
  await writeDb(db);
  return rec;
}

export async function deleteFavorite(userId: string, id: string): Promise<"ok"|"forbidden"|"missing"> {
  const db = await readDb();
  const item = db.favorites.find((f)=>f.id===id);
  if(!item) return "missing";
  if(item.userId!==userId) return "forbidden";
  db.favorites = db.favorites.filter((f)=>f.id!==id);
  await writeDb(db);
  return "ok";
}

export async function createSharedSong(item: Omit<SharedSongRecord, "id" | "createdAt" | "shareCode">): Promise<SharedSongRecord> {
  const db = await readDb();
  const rec: SharedSongRecord = { id: randomUUID(), shareCode: randomUUID().replace(/-/g, ""), createdAt: new Date().toISOString(), ...item };
  db.sharedSongs.unshift(rec);
  await writeDb(db);
  return rec;
}

export async function findSharedSongByCode(shareCode: string): Promise<SharedSongRecord | null> {
  return (await readDb()).sharedSongs.find((s) => s.shareCode === shareCode) || null;
}
