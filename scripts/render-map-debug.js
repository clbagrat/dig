#!/usr/bin/env node

import fs from "fs";
import path from "path";
import {
  generateMap,
  cellIndex,
  GRID_W, GRID_H, START_X, START_Y,
  BEACON_COUNT, HAZARD_TYPES, BLOCK_TYPES,
  TILE_PERK_TYPES, CRYSTAL_TYPES,
  getTargetPerkTileCount, getTargetPerkZoneCount, getTargetCrystalTileCount,
} from "../src/worldgen.js";

const TILE_PX = 12;
const LEGEND_W = 260;
const HAZARD_DATA = {
  [HAZARD_TYPES.SPIKE]:    { label: "Spike",    color: "#ff6b48" },
  [HAZARD_TYPES.VOLATILE]: { label: "Volatile", color: "#ffd166" },
};

function parseArgs(argv) {
  let seed = 1;
  let output = "";

  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--seed" && argv[i + 1]) {
      seed = Number(argv[i + 1]);
      i += 1;
    } else if (argv[i] === "--output" && argv[i + 1]) {
      output = argv[i + 1];
      i += 1;
    }
  }

  if (!Number.isFinite(seed)) throw new Error("Seed must be a finite number");
  if (!output) output = path.join("debug", `map-seed-${seed}.svg`);
  return { seed, output };
}

function esc(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderSvg(seed, map) {
  const mapW = GRID_W * TILE_PX;
  const mapH = GRID_H * TILE_PX;
  const width = mapW + LEGEND_W;
  const height = mapH;
  const parts = [];

  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`);
  parts.push(`<rect width="${width}" height="${height}" fill="#0b0706"/>`);
  parts.push(`<rect x="0" y="0" width="${mapW}" height="${mapH}" fill="#0f0907"/>`);

  for (let y = 0; y < GRID_H; y += 1) {
    for (let x = 0; x < GRID_W; x += 1) {
      const idx = cellIndex(x, y);
      const type = map.hardness[idx];
      const tile = BLOCK_TYPES[type];
      const px = x * TILE_PX;
      const py = y * TILE_PX;
      const isGasPocket = map.gasPocketMask[idx];
      const isSteamPocket = map.steamPocketMask[idx];
      const isBoulderPocket = map.boulderPocketMask[idx];
      const isMetal = map.metalMask[idx];
      const isPocket = isGasPocket || isSteamPocket || isBoulderPocket;

      parts.push(`<rect x="${px}" y="${py}" width="${TILE_PX}" height="${TILE_PX}" fill="${isMetal ? "#69767e" : isPocket ? "#19110d" : tile.color}"/>`);
      parts.push(`<rect x="${px}" y="${py}" width="${TILE_PX}" height="${TILE_PX}" fill="none" stroke="rgba(255,225,179,0.05)" stroke-width="0.6"/>`);

      if (isMetal) {
        parts.push(`<path d="M ${px - 4} ${py + 1} L ${px + 8} ${py + TILE_PX - 1} M ${px + 6} ${py + 1} L ${px + 18} ${py + TILE_PX - 1} M ${px + TILE_PX - 2} ${py + 1} L ${px + TILE_PX + 10} ${py + TILE_PX - 1}" fill="none" stroke="rgba(230,238,243,0.26)" stroke-width="0.9"/>`);
        parts.push(`<rect x="${px + 4}" y="${py + 4}" width="${TILE_PX - 8}" height="${TILE_PX - 8}" fill="rgba(29,38,45,0.46)" stroke="rgba(214,225,233,0.3)" stroke-width="0.8"/>`);
        parts.push(`<circle cx="${px + 8}" cy="${py + 8}" r="1.6" fill="#ced6db"/>`);
        parts.push(`<circle cx="${px + TILE_PX - 8}" cy="${py + 8}" r="1.6" fill="#ced6db"/>`);
        parts.push(`<circle cx="${px + 8}" cy="${py + TILE_PX - 8}" r="1.6" fill="#ced6db"/>`);
        parts.push(`<circle cx="${px + TILE_PX - 8}" cy="${py + TILE_PX - 8}" r="1.6" fill="#ced6db"/>`);
      } else if (isGasPocket) {
        parts.push(`<rect x="${px + 1.5}" y="${py + 1.5}" width="${TILE_PX - 3}" height="${TILE_PX - 3}" fill="none" stroke="rgba(255,226,184,0.16)" stroke-width="0.8"/>`);
        parts.push(`<circle cx="${px + TILE_PX * 0.38}" cy="${py + TILE_PX * 0.44}" r="${TILE_PX * 0.16}" fill="rgba(158,240,108,0.22)"/>`);
        parts.push(`<circle cx="${px + TILE_PX * 0.6}" cy="${py + TILE_PX * 0.54}" r="${TILE_PX * 0.18}" fill="rgba(158,240,108,0.22)"/>`);
        parts.push(`<circle cx="${px + TILE_PX * 0.46}" cy="${py + TILE_PX * 0.7}" r="${TILE_PX * 0.14}" fill="rgba(158,240,108,0.22)"/>`);
      } else if (isSteamPocket) {
        parts.push(`<rect x="${px + 1.5}" y="${py + 1.5}" width="${TILE_PX - 3}" height="${TILE_PX - 3}" fill="none" stroke="rgba(255,226,184,0.16)" stroke-width="0.8"/>`);
        parts.push(`<circle cx="${px + TILE_PX * 0.36}" cy="${py + TILE_PX * 0.46}" r="${TILE_PX * 0.14}" fill="rgba(255,184,109,0.22)"/>`);
        parts.push(`<circle cx="${px + TILE_PX * 0.58}" cy="${py + TILE_PX * 0.42}" r="${TILE_PX * 0.18}" fill="rgba(255,184,109,0.22)"/>`);
        parts.push(`<circle cx="${px + TILE_PX * 0.48}" cy="${py + TILE_PX * 0.68}" r="${TILE_PX * 0.16}" fill="rgba(255,184,109,0.22)"/>`);
      } else if (isBoulderPocket) {
        parts.push(`<rect x="${px + 1.5}" y="${py + 1.5}" width="${TILE_PX - 3}" height="${TILE_PX - 3}" fill="none" stroke="rgba(255,226,184,0.16)" stroke-width="0.8"/>`);
        parts.push(`<circle cx="${px + TILE_PX * 0.5}" cy="${py + TILE_PX * 0.56}" r="${TILE_PX * 0.28}" fill="#8a6d5d" stroke="#d7b189" stroke-width="0.9"/>`);
        parts.push(`<path d="M ${px + TILE_PX * 0.34} ${py + TILE_PX * 0.54} Q ${px + TILE_PX * 0.48} ${py + TILE_PX * 0.36} ${px + TILE_PX * 0.66} ${py + TILE_PX * 0.5}" fill="none" stroke="#efd1b0" stroke-opacity="0.35" stroke-width="0.9"/>`);
      } else {
        parts.push(`<path d="M ${px + TILE_PX * 0.18} ${py + TILE_PX * 0.3} L ${px + TILE_PX * 0.48} ${py + TILE_PX * 0.58} L ${px + TILE_PX * 0.82} ${py + TILE_PX * 0.22}" fill="none" stroke="${tile.vein}" stroke-opacity="0.45" stroke-width="1"/>`);
      }

      const isScrapOre = map.scrapOreMask[idx];
      if (isScrapOre && !isMetal && !isPocket) {
        parts.push(`<circle cx="${px + TILE_PX * 0.26}" cy="${py + TILE_PX * 0.30}" r="${TILE_PX * 0.22}" fill="#c8920a"/>`);
        parts.push(`<circle cx="${px + TILE_PX * 0.26}" cy="${py + TILE_PX * 0.30}" r="${TILE_PX * 0.16}" fill="#f0c030"/>`);
        parts.push(`<circle cx="${px + TILE_PX * 0.64}" cy="${py + TILE_PX * 0.44}" r="${TILE_PX * 0.20}" fill="#c8920a"/>`);
        parts.push(`<circle cx="${px + TILE_PX * 0.64}" cy="${py + TILE_PX * 0.44}" r="${TILE_PX * 0.14}" fill="#f0c030"/>`);
        parts.push(`<circle cx="${px + TILE_PX * 0.40}" cy="${py + TILE_PX * 0.68}" r="${TILE_PX * 0.18}" fill="#c8920a"/>`);
        parts.push(`<circle cx="${px + TILE_PX * 0.40}" cy="${py + TILE_PX * 0.68}" r="${TILE_PX * 0.12}" fill="#f0c030"/>`);
      }

      const hazardType = map.hazardMask[idx];
      if (!isMetal && hazardType === HAZARD_TYPES.SPIKE) {
        parts.push(`<path d="M ${px + TILE_PX * 0.25} ${py + TILE_PX * 0.78} L ${px + TILE_PX * 0.42} ${py + TILE_PX * 0.28} L ${px + TILE_PX * 0.52} ${py + TILE_PX * 0.62} L ${px + TILE_PX * 0.7} ${py + TILE_PX * 0.2}" fill="none" stroke="${HAZARD_DATA[hazardType].color}" stroke-width="1.5"/>`);
      } else if (!isMetal && hazardType === HAZARD_TYPES.VOLATILE) {
        parts.push(`<circle cx="${px + TILE_PX * 0.5}" cy="${py + TILE_PX * 0.5}" r="${TILE_PX * 0.18}" fill="none" stroke="${HAZARD_DATA[hazardType].color}" stroke-width="1.2"/>`);
        parts.push(`<path d="M ${px + TILE_PX * 0.5} ${py + TILE_PX * 0.24} L ${px + TILE_PX * 0.57} ${py + TILE_PX * 0.45} L ${px + TILE_PX * 0.47} ${py + TILE_PX * 0.45} L ${px + TILE_PX * 0.56} ${py + TILE_PX * 0.76}" fill="none" stroke="${HAZARD_DATA[hazardType].color}" stroke-width="1.2"/>`);
      }
    }
  }

  for (let i = 0; i < map.perkZones.length; i += 1) {
    const zone = map.perkZones[i];
    const perk = TILE_PERK_TYPES[zone.perkType];
    for (let j = 0; j < zone.cells.length; j += 1) {
      const cell = zone.cells[j];
      const zx = cell.x * TILE_PX;
      const zy = cell.y * TILE_PX;
      parts.push(`<rect x="${zx}" y="${zy}" width="${TILE_PX}" height="${TILE_PX}" fill="${perk.color}" fill-opacity="0.08"/>`);
      parts.push(`<rect x="${zx + 2}" y="${zy + 2}" width="${TILE_PX - 4}" height="${TILE_PX - 4}" fill="none" stroke="${perk.color}" stroke-opacity="0.35" stroke-width="1"/>`);
    }
    parts.push(`<text x="${(zone.iconX + 0.5) * TILE_PX}" y="${(zone.iconY + 0.62) * TILE_PX}" fill="${perk.color}" font-size="${Math.max(10, TILE_PX)}" text-anchor="middle" font-family="monospace" font-weight="700">${esc(perk.icon)}</text>`);
  }

  for (let y = 0; y < GRID_H; y += 1) {
    for (let x = 0; x < GRID_W; x += 1) {
      const perkType = map.perkMask[cellIndex(x, y)];
      if (!perkType) continue;
      const perk = TILE_PERK_TYPES[perkType];
      const px = x * TILE_PX;
      const py = y * TILE_PX;
      const cx = px + TILE_PX * 0.5;
      const cy = py + TILE_PX * 0.5;
      parts.push(`<circle cx="${cx}" cy="${cy}" r="${TILE_PX * 0.22}" fill="${perk.color}" fill-opacity="0.34"/>`);
      parts.push(`<path d="M ${cx} ${py + TILE_PX * 0.18} L ${px + TILE_PX * 0.82} ${cy} L ${cx} ${py + TILE_PX * 0.82} L ${px + TILE_PX * 0.18} ${cy} Z" fill="none" stroke="${perk.color}" stroke-width="1.3"/>`);
      parts.push(`<text x="${cx}" y="${cy + TILE_PX * 0.09}" fill="#2b1b14" font-size="${Math.max(8, TILE_PX * 0.44)}" text-anchor="middle" font-family="monospace" font-weight="700">${esc(perk.icon)}</text>`);
    }
  }

  for (let y = 0; y < GRID_H; y += 1) {
    for (let x = 0; x < GRID_W; x += 1) {
      const crystalType = map.crystalMask[cellIndex(x, y)];
      if (!crystalType) continue;
      const crystal = CRYSTAL_TYPES[crystalType];
      const px = x * TILE_PX;
      const py = y * TILE_PX;
      const cx = px + TILE_PX * 0.5;
      const cy = py + TILE_PX * 0.5;
      parts.push(`<circle cx="${cx}" cy="${cy}" r="${TILE_PX * 0.22}" fill="${crystal.color}" fill-opacity="0.2"/>`);
      parts.push(`<path d="M ${cx} ${py + TILE_PX * 0.14} L ${px + TILE_PX * 0.82} ${py + TILE_PX * 0.38} L ${px + TILE_PX * 0.62} ${py + TILE_PX * 0.82} L ${px + TILE_PX * 0.38} ${py + TILE_PX * 0.82} L ${px + TILE_PX * 0.18} ${py + TILE_PX * 0.38} Z" fill="${crystal.color}" stroke="rgba(38,24,16,0.72)" stroke-width="0.8"/>`);
    }
  }

  for (const beacon of map.beacons) {
    const bx = beacon.x * TILE_PX;
    const by = beacon.y * TILE_PX;
    const cx = bx + TILE_PX;
    const cy = by + TILE_PX;
    parts.push(`<rect x="${bx - TILE_PX}" y="${by - TILE_PX}" width="${TILE_PX * 4}" height="${TILE_PX * 4}" fill="none" stroke="rgba(77,208,232,0.28)" stroke-width="1"/>`);
    parts.push(`<rect x="${bx}" y="${by}" width="${TILE_PX * 2}" height="${TILE_PX * 2}" fill="#122a35" stroke="#4dd0e8" stroke-width="1.5"/>`);
    parts.push(`<path d="M ${cx} ${by + TILE_PX * 0.2} L ${bx + TILE_PX * 1.65} ${cy} L ${cx} ${by + TILE_PX * 1.8} L ${bx + TILE_PX * 0.35} ${cy} Z" fill="#4dd0e8" fill-opacity="0.75"/>`);
  }

  const startPx = START_X * TILE_PX;
  const startPy = START_Y * TILE_PX;
  const startCx = startPx + TILE_PX * 0.5;
  const startCy = startPy + TILE_PX * 0.5;
  parts.push(`<circle cx="${startCx}" cy="${startCy}" r="${TILE_PX * 2.2}" fill="#f0d09b" fill-opacity="0.12"/>`);
  parts.push(`<circle cx="${startCx}" cy="${startCy}" r="${TILE_PX * 1.6}" fill="none" stroke="#f0d09b" stroke-width="2.2"/>`);
  parts.push(`<circle cx="${startCx}" cy="${startCy}" r="${TILE_PX * 0.95}" fill="none" stroke="#d3a15a" stroke-width="2.2"/>`);
  parts.push(`<rect x="${startPx + TILE_PX * 0.16}" y="${startPy + TILE_PX * 0.2}" width="${TILE_PX * 0.68}" height="${TILE_PX * 0.48}" fill="#d3a15a"/>`);
  parts.push(`<rect x="${startPx + TILE_PX * 0.3}" y="${startPy + TILE_PX * 0.12}" width="${TILE_PX * 0.4}" height="${TILE_PX * 0.18}" fill="#34231a"/>`);
  parts.push(`<line x1="${startPx + TILE_PX * 0.5}" y1="${startPy + TILE_PX * 0.5}" x2="${startPx + TILE_PX * 0.5}" y2="${startPy + TILE_PX * 0.9}" stroke="#f0d09b" stroke-width="1.8"/>`);

  const basePx = map.base.x * TILE_PX;
  const basePy = map.base.y * TILE_PX;
  const baseCx = basePx + TILE_PX * 0.5;
  const baseCy = basePy + TILE_PX * 0.5;
  parts.push(`<circle cx="${baseCx}" cy="${baseCy}" r="${TILE_PX * 2.2}" fill="#69d2ff" fill-opacity="0.12"/>`);
  parts.push(`<circle cx="${baseCx}" cy="${baseCy}" r="${TILE_PX * 1.6}" fill="none" stroke="#e8fbff" stroke-width="2.2"/>`);
  parts.push(`<circle cx="${baseCx}" cy="${baseCy}" r="${TILE_PX * 0.95}" fill="none" stroke="#69d2ff" stroke-width="2.2"/>`);
  parts.push(`<rect x="${basePx + TILE_PX * 0.14}" y="${basePy + TILE_PX * 0.14}" width="${TILE_PX * 0.72}" height="${TILE_PX * 0.72}" fill="#2b1b14"/>`);
  parts.push(`<rect x="${basePx + TILE_PX * 0.22}" y="${basePy + TILE_PX * 0.22}" width="${TILE_PX * 0.56}" height="${TILE_PX * 0.56}" fill="#c79b58"/>`);
  parts.push(`<rect x="${basePx + TILE_PX * 0.34}" y="${basePy + TILE_PX * 0.28}" width="${TILE_PX * 0.32}" height="${TILE_PX * 0.42}" fill="#6c4120"/>`);
  parts.push(`<text x="${baseCx}" y="${basePy - TILE_PX * 0.35}" fill="#e8fbff" font-size="${Math.max(12, TILE_PX * 0.95)}" text-anchor="middle" font-family="Georgia, serif" font-weight="700">BASE</text>`);

  const legendX = mapW + 18;
  parts.push(`<rect x="${mapW}" y="0" width="${LEGEND_W}" height="${height}" fill="#120d0a"/>`);
  parts.push(`<text x="${legendX}" y="26" fill="#f7ebd4" font-size="18" font-family="Georgia, serif">Map Debug</text>`);
  parts.push(`<text x="${legendX}" y="48" fill="#c6ab84" font-size="12" font-family="Georgia, serif">seed: ${seed}</text>`);
  parts.push(`<text x="${legendX}" y="64" fill="#c6ab84" font-size="12" font-family="Georgia, serif">size: ${GRID_W} x ${GRID_H}</text>`);
  parts.push(`<text x="${legendX}" y="80" fill="#c6ab84" font-size="12" font-family="Georgia, serif">tile perks: ~${getTargetPerkTileCount()}</text>`);
  parts.push(`<text x="${legendX}" y="96" fill="#c6ab84" font-size="12" font-family="Georgia, serif">perk zones: ~${getTargetPerkZoneCount()}</text>`);
  parts.push(`<text x="${legendX}" y="112" fill="#c6ab84" font-size="12" font-family="Georgia, serif">crystals: ~${getTargetCrystalTileCount()}</text>`);

  let legendY = 128;
  for (let i = 1; i < BLOCK_TYPES.length; i += 1) {
    parts.push(`<rect x="${legendX}" y="${legendY - 10}" width="14" height="14" fill="${BLOCK_TYPES[i].color}"/>`);
    parts.push(`<text x="${legendX + 22}" y="${legendY + 1}" fill="#f7ebd4" font-size="12" font-family="Georgia, serif">${esc(BLOCK_TYPES[i].label)}</text>`);
    legendY += 20;
  }

  legendY += 12;
  parts.push(`<rect x="${legendX}" y="${legendY - 10}" width="14" height="14" fill="#69767e"/>`);
  parts.push(`<text x="${legendX + 22}" y="${legendY + 1}" fill="#f7ebd4" font-size="12" font-family="Georgia, serif">Metal Vein</text>`);
  legendY += 20;

  legendY += 12;
  for (const hazardType of [HAZARD_TYPES.SPIKE, HAZARD_TYPES.VOLATILE]) {
    const hazard = HAZARD_DATA[hazardType];
    parts.push(`<rect x="${legendX}" y="${legendY - 10}" width="14" height="14" fill="${hazard.color}"/>`);
    parts.push(`<text x="${legendX + 22}" y="${legendY + 1}" fill="#f7ebd4" font-size="12" font-family="Georgia, serif">${esc(hazard.label)}</text>`);
    legendY += 20;
  }

  legendY += 12;
  parts.push(`<rect x="${legendX}" y="${legendY - 10}" width="14" height="14" fill="#19110d" stroke="rgba(158,240,108,0.5)" stroke-width="1"/>`);
  parts.push(`<text x="${legendX + 22}" y="${legendY + 1}" fill="#f7ebd4" font-size="12" font-family="Georgia, serif">Gas Pocket</text>`);
  legendY += 20;
  parts.push(`<rect x="${legendX}" y="${legendY - 10}" width="14" height="14" fill="#19110d" stroke="rgba(255,184,109,0.5)" stroke-width="1"/>`);
  parts.push(`<text x="${legendX + 22}" y="${legendY + 1}" fill="#f7ebd4" font-size="12" font-family="Georgia, serif">Steam Pocket</text>`);
  legendY += 20;
  parts.push(`<rect x="${legendX}" y="${legendY - 10}" width="14" height="14" fill="#8a6d5d"/>`);
  parts.push(`<text x="${legendX + 22}" y="${legendY + 1}" fill="#f7ebd4" font-size="12" font-family="Georgia, serif">Boulder</text>`);
  legendY += 20;
  parts.push(`<circle cx="${legendX + 4}" cy="${legendY - 4}" r="4" fill="#c8920a"/>`);
  parts.push(`<circle cx="${legendX + 4}" cy="${legendY - 4}" r="2.5" fill="#f0c030"/>`);
  parts.push(`<text x="${legendX + 22}" y="${legendY + 1}" fill="#f7ebd4" font-size="12" font-family="Georgia, serif">Scrap Ore</text>`);
  legendY += 20;

  legendY += 12;
  for (let i = 1; i < TILE_PERK_TYPES.length; i += 1) {
    const perk = TILE_PERK_TYPES[i];
    parts.push(`<rect x="${legendX}" y="${legendY - 10}" width="14" height="14" fill="${perk.color}"/>`);
    parts.push(`<text x="${legendX + 22}" y="${legendY + 1}" fill="#f7ebd4" font-size="12" font-family="Georgia, serif">${esc(perk.name)}</text>`);
    legendY += 20;
  }

  legendY += 12;
  parts.push(`<rect x="${legendX}" y="${legendY - 12}" width="14" height="14" fill="#d3a15a"/>`);
  parts.push(`<text x="${legendX + 22}" y="${legendY + 1}" fill="#f7ebd4" font-size="12" font-family="Georgia, serif">Start</text>`);
  legendY += 20;
  parts.push(`<rect x="${legendX}" y="${legendY - 12}" width="14" height="14" fill="#69d2ff"/>`);
  parts.push(`<text x="${legendX + 22}" y="${legendY + 1}" fill="#f7ebd4" font-size="12" font-family="Georgia, serif">Base</text>`);
  legendY += 20;
  parts.push(`<rect x="${legendX}" y="${legendY - 12}" width="14" height="14" fill="#122a35" stroke="#4dd0e8" stroke-width="1.5"/>`);
  parts.push(`<text x="${legendX + 22}" y="${legendY + 1}" fill="#f7ebd4" font-size="12" font-family="Georgia, serif">Beacon (${BEACON_COUNT})</text>`);

  parts.push(`</svg>`);
  return parts.join("");
}

const { seed, output } = parseArgs(process.argv.slice(2));
const map = generateMap(seed);
const svg = renderSvg(seed, map);
const outputPath = path.resolve(process.cwd(), output);
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, svg, "utf8");
process.stdout.write(`${outputPath}\n`);
