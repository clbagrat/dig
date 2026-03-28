#!/usr/bin/env node
/**
 * Tiny map debug server.
 * Usage: node scripts/map-server.js
 * Then open: http://localhost:3747/map?seed=SEED
 */

import { execSync } from "child_process";
import fs from "fs";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3747;
const SCRIPT = path.join(__dirname, "render-map-debug.js");

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (url.pathname !== "/map") {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found. Use /map?seed=SEED");
    return;
  }

  const seed = Number(url.searchParams.get("seed")) || 1;

  try {
    const outputPath = execSync(`node "${SCRIPT}" --seed ${seed}`)
      .toString()
      .trim();
    const svg = fs.readFileSync(outputPath, "utf8");
    res.writeHead(200, { "Content-Type": "image/svg+xml" });
    res.end(svg);
  } catch (e) {
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end(`Error: ${e.message}`);
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Map server ready → http://localhost:${PORT}/map?seed=SEED`);
});
