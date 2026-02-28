"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { apiFetch } from "../lib/apiFetch";

type User = {
  id: string;
  username: string;
  email: string;
  avatarBase64?: string | null;
  bio?: string | null;
  createdAt: string;
};

type HistoryItem = {
  id: string;
  method?: string;
  title?: string;
  artist?: string;
  album?: string;
  coverUrl?: string;
  recognized?: boolean;
  createdAt?: string;
};

type FavoriteItem = {
  id: string;
  title: string;
  artist: string;
  album?: string | null;
  coverUrl?: string | null;
  savedAt?: string;
};

type UserContextValue = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  history: HistoryItem[];
  favorites: FavoriteItem[];
  register: (username: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (fields: Partial<Pick<User, "username" | "email" | "bio" | "avatarBase64">>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  addToHistory: (item: Record<string, unknown>) => Promise<void>;
  deleteHistoryItem: (id: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  addFavorite: (song: { title: string; artist: string; album?: string; coverUrl?: string }) => Promise<void>;
  removeFavorite: (id: string) => Promise<void>;
  shareSong: (song: { title: string; artist: string; album?: string; coverUrl?: string }) => Promise<string | null>;
};

const UserContext = createContext<UserContextValue | null>(null);

const TOKEN_KEY = "ponotii_token";
const GUEST_HISTORY_KEY = "ponotai-history";
const GUEST_FAVORITES_KEY = "ponotai.library.favorites";

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const initialToken = typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY);
  const [token, setToken] = useState<string | null>(initialToken);
  const [isLoading, setIsLoading] = useState(Boolean(initialToken));
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  const isAuthenticated = Boolean(token && user);

  async function fetchInitialData() {
    const [historyRes, favoritesRes] = await Promise.all([
      apiFetch("/api/history?limit=50"),
      apiFetch("/api/favorites"),
    ]);

    if (historyRes.ok) {
      const payload = (await historyRes.json()) as { items: HistoryItem[] };
      setHistory(payload.items || []);
    }

    if (favoritesRes.ok) {
      const payload = (await favoritesRes.json()) as { items: FavoriteItem[] };
      setFavorites(payload.items || []);
    }
  }

  useEffect(() => {
    if (!token) return;

    apiFetch("/api/auth/me")
      .then(async (res) => {
        if (!res.ok) throw new Error("UNAUTHORIZED");
        const me = (await res.json()) as User;
        setUser(me);
        await fetchInitialData();
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, [token]);

  async function handleAuthSuccess(payload: { token: string; user: User }) {
    localStorage.setItem(TOKEN_KEY, payload.token);
    setToken(payload.token);
    setUser(payload.user);
    await fetchInitialData();
  }

  async function register(username: string, email: string, password: string) {
    const res = await apiFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "REGISTER_FAILED");
    await handleAuthSuccess(data as { token: string; user: User });
  }

  async function login(email: string, password: string) {
    const res = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "LOGIN_FAILED");
    await handleAuthSuccess(data as { token: string; user: User });
  }

  async function logout() {
    await apiFetch("/api/auth/logout", { method: "POST" });
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setHistory([]);
    setFavorites([]);
  }

  async function updateProfile(fields: Partial<Pick<User, "username" | "email" | "bio" | "avatarBase64">>) {
    const res = await apiFetch("/api/auth/me", { method: "PATCH", body: JSON.stringify(fields) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "UPDATE_FAILED");
    setUser(data as User);
  }

  async function changePassword(currentPassword: string, newPassword: string) {
    const res = await apiFetch("/api/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "PASSWORD_CHANGE_FAILED");
    }
  }

  async function deleteAccount() {
    const res = await apiFetch("/api/auth/me", { method: "DELETE" });
    if (!res.ok) throw new Error("DELETE_ACCOUNT_FAILED");
    await logout();
  }

  async function addToHistory(item: Record<string, unknown>) {
    if (isAuthenticated) {
      const res = await apiFetch("/api/history", { method: "POST", body: JSON.stringify(item) });
      if (res.ok) {
        const created = (await res.json()) as HistoryItem;
        setHistory((prev) => [created, ...prev]);
      }
      return;
    }

    const current = JSON.parse(localStorage.getItem(GUEST_HISTORY_KEY) || "[]") as unknown[];
    localStorage.setItem(GUEST_HISTORY_KEY, JSON.stringify([item, ...current].slice(0, 50)));
  }

  async function deleteHistoryItem(id: string) {
    if (isAuthenticated) {
      await apiFetch(`/api/history/${id}`, { method: "DELETE" });
      setHistory((prev) => prev.filter((entry) => entry.id !== id));
      return;
    }
    const current = JSON.parse(localStorage.getItem(GUEST_HISTORY_KEY) || "[]") as Array<{ id?: string }>;
    localStorage.setItem(GUEST_HISTORY_KEY, JSON.stringify(current.filter((entry) => entry.id !== id)));
  }

  async function clearHistory() {
    if (isAuthenticated) {
      await apiFetch("/api/history", { method: "DELETE" });
      setHistory([]);
      return;
    }
    localStorage.removeItem(GUEST_HISTORY_KEY);
  }

  async function addFavorite(song: { title: string; artist: string; album?: string; coverUrl?: string }) {
    if (isAuthenticated) {
      const res = await apiFetch("/api/favorites", { method: "POST", body: JSON.stringify(song) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "FAVORITE_FAILED");
      setFavorites((prev) => [data as FavoriteItem, ...prev]);
      return;
    }
    const current = JSON.parse(localStorage.getItem(GUEST_FAVORITES_KEY) || "[]") as unknown[];
    localStorage.setItem(GUEST_FAVORITES_KEY, JSON.stringify([...current, song]));
  }

  async function removeFavorite(id: string) {
    if (isAuthenticated) {
      await apiFetch(`/api/favorites/${id}`, { method: "DELETE" });
      setFavorites((prev) => prev.filter((item) => item.id !== id));
      return;
    }
    const current = JSON.parse(localStorage.getItem(GUEST_FAVORITES_KEY) || "[]") as Array<{ id?: string }>;
    localStorage.setItem(GUEST_FAVORITES_KEY, JSON.stringify(current.filter((item) => item.id !== id)));
  }

  async function shareSong(song: { title: string; artist: string; album?: string; coverUrl?: string }) {
    if (!isAuthenticated) {
      alert("Sign in to share songs");
      return null;
    }
    const res = await apiFetch("/api/share", { method: "POST", body: JSON.stringify(song) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "SHARE_FAILED");
    return (data as { shareUrl: string }).shareUrl;
  }

  const value: UserContextValue = {
    user,
    token,
    isAuthenticated,
    isLoading,
    history,
    favorites,
    register,
    login,
    logout,
    updateProfile,
    changePassword,
    deleteAccount,
    addToHistory,
    deleteHistoryItem,
    clearHistory,
    addFavorite,
    removeFavorite,
    shareSong,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
}
