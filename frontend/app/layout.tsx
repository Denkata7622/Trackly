import "./globals.css";
import Link from "next/link";

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
        <div className="flex min-h-screen">
          {/* SIDEBAR */}
          <aside
            className="w-64 p-6 backdrop-blur-xl"
            style={{
              background: "rgba(10,12,18,0.55)",
              borderRight: "1px solid var(--border)",
            }}
          >
           <Link href="/" className="block mb-10 mt-2 select-none">
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

          {/* PAGE CONTENT */}
          <main className="flex-1 p-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
