import cors from "cors";
import express from "express";
import type { Request, Response } from "express";
import { corsOptions } from "./config/cors";
import { errorMiddleware } from "./middlewares/error.middleware";
import authRouter from "./modules/auth/auth.routes";
import historyRouter from "./modules/history/history.routes";
import recognitionRouter from "./modules/recognition/recognition.routes";
import { recognitionRateLimit } from "./middlewares/rateLimit.middleware";

const app = express();

app.use(cors(corsOptions));
app.use(express.json());

app.get("/health", (_req: Request, res: Response) => {
  res.json({ ok: true });
});

app.use("/api/recognition", recognitionRouter);
app.use("/api/history", historyRouter);
app.use("/api/auth", authRouter);

app.use(errorMiddleware);

export default app;
