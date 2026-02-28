"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function KeyboardShortcuts() {
  const router = useRouter();
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    function handleKeyPress(event: KeyboardEvent) {
      // Only trigger shortcuts when not typing in an input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Ctrl/Cmd + K: Show help
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        setShowHelp(!showHelp);
      }

      // Ctrl/Cmd + L: Navigate to library
      if ((event.ctrlKey || event.metaKey) && event.key === "l") {
        event.preventDefault();
        router.push("/library");
      }

      // Ctrl/Cmd + H: Navigate to home
      if ((event.ctrlKey || event.metaKey) && event.key === "h") {
        event.preventDefault();
        router.push("/");
      }

      // Ctrl/Cmd + S: Navigate to settings
      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();
        router.push("/settings");
      }
    }

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [showHelp, router]);

  return (
    <>
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-[var(--text)] mb-4">Keyboard Shortcuts</h2>
            <div className="space-y-3">
              <div>
                <kbd className="px-2 py-1 rounded bg-[var(--surface-2)] border border-[var(--border)] text-xs font-mono">Ctrl+K</kbd>
                <span className="ml-2 text-sm text-[var(--muted)]">Show help</span>
              </div>
              <div>
                <kbd className="px-2 py-1 rounded bg-[var(--surface-2)] border border-[var(--border)] text-xs font-mono">Ctrl+H</kbd>
                <span className="ml-2 text-sm text-[var(--muted)]">Go to home</span>
              </div>
              <div>
                <kbd className="px-2 py-1 rounded bg-[var(--surface-2)] border border-[var(--border)] text-xs font-mono">Ctrl+L</kbd>
                <span className="ml-2 text-sm text-[var(--muted)]">Go to library</span>
              </div>
              <div>
                <kbd className="px-2 py-1 rounded bg-[var(--surface-2)] border border-[var(--border)] text-xs font-mono">Ctrl+S</kbd>
                <span className="ml-2 text-sm text-[var(--muted)]">Go to settings</span>
              </div>
            </div>
            <button
              onClick={() => setShowHelp(false)}
              className="mt-4 w-full rounded-lg bg-[var(--accent)] px-4 py-2 text-white font-medium hover:opacity-90"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
