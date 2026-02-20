"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import LibrarySidebar from "../components/LibrarySidebar";
import { usePlayer } from "../components/PlayerProvider";
import SongReviewModal from "../components/SongReviewModal";
import TrackCard from "../components/TrackCard";
import { useLibrary } from "../features/library/useLibrary";
import {
  recognizeFromAudio,
  recognizeFromImage,
  RecognitionError,
  type ImageRecognitionResult,
  type SongMatch,
  type SongRecognitionResult,
} from "../features/recognition/api";
import { recentTracksSeed } from "../features/tracks/seed";
import type { Track } from "../features/tracks/types";

function toRecognizedTrack(result: SongRecognitionResult): Track {
  return {
    id: `recognized-${result.songName}-${result.artist}`.toLowerCase().replace(/\s+/g, "-"),
    title: result.songName,
    artistName: result.artist,
    artistId: `artist-${result.artist}`.toLowerCase().replace(/\s+/g, "-"),
    artworkUrl: "https://picsum.photos/seed/recognized/80",
    license: "COPYRIGHTED",
  };
}

function songMatchToTrack(song: SongMatch): Track {
  return {
    id: `history-${song.songName}-${song.artist}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`.toLowerCase().replace(/\s+/g, "-"),
    title: song.songName,
    artistName: song.artist,
    artistId: `artist-${song.artist}`.toLowerCase().replace(/\s+/g, "-"),
    artworkUrl: song.albumArtUrl || "https://picsum.photos/seed/history/80",
    license: "COPYRIGHTED",
    youtubeVideoId: song.youtubeVideoId,
  };
}

export default function Page() {
  const [result, setResult] = useState<SongRecognitionResult | null>(null);
  const [imageResult, setImageResult] = useState<ImageRecognitionResult | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [pendingImageResult, setPendingImageResult] = useState<ImageRecognitionResult | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recognitionPhase, setRecognitionPhase] = useState<"idle" | "recording" | "recognizing" | "verifying">("idle");
  const [historyTracks, setHistoryTracks] = useState<Track[]>([]);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { addToQueue } = usePlayer();

  const { playlists, favoritesSet, toggleFavorite, createPlaylist, deletePlaylist, addSongToPlaylist } =
    useLibrary();

  const tracks = useMemo(() => {
    const recognizedTrack = result ? [toRecognizedTrack(result)] : [];
    const uniqueTracks = new Map<string, Track>();

    [...recognizedTrack, ...historyTracks, ...recentTracksSeed].forEach((track) => {
      uniqueTracks.set(track.id, track);
    });

    return [...uniqueTracks.values()];
  }, [historyTracks, result]);

  useEffect(() => {
    setMounted(true);

    const API_BASE_URL =
      process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:4000";

    void fetch(`${API_BASE_URL}/api/history?limit=10`)
      .then(async (response) => {
        if (!response.ok) return;
        const payload = (await response.json()) as {
          items?: Array<{ id: string; songName: string; artist: string; youtubeVideoId?: string }>;
        };

        const mapped = (payload.items || []).map((item) => ({
          id: `history-${item.id}`,
          title: item.songName,
          artistName: item.artist,
          artistId: `artist-${item.artist}`.toLowerCase().replace(/\s+/g, "-"),
          artworkUrl: "https://picsum.photos/seed/history/80",
          license: "COPYRIGHTED" as const,
          youtubeVideoId: item.youtubeVideoId,
        }));

        setHistoryTracks(mapped);
      })
      .catch(() => {
        // keep local list if backend history is unavailable
      });
  }, []);

  async function recordAudioClip(durationMs: number): Promise<Blob> {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    return new Promise((resolve, reject) => {
      const chunks: Blob[] = [];
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onerror = () => reject(new Error("Audio capture failed."));

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        resolve(new Blob(chunks, { type: "audio/webm" }));
      };

      mediaRecorder.start();
      window.setTimeout(() => {
        if (mediaRecorder.state !== "inactive") {
          mediaRecorder.stop();
        }
      }, durationMs);
    });
  }

  function handlePlayTrack(track: Track) {
    const isRecognizedTrack = result && track.id === toRecognizedTrack(result).id;
    const videoId = isRecognizedTrack ? result.youtubeVideoId : track.youtubeVideoId;

    addToQueue({
      id: track.id,
      title: track.title,
      artist: track.artistName,
      videoId,
      query: `${track.title} ${track.artistName} official audio`,
    });
  }

  function addSongsToHistoryTracks(songs: SongMatch[]) {
    const nextTracks = songs.map(songMatchToTrack);
    setHistoryTracks((prev) => [...nextTracks, ...prev].slice(0, 20));
  }

  function handleConfirmSongs(selectedSongs: SongMatch[]) {
    if (!pendingImageResult) return;

    const updatedResult: ImageRecognitionResult = {
      ...pendingImageResult,
      songs: selectedSongs,
      count: selectedSongs.length,
    };

    setImageResult(updatedResult);
    setResult(selectedSongs[0] ?? null);
    addSongsToHistoryTracks(selectedSongs);
    setShowReviewModal(false);
    setPendingImageResult(null);
  }

  function handleCancelReview() {
    setShowReviewModal(false);
    setPendingImageResult(null);
  }

  async function handleRecognizeAudio() {
    if (isLoadingAudio || isLoadingImage) return;

    setErrorMessage(null);
    setResult(null);
    setImageResult(null);
    setPendingImageResult(null);
    setShowReviewModal(false);
    setIsLoadingAudio(true);
    setRecognitionPhase("recording");

    try {
      const audioBlob = await recordAudioClip(6000);
      setRecognitionPhase("recognizing");
      const recognized = await recognizeFromAudio(audioBlob);
      setRecognitionPhase("verifying");
      setResult(recognized.primaryMatch);
    } catch (error) {
      if (error instanceof RecognitionError && error.code === "NO_VERIFIED_RESULT") {
        setErrorMessage("Recognition worked, but no verified YouTube track was found. Try a cleaner sample.");
      } else {
        setErrorMessage((error as Error).message || "Could not recognize from audio.");
      }
    } finally {
      setIsLoadingAudio(false);
      setRecognitionPhase("idle");
    }
  }

  function handleUploadPhotoClick() {
    if (isLoadingAudio || isLoadingImage) return;
    fileInputRef.current?.click();
  }

  async function handleImageSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setResult(null);
    setImageResult(null);
    setPendingImageResult(null);
    setShowReviewModal(false);
    setIsLoadingImage(true);
    setRecognitionPhase("recognizing");

    try {
      setRecognitionPhase("verifying");
      const recognized = await recognizeFromImage(file, 10, "eng");
      if (!recognized.songs[0]) {
        throw new RecognitionError("No songs detected in photo.");
      }
      setPendingImageResult(recognized);
      setShowReviewModal(true);
    } catch (error) {
      if (error instanceof RecognitionError && error.code === "NO_VERIFIED_RESULT") {
        setErrorMessage("Text was detected, but no verified YouTube match was found for it.");
      } else {
        setErrorMessage((error as Error).message || "Could not recognize from photo.");
      }
    } finally {
      setIsLoadingImage(false);
      setRecognitionPhase("idle");
      event.target.value = "";
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,#351f5f,transparent_45%),radial-gradient(circle_at_top_left,#0f3f4f,transparent_40%),#090b11]">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-violet-200/80">Trackly • Recognize + Verify + Play</p>
              <h1 className="mt-1 text-4xl font-semibold text-white">Trackly Recognition</h1>
            </div>
            <button
              type="button"
              className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm text-white/90 hover:bg-white/10"
              onClick={() => setIsLibraryOpen((prev) => !prev)}
            >
              {isLibraryOpen ? "Hide Library" : "Show Library"}
            </button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
              <p className="text-xs text-white/60">Songs in list</p>
              <p className="mt-1 text-lg font-semibold">{mounted ? tracks.length : 0}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
              <p className="text-xs text-white/60">Favorites</p>
              <p className="mt-1 text-lg font-semibold">{mounted ? favoritesSet.size : 0}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
              <p className="text-xs text-white/60">Recognition mode</p>
              <p className="mt-1 text-lg font-semibold capitalize">{recognitionPhase}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <section>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  id="recognizeAudioBtn"
                  onClick={handleRecognizeAudio}
                  disabled={isLoadingAudio || isLoadingImage}
                  className="rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-violet-900/30 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoadingAudio ? "Listening and recognizing..." : "Recognize with microphone"}
                </button>

                <button
                  id="uploadPhotoBtn"
                  onClick={handleUploadPhotoClick}
                  disabled={isLoadingAudio || isLoadingImage}
                  className="rounded-xl border border-cyan-300/40 bg-cyan-500/10 px-4 py-3 text-sm font-medium text-cyan-100 hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoadingImage ? "Uploading photo..." : "Upload photo (OCR)"}
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelected}
                className="hidden"
              />

              {(isLoadingAudio || isLoadingImage) && (
                <p className="mt-4 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/75">
                  {recognitionPhase === "recording" && "🎙 Recording audio sample..."}
                  {recognitionPhase === "recognizing" && "🧠 Recognizing song..."}
                  {recognitionPhase === "verifying" && "✅ Verifying platform availability..."}
                  {recognitionPhase === "idle" && "Processing request, please wait..."}
                </p>
              )}

              {errorMessage && (
                <p className="mt-4 rounded-lg border border-red-300/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                  {errorMessage}
                </p>
              )}
            </div>

            {imageResult && (
              <section className="mt-6 rounded-2xl border border-violet-300/25 bg-gradient-to-br from-violet-500/15 to-cyan-500/10 p-6">
                <h2 className="text-xl font-semibold text-white">Confirmed Songs ({imageResult.count})</h2>
                <div className="mt-4 space-y-3">
                  {imageResult.songs.map((song, index) => (
                    <div
                      key={`${song.songName}-${song.artist}-${index}`}
                      className="rounded-xl border border-white/10 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <img src={song.albumArtUrl} alt="Album cover" className="h-16 w-16 rounded-lg object-cover" />
                        <div className="flex-1">
                          <p className="text-lg font-medium">{index + 1}. {song.songName}</p>
                          <p className="opacity-80">{song.artist}</p>
                          <p className="text-sm opacity-70">
                            {song.album} • {song.genre} • {song.releaseYear}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {result && !imageResult && (
              <div className="mt-6 rounded-2xl border border-violet-300/25 bg-gradient-to-br from-violet-500/15 to-cyan-500/10 p-6">
                <h2 className="mb-4 text-xl font-medium text-white">Recognition Result</h2>
                <div className="space-y-2 text-white/90">
                  <p>
                    <strong>Song:</strong> {result.songName}
                  </p>
                  <p>
                    <strong>Artist:</strong> {result.artist}
                  </p>
                  <p>
                    <strong>Album:</strong> {result.album}
                  </p>
                </div>
              </div>
            )}

            <div className="mt-8 space-y-3">
              <h2 className="text-xl font-semibold">Songs</h2>
              {tracks.map((track) => (
                <TrackCard
                  key={track.id}
                  track={track}
                  playlists={playlists}
                  isFavorite={favoritesSet.has(track.id)}
                  onToggleFavorite={toggleFavorite}
                  onAddToPlaylist={addSongToPlaylist}
                  onCreatePlaylist={(name) => {
                    createPlaylist(name);
                  }}
                  onDeletePlaylist={deletePlaylist}
                  onPlayTrack={handlePlayTrack}
                />
              ))}
            </div>
          </section>

          {isLibraryOpen && <LibrarySidebar playlists={playlists} tracks={tracks} />}
        </div>
      </div>

      {showReviewModal && pendingImageResult && (
        <SongReviewModal
          songs={pendingImageResult.songs}
          onConfirm={handleConfirmSongs}
          onCancel={handleCancelReview}
        />
      )}
    </main>
  );
}
