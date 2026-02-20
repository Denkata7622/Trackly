"use client";

import { useLanguage } from "../../lib/LanguageContext";

export default function FoundersPage() {
  const { language } = useLanguage();
  const isBg = language === "bg";

  return (
    <main className="mx-auto max-w-5xl px-6 py-16 text-white">
      <section className="text-center mb-16">
        <h1 className="mt-6 text-5xl font-semibold tracking-tight leading-tight">
          {isBg ? "Основатели на Trackly" : "Trackly Founders"}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-white/65 leading-relaxed">
          {isBg
            ? "Екип от двама ученици-разработчици, които съчетават UX дизайн, програмиране и AI интеграции."
            : "A two-student builder team combining UX design, engineering and AI integrations."}
        </p>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl mb-10">
        <h2 className="text-2xl font-semibold mb-3">{isBg ? "Кои сме ние" : "Who we are"}</h2>
        <p className="text-white/75 leading-relaxed">
          {isBg
            ? "Работим по STEM и софтуерни проекти с реална полза. Trackly е нашият подход към проблема с откриването на музика и насочването към легални източници."
            : "We build STEM/software projects with practical value. Trackly is our approach to music discovery and legal routing."}
        </p>
      </section>
    </main>
  );
}
