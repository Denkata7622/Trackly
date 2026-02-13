import "./globals.css";
import AppShell from "../components/AppShell";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className="text-[var(--text)]"
        style={{
          background:
            "radial-gradient(900px 500px at 50% 20%, rgba(124,92,255,0.16), transparent 60%), radial-gradient(700px 380px at 20% 80%, rgba(76,211,255,0.08), transparent 55%), linear-gradient(180deg, var(--bg), var(--bg-2))",
        }}
      >
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
