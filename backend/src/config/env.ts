export function validateEnvironment(): void {
  const auddToken = process.env.AUDD_API_TOKEN?.trim() || process.env.AUDD_API_KEY?.trim();
  const youtubeKey = process.env.YOUTUBE_API_KEY?.trim();

  const missing: string[] = [];

  if (!auddToken) {
    missing.push("AUDD_API_TOKEN (or AUDD_API_KEY)");
  } else {
    process.env.AUDD_API_TOKEN = auddToken;
  }

  if (!youtubeKey) {
    missing.push("YOUTUBE_API_KEY");
  }

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}
