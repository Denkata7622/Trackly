"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import BottomPlayBar from "./BottomPlayBar";
import { PlayerProvider } from "./PlayerProvider";

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <PlayerProvider>
      <div className="flex min-h-screen">
        <aside
          className="hidden w-64 p-6 backdrop-blur-xl md:block"
          style={{
            background: "rgba(10,12,18,0.55)",
            borderRight: "1px solid var(--border)",
          }}
        >
          <Link href="/" className="mb-10 mt-2 block select-none">
            <h1 className="logoWrapper flex items-center gap-2">
              <span className="logoDot"></span>
              <span className="logoText">Trackly</span>
            </h1>
          </Link>

          <nav className="flex flex-col gap-2 text-base">
            <Link className="navItem" href="/">
              🎧 App
            </Link>
            <Link className="navItem" href="/idea">
              💡 Idea
            </Link>
            <Link className="navItem" href="/how-to-use">
              📘 How to use
            </Link>
            <Link className="navItem" href="/founders">
              👥 Founders
            </Link>
            <Link className="navItem" href="/concept">
              🧠 Concept
            </Link>
            <Link className="navItem" href="/the-future">
              💡 The Future
            </Link>
          </nav>
        </aside>

        <main className="flex-1 px-4 pb-36 pt-6 sm:px-8 sm:pt-8">{children}</main>
      </div>
      <BottomPlayBar />
    </PlayerProvider>
  );
}
