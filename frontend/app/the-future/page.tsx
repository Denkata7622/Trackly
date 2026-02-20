"use client";

import { useLanguage } from "../../lib/LanguageContext";

export default function TheFuturePage() {
  const { language } = useLanguage();
  const isBg = language === "bg";

  return (
    <main className="mx-auto max-w-5xl px-6 py-16 text-[var(--text)]">
      <section className="text-center mb-16">
        <h1 className="mt-6 text-5xl font-semibold tracking-tight">
          {isBg ? "Бъдещето на Trackly" : "The future of Trackly"}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-white/65 leading-relaxed">
          {isBg
            ? "Целта ни е Trackly да се развие от инструмент за разпознаване в цялостна платформа за достъп и откриване на музика."
            : "Our goal is to evolve Trackly from a recognizer into a full music access and discovery platform."}
        </p>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-10 backdrop-blur-xl text-center">
        <h2 className="text-2xl font-semibold text-white mb-3">{isBg ? "Пътна карта" : "Roadmap"}</h2>
        <p className="mx-auto max-w-2xl text-white/70 leading-relaxed">
          {isBg
            ? "Следващите стъпки включват реално backend разпознаване, синхронизирана библиотека, препоръки и по-бърза производителност."
            : "Next steps include real backend recognition, synced libraries, recommendations and performance improvements."}
        </p>
      </section>
    </main>
  );
}
