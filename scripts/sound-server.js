#!/usr/bin/env node
/**
 * Dev server for Dig — serves static files + handles sound file uploads.
 *
 * Usage: node scripts/sound-server.js
 * Then open: http://localhost:8000/
 *
 * API:
 *   GET  /api/sounds       — list uploaded sound IDs
 *   POST /api/sounds/:id   — upload .ogg (raw body → res/:id.ogg)
 *   DELETE /api/sounds/:id — remove res/:id.ogg
 */

import fs from "fs";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const RES_DIR = path.join(ROOT, "res");
const PORT = 8000;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css":  "text/css; charset=utf-8",
  ".js":   "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".ogg":  "audio/ogg",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".svg":  "image/svg+xml",
  ".ico":  "image/x-icon",
  ".woff": "font/woff",
  ".woff2":"font/woff2",
};

// Ensure res/ exists
if (!fs.existsSync(RES_DIR)) {
  fs.mkdirSync(RES_DIR);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function serveStatic(res, filePath) {
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
    return;
  }
  const ext = path.extname(filePath).toLowerCase();
  const mime = MIME[ext] || "application/octet-stream";
  const data = fs.readFileSync(filePath);
  res.writeHead(200, { "Content-Type": mime, "Cache-Control": "no-cache" });
  res.end(data);
}

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  // ── API: list sounds ──────────────────────────────────────────────────
  if (pathname === "/api/sounds" && req.method === "GET") {
    const files = fs.readdirSync(RES_DIR)
      .filter((f) => f.endsWith(".ogg"))
      .map((f) => f.replace(/\.ogg$/, ""));
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(files));
    return;
  }

  // ── API: upload sound ─────────────────────────────────────────────────
  const uploadMatch = pathname.match(/^\/api\/sounds\/([a-z0-9_]+)$/);
  if (uploadMatch && req.method === "POST") {
    const id = uploadMatch[1];
    const body = await readBody(req);
    fs.writeFileSync(path.join(RES_DIR, `${id}.ogg`), body);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, id }));
    return;
  }

  // ── API: delete sound ─────────────────────────────────────────────────
  if (uploadMatch && req.method === "DELETE") {
    const id = uploadMatch[1];
    const filePath = path.join(RES_DIR, `${id}.ogg`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, id }));
    return;
  }

  // ── Static files ──────────────────────────────────────────────────────
  let filePath = path.join(ROOT, decodeURIComponent(pathname));
  if (pathname === "/") filePath = path.join(ROOT, "index.html");

  // Strip query strings from file paths
  const realPath = filePath.split("?")[0];
  serveStatic(res, realPath);
});

server.listen(PORT, () => {
  console.log(`Dig dev server running at http://localhost:${PORT}/`);
  console.log(`Sound manager at http://localhost:${PORT}/sounds.html`);
  console.log(`Sound files stored in ${RES_DIR}/`);
});
