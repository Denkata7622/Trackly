import { rmSync } from "node:fs";

const paths = [
  "frontend/.next",
  "frontend/out",
  "backend/dist",
  "backend/node_modules",
  "frontend/node_modules",
  "node_modules",
];

for (const path of paths) {
  rmSync(path, { recursive: true, force: true });
  console.log(`removed: ${path}`);
}
