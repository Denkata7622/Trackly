import type { Request, Response } from "express";
import { notImplementedAuthFeature } from "./auth.service";

export function authNotImplementedController(_req: Request, res: Response): void {
  res.status(501).json(notImplementedAuthFeature());
}
