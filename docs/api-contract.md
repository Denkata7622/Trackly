# API Contract

## Health
### GET /health
Returns backend health status.

**Response**
```json
{ "ok": true }
```

## Recognition
### POST /api/recognition/audio
Recognizes a song from an uploaded audio clip (`multipart/form-data`, field: `audio`).

**Success response**
```json
{
  "songName": "Blinding Lights",
  "artist": "The Weeknd",
  "album": "After Hours",
  "genre": "Pop",
  "platformLinks": {
    "youtube": "https://www.youtube.com/watch?v=4NRXx6U8ABQ",
    "appleMusic": "https://music.apple.com/...",
    "spotify": "https://open.spotify.com/...",
    "preview": "https://..."
  },
  "youtubeVideoId": "4NRXx6U8ABQ",
  "releaseYear": 2020,
  "source": "provider",
  "verificationStatus": "verified"
}
```

**Verification failure**
- Status: `404`
```json
{
  "message": "Recognition succeeded but no verified YouTube result was found.",
  "code": "NO_VERIFIED_RESULT"
}
```

### POST /api/recognition/image
Recognizes a song candidate from uploaded image text (`multipart/form-data`, field: `image`) and verifies it on YouTube.

Response shape is the same as `/api/recognition/audio`.
