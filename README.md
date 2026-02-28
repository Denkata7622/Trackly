# Trackly (PonotAI)

Trackly е уеб приложение за разпознаване на музика от **аудио** или **изображение** и показване на легални линкове към платформите за слушане.

## Какво прави проектът
- Качваш кратък аудио файл или снимка (например screenshot от плеър).
- Backend услугата анализира файла и връща разпознато парче.
- Получаваш структурирана информация за песента и линкове към YouTube / Spotify / Apple Music.

## Технологии
- **Frontend:** Next.js + React + TypeScript + Tailwind
- **Backend:** Express + TypeScript + Multer + music-metadata + Tesseract.js
- **Tooling:** npm workspaces-style scripts от root, concurrently за паралелно стартиране

## Структура на проекта
- `frontend/` — Next.js клиент
- `backend/` — Express API
- `docs/` — API договор и бележки за валидиране
- `scripts/` — помощни скриптове (clean, backend validate и др.)

## Бърз старт (как се пуска)

### 1) Изисквания
- Node.js 20+
- npm 10+

### 2) Инсталация
От root на проекта:

```bash
npm run setup
```

### 3) Стартиране на целия проект
От root:

```bash
npm run dev
```

Ще се стартират:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000`

## Стартиране поотделно

### Само backend
```bash
npm run dev:backend
```

### Само frontend
```bash
npm run dev:frontend
```

## Environment променливи

### Frontend (`frontend/.env.local`)
```bash
TRACKLY_API_BASE_URL=http://localhost:4000
```

Поддържа се и `NEXT_PUBLIC_API_BASE_URL` като fallback.

### Backend (`backend/.env`)
Копирай `backend/.env.example` като `.env` и настрой стойностите според средата.

## Основни npm команди (от root)
- `npm run dev` — пуска backend + frontend едновременно
- `npm run build` — build на backend и frontend
- `npm run lint` — lint на frontend
- `npm run test` — тестове (backend + frontend, ако има)
- `npm run check:backend` — backend dry type-check + backend unit tests
- `npm run clean` — чисти генерираните файлове
- `npm run reset` — clean + setup

## API (накратко)
- `GET /health` — healthcheck
- `POST /api/recognition/audio` — разпознаване от аудио (`multipart/form-data`, поле `audio`)
- `POST /api/recognition/image` — разпознаване от изображение (`multipart/form-data`, поле `image`)

Пълен договор: `docs/api-contract.md`.

## Полезни бележки
- При проблем с кеш/стари build файлове изпълни:
  ```bash
  npm run reset
  ```
- Ако си в ограничена среда без пълна npm инсталация, използвай fallback проверката:
  ```bash
  npm run check:backend
  ```

## Лиценз
MIT (`LICENSE`)
