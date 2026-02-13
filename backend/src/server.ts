import cors from "cors";
import express from "express";

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/recognize", (_req, res) => {
  const samples = [
    {
      trackId: `trk_${Date.now()}`,
      title: "Blinding Lights",
      artist: { id: "a1", name: "The Weeknd" },
      license: "COPYRIGHTED",
      artworkUrl:
        "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=600&q=80",
    },
    {
      trackId: `trk_${Date.now()}_2`,
      title: "Sunflower",
      artist: { id: "a2", name: "Post Malone" },
      license: "COPYRIGHTED",
      artworkUrl:
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80",
    },
  ];

  const chosen = samples[Math.floor(Math.random() * samples.length)];
  res.json(chosen);
});

app.listen(port, () => {
  console.log(`Trackly API running on http://localhost:${port}`);
});
