export type Playlist = {
  id: string;
  name: string;
  songIds: string[];
};

export type LibraryState = {
  favorites: string[];
  playlists: Playlist[];
};
