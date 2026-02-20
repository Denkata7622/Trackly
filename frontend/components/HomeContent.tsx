"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import HeroSection from "./HeroSection";
import ResultCard from "./ResultCard";
import HistoryGrid from "./HistoryGrid";
import UploadModal from "./UploadModal";
import LibrarySidebar from "./LibrarySidebar";
import TrackCard from "./TrackCard";
import SongReviewModal from "./SongReviewModal";
import { usePlayer } from "./PlayerProvider";
import { useLibrary } from "../features/library/useLibrary";
import {
  recognizeFromAudio,
  recognizeFromImage,
  type AudioRecognitionResult,
  type ImageRecognitionResult,
  type SongMatch,
  type SongRecognitionResult,
} from "../features/recognition/api";
import { recentTracksSeed } from "../features/tracks/seed";
import type { Track } from "../features/tracks/types";
import { useLanguage } from "../lib/LanguageContext";
import { useTheme } from "../lib/ThemeContext";
import { t } from "../lib/translations";

type Toast = { id: string; kind: "success" | "error" | "info"; message: string };
type HistoryEntry = { id: string; source: "audio" | "ocr"; createdAt: string; song: SongMatch };

const IMAGE_MAX_MB = 10;
const IMAGE_MIME_WHITELIST = ["image/png", "image/jpeg", "image/webp"];
const HISTORY_KEY = "ponotai-history";
const MAX_SONGS_KEY = "ponotai.settings.maxSongs";
const OCR_LANGUAGE_KEY = "ponotai.settings.ocrLanguage";

function songMatchToRecognitionResult(match: SongMatch, source: "audio" | "image"): SongRecognitionResult {
  return { ...match, source };
}

function toRecognizedTrack(result: SongRecognitionResult): Track {
  return {
    id: `recognized-${result.songName}-${result.artist}`.toLowerCase().replace(/\s+/g, "-"),
    title: result.songName,
    artistName: result.artist,
    artistId: `artist-${result.artist}`.toLowerCase().replace(/\s+/g, "-"),
    artworkUrl: result.albumArtUrl || "https://picsum.photos/seed/recognized/80",
    license: "COPYRIGHTED",
  };
}

export function HomeContent() {
  const [audioResult, setAudioResult] = useState<AudioRecognitionResult | null>(null);
  const [imageResult, setImageResult] = useState<ImageRecognitionResult | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [pendingImageResult, setPendingImageResult] = useState<ImageRecognitionResult | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [maxSongs, setMaxSongs] = useState(10);
  const [ocrLanguage, setOcrLanguage] = useState("eng");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);

  const imageCache = useRef<Map<string, ImageRecognitionResult>>(new Map());

  const { addToQueue } = usePlayer();
  const { language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { playlists, favoritesSet, toggleFavorite, createPlaylist, deletePlaylist, addSongToPlaylist, removeSongFromPlaylist } = useLibrary();

  const latestResult: SongRecognitionResult | null = useMemo(() => {
    if (audioResult) return songMatchToRecognitionResult(audioResult.primaryMatch, "audio");
    if (imageResult?.songs[0]) return songMatchToRecognitionResult(imageResult.songs[0], "image");
    return null;
  }, [audioResult, imageResult]);

  const tracks = useMemo(() => {
    const recognizedTrack = latestResult ? [toRecognizedTrack(latestResult)] : [];
    const uniqueTracks = new Map<string, Track>();
    [...recognizedTrack, ...recentTracksSeed].forEach((track) => uniqueTracks.set(track.id, track));
    return [...uniqueTracks.values()];
  }, [latestResult]);

  useEffect(() => {
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
    const storedMaxSongs = Number(localStorage.getItem(MAX_SONGS_KEY) ?? 10);
    const storedOcrLanguage = localStorage.getItem(OCR_LANGUAGE_KEY) ?? "eng";
    setMaxSongs(Math.min(20, Math.max(1, storedMaxSongs || 10)));
    setOcrLanguage(storedOcrLanguage);
  }, []);

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 18)));
  }, [history]);

  useEffect(() => {
    localStorage.setItem(MAX_SONGS_KEY, String(maxSongs));
  }, [maxSongs]);

  useEffect(() => {
    localStorage.setItem(OCR_LANGUAGE_KEY, ocrLanguage);
  }, [ocrLanguage]);

  function pushToast(kind: Toast["kind"], message: string) {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, kind, message }]);
    window.setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }

  function addToHistory(source: HistoryEntry["source"], songs: SongMatch[]) {
    const createdAt = new Date().toISOString();
    const entries = songs.map((song) => ({ id: crypto.randomUUID(), source, createdAt, song }));
    setHistory((prev) => [...entries, ...prev].slice(0, 18));
  }

  async function recordAudioClip(durationMs: number): Promise<Blob> {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    return new Promise((resolve, reject) => {
      const chunks: Blob[] = [];
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorder.ondataavailable = (event: BlobEvent) => event.data.size > 0 && chunks.push(event.data);
      mediaRecorder.onerror = () => reject(new Error(t("error_audio_capture_failed", language)));
      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        resolve(new Blob(chunks, { type: "audio/webm" }));
      };
      mediaRecorder.start();
      window.setTimeout(() => mediaRecorder.state !== "inactive" && mediaRecorder.stop(), Math.min(durationMs, 10_000));
    });
  }

  async function handleRecognizeAudio() {
    if (isLoadingAudio || isLoadingImage) return;
    setErrorMessage(null);
    setIsLoadingAudio(true);
    setIsRecording(true);
    try {
      const audioBlob = await recordAudioClip(8_000);
      setIsRecording(false);
      const recognized = await recognizeFromAudio(audioBlob);
      setAudioResult(recognized);
      setImageResult(null);
      addToHistory("audio", [recognized.primaryMatch]);
      pushToast("success", t("toast_recognized", language, { song: recognized.primaryMatch.songName }));
    } catch (error) {
      setErrorMessage((error as Error).message || t("toast_audio_failed", language));
      pushToast("error", t("toast_audio_failed", language));
    } finally {
      setIsRecording(false);
      setIsLoadingAudio(false);
    }
  }

  function validateImage(file: File): string | null {
    if (!IMAGE_MIME_WHITELIST.includes(file.type)) return t("toast_unsupported_type", language);
    if (file.size > IMAGE_MAX_MB * 1024 * 1024) return t("toast_file_too_large", language, { max: IMAGE_MAX_MB });
    return null;
  }

  function handleSelectUploadFile(file: File) {
    const validationError = validateImage(file);
    if (validationError) {
      setErrorMessage(validationError);
      pushToast("error", validationError);
      return;
    }
    setUploadFile(file);
    setUploadPreview(URL.createObjectURL(file));
    setErrorMessage(null);
  }

  async function handleSubmitUpload() {
    if (!uploadFile) return;
    setIsLoadingImage(true);
    try {
      const cacheKey = `${uploadFile.name}-${uploadFile.size}-${maxSongs}-${ocrLanguage}`;
      if (imageCache.current.has(cacheKey)) {
        const cachedResult = imageCache.current.get(cacheKey)!;
        setPendingImageResult(cachedResult);
        setShowReviewModal(true);
        setIsUploadOpen(false);
        pushToast("info", t("toast_cache_loaded", language));
        return;
      }

      const recognized = await recognizeFromImage(uploadFile, maxSongs, ocrLanguage);
      imageCache.current.set(cacheKey, recognized);
      setPendingImageResult(recognized);
      setShowReviewModal(true);
      setIsUploadOpen(false);
      pushToast("info", t("toast_found_review", language, { count: recognized.count }));
    } catch (error) {
      setErrorMessage((error as Error).message || t("error_recognition_failed", language));
      pushToast("error", t("toast_image_failed", language));
    } finally {
      setIsLoadingImage(false);
    }
  }

  function handleConfirmSongs(selectedSongs: SongMatch[]) {
    if (!pendingImageResult) return;
    const updatedResult = { ...pendingImageResult, songs: selectedSongs, count: selectedSongs.length };
    setImageResult(updatedResult);
    setAudioResult(null);
    addToHistory("ocr", selectedSongs);
    setShowReviewModal(false);
    setPendingImageResult(null);
    pushToast("success", t("toast_added", language, { count: selectedSongs.length }));
  }

  function saveSong(song: SongMatch) {
    addToHistory("audio", [song]);
    pushToast("success", t("toast_saved", language, { song: song.songName }));
  }

  function playSong(song: SongMatch) {
    addToQueue({
      title: song.songName,
      artist: song.artist,
      query: `${song.songName} ${song.artist} official audio`,
      videoId: song.youtubeVideoId ?? song.platformLinks.youtube,
    });
  }

  return (
    <main className="min-h-screen transition-colors">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <HeroSection
              language={language}
              isListening={isRecording || isLoadingAudio}
              onRecognize={handleRecognizeAudio}
              onOpenUpload={() => setIsUploadOpen(true)}
              onToggleLanguage={() => setLanguage(language === "en" ? "bg" : "en")}
              onToggleTheme={toggleTheme}
              onToggleLibrary={() => setIsLibraryOpen((prev) => !prev)}
              isLibraryOpen={isLibraryOpen}
              theme={theme}
            />

            <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <h3 className="mb-4 text-lg font-semibold">{t("settings_title", language)}</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm">
                  <span className="mb-1 block text-white/70">{t("stats_max_ocr_songs", language)}</span>
                  <input type="number" min={1} max={20} value={maxSongs} onChange={(e) => setMaxSongs(Math.min(20, Math.max(1, Number(e.target.value) || 1)))} className="w-full rounded-xl border border-white/15 bg-black/20 px-3 py-2 focus:border-violet-300 focus:outline-none" />
                </label>
                <label className="text-sm">
                  <span className="mb-1 block text-white/70">{t("stats_ocr_language", language)}</span>
                  <select value={ocrLanguage} onChange={(e) => setOcrLanguage(e.target.value)} className="w-full rounded-xl border border-white/15 bg-black/20 px-3 py-2 focus:border-violet-300 focus:outline-none">
                    <option value="eng">{t("ocr_lang_english", language)}</option>
                    <option value="spa">{t("ocr_lang_spanish", language)}</option>
                    <option value="fra">{t("ocr_lang_french", language)}</option>
                    <option value="deu">{t("ocr_lang_german", language)}</option>
                    <option value="ita">{t("ocr_lang_italian", language)}</option>
                    <option value="por">{t("ocr_lang_portuguese", language)}</option>
                  </select>
                </label>
              </div>
            </section>

            {errorMessage && <p className="rounded-2xl border border-red-300/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{errorMessage}</p>}

            <ResultCard language={language} song={latestResult} onSave={saveSong} onPlay={playSong} />

            <HistoryGrid language={language} items={history} onDelete={(id) => setHistory((prev) => prev.filter((entry) => entry.id !== id))} />

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">{t("songs_heading", language)}</h2>
              {tracks.map((track) => (
                <TrackCard
                  key={track.id}
                  track={track}
                  playlists={playlists}
                  isFavorite={favoritesSet.has(track.id)}
                  onToggleFavorite={toggleFavorite}
                  onAddToPlaylist={addSongToPlaylist}
                  onCreatePlaylist={createPlaylist}
                  onDeletePlaylist={deletePlaylist}
                  onRemoveFromPlaylist={removeSongFromPlaylist}
                  onPlay={(currentTrack) =>
                    addToQueue({
                      title: currentTrack.title,
                      artist: currentTrack.artistName,
                      query: `${currentTrack.title} ${currentTrack.artistName} official audio`,
                      videoId: currentTrack.youtubeVideoId,
                    })
                  }
                />
              ))}
            </section>
          </div>

          {isLibraryOpen && <LibrarySidebar playlists={playlists} tracks={tracks} favoritesSet={favoritesSet} />}
        </div>
      </div>

      <UploadModal
        language={language}
        open={isUploadOpen}
        previewUrl={uploadPreview}
        onClose={() => setIsUploadOpen(false)}
        onSelectFile={handleSelectUploadFile}
        onSubmit={handleSubmitUpload}
        disabled={isLoadingImage}
      />

      {showReviewModal && pendingImageResult && (
        <SongReviewModal
          songs={pendingImageResult.songs}
          onConfirm={handleConfirmSongs}
          onCancel={() => {
            setShowReviewModal(false);
            setPendingImageResult(null);
          }}
        />
      )}

      <div className="fixed bottom-4 right-4 z-50 flex w-[320px] flex-col gap-3">
        {toasts.map((toast) => (
          <div key={toast.id} className={`rounded-xl border px-4 py-3 shadow-xl ${toast.kind === "success" ? "border-emerald-300/40 bg-emerald-500/15" : toast.kind === "error" ? "border-red-300/40 bg-red-500/15" : "border-sky-300/40 bg-sky-500/15"}`}>
            <p className="text-sm">{toast.message}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
