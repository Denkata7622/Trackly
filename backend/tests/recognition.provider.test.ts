import test from "node:test";
import assert from "node:assert/strict";
import { shouldRetryStatus } from "../src/modules/recognition/providers/audd.provider.ts";

test("shouldRetryStatus retries on 429 and 5xx", () => {
  assert.equal(shouldRetryStatus(429), true);
  assert.equal(shouldRetryStatus(500), true);
  assert.equal(shouldRetryStatus(503), true);
  assert.equal(shouldRetryStatus(404), false);
});
