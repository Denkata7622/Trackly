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
            ? "Ученически екип от двама разработчици, фокусиран върху продукт с реална стойност: музикално разпознаване и легален достъп."
            : "A two-student builder team focused on a product with real value: music recognition and legal access."}
        </p>
      </section>

      <section className="mb-10 rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        <h2 className="mb-3 text-2xl font-semibold">{isBg ? "Кои сме ние" : "Who we are"}</h2>
        <p className="leading-relaxed text-white/75">
          {isBg
            ? "Съчетаваме UX мислене, инженерна дисциплина и бърза итерация. Trackly е нашият общ проект, в който дизайнът и логиката работят като едно."
            : "We combine UX thinking, engineering discipline, and fast iteration. Trackly is our shared project where design and logic work as one."}
        </p>
      </section>

      <section className="grid gap-8 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-7">
          <h3 className="text-2xl font-semibold">Yana Angelova</h3>
          <p className="mt-2 text-sm text-white/70">{isBg ? "Frontend Developer • UI/UX" : "Frontend Developer • UI/UX"}</p>
          <p className="mt-4 text-white/75 leading-relaxed">
            {isBg
              ? "Отговаря за интерфейса, взаимодействията и визуалната презентация, така че потребителят да стига до резултат с минимални стъпки."
              : "Responsible for interface, interactions, and product presentation so users reach results with minimal steps."}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-7">
          <h3 className="text-2xl font-semibold">Denislav Tsenov</h3>
          <p className="mt-2 text-sm text-white/70">{isBg ? "Backend Developer • API & Integrations" : "Backend Developer • API & Integrations"}</p>
          <p className="mt-4 text-white/75 leading-relaxed">
            {isBg
              ? "Отговаря за архитектурата на backend частта, интеграциите и надеждната обработка на данни за разпознаване и история."
              : "Responsible for backend architecture, integrations, and reliable handling of recognition and history data."}
          </p>
        </div>
      </section>
    </main>
  );
}
