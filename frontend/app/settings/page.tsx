"use client";

import { useState } from "react";
import { useLanguage } from "../../lib/LanguageContext";
import { useTheme } from "../../lib/ThemeContext";
import { t } from "../../lib/translations";

const MAX_SONGS_KEY = "ponotai.settings.maxSongs";
const OCR_LANGUAGE_KEY = "ponotai.settings.ocrLanguage";
const PROFILE_NAME_KEY = "ponotai.profile.name";
const PROFILE_EMAIL_KEY = "ponotai.profile.email";

const readStorage = (key: string, fallback = "") => (typeof window === "undefined" ? fallback : window.localStorage.getItem(key) ?? fallback);

export default function SettingsPage() {
  const { language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const [maxSongs, setMaxSongs] = useState(() => Number(readStorage(MAX_SONGS_KEY, "10")));
  const [ocrLanguage, setOcrLanguage] = useState(() => readStorage(OCR_LANGUAGE_KEY, "eng"));
  const [profileName, setProfileName] = useState(() => readStorage(PROFILE_NAME_KEY));
  const [profileEmail, setProfileEmail] = useState(() => readStorage(PROFILE_EMAIL_KEY));

  return (
    <section className="space-y-6">
      <section className="card p-6">
        <h1 className="cardTitle text-2xl font-bold">{t("nav_settings", language)}</h1>
        <p className="cardText mt-2">{language === "bg" ? "Настрой език, тема и OCR параметри." : "Adjust language, theme, and OCR preferences."}</p>
      </section>

      <section className="card p-6">
        <h2 className="cardTitle text-xl font-semibold">{language === "bg" ? "Приложение" : "App"}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-left" onClick={() => setLanguage(language === "en" ? "bg" : "en")}>🌐 {language === "en" ? "Switch to BG" : "Смени на EN"}</button>
          <button className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-left" onClick={toggleTheme}>{theme === "dark" ? "☀️ Light" : "🌙 Dark"}</button>
          <label className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-left">
            <span className="mb-1 block text-sm">{t("stats_max_ocr_songs", language)}</span>
            <input
              type="number"
              min={1}
              max={20}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--input-bg)] px-2 py-1"
              value={maxSongs}
              onChange={(e) => {
                const next = Math.min(20, Math.max(1, Number(e.target.value) || 1));
                setMaxSongs(next);
                window.localStorage.setItem(MAX_SONGS_KEY, String(next));
              }}
            />
          </label>
          <label className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-left">
            <span className="mb-1 block text-sm">{t("stats_ocr_language", language)}</span>
            <select
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--input-bg)] px-2 py-1"
              value={ocrLanguage}
              onChange={(e) => {
                setOcrLanguage(e.target.value);
                window.localStorage.setItem(OCR_LANGUAGE_KEY, e.target.value);
              }}
            >
              <option value="eng">{t("ocr_lang_english", language)}</option>
              <option value="spa">{t("ocr_lang_spanish", language)}</option>
              <option value="fra">{t("ocr_lang_french", language)}</option>
              <option value="deu">{t("ocr_lang_german", language)}</option>
              <option value="ita">{t("ocr_lang_italian", language)}</option>
              <option value="por">{t("ocr_lang_portuguese", language)}</option>
            </select>
          </label>
        </div>
      </section>

      <section className="card p-6" id="profile">
        <h2 className="cardTitle text-xl font-semibold">{t("nav_profile", language)}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label>
            <span className="mb-1 block text-sm text-[var(--muted)]">{language === "bg" ? "Име" : "Name"}</span>
            <input className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-3 py-2" value={profileName} onChange={(e) => {
              setProfileName(e.target.value);
              window.localStorage.setItem(PROFILE_NAME_KEY, e.target.value);
            }} />
          </label>
          <label>
            <span className="mb-1 block text-sm text-[var(--muted)]">Email</span>
            <input className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-3 py-2" value={profileEmail} onChange={(e) => {
              setProfileEmail(e.target.value);
              window.localStorage.setItem(PROFILE_EMAIL_KEY, e.target.value);
            }} />
          </label>
        </div>
      </section>
    </section>
  );
}
