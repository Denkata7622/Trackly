import "./globals.css";
import type { ReactNode } from "react";
import AppShell from "../components/AppShell";
import { LanguageProvider } from "../lib/LanguageContext";
import { ThemeProvider } from "../lib/ThemeContext";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="bg" data-theme="dark" suppressHydrationWarning>
      <body className="text-[var(--text)]">
        <ThemeProvider>
          <LanguageProvider>
          <AppShell>{children}</AppShell>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
