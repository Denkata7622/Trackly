export type OcrCandidateMetadata = {
  songName: string;
  artist: string;
  album: string;
};

export function parseOcrCandidateText(text: string, fallbackAlbum = "Unknown Album"): OcrCandidateMetadata | null {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const labeled = {
    songName: "",
    artist: "",
    album: "",
  };

  for (const line of lines) {
    const songMatch = line.match(/^(song|title|track)\s*[:\-]\s*(.+)$/i);
    if (songMatch?.[2]) {
      labeled.songName = songMatch[2].trim();
      continue;
    }

    const artistMatch = line.match(/^(artist|singer|by)\s*[:\-]\s*(.+)$/i);
    if (artistMatch?.[2]) {
      labeled.artist = artistMatch[2].trim();
      continue;
    }

    const albumMatch = line.match(/^(album)\s*[:\-]\s*(.+)$/i);
    if (albumMatch?.[2]) {
      labeled.album = albumMatch[2].trim();
    }
  }

  if (labeled.songName && labeled.artist) {
    return {
      songName: labeled.songName,
      artist: labeled.artist,
      album: labeled.album || fallbackAlbum,
    };
  }

  for (const line of lines) {
    const byPattern = line.match(/^(.+?)\s+by\s+(.+)$/i);
    if (byPattern?.[1] && byPattern?.[2]) {
      return {
        songName: byPattern[1].trim(),
        artist: byPattern[2].trim(),
        album: fallbackAlbum,
      };
    }

    const dashPattern = line.match(/^(.+?)\s[-–—]\s(.+)$/);
    if (dashPattern?.[1] && dashPattern?.[2]) {
      return {
        songName: dashPattern[2].trim(),
        artist: dashPattern[1].trim(),
        album: fallbackAlbum,
      };
    }
  }

  return null;
}
