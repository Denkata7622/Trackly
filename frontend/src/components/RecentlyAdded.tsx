"use client";

import type { FavoriteItem } from "../context/UserContext";
import { Button } from "./ui/Button";

type RecentlyAddedProps = {
  items: FavoriteItem[];
  onPlay?: (item: FavoriteItem) => void;
  maxItems?: number;
};

export function RecentlyAdded({ items, onPlay, maxItems = 5 }: RecentlyAddedProps) {
  const sorted = [...items]
    .sort((a, b) => new Date(b.savedAt || 0).getTime() - new Date(a.savedAt || 0).getTime())
    .slice(0, maxItems);

  if (sorted.length === 0) return null;

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <h3 className="font-semibold text-[var(--text)] mb-3">✨ Recently Added</h3>
      <div className="space-y-2">
        {sorted.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between gap-3 rounded-lg hover:bg-[var(--surface-2)] p-2 transition">
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-[var(--text)]">{item.title}</p>
              <p className="truncate text-xs text-[var(--muted)]">{item.artist}</p>
            </div>
            {onPlay && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onPlay(item)}
                className="whitespace-nowrap"
              >
                ▶ Play
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
