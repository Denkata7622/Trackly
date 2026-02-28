export type PlaylistSong = {
  title: string;
  artist: string;
  album?: string;
  coverUrl?: string;
};

export type Playlist = {
  id: string;
  userId?: string;
  name: string;
  songs: PlaylistSong[];
  createdAt?: string;
  updatedAt?: string;
};

export type LibraryState = {
  favorites: string[];
  playlists: Playlist[];
};
