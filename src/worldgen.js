// World generation module — pure functions, no game state.
// Both game.js and the debug render script import from here.

export const GRID_W = 100;
export const START_X = Math.floor(GRID_W / 2);
export const START_Y = 1;
export const VISION_RADIUS = 5;

export const HAZARD_TYPES = { SPIKE: 1, VOLATILE: 2 };

const START_EASY_RADIUS = VISION_RADIUS;

const PERK_MIN_DISTANCE = 4;
const PERK_ZONE_MIN_DISTANCE = 6;
const TILES_PER_PERK_TILE = 26;
const TILES_PER_PERK_ZONE = 380;
const TILES_PER_CRYSTAL_TILE = 22;
const CRYSTAL_MIN_DISTANCE = 3;
const BEACON_MIN_SPACING = 10;
const ARTIFACT_MIN_DISTANCE = 8;
const ARTIFACT_MIN_BEACON_DIST = 5;
const SAFE_MIN_DISTANCE = 20;
const SAFE_MIN_START_DISTANCE = 20;
const SAFE_KEY_MIN_DIST = 6;
const SAFE_KEY_MAX_DIST = 14;
const WORM_NEST_MIN_DISTANCE = 18;
const WORM_NEST_MIN_START_DISTANCE = 25;
const WORM_NEST_MIN_BEACON_DIST = 5;

export const BLOCK_TYPES = [
  { color: "#1a1410", label: "Tunnel", vein: "#3c2d22" },
  { color: "#5f4631", label: "Tier 1", vein: "#9b7a4a" },
  { color: "#715337", label: "Tier 2", vein: "#c59a5c" },
  { color: "#6a4f37", label: "Tier 3", vein: "#d0a66a" },
  { color: "#6f4f40", label: "Tier 4", vein: "#b66e3b" },
  { color: "#60473f", label: "Tier 5", vein: "#a57f58" },
  { color: "#4f3d36", label: "Tier 6", vein: "#9cb1b7" },
  { color: "#3e3236", label: "Tier 7", vein: "#d6d9df" },
];

export const TILE_PERK_TYPES = [
  null,
  { name: "Бак", icon: "F", color: "#ffcf7a" },
  { name: "Радар", icon: "R", color: "#f2ede2" },
  { name: "Бур", icon: "D", color: "#ff9f6b" },
  { name: "Бомба", icon: "*", color: "#c796ff" },
  { name: "Скорость", icon: "S", color: "#9fd7ff" },
  { name: "HP+", icon: "H", color: "#73e58f" },
  { name: "Броня", icon: "A", color: "#b4d7ff" },
];

export const TILE_PERK_WEIGHTS = [0, 7, 0, 0, 4, 0, 2, 2];

export const CRYSTAL_TYPES = [
  null,
  { name: "Red", color: "#ff4747" },
  { name: "Yellow", color: "#ffd166" },
  { name: "Pale", color: "#f2ede2" },
  { name: "Green", color: "#73e58f" },
  { name: "Blue", color: "#72b7ff" },
];

const CARDINAL_DIRS = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
];

const DEFAULT_LEVEL_LAYOUT = [
  {
    id: 1,
    height: 24,
    width: 44,
    canHostBase: false,
    frame: "metal",
    required: { beacons: 1, perkZones: 1, safes: 0, wormNests: 0, artifacts: 0, crystals: 8 },
    rules: { hazardBlobGroups: 1, hazardVeinGroups: 1, metalVeinGroups: 1, goldOreGroups: 8, goldOreMinTiles: 4, goldOreMaxTiles: 10, gasPocketGroups: 0, steamPocketGroups: 0, boulderPocketGroups: 0, perkTileDensity: 1.2, perkZoneDensity: 1.15, crystalDensity: 0.9, hazardTypes: [HAZARD_TYPES.SPIKE], hardnessBias: -1.2 },
  },
  {
    id: 2,
    height: 26,
    width: 52,
    canHostBase: false,
    frame: "metal",
    required: { beacons: 2, perkZones: 2, safes: 0, wormNests: 0, artifacts: 1, crystals: 8 },
    rules: { hazardBlobGroups: 2, hazardVeinGroups: 2, metalVeinGroups: 2, goldOreGroups: 10, goldOreMinTiles: 4, goldOreMaxTiles: 10, gasPocketGroups: 1, steamPocketGroups: 0, boulderPocketGroups: 0, perkTileDensity: 1.05, perkZoneDensity: 1.0, crystalDensity: 0.85, hazardTypes: [HAZARD_TYPES.SPIKE], hardnessBias: -0.8 },
  },
  {
    id: 3,
    height: 28,
    width: 60,
    canHostBase: false,
    frame: "metal",
    required: { beacons: 2, perkZones: 2, safes: 1, wormNests: 1, artifacts: 2, crystals: 10 },
    rules: { hazardBlobGroups: 2, hazardVeinGroups: 2, metalVeinGroups: 2, goldOreGroups: 12, goldOreMinTiles: 4, goldOreMaxTiles: 10, gasPocketGroups: 1, steamPocketGroups: 1, boulderPocketGroups: 0, perkTileDensity: 1.0, perkZoneDensity: 0.95, crystalDensity: 0.9, hazardTypes: [HAZARD_TYPES.SPIKE, HAZARD_TYPES.VOLATILE], hardnessBias: -0.4 },
  },
  {
    id: 4,
    height: 30,
    width: 68,
    canHostBase: false,
    frame: "metal",
    required: { beacons: 3, perkZones: 2, safes: 0, wormNests: 1, artifacts: 2, crystals: 12 },
    rules: { hazardBlobGroups: 3, hazardVeinGroups: 3, metalVeinGroups: 2, goldOreGroups: 14, goldOreMinTiles: 4, goldOreMaxTiles: 10, gasPocketGroups: 2, steamPocketGroups: 1, boulderPocketGroups: 1, perkTileDensity: 0.95, perkZoneDensity: 0.9, crystalDensity: 0.85, hazardTypes: [HAZARD_TYPES.SPIKE, HAZARD_TYPES.VOLATILE], hardnessBias: 0.0 },
  },
  {
    id: 5,
    height: 32,
    width: 76,
    canHostBase: false,
    frame: "metal",
    required: { beacons: 3, perkZones: 3, safes: 1, wormNests: 1, artifacts: 3, crystals: 12 },
    rules: { hazardBlobGroups: 3, hazardVeinGroups: 3, metalVeinGroups: 2, goldOreGroups: 16, goldOreMinTiles: 4, goldOreMaxTiles: 10, gasPocketGroups: 2, steamPocketGroups: 2, boulderPocketGroups: 1, perkTileDensity: 0.9, perkZoneDensity: 0.85, crystalDensity: 0.8, hazardTypes: [HAZARD_TYPES.SPIKE, HAZARD_TYPES.VOLATILE], hardnessBias: 0.5 },
  },
  {
    id: 6,
    height: 34,
    width: 84,
    canHostBase: false,
    frame: "metal",
    required: { beacons: 3, perkZones: 2, safes: 1, wormNests: 1, artifacts: 3, crystals: 14 },
    rules: { hazardBlobGroups: 4, hazardVeinGroups: 4, metalVeinGroups: 2, goldOreGroups: 18, goldOreMinTiles: 4, goldOreMaxTiles: 10, gasPocketGroups: 2, steamPocketGroups: 2, boulderPocketGroups: 2, perkTileDensity: 0.85, perkZoneDensity: 0.8, crystalDensity: 0.78, hazardTypes: [HAZARD_TYPES.VOLATILE, HAZARD_TYPES.SPIKE], hardnessBias: 0.9 },
  },
  {
    id: 7,
    height: 32,
    width: 74,
    canHostBase: false,
    frame: "metal",
    required: { beacons: 3, perkZones: 2, safes: 1, wormNests: 1, artifacts: 3, crystals: 12 },
    rules: { hazardBlobGroups: 4, hazardVeinGroups: 4, metalVeinGroups: 1, goldOreGroups: 16, goldOreMinTiles: 4, goldOreMaxTiles: 10, gasPocketGroups: 2, steamPocketGroups: 2, boulderPocketGroups: 2, perkTileDensity: 0.8, perkZoneDensity: 0.75, crystalDensity: 0.72, hazardTypes: [HAZARD_TYPES.VOLATILE], hardnessBias: 1.2 },
  },
  {
    id: 8,
    height: 33,
    width: 64,
    canHostBase: true,
    frame: "metal",
    required: { beacons: 3, perkZones: 2, safes: 0, wormNests: 1, artifacts: 3, crystals: 10 },
    rules: { hazardBlobGroups: 4, hazardVeinGroups: 4, metalVeinGroups: 1, goldOreGroups: 14, goldOreMinTiles: 4, goldOreMaxTiles: 10, gasPocketGroups: 1, steamPocketGroups: 2, boulderPocketGroups: 2, perkTileDensity: 0.75, perkZoneDensity: 0.7, crystalDensity: 0.68, hazardTypes: [HAZARD_TYPES.VOLATILE], hardnessBias: 1.5 },
  },
];

const PLAYABLE_HEIGHT = DEFAULT_LEVEL_LAYOUT.reduce((sum, level) => sum + level.height, 0);

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeHazardTypes(hazardTypes) {
  if (!Array.isArray(hazardTypes) || hazardTypes.length === 0) {
    throw new Error("hazardTypes must be a non-empty array");
  }
  return hazardTypes.map((value) => {
    const num = Number(value);
    if (num !== HAZARD_TYPES.SPIKE && num !== HAZARD_TYPES.VOLATILE) {
      throw new Error(`Unsupported hazard type: ${value}`);
    }
    return num;
  });
}

function validateLevelLayout(layout) {
  if (!Array.isArray(layout) || layout.length !== DEFAULT_LEVEL_LAYOUT.length) {
    throw new Error(`Generation config must contain exactly ${DEFAULT_LEVEL_LAYOUT.length} levels`);
  }

  let totalHeight = 0;
  let hostBaseCount = 0;
  for (let i = 0; i < layout.length; i += 1) {
    const level = layout[i];
    if (!level || typeof level !== "object") {
      throw new Error(`Level ${i + 1} must be an object`);
    }
    const width = Math.round(Number(level.width));
    const height = Math.round(Number(level.height));
    if (!Number.isFinite(width) || width < 6 || width > GRID_W - 2) {
      throw new Error(`Level ${i + 1} width must be between 6 and ${GRID_W - 2}`);
    }
    if (!Number.isFinite(height) || height < 8) {
      throw new Error(`Level ${i + 1} height must be at least 8`);
    }
    totalHeight += height;
    if (level.canHostBase) hostBaseCount += 1;
    if (!level.required || typeof level.required !== "object") {
      throw new Error(`Level ${i + 1} required must be an object`);
    }
    if (!level.rules || typeof level.rules !== "object") {
      throw new Error(`Level ${i + 1} rules must be an object`);
    }
    level.rules.hazardTypes = normalizeHazardTypes(level.rules.hazardTypes);
    const goldOreMinTiles = Math.round(Number(level.rules.goldOreMinTiles));
    const goldOreMaxTiles = Math.round(Number(level.rules.goldOreMaxTiles));
    if (!Number.isFinite(goldOreMinTiles) || goldOreMinTiles < 1) {
      throw new Error(`Level ${i + 1} goldOreMinTiles must be at least 1`);
    }
    if (!Number.isFinite(goldOreMaxTiles) || goldOreMaxTiles < goldOreMinTiles) {
      throw new Error(`Level ${i + 1} goldOreMaxTiles must be >= goldOreMinTiles`);
    }
    level.rules.goldOreMinTiles = goldOreMinTiles;
    level.rules.goldOreMaxTiles = goldOreMaxTiles;
  }

  if (totalHeight !== PLAYABLE_HEIGHT) {
    throw new Error(`Total height must stay equal to ${PLAYABLE_HEIGHT} tiles`);
  }
  if (hostBaseCount < 1) {
    throw new Error("At least one level must have canHostBase=true");
  }
}

let currentLevelLayout = deepClone(DEFAULT_LEVEL_LAYOUT);

function buildDepthLevels(layout) {
  let nextY = START_Y;
  return layout.map((entry, index) => {
    const xMin = Math.floor((GRID_W - entry.width) / 2);
    const xMax = xMin + entry.width - 1;
    const startY = nextY;
    const endY = startY + entry.height - 1;
    nextY = endY + 1;
    return {
      ...entry,
      level: index + 1,
      startY,
      endY,
      xMin,
      xMax,
      centerX: Math.floor((xMin + xMax) / 2),
      area: entry.width * entry.height,
    };
  });
}

const INITIAL_DEPTH_LEVELS = buildDepthLevels(currentLevelLayout);
export const DEPTH_LEVELS = [...INITIAL_DEPTH_LEVELS];
export const GRID_H = INITIAL_DEPTH_LEVELS[INITIAL_DEPTH_LEVELS.length - 1].endY + 1;
export let BEACON_COUNT = INITIAL_DEPTH_LEVELS.reduce(
  (sum, level) => sum + (level.required.beacons || 0),
  0,
);

let PLAYABLE_TILE_COUNT = INITIAL_DEPTH_LEVELS.reduce((sum, level) => sum + level.area, 0);
const LEVEL_BY_ID = new Map(INITIAL_DEPTH_LEVELS.map((level) => [level.id, level]));

function rebuildGenerationRuntime() {
  validateLevelLayout(currentLevelLayout);
  const levels = buildDepthLevels(currentLevelLayout);
  if (levels[levels.length - 1].endY + 1 !== GRID_H) {
    throw new Error(`Generation config must preserve total map height ${GRID_H}`);
  }
  DEPTH_LEVELS.splice(0, DEPTH_LEVELS.length, ...levels);
  LEVEL_BY_ID.clear();
  for (const level of DEPTH_LEVELS) {
    LEVEL_BY_ID.set(level.id, level);
  }
  PLAYABLE_TILE_COUNT = DEPTH_LEVELS.reduce((sum, level) => sum + level.area, 0);
  BEACON_COUNT = DEPTH_LEVELS.reduce(
    (sum, level) => sum + (level.required.beacons || 0),
    0,
  );
}

export function getGenerationConfig() {
  return deepClone(currentLevelLayout);
}

export function setGenerationConfig(layout) {
  const nextLayout = deepClone(layout);
  validateLevelLayout(nextLayout);
  currentLevelLayout = nextLayout;
  rebuildGenerationRuntime();
  return getGenerationConfig();
}

export function resetGenerationConfig() {
  currentLevelLayout = deepClone(DEFAULT_LEVEL_LAYOUT);
  rebuildGenerationRuntime();
  return getGenerationConfig();
}

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

function getLevelById(id) {
  return LEVEL_BY_ID.get(id) || null;
}

function getLevelForCell(x, y) {
  for (let i = 0; i < DEPTH_LEVELS.length; i += 1) {
    const level = DEPTH_LEVELS[i];
    if (y >= level.startY && y <= level.endY && x >= level.xMin && x <= level.xMax) {
      return level;
    }
  }
  return null;
}

function isInsideLevel(x, y, level, margin = 0) {
  return (
    x >= level.xMin + margin &&
    x <= level.xMax - margin &&
    y >= level.startY + margin &&
    y <= level.endY - margin
  );
}

function isInsidePlayableArea(x, y) {
  return !!getLevelForCell(x, y);
}

function forEachCellInLevel(level, fn) {
  for (let y = level.startY; y <= level.endY; y += 1) {
    for (let x = level.xMin; x <= level.xMax; x += 1) {
      fn(x, y);
    }
  }
}

function randomCellInLevel(level, margin, random) {
  if (!isInsideLevel(level.xMin + margin, level.startY + margin, level, margin)) {
    return null;
  }
  const x = level.xMin + margin + Math.floor(random() * (level.width - margin * 2));
  const y = level.startY + margin + Math.floor(random() * (level.height - margin * 2));
  return { x, y };
}

function collectCandidatesInLevel(level, margin, predicate) {
  const candidates = [];
  for (let y = level.startY + margin; y <= level.endY - margin; y += 1) {
    for (let x = level.xMin + margin; x <= level.xMax - margin; x += 1) {
      if (predicate(x, y)) candidates.push({ x, y });
    }
  }
  return candidates;
}

function getLevelDepthRatio(level, y) {
  const local = (y - level.startY) / Math.max(1, level.height - 1);
  return clamp((level.level - 1 + local) / DEPTH_LEVELS.length, 0, 1.5);
}

// ── Perk / crystal helpers ──────────────────────────────────────────────────

export function getTargetPerkTileCount(level = null) {
  const area = level ? level.area : PLAYABLE_TILE_COUNT;
  const density = level ? level.rules.perkTileDensity : 1;
  return Math.max(1, Math.round((area / TILES_PER_PERK_TILE) * density));
}

export function getTargetPerkZoneCount(level = null) {
  if (level) {
    return Math.max(level.required.perkZones || 0, Math.round((level.area / TILES_PER_PERK_ZONE) * level.rules.perkZoneDensity));
  }
  return DEPTH_LEVELS.reduce((sum, item) => sum + getTargetPerkZoneCount(item), 0);
}

export function getTargetCrystalTileCount(level = null) {
  if (level) {
    return Math.max(level.required.crystals || 0, Math.round((level.area / TILES_PER_CRYSTAL_TILE) * level.rules.crystalDensity));
  }
  return DEPTH_LEVELS.reduce((sum, item) => sum + getTargetCrystalTileCount(item), 0);
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
  const level = getLevelForCell(x, y);
  if (level && level.level <= 2) {
    weights[1] += 2;
  }
  return chooseWeightedPerk(random, weights);
}

function chooseCrystalType(random) {
  return 1 + Math.floor(random() * (CRYSTAL_TYPES.length - 1));
}

// ── Hardness map ────────────────────────────────────────────────────────────

function addDangerBlob(field, level, cx, cy, radius, strength) {
  const minX = Math.max(level.xMin, Math.floor(cx - radius));
  const maxX = Math.min(level.xMax, Math.ceil(cx + radius));
  const minY = Math.max(level.startY, Math.floor(cy - radius));
  const maxY = Math.min(level.endY, Math.ceil(cy + radius));
  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const dist = Math.hypot(x - cx, y - cy);
      if (dist > radius) continue;
      field[cellIndex(x, y)] += strength * (1 - dist / radius);
    }
  }
}

function addDangerVein(field, level, startX, startY, length, radius, strength, random) {
  let x = startX;
  let y = startY;
  let angle = random() * Math.PI * 2;
  for (let step = 0; step < length; step += 1) {
    addDangerBlob(field, level, x, y, radius, strength);
    angle += (random() - 0.5) * 0.95;
    x = clamp(x + Math.cos(angle) * 1.35, level.xMin + 1, level.xMax - 1);
    y = clamp(y + Math.sin(angle) * 1.35, level.startY + 1, level.endY - 1);
  }
}

function buildHardness(random) {
  const danger = new Float32Array(GRID_W * GRID_H);

  for (let i = 0; i < DEPTH_LEVELS.length; i += 1) {
    const level = DEPTH_LEVELS[i];
    forEachCellInLevel(level, (x, y) => {
      const depthRatio = getLevelDepthRatio(level, y);
      const localRatio = (y - level.startY) / Math.max(1, level.height - 1);
      danger[cellIndex(x, y)] = 0.95 + depthRatio * 4.9 + localRatio * 1.2 + level.rules.hardnessBias;
    });

    const blobCount = Math.max(1, level.rules.hazardBlobGroups + Math.round(level.area / 1400));
    for (let n = 0; n < blobCount; n += 1) {
      const origin = randomCellInLevel(level, 2, random);
      if (!origin) continue;
      addDangerBlob(
        danger,
        level,
        origin.x,
        origin.y,
        6 + random() * Math.max(8, level.width * 0.18),
        -1.2 + random() * 2.8,
      );
    }

    const softVeins = Math.max(1, level.rules.hazardVeinGroups);
    const hardVeins = Math.max(1, level.rules.hazardVeinGroups);
    for (let n = 0; n < softVeins; n += 1) {
      const origin = randomCellInLevel(level, 2, random);
      if (!origin) continue;
      addDangerVein(danger, level, origin.x, origin.y, 8 + Math.floor(random() * 16), 1.2 + random() * 1.6, -0.8 - random() * 0.4, random);
    }
    for (let n = 0; n < hardVeins; n += 1) {
      const origin = randomCellInLevel(level, 2, random);
      if (!origin) continue;
      addDangerVein(danger, level, origin.x, origin.y, 10 + Math.floor(random() * 18), 1.0 + random() * 1.2, 0.9 + random() * 0.8, random);
    }
  }

  const hardness = new Uint8Array(GRID_W * GRID_H);
  for (let y = 0; y < GRID_H; y += 1) {
    for (let x = 0; x < GRID_W; x += 1) {
      const index = cellIndex(x, y);
      const level = getLevelForCell(x, y);
      if (!level) {
        hardness[index] = 0;
        continue;
      }
      const microNoise = (((x * 17 + y * 31) % 13) - 6) * 0.16;
      hardness[index] = clamp(Math.round(danger[index] + microNoise), 1, 7);
      if (isInStartEasyRadius(x, y)) hardness[index] = 1;
    }
  }
  return hardness;
}

// ── Placement helpers ───────────────────────────────────────────────────────

function chooseHazardType(random, level) {
  const allowed = level.rules.hazardTypes;
  return allowed[Math.floor(random() * allowed.length)];
}

function isPocketNeighbor(x, y, mask) {
  for (let dy = -1; dy <= 1; dy += 1) {
    for (let dx = -1; dx <= 1; dx += 1) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || nx >= GRID_W || ny < 0 || ny >= GRID_H) continue;
      if (mask[cellIndex(nx, ny)]) return true;
    }
  }
  return false;
}

function canPlaceHazardAt(x, y, level) {
  return isInsideLevel(x, y, level, 1) && !(x === START_X && y === START_Y) && !isInStartEasyRadius(x, y);
}

function canPlaceMetalAt(x, y, level) {
  return isInsideLevel(x, y, level, 1) && !(x === START_X && y === START_Y) && !isInStartEasyRadius(x, y);
}

function canPlaceGoldOreAt(x, y, level) {
  return isInsideLevel(x, y, level, 1) && !(x === START_X && y === START_Y) && !isInStartEasyRadius(x, y);
}

function canPlaceGasPocketAt(x, y, level, steamPocketMask, boulderPocketMask) {
  if (!isInsideLevel(x, y, level, 2)) return false;
  if (x === START_X && y === START_Y) return false;
  if (isInStartEasyRadius(x, y)) return false;
  if (steamPocketMask && isPocketNeighbor(x, y, steamPocketMask)) return false;
  if (boulderPocketMask && isPocketNeighbor(x, y, boulderPocketMask)) return false;
  return true;
}

function canPlaceSteamPocketAt(x, y, level, gasPocketMask, boulderPocketMask) {
  if (!isInsideLevel(x, y, level, 2)) return false;
  if (x === START_X && y === START_Y) return false;
  if (isInStartEasyRadius(x, y)) return false;
  if (gasPocketMask && isPocketNeighbor(x, y, gasPocketMask)) return false;
  if (boulderPocketMask && isPocketNeighbor(x, y, boulderPocketMask)) return false;
  return true;
}

function canPlaceBoulderPocketAt(x, y, level, gasPocketMask, steamPocketMask) {
  if (!isInsideLevel(x, y, level, 2)) return false;
  if (x === START_X && y === START_Y) return false;
  if (isInStartEasyRadius(x, y)) return false;
  if (gasPocketMask && isPocketNeighbor(x, y, gasPocketMask)) return false;
  if (steamPocketMask && isPocketNeighbor(x, y, steamPocketMask)) return false;
  return true;
}

function placeHazardBlob(hazardMask, level, random, blockCount) {
  const origin = randomCellInLevel(level, 2, random);
  if (!origin) return;
  const hazardType = chooseHazardType(random, level);
  const frontier = [{ x: origin.x, y: origin.y }];
  const seen = new Set();
  let placed = 0;
  while (frontier.length > 0 && placed < blockCount) {
    const frontierIndex = Math.floor(random() * frontier.length);
    const cell = frontier.splice(frontierIndex, 1)[0];
    const key = `${cell.x},${cell.y}`;
    if (seen.has(key)) continue;
    seen.add(key);
    if (!canPlaceHazardAt(cell.x, cell.y, level)) continue;
    hazardMask[cellIndex(cell.x, cell.y)] = hazardType;
    placed += 1;
    const neighbors = [
      { x: cell.x + 1, y: cell.y }, { x: cell.x - 1, y: cell.y },
      { x: cell.x, y: cell.y + 1 }, { x: cell.x, y: cell.y - 1 },
      { x: cell.x + 1, y: cell.y + 1 }, { x: cell.x + 1, y: cell.y - 1 },
      { x: cell.x - 1, y: cell.y + 1 }, { x: cell.x - 1, y: cell.y - 1 },
    ];
    for (let i = 0; i < neighbors.length; i += 1) {
      if (isInsideLevel(neighbors[i].x, neighbors[i].y, level, 1) && random() < 0.86) {
        frontier.push(neighbors[i]);
      }
    }
  }
}

function placeHazardVein(hazardMask, level, random, blockCount) {
  const origin = randomCellInLevel(level, 2, random);
  if (!origin) return;
  const hazardType = chooseHazardType(random, level);
  let x = origin.x;
  let y = origin.y;
  let angle = random() * Math.PI * 2;
  let placed = 0;
  let attempts = 0;
  while (placed < blockCount && attempts < blockCount * 8) {
    attempts += 1;
    const ix = Math.round(x);
    const iy = Math.round(y);
    if (canPlaceHazardAt(ix, iy, level)) {
      hazardMask[cellIndex(ix, iy)] = hazardType;
      placed += 1;
    }
    angle += (random() - 0.5) * 0.85;
    x = clamp(x + Math.cos(angle) * 1.05, level.xMin + 1, level.xMax - 1);
    y = clamp(y + Math.sin(angle) * 1.05, level.startY + 1, level.endY - 1);
  }
}

function placeMetalVein(metalMask, hazardMask, gasPocketMask, steamPocketMask, boulderPocketMask, level, random, blockCount) {
  const origin = randomCellInLevel(level, 2, random);
  if (!origin) return;
  let x = origin.x;
  let y = origin.y;
  let angle = random() * Math.PI * 2;
  let placed = 0;
  let attempts = 0;
  while (placed < blockCount && attempts < blockCount * 10) {
    attempts += 1;
    const ix = Math.round(x);
    const iy = Math.round(y);
    if (canPlaceMetalAt(ix, iy, level)) {
      const index = cellIndex(ix, iy);
      metalMask[index] = 1;
      hazardMask[index] = 0;
      gasPocketMask[index] = 0;
      steamPocketMask[index] = 0;
      boulderPocketMask[index] = 0;
      placed += 1;
    }
    angle += (random() - 0.5) * 0.55;
    x = clamp(x + Math.cos(angle) * 1.05, level.xMin + 1, level.xMax - 1);
    y = clamp(y + Math.sin(angle) * 1.05, level.startY + 1, level.endY - 1);
  }
}

function placeGoldOreVein(goldOreMask, level, random, blockCount) {
  const origin = randomCellInLevel(level, 2, random);
  if (!origin) return;
  let x = origin.x;
  let y = origin.y;
  let angle = random() * Math.PI * 2;
  let placed = 0;
  let attempts = 0;
  while (placed < blockCount && attempts < blockCount * 10) {
    attempts += 1;
    const ix = Math.round(x);
    const iy = Math.round(y);
    if (canPlaceGoldOreAt(ix, iy, level)) {
      goldOreMask[cellIndex(ix, iy)] = 1;
      placed += 1;
    }
    angle += (random() - 0.5) * 0.6;
    x = clamp(x + Math.cos(angle) * 1.1, level.xMin + 1, level.xMax - 1);
    y = clamp(y + Math.sin(angle) * 1.1, level.startY + 1, level.endY - 1);
  }
}

function placeGasPocket(gasPocketMask, hazardMask, steamPocketMask, boulderPocketMask, level, random, cellCount) {
  const origin = randomCellInLevel(level, 2, random);
  if (!origin) return;
  const frontier = [{ x: origin.x, y: origin.y }];
  const seen = new Set();
  let placed = 0;
  while (frontier.length > 0 && placed < cellCount) {
    const frontierIndex = Math.floor(random() * frontier.length);
    const cell = frontier.splice(frontierIndex, 1)[0];
    const key = `${cell.x},${cell.y}`;
    if (seen.has(key)) continue;
    seen.add(key);
    if (!canPlaceGasPocketAt(cell.x, cell.y, level, steamPocketMask, boulderPocketMask)) continue;
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
      if (isInsideLevel(neighbors[i].x, neighbors[i].y, level, 2) && random() < 0.82) {
        frontier.push(neighbors[i]);
      }
    }
  }
}

function placeSteamPocket(steamPocketMask, hazardMask, gasPocketMask, boulderPocketMask, level, random, cellCount) {
  const origin = randomCellInLevel(level, 2, random);
  if (!origin) return;
  const frontier = [{ x: origin.x, y: origin.y }];
  const seen = new Set();
  let placed = 0;
  while (frontier.length > 0 && placed < cellCount) {
    const frontierIndex = Math.floor(random() * frontier.length);
    const cell = frontier.splice(frontierIndex, 1)[0];
    const key = `${cell.x},${cell.y}`;
    if (seen.has(key)) continue;
    seen.add(key);
    if (!canPlaceSteamPocketAt(cell.x, cell.y, level, gasPocketMask, boulderPocketMask)) continue;
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
      if (isInsideLevel(neighbors[i].x, neighbors[i].y, level, 2) && random() < 0.78) {
        frontier.push(neighbors[i]);
      }
    }
  }
}

function placeBoulderPocket(boulderPocketMask, hazardMask, gasPocketMask, steamPocketMask, level, random) {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const origin = randomCellInLevel(level, 2, random);
    if (!origin) return;
    if (!canPlaceBoulderPocketAt(origin.x, origin.y, level, gasPocketMask, steamPocketMask)) continue;
    const index = cellIndex(origin.x, origin.y);
    boulderPocketMask[index] = 1;
    hazardMask[index] = 0;
    gasPocketMask[index] = 0;
    steamPocketMask[index] = 0;
    return;
  }
}

function applyOuterMetalFrame(metalMask) {
  for (let y = 0; y < GRID_H; y += 1) {
    for (let x = 0; x < GRID_W; x += 1) {
      if (isInsidePlayableArea(x, y)) continue;
      let touchesPlayable = false;
      for (let dy = -1; dy <= 1 && !touchesPlayable; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || nx >= GRID_W || ny < 0 || ny >= GRID_H) continue;
          if (isInsidePlayableArea(nx, ny)) {
            touchesPlayable = true;
            break;
          }
        }
      }
      if (touchesPlayable) {
        metalMask[cellIndex(x, y)] = 1;
      }
    }
  }
}

function placeBase(metalMask, gasPocketMask, steamPocketMask, boulderPocketMask, beaconMask, random) {
  const hostLevels = DEPTH_LEVELS.filter((level) => level.canHostBase);
  if (hostLevels.length === 0) {
    throw new Error("No depth level is marked as canHostBase");
  }
  const candidates = [];
  for (const level of hostLevels) {
    for (let y = level.startY + 2; y <= level.endY - 2; y += 1) {
      for (let x = level.xMin + 2; x <= level.xMax - 2; x += 1) {
        const idx = cellIndex(x, y);
        if (!metalMask[idx] && !gasPocketMask[idx] && !steamPocketMask[idx] && !boulderPocketMask[idx] && !beaconMask[idx]) {
          candidates.push({ x, y });
        }
      }
    }
  }
  shuffle(candidates, random);
  if (candidates.length === 0) throw new Error("Unable to place base inside host levels");
  return candidates[0];
}

function tryPlaceBeacon(x, y, level, beaconMask, metalMask, hazardMask, gasPocketMask, steamPocketMask, boulderPocketMask, beacons, base) {
  if (!isInsideLevel(x, y, level, 1) || !isInsideLevel(x + 1, y + 1, level, 1)) return false;
  if ((x === base.x && y === base.y) || (x + 1 === base.x && y + 1 === base.y)) return false;
  for (let dy = -1; dy <= 2; dy += 1) {
    for (let dx = -1; dx <= 2; dx += 1) {
      const rx = x + dx;
      const ry = y + dy;
      if (!isInsideLevel(rx, ry, level, 0)) return false;
      const idx = cellIndex(rx, ry);
      if (metalMask[idx] || hazardMask[idx] || gasPocketMask[idx] || steamPocketMask[idx] || boulderPocketMask[idx] || beaconMask[idx]) return false;
      if (rx === base.x && ry === base.y) return false;
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
      const idx = cellIndex(rx, ry);
      if (!beaconMask[idx]) beaconMask[idx] = 2;
    }
  }
  return true;
}

function placeBeacons(beaconMask, metalMask, hazardMask, gasPocketMask, steamPocketMask, boulderPocketMask, beacons, base, random) {
  for (const level of DEPTH_LEVELS) {
    const target = level.required.beacons || 0;
    if (target <= 0) continue;
    const candidates = collectCandidatesInLevel(level, 1, () => true);
    shuffle(candidates, random);
    let placed = 0;
    for (let i = 0; i < candidates.length && placed < target; i += 1) {
      if (tryPlaceBeacon(candidates[i].x, candidates[i].y, level, beaconMask, metalMask, hazardMask, gasPocketMask, steamPocketMask, boulderPocketMask, beacons, base)) {
        placed += 1;
      }
    }
  }
}

function placePerkTiles(perkMask, metalMask, gasPocketMask, steamPocketMask, boulderPocketMask, beaconMask, base, random) {
  for (const level of DEPTH_LEVELS) {
    const targetCount = getTargetPerkTileCount(level);
    const placed = [];
    let attempts = 0;
    while (placed.length < targetCount && attempts < targetCount * 90) {
      const cell = randomCellInLevel(level, 2, random);
      if (!cell) break;
      const x = cell.x;
      const y = cell.y;
      const index = cellIndex(x, y);
      attempts += 1;
      if (perkMask[index] > 0 || metalMask[index] || gasPocketMask[index] || steamPocketMask[index] || boulderPocketMask[index] || beaconMask[index]) continue;
      if ((x === base.x && y === base.y) || (x === START_X && y === START_Y)) continue;
      if (!isFarEnoughFromPlaced(x, y, placed, PERK_MIN_DISTANCE)) continue;
      perkMask[index] = chooseTilePerkForPosition(x, y, random);
      placed.push({ x, y });
    }
  }
}

function placeCrystalTiles(crystalMask, perkMask, perkZoneMask, metalMask, gasPocketMask, steamPocketMask, boulderPocketMask, beaconMask, base, random) {
  for (const level of DEPTH_LEVELS) {
    const targetCount = getTargetCrystalTileCount(level);
    const placed = [];
    let attempts = 0;
    while (placed.length < targetCount && attempts < targetCount * 100) {
      const cell = randomCellInLevel(level, 2, random);
      if (!cell) break;
      const x = cell.x;
      const y = cell.y;
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
    if (used.has(key)) continue;
    const nextMinX = Math.min(minX, nextX);
    const nextMaxX = Math.max(maxX, nextX);
    const nextMinY = Math.min(minY, nextY);
    const nextMaxY = Math.max(maxY, nextY);
    if (nextMaxX - nextMinX > 3 || nextMaxY - nextMinY > 3) continue;
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

function placePerkZones(perkZoneMask, metalMask, gasPocketMask, steamPocketMask, boulderPocketMask, beaconMask, perkZones, base, random) {
  for (const level of DEPTH_LEVELS) {
    const placed = [];
    const targetCount = level.required.perkZones || 0;
    let attempts = 0;
    while (placed.length < targetCount && attempts < targetCount * 180) {
      const shape = createPerkZoneShape(random);
      const origin = randomCellInLevel(level, 2, random);
      if (!origin) break;
      const originX = clamp(origin.x, level.xMin + 1, level.xMax - shape.width);
      const originY = clamp(origin.y, level.startY + 1, level.endY - shape.height);
      attempts += 1;
      const centerX = originX + shape.centerX;
      const centerY = originY + shape.centerY;
      if (!isFarEnoughFromPlaced(centerX, centerY, placed, PERK_ZONE_MIN_DISTANCE)) continue;
      let blocked = false;
      const cells = [];
      for (let i = 0; i < shape.cells.length; i += 1) {
        const cell = shape.cells[i];
        const x = originX + cell.x;
        const y = originY + cell.y;
        const index = cellIndex(x, y);
        if (
          !isInsideLevel(x, y, level, 0) ||
          (x === START_X && y === START_Y) ||
          (x === base.x && y === base.y) ||
          metalMask[index] || perkZoneMask[index] !== -1 ||
          gasPocketMask[index] || steamPocketMask[index] || boulderPocketMask[index] || beaconMask[index]
        ) {
          blocked = true;
          break;
        }
        cells.push({ x, y });
      }
      if (blocked) continue;
      const zoneId = perkZones.length;
      const perkType = chooseTilePerkForPosition(centerX, centerY, random);
      perkZones.push({
        x: centerX,
        y: centerY,
        cells,
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
}

function placeSafes(metalMask, hardness, beaconMask, gasPocketMask, steamPocketMask, boulderPocketMask, perkZoneMask, perkMask, crystalMask, hazardMask, safes, base, random) {
  const placed = [];
  for (const level of DEPTH_LEVELS) {
    const target = level.required.safes || 0;
    let attempts = 0;
    let placedOnLevel = 0;
    while (placedOnLevel < target && attempts < target * 260) {
      attempts += 1;
      if (level.width < 10 || level.height < 10) break;
      const ox = level.xMin + 2 + Math.floor(random() * Math.max(1, level.width - 8));
      const oy = level.startY + 2 + Math.floor(random() * Math.max(1, level.height - 8));
      const cx = ox + 2;
      const cy = oy + 2;
      if (!isInsideLevel(ox, oy, level, 0) || !isInsideLevel(ox + 4, oy + 4, level, 0)) continue;
      if (Math.abs(cx - START_X) + Math.abs(cy - START_Y) < SAFE_MIN_START_DISTANCE) continue;
      if (!isFarEnoughFromPlaced(cx, cy, placed, SAFE_MIN_DISTANCE)) continue;
      let blocked = false;
      for (let dy = 0; dy < 5 && !blocked; dy += 1) {
        for (let dx = 0; dx < 5 && !blocked; dx += 1) {
          const wx = ox + dx;
          const wy = oy + dy;
          const idx = cellIndex(wx, wy);
          if (
            !isInsideLevel(wx, wy, level, 0) ||
            (wx === base.x && wy === base.y) ||
            metalMask[idx] || beaconMask[idx] || gasPocketMask[idx] ||
            steamPocketMask[idx] || boulderPocketMask[idx] || perkZoneMask[idx] !== -1
          ) {
            blocked = true;
          }
        }
      }
      if (blocked) continue;
      const doorSide = Math.floor(random() * 4);
      const doorOffset = 1 + Math.floor(random() * 3);
      let doorX;
      let doorY;
      if (doorSide === 0) { doorX = ox + doorOffset; doorY = oy; }
      else if (doorSide === 1) { doorX = ox + 4; doorY = oy + doorOffset; }
      else if (doorSide === 2) { doorX = ox + doorOffset; doorY = oy + 4; }
      else { doorX = ox; doorY = oy + doorOffset; }

      let keyX = -1;
      let keyY = -1;
      for (let ka = 0; ka < 120; ka += 1) {
        const kx = cx + Math.floor((random() - 0.5) * 2 * SAFE_KEY_MAX_DIST);
        const ky = cy + Math.floor((random() - 0.5) * 2 * SAFE_KEY_MAX_DIST);
        if (!isInsideLevel(kx, ky, level, 2)) continue;
        const dist = Math.hypot(kx - cx, ky - cy);
        if (dist < SAFE_KEY_MIN_DIST || dist > SAFE_KEY_MAX_DIST) continue;
        const ki = cellIndex(kx, ky);
        if (metalMask[ki] || beaconMask[ki] || gasPocketMask[ki] || steamPocketMask[ki] || boulderPocketMask[ki]) continue;
        if (kx === base.x && ky === base.y) continue;
        keyX = kx;
        keyY = ky;
        break;
      }
      if (keyX === -1) continue;

      const interiorCells = [];
      for (let dy = 0; dy < 5; dy += 1) {
        for (let dx = 0; dx < 5; dx += 1) {
          const wx = ox + dx;
          const wy = oy + dy;
          const idx = cellIndex(wx, wy);
          const isBorder = dx === 0 || dx === 4 || dy === 0 || dy === 4;
          if (isBorder) {
            if (wx === doorX && wy === doorY) {
              hardness[idx] = 7;
            } else {
              metalMask[idx] = 1;
            }
          } else {
            hardness[idx] = 0;
            interiorCells.push({ x: wx, y: wy });
          }
          perkMask[idx] = 0;
          crystalMask[idx] = 0;
          hazardMask[idx] = 0;
          if (perkZoneMask[idx] !== -1) perkZoneMask[idx] = -1;
        }
      }

      safes.push({ x: ox, y: oy, cx, cy, doorX, doorY, keyX, keyY, interiorCells });
      placed.push({ x: cx, y: cy });
      placedOnLevel += 1;
    }
  }
}

function isArtifactPlacementBlocked(x, y, artifactMask, perkMask, crystalMask, perkZoneMask, metalMask, gasPocketMask, steamPocketMask, boulderPocketMask, beaconMask, base, placed) {
  if (!isInsidePlayableArea(x, y)) return true;
  const index = cellIndex(x, y);
  if (
    perkMask[index] > 0 || crystalMask[index] > 0 || perkZoneMask[index] !== -1 ||
    metalMask[index] || gasPocketMask[index] || steamPocketMask[index] ||
    boulderPocketMask[index] || beaconMask[index] || artifactMask[index]
  ) return true;
  if ((x === base.x && y === base.y) || (x === START_X && y === START_Y)) return true;
  if (!isFarEnoughFromPlaced(x, y, placed, ARTIFACT_MIN_DISTANCE)) return true;
  return false;
}

function placeArtifacts(artifactMask, perkMask, crystalMask, perkZoneMask, metalMask, gasPocketMask, steamPocketMask, boulderPocketMask, beaconMask, beacons, base, random) {
  const placed = [];
  for (const level of DEPTH_LEVELS) {
    const target = level.required.artifacts || 0;
    let placedOnLevel = 0;
    let attempts = 0;
    while (placedOnLevel < target && attempts < target * 200) {
      attempts += 1;
      const cell = randomCellInLevel(level, 2, random);
      if (!cell) break;
      const x = cell.x;
      const y = cell.y;
      if (isArtifactPlacementBlocked(x, y, artifactMask, perkMask, crystalMask, perkZoneMask, metalMask, gasPocketMask, steamPocketMask, boulderPocketMask, beaconMask, base, placed)) {
        continue;
      }
      let tooCloseToBeacon = false;
      for (const b of beacons) {
        if (Math.abs(x - b.x) + Math.abs(y - b.y) < ARTIFACT_MIN_BEACON_DIST) {
          tooCloseToBeacon = true;
          break;
        }
      }
      if (tooCloseToBeacon) continue;
      artifactMask[cellIndex(x, y)] = 1;
      placed.push({ x, y });
      placedOnLevel += 1;
    }
  }
}

function placeWormNests(metalMask, gasPocketMask, steamPocketMask, boulderPocketMask, beaconMask, beacons, safes, base, random) {
  const placed = [];
  for (const level of DEPTH_LEVELS) {
    const target = level.required.wormNests || 0;
    let placedOnLevel = 0;
    let attempts = 0;
    while (placedOnLevel < target && attempts < target * 150) {
      attempts += 1;
      const cell = randomCellInLevel(level, 2, random);
      if (!cell) break;
      const x = cell.x;
      const y = cell.y;
      const index = cellIndex(x, y);
      if (metalMask[index] || beaconMask[index] || gasPocketMask[index] || steamPocketMask[index] || boulderPocketMask[index]) continue;
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
      let tooCloseToSafe = false;
      for (const s of safes) {
        if (Math.hypot(x - s.x, y - s.y) < 8) {
          tooCloseToSafe = true;
          break;
        }
      }
      if (tooCloseToSafe) continue;
      placed.push({ x, y });
      placedOnLevel += 1;
    }
  }
  return placed;
}

function repairPockets(pocketMask, beaconMask) {
  for (let i = 0; i < GRID_W * GRID_H; i += 1) {
    if (pocketMask[i] && beaconMask[i]) {
      pocketMask[i] = 0;
    }
  }
  let changed = true;
  while (changed) {
    changed = false;
    for (let y = 1; y < GRID_H - 1; y += 1) {
      for (let x = 1; x < GRID_W - 1; x += 1) {
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

function validateLevelRequirements(map) {
  for (const level of DEPTH_LEVELS) {
    const beaconCount = map.beacons.filter((b) => isInsideLevel(b.x, b.y, level, 0)).length;
    const perkZoneCount = map.perkZones.filter((zone) => isInsideLevel(Math.round(zone.x), Math.round(zone.y), level, 0)).length;
    const safeCount = map.safes.filter((safe) => isInsideLevel(safe.cx, safe.cy, level, 0)).length;
    const wormCount = map.wormNests.filter((nest) => isInsideLevel(nest.x, nest.y, level, 0)).length;
    const artifactCount = collectCandidatesInLevel(level, 0, (x, y) => map.artifactMask[cellIndex(x, y)] > 0).length;
    const crystalCount = collectCandidatesInLevel(level, 0, (x, y) => map.crystalMask[cellIndex(x, y)] > 0).length;

    const expectedBeaconCount = level.required.beacons || 0;
    if (beaconCount < expectedBeaconCount) {
      throw new Error(`Level ${level.level} beacon count too low: ${beaconCount}/${expectedBeaconCount}`);
    }
    if (perkZoneCount < (level.required.perkZones || 0)) {
      throw new Error(`Level ${level.level} perk zone count too low: ${perkZoneCount}/${level.required.perkZones || 0}`);
    }
    if (safeCount < (level.required.safes || 0)) {
      throw new Error(`Level ${level.level} safe count too low: ${safeCount}/${level.required.safes || 0}`);
    }
    if (wormCount < (level.required.wormNests || 0)) {
      throw new Error(`Level ${level.level} worm nest count too low: ${wormCount}/${level.required.wormNests || 0}`);
    }
    if (artifactCount < (level.required.artifacts || 0)) {
      throw new Error(`Level ${level.level} artifact count too low: ${artifactCount}/${level.required.artifacts || 0}`);
    }
    if (crystalCount < (level.required.crystals || 0)) {
      throw new Error(`Level ${level.level} crystal count too low: ${crystalCount}/${level.required.crystals || 0}`);
    }
  }

  const hostLevels = DEPTH_LEVELS.filter((level) => level.canHostBase);
  if (!hostLevels.some((level) => isInsideLevel(map.base.x, map.base.y, level, 0))) {
    throw new Error("Base spawned outside host levels");
  }
}

// ── Main export ─────────────────────────────────────────────────────────────

/**
 * Generate a complete map for the given seed.
 * Returns plain data arrays — no game state, safe to use from any context.
 *
 * beacons entries: { x, y }  (game.js adds `active: false`)
 * perkZones entries: { x, y, cells, iconX, iconY, perkType }
 *   (game.js adds openedCount, openedMask, arming, armingTimer, collected)
 */
export function generateMap(seed) {
  const random = mulberry32(seed);

  const hardness = buildHardness(random);
  const hazardMask = new Uint8Array(GRID_W * GRID_H);
  const metalMask = new Uint8Array(GRID_W * GRID_H);
  const goldOreMask = new Uint8Array(GRID_W * GRID_H);
  const gasPocketMask = new Uint8Array(GRID_W * GRID_H);
  const steamPocketMask = new Uint8Array(GRID_W * GRID_H);
  const boulderPocketMask = new Uint8Array(GRID_W * GRID_H);
  const beaconMask = new Uint8Array(GRID_W * GRID_H);
  const perkMask = new Uint8Array(GRID_W * GRID_H);
  const crystalMask = new Uint8Array(GRID_W * GRID_H);
  const perkZoneMask = new Int32Array(GRID_W * GRID_H).fill(-1);
  const artifactMask = new Uint8Array(GRID_W * GRID_H);

  const beacons = [];
  const perkZones = [];
  const safes = [];

  applyOuterMetalFrame(metalMask);

  for (const level of DEPTH_LEVELS) {
    for (let i = 0; i < level.rules.hazardBlobGroups; i += 1) {
      placeHazardBlob(hazardMask, level, random, 4 + Math.floor(random() * 14));
    }
    for (let i = 0; i < level.rules.hazardVeinGroups; i += 1) {
      placeHazardVein(hazardMask, level, random, 6 + Math.floor(random() * 18));
    }
    for (let i = 0; i < level.rules.metalVeinGroups; i += 1) {
      placeMetalVein(metalMask, hazardMask, gasPocketMask, steamPocketMask, boulderPocketMask, level, random, 10 + Math.floor(random() * 16));
    }
    for (let i = 0; i < level.rules.goldOreGroups; i += 1) {
      const minTiles = level.rules.goldOreMinTiles;
      const maxTiles = level.rules.goldOreMaxTiles;
      const blockCount = minTiles + Math.floor(random() * (maxTiles - minTiles + 1));
      placeGoldOreVein(goldOreMask, level, random, blockCount);
    }
    for (let i = 0; i < level.rules.gasPocketGroups; i += 1) {
      placeGasPocket(gasPocketMask, hazardMask, steamPocketMask, boulderPocketMask, level, random, 4 + Math.floor(random() * 12));
    }
    for (let i = 0; i < level.rules.steamPocketGroups; i += 1) {
      placeSteamPocket(steamPocketMask, hazardMask, gasPocketMask, boulderPocketMask, level, random, 3 + Math.floor(random() * 8));
    }
    for (let i = 0; i < level.rules.boulderPocketGroups; i += 1) {
      placeBoulderPocket(boulderPocketMask, hazardMask, gasPocketMask, steamPocketMask, level, random);
    }
  }

  const base = placeBase(metalMask, gasPocketMask, steamPocketMask, boulderPocketMask, beaconMask, random);
  placeBeacons(beaconMask, metalMask, hazardMask, gasPocketMask, steamPocketMask, boulderPocketMask, beacons, base, random);
  for (let i = 0; i < GRID_W * GRID_H; i += 1) {
    if (beaconMask[i] >= 1) hardness[i] = 0;
  }

  placeSafes(metalMask, hardness, beaconMask, gasPocketMask, steamPocketMask, boulderPocketMask, perkZoneMask, perkMask, crystalMask, hazardMask, safes, base, random);
  placePerkTiles(perkMask, metalMask, gasPocketMask, steamPocketMask, boulderPocketMask, beaconMask, base, random);
  placeCrystalTiles(crystalMask, perkMask, perkZoneMask, metalMask, gasPocketMask, steamPocketMask, boulderPocketMask, beaconMask, base, random);
  placePerkZones(perkZoneMask, metalMask, gasPocketMask, steamPocketMask, boulderPocketMask, beaconMask, perkZones, base, random);
  placeArtifacts(artifactMask, perkMask, crystalMask, perkZoneMask, metalMask, gasPocketMask, steamPocketMask, boulderPocketMask, beaconMask, beacons, base, random);
  const wormNests = placeWormNests(metalMask, gasPocketMask, steamPocketMask, boulderPocketMask, beaconMask, beacons, safes, base, random);

  repairPockets(gasPocketMask, beaconMask);
  repairPockets(steamPocketMask, beaconMask);
  for (let i = 0; i < GRID_W * GRID_H; i += 1) {
    if (boulderPocketMask[i] && beaconMask[i]) boulderPocketMask[i] = 0;
  }

  const map = {
    hardness,
    hazardMask,
    metalMask,
    goldOreMask,
    gasPocketMask,
    steamPocketMask,
    boulderPocketMask,
    beaconMask,
    beacons,
    perkMask,
    crystalMask,
    perkZones,
    artifactMask,
    safes,
    wormNests,
    base,
  };

  validateLevelRequirements(map);
  return map;
}
