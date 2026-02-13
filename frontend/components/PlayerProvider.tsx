"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type QueueTrack = {
  id: string;
  title: string;
  artist: string;
  platform: "youtube";
  query: string;
};

type PlayerContextValue = {
  queue: QueueTrack[];
  currentTrack: QueueTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  addToQueue: (track: Omit<QueueTrack, "id" | "platform"> & { id?: string }) => void;
  togglePlayPause: () => void;
  skipNext: () => void;
  skipPrevious: () => void;
  seekToPercent: (percent: number) => void;
  setVolume: (volume: number) => void;
};

type YTPlayerLike = {
  playVideo: () => void;
  pauseVideo: () => void;
  getDuration: () => number;
  getCurrentTime: () => number;
  nextVideo: () => void;
  previousVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  setVolume: (value: number) => void;
};

type YouTubeWindow = Window & {
  YT?: {
    Player: new (elementId: string, options: Record<string, unknown>) => YTPlayerLike;
    PlayerState: {
      PLAYING: number;
      PAUSED: number;
      BUFFERING: number;
      ENDED: number;
      CUED: number;
    };
  };
  onYouTubeIframeAPIReady?: () => void;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<QueueTrack[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolumeState] = useState(70);
  const playerRef = useRef<YTPlayerLike | null>(null);

  const currentTrack = queue[activeIndex] ?? null;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ytWindow = window as YouTubeWindow;
    const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');

    const setupPlayer = () => {
      if (!ytWindow.YT || playerRef.current) return;

      playerRef.current = new ytWindow.YT.Player("trackly-hidden-yt-player", {
        width: "1",
        height: "1",
        playerVars: {
          autoplay: 0,
          controls: 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          enablejsapi: 1,
        },
        events: {
          onReady: () => {
            playerRef.current?.setVolume(volume);
          },
          onStateChange: (event: { data: number }) => {
            const state = ytWindow.YT?.PlayerState;
            if (!state) return;
            if (event.data === state.PLAYING) setIsPlaying(true);
            if (event.data === state.PAUSED || event.data === state.ENDED || event.data === state.CUED) {
              setIsPlaying(false);
            }
          },
        },
      });
    };

    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(script);
    }

    const previousHandler = ytWindow.onYouTubeIframeAPIReady;
    ytWindow.onYouTubeIframeAPIReady = () => {
      previousHandler?.();
      setupPlayer();
    };

    if (ytWindow.YT?.Player) setupPlayer();

    return () => {
      ytWindow.onYouTubeIframeAPIReady = previousHandler;
    };
  }, [volume]);

  useEffect(() => {
    if (!playerRef.current || !currentTrack) return;

    const playerFrame = document.getElementById("trackly-hidden-yt-player") as HTMLIFrameElement | null;
    if (playerFrame) {
      playerFrame.src = `https://www.youtube.com/embed?enablejsapi=1&autoplay=1&listType=search&list=${encodeURIComponent(
        currentTrack.query,
      )}`;
    }

    const startPlayback = window.setTimeout(() => {
      playerRef.current?.playVideo();
    }, 500);

    return () => window.clearTimeout(startPlayback);
  }, [currentTrack]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (!playerRef.current) return;
      setCurrentTime(playerRef.current.getCurrentTime() || 0);
      setDuration(playerRef.current.getDuration() || 0);
    }, 500);

    return () => window.clearInterval(interval);
  }, []);

  const addToQueue = useCallback((track: Omit<QueueTrack, "id" | "platform"> & { id?: string }) => {
    const queueTrack: QueueTrack = {
      id: track.id ?? `${track.title}-${track.artist}-${Date.now()}`,
      title: track.title,
      artist: track.artist,
      query: track.query,
      platform: "youtube",
    };

    setQueue((previousQueue) => {
      const nextQueue = [...previousQueue, queueTrack];
      if (nextQueue.length === 1) {
        setActiveIndex(0);
      } else {
        setActiveIndex(nextQueue.length - 1);
      }
      return nextQueue;
    });
  }, []);

  const togglePlayPause = useCallback(() => {
    if (!playerRef.current) return;

    if (isPlaying) {
      playerRef.current.pauseVideo();
      return;
    }
    playerRef.current.playVideo();
  }, [isPlaying]);

  const skipNext = useCallback(() => {
    setActiveIndex((prev) => {
      const nextIndex = prev + 1;
      if (nextIndex >= queue.length) {
        playerRef.current?.nextVideo();
        return prev;
      }
      return nextIndex;
    });
  }, [queue.length]);

  const skipPrevious = useCallback(() => {
    setActiveIndex((prev) => {
      if (prev === 0) {
        playerRef.current?.previousVideo();
        return prev;
      }
      return prev - 1;
    });
  }, []);

  const seekToPercent = useCallback(
    (percent: number) => {
      if (!playerRef.current || !duration) return;
      const seconds = (Math.max(0, Math.min(100, percent)) / 100) * duration;
      playerRef.current.seekTo(seconds, true);
      setCurrentTime(seconds);
    },
    [duration],
  );

  const setVolume = useCallback((nextVolume: number) => {
    const safeVolume = Math.max(0, Math.min(100, nextVolume));
    setVolumeState(safeVolume);
    playerRef.current?.setVolume(safeVolume);
  }, []);

  const value = useMemo(
    () => ({
      queue,
      currentTrack,
      isPlaying,
      currentTime,
      duration,
      volume,
      addToQueue,
      togglePlayPause,
      skipNext,
      skipPrevious,
      seekToPercent,
      setVolume,
    }),
    [queue, currentTrack, isPlaying, currentTime, duration, volume, addToQueue, togglePlayPause, skipNext, skipPrevious, seekToPercent, setVolume],
  );

  return (
    <PlayerContext.Provider value={value}>
      {children}
      <iframe
        id="trackly-hidden-yt-player"
        title="Trackly hidden YouTube player"
        className="pointer-events-none fixed bottom-0 right-0 h-px w-px opacity-0"
        allow="autoplay"
      />
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within PlayerProvider");
  }
  return context;
}
