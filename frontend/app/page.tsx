"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { recognizeFromAudio, recognizeFromImage, type SongRecognitionResult } from "../features/recognition/api";

export default function Home() {
  const [result, setResult] = useState<SongRecognitionResult | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-4xl font-semibold text-white mb-6">Trackly Recognition</h1>

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
          <div className="mt-8 rounded-xl border border-white/15 p-6 bg-white/5">
            <h2 className="text-xl font-medium text-white mb-4">Recognition Result</h2>
            <p className="text-white/90">
              <strong>Song:</strong> {result.songName}
            </p>
            <p className="text-white/90 mt-2">
              <strong>Artist:</strong> {result.artist}
            </p>
            <p className="text-white/90 mt-2">
              <strong>Album:</strong> {result.album}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
