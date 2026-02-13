# Trackly

Modern web application for music recognition and legal access to tracks and artists.

## Project structure
- `frontend/` - Next.js application
- `backend/` - Express API (`POST /recognize`, `GET /health`)
- `docs/` - API contract and project notes

## Run locally

## Run both backend + frontend together

From the repository root:
```bash
npm run setup
npm run dev
```

This starts:
- backend on `http://localhost:4000`
- frontend on `http://localhost:3000`

### 1) Backend
```bash
cd backend
npm install
npm run dev
```

Backend defaults to `http://localhost:4000`.

### 2) Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend defaults to calling backend via the Next API proxy route at `/api/recognize`.

Optional env config (`frontend/.env.local`):
```bash
TRACKLY_API_BASE_URL=http://localhost:4000
```


## Replace old local build completely
If you want to fully wipe generated files (including `.next`) and reinstall fresh:
```bash
npm run clean
npm run setup
npm run dev
```
