# API Contract

## POST /recognize
Recognizes a song from audio input.

### Response
```json
{
  "trackId": "string",
  "title": "string",
  "artist": {
    "id": "string",
    "name": "string"
  },
  "license": "FREE | COPYRIGHTED",
  "artworkUrl": "string (optional)"
}
```
