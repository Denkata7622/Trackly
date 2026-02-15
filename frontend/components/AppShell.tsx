"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import BottomPlayBar from "./BottomPlayBar_tmp";
import { PlayerProvider } from "./PlayerProvider_tmp";

const NAV_ITEMS = [
  { href: "/", label: "🎧 App" },
  { href: "/idea", label: "💡 Idea" },
  { href: "/how-to-use", label: "📘 How to use" },
  { href: "/founders", label: "👥 Founders" },
  { href: "/concept", label: "🧠 Concept" },
  { href: "/the-future", label: "💡 The Future" },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

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
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                className={pathname === item.href ? "navItemActive" : "navItem"}
                href={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1 px-4 pb-36 pt-6 sm:px-8 sm:pt-8">{children}</main>
      </div>
      <BottomPlayBar />
    </PlayerProvider>
  );
}