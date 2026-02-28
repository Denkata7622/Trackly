export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  bio: string;
  joinedAt: string;
  preferences: { theme: "light" | "dark"; notifications: boolean };
}

export interface SearchHistoryItem {
  id: string;
  timestamp: string;
  method: "audio-record" | "audio-file" | "album-image";
  result: { title: string; artist: string; album: string; coverUrl: string } | null;
  recognized: boolean;
}

export interface FavoriteSong {
  id: string;
  savedAt: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
}

export interface ManualSubmission {
  id: string;
  submittedAt: string;
  title: string;
  artist: string;
  album: string;
  status: "pending" | "approved" | "rejected";
}

export interface UserState {
  profile: UserProfile;
  searchHistory: SearchHistoryItem[];
  favorites: FavoriteSong[];
  manualSubmissions: ManualSubmission[];
}
