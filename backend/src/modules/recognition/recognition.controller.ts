import { Request, Response } from "express";
import { recognizeSongFromAudio, recognizeSongFromImage } from "./recognition.service";

export async function recognizeAudioController(req: Request, res: Response): Promise<void> {
  try {
    if (!req.file) {
    res.status(400).json({ message: "Audio file is required in field 'audio'." });
    return;
  }

    const metadata = await recognizeSongFromAudio(req.file.buffer, req.file.originalname);
    res.status(200).json(metadata);
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

    const metadata = await recognizeSongFromImage(req.file.buffer);
    res.status(200).json(metadata);
  } catch (error) {
    res.status(500).json({ message: "Image recognition failed.", details: (error as Error).message });
  }
}
