// World generation module — pure functions, no game state.
// Both game.js and the debug render script import from here.

// Vertical dungeon map: player starts at top, difficulty increases with depth.
export const GRID_W = 100;
export const GRID_H = 240;
export const START_X = Math.floor(GRID_W / 2);
export const START_Y = 1;

export const VISION_RADIUS = 5;
const START_EASY_RADIUS = VISION_RADIUS;
const START_NEAR_RADIUS = 7;
const START_NEAR_GOLD_COUNT = 12;
// Base hides in the bottom zone (deep floor)
const BASE_ZONE_MIN_Y = Math.floor(GRID_H * 0.82); // ~197
const BASE_ZONE_MAX_Y = GRID_H - 5;
// Entry beacons: one left, one right of start at shallow depth
const ENTRY_BEACON_X_OFFSET = 14;
const ENTRY_BEACON_Y = START_Y + 8;
const PERK_MIN_DISTANCE = 4;
const PERK_ZONE_MIN_DISTANCE = 6;
const TILES_PER_PERK_TILE = 26;
const TILES_PER_PERK_ZONE = 380;
const TILES_PER_CRYSTAL_TILE = 22;
const CRYSTAL_MIN_DISTANCE = 3;
const METAL_VEIN_GROUPS = 14;
const GOLD_ORE_GROUPS = 135;
const GAS_POCKET_GROUPS = 10;
const STEAM_POCKET_GROUPS = 8;
const BOULDER_POCKET_GROUPS = 8;
const BOULDER_MIN_START_DISTANCE = 4;
export const BEACON_COUNT = 22;
const BEACON_MIN_DEPTH = 18;  // min Y below START_Y for regular beacons
const BEACON_MIN_SPACING = 12; // min distance between any two beacons
const ARTIFACT_MIN_DISTANCE = 8;
const ARTIFACT_MIN_BEACON_DIST = 5;
const SAFE_COUNT = 4;
const SAFE_MIN_DISTANCE = 20;
const SAFE_MIN_START_DISTANCE = 20;
const SAFE_KEY_MIN_DIST = 6;
const SAFE_KEY_MAX_DIST = 14;
const WORM_NEST_COUNT = 6;
const WORM_NEST_MIN_DISTANCE = 18;
const WORM_NEST_MIN_START_DISTANCE = 25;
const WORM_NEST_MIN_BEACON_DIST = 5;

export const HAZARD_TYPES = { SPIKE: 1, VOLATILE: 2 };

export const BLOCK_TYPES = [
  { color: "#1a1410", label: "Tunnel",  vein: "#3c2d22" },
  { color: "#5f4631", label: "Tier 1",  vein: "#9b7a4a" },
  { color: "#715337", label: "Tier 2",  vein: "#c59a5c" },
  { color: "#6a4f37", label: "Tier 3",  vein: "#d0a66a" },
  { color: "#6f4f40", label: "Tier 4",  vein: "#b66e3b" },
  { color: "#60473f", label: "Tier 5",  vein: "#a57f58" },
  { color: "#4f3d36", label: "Tier 6",  vein: "#9cb1b7" },
  { color: "#3e3236", label: "Tier 7",  vein: "#d6d9df" },
];

export const TILE_PERK_TYPES = [
  null,
  { name: "Бак",         icon: "F", color: "#ffcf7a" },
  { name: "Радар",       icon: "R", color: "#f2ede2" },
  { name: "Бур",         icon: "D", color: "#ff9f6b" },
  { name: "Бомба",       icon: "*", color: "#c796ff" },
  { name: "Скорость",    icon: "S", color: "#9fd7ff" },
  { name: "HP+",         icon: "H", color: "#73e58f" },
  { name: "Броня",       icon: "A", color: "#b4d7ff" },
];

export const TILE_PERK_WEIGHTS = [0, 7, 0, 0, 4, 0, 2, 2];

export const CRYSTAL_TYPES = [
  null,
  { name: "Red",    color: "#ff4747" },
  { name: "Yellow", color: "#ffd166" },
  { name: "Pale",   color: "#f2ede2" },
  { name: "Green",  color: "#73e58f" },
  { name: "Blue",   color: "#72b7ff" },
];

const CARDINAL_DIRS = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
];

// ── RNG ─────────────────────────────────────────────────────────────────────

export function mulberry32(seed) {
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

// ── Grid helpers ─────────────────────────────────────────────────────────────

export function cellIndex(x, y) {
  return y * GRID_W + x;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function isInStartEasyRadius(x, y) {
  return Math.hypot(x - START_X, y - START_Y) <= START_EASY_RADIUS;
}

function isFarEnoughFromPlaced(x, y, placed, minDistance) {
  for (let i = 0; i < placed.length; i += 1) {
    if (Math.hypot(x - placed[i].x, y - placed[i].y) < minDistance) return false;
  }
  return true;
}

function getExactDistanceOffsets(distance) {
  const offsets = [];
  const seen = new Set();
  for (let dx = 0; dx <= distance; dx += 1) {
    for (let dy = 0; dy <= distance; dy += 1) {
      if (dx * dx + dy * dy !== distance * distance) continue;
      const variants = [
        [dx, dy], [dx, -dy], [-dx, dy], [-dx, -dy],
        [dy, dx], [dy, -dx], [-dy, dx], [-dy, -dx],
      ];
      for (let i = 0; i < variants.length; i += 1) {
        const key = `${variants[i][0]},${variants[i][1]}`;
        if (seen.has(key)) continue;
        seen.add(key);
        offsets.push({ x: variants[i][0], y: variants[i][1] });
      }
    }
  }
  return offsets;
}

// ── Perk / crystal helpers ────────────────────────────────────────────────────

export function getTargetPerkTileCount() {
  return Math.max(1, Math.round((GRID_W * GRID_H) / TILES_PER_PERK_TILE));
}

export function getTargetPerkZoneCount() {
  return Math.max(1, Math.round((GRID_W * GRID_H) / TILES_PER_PERK_ZONE));
}

export function getTargetCrystalTileCount() {
  return Math.max(4, Math.round((GRID_W * GRID_H) / TILES_PER_CRYSTAL_TILE));
}

// Depth fraction: 0 at player start, 1 at bottom of map.
function getDepthRatio(x, y) {
  return clamp((y - START_Y) / (GRID_H - START_Y - 15), 0, 1.5);
}

function getCenterPerkDensity(x, y) {
  const depth = getDepthRatio(x, y);
  // More perks in the upper half where the player needs support,
  // thinning out as depth increases.
  return clamp(1.15 - depth * 0.35, 0.5, 1.4);
}

function getPerkZoneDensity(x, y) {
  const depth = getDepthRatio(x, y);
  return clamp(1.0 - depth * 0.25, 0.45, 1.2);
}

function chooseWeightedPerk(random, weights) {
  let total = 0;
  for (let i = 1; i < weights.length; i += 1) total += weights[i];
  let roll = random() * total;
  for (let i = 1; i < weights.length; i += 1) {
    roll -= weights[i];
    if (roll <= 0) return i;
  }
  return 1;
}

function chooseTilePerkForPosition(x, y, random) {
  const weights = TILE_PERK_WEIGHTS.slice();
  return chooseWeightedPerk(random, weights);
}

function chooseCrystalType(random) {
  return 1 + Math.floor(random() * (CRYSTAL_TYPES.length - 1));
}

// ── Hardness map ──────────────────────────────────────────────────────────────

function addDangerBlob(field, cx, cy, radius, strength) {
  const minX = Math.max(0, Math.floor(cx - radius));
  const maxX = Math.min(GRID_W - 1, Math.ceil(cx + radius));
  const minY = Math.max(0, Math.floor(cy - radius));
  const maxY = Math.min(GRID_H - 1, Math.ceil(cy + radius));
  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const dist = Math.hypot(x - cx, y - cy);
      if (dist > radius) continue;
      field[cellIndex(x, y)] += strength * (1 - dist / radius);
    }
  }
}

function addDangerVein(field, startX, startY, length, radius, strength, random) {
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

function buildHardness(random) {
  const danger = new Float32Array(GRID_W * GRID_H);
  const maxDepth = GRID_H - START_Y - 15;
  // Base danger: purely depth-driven — tier 1 at top, tier 7 at bottom.
  for (let y = 0; y < GRID_H; y += 1) {
    for (let x = 0; x < GRID_W; x += 1) {
      const depthFraction = clamp((y - START_Y) / maxDepth, 0, 1);
      danger[cellIndex(x, y)] = 0.8 + depthFraction * 5.4;
    }
  }
  // Add blobs and veins for local variety.
  const area = GRID_W * GRID_H;
  const blobCount = Math.max(20, Math.round(area / 1100));
  for (let i = 0; i < blobCount; i += 1) {
    // Bias blobs toward mid/deep zones for variety there; a few near top too.
    const blobY = START_Y + 5 + random() * (GRID_H - START_Y - 10);
    addDangerBlob(danger, 2 + random() * (GRID_W - 4), blobY, 8 + random() * 22, -1.5 + random() * 3.0);
  }
  const softVeins = Math.max(10, Math.round(area / 2800));
  const hardVeins = Math.max(12, Math.round(area / 2400));
  const ultraVeins = Math.max(5, Math.round(area / 5500));
  for (let i = 0; i < softVeins; i += 1) {
    const vy = START_Y + 5 + random() * (GRID_H - START_Y - 10);
    addDangerVein(danger, 2 + random() * (GRID_W - 4), vy, 12 + Math.floor(random() * 22), 1.2 + random() * 1.5, -0.9 - random() * 0.4, random);
  }
  for (let i = 0; i < hardVeins; i += 1) {
    const vy = START_Y + 5 + random() * (GRID_H - START_Y - 10);
    addDangerVein(danger, 2 + random() * (GRID_W - 4), vy, 14 + Math.floor(random() * 26), 1.0 + random() * 1.1, 0.8 + random() * 0.6, random);
  }
  for (let i = 0; i < ultraVeins; i += 1) {
    // Ultra-hard veins appear mostly in the deep zone.
    const vy = START_Y + maxDepth * 0.5 + random() * (maxDepth * 0.5);
    addDangerVein(danger, 2 + random() * (GRID_W - 4), vy, 8 + Math.floor(random() * 14), 0.8 + random() * 0.7, 1.4 + random() * 0.8, random);
  }
  const hardness = new Uint8Array(GRID_W * GRID_H);
  for (let y = 0; y < GRID_H; y += 1) {
    for (let x = 0; x < GRID_W; x += 1) {
      const index = cellIndex(x, y);
      const microNoise = (((x * 17 + y * 31) % 13) - 6) * 0.16;
      hardness[index] = clamp(Math.round(danger[index] + microNoise), 1, 7);
      if (isInStartEasyRadius(x, y)) hardness[index] = 1;
    }
  }
  return hardness;
}

// ── Placement helpers ─────────────────────────────────────────────────────────

function chooseHazardType(random, x, y) {
  const depthRatio = clamp((y - START_Y) / (GRID_H - START_Y), 0, 1.4);
  const roll = random() + depthRatio * 0.2;
  return roll > 0.8 ? HAZARD_TYPES.VOLATILE : HAZARD_TYPES.SPIKE;
}

function getHazardOrigin(random) {
  // 20% chance: cluster near upper-mid zone for early challenge.
  if (random() < 0.2) {
    return {
      x: Math.round(clamp(START_X + (random() - 0.5) * 50, 1, GRID_W - 2)),
      y: Math.round(clamp(START_Y + 15 + random() * 50, START_Y + 15, START_Y + 80)),
    };
  }
  // Otherwise: anywhere below the easy zone, biased toward middle-deep.
  return {
    x: 1 + Math.floor(random() * (GRID_W - 2)),
    y: START_Y + 10 + Math.floor(random() * (GRID_H - START_Y - 15)),
  };
}

function canPlaceHazardAt(x, y) {
  return x >= 1 && y >= 1 && x < GRID_W - 1 && y < GRID_H - 1 && !(x === START_X && y === START_Y) && !isInStartEasyRadius(x, y);
}

function canPlaceMetalAt(x, y) {
  return x >= 1 && y >= 1 && x < GRID_W - 1 && y < GRID_H - 1 && !(x === START_X && y === START_Y) && !isInStartEasyRadius(x, y);
}

function canPlaceGoldOreAt(x, y) {
  return x >= 1 && y >= 1 && x < GRID_W - 1 && y < GRID_H - 1 && !(x === START_X && y === START_Y) && !isInStartEasyRadius(x, y);
}

function canPlaceGasPocketAt(x, y, steamPocketMask, boulderPocketMask) {
  if (x < 2 || y < 2 || x >= GRID_W - 2 || y >= GRID_H - 2) return false;
  if (x === START_X && y === START_Y) return false;
  if (isInStartEasyRadius(x, y)) return false;
  const idx = cellIndex(x, y);
  // Don't overlap with other pocket types (including 1-cell border)
  if (steamPocketMask && isPocketNeighbor(x, y, steamPocketMask)) return false;
  if (boulderPocketMask && isPocketNeighbor(x, y, boulderPocketMask)) return false;
  return true;
}

function canPlaceSteamPocketAt(x, y, gasPocketMask, boulderPocketMask) {
  if (x < 2 || y < 2 || x >= GRID_W - 2 || y >= GRID_H - 2) return false;
  if (x === START_X && y === START_Y) return false;
  if (isInStartEasyRadius(x, y)) return false;
  if (gasPocketMask && isPocketNeighbor(x, y, gasPocketMask)) return false;
  if (boulderPocketMask && isPocketNeighbor(x, y, boulderPocketMask)) return false;
  return true;
}

function canPlaceBoulderPocketAt(x, y, gasPocketMask, steamPocketMask) {
  if (x < 2 || y < 2 || x >= GRID_W - 2 || y >= GRID_H - 2) return false;
  if (x === START_X && y === START_Y) return false;
  if (isInStartEasyRadius(x, y)) return false;
  if (gasPocketMask && isPocketNeighbor(x, y, gasPocketMask)) return false;
  if (steamPocketMask && isPocketNeighbor(x, y, steamPocketMask)) return false;
  return true;
}

function isPocketNeighbor(x, y, mask) {
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || nx >= GRID_W || ny < 0 || ny >= GRID_H) continue;
      if (mask[cellIndex(nx, ny)]) return true;
    }
  }
  return false;
}

function placeHazardBlob(hazardMask, random, blockCount) {
  const origin = getHazardOrigin(random);
  const hazardType = chooseHazardType(random, origin.x, origin.y);
  const frontier = [{ x: origin.x, y: origin.y }];
  const seen = new Set();
  let placed = 0;
  while (frontier.length > 0 && placed < blockCount) {
    const frontierIndex = Math.floor(random() * frontier.length);
    const cell = frontier.splice(frontierIndex, 1)[0];
    const key = `${cell.x},${cell.y}`;
    if (seen.has(key)) continue;
    seen.add(key);
    if (!canPlaceHazardAt(cell.x, cell.y)) continue;
    hazardMask[cellIndex(cell.x, cell.y)] = hazardType;
    placed += 1;
    const neighbors = [
      { x: cell.x + 1, y: cell.y }, { x: cell.x - 1, y: cell.y },
      { x: cell.x, y: cell.y + 1 }, { x: cell.x, y: cell.y - 1 },
      { x: cell.x + 1, y: cell.y + 1 }, { x: cell.x + 1, y: cell.y - 1 },
      { x: cell.x - 1, y: cell.y + 1 }, { x: cell.x - 1, y: cell.y - 1 },
    ];
    for (let i = 0; i < neighbors.length; i += 1) {
      if (random() < 0.88) frontier.push(neighbors[i]);
    }
  }
}

function placeHazardVein(hazardMask, random, blockCount) {
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
      hazardMask[cellIndex(ix, iy)] = hazardType;
      placed += 1;
    }
    angle += (random() - 0.5) * 0.85;
    x = clamp(x + Math.cos(angle) * 1.05, 1, GRID_W - 2);
    y = clamp(y + Math.sin(angle) * 1.05, 1, GRID_H - 2);
  }
}

function placeMetalVein(metalMask, hazardMask, gasPocketMask, steamPocketMask, boulderPocketMask, random, blockCount) {
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
      metalMask[index] = 1;
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

function placeGoldOreVein(goldOreMask, random, blockCount) {
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
    if (canPlaceGoldOreAt(ix, iy)) {
      goldOreMask[cellIndex(ix, iy)] = 1;
      placed += 1;
    }
    angle += (random() - 0.5) * 0.6;
    x = clamp(x + Math.cos(angle) * 1.1, 1, GRID_W - 2);
    y = clamp(y + Math.sin(angle) * 1.1, 1, GRID_H - 2);
  }
}

function placeGasPocket(gasPocketMask, hazardMask, steamPocketMask, boulderPocketMask, random, cellCount) {
  const origin = getHazardOrigin(random);
  const frontier = [{ x: origin.x, y: origin.y }];
  const seen = new Set();
  let placed = 0;
  while (frontier.length > 0 && placed < cellCount) {
    const frontierIndex = Math.floor(random() * frontier.length);
    const cell = frontier.splice(frontierIndex, 1)[0];
    const key = `${cell.x},${cell.y}`;
    if (seen.has(key)) continue;
    seen.add(key);
    if (!canPlaceGasPocketAt(cell.x, cell.y, steamPocketMask, boulderPocketMask)) continue;
    const index = cellIndex(cell.x, cell.y);
    gasPocketMask[index] = 1;
    hazardMask[index] = 0;
    placed += 1;
    const neighbors = [
      { x: cell.x + 1, y: cell.y }, { x: cell.x - 1, y: cell.y },
      { x: cell.x, y: cell.y + 1 }, { x: cell.x, y: cell.y - 1 },
      { x: cell.x + 1, y: cell.y + 1 }, { x: cell.x + 1, y: cell.y - 1 },
      { x: cell.x - 1, y: cell.y + 1 }, { x: cell.x - 1, y: cell.y - 1 },
    ];
    for (let i = 0; i < neighbors.length; i += 1) {
      if (random() < 0.82) frontier.push(neighbors[i]);
    }
  }
}

function placeSteamPocket(steamPocketMask, hazardMask, gasPocketMask, boulderPocketMask, random, cellCount) {
  const origin = getHazardOrigin(random);
  const frontier = [{ x: origin.x, y: origin.y }];
  const seen = new Set();
  let placed = 0;
  while (frontier.length > 0 && placed < cellCount) {
    const frontierIndex = Math.floor(random() * frontier.length);
    const cell = frontier.splice(frontierIndex, 1)[0];
    const key = `${cell.x},${cell.y}`;
    if (seen.has(key)) continue;
    seen.add(key);
    if (!canPlaceSteamPocketAt(cell.x, cell.y, gasPocketMask, boulderPocketMask)) continue;
    const index = cellIndex(cell.x, cell.y);
    steamPocketMask[index] = 1;
    hazardMask[index] = 0;
    gasPocketMask[index] = 0;
    placed += 1;
    const neighbors = [
      { x: cell.x + 1, y: cell.y }, { x: cell.x - 1, y: cell.y },
      { x: cell.x, y: cell.y + 1 }, { x: cell.x, y: cell.y - 1 },
      { x: cell.x + 1, y: cell.y + 1 }, { x: cell.x + 1, y: cell.y - 1 },
      { x: cell.x - 1, y: cell.y + 1 }, { x: cell.x - 1, y: cell.y - 1 },
    ];
    for (let i = 0; i < neighbors.length; i += 1) {
      if (random() < 0.78) frontier.push(neighbors[i]);
    }
  }
}

function placeBoulderPocket(boulderPocketMask, hazardMask, gasPocketMask, steamPocketMask, random) {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const origin = getHazardOrigin(random);
    if (!canPlaceBoulderPocketAt(origin.x, origin.y, gasPocketMask, steamPocketMask)) continue;
    if (Math.hypot(origin.x - START_X, origin.y - START_Y) < BOULDER_MIN_START_DISTANCE) continue;
    let colBlocked = false;
    for (let y = 1; y < GRID_H - 1; y += 1) {
      if (boulderPocketMask[cellIndex(origin.x, y)]) { colBlocked = true; break; }
    }
    if (colBlocked) continue;
    let rowBlocked = false;
    for (let x = 1; x < GRID_W - 1; x += 1) {
      if (boulderPocketMask[cellIndex(x, origin.y)]) { rowBlocked = true; break; }
    }
    if (rowBlocked) continue;
    const index = cellIndex(origin.x, origin.y);
    boulderPocketMask[index] = 1;
    hazardMask[index] = 0;
    gasPocketMask[index] = 0;
    steamPocketMask[index] = 0;
    return;
  }
}

function placeBase(metalMask, gasPocketMask, steamPocketMask, boulderPocketMask, random) {
  // Base hides deep — in the bottom zone of the map.
  const candidates = [];
  for (let y = BASE_ZONE_MIN_Y; y <= BASE_ZONE_MAX_Y; y += 1) {
    for (let x = 3; x < GRID_W - 3; x += 1) {
      const idx = cellIndex(x, y);
      if (
        !metalMask[idx] &&
        !gasPocketMask[idx] &&
        !steamPocketMask[idx] &&
        !boulderPocketMask[idx]
      ) {
        candidates.push({ x, y });
      }
    }
  }
  shuffle(candidates, random);
  if (candidates.length === 0) throw new Error("Unable to place base in bottom zone");
  return candidates[0];
}

function tryPlaceBeacon(x, y, beaconMask, metalMask, hazardMask, gasPocketMask, steamPocketMask, boulderPocketMask, beacons) {
  if (x < 2 || x >= GRID_W - 3 || y < 2 || y >= GRID_H - 3) return false;
  for (let dy = -1; dy <= 2; dy += 1) {
    for (let dx = -1; dx <= 2; dx += 1) {
      const idx = cellIndex(x + dx, y + dy);
      if (metalMask[idx] || hazardMask[idx] || gasPocketMask[idx] || steamPocketMask[idx] || boulderPocketMask[idx] || beaconMask[idx]) return false;
    }
  }
  for (const b of beacons) {
    if (Math.hypot(b.x - x, b.y - y) < BEACON_MIN_SPACING) return false;
  }
  beacons.push({ x, y });
  for (let dy = 0; dy < 2; dy += 1) {
    for (let dx = 0; dx < 2; dx += 1) {
      beaconMask[cellIndex(x + dx, y + dy)] = 1;
    }
  }
  for (let dy = -1; dy <= 2; dy += 1) {
    for (let dx = -1; dx <= 2; dx += 1) {
      if (dx >= 0 && dx < 2 && dy >= 0 && dy < 2) continue;
      const rx = x + dx;
      const ry = y + dy;
      if (rx < 0 || rx >= GRID_W || ry < 0 || ry >= GRID_H) continue;
      const idx = cellIndex(rx, ry);
      if (!beaconMask[idx]) beaconMask[idx] = 2;
    }
  }
  return true;
}

function placeBeacons(beaconMask, metalMask, hazardMask, gasPocketMask, steamPocketMask, boulderPocketMask, beacons, random) {
  // Scan all valid positions below the start area, shuffle, and greedily place.
  const minY = START_Y + BEACON_MIN_DEPTH;
  const candidates = [];
  for (let y = minY; y < GRID_H - 4; y += 1) {
    for (let x = 2; x < GRID_W - 3; x += 1) {
      candidates.push({ x, y });
    }
  }
  shuffle(candidates, random);
  for (let i = 0; i < candidates.length && beacons.length < BEACON_COUNT; i += 1) {
    tryPlaceBeacon(candidates[i].x, candidates[i].y, beaconMask, metalMask, hazardMask, gasPocketMask, steamPocketMask, boulderPocketMask, beacons);
  }
}

// Two guaranteed entry beacons: left and right of the player start at shallow depth.
// They give the player an immediate introduction to the beacon mechanic.
function placeEntryBeacons(beaconMask, metalMask, hazardMask, gasPocketMask, steamPocketMask, boulderPocketMask, beacons) {
  const positions = [
    { x: START_X - ENTRY_BEACON_X_OFFSET - 1, y: ENTRY_BEACON_Y },  // Left
    { x: START_X + ENTRY_BEACON_X_OFFSET - 1, y: ENTRY_BEACON_Y },  // Right
  ];

  for (const { x, y } of positions) {
    // Clear obstacles in the beacon check area to guarantee placement
    for (let dy = -1; dy <= 2; dy += 1) {
      for (let dx = -1; dx <= 2; dx += 1) {
        const rx = x + dx, ry = y + dy;
        if (rx < 0 || rx >= GRID_W || ry < 0 || ry >= GRID_H) continue;
        const idx = cellIndex(rx, ry);
        metalMask[idx] = 0;
        hazardMask[idx] = 0;
        gasPocketMask[idx] = 0;
        steamPocketMask[idx] = 0;
        boulderPocketMask[idx] = 0;
      }
    }
    // Place 2x2 beacon body
    beacons.push({ x, y });
    for (let dy = 0; dy < 2; dy += 1) {
      for (let dx = 0; dx < 2; dx += 1) {
        beaconMask[cellIndex(x + dx, y + dy)] = 1;
      }
    }
    // Mark border ring as tunnel
    for (let dy = -1; dy <= 2; dy += 1) {
      for (let dx = -1; dx <= 2; dx += 1) {
        if (dx >= 0 && dx < 2 && dy >= 0 && dy < 2) continue;
        const rx = x + dx, ry = y + dy;
        if (rx < 0 || rx >= GRID_W || ry < 0 || ry >= GRID_H) continue;
        const idx = cellIndex(rx, ry);
        if (!beaconMask[idx]) beaconMask[idx] = 2;
      }
    }
  }
}

function placeNearGold(goldOreMask, random) {
  const candidates = [];
  for (let dx = -(START_NEAR_RADIUS + 1); dx <= START_NEAR_RADIUS + 1; dx += 1) {
    for (let dy = -(START_NEAR_RADIUS + 1); dy <= START_NEAR_RADIUS + 1; dy += 1) {
      const x = START_X + dx;
      const y = START_Y + dy;
      const d = Math.hypot(dx, dy);
      if (d > START_EASY_RADIUS && d <= START_NEAR_RADIUS && x >= 1 && y >= 1 && x < GRID_W - 1 && y < GRID_H - 1) {
        candidates.push({ x, y });
      }
    }
  }
  shuffle(candidates, random);
  let placed = 0;
  for (let i = 0; i < candidates.length && placed < START_NEAR_GOLD_COUNT; i += 1) {
    const idx = cellIndex(candidates[i].x, candidates[i].y);
    if (!goldOreMask[idx]) {
      goldOreMask[idx] = 1;
      placed += 1;
    }
  }
}

function placePerkTiles(perkMask, metalMask, gasPocketMask, steamPocketMask, boulderPocketMask, beaconMask, base, random) {
  const placed = [];
  const targetCount = getTargetPerkTileCount();
  let attempts = 0;
  while (placed.length < targetCount && attempts < targetCount * 80) {
    const x = 2 + Math.floor(random() * (GRID_W - 4));
    const y = 2 + Math.floor(random() * (GRID_H - 4));
    const index = cellIndex(x, y);
    attempts += 1;
    if (perkMask[index] > 0 || metalMask[index] || gasPocketMask[index] || steamPocketMask[index] || boulderPocketMask[index] || beaconMask[index]) continue;
    if ((x === base.x && y === base.y) || (x === START_X && y === START_Y)) continue;
    if (!isFarEnoughFromPlaced(x, y, placed, PERK_MIN_DISTANCE)) continue;
    if (random() > getCenterPerkDensity(x, y)) continue;
    perkMask[index] = chooseTilePerkForPosition(x, y, random);
    placed.push({ x, y });
  }
}

function placeCrystalTiles(crystalMask, perkMask, perkZoneMask, metalMask, gasPocketMask, steamPocketMask, boulderPocketMask, beaconMask, base, random) {
  const placed = [];
  const targetCount = getTargetCrystalTileCount();
  let attempts = 0;
  while (placed.length < targetCount && attempts < targetCount * 90) {
    const x = 2 + Math.floor(random() * (GRID_W - 4));
    const y = 2 + Math.floor(random() * (GRID_H - 4));
    const index = cellIndex(x, y);
    attempts += 1;
    if (
      perkMask[index] > 0 || crystalMask[index] > 0 || perkZoneMask[index] !== -1 ||
      metalMask[index] || gasPocketMask[index] || steamPocketMask[index] || boulderPocketMask[index] || beaconMask[index]
    ) continue;
    if ((x === base.x && y === base.y) || (x === START_X && y === START_Y)) continue;
    if (!isFarEnoughFromPlaced(x, y, placed, CRYSTAL_MIN_DISTANCE)) continue;
    crystalMask[index] = chooseCrystalType(random);
    placed.push({ x, y });
  }
}

function createPerkZoneShape(random) {
  const targetCells = 6 + Math.floor(random() * 4);
  const cells = [{ x: 0, y: 0 }];
  const used = new Set(["0,0"]);
  let minX = 0; let maxX = 0; let minY = 0; let maxY = 0;
  let growthAttempts = 0;
  while (cells.length < targetCells && growthAttempts < 80) {
    const base = cells[Math.floor(random() * cells.length)];
    const dir = CARDINAL_DIRS[Math.floor(random() * CARDINAL_DIRS.length)];
    const nextX = base.x + dir.x;
    const nextY = base.y + dir.y;
    const key = `${nextX},${nextY}`;
    growthAttempts += 1;
    if (used.has(key)) continue;
    const nextMinX = Math.min(minX, nextX); const nextMaxX = Math.max(maxX, nextX);
    const nextMinY = Math.min(minY, nextY); const nextMaxY = Math.max(maxY, nextY);
    if (nextMaxX - nextMinX > 3 || nextMaxY - nextMinY > 3) continue;
    used.add(key);
    cells.push({ x: nextX, y: nextY });
    minX = nextMinX; maxX = nextMaxX; minY = nextMinY; maxY = nextMaxY;
  }
  const normalizedCells = [];
  let sumX = 0; let sumY = 0;
  for (let i = 0; i < cells.length; i += 1) {
    const x = cells[i].x - minX;
    const y = cells[i].y - minY;
    normalizedCells.push({ x, y });
    sumX += x; sumY += y;
  }
  const centroidX = sumX / normalizedCells.length;
  const centroidY = sumY / normalizedCells.length;
  let iconCell = normalizedCells[0];
  let bestDistance = Infinity;
  for (let i = 0; i < normalizedCells.length; i += 1) {
    const cell = normalizedCells[i];
    const dist = Math.hypot(cell.x - centroidX, cell.y - centroidY);
    if (dist < bestDistance) { bestDistance = dist; iconCell = cell; }
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

function placePerkZones(perkZoneMask, metalMask, gasPocketMask, steamPocketMask, boulderPocketMask, beaconMask, perkZones, base, random) {
  const placed = [];
  const targetCount = getTargetPerkZoneCount();
  let attempts = 0;
  while (perkZones.length < targetCount && attempts < targetCount * 120) {
    const shape = createPerkZoneShape(random);
    const originX = 1 + Math.floor(random() * Math.max(1, GRID_W - shape.width - 2));
    const originY = 1 + Math.floor(random() * Math.max(1, GRID_H - shape.height - 2));
    attempts += 1;
    const centerX = originX + shape.centerX;
    const centerY = originY + shape.centerY;
    if (!isFarEnoughFromPlaced(centerX, centerY, placed, PERK_ZONE_MIN_DISTANCE)) continue;
    if (random() > getPerkZoneDensity(centerX, centerY)) continue;
    let blocked = false;
    const cells = [];
    for (let i = 0; i < shape.cells.length; i += 1) {
      const cell = shape.cells[i];
      const x = originX + cell.x;
      const y = originY + cell.y;
      const index = cellIndex(x, y);
      if (
        (x === START_X && y === START_Y) || (x === base.x && y === base.y) ||
        metalMask[index] || perkZoneMask[index] !== -1 ||
        gasPocketMask[index] || steamPocketMask[index] || boulderPocketMask[index] || beaconMask[index]
      ) { blocked = true; break; }
      cells.push({ x, y });
    }
    if (blocked) continue;
    const zoneId = perkZones.length;
    const perkType = chooseTilePerkForPosition(centerX, centerY, random);
    perkZones.push({
      x: centerX, y: centerY, cells,
      iconX: originX + shape.iconX,
      iconY: originY + shape.iconY,
      perkType,
    });
    placed.push({ x: centerX, y: centerY });
    for (let i = 0; i < cells.length; i += 1) {
      perkZoneMask[cellIndex(cells[i].x, cells[i].y)] = zoneId;
    }
  }
}

// ── Safes ─────────────────────────────────────────────────────────────────────

/**
 * Place safes: 5x5 footprint (3x3 interior + metal border).
 * One border cell = door (locked). Key spawned nearby.
 * Returns array of { x, y, doorX, doorY, keyX, keyY, interiorCells }.
 * x,y = top-left of the 5x5 footprint.
 */
function placeSafes(metalMask, hardness, beaconMask, gasPocketMask, steamPocketMask, boulderPocketMask, perkZoneMask, perkMask, crystalMask, hazardMask, safes, random) {
  const placed = [];
  let attempts = 0;

  while (placed.length < SAFE_COUNT && attempts < SAFE_COUNT * 200) {
    attempts += 1;
    // top-left of 5x5 footprint
    const ox = 4 + Math.floor(random() * (GRID_W - 12));
    const oy = 4 + Math.floor(random() * (GRID_H - 12));
    const cx = ox + 2; // center
    const cy = oy + 2;

    // Distance from start
    if (Math.abs(cx - START_X) + Math.abs(cy - START_Y) < SAFE_MIN_START_DISTANCE) continue;
    // Distance from other safes
    if (!isFarEnoughFromPlaced(cx, cy, placed, SAFE_MIN_DISTANCE)) continue;

    // Check entire 5x5 is clear
    let blocked = false;
    for (let dy = 0; dy < 5 && !blocked; dy++) {
      for (let dx = 0; dx < 5 && !blocked; dx++) {
        const idx = cellIndex(ox + dx, oy + dy);
        if (metalMask[idx] || beaconMask[idx] || gasPocketMask[idx] ||
            steamPocketMask[idx] || boulderPocketMask[idx] || perkZoneMask[idx] !== -1) {
          blocked = true;
        }
      }
    }
    if (blocked) continue;

    // Pick a door position on the border (not corner)
    // Border = edge cells of 5x5
    const doorSide = Math.floor(random() * 4); // 0=top, 1=right, 2=bottom, 3=left
    const doorOffset = 1 + Math.floor(random() * 3); // 1,2,3 along side
    let doorX, doorY;
    if (doorSide === 0) { doorX = ox + doorOffset; doorY = oy; }
    else if (doorSide === 1) { doorX = ox + 4; doorY = oy + doorOffset; }
    else if (doorSide === 2) { doorX = ox + doorOffset; doorY = oy + 4; }
    else { doorX = ox; doorY = oy + doorOffset; }

    // Place key nearby
    let keyX = -1, keyY = -1;
    for (let ka = 0; ka < 100; ka++) {
      const kx = cx + Math.floor((random() - 0.5) * 2 * SAFE_KEY_MAX_DIST);
      const ky = cy + Math.floor((random() - 0.5) * 2 * SAFE_KEY_MAX_DIST);
      if (kx < 2 || kx >= GRID_W - 2 || ky < 2 || ky >= GRID_H - 2) continue;
      const dist = Math.hypot(kx - cx, ky - cy);
      if (dist < SAFE_KEY_MIN_DIST || dist > SAFE_KEY_MAX_DIST) continue;
      const ki = cellIndex(kx, ky);
      if (metalMask[ki] || beaconMask[ki] || gasPocketMask[ki] || steamPocketMask[ki] || boulderPocketMask[ki]) continue;
      keyX = kx;
      keyY = ky;
      break;
    }
    if (keyX === -1) continue; // couldn't place key

    // Stamp the safe into the world
    const interiorCells = [];
    for (let dy = 0; dy < 5; dy++) {
      for (let dx = 0; dx < 5; dx++) {
        const wx = ox + dx, wy = oy + dy;
        const idx = cellIndex(wx, wy);
        const isBorder = dx === 0 || dx === 4 || dy === 0 || dy === 4;
        if (isBorder) {
          if (wx === doorX && wy === doorY) {
            // door tile — keep as hard rock, not metal
            hardness[idx] = 7; // max tier, very hard
          } else {
            metalMask[idx] = 1;
          }
        } else {
          // Interior — clear to tier 1 so it's open once door is opened
          hardness[idx] = 0;
          interiorCells.push({ x: wx, y: wy });
        }
      }
    }

    // Clear perks, crystals, hazards from entire 5x5 footprint
    for (let dy = 0; dy < 5; dy++) {
      for (let dx = 0; dx < 5; dx++) {
        const idx = cellIndex(ox + dx, oy + dy);
        perkMask[idx] = 0;
        crystalMask[idx] = 0;
        hazardMask[idx] = 0;
        if (perkZoneMask[idx] !== -1) perkZoneMask[idx] = -1;
      }
    }

    const safe = { x: ox, y: oy, cx, cy, doorX, doorY, keyX, keyY, interiorCells };
    safes.push(safe);
    placed.push({ x: cx, y: cy });
  }
}

// ── Main export ───────────────────────────────────────────────────────────────

function isArtifactPlacementBlocked(x, y, artifactMask, perkMask, crystalMask, perkZoneMask, metalMask, gasPocketMask, steamPocketMask, boulderPocketMask, beaconMask, beacons, base, placed) {
  if (x < 3 || x >= GRID_W - 3 || y < 3 || y >= GRID_H - 3) return true;
  const index = cellIndex(x, y);
  if (
    perkMask[index] > 0 || crystalMask[index] > 0 || perkZoneMask[index] !== -1 ||
    metalMask[index] || gasPocketMask[index] || steamPocketMask[index] ||
    boulderPocketMask[index] || beaconMask[index] || artifactMask[index]
  ) return true;
  if ((x === base.x && y === base.y) || (x === START_X && y === START_Y)) return true;
  if (!isFarEnoughFromPlaced(x, y, placed, ARTIFACT_MIN_DISTANCE)) return true;
  // Artifacts must be below the easy start zone.
  if (y < START_Y + 15) return true;
  for (const b of beacons) {
    if (Math.abs(x - b.x) + Math.abs(y - b.y) < ARTIFACT_MIN_BEACON_DIST) {
      return true;
    }
  }
  return false;
}

function buildArtifactBeaconPairs(beacons) {
  if (beacons.length <= 2) {
    return [];
  }

  // Sort beacons by depth (Y) so artifacts spread through depth bands.
  const sorted = beacons
    .slice()
    .sort((a, b) => a.y - b.y);

  const pairs = [];
  // Pair each beacon with neighbours 1 and 2 steps ahead in depth order.
  for (let i = 0; i < sorted.length; i += 1) {
    for (const step of [1, 2]) {
      const j = (i + step) % sorted.length;
      const a = sorted[i];
      const b = sorted[j];
      const ax = a.x + 0.5, ay = a.y + 0.5;
      const bx = b.x + 0.5, by = b.y + 0.5;
      pairs.push({
        a, b,
        midX: (ax + bx) * 0.5,
        midY: (ay + by) * 0.5,
        span: Math.hypot(bx - ax, by - ay),
      });
    }
  }

  // Deepest midpoints first — artifacts appear throughout the descent.
  pairs.sort((a, b) => b.midY - a.midY || b.span - a.span);
  return pairs;
}

function tryPlaceArtifactBetweenBeacons(pair, artifactMask, perkMask, crystalMask, perkZoneMask, metalMask, gasPocketMask, steamPocketMask, boulderPocketMask, beaconMask, beacons, base, placed, random) {
  const ax = pair.a.x + 0.5;
  const ay = pair.a.y + 0.5;
  const bx = pair.b.x + 0.5;
  const by = pair.b.y + 0.5;
  const dx = bx - ax;
  const dy = by - ay;
  const length = Math.hypot(dx, dy) || 1;
  const nx = -dy / length;
  const ny = dx / length;

  for (let attempt = 0; attempt < 18; attempt += 1) {
    const t = 0.35 + random() * 0.3;
    const lateral = (random() - 0.5) * Math.min(8, length * 0.28);
    const radial = (random() - 0.5) * Math.min(6, length * 0.12);
    const x = Math.round(ax + dx * t + nx * lateral + (dx / length) * radial);
    const y = Math.round(ay + dy * t + ny * lateral + (dy / length) * radial);
    if (isArtifactPlacementBlocked(x, y, artifactMask, perkMask, crystalMask, perkZoneMask, metalMask, gasPocketMask, steamPocketMask, boulderPocketMask, beaconMask, beacons, base, placed)) {
      continue;
    }
    artifactMask[cellIndex(x, y)] = 1;
    placed.push({ x, y });
    return true;
  }

  return false;
}

function placeArtifacts(artifactMask, perkMask, crystalMask, perkZoneMask, metalMask, gasPocketMask, steamPocketMask, boulderPocketMask, beaconMask, beacons, base, random) {
  const placed = [];
  const artifactTargetCount = Math.max(0, beacons.length - 2);
  if (artifactTargetCount === 0) return;

  // Divide the full map depth into equal bands and place one artifact per band.
  const yMin = START_Y + 20; // skip easy start zone
  const yMax = GRID_H - 3;
  const bandH = (yMax - yMin) / artifactTargetCount;

  for (let band = 0; band < artifactTargetCount; band += 1) {
    const bandYMin = Math.floor(yMin + band * bandH);
    const bandYMax = Math.floor(yMin + (band + 1) * bandH);
    let placed_in_band = false;

    for (let attempt = 0; attempt < 300 && !placed_in_band; attempt += 1) {
      const x = 3 + Math.floor(random() * (GRID_W - 6));
      const y = bandYMin + Math.floor(random() * (bandYMax - bandYMin));
      if (isArtifactPlacementBlocked(x, y, artifactMask, perkMask, crystalMask, perkZoneMask, metalMask, gasPocketMask, steamPocketMask, boulderPocketMask, beaconMask, beacons, base, placed)) continue;
      artifactMask[cellIndex(x, y)] = 1;
      placed.push({ x, y });
      placed_in_band = true;
    }
  }
}

/**
 * Generate a complete map for the given seed.
 * Returns plain data arrays — no game state, safe to use from any context.
 *
 * beacons entries: { x, y }  (game.js adds `active: false`)
 * perkZones entries: { x, y, cells, iconX, iconY, perkType }
 *   (game.js adds openedCount, openedMask, arming, armingTimer, collected)
 */
function placeWormNests(metalMask, gasPocketMask, steamPocketMask, boulderPocketMask, beaconMask, beacons, safes, base, random) {
  const placed = [];
  let attempts = 0;
  while (placed.length < WORM_NEST_COUNT && attempts < WORM_NEST_COUNT * 120) {
    const x = 3 + Math.floor(random() * (GRID_W - 6));
    const y = 3 + Math.floor(random() * (GRID_H - 6));
    attempts += 1;
    const index = cellIndex(x, y);
    if (metalMask[index] || beaconMask[index]) continue;
    if (gasPocketMask[index] || steamPocketMask[index] || boulderPocketMask[index]) continue;
    if ((x === base.x && y === base.y) || (x === START_X && y === START_Y)) continue;
    const distFromStart = Math.hypot(x - START_X, y - START_Y);
    if (distFromStart < WORM_NEST_MIN_START_DISTANCE) continue;
    if (!isFarEnoughFromPlaced(x, y, placed, WORM_NEST_MIN_DISTANCE)) continue;
    let tooCloseToBeacon = false;
    for (const b of beacons) {
      if (Math.hypot(x - b.x, y - b.y) < WORM_NEST_MIN_BEACON_DIST) {
        tooCloseToBeacon = true;
        break;
      }
    }
    if (tooCloseToBeacon) continue;
    // Also avoid safes
    let tooCloseToSafe = false;
    for (const s of safes) {
      if (Math.hypot(x - s.x, y - s.y) < 8) {
        tooCloseToSafe = true;
        break;
      }
    }
    if (tooCloseToSafe) continue;
    placed.push({ x, y });
  }
  return placed;
}

/**
 * Repair pockets after beacons/safes may have destroyed some cells.
 * For each pocket cell, check if any of its 4-neighbors are also pocket cells.
 * If a pocket cell is completely isolated (no same-type neighbor), remove it.
 * Then, remove pocket cells that overlap with beacon areas.
 */
function repairPockets(pocketMask, beaconMask) {
  // First: remove any pocket cell that overlaps a beacon
  for (let i = 0; i < GRID_W * GRID_H; i++) {
    if (pocketMask[i] && beaconMask[i]) {
      pocketMask[i] = 0;
    }
  }
  // Second: remove orphaned pocket cells (no same-type 4-neighbor)
  // Iterate until stable — removing one cell can orphan another
  let changed = true;
  while (changed) {
    changed = false;
    for (let y = 1; y < GRID_H - 1; y++) {
      for (let x = 1; x < GRID_W - 1; x++) {
        const idx = cellIndex(x, y);
        if (!pocketMask[idx]) continue;
        const hasNeighbor =
          pocketMask[cellIndex(x + 1, y)] ||
          pocketMask[cellIndex(x - 1, y)] ||
          pocketMask[cellIndex(x, y + 1)] ||
          pocketMask[cellIndex(x, y - 1)];
        if (!hasNeighbor) {
          pocketMask[idx] = 0;
          changed = true;
        }
      }
    }
  }
}

export function generateMap(seed) {
  const random = mulberry32(seed);

  const hardness       = buildHardness(random);
  const hazardMask     = new Uint8Array(GRID_W * GRID_H);
  const metalMask      = new Uint8Array(GRID_W * GRID_H);
  const goldOreMask   = new Uint8Array(GRID_W * GRID_H);
  const gasPocketMask  = new Uint8Array(GRID_W * GRID_H);
  const steamPocketMask = new Uint8Array(GRID_W * GRID_H);
  const boulderPocketMask = new Uint8Array(GRID_W * GRID_H);
  const beaconMask     = new Uint8Array(GRID_W * GRID_H);
  const perkMask       = new Uint8Array(GRID_W * GRID_H);
  const crystalMask    = new Uint8Array(GRID_W * GRID_H);
  const perkZoneMask   = new Int32Array(GRID_W * GRID_H).fill(-1);
  const artifactMask   = new Uint8Array(GRID_W * GRID_H);

  const beacons   = [];
  const perkZones = [];
  const safes     = [];

  const area = GRID_W * GRID_H;
  const hazardBlobGroups = Math.max(12, Math.round(area / 3000));
  const hazardVeinGroups = Math.max(12, Math.round(area / 3000));

  for (let i = 0; i < hazardBlobGroups; i += 1) placeHazardBlob(hazardMask, random, 4 + Math.floor(random() * 17));
  for (let i = 0; i < hazardVeinGroups; i += 1)  placeHazardVein(hazardMask, random, 4 + Math.floor(random() * 37));
  for (let i = 0; i < METAL_VEIN_GROUPS;    i += 1) placeMetalVein(metalMask, hazardMask, gasPocketMask, steamPocketMask, boulderPocketMask, random, 12 + Math.floor(random() * 22));
  for (let i = 0; i < GOLD_ORE_GROUPS;     i += 1) placeGoldOreVein(goldOreMask, random, 4 + Math.floor(random() * 7));
  placeNearGold(goldOreMask, random);
  for (let i = 0; i < GAS_POCKET_GROUPS;    i += 1) placeGasPocket(gasPocketMask, hazardMask, steamPocketMask, boulderPocketMask, random, 4 + Math.floor(random() * 17));
  for (let i = 0; i < STEAM_POCKET_GROUPS;  i += 1) placeSteamPocket(steamPocketMask, hazardMask, gasPocketMask, boulderPocketMask, random, 3 + Math.floor(random() * 7));
  for (let i = 0; i < BOULDER_POCKET_GROUPS; i += 1) placeBoulderPocket(boulderPocketMask, hazardMask, gasPocketMask, steamPocketMask, random);

  const base = placeBase(metalMask, gasPocketMask, steamPocketMask, boulderPocketMask, random);

  placeEntryBeacons(beaconMask, metalMask, hazardMask, gasPocketMask, steamPocketMask, boulderPocketMask, beacons);
  placeBeacons(beaconMask, metalMask, hazardMask, gasPocketMask, steamPocketMask, boulderPocketMask, beacons, random);
  for (let i = 0; i < GRID_W * GRID_H; i += 1) {
    if (beaconMask[i] >= 1) hardness[i] = 0;
  }
  placePerkTiles(perkMask, metalMask, gasPocketMask, steamPocketMask, boulderPocketMask, beaconMask, base, random);
  placeCrystalTiles(crystalMask, perkMask, perkZoneMask, metalMask, gasPocketMask, steamPocketMask, boulderPocketMask, beaconMask, base, random);
  placePerkZones(perkZoneMask, metalMask, gasPocketMask, steamPocketMask, boulderPocketMask, beaconMask, perkZones, base, random);
  placeArtifacts(artifactMask, perkMask, crystalMask, perkZoneMask, metalMask, gasPocketMask, steamPocketMask, boulderPocketMask, beaconMask, beacons, base, random);
  placeSafes(metalMask, hardness, beaconMask, gasPocketMask, steamPocketMask, boulderPocketMask, perkZoneMask, perkMask, crystalMask, hazardMask, safes, random);
  const wormNests = placeWormNests(metalMask, gasPocketMask, steamPocketMask, boulderPocketMask, beaconMask, beacons, safes, base, random);

  // Repair pockets: remove any pocket cells that were destroyed by beacons/safes
  // A pocket cell is orphaned if it has no pocket neighbor of the same type
  // (i.e. it became isolated by beacon clearing). Remove such cells.
  repairPockets(gasPocketMask, beaconMask);
  repairPockets(steamPocketMask, beaconMask);
  // Boulder pockets are intentionally single cells — repairPockets would remove them all.
  // Only clear overlaps with beacons.
  for (let i = 0; i < GRID_W * GRID_H; i++) {
    if (boulderPocketMask[i] && beaconMask[i]) boulderPocketMask[i] = 0;
  }

  return {
    hardness, hazardMask, metalMask, goldOreMask,
    gasPocketMask, steamPocketMask, boulderPocketMask,
    beaconMask, beacons,
    perkMask, crystalMask, perkZones,
    artifactMask, safes, wormNests,
    base,
  };
}
