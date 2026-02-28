"use client";

import { useMemo, useRef, useState } from "react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";
import { useUser } from "../context/UserContext";
import type { SearchHistoryItem } from "../types/user";

function formatDate(dateIso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateIso));
}

export default function ProfilePage() {
  const { state, setProfile, clearHistory, deleteHistoryItem, removeFavorite } = useUser();
  const [editMode, setEditMode] = useState(false);
  const [draftName, setDraftName] = useState(state.profile.username);
  const [draftBio, setDraftBio] = useState(state.profile.bio);
  const [historyFilter, setHistoryFilter] = useState<"all" | "recognized" | "unrecognized" | SearchHistoryItem["method"]>("all");
  const [confirmClear, setConfirmClear] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const filteredHistory = useMemo(() => {
    if (historyFilter === "all") return state.searchHistory;
    if (historyFilter === "recognized") return state.searchHistory.filter((item) => item.recognized);
    if (historyFilter === "unrecognized") return state.searchHistory.filter((item) => !item.recognized);
    return state.searchHistory.filter((item) => item.method === historyFilter);
  }, [historyFilter, state.searchHistory]);

  const stats = useMemo(() => {
    const total = state.searchHistory.length;
    const recognized = state.searchHistory.filter((item) => item.recognized).length;
    const successRate = total ? Math.round((recognized / total) * 100) : 0;

    const artistCount = new Map<string, number>();
    state.searchHistory.forEach((item) => {
      if (!item.result?.artist) return;
      artistCount.set(item.result.artist, (artistCount.get(item.result.artist) ?? 0) + 1);
    });

    const mostArtist = [...artistCount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

    const dayCount = new Map<string, number>();
    state.searchHistory.forEach((item) => {
      const day = new Date(item.timestamp).toLocaleDateString("en-US", { weekday: "short" });
      dayCount.set(day, (dayCount.get(day) ?? 0) + 1);
    });
    const mostActiveDay = [...dayCount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

    return { total, successRate, mostArtist, mostActiveDay };
  }, [state.searchHistory]);

  function onPickAvatar(file: File) {
    const reader = new FileReader();
    reader.onload = () => setProfile({ avatarUrl: String(reader.result ?? "") });
    reader.readAsDataURL(file);
  }

  const initials = state.profile.username
    .split(" ")
    .map((chunk) => chunk[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold text-text-primary tracking-tight">Profile</h1>

      <Card className="p-6">
        <div className="flex flex-wrap items-center gap-4">
          <button className="h-24 w-24 rounded-full bg-surface-overlay border border-border flex items-center justify-center text-2xl font-bold cursor-pointer select-none transition-all duration-200" onClick={() => fileRef.current?.click()}>
            {state.profile.avatarUrl ? <img src={state.profile.avatarUrl} alt="avatar" className="h-full w-full rounded-full object-cover" /> : initials}
          </button>
          <input ref={fileRef} type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && onPickAvatar(e.target.files[0])} />
          <div className="flex-1 min-w-40">
            <h2 className="text-xl font-semibold text-text-primary">{state.profile.username}</h2>
            <p className="text-xs text-text-muted">{state.profile.email} • Joined {formatDate(state.profile.joinedAt)}</p>
          </div>
          <Button variant="secondary" onClick={() => setEditMode((v) => !v)}>{editMode ? "Close" : "Edit Profile"}</Button>
        </div>
      </Card>

      <Card className="p-6 space-y-3">
        <h2 className="text-xl font-semibold text-text-primary">Bio</h2>
        {editMode ? (
          <>
            <Input value={draftName} onChange={(e) => setDraftName(e.target.value)} placeholder="Display name" />
            <Textarea maxLength={200} rows={4} value={draftBio} onChange={(e) => setDraftBio(e.target.value)} />
            <p className="text-xs text-text-muted">{draftBio.length}/200</p>
            <div className="flex gap-2">
              <Button variant="primary" onClick={() => { setProfile({ username: draftName.trim() || state.profile.username, bio: draftBio.trim() }); setEditMode(false); }}>Save</Button>
              <Button variant="ghost" onClick={() => { setDraftName(state.profile.username); setDraftBio(state.profile.bio); setEditMode(false); }}>Cancel</Button>
            </div>
          </>
        ) : (
          <p className="text-sm text-text-primary leading-relaxed">{state.profile.bio}</p>
        )}
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><p className="text-3xl font-bold text-text-primary">{stats.total}</p><p className="text-xs text-text-muted">Total Recognitions</p></Card>
        <Card><p className="text-3xl font-bold text-text-primary">{stats.successRate}%</p><p className="text-xs text-text-muted">Success Rate</p></Card>
        <Card><p className="text-3xl font-bold text-text-primary truncate">{stats.mostArtist}</p><p className="text-xs text-text-muted">Most Recognized Artist</p></Card>
        <Card><p className="text-3xl font-bold text-text-primary">{stats.mostActiveDay}</p><p className="text-xs text-text-muted">Most Active Day</p></Card>
      </div>

      <Card className="p-6 space-y-4" onMouseLeave={() => setConfirmClear(false)}>
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-text-primary">Search History ({state.searchHistory.length})</h2>
          {!confirmClear ? <Button variant="ghost" onClick={() => setConfirmClear(true)}>Clear all</Button> : <Button variant="danger" onClick={clearHistory}>Are you sure?</Button>}
        </div>
        <div className="flex flex-wrap gap-2">
          {(["all", "recognized", "unrecognized", "audio-record", "audio-file", "album-image"] as const).map((filter) => (
            <Button key={filter} variant={historyFilter === filter ? "primary" : "secondary"} size="sm" onClick={() => setHistoryFilter(filter)}>{filter}</Button>
          ))}
        </div>
        <div className="max-h-[400px] overflow-y-auto space-y-2">
          {filteredHistory.map((item) => (
            <div key={item.id} className="bg-surface-raised border border-border rounded-xl p-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-text-muted">{formatDate(item.timestamp)} • {item.method}</p>
                {item.recognized && item.result ? <p className="text-sm text-text-primary">{item.result.title} — {item.result.artist}</p> : <p className="text-sm text-danger">Not recognized</p>}
              </div>
              <button className="text-text-muted hover:text-danger transition-all duration-200 cursor-pointer select-none" onClick={() => deleteHistoryItem(item.id)}>🗑</button>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-semibold text-text-primary">Favorites</h2>
        {state.favorites.length === 0 ? <p className="text-sm text-text-muted text-center py-8">💿 No saved songs yet</p> : (
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
            {state.favorites.map((song) => (
              <article key={song.id} className="bg-surface-raised border border-border rounded-xl p-4 space-y-2">
                <img src={song.coverUrl || "https://picsum.photos/seed/empty/240"} alt={song.title} className="h-32 w-full rounded-lg object-cover" />
                <p className="text-sm font-semibold text-text-primary truncate">{song.title}</p>
                <p className="text-xs text-text-muted">{song.artist} • {song.album}</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-text-muted">{formatDate(song.savedAt)}</p>
                  <button className="cursor-pointer select-none transition-all duration-200" onClick={() => removeFavorite(song.id)}>❤️</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-semibold text-text-primary">Manual Submissions</h2>
        {state.manualSubmissions.length === 0 ? <p className="text-sm text-text-muted">No submissions yet.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-text-muted"><tr><th>Title</th><th>Artist</th><th>Album</th><th>Date</th><th>Status</th></tr></thead>
              <tbody>
                {state.manualSubmissions.map((item) => (
                  <tr key={item.id} className="border-t border-border">
                    <td className="py-2 text-text-primary">{item.title}</td>
                    <td className="py-2 text-text-primary">{item.artist}</td>
                    <td className="py-2 text-text-primary">{item.album}</td>
                    <td className="py-2 text-text-muted">{formatDate(item.submittedAt)}</td>
                    <td className="py-2">{item.status === "approved" ? <Badge variant="success">approved</Badge> : item.status === "rejected" ? <Badge variant="danger">rejected</Badge> : <Badge variant="warning">pending</Badge>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
