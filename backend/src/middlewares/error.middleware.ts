import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../utils/httpError";

export function errorMiddleware(error: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (error instanceof HttpError) {
    res.status(error.statusCode).json({ message: error.message, code: error.code });
    return;
  }

  res.status(500).json({
    message: "Internal server error",
    details: (error as Error).message,
  });
}
