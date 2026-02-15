import test from "node:test";
import assert from "node:assert/strict";
import { parseOcrCandidateText } from "../src/modules/recognition/ocr-parser.ts";

test("parseOcrCandidateText parses labeled lines", () => {
  const parsed = parseOcrCandidateText("Song: Numb\nArtist: Linkin Park\nAlbum: Meteora");
  assert.equal(parsed?.songName, "Numb");
  assert.equal(parsed?.artist, "Linkin Park");
  assert.equal(parsed?.album, "Meteora");
});

test("parseOcrCandidateText parses dashed format", () => {
  const parsed = parseOcrCandidateText("Daft Punk - One More Time");
  assert.equal(parsed?.songName, "One More Time");
  assert.equal(parsed?.artist, "Daft Punk");
});
