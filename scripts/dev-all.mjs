import { spawn } from "node:child_process";

function run(command, args) {
  return spawn(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    env: process.env,
  });
}

const backend = run("npm", ["run", "dev", "--prefix", "backend"]);
const frontend = run("npm", [
  "run",
  "dev",
  "--prefix",
  "frontend",
  "--",
  "--hostname",
  "0.0.0.0",
  "--port",
  "3000",
]);

let shuttingDown = false;

function shutdown(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;

  backend.kill("SIGTERM");
  frontend.kill("SIGTERM");

  setTimeout(() => {
    backend.kill("SIGKILL");
    frontend.kill("SIGKILL");
    process.exit(exitCode);
  }, 1500).unref();
}

backend.on("exit", (code) => shutdown(code ?? 1));
frontend.on("exit", (code) => shutdown(code ?? 1));

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
