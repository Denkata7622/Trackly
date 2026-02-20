"use client";

import { useLanguage } from "../../lib/LanguageContext";

export default function ConceptPage() {
  const { language } = useLanguage();
  const isBg = language === "bg";

  return (
    <main className="mx-auto max-w-5xl px-6 py-16 text-white">
      <section className="mb-20 text-center">
        <h1 className="mt-6 text-5xl font-semibold tracking-tight">
          {isBg ? "Концепция: разпознаването е начало, не край" : "Concept: recognition is the start, not the end"}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/65">
          {isBg
            ? "Trackly не показва само името на песента, а дава следващото логично действие — къде да я слушаш легално."
            : "Trackly does not only show the song name, it also gives the next logical action — where to listen legally."}
        </p>
      </section>
    </main>
  );
}
