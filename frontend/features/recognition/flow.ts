import type { AudioRecognitionResult } from "./api";

type QueueTrackInput = {
  id: string;
  title: string;
  artist: string;
  query: string;
  videoId?: string;
};

type RecognizeFlowInput = {
  recognize: () => Promise<AudioRecognitionResult>;
  addToQueue: (track: QueueTrackInput) => void;
};

export async function recognizeVerifyAndQueue({ recognize, addToQueue }: RecognizeFlowInput): Promise<AudioRecognitionResult> {
  const result = await recognize();

  if (!result.primaryMatch.youtubeVideoId) {
    throw new Error("NO_VERIFIED_RESULT");
  }

  addToQueue({
    id: `recognized-${result.primaryMatch.songName}-${result.primaryMatch.artist}`.toLowerCase().replace(/\s+/g, "-"),
    title: result.primaryMatch.songName,
    artist: result.primaryMatch.artist,
    query: `${result.primaryMatch.songName} ${result.primaryMatch.artist} official audio`,
    videoId: result.primaryMatch.youtubeVideoId,
  });

  return result;
}
