export type ProviderSongMetadata = {
  songName: string;
  artist: string;
  album: string;
  genre: string;
  platformLinks: {
    appleMusic?: string;
    preview?: string;
  };
  releaseYear: number | null;
};

type ITunesTrack = {
  trackName?: string;
  artistName?: string;
  collectionName?: string;
  primaryGenreName?: string;
  trackViewUrl?: string;
  previewUrl?: string;
  releaseDate?: string;
};

type ITunesSearchResponse = {
  resultCount: number;
  results: ITunesTrack[];
};

function getReleaseYear(releaseDate?: string): number | null {
  if (!releaseDate) {
    return null;
  }

  const parsed = new Date(releaseDate);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.getUTCFullYear();
}

export async function lookupSongByTitleAndArtist(
  title: string,
  artist: string,
): Promise<ProviderSongMetadata | null> {
  const term = [title, artist].filter(Boolean).join(" ").trim();
  if (!term) {
    return null;
  }

  const url = `https://itunes.apple.com/search?media=music&entity=song&limit=1&term=${encodeURIComponent(term)}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as ITunesSearchResponse;
    const topResult = payload.results?.[0];

    if (!topResult?.trackName || !topResult.artistName) {
      return null;
    }

    return {
      songName: topResult.trackName,
      artist: topResult.artistName,
      album: topResult.collectionName || "Unknown Album",
      genre: topResult.primaryGenreName || "Unknown Genre",
      platformLinks: {
        appleMusic: topResult.trackViewUrl,
        preview: topResult.previewUrl,
      },
      releaseYear: getReleaseYear(topResult.releaseDate),
    };
  } catch {
    return null;
  }
}
