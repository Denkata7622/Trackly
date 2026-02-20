"use client";

import Link from "next/link";
import { useLanguage } from "../../lib/LanguageContext";

export default function HowToUsePage() {
  const { language } = useLanguage();
  const isBg = language === "bg";

  const steps = isBg
    ? [
        { n: "01", title: "Натисни „Слушай“", text: "Trackly записва кратък аудио откъс и го подготвя за анализ." },
        { n: "02", title: "Песента е разпозната", text: "Съпоставяме аудио отпечатъка и показваме проверени данни за песен и изпълнител." },
        { n: "03", title: "Легален достъп", text: "Получаваш директни линкове към официални платформи вместо случайни сайтове." },
        { n: "04", title: "Запази в история", text: "Резултатите могат да се съхраняват в библиотека и история." },
      ]
    : [
        { n: "01", title: "Tap Listen", text: "Trackly records a short sample and prepares it for analysis." },
        { n: "02", title: "Track identified", text: "We match the audio fingerprint and show verified song and artist info." },
        { n: "03", title: "Legal access", text: "You get direct links to official platforms instead of random websites." },
        { n: "04", title: "Save in history", text: "Results can be saved to your library and recent history." },
      ];

  return (
    <main className="min-h-screen px-6 py-14 text-[var(--text)]">
      <section className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-white/5 px-10 py-12 backdrop-blur-xl">
        <h1 className="text-5xl font-semibold tracking-tight">{isBg ? "Как се използва Trackly" : "How to use Trackly"}</h1>
        <p className="mt-5 max-w-2xl text-[var(--muted)] leading-relaxed">
          {isBg
            ? "Лесен поток: разпознаване за секунди, после незабавен избор на легална платформа."
            : "A simple flow: recognize in seconds, then choose a legal platform instantly."}
        </p>
      </section>

      <section className="mx-auto mt-14 max-w-6xl grid gap-6 md:grid-cols-2">
        {steps.map((s) => (
          <div key={s.n} className="rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-xl">
            <div className="text-sm font-semibold text-white/80">{s.n}</div>
            <h3 className="mt-4 text-xl font-semibold">{s.title}</h3>
            <p className="mt-2 text-sm text-[var(--muted)] leading-relaxed">{s.text}</p>
          </div>
        ))}
      </section>

      <div className="mx-auto mt-10 max-w-6xl flex gap-3">
        <Link href="/" className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm hover:bg-white/10">
          {isBg ? "Обратно към приложението" : "Back to app"}
        </Link>
      </div>
    </main>
  );
}
