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
            ? "След демонстрацията целта ни е Trackly да се развие в цялостна музикална платформа с библиотека, профили и препоръки."
            : "After the demo, our goal is to evolve Trackly into a complete music platform with library, profiles, and recommendations."}
        </p>
      </section>

      <section className="mb-12 rounded-2xl border border-white/10 bg-white/5 p-10 backdrop-blur-xl">
        <h2 className="mb-4 text-2xl font-semibold text-white">{isBg ? "Пътна карта" : "Roadmap"}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-black/20 p-5">
            <h3 className="font-semibold">{isBg ? "Етап 1: Реално разпознаване" : "Phase 1: Real recognition"}</h3>
            <p className="mt-2 text-sm text-white/70">
              {isBg ? "Стабилен backend endpoint и проверка на достъпност в платформи." : "Stable backend endpoint and platform availability verification."}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-5">
            <h3 className="font-semibold">{isBg ? "Етап 2: Библиотека и синхронизация" : "Phase 2: Library and sync"}</h3>
            <p className="mt-2 text-sm text-white/70">
              {isBg ? "Плейлисти, любими и синхронизация между устройства." : "Playlists, favorites, and cross-device synchronization."}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-5">
            <h3 className="font-semibold">{isBg ? "Етап 3: Откриване" : "Phase 3: Discovery"}</h3>
            <p className="mt-2 text-sm text-white/70">
              {isBg ? "Препоръки по артист, жанр и настроение." : "Recommendations by artist, genre, and mood."}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-5">
            <h3 className="font-semibold">{isBg ? "Етап 4: Оптимизация" : "Phase 4: Optimization"}</h3>
            <p className="mt-2 text-sm text-white/70">
              {isBg ? "По-висока производителност, кеширане и по-добро потребителско изживяване." : "Higher performance, caching, and UX refinements."}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
