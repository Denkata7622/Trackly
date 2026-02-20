import "./globals.css";
import type { ReactNode } from "react";
import AppShell from "../components/AppShell";
import { LanguageProvider } from "../lib/LanguageContext";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="bg">
      <body
        className="text-[var(--text)]"
        style={{
          background:
            "radial-gradient(900px 500px at 50% 20%, rgba(124,92,255,0.16), transparent 60%), radial-gradient(700px 380px at 20% 80%, rgba(76,211,255,0.08), transparent 55%), linear-gradient(180deg, var(--bg), var(--bg-2))",
        }}
      >
        <LanguageProvider>
          <AppShell>{children}</AppShell>
        </LanguageProvider>
      </body>
    </html>
  );
}
