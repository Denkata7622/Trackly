"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import {
  recognizeFromAudio,
  recognizeFromImage,
  type AudioRecognitionResult,
  type ImageRecognitionResult,
  type SongMatch,
} from "../features/recognition/api";

type Toast = {
  id: string;
  kind: "success" | "error" | "info";
  message: string;
};

type HistoryEntry = {
  id: string;
  source: "audio" | "ocr";
  createdAt: string;
  song: SongMatch;
};

const IMAGE_MAX_MB = 10;
const IMAGE_MIME_WHITELIST = ["image/png", "image/jpeg", "image/webp"];
const HISTORY_KEY = "trackly-history";
const THEME_KEY = "trackly-theme";

export default function Home() {
  const [audioResult, setAudioResult] = useState<AudioRecognitionResult | null>(null);
  const [imageResult, setImageResult] = useState<ImageRecognitionResult | null>(null);
  const [maxSongs, setMaxSongs] = useState(10);
  const [ocrLanguage, setOcrLanguage] = useState("eng");
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historySearch, setHistorySearch] = useState("");
  const [onlyToday, setOnlyToday] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [progressVisible, setProgressVisible] = useState(false);

  const imageCache = useRef<Map<string, ImageRecognitionResult>>(new Map());
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isLoading = isLoadingAudio || isLoadingImage || isRecording;

  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
    }

    const savedHistory = localStorage.getItem(HISTORY_KEY);
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory) as HistoryEntry[]);
      } catch {
        setHistory([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 10)));
  }, [history]);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  function pushToast(kind: Toast["kind"], message: string) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, kind, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000);
  }

  function addToHistory(source: HistoryEntry["source"], songs: SongMatch[]) {
    const entries = songs.map((song, index) => ({
      id: `${Date.now()}-${source}-${index}-${song.songName}`,
      source,
      createdAt: new Date().toISOString(),
      song,
    }));

    setHistory((prev) => [...entries, ...prev].slice(0, 10));
  }

  async function recordAudioClip(durationMs: number): Promise<Blob> {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    return new Promise((resolve, reject) => {
      const chunks: Blob[] = [];
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) chunks.push(event.data);
      };

      mediaRecorder.onerror = () => reject(new Error("Audio capture failed."));

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        resolve(new Blob(chunks, { type: "audio/webm" }));
      };

      mediaRecorder.start();
      window.setTimeout(() => {
        if (mediaRecorder.state !== "inactive") mediaRecorder.stop();
      }, Math.min(durationMs, 10_000));
    });
  }

  async function handleRecognizeAudio() {
    if (isLoading) return;

    setErrorMessage(null);
    setGlobalError(null);
    setAudioResult(null);
    setImageResult(null);
    setProgressVisible(true);
    setIsLoadingAudio(true);

    try {
      setIsRecording(true);
      const audioBlob = await recordAudioClip(8_000);
      setIsRecording(false);

      const recognized = await recognizeFromAudio(audioBlob);
      setAudioResult(recognized);
      addToHistory("audio", [recognized.primaryMatch]);
      pushToast("success", `Recognized: ${recognized.primaryMatch.songName}`);
    } catch (error) {
      const message = (error as Error).message || "Could not recognize from audio.";
      setErrorMessage(message);
      if (message.toLowerCase().includes("failed") || message.toLowerCase().includes("network")) {
        setGlobalError("API unavailable. Please check backend connection.");
      }
      pushToast("error", "Audio recognition failed");
    } finally {
      setIsRecording(false);
      setIsLoadingAudio(false);
      setProgressVisible(false);
    }
  }

  function handleUploadPhotoClick() {
    if (isLoading) return;
    fileInputRef.current?.click();
  }

  function validateImage(file: File): string | null {
    if (!IMAGE_MIME_WHITELIST.includes(file.type)) {
      return "Unsupported file type. Use PNG, JPG, or WEBP.";
    }

    if (file.size > IMAGE_MAX_MB * 1024 * 1024) {
      return `File too large. Max ${IMAGE_MAX_MB}MB.`;
    }

    return null;
  }

  async function processImage(file: File) {
    const validationError = validateImage(file);
    if (validationError) {
      setErrorMessage(validationError);
      pushToast("error", validationError);
      return;
    }

    const cacheKey = `${file.name}-${file.size}-${maxSongs}-${ocrLanguage}`;

    setErrorMessage(null);
    setGlobalError(null);
    setAudioResult(null);
    setImageResult(null);
    setIsLoadingImage(true);
    setProgressVisible(true);

    try {
      if (imageCache.current.has(cacheKey)) {
        const cached = imageCache.current.get(cacheKey)!;
        setImageResult(cached);
        pushToast("info", "Loaded OCR results from cache");
        return;
      }

      const recognized = await recognizeFromImage(file, maxSongs, ocrLanguage);
      imageCache.current.set(cacheKey, recognized);
      setImageResult(recognized);
      addToHistory("ocr", recognized.songs);
      pushToast("success", `OCR completed: ${recognized.count} song(s) found`);
    } catch (error) {
      const message = (error as Error).message || "Could not recognize from photo.";
      setErrorMessage(message);
      if (message.toLowerCase().includes("failed") || message.toLowerCase().includes("network")) {
        setGlobalError("Backend offline or unreachable for OCR.");
      }
      pushToast("error", "Image OCR failed");
    } finally {
      setIsLoadingImage(false);
      setProgressVisible(false);
    }
  }

  async function handleImageSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    await processImage(file);
    event.target.value = "";
  }

  async function onDropImage(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragOver(false);
    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    await processImage(file);
  }

  function saveSong(song: SongMatch) {
    addToHistory("audio", [song]);
    pushToast("success", `${song.songName} saved to library`);
  }

  const filteredHistory = useMemo(() => {
    const query = historySearch.toLowerCase().trim();
    return history.filter((entry) => {
      const isToday = new Date(entry.createdAt).toDateString() === new Date().toDateString();
      const searchMatch =
        !query ||
        entry.song.artist.toLowerCase().includes(query) ||
        entry.song.songName.toLowerCase().includes(query);

      return (onlyToday ? isToday : true) && searchMatch;
    });
  }, [history, historySearch, onlyToday]);

  const pageStyle =
    theme === "dark"
      ? { background: "rgba(9,10,16,0.2)", color: "#f1f3ff" }
      : { background: "rgba(244,247,255,0.9)", color: "#0d1321" };

  return (
    <main className="min-h-screen" style={pageStyle}>
      {progressVisible && <div className="fixed left-0 top-0 z-40 h-[3px] w-full animate-pulse bg-violet-400" />}

      {globalError && (
        <div className="fixed left-0 right-0 top-0 z-50 bg-red-600 px-6 py-3 text-white shadow-lg">
          <div className="mx-auto flex max-w-5xl items-center justify-between">
            <p>{globalError}</p>
            <button onClick={() => setGlobalError(null)}>✕</button>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-4xl font-semibold">Trackly Recognition</h1>
          <button
            onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
            className="rounded-lg border border-white/20 px-3 py-2"
          >
            {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-white/15 p-4">
            <label htmlFor="maxSongsInput" className="mb-2 block text-sm">Max OCR songs</label>
            <input
              id="maxSongsInput"
              type="number"
              min={1}
              max={20}
              value={maxSongs}
              onChange={(event) => setMaxSongs(Math.min(20, Math.max(1, Number(event.target.value) || 1)))}
              className="w-28 rounded-md border border-white/20 bg-black/20 px-3 py-2"
            />
          </div>

          <div className="rounded-xl border border-white/15 p-4">
            <label htmlFor="ocrLanguage" className="mb-2 block text-sm">OCR language</label>
            <select
              id="ocrLanguage"
              value={ocrLanguage}
              onChange={(event) => setOcrLanguage(event.target.value)}
              className="rounded-md border border-white/20 bg-black/20 px-3 py-2"
            >
              <option value="eng">English</option>
              <option value="spa">Spanish</option>
              <option value="fra">French</option>
              <option value="deu">German</option>
              <option value="ita">Italian</option>
              <option value="por">Portuguese</option>
            </select>
          </div>

          <div className="rounded-xl border border-white/15 p-4 text-sm">
            Step flow: <strong>1)</strong> record/upload <strong>2)</strong> processing <strong>3)</strong> result card <strong>4)</strong> save.
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            id="recognizeAudioBtn"
            onClick={handleRecognizeAudio}
            disabled={isLoading}
            className="rounded-xl bg-violet-600 px-4 py-3 font-medium text-white transition active:scale-95 disabled:opacity-50"
          >
            {isLoadingAudio ? "Recognizing..." : "Recognize with microphone"}
          </button>

          <button
            id="uploadPhotoBtn"
            onClick={handleUploadPhotoClick}
            disabled={isLoading}
            className="rounded-xl border border-white/20 px-4 py-3 transition active:scale-95 disabled:opacity-50"
          >
            {isLoadingImage ? "Uploading photo..." : "Upload photo (OCR)"}
          </button>

          <button
            onClick={handleRecognizeAudio}
            disabled={isLoading}
            className="rounded-xl border border-white/20 px-4 py-3 transition active:scale-95 disabled:opacity-50"
          >
            Retry with noise filtering
          </button>
        </div>

        <div
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={onDropImage}
          onClick={handleUploadPhotoClick}
          className={`mt-5 cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition ${
            isDragOver ? "border-violet-400 bg-violet-500/10" : "border-white/25"
          }`}
        >
          <p className="text-lg">Drop image or click to upload</p>
          <p className="mt-2 text-sm opacity-70">PNG, JPG, WEBP up to {IMAGE_MAX_MB}MB</p>
        </div>

        <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleImageSelected} className="hidden" />

        {errorMessage && <p className="mt-2 text-sm text-red-400">⚠️ {errorMessage}</p>}

        {isRecording && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/55 backdrop-blur-sm">
            <div className="rounded-2xl border border-red-400/40 bg-black/60 px-10 py-8 text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-ping rounded-full bg-red-500" />
              <p className="text-lg">Listening…</p>
              <button
                onClick={() => setIsRecording(false)}
                className="mt-4 rounded-lg border border-white/25 px-4 py-2"
              >
                Stop
              </button>
            </div>
          </div>
        )}

        {audioResult && (
          <section className="mt-8 rounded-2xl border border-white/15 p-6">
            <div className="flex flex-col gap-4 sm:flex-row">
              <img src={audioResult.primaryMatch.albumArtUrl} alt="Album cover" className="h-28 w-28 rounded-xl object-cover" />
              <div>
                <h2 className="text-2xl font-semibold">{audioResult.primaryMatch.songName}</h2>
                <p className="text-lg opacity-85">{audioResult.primaryMatch.artist}</p>
                <p className="mt-2 text-sm opacity-80">
                  Confidence {Math.round(audioResult.primaryMatch.confidence * 100)}% • {audioResult.primaryMatch.genre} • {audioResult.primaryMatch.releaseYear} • {audioResult.primaryMatch.durationSec}s
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a className="rounded-lg border px-3 py-1" href={audioResult.primaryMatch.platformLinks.spotify} target="_blank" rel="noreferrer">Spotify</a>
                  <a className="rounded-lg border px-3 py-1" href={audioResult.primaryMatch.platformLinks.appleMusic} target="_blank" rel="noreferrer">Apple Music</a>
                  <a className="rounded-lg border px-3 py-1" href={audioResult.primaryMatch.platformLinks.youtubeMusic} target="_blank" rel="noreferrer">YouTube Music</a>
                  <button className="rounded-lg border px-3 py-1" onClick={() => saveSong(audioResult.primaryMatch)}>Save</button>
                </div>
              </div>
            </div>

            <h3 className="mt-5 text-sm uppercase tracking-wide opacity-70">Alternative matches</h3>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {audioResult.alternatives.map((song) => (
                <div key={song.songName} className="rounded-xl border border-white/10 p-3 text-sm">
                  {song.songName} — {song.artist} ({Math.round(song.confidence * 100)}%)
                </div>
              ))}
            </div>
          </section>
        )}

        {imageResult && (
          <section className="mt-8 rounded-2xl border border-white/15 p-6">
            <h2 className="text-xl font-semibold">OCR Results ({imageResult.count}) • language: {imageResult.language}</h2>
            <div className="mt-4 space-y-3">
              {imageResult.songs.map((song, index) => (
                <div key={`${song.songName}-${song.artist}-${index}`} className="rounded-xl border border-white/10 p-4">
                  <div className="flex items-start gap-3">
                    <img src={song.albumArtUrl} alt="Album cover" className="h-16 w-16 rounded-lg object-cover" />
                    <div>
                      <p className="text-lg font-medium">{index + 1}. {song.songName}</p>
                      <p className="opacity-80">{song.artist}</p>
                      <p className="text-sm opacity-70">{song.album} • {song.genre} • {song.releaseYear} • {Math.round(song.confidence * 100)}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mt-10 rounded-2xl border border-white/15 p-6">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-semibold">History</h2>
            <input
              value={historySearch}
              onChange={(event) => setHistorySearch(event.target.value)}
              placeholder="Search by artist or song"
              className="rounded-lg border border-white/20 bg-transparent px-3 py-2 text-sm"
            />
            <label className="text-sm">
              <input type="checkbox" checked={onlyToday} onChange={(event) => setOnlyToday(event.target.checked)} className="mr-2" />
              Today only
            </label>
            <button onClick={() => setHistory([])} className="rounded-lg border border-red-400/40 px-3 py-2 text-sm text-red-300">Clear</button>
          </div>

          {filteredHistory.length === 0 ? (
            <div className="rounded-xl border border-white/10 p-8 text-center opacity-70">
              <p className="text-lg">No songs recognized yet</p>
              <p className="text-sm">Start recognizing to build your history.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredHistory.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2 text-sm">
                  <span>{entry.song.songName} — {entry.song.artist}</span>
                  <div className="flex items-center gap-3">
                    <span className="opacity-60">{new Date(entry.createdAt).toLocaleString()}</span>
                    <button
                      onClick={() => setHistory((prev) => prev.filter((item) => item.id !== entry.id))}
                      className="text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="fixed bottom-4 right-4 z-50 flex w-[320px] flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`relative overflow-hidden rounded-xl border px-4 py-3 shadow-xl ${
              toast.kind === "success"
                ? "border-emerald-300/40 bg-emerald-500/15"
                : toast.kind === "error"
                ? "border-red-300/40 bg-red-500/15"
                : "border-sky-300/40 bg-sky-500/15"
            }`}
          >
            <button className="absolute right-2 top-2" onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}>✕</button>
            <p className="pr-6 text-sm">{toast.message}</p>
            <div className="absolute bottom-0 left-0 h-[2px] w-full animate-[shrink_4s_linear_forwards] bg-white/80" />
          </div>
        ))}
      </div>
    </main>
  );
}
