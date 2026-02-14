import cors from "cors";
import express from "express";
import recognitionRouter from "./modules/recognition/recognition.routes";
import { recognitionRateLimit } from "./middlewares/rateLimit.middleware";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/recognition", recognitionRateLimit, recognitionRouter);

export default app;
