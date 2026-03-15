#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const GRID_W = 150;
const GRID_H = 220;
const START_X = Math.floor(GRID_W / 2);
const START_Y = Math.floor(GRID_H / 2);
const BASE_MIN_DISTANCE = 50;
const PERK_MIN_DISTANCE = 4;
const PERK_ZONE_MIN_DISTANCE = 6;
const TILES_PER_PERK_TILE = 44;
const TILES_PER_PERK_ZONE = 480;
const METAL_VEIN_GROUPS = 16;
const GAS_POCKET_GROUPS = 10;
const STEAM_POCKET_GROUPS = 8;
const BOULDER_POCKET_GROUPS = 8;
const BOULDER_MIN_START_DISTANCE = 4;
const TILE_PX = 12;
const LEGEND_W = 260;
const HAZARD_TYPES = {
  SPIKE: 1,
  VOLATILE: 2,
};
const HAZARD_DATA = {
  [HAZARD_TYPES.SPIKE]: { label: "Spike", color: "#ff6b48" },
  [HAZARD_TYPES.VOLATILE]: { label: "Volatile", color: "#ffd166" },
};

const BLOCK_TYPES = [
  { color: "#1a1410", label: "Tunnel", vein: "#3c2d22" },
  { color: "#5f4631", label: "Tier 1", vein: "#9b7a4a" },
  { color: "#715337", label: "Tier 2", vein: "#c59a5c" },
  { color: "#6a4f37", label: "Tier 3", vein: "#d0a66a" },
  { color: "#6f4f40", label: "Tier 4", vein: "#b66e3b" },
  { color: "#60473f", label: "Tier 5", vein: "#a57f58" },
  { color: "#4f3d36", label: "Tier 6", vein: "#9cb1b7" },
  { color: "#3e3236", label: "Tier 7", vein: "#d6d9df" },
];

const TILE_PERK_TYPES = [
  null,
  { name: "Bak", icon: "F", color: "#ffcf7a" },
  { name: "Radar", icon: "R", color: "#8ef0cb" },
  { name: "Bur", icon: "D", color: "#ff9f6b" },
  { name: "Bomba", icon: "*", color: "#ff7c5f" },
  { name: "Skorost", icon: "S", color: "#9fd7ff" },
  { name: "HP+", icon: "H", color: "#ff8f8f" },
];

const TILE_PERK_WEIGHTS = [0, 7, 3, 2, 4, 3, 2];
const CARDINAL_DIRS = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
];

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

  if (!Number.isFinite(seed)) {
    throw new Error("Seed must be a finite number");
  }

  if (!output) {
    output = path.join("debug", `map-seed-${seed}.svg`);
  }

  return { seed, output };
}

function mulberry32(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(array, random) {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const tmp = array[i];
    array[i] = array[j];
    array[j] = tmp;
  }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function cellIndex(x, y) {
  return y * GRID_W + x;
}

function chooseWeightedPerk(random, weights) {
  let total = 0;
  for (let i = 1; i < weights.length; i += 1) {
    total += weights[i];
  }

  let roll = random() * total;
  for (let i = 1; i < weights.length; i += 1) {
    roll -= weights[i];
    if (roll <= 0) {
      return i;
    }
  }
  return 1;
}

function getTargetPerkTileCount() {
  return Math.max(1, Math.round((GRID_W * GRID_H) / TILES_PER_PERK_TILE));
}

function getTargetPerkZoneCount() {
  return Math.max(1, Math.round((GRID_W * GRID_H) / TILES_PER_PERK_ZONE));
}

function getCenterDistanceRatio(x, y) {
  return clamp(Math.hypot(x - START_X, y - START_Y) / BASE_MIN_DISTANCE, 0, 1.8);
}

function getCenterPerkDensity(x, y) {
  const ratio = getCenterDistanceRatio(x, y);
  return clamp(1.28 - ratio * 0.48, 0.32, 1.28);
}

function chooseTilePerkForPosition(random, x, y) {
  const centerBias = 1 - clamp(getCenterDistanceRatio(x, y), 0, 1);
  const weights = TILE_PERK_WEIGHTS.slice();
  weights[1] += Math.round(centerBias * 6);
  weights[2] += Math.round(centerBias * 4);
  return chooseWeightedPerk(random, weights);
}

function isFarEnoughFromPlaced(x, y, placed, minDistance) {
  for (let i = 0; i < placed.length; i += 1) {
    if (Math.hypot(x - placed[i].x, y - placed[i].y) < minDistance) {
      return false;
    }
  }
  return true;
}

function getExactDistanceOffsets(distance) {
  const offsets = [];
  const seen = new Set();

  for (let dx = 0; dx <= distance; dx += 1) {
    for (let dy = 0; dy <= distance; dy += 1) {
      if (dx * dx + dy * dy !== distance * distance) {
        continue;
      }

      const variants = [
        [dx, dy],
        [dx, -dy],
        [-dx, dy],
        [-dx, -dy],
        [dy, dx],
        [dy, -dx],
        [-dy, dx],
        [-dy, -dx],
      ];

      for (let i = 0; i < variants.length; i += 1) {
        const key = `${variants[i][0]},${variants[i][1]}`;
        if (seen.has(key)) {
          continue;
        }
        seen.add(key);
        offsets.push({ x: variants[i][0], y: variants[i][1] });
      }
    }
  }

  return offsets;
}

function addDangerBlob(field, cx, cy, radius, strength) {
  const minX = Math.max(0, Math.floor(cx - radius));
  const maxX = Math.min(GRID_W - 1, Math.ceil(cx + radius));
  const minY = Math.max(0, Math.floor(cy - radius));
  const maxY = Math.min(GRID_H - 1, Math.ceil(cy + radius));

  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.hypot(dx, dy);
      if (dist > radius) {
        continue;
      }
      field[cellIndex(x, y)] += strength * (1 - dist / radius);
    }
  }
}

function addDangerVein(random, field, startX, startY, length, radius, strength) {
  let x = startX;
  let y = startY;
  let angle = random() * Math.PI * 2;

  for (let step = 0; step < length; step += 1) {
    addDangerBlob(field, x, y, radius, strength);
    angle += (random() - 0.5) * 0.95;
    x = clamp(x + Math.cos(angle) * 1.35, 1, GRID_W - 2);
    y = clamp(y + Math.sin(angle) * 1.35, 1, GRID_H - 2);
  }
}

function chooseHazardType(random, x, y) {
  const centerRatio = clamp(Math.hypot(x - START_X, y - START_Y) / BASE_MIN_DISTANCE, 0, 1.4);
  const roll = random() + centerRatio * 0.2;
  if (roll > 1.0) {
    return HAZARD_TYPES.VOLATILE;
  }
  return HAZARD_TYPES.SPIKE;
}

function getHazardOrigin(random) {
  if (random() < 0.35) {
    return {
      x: Math.round(clamp(START_X + (random() - 0.5) * 56, 1, GRID_W - 2)),
      y: Math.round(clamp(START_Y + (random() - 0.5) * 56, 1, GRID_H - 2)),
    };
  }
  return {
    x: 1 + Math.floor(random() * (GRID_W - 2)),
    y: 1 + Math.floor(random() * (GRID_H - 2)),
  };
}

function canPlaceHazardAt(x, y) {
  return x >= 1 && y >= 1 && x < GRID_W - 1 && y < GRID_H - 1 && !(x === START_X && y === START_Y);
}

function canPlaceMetalAt(x, y) {
  return x >= 1 && y >= 1 && x < GRID_W - 1 && y < GRID_H - 1 && !(x === START_X && y === START_Y);
}

function canPlaceGasPocketAt(x, y) {
  return x >= 2 && y >= 2 && x < GRID_W - 2 && y < GRID_H - 2 && !(x === START_X && y === START_Y);
}

function canPlaceSteamPocketAt(x, y) {
  return x >= 2 && y >= 2 && x < GRID_W - 2 && y < GRID_H - 2 && !(x === START_X && y === START_Y);
}

function canPlaceBoulderPocketAt(x, y) {
  return x >= 2 && y >= 2 && x < GRID_W - 2 && y < GRID_H - 2 && !(x === START_X && y === START_Y);
}

function placeHazardBlob(mask, random, blockCount) {
  const origin = getHazardOrigin(random);
  const hazardType = chooseHazardType(random, origin.x, origin.y);
  const frontier = [{ x: origin.x, y: origin.y }];
  const seen = new Set();
  let placed = 0;

  while (frontier.length > 0 && placed < blockCount) {
    const frontierIndex = Math.floor(random() * frontier.length);
    const cell = frontier.splice(frontierIndex, 1)[0];
    const key = `${cell.x},${cell.y}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    if (!canPlaceHazardAt(cell.x, cell.y)) {
      continue;
    }

    mask[cellIndex(cell.x, cell.y)] = hazardType;
    placed += 1;

    const neighbors = [
      { x: cell.x + 1, y: cell.y },
      { x: cell.x - 1, y: cell.y },
      { x: cell.x, y: cell.y + 1 },
      { x: cell.x, y: cell.y - 1 },
      { x: cell.x + 1, y: cell.y + 1 },
      { x: cell.x + 1, y: cell.y - 1 },
      { x: cell.x - 1, y: cell.y + 1 },
      { x: cell.x - 1, y: cell.y - 1 },
    ];
    for (let i = 0; i < neighbors.length; i += 1) {
      if (random() < 0.88) {
        frontier.push(neighbors[i]);
      }
    }
  }
}

function placeHazardVein(mask, random, blockCount) {
  const origin = getHazardOrigin(random);
  const hazardType = chooseHazardType(random, origin.x, origin.y);
  let x = origin.x;
  let y = origin.y;
  let angle = random() * Math.PI * 2;
  let placed = 0;
  let attempts = 0;

  while (placed < blockCount && attempts < blockCount * 8) {
    attempts += 1;
    const ix = Math.round(x);
    const iy = Math.round(y);
    if (canPlaceHazardAt(ix, iy)) {
      mask[cellIndex(ix, iy)] = hazardType;
      placed += 1;
    }
    angle += (random() - 0.5) * 0.85;
    x = clamp(x + Math.cos(angle) * 1.05, 1, GRID_W - 2);
    y = clamp(y + Math.sin(angle) * 1.05, 1, GRID_H - 2);
  }
}

function placeMetalVein(mask, hazardMask, gasPocketMask, steamPocketMask, boulderPocketMask, random, blockCount) {
  const origin = getHazardOrigin(random);
  let x = origin.x;
  let y = origin.y;
  let angle = random() * Math.PI * 2;
  let placed = 0;
  let attempts = 0;

  while (placed < blockCount && attempts < blockCount * 10) {
    attempts += 1;
    const ix = Math.round(x);
    const iy = Math.round(y);
    if (canPlaceMetalAt(ix, iy)) {
      const index = cellIndex(ix, iy);
      mask[index] = 1;
      hazardMask[index] = 0;
      gasPocketMask[index] = 0;
      steamPocketMask[index] = 0;
      boulderPocketMask[index] = 0;
      placed += 1;
    }
    angle += (random() - 0.5) * 0.55;
    x = clamp(x + Math.cos(angle) * 1.05, 1, GRID_W - 2);
    y = clamp(y + Math.sin(angle) * 1.05, 1, GRID_H - 2);
  }
}

function placeGasPocket(mask, hazardMask, random, cellCount) {
  const origin = getHazardOrigin(random);
  const frontier = [{ x: origin.x, y: origin.y }];
  const seen = new Set();
  let placed = 0;

  while (frontier.length > 0 && placed < cellCount) {
    const frontierIndex = Math.floor(random() * frontier.length);
    const cell = frontier.splice(frontierIndex, 1)[0];
    const key = `${cell.x},${cell.y}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    if (!canPlaceGasPocketAt(cell.x, cell.y)) {
      continue;
    }

    const index = cellIndex(cell.x, cell.y);
    mask[index] = 1;
    hazardMask[index] = 0;
    placed += 1;

    const neighbors = [
      { x: cell.x + 1, y: cell.y },
      { x: cell.x - 1, y: cell.y },
      { x: cell.x, y: cell.y + 1 },
      { x: cell.x, y: cell.y - 1 },
      { x: cell.x + 1, y: cell.y + 1 },
      { x: cell.x + 1, y: cell.y - 1 },
      { x: cell.x - 1, y: cell.y + 1 },
      { x: cell.x - 1, y: cell.y - 1 },
    ];
    for (let i = 0; i < neighbors.length; i += 1) {
      if (random() < 0.82) {
        frontier.push(neighbors[i]);
      }
    }
  }
}

function placeSteamPocket(mask, hazardMask, gasPocketMask, random, cellCount) {
  const origin = getHazardOrigin(random);
  const frontier = [{ x: origin.x, y: origin.y }];
  const seen = new Set();
  let placed = 0;

  while (frontier.length > 0 && placed < cellCount) {
    const frontierIndex = Math.floor(random() * frontier.length);
    const cell = frontier.splice(frontierIndex, 1)[0];
    const key = `${cell.x},${cell.y}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    if (!canPlaceSteamPocketAt(cell.x, cell.y)) {
      continue;
    }

    const index = cellIndex(cell.x, cell.y);
    mask[index] = 1;
    hazardMask[index] = 0;
    gasPocketMask[index] = 0;
    placed += 1;

    const neighbors = [
      { x: cell.x + 1, y: cell.y },
      { x: cell.x - 1, y: cell.y },
      { x: cell.x, y: cell.y + 1 },
      { x: cell.x, y: cell.y - 1 },
      { x: cell.x + 1, y: cell.y + 1 },
      { x: cell.x + 1, y: cell.y - 1 },
      { x: cell.x - 1, y: cell.y + 1 },
      { x: cell.x - 1, y: cell.y - 1 },
    ];
    for (let i = 0; i < neighbors.length; i += 1) {
      if (random() < 0.78) {
        frontier.push(neighbors[i]);
      }
    }
  }
}

function placeBoulderPocket(mask, hazardMask, gasPocketMask, steamPocketMask, random) {
  const origin = getHazardOrigin(random);
  if (!canPlaceBoulderPocketAt(origin.x, origin.y)) {
    return;
  }
  if (Math.hypot(origin.x - START_X, origin.y - START_Y) < BOULDER_MIN_START_DISTANCE) {
    return;
  }
  for (let y = 1; y < GRID_H - 1; y += 1) {
    if (mask[cellIndex(origin.x, y)]) {
      return;
    }
  }
  for (let x = 1; x < GRID_W - 1; x += 1) {
    if (mask[cellIndex(x, origin.y)]) {
      return;
    }
  }

  const index = cellIndex(origin.x, origin.y);
  mask[index] = 1;
  hazardMask[index] = 0;
  gasPocketMask[index] = 0;
  steamPocketMask[index] = 0;
}

function generateMap(seed) {
  const random = mulberry32(seed);
  const danger = new Float32Array(GRID_W * GRID_H);
  const hardness = new Uint8Array(GRID_W * GRID_H);
  const hazardMask = new Uint8Array(GRID_W * GRID_H);
  const metalMask = new Uint8Array(GRID_W * GRID_H);
  const gasPocketMask = new Uint8Array(GRID_W * GRID_H);
  const steamPocketMask = new Uint8Array(GRID_W * GRID_H);
  const boulderPocketMask = new Uint8Array(GRID_W * GRID_H);
  const perkMask = new Uint8Array(GRID_W * GRID_H);
  const perkZoneMask = new Int32Array(GRID_W * GRID_H);
  perkZoneMask.fill(-1);
  const perkZones = [];

  for (let y = 0; y < GRID_H; y += 1) {
    for (let x = 0; x < GRID_W; x += 1) {
      const distanceRatio = clamp(Math.hypot(x - START_X, y - START_Y) / 95, 0, 1);
      danger[cellIndex(x, y)] = 1 + distanceRatio * 5.6;
    }
  }

  const area = GRID_W * GRID_H;
  const blobCount = Math.max(18, Math.round(area / 1500));
  for (let i = 0; i < blobCount; i += 1) {
    addDangerBlob(
      danger,
      2 + random() * (GRID_W - 4),
      2 + random() * (GRID_H - 4),
      8 + random() * 20,
      -1.2 + random() * 2.5,
    );
  }

  const softVeins = Math.max(10, Math.round(area / 2600));
  const hardVeins = Math.max(12, Math.round(area / 2200));
  const ultraVeins = Math.max(6, Math.round(area / 5200));

  for (let i = 0; i < softVeins; i += 1) {
    addDangerVein(random, danger, 2 + random() * (GRID_W - 4), 2 + random() * (GRID_H - 4), 14 + Math.floor(random() * 24), 1.3 + random() * 1.6, -0.95 - random() * 0.35);
  }
  for (let i = 0; i < hardVeins; i += 1) {
    addDangerVein(random, danger, 2 + random() * (GRID_W - 4), 2 + random() * (GRID_H - 4), 16 + Math.floor(random() * 28), 1.1 + random() * 1.2, 0.85 + random() * 0.55);
  }
  for (let i = 0; i < ultraVeins; i += 1) {
    addDangerVein(random, danger, 2 + random() * (GRID_W - 4), 2 + random() * (GRID_H - 4), 10 + Math.floor(random() * 16), 0.9 + random() * 0.8, 1.35 + random() * 0.75);
  }

  for (let y = 0; y < GRID_H; y += 1) {
    for (let x = 0; x < GRID_W; x += 1) {
      const index = cellIndex(x, y);
      const microNoise = (((x * 17 + y * 31) % 13) - 6) * 0.08;
      hardness[index] = clamp(Math.round(danger[index] + microNoise), 1, 7);
      hazardMask[index] = 0;
    }
  }

  const hazardBlobGroups = Math.max(12, Math.round(area / 3000));
  const hazardVeinGroups = Math.max(12, Math.round(area / 3000));
  for (let i = 0; i < hazardBlobGroups; i += 1) {
    placeHazardBlob(hazardMask, random, 4 + Math.floor(random() * 17));
  }
  for (let i = 0; i < hazardVeinGroups; i += 1) {
    placeHazardVein(hazardMask, random, 4 + Math.floor(random() * 37));
  }
  for (let i = 0; i < METAL_VEIN_GROUPS; i += 1) {
    placeMetalVein(metalMask, hazardMask, gasPocketMask, steamPocketMask, boulderPocketMask, random, 12 + Math.floor(random() * 22));
  }
  for (let i = 0; i < GAS_POCKET_GROUPS; i += 1) {
    placeGasPocket(gasPocketMask, hazardMask, random, 4 + Math.floor(random() * 10));
  }
  for (let i = 0; i < STEAM_POCKET_GROUPS; i += 1) {
    placeSteamPocket(steamPocketMask, hazardMask, gasPocketMask, random, 4 + Math.floor(random() * 10));
  }
  for (let i = 0; i < BOULDER_POCKET_GROUPS; i += 1) {
    placeBoulderPocket(boulderPocketMask, hazardMask, gasPocketMask, steamPocketMask, random);
  }

  const offsets = getExactDistanceOffsets(BASE_MIN_DISTANCE);
  shuffle(offsets, random);
  let base = null;
  for (let i = 0; i < offsets.length; i += 1) {
    const x = START_X + offsets[i].x;
    const y = START_Y + offsets[i].y;
    if (x >= 3 && x <= GRID_W - 4 && y >= 3 && y <= GRID_H - 4) {
      base = { x, y };
      break;
    }
  }

  if (!base) {
    throw new Error("Unable to place base");
  }

  const placedPerks = [];
  const targetPerks = getTargetPerkTileCount();
  let perkAttempts = 0;
  while (placedPerks.length < targetPerks && perkAttempts < targetPerks * 80) {
    const x = 2 + Math.floor(random() * (GRID_W - 4));
    const y = 2 + Math.floor(random() * (GRID_H - 4));
    const index = cellIndex(x, y);
    perkAttempts += 1;

    if ((x === START_X && y === START_Y) || (x === base.x && y === base.y)) {
      continue;
    }
    if (perkMask[index] > 0) {
      continue;
    }
    if (!isFarEnoughFromPlaced(x, y, placedPerks, PERK_MIN_DISTANCE)) {
      continue;
    }
    if (random() > getCenterPerkDensity(x, y)) {
      continue;
    }
    if (metalMask[index] || gasPocketMask[index] || steamPocketMask[index] || boulderPocketMask[index]) {
      continue;
    }

    perkMask[index] = chooseTilePerkForPosition(random, x, y);
    placedPerks.push({ x, y });
  }

  const placedZones = [];
  const targetZones = getTargetPerkZoneCount();
  let zoneAttempts = 0;
  while (perkZones.length < targetZones && zoneAttempts < targetZones * 120) {
    const shape = createPerkZoneShape(random);
    const originX = 1 + Math.floor(random() * Math.max(1, GRID_W - shape.width - 2));
    const originY = 1 + Math.floor(random() * Math.max(1, GRID_H - shape.height - 2));
    zoneAttempts += 1;
    const centerX = originX + shape.centerX;
    const centerY = originY + shape.centerY;

    if ((centerX === START_X && centerY === START_Y) || (centerX === base.x && centerY === base.y)) {
      continue;
    }
    if (!isFarEnoughFromPlaced(centerX, centerY, placedZones, PERK_ZONE_MIN_DISTANCE)) {
      continue;
    }

    let overlaps = false;
    const cells = [];
    for (let i = 0; i < shape.cells.length; i += 1) {
      const cell = shape.cells[i];
      const x = originX + cell.x;
      const y = originY + cell.y;
      const index = cellIndex(x, y);
      if (
        (x === START_X && y === START_Y) ||
        (x === base.x && y === base.y) ||
        perkZoneMask[index] !== -1 ||
        metalMask[index] ||
        gasPocketMask[index] ||
        steamPocketMask[index] ||
        boulderPocketMask[index]
      ) {
        overlaps = true;
        break;
      }
      cells.push({ x, y });
    }
    if (overlaps) {
      continue;
    }

    const zoneId = perkZones.length;
    const perkType = chooseTilePerkForPosition(random, centerX, centerY);
    perkZones.push({
      x: centerX,
      y: centerY,
      perkType,
      cells,
      iconX: originX + shape.iconX,
      iconY: originY + shape.iconY,
    });
    placedZones.push({ x: centerX, y: centerY });

    for (let i = 0; i < cells.length; i += 1) {
      perkZoneMask[cellIndex(cells[i].x, cells[i].y)] = zoneId;
    }
  }

  return { hardness, hazardMask, metalMask, gasPocketMask, steamPocketMask, boulderPocketMask, perkMask, perkZones, base };
}

function createPerkZoneShape(random) {
  const targetCells = 6 + Math.floor(random() * 4);
  const cells = [{ x: 0, y: 0 }];
  const used = new Set(["0,0"]);
  let minX = 0;
  let maxX = 0;
  let minY = 0;
  let maxY = 0;
  let growthAttempts = 0;

  while (cells.length < targetCells && growthAttempts < 80) {
    const base = cells[Math.floor(random() * cells.length)];
    const dir = CARDINAL_DIRS[Math.floor(random() * CARDINAL_DIRS.length)];
    const nextX = base.x + dir.x;
    const nextY = base.y + dir.y;
    const key = `${nextX},${nextY}`;
    growthAttempts += 1;

    if (used.has(key)) {
      continue;
    }

    const nextMinX = Math.min(minX, nextX);
    const nextMaxX = Math.max(maxX, nextX);
    const nextMinY = Math.min(minY, nextY);
    const nextMaxY = Math.max(maxY, nextY);
    if (nextMaxX - nextMinX > 3 || nextMaxY - nextMinY > 3) {
      continue;
    }

    used.add(key);
    cells.push({ x: nextX, y: nextY });
    minX = nextMinX;
    maxX = nextMaxX;
    minY = nextMinY;
    maxY = nextMaxY;
  }

  const normalizedCells = [];
  let sumX = 0;
  let sumY = 0;
  for (let i = 0; i < cells.length; i += 1) {
    const x = cells[i].x - minX;
    const y = cells[i].y - minY;
    normalizedCells.push({ x, y });
    sumX += x;
    sumY += y;
  }

  const centroidX = sumX / normalizedCells.length;
  const centroidY = sumY / normalizedCells.length;
  let iconCell = normalizedCells[0];
  let bestDistance = Infinity;
  for (let i = 0; i < normalizedCells.length; i += 1) {
    const cell = normalizedCells[i];
    const dist = Math.hypot(cell.x - centroidX, cell.y - centroidY);
    if (dist < bestDistance) {
      bestDistance = dist;
      iconCell = cell;
    }
  }

  return {
    cells: normalizedCells,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
    centerX: centroidX,
    centerY: centroidY,
    iconX: iconCell.x,
    iconY: iconCell.y,
  };
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

  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
  );
  parts.push(`<rect width="${width}" height="${height}" fill="#0b0706"/>`);

  parts.push(`<rect x="0" y="0" width="${mapW}" height="${mapH}" fill="#0f0907"/>`);

  for (let y = 0; y < GRID_H; y += 1) {
    for (let x = 0; x < GRID_W; x += 1) {
      const type = map.hardness[cellIndex(x, y)];
      const tile = BLOCK_TYPES[type];
      const px = x * TILE_PX;
      const py = y * TILE_PX;
      const isGasPocket = map.gasPocketMask && map.gasPocketMask[cellIndex(x, y)];
      const isSteamPocket = map.steamPocketMask && map.steamPocketMask[cellIndex(x, y)];
      const isBoulderPocket = map.boulderPocketMask && map.boulderPocketMask[cellIndex(x, y)];
      const isMetal = map.metalMask && map.metalMask[cellIndex(x, y)];
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
        parts.push(
          `<path d="M ${px + TILE_PX * 0.18} ${py + TILE_PX * 0.3} L ${px + TILE_PX * 0.48} ${py + TILE_PX * 0.58} L ${px + TILE_PX * 0.82} ${py + TILE_PX * 0.22}" fill="none" stroke="${tile.vein}" stroke-opacity="0.45" stroke-width="1"/>`,
        );
      }
      const hazardType = map.hazardMask[cellIndex(x, y)];
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
      if (!perkType) {
        continue;
      }
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

  const startPx = START_X * TILE_PX;
  const startPy = START_Y * TILE_PX;
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

  let legendY = 128;
  for (let i = 1; i < BLOCK_TYPES.length; i += 1) {
    parts.push(`<rect x="${legendX}" y="${legendY - 10}" width="14" height="14" fill="${BLOCK_TYPES[i].color}"/>`);
    parts.push(
      `<text x="${legendX + 22}" y="${legendY + 1}" fill="#f7ebd4" font-size="12" font-family="Georgia, serif">${esc(BLOCK_TYPES[i].label)}</text>`,
    );
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
    parts.push(
      `<text x="${legendX + 22}" y="${legendY + 1}" fill="#f7ebd4" font-size="12" font-family="Georgia, serif">${esc(hazard.label)}</text>`,
    );
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

  legendY += 12;
  for (let i = 1; i < TILE_PERK_TYPES.length; i += 1) {
    const perk = TILE_PERK_TYPES[i];
    parts.push(`<rect x="${legendX}" y="${legendY - 10}" width="14" height="14" fill="${perk.color}"/>`);
    parts.push(
      `<text x="${legendX + 22}" y="${legendY + 1}" fill="#f7ebd4" font-size="12" font-family="Georgia, serif">${esc(perk.name)}</text>`,
    );
    legendY += 20;
  }

  legendY += 12;
  parts.push(`<rect x="${legendX}" y="${legendY - 12}" width="14" height="14" fill="#d3a15a"/>`);
  parts.push(`<text x="${legendX + 22}" y="${legendY + 1}" fill="#f7ebd4" font-size="12" font-family="Georgia, serif">Start</text>`);
  legendY += 20;
  parts.push(`<rect x="${legendX}" y="${legendY - 12}" width="14" height="14" fill="#69d2ff"/>`);
  parts.push(`<text x="${legendX + 22}" y="${legendY + 1}" fill="#f7ebd4" font-size="12" font-family="Georgia, serif">Base</text>`);

  parts.push(`</svg>`);
  return parts.join("");
}

function main() {
  const { seed, output } = parseArgs(process.argv.slice(2));
  const map = generateMap(seed);
  const svg = renderSvg(seed, map);
  const outputPath = path.resolve(process.cwd(), output);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, svg, "utf8");
  process.stdout.write(`${outputPath}\n`);
}

main();
