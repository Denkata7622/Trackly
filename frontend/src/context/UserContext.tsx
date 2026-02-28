"use client";

import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";
import type { FavoriteSong, ManualSubmission, SearchHistoryItem, UserProfile, UserState } from "../types/user";

const USER_KEY = "ponotii_user";

const initialProfile: UserProfile = {
  id: "local-user",
  username: "Guest User",
  email: "guest@ponotii.local",
  avatarUrl: null,
  bio: "Music lover using Ponotii.",
  joinedAt: new Date().toISOString(),
  preferences: { theme: "dark", notifications: true },
};

const initialState: UserState = {
  profile: initialProfile,
  searchHistory: [],
  favorites: [],
  manualSubmissions: [],
};

type Action =
  | { type: "SET_PROFILE"; payload: Partial<UserProfile> }
  | { type: "SET_THEME"; payload: "light" | "dark" }
  | { type: "SET_NOTIFICATIONS"; payload: boolean }
  | { type: "ADD_HISTORY"; payload: SearchHistoryItem }
  | { type: "DELETE_HISTORY_ITEM"; payload: string }
  | { type: "CLEAR_HISTORY" }
  | { type: "ADD_FAVORITE"; payload: FavoriteSong }
  | { type: "REMOVE_FAVORITE"; payload: string }
  | { type: "ADD_MANUAL_SUBMISSION"; payload: ManualSubmission }
  | { type: "RESET_ALL" };

function reducer(state: UserState, action: Action): UserState {
  switch (action.type) {
    case "SET_PROFILE":
      return { ...state, profile: { ...state.profile, ...action.payload, preferences: state.profile.preferences } };
    case "SET_THEME":
      return { ...state, profile: { ...state.profile, preferences: { ...state.profile.preferences, theme: action.payload } } };
    case "SET_NOTIFICATIONS":
      return { ...state, profile: { ...state.profile, preferences: { ...state.profile.preferences, notifications: action.payload } } };
    case "ADD_HISTORY":
      return { ...state, searchHistory: [action.payload, ...state.searchHistory].slice(0, 300) };
    case "DELETE_HISTORY_ITEM":
      return { ...state, searchHistory: state.searchHistory.filter((item) => item.id !== action.payload) };
    case "CLEAR_HISTORY":
      return { ...state, searchHistory: [] };
    case "ADD_FAVORITE": {
      const exists = state.favorites.some((song) => song.id === action.payload.id);
      return exists ? state : { ...state, favorites: [action.payload, ...state.favorites] };
    }
    case "REMOVE_FAVORITE":
      return { ...state, favorites: state.favorites.filter((song) => song.id !== action.payload) };
    case "ADD_MANUAL_SUBMISSION":
      return { ...state, manualSubmissions: [action.payload, ...state.manualSubmissions] };
    case "RESET_ALL":
      return initialState;
    default:
      return state;
  }
}

function loadState(): UserState {
  if (typeof window === "undefined") return initialState;
  try {
    const raw = window.localStorage.getItem(USER_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw) as UserState;
    return {
      ...initialState,
      ...parsed,
      profile: {
        ...initialProfile,
        ...parsed.profile,
        preferences: {
          ...initialProfile.preferences,
          ...parsed.profile?.preferences,
        },
      },
    };
  } catch {
    return initialState;
  }
}

type UserContextValue = {
  state: UserState;
  setProfile: (payload: Partial<UserProfile>) => void;
  setTheme: (theme: "light" | "dark") => void;
  setNotifications: (enabled: boolean) => void;
  addHistory: (item: SearchHistoryItem) => void;
  deleteHistoryItem: (id: string) => void;
  clearHistory: () => void;
  addFavorite: (song: FavoriteSong) => void;
  removeFavorite: (id: string) => void;
  addManualSubmission: (submission: ManualSubmission) => void;
  deleteAccount: () => void;
};

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState, loadState);

  useEffect(() => {
    window.localStorage.setItem(USER_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", state.profile.preferences.theme === "dark");
  }, [state.profile.preferences.theme]);

  const value = useMemo<UserContextValue>(
    () => ({
      state,
      setProfile: (payload) => dispatch({ type: "SET_PROFILE", payload }),
      setTheme: (theme) => dispatch({ type: "SET_THEME", payload: theme }),
      setNotifications: (enabled) => dispatch({ type: "SET_NOTIFICATIONS", payload: enabled }),
      addHistory: (item) => dispatch({ type: "ADD_HISTORY", payload: item }),
      deleteHistoryItem: (id) => dispatch({ type: "DELETE_HISTORY_ITEM", payload: id }),
      clearHistory: () => dispatch({ type: "CLEAR_HISTORY" }),
      addFavorite: (song) => dispatch({ type: "ADD_FAVORITE", payload: song }),
      removeFavorite: (id) => dispatch({ type: "REMOVE_FAVORITE", payload: id }),
      addManualSubmission: (submission) => dispatch({ type: "ADD_MANUAL_SUBMISSION", payload: submission }),
      deleteAccount: () => {
        window.localStorage.clear();
        dispatch({ type: "RESET_ALL" });
      },
    }),
    [state],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
}
