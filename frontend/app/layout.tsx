import "./globals.css";
import type { ReactNode } from "react";
import AppShell from "../components/AppShell";
import { LanguageProvider } from "../lib/LanguageContext";
import { ThemeProvider } from "../lib/ThemeContext";
import { UserProvider } from "../src/context/UserContext";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="bg" data-theme="dark" suppressHydrationWarning>
      <body className="text-[var(--text)]">
        <ThemeProvider>
          <LanguageProvider>
            <UserProvider>
              <AppShell>{children}</AppShell>
            </UserProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
