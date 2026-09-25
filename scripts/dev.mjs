import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { spawn } from "node:child_process";

const port = 4173;
const root = process.cwd();
const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

const sass = spawn(
  process.platform === "win32" ? "npx.cmd" : "npx",
  [
    "sass",
    "src/scss/style.scss",
    "src/scss/style.css",
    "--watch",
    "--style=expanded",
    "--no-source-map",
  ],
  { stdio: "inherit" },
);

const server = createServer((request, response) => {
  const requestPath = decodeURIComponent(request.url?.split("?")[0] || "/");
  const relativePath = requestPath === "/" ? "index.html" : requestPath.replace(/^\/+/, "");
  const filePath = normalize(join(root, relativePath));

  if (!filePath.startsWith(root) || !existsSync(filePath) || !statSync(filePath).isFile()) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("404 Not Found");
    return;
  }

  response.writeHead(200, {
    "Cache-Control": "no-store",
    "Content-Type": mimeTypes[extname(filePath)] || "application/octet-stream",
  });
  createReadStream(filePath).pipe(response);
});

server.listen(port, () => {
  console.log(`\nおしりーすを起動しました: http://localhost:${port}\n`);
});

const stop = () => {
  sass.kill("SIGTERM");
  server.close(() => process.exit(0));
};

process.on("SIGINT", stop);
process.on("SIGTERM", stop);
