"use client";

import { useState } from "react";
import type { FavoriteItem } from "../context/UserContext";
import { Button } from "./ui/Button";

type BatchManagerProps = {
  items: FavoriteItem[];
  playlists?: Array<{ id: string; name: string }>;
  onAddToPlaylist?: (items: FavoriteItem[], playlistId: string) => void;
  onDelete?: (items: FavoriteItem[]) => void;
};

export function BatchManager({ items, playlists = [], onAddToPlaylist, onDelete }: BatchManagerProps) {
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [isSelecting, setIsSelecting] = useState(false);
  const [showPlaylistSelector, setShowPlaylistSelector] = useState(false);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>("");

  const toggleSelection = (index: number) => {
    const newSelected = new Set(selectedIndices);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedIndices(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIndices.size === items.length) {
      setSelectedIndices(new Set());
    } else {
      setSelectedIndices(new Set(Array.from({ length: items.length }, (_, i) => i)));
    }
  };

  const selectedItems = Array.from(selectedIndices).map((i) => items[i]);

  const handleAddToPlaylist = () => {
    if (selectedPlaylistId && onAddToPlaylist) {
      onAddToPlaylist(selectedItems, selectedPlaylistId);
      setSelectedIndices(new Set());
      setIsSelecting(false);
      setShowPlaylistSelector(false);
      setSelectedPlaylistId("");
    }
  };

  if (!isSelecting && selectedIndices.size === 0) {
    return (
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setIsSelecting(true)}
      >
        📋 Batch Select
      </Button>
    );
  }

  return (
    <div className="space-y-3">
      {/* Playlist Selector Modal */}
      {showPlaylistSelector && onAddToPlaylist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4">Add to Playlist</h3>
            <div className="space-y-2 mb-4">
              {playlists.length === 0 ? (
                <p className="text-sm text-[var(--muted)]">No playlists available. Create one first.</p>
              ) : (
                playlists.map((playlist) => (
                  <button
                    key={playlist.id}
                    onClick={() => setSelectedPlaylistId(playlist.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg border transition ${
                      selectedPlaylistId === playlist.id
                        ? "border-[var(--accent)] bg-[var(--active-bg)] text-[var(--text)]"
                        : "border-[var(--border)] bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--text)]"
                    }`}
                  >
                    {playlist.name}
                  </button>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowPlaylistSelector(false);
                  setSelectedPlaylistId("");
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleAddToPlaylist}
                disabled={!selectedPlaylistId}
                className="flex-1"
              >
                Add
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Selection Toolbar */}
      <div className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3">
        <input
          type="checkbox"
          checked={selectedIndices.size === items.length && items.length > 0}
          onChange={toggleSelectAll}
          className="cursor-pointer"
        />
        <span className="text-sm text-[var(--muted)]">
          {selectedIndices.size} of {items.length} selected
        </span>
        <div className="flex-1" />
        <div className="flex gap-2">
          {onAddToPlaylist && playlists.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowPlaylistSelector(true)}
            >
              ➕ Add to Playlist
            </Button>
          )}
          {onDelete && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                if (confirm(`Delete ${selectedItems.length} item(s)?`)) {
                  onDelete(selectedItems);
                  setSelectedIndices(new Set());
                  setIsSelecting(false);
                }
              }}
            >
              🗑️ Delete
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setSelectedIndices(new Set());
              setIsSelecting(false);
            }}
          >
            Cancel
          </Button>
        </div>
      </div>

      {/* Items with Selection */}
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-3 rounded-lg border p-3 transition cursor-pointer ${
              selectedIndices.has(idx)
                ? "border-[var(--accent)] bg-[var(--active-bg)]"
                : "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)]"
            }`}
            onClick={() => toggleSelection(idx)}
          >
            <input
              type="checkbox"
              checked={selectedIndices.has(idx)}
              onChange={() => toggleSelection(idx)}
              className="cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-[var(--text)]">{item.title}</p>
              <p className="truncate text-xs text-[var(--muted)]">{item.artist}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
