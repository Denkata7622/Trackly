import app from "./app";
import { validateEnvironment } from "./config/env";

validateEnvironment();

const port = Number(process.env.PORT || 4000);

app.listen(port, () => {
  console.log(`Trackly API running on http://localhost:${port}`);
});
