"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import BottomPlayBar from "./BottomPlayBar";
import { PlayerProvider } from "./PlayerProvider";
import type { Playlist } from "../features/library/types";
import { scopedKey, useProfile } from "../lib/ProfileContext";
import { useLanguage } from "../lib/LanguageContext";
import { t } from "../lib/translations";
import { Button } from "../src/components/ui/Button";
import { Input } from "../src/components/ui/Input";
import { Card } from "../src/components/ui/Card";

type HistoryItem = {
  id: string;
  createdAt?: string;
  song?: { songName?: string; artist?: string };
};

type LibrarySnapshot = {
  favorites: string[];
  playlists: Playlist[];
};

const PRIMARY_NAV = [
  { href: "/", key: "nav_listen", icon: "🎧" },
  { href: "/library", key: "nav_library", icon: "📚" },
  { href: "/search", key: "nav_search", icon: "🔍" },
  { href: "/profile", key: "nav_profile", icon: "👤" },
  { href: "/settings", key: "nav_settings", icon: "⚙️" },
] as const;

const SECONDARY_NAV = [
  { href: "/about", key: "nav_about", icon: "ℹ️" },
  { href: "/how-to-use", key: "nav_how_to_use", icon: "❓" },
  { href: "/settings#profile", key: "nav_profile", icon: "👤" },
] as const;

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { language } = useLanguage();
  const { profile, profiles, switchProfile, createProfile, deleteProfile } = useProfile();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [recentHistory, setRecentHistory] = useState<HistoryItem[]>([]);
  const [librarySnapshot, setLibrarySnapshot] = useState<LibrarySnapshot>({ favorites: [], playlists: [] });
  const [newProfileName, setNewProfileName] = useState("");

  useEffect(() => {
    function syncSidebarData() {
      try {
        const historyRaw = window.localStorage.getItem(scopedKey("ponotai-history", profile.id));
        const libraryRaw = window.localStorage.getItem(scopedKey("ponotai.library.playlists", profile.id));
        const favoritesRaw = window.localStorage.getItem(scopedKey("ponotai.library.favorites", profile.id));
        const history = historyRaw ? (JSON.parse(historyRaw) as HistoryItem[]) : [];
        const playlists = libraryRaw ? (JSON.parse(libraryRaw) as Playlist[]) : [];
        const favorites = favoritesRaw ? (JSON.parse(favoritesRaw) as string[]) : [];
        setRecentHistory(history.slice(0, 5));
        setLibrarySnapshot({ favorites, playlists });
      } catch {
        setRecentHistory([]);
        setLibrarySnapshot({ favorites: [], playlists: [] });
      }
    }

    syncSidebarData();
    window.addEventListener("storage", syncSidebarData);
    return () => window.removeEventListener("storage", syncSidebarData);
  }, [pathname, profile.id]);

  const recognizedToday = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return recentHistory.filter((item) => item.createdAt?.startsWith(today)).length;
  }, [recentHistory]);

  return (
    <PlayerProvider>
      <div className="flex min-h-screen">
        <aside className={`hidden p-4 backdrop-blur-xl transition-all md:block ${isCollapsed ? "w-20" : "w-72"}`} style={{ background: "var(--sidebar-bg)", borderRight: "1px solid var(--border)" }}>
          <div className="mb-8 mt-2 flex items-center justify-between">
            <Link href="/" className="block select-none">
              <h1 className="logoWrapper flex items-center gap-2">
                <span className="logoDot"></span>
                {!isCollapsed && <span className="logoText">{language === "bg" ? "ПонотИИ" : "PonotAI"}</span>}
              </h1>
            </Link>
            <Button variant="ghost" size="sm" className="navItem !p-2" onClick={() => setIsCollapsed((prev) => !prev)}>{isCollapsed ? "»" : "«"}</Button>
          </div>

          {!isCollapsed && (
            <Card className="mb-4 p-3 text-xs">
              <p className="text-[var(--muted)]">{language === "bg" ? "Профил" : "Profile"}</p>
              <div className="mt-2 flex gap-2">
                <select className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--input-bg)] px-2 py-1" value={profile.id} onChange={(e) => switchProfile(e.target.value)}>
                  {profiles.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <Link className="rounded-lg border border-[var(--border)] bg-[var(--input-bg)] px-2 py-1" href="/settings#profile">⚙️</Link>
              </div>
              <p className="mt-1 truncate text-[11px] text-[var(--muted)]">{profile.email || (language === "bg" ? "Няма имейл" : "No email")}</p>
              <div className="mt-2 flex gap-2">
                <Input className="flex-1 py-1" placeholder={language === "bg" ? "Нов профил" : "New profile"} value={newProfileName} onChange={(e) => setNewProfileName(e.target.value)} />
                <Button variant="secondary" size="sm" onClick={() => { createProfile(newProfileName); setNewProfileName(""); }}>+</Button>
                <Button
                  variant="danger"
                  size="sm"
                  className="disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={profiles.length <= 1}
                  onClick={() => deleteProfile(profile.id)}
                  title={language === "bg" ? "Изтрий активния профил" : "Delete active profile"}
                >
                  🗑
                </Button>
              </div>
            </Card>
          )}

          <nav className="flex flex-col gap-2 text-base">
            {PRIMARY_NAV.map((item) => (
              <Link key={item.href} className={pathname === item.href ? "navItemActive" : "navItem"} href={item.href}>
                <span>{item.icon}</span>
                {!isCollapsed && <span>{t(item.key, language)}</span>}
              </Link>
            ))}
          </nav>

          {!isCollapsed && pathname === "/" && (
            <div className="mt-6 space-y-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-xs">
              <h3 className="text-sm font-semibold text-[var(--text)]">{t("sidebar_recent_history", language)}</h3>
              <ul className="space-y-1 text-[var(--muted)]">
                {recentHistory.length === 0 && <li>{t("history_empty", language)}</li>}
                {recentHistory.map((item) => (
                  <li key={item.id} className="truncate">• {item.song?.songName ?? "-"} — {item.song?.artist ?? "-"}</li>
                ))}
              </ul>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--input-bg)] p-2 text-[var(--muted)]">
                <div>{t("sidebar_total_recognized", language)}: {recentHistory.length}</div>
                <div>{t("sidebar_today_count", language)}: {recognizedToday}</div>
                <div>{t("library_favorites", language)}: {librarySnapshot.favorites.length}</div>
              </div>
            </div>
          )}

          {!isCollapsed && pathname === "/library" && (
            <div className="mt-6 space-y-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-xs text-[var(--muted)]">
              <h3 className="text-sm font-semibold text-[var(--text)]">{t("library_playlists", language)}</h3>
              {librarySnapshot.playlists.map((playlist) => (
                <p key={playlist.id}>• {playlist.name} ({playlist.songIds.length})</p>
              ))}
              {librarySnapshot.playlists.length === 0 && <p>{t("no_playlists_created", language)}</p>}
            </div>
          )}

          <div className="mt-6 border-t border-[var(--border)] pt-4">
            <nav className="flex flex-col gap-2 text-sm">
              {SECONDARY_NAV.map((item) => (
                <Link key={item.href} className={pathname === item.href ? "navItemActive" : "navItem"} href={item.href}>
                  <span>{item.icon}</span>
                  {!isCollapsed && <span>{t(item.key, language)}</span>}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        <main className="flex-1 px-4 pb-36 pt-6 sm:px-8 sm:pt-8">{children}</main>
      </div>
      <BottomPlayBar />
    </PlayerProvider>
  );
}
