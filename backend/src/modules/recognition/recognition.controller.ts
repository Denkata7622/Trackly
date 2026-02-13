import { Request, Response } from "express";
import { recognizeSongFromAudio, recognizeSongsFromImage } from "./recognition.service";

const SUPPORTED_OCR_LANGUAGES = new Set(["eng", "spa", "deu", "fra", "ita", "por"]);

export async function recognizeAudioController(req: Request, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ message: "Audio file is required in field 'audio'." });
      return;
    }

    const result = await recognizeSongFromAudio(req.file.buffer, req.file.originalname);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Audio recognition failed.", details: (error as Error).message });
  }
}

export async function recognizeImageController(req: Request, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ message: "Image file is required in field 'image'." });
      return;
    }

    const maxSongsRaw = Number(req.body?.maxSongs);
    const maxSongs = Number.isFinite(maxSongsRaw) ? Math.min(Math.max(maxSongsRaw, 1), 20) : 10;

    const languageRaw = String(req.body?.language || "eng").toLowerCase();
    const language = SUPPORTED_OCR_LANGUAGES.has(languageRaw) ? languageRaw : "eng";

    const songs = await recognizeSongsFromImage(req.file.buffer, maxSongs, language);

    res.status(200).json({
      songs,
      count: songs.length,
      language,
    });
  } catch (error) {
    res.status(500).json({ message: "Image recognition failed.", details: (error as Error).message });
  }
}
