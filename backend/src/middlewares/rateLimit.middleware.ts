import { NextFunction, Request, Response } from "express";

type ClientBucket = {
  count: number;
  windowStartedAt: number;
};

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 30;
const buckets = new Map<string, ClientBucket>();

export function recognitionRateLimit(req: Request, res: Response, next: NextFunction): void {
  const clientKey = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const existing = buckets.get(clientKey);

  if (!existing || now - existing.windowStartedAt > WINDOW_MS) {
    buckets.set(clientKey, { count: 1, windowStartedAt: now });
    next();
    return;
  }

  if (existing.count >= MAX_REQUESTS_PER_WINDOW) {
    res.status(429).json({
      message: "Too many recognition requests. Please retry in a minute.",
      retryAfterSeconds: Math.ceil((WINDOW_MS - (now - existing.windowStartedAt)) / 1000),
    });
    return;
  }

  existing.count += 1;
  next();
}
