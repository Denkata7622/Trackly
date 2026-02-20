import { Request, Response } from "express";
import { addHistoryEntry } from "../history/history.service";
import { MissingProviderConfigError, NoVerifiedResultError } from "./providers/audd.provider";
import { recognizeSongFromAudio, recognizeSongFromImage } from "./recognition.service";

function handleRecognitionError(res: Response, error: unknown, fallbackMessage: string): void {
  if (error instanceof NoVerifiedResultError) {
    res.status(404).json({
      message: error.message,
      code: "NO_VERIFIED_RESULT",
    });
    return;
  }

  if (error instanceof MissingProviderConfigError) {
    res.status(500).json({
      message: error.message,
      code: "PROVIDER_CONFIG_ERROR",
    });
    return;
  }

  res.status(500).json({
    message: fallbackMessage,
    details: (error as Error).message,
  });
}

export async function recognizeAudioController(req: Request, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ message: "Audio file is required in field 'audio'." });
      return;
    }

    const metadata = await recognizeSongFromAudio(req.file.buffer, req.file.originalname);
    await addHistoryEntry({
      songName: metadata.songName,
      artist: metadata.artist,
      youtubeVideoId: metadata.youtubeVideoId,
    });
    res.status(200).json(metadata);
  } catch (error) {
    handleRecognitionError(res, error, "Audio recognition failed.");
  }
}

export async function recognizeImageController(req: Request, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ message: "Image file is required in field 'image'." });
      return;
    }

    const language = typeof req.body?.language === "string" ? req.body.language : undefined;
    // maxSongs is accepted for backwards compatibility but not used by the deterministic OCR pipeline.
    void req.body?.maxSongs;

    const songs = await recognizeSongFromImage(req.file.buffer, language);

    for (const song of songs) {
      await addHistoryEntry({
        songName: song.songName,
        artist: song.artist,
        youtubeVideoId: song.youtubeVideoId,
      });
    }

    res.status(200).json({
      songs,
      count: songs.length,
      language: language ?? "eng",
    });
  } catch (error) {
    handleRecognitionError(res, error, "Image recognition failed.");
  }
}
