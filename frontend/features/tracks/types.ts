export type License = "FREE" | "COPYRIGHTED";

export type Track = {
  id: string;
  title: string;
  artistName: string;
  artistId: string;
  artworkUrl: string;
  license: License;
};
