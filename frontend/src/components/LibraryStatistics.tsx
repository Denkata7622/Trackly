"use client";

import { useMemo } from "react";
import type { HistoryItem, FavoriteItem } from "../context/UserContext";

type StatisticsProps = {
  history: HistoryItem[];
  favorites: FavoriteItem[];
};

export function LibraryStatistics({ history, favorites }: StatisticsProps) {
  const stats = useMemo(() => {
    const artistCounts = new Map<string, number>();
    const genreCounts = new Map<string, number>();
    const monthCounts = new Map<string, number>();

    // Analyze history
    for (const item of history) {
      if (item.artist) {
        artistCounts.set(item.artist, (artistCounts.get(item.artist) ?? 0) + 1);
      }
      if (item.createdAt) {
        const month = new Date(item.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
        });
        monthCounts.set(month, (monthCounts.get(month) ?? 0) + 1);
      }
    }

    const topArtists = Array.from(artistCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const topMonths = Array.from(monthCounts.entries())
      .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
      .slice(0, 6);

    return {
      totalListens: history.length,
      uniqueArtists: artistCounts.size,
      totalFavorites: favorites.length,
      topArtists,
      activityByMonth: topMonths,
      averageListensPerDay: history.length > 0 
        ? (history.length / Math.max(1, Math.ceil((Date.now() - new Date(history[0]?.createdAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24)))).toFixed(1)
        : "0",
    };
  }, [history, favorites]);

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid gap-2 md:grid-cols-4">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="text-xs text-[var(--muted)]">Total Listens</p>
          <p className="text-2xl font-bold text-[var(--text)] mt-1">{stats.totalListens}</p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="text-xs text-[var(--muted)]">Unique Artists</p>
          <p className="text-2xl font-bold text-[var(--text)] mt-1">{stats.uniqueArtists}</p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="text-xs text-[var(--muted)]">Favorites</p>
          <p className="text-2xl font-bold text-[var(--text)] mt-1">{stats.totalFavorites}</p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="text-xs text-[var(--muted)]">Avg. Daily</p>
          <p className="text-2xl font-bold text-[var(--text)] mt-1">{stats.averageListensPerDay}</p>
        </div>
      </div>

      {/* Top Artists */}
      {stats.topArtists.length > 0 && (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
          <h3 className="font-semibold text-[var(--text)] mb-3">Top Artists</h3>
          <div className="space-y-2">
            {stats.topArtists.map(([artist, count], idx) => (
              <div key={artist} className="flex items-center gap-3">
                <span className="text-sm font-bold text-[var(--accent)] w-4">{idx + 1}</span>
                <span className="flex-1 truncate text-sm text-[var(--text)]">{artist}</span>
                <span className="text-xs text-[var(--muted)]">{count} plays</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activity Calendar */}
      {stats.activityByMonth.length > 0 && (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
          <h3 className="font-semibold text-[var(--text)] mb-3">Recent Activity</h3>
          <div className="space-y-2">
            {stats.activityByMonth.map(([month, count]) => {
              const maxCount = Math.max(...stats.activityByMonth.map((m) => m[1])) || 1;
              const percentage = (count / maxCount) * 100;
              return (
                <div key={month} className="flex items-center gap-2">
                  <span className="text-xs text-[var(--muted)] w-14 text-right">{month}</span>
                  <div className="flex-1 h-6 rounded bg-[var(--surface-2)] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)]"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-[var(--muted)] w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
