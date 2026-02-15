import type { Request, Response } from "express";
import { addHistoryEntry, listHistory } from "./history.service";

export async function getHistoryController(req: Request, res: Response): Promise<void> {
  const limit = Number(req.query.limit || 20);
  const items = await listHistory(limit);
  res.status(200).json({ items });
}

export async function createHistoryEntryController(req: Request, res: Response): Promise<void> {
  const { songName, artist, youtubeVideoId } = req.body as {
    songName?: string;
    artist?: string;
    youtubeVideoId?: string;
  };

  if (!songName || !artist) {
    res.status(400).json({ message: "songName and artist are required." });
    return;
  }

  const entry = await addHistoryEntry({ songName, artist, youtubeVideoId });
  res.status(201).json(entry);
}
