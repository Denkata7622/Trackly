export default function IdeaPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16 text-white">
      {/* HERO */}
      <section className="text-center mb-16">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70">
          <span className="h-2 w-2 rounded-full bg-[var(--accent)] shadow-[0_0_16px_rgba(124,92,255,0.9)]" />
          Idea • Проблем → Решение → Реализация
        </div>

        <h1 className="mt-6 text-5xl font-semibold tracking-tight">
          Идеята зад{" "}
          <span className="text-[var(--accent)] drop-shadow-[0_0_18px_rgba(124,92,255,0.35)]">
            Trackly
          </span>
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-lg text-white/65 leading-relaxed">
          Trackly разпознава песен и веднага показва легален път за достъп — официални
          платформи, линкове и страница на артиста, плюс история на разпознатото.
        </p>
      </section>

      {/* QUICK SUMMARY */}
      <section className="grid gap-4 md:grid-cols-3 mb-14">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <div className="text-xs text-white/55">Проблем</div>
          <h3 className="mt-2 text-lg font-semibold">Разпознаване без “следваща стъпка”</h3>
          <p className="mt-3 text-sm text-white/70 leading-relaxed">
            След като разпознаеш песен, често пак търсиш ръчно къде да я слушаш
            (Spotify/YouTube/Apple), и можеш да попаднеш на неофициални източници.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <div className="text-xs text-white/55">Решение</div>
          <h3 className="mt-2 text-lg font-semibold">Един резултат → легален достъп</h3>
          <p className="mt-3 text-sm text-white/70 leading-relaxed">
            Trackly показва ясни действия: “Open in Spotify/YouTube/Apple”, “Artist page”,
            “Save in history” — всичко на едно място.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <div className="text-xs text-white/55">Реализация</div>
          <h3 className="mt-2 text-lg font-semibold">UI + API интеграции</h3>
          <p className="mt-3 text-sm text-white/70 leading-relaxed">
            Модерен фронтенд (Next.js) + backend API за разпознаване, метаданни,
            линкове към платформи и история.
          </p>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl mb-14">
        <div className="absolute -top-24 left-10 h-64 w-64 rounded-full bg-[var(--accent)]/20 blur-3xl" />

        <h2 className="relative text-2xl font-semibold mb-3">Проблемът</h2>

        <p className="relative text-white/75 leading-relaxed">
          В ежедневието често чуваме песен (в клип, магазин, кола, заведение) и искаме
          бързо да я намерим. Самото разпознаване е само първата част. Истинската
          трудност идва след това:
          <span className="text-white/90"> къде е най-лесно и легално да я слушаме</span>,
          как да стигнем до <span className="text-white/90">официалния артист</span> и
          как да си я запазим за по-късно.
        </p>

        <div className="relative mt-6 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="text-xs text-white/55">Болка</div>
            <div className="mt-2 text-sm text-white/90">Търсене в 3–4 места</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="text-xs text-white/55">Риск</div>
            <div className="mt-2 text-sm text-white/90">Неофициални линкове/сайтове</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="text-xs text-white/55">Липса</div>
            <div className="mt-2 text-sm text-white/90">Контекст за артиста и албума</div>
          </div>
        </div>
      </section>

      {/* SOLUTION */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl mb-14">
        <h2 className="text-2xl font-semibold mb-3">Решението</h2>

        <p className="text-white/75 leading-relaxed">
          Trackly прави разпознаването “завършено” — след резултата веднага дава
          <span className="text-white/90"> ясни бутони към официални платформи</span>,
          плюс страница на артиста и история на разпознатите песни.
          Така потребителят има едно действие → пълен резултат → легален достъп.
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-black/20 p-5">
            <h3 className="text-sm font-semibold">Какво вижда потребителят</h3>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              <li>• Заглавие + артист + обложка</li>
              <li>• Бутони: Spotify / YouTube Music / Apple Music</li>
              <li>• Artist page (повече инфо за артиста)</li>
              <li>• История на последните разпознати песни</li>
              <li>• Ясно UX поведение (една основна функция)</li>
            </ul>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-5">
            <h3 className="text-sm font-semibold">Каква е стойността</h3>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              <li>• Бързина: минимално търсене</li>
              <li>• Сигурност: официални линкове</li>
              <li>• Подкрепа за артисти</li>
              <li>• Подходящо за демо пред жури</li>
              <li>• Възможност за разширяване (Library, профили)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* IMPLEMENTATION */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl mb-14">
        <h2 className="text-2xl font-semibold mb-3">Реализация (как го правим)</h2>

        <p className="text-white/75 leading-relaxed">
          Архитектурата е разделена на две части: фронтенд и бекенд. Фронтендът
          показва интерфейса (Listen, история, страници за презентация), а бекендът
          връща резултат от разпознаване, метаданни и официални линкове.
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-5 text-sm text-white/80">
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            UI<br /><span className="text-white/60">Listen</span>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            API<br /><span className="text-white/60">Backend</span>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            Recognition<br /><span className="text-white/60">Provider</span>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            Metadata<br /><span className="text-white/60">Track/Artist</span>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            Links + History<br /><span className="text-white/60">Official</span>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-black/20 p-5">
            <h3 className="text-sm font-semibold">Frontend (Next.js)</h3>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              <li>• Премиум UI (dark + accent)</li>
              <li>• Listen бутон (главна функция)</li>
              <li>• Recent history</li>
              <li>• Презентационни страници за жури</li>
            </ul>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-5">
            <h3 className="text-sm font-semibold">Backend (план)</h3>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              <li>• Endpoint за разпознаване</li>
              <li>• Endpoint за история</li>
              <li>• Връзка с платформи (IDs/links)</li>
              <li>• Кеш/оптимизация за бързина</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CHALLENGES */}
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        <div className="absolute -bottom-24 right-10 h-64 w-64 rounded-full bg-[var(--accent)]/18 blur-3xl" />

        <h2 className="relative text-2xl font-semibold mb-3">Трудности по време на създаването</h2>

        <p className="relative text-white/75 leading-relaxed">
          По време на разработката срещнахме реални “dev” проблеми, които решихме с
          итерации и добра структура на проекта:
        </p>

        <ul className="relative mt-5 space-y-3 text-sm text-white/70">
          <li>
            • <span className="text-white/90">Структура и routing:</span> подреждане на
            страниците и навигацията така, че да има и приложение, и “презентация”.
          </li>
          <li>
            • <span className="text-white/90">CSS/дизайн системи:</span> променливи за
            цветове (палитра), за да е лесно да се управлява визията.
          </li>
          <li>
            • <span className="text-white/90">UI детайли:</span> баланс между “лукс”
            визия и четимост (контраст, размери, spacing).
          </li>
          <li>
            • <span className="text-white/90">Типове (TypeScript):</span> синхронизиране
            на данни и компоненти (например license статуси).
          </li>
          <li>
            • <span className="text-white/90">Работа в екип (GitHub):</span> структура
            на репото, commit-и и разделяне на задачи.
          </li>
        </ul>
      </section>
    </main>
  );
}
