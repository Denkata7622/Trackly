"use client";

import { useMemo, useRef, useState, type ChangeEvent } from "react";
import LibrarySidebar from "../components/LibrarySidebar";
import TrackCard from "../components/TrackCard";
import { useLibrary } from "../features/library/useLibrary";
import { recognizeFromAudio, recognizeFromImage, type SongRecognitionResult } from "../features/recognition/api";
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

export default function Home() {
  const [result, setResult] = useState<SongRecognitionResult | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { addToQueue } = usePlayer();

  const { playlists, favoritesSet, toggleFavorite, createPlaylist, deletePlaylist, addSongToPlaylist } =
    useLibrary();

  const tracks = useMemo(() => {
    const recognizedTrack = result ? [toRecognizedTrack(result)] : [];
    const uniqueTracks = new Map<string, Track>();

    [...recognizedTrack, ...recentTracksSeed].forEach((track) => {
      uniqueTracks.set(track.id, track);
    });

    return [...uniqueTracks.values()];
  }, [result]);

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


  function handlePlayRecognizedSong() {
    if (!result) return;

    addToQueue({
      title: result.songName,
      artist: result.artist,
      query: `${result.songName} ${result.artist} official audio`,
    });
  }

  async function handleRecognizeAudio() {
    if (isLoadingAudio || isLoadingImage) return;

    setErrorMessage(null);
    setResult(null);
    setIsLoadingAudio(true);

    try {
      const audioBlob = await recordAudioClip(6000);
      const recognized = await recognizeFromAudio(audioBlob);
      setResult(recognized);
    } catch (error) {
      setErrorMessage((error as Error).message || "Could not recognize from audio.");
    } finally {
      setIsLoadingAudio(false);
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
    setIsLoadingImage(true);

    try {
      const recognized = await recognizeFromImage(file);
      setResult(recognized);
    } catch (error) {
      setErrorMessage((error as Error).message || "Could not recognize from photo.");
    } finally {
      setIsLoadingImage(false);
      event.target.value = "";
    }
  }

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-4xl font-semibold text-white">Trackly Recognition</h1>
          <button
            type="button"
            className="rounded border border-white/20 px-3 py-2 text-sm hover:bg-white/10"
            onClick={() => setIsLibraryOpen((prev) => !prev)}
          >
            {isLibraryOpen ? "Hide Library" : "Show Library"}
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <section>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                id="recognizeAudioBtn"
                onClick={handleRecognizeAudio}
                disabled={isLoadingAudio || isLoadingImage}
                className="primaryBtn"
              >
                {isLoadingAudio ? "Listening and recognizing..." : "Recognize with microphone"}
              </button>

              <button
                id="uploadPhotoBtn"
                onClick={handleUploadPhotoClick}
                disabled={isLoadingAudio || isLoadingImage}
                className="secondaryBtn"
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
              <p className="mt-4 text-sm text-white/70">Processing request, please wait...</p>
            )}

            {errorMessage && <p className="mt-4 text-sm text-red-300">{errorMessage}</p>}

            {result && (
              <div className="mt-8 rounded-xl border border-white/15 bg-white/5 p-6">
                <h2 className="mb-4 text-xl font-medium text-white">Recognition Result</h2>
                <p className="text-white/90">
                  <strong>Song:</strong> {result.songName}
                </p>
                <p className="mt-2 text-white/90">
                  <strong>Artist:</strong> {result.artist}
                </p>
                <p className="mt-2 text-white/90">
                  <strong>Album:</strong> {result.album}
                </p>
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
                />
              ))}
            </div>
          </section>

          {isLibraryOpen && <LibrarySidebar playlists={playlists} tracks={tracks} />}
        </div>
      </div>
    </main>
  );
}
