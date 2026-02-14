"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import BottomPlayBar from "./BottomPlayBar_tmp";
import { PlayerProvider } from "./PlayerProvider_tmp";

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <PlayerProvider>
      <div className="flex min-h-screen">
        <main className="flex-1 px-4 pb-36 pt-6 sm:px-8 sm:pt-8">{children}</main>
      </div>
      <BottomPlayBar />
    </PlayerProvider>
  );
}