"use client";

import { useLanguage } from "../../lib/LanguageContext";

const content = {
  en: {
    title: "The idea behind Trackly",
    subtitle:
      "A student project focused on one clear mission: recognize songs and guide users to legal listening instantly.",
  },
  bg: {
    title: "Идеята зад Trackly",
    subtitle:
      "Ученически проект с ясна мисия: разпознаваш песен и веднага получаваш легален достъп за слушане.",
  },
};

export default function IdeaPage() {
  const { language } = useLanguage();
  const c = content[language];

  return (
    <main className="mx-auto max-w-5xl px-6 py-16 text-white">
      <section className="text-center mb-16">
        <h1 className="mt-6 text-5xl font-semibold tracking-tight leading-tight">{c.title}</h1>
        <p className="mx-auto mt-5 max-w-3xl text-lg text-white/65 leading-relaxed">{c.subtitle}</p>
      </section>
    </main>
  );
}
