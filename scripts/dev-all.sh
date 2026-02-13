#!/usr/bin/env bash
set -euo pipefail

cleanup() {
  if [[ -n "${BACKEND_PID:-}" ]]; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi
  if [[ -n "${FRONTEND_PID:-}" ]]; then
    kill "$FRONTEND_PID" 2>/dev/null || true
  fi
}

trap cleanup EXIT INT TERM

npm run dev --prefix backend &
BACKEND_PID=$!

npm run dev --prefix frontend -- --hostname 0.0.0.0 --port 3000 &
FRONTEND_PID=$!

wait -n "$BACKEND_PID" "$FRONTEND_PID"
