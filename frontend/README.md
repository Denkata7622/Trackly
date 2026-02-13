## Frontend (Next.js)

### Run
```bash
npm run dev
```

### API connection
Set API base URL in `.env.local`:
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

### Feature structure
- `features/recognition/api.ts` - API client for recognition.
- `features/tracks/types.ts` - shared track types.
- `features/tracks/seed.ts` - fallback/seed recent tracks.
- `components/TrackCard.tsx` - reusable track card UI.
