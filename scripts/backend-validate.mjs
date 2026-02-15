import { spawnSync } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const backendDir = path.join(repoRoot, "backend");
const tsconfigPath = path.join(backendDir, "tsconfig.json");
const stubsDir = path.join(backendDir, "src", "__stubs__");
const stubsPath = path.join(stubsDir, "deps.d.ts");

const tempTsconfig = {
  compilerOptions: {
    target: "ES2020",
    module: "CommonJS",
    moduleResolution: "Node",
    rootDir: "src",
    outDir: "dist",
    strict: true,
    esModuleInterop: true,
    skipLibCheck: true,
    noEmit: true,
    paths: {},
    noResolve: false,
  },
  include: ["src/**/*.ts", "src/**/*.d.ts"],
};

const depsStub = `declare module "express" {
  export type Request = any;
  export type Response = any;
  export type NextFunction = any;
  export function Router(): any;
  const express: any;
  export default express;
}

declare module "cors" {
  const cors: any;
  export type CorsOptions = any;
  export default cors;
}

declare module "multer" {
  function multer(options?: any): any;
  namespace multer {
    class MulterError extends Error {
      constructor(code: string, field?: string);
    }
    function memoryStorage(): any;
  }
  export = multer;
}

declare module "music-metadata" {
  export const parseBuffer: any;
}

declare module "tesseract.js" {
  const Tesseract: any;
  export default Tesseract;
}

declare module "node:fs" {
  export const promises: any;
}

declare module "node:path" {
  const path: any;
  export default path;
}

declare module "node:crypto" {
  export const randomUUID: () => string;
}

declare var process: {
  env: Record<string, string | undefined>;
  cwd: () => string;
};

declare var require: any;
declare var Buffer: any;
type Buffer = any;
`;

const originalTsconfig = await fs.readFile(tsconfigPath, "utf8");

try {
  await fs.mkdir(stubsDir, { recursive: true });
  await fs.writeFile(stubsPath, depsStub, "utf8");
  await fs.writeFile(tsconfigPath, `${JSON.stringify(tempTsconfig, null, 2)}\n`, "utf8");

  const tscRun = spawnSync("npx", ["tsc", "--noEmit", "--skipLibCheck"], {
    cwd: backendDir,
    stdio: "inherit",
    shell: process.platform === "win32",
    env: process.env,
  });

  process.exitCode = tscRun.status ?? 1;
} finally {
  await fs.writeFile(tsconfigPath, originalTsconfig, "utf8");
  await fs.rm(stubsPath, { force: true });
  await fs.rm(stubsDir, { recursive: true, force: true });
}
