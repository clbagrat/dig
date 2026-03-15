const TILE_SIZE = 36;
const GRID_W = 150;
const GRID_H = 220;
const HUD_FONT = 'Baskerville, "Palatino Linotype", "Book Antiqua", Georgia, serif';
const STEP_MS = 1000 / 60;
const MAX_FRAME_MS = 100;
const VISION_RADIUS = 5;
const START_X = Math.floor(GRID_W / 2);
const START_Y = Math.floor(GRID_H / 2);
const START_FUEL = 420;
const START_HP = 7;
const IDLE_FUEL_DRAIN = 0.8;
const MOVE_FUEL_COST = 1.8;
const STRIKE_FUEL_COST = 4.5;
const STRIKE_CYCLE_SPEED = 8;
const PERK_MIN_DISTANCE = 4;
const PERK_ZONE_MIN_DISTANCE = 6;
const TILES_PER_PERK_TILE = 44;
const TILES_PER_PERK_ZONE = 480;
const BASE_MIN_DISTANCE = 50;
const RADAR_BASE_CHARGES = 10;
const SCRAP_PERK_BASE_COST = 30;
const SCRAP_PERK_COST_MULTIPLIER = 1.35;
const SCRAP_PERK_POPUP_DELAY = 0.5;
const BASE_MOVE_INTERVAL = 10;
const BASE_MOVE_AWAY_CHANCE = 0.5;
const GAS_POCKET_GROUPS = 10;
const STEAM_POCKET_GROUPS = 8;
const BOULDER_POCKET_GROUPS = 8;
const GAS_SPREAD_INTERVAL = 2;
const GAS_SPREAD_STEPS = 3;
const GAS_DAMAGE = 1;
const BOULDER_DELAY = 1;
const BOULDER_MOVE_INTERVAL = 0.12;
const BOULDER_BREAK_LIMIT = 4;
const BOULDER_DAMAGE = 5;
const BOULDER_MIN_START_DISTANCE = BOULDER_BREAK_LIMIT;
const STEAM_PULSE_INTERVAL = 1.2;
const STEAM_PULSE_COUNT = 3;
const STEAM_DAMAGE = 1;
const STEAM_RANGE = 6;
const EXPLOSION_BREAK_DAMAGE = 9999;
const FUEL_DEPLETION_HP_COST = 1;
const FUEL_DEPLETION_RECOVERY = 50;
const IMPACT_EFFECT_DURATION = 0.22;
const BREAK_EFFECT_DURATION = 0.42;
const EXPLOSION_EFFECT_DURATION = 0.48;
const HAZARD_TYPES = {
  SPIKE: 1,
  VOLATILE: 2,
};
const HAZARD_DATA = {
  [HAZARD_TYPES.SPIKE]: { damage: 1, color: "#ff6b48" },
  [HAZARD_TYPES.VOLATILE]: { damage: 2, color: "#ffd166" },
};

const BLOCK_TYPES = [
  { hp: 0, color: "#1a1410", scrap: 0, vein: "#3c2d22" },
  { hp: 6, color: "#5f4631", scrap: 2, vein: "#9b7a4a" },
  { hp: 9, color: "#715337", scrap: 4, vein: "#c59a5c" },
  { hp: 12, color: "#6a4f37", scrap: 6, vein: "#d0a66a" },
  { hp: 15, color: "#6f4f40", scrap: 8, vein: "#b66e3b" },
  { hp: 18, color: "#60473f", scrap: 11, vein: "#a57f58" },
  { hp: 21, color: "#4f3d36", scrap: 14, vein: "#9cb1b7" },
  { hp: 27, color: "#3e3236", scrap: 18, vein: "#d6d9df" },
];

const TILE_PERK_TYPES = [
  null,
  { name: "Бак", icon: "F", color: "#ffcf7a", desc: "+90 топлива прямо сейчас" },
  { name: "Радар", icon: "R", color: "#8ef0cb", desc: "+5 сигналов hotter/colder" },
  { name: "Бур", icon: "D", color: "#ff9f6b", desc: "+0.5 к силе удара бура" },
  { name: "Бомба", icon: "*", color: "#ff7c5f", desc: "Взрыв в радиусе 2 тайлов с уроном x10" },
  { name: "Скорость", icon: "S", color: "#9fd7ff", desc: "+15% к скорости нового удара" },
  { name: "HP+", icon: "H", color: "#ff8f8f", desc: "+1 к текущему здоровью" },
];

const SCRAP_PERK_TYPES = [
  null,
  { name: "Боковые буры", desc: "Удар также бьет по двум боковым клеткам" },
  { name: "Прыжковый привод", desc: "Каждые 10 блоков дает рывок, повторный выбор увеличивает дальность" },
  { name: "Длинный бур", desc: "Бьет следующий тайл вперед, повторно усиливает дальний удар" },
  { name: "Диагональные буры", desc: "Бьют по диагоналям вперед, повторно усиливают дальний удар" },
  { name: "Форсаж на нуле", desc: "Чем меньше топлива, тем быстрее следующий удар" },
  { name: "Саперный заряд", desc: "Каждые 15 разрушенных блоков кидает бомбу 2x2 на дистанцию 3" },
  { name: "Топливный контур", desc: "Любой перк дает +50 топлива, Бак дает на 50 меньше" },
  { name: "Гео-линза", desc: "+2 к радиусу обзора и +2 шага от радара" },
  { name: "Рециркулятор", desc: "+2 скрапа и +2 топлива за каждый разрушенный блок" },
  { name: "Перегрузка", desc: "Переполнение топлива запускает дальнюю бомбу, бак -50, топлива +50" },
  { name: "Усиленный корпус", desc: "+1 к максимуму HP и полное исцеление" },
];

const TILE_PERK_WEIGHTS = [0, 7, 3, 2, 4, 3, 2];

const state = {
  canvas: document.getElementById("game"),
  ctx: null,
  width: 0,
  height: 0,
  dpr: 1,
  worldSeed: 0,
  worldRandom: Math.random,
  timeAcc: 0,
  lastTs: 0,
  fuel: START_FUEL,
  maxFuel: START_FUEL,
  hp: START_HP,
  maxHp: START_HP,
  depth: 0,
  scrap: 0,
  baseFound: false,
  outOfFuel: false,
  dead: false,
  visionRadius: VISION_RADIUS,
  dragId: null,
  padCenterX: 0,
  padCenterY: 0,
  moveAimX: 0,
  moveAimY: 0,
  isChoosingPerk: false,
  pendingPerkChoice: false,
  pendingPerkDelay: 0,
  nextScrapPerkAt: SCRAP_PERK_BASE_COST,
  scrapPerkLevel: 0,
  perkChoices: [],
  pathTiles: [],
  pathIndexByCell: new Int16Array(GRID_W * GRID_H),
  tunnelMask: new Uint8Array(GRID_W * GRID_H),
  perkMask: new Uint8Array(GRID_W * GRID_H),
  perkZoneMask: new Int16Array(GRID_W * GRID_H),
  perkZones: [],
  hardness: new Uint8Array(GRID_W * GRID_H),
  hazardMask: new Uint8Array(GRID_W * GRID_H),
  hazardTriggeredMask: new Uint8Array(GRID_W * GRID_H),
  gasPocketMask: new Uint8Array(GRID_W * GRID_H),
  gasMask: new Uint8Array(GRID_W * GRID_H),
  gasClouds: [],
  steamPocketMask: new Uint8Array(GRID_W * GRID_H),
  steamMask: new Uint8Array(GRID_W * GRID_H),
  steamJets: [],
  boulderPocketMask: new Uint8Array(GRID_W * GRID_H),
  boulders: [],
  health: new Float32Array(GRID_W * GRID_H),
  signalMovesLeft: 0,
  signalMovesMax: 0,
  signalPrevX: START_X,
  signalPrevY: START_Y,
  signalText: "Старт",
  perkText: "Нет",
  moveFuelCost: MOVE_FUEL_COST,
  strikeFuelCost: STRIKE_FUEL_COST,
  strikeSpeed: 1,
  drillPower: 1,
  scrapBonus: 0,
  fuelOnBreak: 0,
  fuelPickupBonus: 0,
  perkFuelBonus: 0,
  overflowBomb: false,
  fuelEventDepth: 0,
  overflowTriggeredInEvent: false,
  resolvingOverflowBomb: false,
  radarBonus: 0,
  blocksBroken: 0,
  drillBrokenBlocks: 0,
  sideDrills: 0,
  jumpDrive: false,
  jumpCharges: 0,
  jumpRange: 0,
  movedTiles: 0,
  longDrillPower: 0,
  diagonalDrillPower: 0,
  lowFuelSpeedBonus: 0,
  remoteBombLevel: 0,
  playerMoveProgress: 0,
  perkToast: {
    text: "",
    time: 0,
  },
  fuelToast: {
    value: 0,
    time: 0,
  },
  hpToast: {
    value: 0,
    time: 0,
  },
  scrapToast: {
    value: 0,
    time: 0,
  },
  damageFlash: 0,
  sprites: null,
  effects: [],
  base: {
    x: 0,
    y: 0,
    visible: false,
  },
  cameraShake: {
    time: 0,
    amplitude: 0,
  },
  drill: {
    x: START_X,
    y: START_Y,
    px: 0,
    py: 0,
    facingX: 0,
    facingY: 1,
    progress: 0,
    rate: 24,
    strikePhase: 0,
    strikeEnergy: 0,
    strikeLatch: false,
  },
};

function cellIndex(x, y) {
  return y * GRID_W + x;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function makeSpriteCanvas(size = TILE_SIZE) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  return canvas;
}

function fillRoundRect(ctx, x, y, width, height, radius) {
  buildRoundedRectPath(ctx, x, y, width, height, radius);
  ctx.fill();
}

function buildRoundedRectPath(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width * 0.5, height * 0.5);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function shiftHexColor(color, amount) {
  const hex = color.replace("#", "");
  const r = clamp(parseInt(hex.slice(0, 2), 16) + amount, 0, 255);
  const g = clamp(parseInt(hex.slice(2, 4), 16) + amount, 0, 255);
  const b = clamp(parseInt(hex.slice(4, 6), 16) + amount, 0, 255);
  return `rgb(${r}, ${g}, ${b})`;
}

function lightenColor(color, amount) {
  return shiftHexColor(color, amount);
}

function darkenColor(color, amount) {
  return shiftHexColor(color, -amount);
}

function createBlockSprite(type, tier) {
  const canvas = makeSpriteCanvas();
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, TILE_SIZE, TILE_SIZE);
  gradient.addColorStop(0, lightenColor(type.color, 18));
  gradient.addColorStop(0.52, type.color);
  gradient.addColorStop(1, darkenColor(type.color, 24));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);

  ctx.fillStyle = "rgba(255, 236, 204, 0.08)";
  fillRoundRect(ctx, 2, 2, TILE_SIZE - 4, 7, 4);
  ctx.fillStyle = "rgba(18, 10, 7, 0.22)";
  fillRoundRect(ctx, 3, TILE_SIZE - 10, TILE_SIZE - 6, 7, 4);

  ctx.strokeStyle = `${type.vein}aa`;
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i += 1) {
    const y = 7 + i * 9 + ((tier * 3 + i * 5) % 4);
    ctx.beginPath();
    ctx.moveTo(4, y);
    ctx.lineTo(TILE_SIZE * 0.3, y + 3 + (i % 2) * 2);
    ctx.lineTo(TILE_SIZE * 0.54, y - 1 + (tier % 3));
    ctx.lineTo(TILE_SIZE - 5, y + 4);
    ctx.stroke();
  }

  ctx.fillStyle = `${type.vein}55`;
  for (let i = 0; i < 11; i += 1) {
    const x = 4 + ((i * 11 + tier * 7) % (TILE_SIZE - 8));
    const y = 4 + ((i * 7 + tier * 13) % (TILE_SIZE - 8));
    ctx.fillRect(x, y, 2 + (i % 2), 2 + ((i + tier) % 2));
  }

  ctx.strokeStyle = "rgba(255, 232, 198, 0.08)";
  ctx.strokeRect(0.5, 0.5, TILE_SIZE - 1, TILE_SIZE - 1);
  return canvas;
}

function createTunnelSprite() {
  const canvas = makeSpriteCanvas();
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, 0, TILE_SIZE);
  gradient.addColorStop(0, "#24160f");
  gradient.addColorStop(1, "#120b08");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);

  ctx.fillStyle = "rgba(204, 145, 83, 0.12)";
  ctx.fillRect(5, 5, TILE_SIZE - 10, 4);
  ctx.fillRect(5, TILE_SIZE - 9, TILE_SIZE - 10, 4);

  ctx.strokeStyle = "rgba(255, 230, 194, 0.15)";
  ctx.lineWidth = 1;
  ctx.strokeRect(3.5, 3.5, TILE_SIZE - 7, TILE_SIZE - 7);

  ctx.fillStyle = "rgba(255, 226, 184, 0.16)";
  for (const [x, y] of [
    [8, 8],
    [TILE_SIZE - 8, 8],
    [8, TILE_SIZE - 8],
    [TILE_SIZE - 8, TILE_SIZE - 8],
  ]) {
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  return canvas;
}

function createPocketSprite(kind) {
  const canvas = makeSpriteCanvas();
  const ctx = canvas.getContext("2d");
  ctx.drawImage(createTunnelSprite(), 0, 0);

  if (kind === "gas") {
    ctx.fillStyle = "rgba(158, 240, 108, 0.22)";
    for (const [x, y, r] of [
      [TILE_SIZE * 0.38, TILE_SIZE * 0.44, 7],
      [TILE_SIZE * 0.6, TILE_SIZE * 0.54, 8],
      [TILE_SIZE * 0.46, TILE_SIZE * 0.7, 6],
    ]) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (kind === "steam") {
    ctx.fillStyle = "rgba(255, 207, 122, 0.22)";
    for (const [x, y, r] of [
      [TILE_SIZE * 0.36, TILE_SIZE * 0.48, 6],
      [TILE_SIZE * 0.58, TILE_SIZE * 0.38, 7],
      [TILE_SIZE * 0.5, TILE_SIZE * 0.68, 5],
    ]) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (kind === "boulder") {
    const gradient = ctx.createRadialGradient(TILE_SIZE * 0.42, TILE_SIZE * 0.38, 2, TILE_SIZE * 0.5, TILE_SIZE * 0.54, 10);
    gradient.addColorStop(0, "#b8a390");
    gradient.addColorStop(1, "#7f6a58");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(TILE_SIZE * 0.5, TILE_SIZE * 0.54, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(237, 214, 184, 0.55)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(TILE_SIZE * 0.44, TILE_SIZE * 0.48, 5, 0, Math.PI * 2);
    ctx.arc(TILE_SIZE * 0.58, TILE_SIZE * 0.46, 4, 0, Math.PI * 2);
    ctx.stroke();
  }

  return canvas;
}

function createHazardSprite(hazardType) {
  const canvas = makeSpriteCanvas();
  const ctx = canvas.getContext("2d");
  const hazard = HAZARD_DATA[hazardType];
  ctx.strokeStyle = hazard.color;
  ctx.lineWidth = 2.4;
  if (hazardType === HAZARD_TYPES.SPIKE) {
    ctx.beginPath();
    ctx.moveTo(TILE_SIZE * 0.25, TILE_SIZE * 0.78);
    ctx.lineTo(TILE_SIZE * 0.42, TILE_SIZE * 0.28);
    ctx.lineTo(TILE_SIZE * 0.52, TILE_SIZE * 0.62);
    ctx.lineTo(TILE_SIZE * 0.7, TILE_SIZE * 0.2);
    ctx.stroke();
  } else if (hazardType === HAZARD_TYPES.VOLATILE) {
    ctx.beginPath();
    ctx.arc(TILE_SIZE * 0.5, TILE_SIZE * 0.5, 7, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(TILE_SIZE * 0.5, TILE_SIZE * 0.24);
    ctx.lineTo(TILE_SIZE * 0.57, TILE_SIZE * 0.45);
    ctx.lineTo(TILE_SIZE * 0.47, TILE_SIZE * 0.45);
    ctx.lineTo(TILE_SIZE * 0.56, TILE_SIZE * 0.76);
    ctx.stroke();
  }
  return canvas;
}

function createCrackSprite(stage) {
  const canvas = makeSpriteCanvas();
  const ctx = canvas.getContext("2d");
  ctx.strokeStyle = `rgba(255, 242, 215, ${0.2 + stage * 0.12})`;
  ctx.lineWidth = 1.2 + stage * 0.35;
  const lines = [
    [6, 7, 18, 14, 29, 11],
    [10, 28, 18, 20, 28, 18],
    [15, 6, 17, 17, 14, 31],
  ];
  for (let i = 0; i < Math.min(stage, lines.length); i += 1) {
    const line = lines[i];
    ctx.beginPath();
    ctx.moveTo(line[0], line[1]);
    ctx.lineTo(line[2], line[3]);
    ctx.lineTo(line[4], line[5]);
    ctx.stroke();
  }
  return canvas;
}

function createSpriteAtlas() {
  const blocks = [null];
  for (let i = 1; i < BLOCK_TYPES.length; i += 1) {
    blocks[i] = createBlockSprite(BLOCK_TYPES[i], i);
  }

  return {
    blocks,
    tunnel: createTunnelSprite(),
    gasPocket: createPocketSprite("gas"),
    steamPocket: createPocketSprite("steam"),
    boulderPocket: createPocketSprite("boulder"),
    hazards: {
      [HAZARD_TYPES.SPIKE]: createHazardSprite(HAZARD_TYPES.SPIKE),
      [HAZARD_TYPES.VOLATILE]: createHazardSprite(HAZARD_TYPES.VOLATILE),
    },
    cracks: [null, createCrackSprite(1), createCrackSprite(2), createCrackSprite(3)],
  };
}

function spawnImpactEffect(x, y, dirX, dirY, hardness) {
  state.effects.push({
    kind: "impact",
    x,
    y,
    dirX,
    dirY,
    hardness,
    time: IMPACT_EFFECT_DURATION,
    duration: IMPACT_EFFECT_DURATION,
  });
}

function spawnBreakEffect(x, y, hardness, cause = "break") {
  state.effects.push({
    kind: "break",
    x,
    y,
    hardness,
    cause,
    time: BREAK_EFFECT_DURATION,
    duration: BREAK_EFFECT_DURATION,
    seed: (x * 92821 + y * 68917 + hardness * 131) % 1000,
  });
}

function spawnExplosionEffect(x, y, radius) {
  state.effects.push({
    kind: "explosion",
    x,
    y,
    radius,
    time: EXPLOSION_EFFECT_DURATION,
    duration: EXPLOSION_EFFECT_DURATION,
    seed: (x * 7219 + y * 3571 + Math.round(radius * 10)) % 1000,
  });
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

function newWorldSeed() {
  if (globalThis.crypto && typeof globalThis.crypto.getRandomValues === "function") {
    const buf = new Uint32Array(1);
    globalThis.crypto.getRandomValues(buf);
    return buf[0];
  }
  return ((Date.now() >>> 0) ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
}

function chooseWeightedPerk(weights, random = Math.random) {
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

function getScrapPerkCost(level) {
  return Math.round(SCRAP_PERK_BASE_COST * SCRAP_PERK_COST_MULTIPLIER ** level);
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

function chooseTilePerkForPosition(x, y, random = Math.random) {
  const centerBias = 1 - clamp(getCenterDistanceRatio(x, y), 0, 1);
  const weights = TILE_PERK_WEIGHTS.slice();
  weights[1] += Math.round(centerBias * 6);
  weights[2] += Math.round(centerBias * 4);
  return chooseWeightedPerk(weights, random);
}

function isFarEnoughFromPlaced(x, y, placed, minDistance) {
  for (let i = 0; i < placed.length; i += 1) {
    const dx = x - placed[i].x;
    const dy = y - placed[i].y;
    if (Math.hypot(dx, dy) < minDistance) {
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
      const influence = 1 - dist / radius;
      field[cellIndex(x, y)] += strength * influence;
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

function chooseHazardType(random, x, y) {
  const centerRatio = clamp(Math.hypot(x - START_X, y - START_Y) / BASE_MIN_DISTANCE, 0, 1.4);
  const roll = random() + centerRatio * 0.2;
  if (roll > 0.8) {
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

function placeHazardBlob(random, blockCount) {
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

    state.hazardMask[cellIndex(cell.x, cell.y)] = hazardType;
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

function placeHazardVein(random, blockCount) {
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
      state.hazardMask[cellIndex(ix, iy)] = hazardType;
      placed += 1;
    }
    angle += (random() - 0.5) * 0.85;
    x = clamp(x + Math.cos(angle) * 1.05, 1, GRID_W - 2);
    y = clamp(y + Math.sin(angle) * 1.05, 1, GRID_H - 2);
  }
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

function placeGasPocket(random, cellCount) {
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
    state.gasPocketMask[index] = 1;
    state.hazardMask[index] = 0;
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

function revealGasPocket(x, y) {
  const startIndex = cellIndex(x, y);
  if (!state.gasPocketMask[startIndex]) {
    return;
  }

  const frontier = [{ x, y }];
  const released = [];
  state.gasPocketMask[startIndex] = 0;

  while (frontier.length > 0) {
    const cell = frontier.pop();
    released.push(cell);

    const neighbors = [
      { x: cell.x + 1, y: cell.y },
      { x: cell.x - 1, y: cell.y },
      { x: cell.x, y: cell.y + 1 },
      { x: cell.x, y: cell.y - 1 },
    ];
    for (let i = 0; i < neighbors.length; i += 1) {
      const nx = neighbors[i].x;
      const ny = neighbors[i].y;
      if (!canPlaceGasPocketAt(nx, ny)) {
        continue;
      }
      const index = cellIndex(nx, ny);
      if (!state.gasPocketMask[index]) {
        continue;
      }
      state.gasPocketMask[index] = 0;
      frontier.push({ x: nx, y: ny });
    }
  }

  for (let i = 0; i < released.length; i += 1) {
    const cell = released[i];
    const index = cellIndex(cell.x, cell.y);
    state.tunnelMask[index] = 1;
    state.hardness[index] = 0;
    state.health[index] = 0;
    state.hazardMask[index] = 0;
    state.gasMask[index] = 1;
  }

  state.gasClouds.push({
    frontier: released.slice(),
    cells: released.slice(),
    visited: new Set(released.map((cell) => `${cell.x},${cell.y}`)),
    timer: GAS_SPREAD_INTERVAL,
    spreadsDone: 0,
  });
  applyGasContactDamage();
}

function placeSteamPocket(random, cellCount) {
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
    state.steamPocketMask[index] = 1;
    state.hazardMask[index] = 0;
    state.gasPocketMask[index] = 0;
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

function placeBoulderPocket(random) {
  const origin = getHazardOrigin(random);
  if (!canPlaceBoulderPocketAt(origin.x, origin.y)) {
    return;
  }
  if (Math.hypot(origin.x - START_X, origin.y - START_Y) < BOULDER_MIN_START_DISTANCE) {
    return;
  }

  const index = cellIndex(origin.x, origin.y);
  state.boulderPocketMask[index] = 1;
  state.hazardMask[index] = 0;
  state.gasPocketMask[index] = 0;
  state.steamPocketMask[index] = 0;
}

function addSteamCells(cells, delta) {
  for (let i = 0; i < cells.length; i += 1) {
    const index = cellIndex(cells[i].x, cells[i].y);
    state.steamMask[index] = Math.max(0, state.steamMask[index] + delta);
  }
}

function traceSteamLine(origins, dirX, dirY) {
  const cells = [];
  const seen = new Set();
  for (let i = 0; i < origins.length; i += 1) {
    let x = origins[i].x + dirX;
    let y = origins[i].y + dirY;
    for (let step = 0; step < STEAM_RANGE; step += 1) {
      if (x < 1 || y < 1 || x >= GRID_W - 1 || y >= GRID_H - 1) {
        break;
      }
      const index = cellIndex(x, y);
      if (!state.tunnelMask[index]) {
        break;
      }
      const key = `${x},${y}`;
      if (!seen.has(key)) {
        seen.add(key);
        cells.push({ x, y });
      }
      x += dirX;
      y += dirY;
    }
  }
  return cells;
}

function applySteamContactDamage() {
  if (state.steamMask[cellIndex(state.drill.x, state.drill.y)]) {
    applyHazardDamage(STEAM_DAMAGE);
  }
}

function refreshSteamJet(jet) {
  addSteamCells(jet.cells, -1);
  jet.cells = traceSteamLine(jet.origins, jet.dirX, jet.dirY);
  addSteamCells(jet.cells, 1);
  applySteamContactDamage();
}

function revealSteamPocket(x, y, dirX, dirY) {
  const startIndex = cellIndex(x, y);
  if (!state.steamPocketMask[startIndex]) {
    return;
  }

  const frontier = [{ x, y }];
  const released = [];
  state.steamPocketMask[startIndex] = 0;

  while (frontier.length > 0) {
    const cell = frontier.pop();
    released.push(cell);

    const neighbors = [
      { x: cell.x + 1, y: cell.y },
      { x: cell.x - 1, y: cell.y },
      { x: cell.x, y: cell.y + 1 },
      { x: cell.x, y: cell.y - 1 },
    ];
    for (let i = 0; i < neighbors.length; i += 1) {
      const nx = neighbors[i].x;
      const ny = neighbors[i].y;
      if (!canPlaceSteamPocketAt(nx, ny)) {
        continue;
      }
      const index = cellIndex(nx, ny);
      if (!state.steamPocketMask[index]) {
        continue;
      }
      state.steamPocketMask[index] = 0;
      frontier.push({ x: nx, y: ny });
    }
  }

  for (let i = 0; i < released.length; i += 1) {
    const cell = released[i];
    const index = cellIndex(cell.x, cell.y);
    state.tunnelMask[index] = 1;
    state.hardness[index] = 0;
    state.health[index] = 0;
    state.hazardMask[index] = 0;
    state.gasPocketMask[index] = 0;
  }

  const jet = {
    origins: released,
    dirX,
    dirY,
    timer: STEAM_PULSE_INTERVAL,
    pulsesRemaining: STEAM_PULSE_COUNT,
    cells: [],
  };
  state.steamJets.push(jet);
  refreshSteamJet(jet);
}

function generateHardnessMap(random) {
  const danger = new Float32Array(GRID_W * GRID_H);

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
    addDangerVein(
      danger,
      2 + random() * (GRID_W - 4),
      2 + random() * (GRID_H - 4),
      14 + Math.floor(random() * 24),
      1.3 + random() * 1.6,
      -0.95 - random() * 0.35,
      random,
    );
  }

  for (let i = 0; i < hardVeins; i += 1) {
    addDangerVein(
      danger,
      2 + random() * (GRID_W - 4),
      2 + random() * (GRID_H - 4),
      16 + Math.floor(random() * 28),
      1.1 + random() * 1.2,
      0.85 + random() * 0.55,
      random,
    );
  }

  for (let i = 0; i < ultraVeins; i += 1) {
    addDangerVein(
      danger,
      2 + random() * (GRID_W - 4),
      2 + random() * (GRID_H - 4),
      10 + Math.floor(random() * 16),
      0.9 + random() * 0.8,
      1.35 + random() * 0.75,
      random,
    );
  }

  for (let y = 0; y < GRID_H; y += 1) {
    for (let x = 0; x < GRID_W; x += 1) {
      const index = cellIndex(x, y);
      const microNoise = (((x * 17 + y * 31) % 13) - 6) * 0.08;
      state.hardness[index] = clamp(Math.round(danger[index] + microNoise), 1, 7);
      state.health[index] = BLOCK_TYPES[state.hardness[index]].hp;
      state.tunnelMask[index] = 0;
      state.hazardMask[index] = 0;
      state.hazardTriggeredMask[index] = 0;
      state.gasPocketMask[index] = 0;
      state.steamPocketMask[index] = 0;
      state.boulderPocketMask[index] = 0;
      state.steamMask[index] = 0;
    }
  }

  const hazardBlobGroups = Math.max(12, Math.round(area / 3000));
  const hazardVeinGroups = Math.max(12, Math.round(area / 3000));
  for (let i = 0; i < hazardBlobGroups; i += 1) {
    placeHazardBlob(random, 4 + Math.floor(random() * 17));
  }
  for (let i = 0; i < hazardVeinGroups; i += 1) {
    placeHazardVein(random, 4 + Math.floor(random() * 37));
  }
  for (let i = 0; i < GAS_POCKET_GROUPS; i += 1) {
    placeGasPocket(random, 4 + Math.floor(random() * 17));
  }
  for (let i = 0; i < STEAM_POCKET_GROUPS; i += 1) {
    placeSteamPocket(random, 3 + Math.floor(random() * 7));
  }
  for (let i = 0; i < BOULDER_POCKET_GROUPS; i += 1) {
    placeBoulderPocket(random);
  }
}

function setupField() {
  state.pathIndexByCell.fill(-1);
  state.perkMask.fill(0);
  state.perkZoneMask.fill(-1);
  state.gasMask.fill(0);
  state.steamMask.fill(0);
  state.hazardTriggeredMask.fill(0);
  state.gasPocketMask.fill(0);
  state.steamPocketMask.fill(0);
  state.boulderPocketMask.fill(0);
  state.perkZones.length = 0;
  state.gasClouds.length = 0;
  state.steamJets.length = 0;
  state.boulders.length = 0;
  state.baseFound = false;
  state.base.visible = false;
  state.cameraShake.time = 0;
  state.cameraShake.amplitude = 0;
  state.outOfFuel = false;
  state.dead = false;
  state.fuel = START_FUEL;
  state.maxFuel = START_FUEL;
  state.hp = START_HP;
  state.maxHp = START_HP;
  state.scrap = 0;
  state.depth = 0;
  state.signalText = "Старт";
  state.perkText = "Нет";
  state.isChoosingPerk = false;
  state.pendingPerkChoice = false;
  state.pendingPerkDelay = 0;
  state.nextScrapPerkAt = SCRAP_PERK_BASE_COST;
  state.scrapPerkLevel = 0;
  state.perkChoices = [];
  state.signalMovesLeft = 0;
  state.signalMovesMax = 0;
  state.signalPrevX = START_X;
  state.signalPrevY = START_Y;
  state.moveFuelCost = MOVE_FUEL_COST;
  state.strikeFuelCost = STRIKE_FUEL_COST;
  state.strikeSpeed = 1;
  state.drillPower = 1;
  state.scrapBonus = 0;
  state.fuelOnBreak = 0;
  state.fuelPickupBonus = 0;
  state.perkFuelBonus = 0;
  state.overflowBomb = false;
  state.fuelEventDepth = 0;
  state.overflowTriggeredInEvent = false;
  state.resolvingOverflowBomb = false;
  state.radarBonus = 0;
  state.blocksBroken = 0;
  state.drillBrokenBlocks = 0;
  state.sideDrills = 0;
  state.jumpDrive = false;
  state.jumpCharges = 0;
  state.jumpRange = 0;
  state.movedTiles = 0;
  state.longDrillPower = 0;
  state.diagonalDrillPower = 0;
  state.lowFuelSpeedBonus = 0;
  state.remoteBombLevel = 0;
  state.playerMoveProgress = 0;
  state.perkToast.text = "";
  state.perkToast.time = 0;
  state.fuelToast.value = 0;
  state.fuelToast.time = 0;
  state.hpToast.value = 0;
  state.hpToast.time = 0;
  state.scrapToast.value = 0;
  state.scrapToast.time = 0;
  state.damageFlash = 0;
  state.effects.length = 0;
  state.drill.strikePhase = 0;
  state.drill.strikeEnergy = 0;
  state.drill.strikeLatch = false;
  state.worldSeed = newWorldSeed();
  state.worldRandom = mulberry32(state.worldSeed);

  generateHardnessMap(state.worldRandom);

  state.pathTiles.length = 0;
  carveTunnel(state.drill.x, state.drill.y);
  extendPath(state.drill.x, state.drill.y);

  placeHiddenBase();
  placePerkTiles();
  placePerkZones();
}

function placeHiddenBase() {
  const offsets = getExactDistanceOffsets(BASE_MIN_DISTANCE);
  for (let i = offsets.length - 1; i > 0; i -= 1) {
    const j = Math.floor(state.worldRandom() * (i + 1));
    const tmp = offsets[i];
    offsets[i] = offsets[j];
    offsets[j] = tmp;
  }

  for (let i = 0; i < offsets.length; i += 1) {
    const x = START_X + offsets[i].x;
    const y = START_Y + offsets[i].y;
    if (
      x >= 3 &&
      x <= GRID_W - 4 &&
      y >= 3 &&
      y <= GRID_H - 4 &&
      !state.gasPocketMask[cellIndex(x, y)] &&
      !state.steamPocketMask[cellIndex(x, y)] &&
      !state.boulderPocketMask[cellIndex(x, y)]
    ) {
      state.base.x = x;
      state.base.y = y;
      return;
    }
  }

  throw new Error("Unable to place base at exact required distance");
}

function placePerkTiles() {
  const placed = [];
  const targetCount = getTargetPerkTileCount();
  let attempts = 0;

  while (placed.length < targetCount && attempts < targetCount * 80) {
    const x = 2 + Math.floor(state.worldRandom() * (GRID_W - 4));
    const y = 2 + Math.floor(state.worldRandom() * (GRID_H - 4));
    const index = cellIndex(x, y);
    attempts += 1;

    if (state.tunnelMask[index] || state.perkMask[index] > 0) {
      continue;
    }
    if (state.gasPocketMask[index] || state.steamPocketMask[index] || state.boulderPocketMask[index]) {
      continue;
    }
    if ((x === state.base.x && y === state.base.y) || (x === START_X && y === START_Y)) {
      continue;
    }
    if (!isFarEnoughFromPlaced(x, y, placed, PERK_MIN_DISTANCE)) {
      continue;
    }
    if (state.worldRandom() > getCenterPerkDensity(x, y)) {
      continue;
    }

    state.perkMask[index] = chooseTilePerkForPosition(x, y, state.worldRandom);
    placed.push({ x, y });
  }
}

function placePerkZones() {
  const placed = [];
  const targetCount = getTargetPerkZoneCount();
  let attempts = 0;

  while (state.perkZones.length < targetCount && attempts < targetCount * 120) {
    const centerX = 2 + Math.floor(state.worldRandom() * (GRID_W - 4));
    const centerY = 2 + Math.floor(state.worldRandom() * (GRID_H - 4));
    attempts += 1;

    if ((centerX === START_X && centerY === START_Y) || (centerX === state.base.x && centerY === state.base.y)) {
      continue;
    }

    if (!isFarEnoughFromPlaced(centerX, centerY, placed, PERK_ZONE_MIN_DISTANCE)) {
      continue;
    }

    let blocked = false;
    for (let oy = -1; oy <= 1 && !blocked; oy += 1) {
      for (let ox = -1; ox <= 1; ox += 1) {
        const x = centerX + ox;
        const y = centerY + oy;
        const index = cellIndex(x, y);
        if (
          state.tunnelMask[index] ||
          state.perkZoneMask[index] !== -1 ||
          state.gasPocketMask[index] ||
          state.steamPocketMask[index] ||
          state.boulderPocketMask[index]
        ) {
          blocked = true;
          break;
        }
      }
    }
    if (blocked) {
      continue;
    }

    const zoneId = state.perkZones.length;
    const perkType = chooseTilePerkForPosition(centerX, centerY, state.worldRandom);
    state.perkZones.push({
      x: centerX,
      y: centerY,
      perkType,
      openedCount: 0,
      openedMask: 0,
      collected: false,
    });
    placed.push({ x: centerX, y: centerY });

    for (let oy = -1; oy <= 1; oy += 1) {
      for (let ox = -1; ox <= 1; ox += 1) {
        state.perkZoneMask[cellIndex(centerX + ox, centerY + oy)] = zoneId;
      }
    }
  }
}

function getDistanceToBase(x, y) {
  return Math.hypot(state.base.x - x, state.base.y - y);
}

function carveTunnel(x, y) {
  const index = cellIndex(x, y);
  const perkType = state.perkMask[index];
  const zoneId = state.perkZoneMask[index];
  if (!state.tunnelMask[index]) {
    state.tunnelMask[index] = 1;
    state.hardness[index] = 0;
    state.health[index] = 0;
  }

  if (perkType > 0) {
    collectPerkTile(x, y, index, perkType);
  }

  if (zoneId !== -1) {
    revealPerkZoneCell(zoneId, x, y);
  }
}

function collectPerkTile(x, y, index, perkType) {
  state.perkMask[index] = 0;
  runFuelEvent(() => applyTilePerk(perkType, x, y));
  state.outOfFuel = false;
}

function revealPerkZoneCell(zoneId, x, y) {
  const zone = state.perkZones[zoneId];
  if (!zone || zone.collected) {
    return;
  }

  const localX = x - (zone.x - 1);
  const localY = y - (zone.y - 1);
  const bit = 1 << (localY * 3 + localX);
  if (zone.openedMask & bit) {
    return;
  }

  zone.openedMask |= bit;
  zone.openedCount += 1;
  if (zone.openedCount === 9) {
    collectPerkZone(zone);
  }
}

function collectPerkZone(zone) {
  zone.collected = true;
  state.perkText = `${TILE_PERK_TYPES[zone.perkType].name} x3`;
  showPerkToast(state.perkText);

  if (zone.perkType === 4) {
    explodeAt(zone.x, zone.y, state.drillPower * 10, 3);
    return;
  }

  runFuelEvent(() => {
    for (let i = 0; i < 3; i += 1) {
      applyTilePerk(zone.perkType, zone.x, zone.y, false);
    }
  });
}

function applyTilePerk(perkType, x, y, showToast = true) {
  switch (perkType) {
    case 1:
      addFuel(Math.max(0, 90 - state.perkFuelBonus), x, y);
      state.perkText = "Бак";
      break;
    case 2:
      state.signalMovesLeft += RADAR_BASE_CHARGES + state.radarBonus;
      state.signalMovesMax = Math.max(state.signalMovesMax, state.signalMovesLeft);
      state.perkText = `Радар: ${consumeSignalMove(state.signalPrevX, state.signalPrevY, x, y)}`;
      break;
    case 3:
      state.drillPower += 0.5;
      state.perkText = "Бур";
      break;
    case 4:
      explodeAt(x, y, state.drillPower * 10);
      state.perkText = "Бомба";
      break;
    case 5:
      state.strikeSpeed += 0.15;
      state.perkText = "Скорость";
      break;
    case 6:
      state.hp = Math.min(state.maxHp, state.hp + 1);
      state.perkText = "HP+";
      break;
    default:
      break;
  }
  if (state.perkFuelBonus > 0 && perkType !== 1) {
    addFuel(state.perkFuelBonus, x, y);
  }
  if (showToast) {
    showPerkToast(state.perkText);
  }
}

function applyScrapPerk(perkType) {
  switch (perkType) {
    case 1:
      state.sideDrills += 1;
      state.perkText = "Боковые буры";
      break;
    case 2:
      state.jumpDrive = true;
      state.jumpRange = Math.max(2, state.jumpRange + 1);
      state.perkText = "Прыжковый привод";
      break;
    case 3:
      state.longDrillPower += 0.1;
      state.perkText = "Длинный бур";
      break;
    case 4:
      state.diagonalDrillPower += 0.05;
      state.perkText = "Диагональные буры";
      break;
    case 5:
      state.lowFuelSpeedBonus += 0.35;
      state.perkText = "Форсаж на нуле";
      break;
    case 6:
      state.remoteBombLevel += 1;
      state.perkText = "Саперный заряд";
      break;
    case 7:
      state.perkFuelBonus += 50;
      state.perkText = "Топливный контур";
      break;
    case 8:
      state.visionRadius = Math.min(9, state.visionRadius + 2);
      state.radarBonus += 2;
      state.perkText = "Гео-линза";
      break;
    case 9:
      state.scrapBonus += 2;
      state.fuelOnBreak += 2;
      state.perkText = "Рециркулятор";
      break;
    case 10:
      state.overflowBomb = true;
      state.fuelPickupBonus += 50;
      state.maxFuel = Math.max(100, state.maxFuel - 50);
      state.fuel = Math.min(state.fuel, state.maxFuel);
      state.perkText = "Перегрузка";
      break;
    case 11:
      state.maxHp += 1;
      state.hp = state.maxHp;
      state.perkText = "Усиленный корпус";
      break;
    default:
      break;
  }
  if (state.perkFuelBonus > 0) {
    addFuel(state.perkFuelBonus, state.drill.x, state.drill.y);
  }
  showPerkToast(state.perkText);
}

function showPerkToast(text) {
  state.perkToast.text = text;
  state.perkToast.time = 1.2;
}

function showFuelToast(value) {
  state.fuelToast.value = value;
  state.fuelToast.time = 0.9;
}

function showScrapToast(value) {
  state.scrapToast.value = value;
  state.scrapToast.time = 0.9;
}

function runFuelEvent(callback) {
  state.fuelEventDepth += 1;
  if (state.fuelEventDepth === 1) {
    state.overflowTriggeredInEvent = false;
  }

  try {
    return callback();
  } finally {
    state.fuelEventDepth -= 1;
    if (state.fuelEventDepth === 0) {
      state.overflowTriggeredInEvent = false;
    }
  }
}

function rebuildPathIndex() {
  state.pathIndexByCell.fill(-1);
  for (let i = 0; i < state.pathTiles.length; i += 1) {
    const tile = state.pathTiles[i];
    state.pathIndexByCell[cellIndex(tile.x, tile.y)] = i;
  }
}

function init() {
  state.ctx = state.canvas.getContext("2d");
  state.sprites = createSpriteAtlas();
  resize();
  setupField();
  bindUi();
  requestAnimationFrame(frame);
}

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  state.dpr = dpr;
  state.width = window.innerWidth;
  state.height = window.innerHeight;
  state.canvas.width = Math.floor(state.width * dpr);
  state.canvas.height = Math.floor(state.height * dpr);
  state.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function bindUi() {
  const zone = document.querySelector(".touch-zones");
  const pad = document.getElementById("movePad");
  const stick = document.getElementById("moveStick");
  const perkButtons = document.querySelectorAll("[data-perk-slot]");

  window.addEventListener("resize", resize);

  zone.addEventListener("pointerdown", (event) => {
    if (state.dragId !== null) {
      return;
    }
    state.dragId = event.pointerId;
    showPadAt(event.clientX, event.clientY, pad, stick);
    updatePad(event, stick);
    zone.setPointerCapture(event.pointerId);
  });

  zone.addEventListener("pointermove", (event) => {
    if (state.dragId !== event.pointerId) {
      return;
    }
    updatePad(event, stick);
  });

  const resetPad = () => {
    state.dragId = null;
    state.moveAimX = 0;
    state.moveAimY = 0;
    pad.classList.remove("move-pad--active");
    stick.style.transform = "translate(0px, 0px)";
  };

  zone.addEventListener("pointerup", resetPad);
  zone.addEventListener("pointercancel", resetPad);

  for (let i = 0; i < perkButtons.length; i += 1) {
    perkButtons[i].addEventListener("click", () => {
      chooseScrapPerk(i);
    });
  }
}

function showPadAt(x, y, pad, stick) {
  state.padCenterX = x;
  state.padCenterY = y;
  pad.style.left = `${x}px`;
  pad.style.top = `${y}px`;
  pad.classList.add("move-pad--active");
  stick.style.transform = "translate(0px, 0px)";
}

function updatePad(event, stick) {
  const dx = event.clientX - state.padCenterX;
  const dy = event.clientY - state.padCenterY;
  const length = Math.hypot(dx, dy) || 1;
  const maxRadius = 118 * 0.32;
  const limited = Math.min(maxRadius, length);
  const nx = dx / length;
  const ny = dy / length;
  state.moveAimX = nx * (limited / maxRadius);
  state.moveAimY = ny * (limited / maxRadius);
  stick.style.transform = `translate(${nx * limited}px, ${ny * limited}px)`;
}

function frame(ts) {
  if (!state.lastTs) {
    state.lastTs = ts;
  }

  let delta = ts - state.lastTs;
  state.lastTs = ts;
  delta = Math.min(delta, MAX_FRAME_MS);
  state.timeAcc += delta;

  while (state.timeAcc >= STEP_MS) {
    update(STEP_MS / 1000);
    state.timeAcc -= STEP_MS;
  }

  render();
  requestAnimationFrame(frame);
}

function update(dt) {
  if (state.isChoosingPerk || state.dead) {
    return;
  }

  state.fuel = Math.max(0, state.fuel - IDLE_FUEL_DRAIN * dt);
  state.fuel = Math.min(state.maxFuel, state.fuel);
  consumeFuelEmergency();
  updateDrill(dt);
  updateGas(dt);
  updateSteam(dt);
  updateBoulders(dt);
  updateEffects(dt);
  updateDiscovery();
  updateCameraShake(dt);
  state.perkToast.time = Math.max(0, state.perkToast.time - dt);
  state.fuelToast.time = Math.max(0, state.fuelToast.time - dt);
  state.hpToast.time = Math.max(0, state.hpToast.time - dt);
  state.scrapToast.time = Math.max(0, state.scrapToast.time - dt);
  state.damageFlash = Math.max(0, state.damageFlash - dt * 2.4);
  if (state.pendingPerkChoice) {
    state.pendingPerkDelay = Math.max(0, state.pendingPerkDelay - dt);
    if (state.pendingPerkDelay === 0) {
      state.pendingPerkChoice = false;
      state.isChoosingPerk = true;
      syncPerkChoiceOverlay();
      return;
    }
  }
  checkScrapPerkUnlock();
}

function updateEffects(dt) {
  for (let i = state.effects.length - 1; i >= 0; i -= 1) {
    const effect = state.effects[i];
    effect.time -= dt;
    if (effect.time <= 0) {
      state.effects.splice(i, 1);
    }
  }
}

function checkScrapPerkUnlock() {
  if (state.isChoosingPerk || state.pendingPerkChoice || state.scrap < state.nextScrapPerkAt) {
    return;
  }

  const bag = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  for (let i = bag.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = bag[i];
    bag[i] = bag[j];
    bag[j] = tmp;
  }

  state.perkChoices = bag.slice(0, 3);
  state.pendingPerkChoice = true;
  state.pendingPerkDelay = SCRAP_PERK_POPUP_DELAY;
  state.scrapPerkLevel += 1;
  state.nextScrapPerkAt += getScrapPerkCost(state.scrapPerkLevel);
}

function chooseScrapPerk(slotIndex) {
  if (!state.isChoosingPerk) {
    return;
  }

  const perkType = state.perkChoices[slotIndex];
  if (!perkType) {
    return;
  }

  runFuelEvent(() => applyScrapPerk(perkType));
  state.isChoosingPerk = false;
  state.perkChoices = [];
  syncPerkChoiceOverlay();
}

function syncPerkChoiceOverlay() {
  const overlay = document.getElementById("perkChoice");
  const buttons = document.querySelectorAll("[data-perk-slot]");
  const touchZones = document.querySelector(".touch-zones");
  if (!overlay) {
    return;
  }

  overlay.hidden = !state.isChoosingPerk;
  if (touchZones) {
    touchZones.style.pointerEvents = state.isChoosingPerk ? "none" : "auto";
  }
  for (let i = 0; i < buttons.length; i += 1) {
    const button = buttons[i];
    const perkType = state.perkChoices[i];
    if (!perkType) {
      button.innerHTML = "";
      continue;
    }
    const perk = SCRAP_PERK_TYPES[perkType];
    button.innerHTML = `<span class="perk-option__name">${perk.name}</span><span class="perk-option__desc">${perk.desc}</span>`;
  }
}

function getStrikeDamage() {
  return (state.drill.rate / STRIKE_CYCLE_SPEED) * state.drillPower;
}

function addFuel(amount, originX = state.drill.x, originY = state.drill.y) {
  if (amount <= 0) {
    return;
  }

  const totalGain = amount + state.fuelPickupBonus;
  showFuelToast(totalGain);
  const overflow = state.fuel + totalGain - state.maxFuel;
  state.fuel = Math.min(state.maxFuel, state.fuel + totalGain);

  if (state.overflowBomb && overflow > 0 && !state.overflowTriggeredInEvent && !state.resolvingOverflowBomb) {
    state.overflowTriggeredInEvent = true;
    triggerOverflowBomb(originX, originY);
  }
}

function applyHazardDamage(amount) {
  if (amount <= 0 || state.dead) {
    return;
  }

  state.hp = Math.max(0, state.hp - amount);
  state.cameraShake.amplitude = Math.max(state.cameraShake.amplitude, 1.3);
  state.damageFlash = Math.min(1, state.damageFlash + 0.8);
  showHpToast(amount);
  if (state.hp <= 0) {
    state.dead = true;
  }
}

function showHpToast(value) {
  if (value <= 0) {
    return;
  }
  state.hpToast.value = value;
  state.hpToast.time = 0.9;
}

function consumeFuelEmergency() {
  if (state.dead) {
    return;
  }
  if (state.fuel > 0) {
    state.outOfFuel = false;
    return;
  }

  state.fuel = 0;
  state.outOfFuel = false;
  applyHazardDamage(FUEL_DEPLETION_HP_COST);
  if (!state.dead) {
    state.fuel = Math.min(state.maxFuel, state.fuel + FUEL_DEPLETION_RECOVERY);
  }
}

function applyGasContactDamage() {
  if (state.gasMask[cellIndex(state.drill.x, state.drill.y)]) {
    applyHazardDamage(GAS_DAMAGE);
  }
}

function dissipateGasCloud(cloud) {
  for (let i = 0; i < cloud.cells.length; i += 1) {
    state.gasMask[cellIndex(cloud.cells[i].x, cloud.cells[i].y)] = 0;
  }
}

function updateGas(dt) {
  for (let i = state.gasClouds.length - 1; i >= 0; i -= 1) {
    const cloud = state.gasClouds[i];
    cloud.timer -= dt;
    if (cloud.timer > 0) {
      continue;
    }

    cloud.timer += GAS_SPREAD_INTERVAL;
    cloud.spreadsDone += 1;
    if (cloud.spreadsDone > GAS_SPREAD_STEPS) {
      dissipateGasCloud(cloud);
      state.gasClouds.splice(i, 1);
      continue;
    }

    const nextFrontier = [];
    for (let j = 0; j < cloud.frontier.length; j += 1) {
      const cell = cloud.frontier[j];
      const neighbors = [
        { x: cell.x + 1, y: cell.y },
        { x: cell.x - 1, y: cell.y },
        { x: cell.x, y: cell.y + 1 },
        { x: cell.x, y: cell.y - 1 },
      ];
      for (let n = 0; n < neighbors.length; n += 1) {
        const nx = neighbors[n].x;
        const ny = neighbors[n].y;
        const key = `${nx},${ny}`;
        if (cloud.visited.has(key) || nx < 1 || ny < 1 || nx >= GRID_W - 1 || ny >= GRID_H - 1) {
          continue;
        }
        if (!state.tunnelMask[cellIndex(nx, ny)]) {
          continue;
        }
        cloud.visited.add(key);
        cloud.cells.push({ x: nx, y: ny });
        nextFrontier.push({ x: nx, y: ny });
        state.gasMask[cellIndex(nx, ny)] = 1;
      }
    }
    cloud.frontier = nextFrontier;
    applyGasContactDamage();
  }
}

function updateSteam(dt) {
  for (let i = state.steamJets.length - 1; i >= 0; i -= 1) {
    const jet = state.steamJets[i];
    jet.timer -= dt;
    if (jet.timer > 0) {
      continue;
    }

    jet.timer += STEAM_PULSE_INTERVAL;
    jet.pulsesRemaining -= 1;
    if (jet.pulsesRemaining <= 0) {
      addSteamCells(jet.cells, -1);
      state.steamJets.splice(i, 1);
      continue;
    }
    refreshSteamJet(jet);
  }
}

function startBoulderRoll(x, y, dirX, dirY) {
  const index = cellIndex(x, y);
  if (!state.boulderPocketMask[index]) {
    return;
  }

  state.boulderPocketMask[index] = 0;
  state.tunnelMask[index] = 1;
  state.hardness[index] = 0;
  state.health[index] = 0;
  state.boulders.push({
    x,
    y,
    dirX,
    dirY,
    delay: BOULDER_DELAY,
    moveTimer: BOULDER_MOVE_INTERVAL,
    brokenBlocks: 0,
  });
}

function updateBoulders(dt) {
  for (let i = state.boulders.length - 1; i >= 0; i -= 1) {
    const boulder = state.boulders[i];
    if (boulder.delay > 0) {
      boulder.delay -= dt;
      continue;
    }

    boulder.moveTimer -= dt;
    if (boulder.moveTimer > 0) {
      continue;
    }
    boulder.moveTimer += BOULDER_MOVE_INTERVAL;

    const nextX = boulder.x + boulder.dirX;
    const nextY = boulder.y + boulder.dirY;
    if (nextX < 1 || nextY < 1 || nextX >= GRID_W - 1 || nextY >= GRID_H - 1) {
      state.boulders.splice(i, 1);
      continue;
    }

    const nextIndex = cellIndex(nextX, nextY);
    if (!state.tunnelMask[nextIndex]) {
      damageCell(nextX, nextY, EXPLOSION_BREAK_DAMAGE, { ignoreHazardEffect: true, allowHazardChain: true });
      boulder.brokenBlocks += 1;
      if (boulder.brokenBlocks >= BOULDER_BREAK_LIMIT) {
        boulder.x = nextX;
        boulder.y = nextY;
        state.boulders.splice(i, 1);
        continue;
      }
    }

    boulder.x = nextX;
    boulder.y = nextY;
    state.tunnelMask[nextIndex] = 1;
    state.hardness[nextIndex] = 0;
    state.health[nextIndex] = 0;
    if (boulder.x === state.drill.x && boulder.y === state.drill.y) {
      applyHazardDamage(BOULDER_DAMAGE);
    }
  }
}

function triggerHazardEffect(hazardType, x, y, options = {}) {
  if (!hazardType) {
    return;
  }

  const hazard = HAZARD_DATA[hazardType];
  if (hazard && hazard.damage && !options.suppressPlayerDamage) {
    applyHazardDamage(hazard.damage);
  }

  if (hazardType === HAZARD_TYPES.VOLATILE) {
    explodeAt(x, y, Math.max(1, state.drillPower * 3), 1.25);
  }
}

function damageCell(x, y, damage, options = {}) {
  if (x < 1 || y < 1 || x >= GRID_W - 1 || y >= GRID_H - 1 || damage <= 0) {
    return false;
  }

  const index = cellIndex(x, y);
  if (state.tunnelMask[index]) {
    return false;
  }
  const hazardType = state.hazardMask[index];
  const allowHazardChain = options.allowHazardChain && hazardType === HAZARD_TYPES.VOLATILE;
  if ((!options.ignoreHazardEffect || allowHazardChain) && hazardType && !state.hazardTriggeredMask[index]) {
    state.hazardTriggeredMask[index] = 1;
    triggerHazardEffect(hazardType, x, y, { suppressPlayerDamage: !!options.allowHazardChain });
  }

  if (options.byDrill) {
    spawnImpactEffect(x, y, options.dirX || state.drill.facingX || 0, options.dirY || state.drill.facingY || 1, state.hardness[index]);
  }

  state.health[index] -= damage;
  if (state.health[index] > 0) {
    return false;
  }

  breakCell(x, y, index, options);
  return true;
}

function breakCell(x, y, index, options = {}) {
  const hardness = state.hardness[index];
  const hazardType = state.hazardMask[index];
  const scrapGain = BLOCK_TYPES[hardness].scrap + state.scrapBonus;
  spawnBreakEffect(x, y, hardness, options.cause || "break");
  state.scrap += scrapGain;
  runFuelEvent(() => addFuel(state.fuelOnBreak, x, y));
  state.blocksBroken += 1;
  if (options.byDrill) {
    state.drillBrokenBlocks += 1;
  }
  showScrapToast(scrapGain);
  state.hazardMask[index] = 0;
  state.hazardTriggeredMask[index] = 0;
  if (state.remoteBombLevel > 0 && options.byDrill && state.drillBrokenBlocks % 15 === 0) {
    triggerRemoteBombSquare(x, y, 3);
  }

  carveTunnel(x, y);
  const gasNeighbors = [
    { x: x + 1, y },
    { x: x - 1, y },
    { x, y: y + 1 },
    { x, y: y - 1 },
  ];
  for (let i = 0; i < gasNeighbors.length; i += 1) {
    const nx = gasNeighbors[i].x;
    const ny = gasNeighbors[i].y;
    if (nx < 1 || ny < 1 || nx >= GRID_W - 1 || ny >= GRID_H - 1) {
      continue;
    }
    if (state.gasPocketMask[cellIndex(nx, ny)]) {
      revealGasPocket(nx, ny);
    }
    if (state.steamPocketMask[cellIndex(nx, ny)]) {
      revealSteamPocket(nx, ny, x - nx, y - ny);
    }
    if (state.boulderPocketMask[cellIndex(nx, ny)]) {
      startBoulderRoll(nx, ny, x - nx, y - ny);
    }
  }

  if (options.moveDrill) {
    state.drill.x = x;
    state.drill.y = y;
    recordPlayerMove(options.fromX, options.fromY, x, y, 2);
  }
}

function explodeAt(x, y, damage, radius = 2) {
  spawnExplosionEffect(x, y, radius);
  const breakDamage = Math.max(damage, EXPLOSION_BREAK_DAMAGE);
  const maxOffset = Math.ceil(radius);
  for (let oy = -maxOffset; oy <= maxOffset; oy += 1) {
    for (let ox = -maxOffset; ox <= maxOffset; ox += 1) {
      if (!ox && !oy) {
        continue;
      }
      if (Math.hypot(ox, oy) > radius) {
        continue;
      }
      damageCell(x + ox, y + oy, breakDamage, {
        ignoreHazardEffect: true,
        allowHazardChain: true,
        cause: "explosion",
      });
    }
  }
}

function triggerOverflowBomb(originX, originY) {
  const directions = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
    { x: 1, y: 1 },
    { x: 1, y: -1 },
    { x: -1, y: 1 },
    { x: -1, y: -1 },
  ];
  const dir = directions[Math.floor(Math.random() * directions.length)];
  const centerX = clamp(originX + dir.x * 3, 1, GRID_W - 2);
  const centerY = clamp(originY + dir.y * 3, 1, GRID_H - 2);
  const damage = EXPLOSION_BREAK_DAMAGE;
  const square = [
    { x: centerX, y: centerY },
    { x: clamp(centerX + (dir.x >= 0 ? 1 : -1), 1, GRID_W - 2), y: centerY },
    { x: centerX, y: clamp(centerY + (dir.y >= 0 ? 1 : -1), 1, GRID_H - 2) },
    {
      x: clamp(centerX + (dir.x >= 0 ? 1 : -1), 1, GRID_W - 2),
      y: clamp(centerY + (dir.y >= 0 ? 1 : -1), 1, GRID_H - 2),
    },
  ];

  state.resolvingOverflowBomb = true;
  try {
    for (let i = 0; i < square.length; i += 1) {
      damageCell(square[i].x, square[i].y, damage, { ignoreHazardEffect: true, allowHazardChain: true });
    }
  } finally {
    state.resolvingOverflowBomb = false;
  }
}

function triggerRemoteBombSquare(originX, originY, distance) {
  const directions = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
    { x: 1, y: 1 },
    { x: 1, y: -1 },
    { x: -1, y: 1 },
    { x: -1, y: -1 },
  ];
  const dir = directions[Math.floor(Math.random() * directions.length)];
  const centerX = clamp(originX + dir.x * distance, 1, GRID_W - 2);
  const centerY = clamp(originY + dir.y * distance, 1, GRID_H - 2);
  const stepX = dir.x === 0 ? 1 : Math.sign(dir.x);
  const stepY = dir.y === 0 ? 1 : Math.sign(dir.y);
  const damage = EXPLOSION_BREAK_DAMAGE;
  const square = [
    { x: centerX, y: centerY },
    { x: clamp(centerX + stepX, 1, GRID_W - 2), y: centerY },
    { x: centerX, y: clamp(centerY + stepY, 1, GRID_H - 2) },
    { x: clamp(centerX + stepX, 1, GRID_W - 2), y: clamp(centerY + stepY, 1, GRID_H - 2) },
  ];

  for (let i = 0; i < square.length; i += 1) {
    damageCell(square[i].x, square[i].y, damage, { ignoreHazardEffect: true, allowHazardChain: true });
  }
}

function recordPlayerMove(fromX, fromY, toX, toY, moveWeight = 2) {
  consumeSignalMove(fromX, fromY, toX, toY);
  extendPath(toX, toY);
  state.signalPrevX = toX;
  state.signalPrevY = toY;
  applyGasContactDamage();
  applySteamContactDamage();
  state.movedTiles += 1;
  if (state.jumpDrive && state.movedTiles % 10 === 0) {
    state.jumpCharges += 1;
  }
  state.playerMoveProgress += moveWeight;
  if (state.playerMoveProgress >= BASE_MOVE_INTERVAL) {
    state.playerMoveProgress -= BASE_MOVE_INTERVAL;
    maybeMoveBase();
  }
}

function getBaseMoveDirections(awayFromHero) {
  const directions = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
    { x: 1, y: 1 },
    { x: 1, y: -1 },
    { x: -1, y: 1 },
    { x: -1, y: -1 },
  ];
  const currentDistance = Math.hypot(state.base.x - state.drill.x, state.base.y - state.drill.y);
  const candidates = [];

  for (let i = 0; i < directions.length; i += 1) {
    const toX = state.base.x + directions[i].x;
    const toY = state.base.y + directions[i].y;
    if (toX < 1 || toY < 1 || toX >= GRID_W - 1 || toY >= GRID_H - 1) {
      continue;
    }
    if (toX === state.drill.x && toY === state.drill.y) {
      continue;
    }
    if (state.perkZoneMask[cellIndex(toX, toY)] !== -1) {
      continue;
    }

    const nextDistance = Math.hypot(toX - state.drill.x, toY - state.drill.y);
    if (!awayFromHero || nextDistance > currentDistance + 0.001) {
      candidates.push(directions[i]);
    }
  }

  return candidates;
}

function maybeMoveBase() {
  if (state.baseFound) {
    return;
  }

  const preferAway = state.worldRandom() < BASE_MOVE_AWAY_CHANCE;
  let directions = getBaseMoveDirections(preferAway);
  if (!directions.length) {
    directions = getBaseMoveDirections(false);
  }
  if (!directions.length) {
    return;
  }

  const dir = directions[Math.floor(state.worldRandom() * directions.length)];
  const fromX = state.base.x;
  const fromY = state.base.y;
  const toX = fromX + dir.x;
  const toY = fromY + dir.y;
  const fromIndex = cellIndex(fromX, fromY);
  const toIndex = cellIndex(toX, toY);
  const targetTunnel = state.tunnelMask[toIndex];
  const targetHardness = state.hardness[toIndex];
  const targetHealth = state.health[toIndex];
  const targetPerk = state.perkMask[toIndex];

  state.tunnelMask[toIndex] = 0;
  state.hardness[toIndex] = 0;
  state.health[toIndex] = 0;
  state.perkMask[toIndex] = 0;

  state.tunnelMask[fromIndex] = targetTunnel;
  state.hardness[fromIndex] = targetHardness;
  state.health[fromIndex] = targetHealth;
  state.perkMask[fromIndex] = targetPerk;
  state.base.x = toX;
  state.base.y = toY;

  if (targetTunnel) {
    removePathTile(toX, toY);
    if (state.pathIndexByCell[fromIndex] === -1) {
      state.pathTiles.push({ x: fromX, y: fromY });
      rebuildPathIndex();
    }
  }
}

function removePathTile(x, y) {
  const pathIndex = state.pathIndexByCell[cellIndex(x, y)];
  if (pathIndex === -1) {
    return;
  }

  state.pathTiles.splice(pathIndex, 1);
  rebuildPathIndex();
}

function tryJumpMove(dx, dy) {
  if (!state.jumpDrive || state.jumpCharges <= 0 || state.jumpRange <= 1) {
    return false;
  }

  const jumpX = state.drill.x + dx * state.jumpRange;
  const jumpY = state.drill.y + dy * state.jumpRange;
  if (jumpX < 1 || jumpY < 1 || jumpX >= GRID_W - 1 || jumpY >= GRID_H - 1) {
    return false;
  }

  const moveCost = state.moveFuelCost * state.jumpRange;
  if (state.fuel < moveCost) {
    state.fuel = 0;
    return true;
  }

  const fromX = state.drill.x;
  const fromY = state.drill.y;
  const fromIndex = cellIndex(fromX, fromY);
  const targetIndex = cellIndex(jumpX, jumpY);
  const targetWasTunnel = state.tunnelMask[targetIndex] === 1;
  const targetHardness = state.hardness[targetIndex];
  const targetHealth = state.health[targetIndex];

  state.fuel -= moveCost;
  state.jumpCharges -= 1;

  if (!targetWasTunnel) {
    state.tunnelMask[fromIndex] = 0;
    state.hardness[fromIndex] = targetHardness;
    state.health[fromIndex] = targetHealth;
    state.perkMask[fromIndex] = 0;
    removePathTile(fromX, fromY);
  }

  state.drill.x = jumpX;
  state.drill.y = jumpY;
  carveTunnel(jumpX, jumpY);
  recordPlayerMove(fromX, fromY, jumpX, jumpY, 2);
  state.drill.progress = 0;
  state.drill.strikeEnergy = 0.35;
  return true;
}

function updateCameraShake(dt) {
  state.cameraShake.time += dt * 24;
  state.cameraShake.amplitude = Math.max(0, state.cameraShake.amplitude - dt * 18);
}

function updateDrill(dt) {
  if (state.fuel <= 0) {
    state.fuel = 0;
    state.drill.progress = 0;
    state.drill.strikeEnergy = 0;
    state.drill.strikeLatch = false;
    return;
  }

  const absX = Math.abs(state.moveAimX);
  const absY = Math.abs(state.moveAimY);
  let dx = 0;
  let dy = 0;

  if (absX > 0.25 || absY > 0.25) {
    if (absX > absY) {
      dx = state.moveAimX > 0 ? 1 : -1;
    } else {
      dy = state.moveAimY > 0 ? 1 : -1;
    }
  }

  if (!dx && !dy) {
    state.drill.progress = 0;
    state.drill.strikeEnergy = Math.max(0, state.drill.strikeEnergy - dt * 5);
    state.drill.strikeLatch = false;
    return;
  }

  const targetX = clamp(state.drill.x + dx, 1, GRID_W - 2);
  const targetY = clamp(state.drill.y + dy, 1, GRID_H - 2);
  const targetIndex = cellIndex(targetX, targetY);

  state.drill.facingX = dx;
  state.drill.facingY = dy;
  const fuelFactor = state.maxFuel > 0 ? 1 - state.fuel / state.maxFuel : 0;
  const lowFuelBoost = 1 + fuelFactor * state.lowFuelSpeedBonus;
  state.drill.strikePhase += dt * STRIKE_CYCLE_SPEED * state.strikeSpeed * lowFuelBoost;
  state.drill.strikeEnergy = Math.min(1, state.drill.strikeEnergy + dt * 9);
  const strikeWave = Math.max(0, Math.sin(state.drill.strikePhase));

  if (state.tunnelMask[targetIndex]) {
    if (strikeWave > 0.92 && !state.drill.strikeLatch) {
      if (tryJumpMove(dx, dy)) {
        state.drill.strikeLatch = true;
        return;
      }

      if (state.fuel < state.moveFuelCost) {
        state.fuel = 0;
        return;
      }
      state.drill.strikeLatch = true;
      state.fuel -= state.moveFuelCost;
      const fromX = state.drill.x;
      const fromY = state.drill.y;
      state.drill.x = targetX;
      state.drill.y = targetY;
      state.drill.progress = 0;
      state.drill.strikeEnergy = 0.35;
      recordPlayerMove(fromX, fromY, targetX, targetY, 1);
    } else if (strikeWave < 0.35) {
      state.drill.strikeLatch = false;
    }
    return;
  }

  if (strikeWave > 0.92 && !state.drill.strikeLatch && tryJumpMove(dx, dy)) {
    state.drill.strikeLatch = true;
    return;
  }

  if (strikeWave > 0.92 && !state.drill.strikeLatch) {
    if (state.fuel < state.strikeFuelCost) {
      state.fuel = 0;
      return;
    }

    state.drill.strikeLatch = true;
    state.fuel -= state.strikeFuelCost;
    const strikeDamage = getStrikeDamage();
    const hardness = state.hardness[targetIndex];
    damageCell(targetX, targetY, strikeDamage, {
      moveDrill: true,
      fromX: state.drill.x,
      fromY: state.drill.y,
      byDrill: true,
      dirX: dx,
      dirY: dy,
    });
    state.drill.progress += strikeDamage;
    state.cameraShake.amplitude = Math.max(
      state.cameraShake.amplitude,
      Math.min(1.8, 0.28 + hardness * 0.22) * state.drill.strikeEnergy,
    );

    if (state.sideDrills > 0) {
      const sideDamage = strikeDamage * (0.5 + state.sideDrills * 0.25);
      damageCell(state.drill.x - dy, state.drill.y + dx, sideDamage, { byDrill: true, dirX: -dy, dirY: dx });
      damageCell(state.drill.x + dy, state.drill.y - dx, sideDamage, { byDrill: true, dirX: dy, dirY: -dx });
    }

    if (state.longDrillPower > 0) {
      const longDamage = strikeDamage * (0.1 + state.longDrillPower);
      damageCell(targetX + dx, targetY + dy, longDamage, { byDrill: true, dirX: dx, dirY: dy });
    }

    if (state.diagonalDrillPower > 0) {
      const diagonalDamage = strikeDamage * (0.15 + state.diagonalDrillPower);
      damageCell(targetX - dy, targetY + dx, diagonalDamage, { byDrill: true, dirX: -dy, dirY: dx });
      damageCell(targetX + dy, targetY - dx, diagonalDamage, { byDrill: true, dirX: dy, dirY: -dx });
    }
  } else if (strikeWave < 0.35) {
    state.drill.strikeLatch = false;
  }

  if (state.fuel <= 0 && state.health[targetIndex] > 0) {
    state.fuel = 0;
    return;
  }
}

function consumeSignalMove(fromX, fromY, toX, toY) {
  if (state.signalMovesLeft <= 0) {
    return "Пусто";
  }

  const previousDistance = getDistanceToBase(fromX, fromY);
  const currentDistance = getDistanceToBase(toX, toY);
  const delta = currentDistance - previousDistance;
  state.signalMovesLeft -= 1;
  let reading = "Холоднее";

  if (delta < 0) {
    state.signalText = "Горячее";
    reading = "Горячее";
  } else {
    state.signalText = "Холоднее";
    reading = "Холоднее";
  }

  if (state.signalMovesLeft === 0) {
    state.signalMovesMax = 0;
    state.signalText = "Сигнал пуст";
  }
  return reading;
}

function updateDiscovery() {
  const dx = state.base.x - state.drill.x;
  const dy = state.base.y - state.drill.y;
  const distance = Math.hypot(dx, dy);
  state.base.visible = distance <= state.visionRadius + 0.35;
  if (state.drill.x === state.base.x && state.drill.y === state.base.y) {
    state.baseFound = true;
  }
}

function extendPath(x, y) {
  const tail = state.pathTiles[state.pathTiles.length - 1];
  if (tail && tail.x === x && tail.y === y) {
    return;
  }

  state.depth = Math.max(state.depth, Math.abs(y - START_Y));
  state.pathTiles.push({ x, y });
  rebuildPathIndex();
}

function isVisibleCell(x, y) {
  const dx = x - state.drill.x;
  const dy = y - state.drill.y;
  return dx * dx + dy * dy <= state.visionRadius * state.visionRadius;
}

function getCamera() {
  const cameraX = state.drill.x * TILE_SIZE - state.width * 0.5;
  const cameraY = state.drill.y * TILE_SIZE - state.height * 0.56;
  const maxX = GRID_W * TILE_SIZE - state.width;
  const maxY = GRID_H * TILE_SIZE - state.height;
  const shakeX = Math.sin(state.cameraShake.time * 1.7) * state.cameraShake.amplitude;
  const shakeY = Math.cos(state.cameraShake.time * 2.3) * state.cameraShake.amplitude * 0.7;
  return {
    x: clamp(cameraX + shakeX, 0, Math.max(0, maxX)),
    y: clamp(cameraY + shakeY, 0, Math.max(0, maxY)),
  };
}

function drawTileSprite(sprite, sx, sy) {
  if (!sprite) {
    return;
  }
  state.ctx.drawImage(sprite, sx, sy, TILE_SIZE, TILE_SIZE);
}

function renderEffects(camera) {
  const ctx = state.ctx;
  ctx.save();
  for (let i = 0; i < state.effects.length; i += 1) {
    const effect = state.effects[i];
    const progress = 1 - effect.time / effect.duration;
    const cx = effect.x * TILE_SIZE + TILE_SIZE * 0.5 - camera.x;
    const cy = effect.y * TILE_SIZE + TILE_SIZE * 0.5 - camera.y;

    if (effect.kind === "impact") {
      const alpha = 1 - progress;
      const reach = 6 + progress * 10 + effect.hardness * 0.3;
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = "#ffe2a6";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + effect.dirX * reach, cy + effect.dirY * reach);
      ctx.stroke();
      ctx.strokeStyle = "rgba(255, 248, 220, 0.8)";
      ctx.beginPath();
      ctx.moveTo(cx + effect.dirX * reach, cy + effect.dirY * reach);
      ctx.lineTo(cx + effect.dirX * (reach + 6) - effect.dirY * 4, cy + effect.dirY * (reach + 6) + effect.dirX * 4);
      ctx.moveTo(cx + effect.dirX * reach, cy + effect.dirY * reach);
      ctx.lineTo(cx + effect.dirX * (reach + 5) + effect.dirY * 4, cy + effect.dirY * (reach + 5) - effect.dirX * 4);
      ctx.stroke();
    } else if (effect.kind === "break") {
      const alpha = 1 - progress;
      const shardColor = BLOCK_TYPES[effect.hardness]?.vein || "#d6d9df";
      for (let shard = 0; shard < 7; shard += 1) {
        const angle = ((effect.seed + shard * 53) % 628) / 100;
        const speed = 5 + ((effect.seed + shard * 29) % 7) + effect.hardness * 0.25;
        const dx = Math.cos(angle) * speed * progress * 1.8;
        const dy = Math.sin(angle) * speed * progress * 1.8 + progress * 10;
        const size = 2 + ((effect.seed + shard * 17) % 3);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = shardColor;
        ctx.fillRect(cx + dx - size * 0.5, cy + dy - size * 0.5, size, size);
      }
      ctx.globalAlpha = 0.45 * (1 - progress);
      ctx.fillStyle = effect.cause === "explosion" ? "#ffb36a" : "#f3d7a4";
      ctx.beginPath();
      ctx.arc(cx, cy, 6 + progress * 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.18 * (1 - progress);
      ctx.fillStyle = "#fff3dc";
      ctx.beginPath();
      ctx.arc(cx, cy, 10 + progress * 16, 0, Math.PI * 2);
      ctx.fill();
    } else if (effect.kind === "explosion") {
      const alpha = 1 - progress;
      const radius = TILE_SIZE * 0.35 + effect.radius * 8 * progress;
      const gradient = ctx.createRadialGradient(cx, cy, 2, cx, cy, radius);
      gradient.addColorStop(0, `rgba(255,245,210,${0.9 * alpha})`);
      gradient.addColorStop(0.4, `rgba(255,180,92,${0.55 * alpha})`);
      gradient.addColorStop(1, "rgba(255,120,32,0)");
      ctx.globalAlpha = 1;
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = "#ffd59b";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.82, 0, Math.PI * 2);
      ctx.stroke();
      for (let spark = 0; spark < 8; spark += 1) {
        const angle = ((effect.seed + spark * 67) % 628) / 100;
        const reach = radius * (0.6 + spark * 0.04);
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * (reach * 0.25), cy + Math.sin(angle) * (reach * 0.25));
        ctx.lineTo(cx + Math.cos(angle) * reach, cy + Math.sin(angle) * reach);
        ctx.stroke();
      }
      ctx.globalAlpha = alpha * 0.3;
      ctx.fillStyle = "#3b2318";
      for (let puff = 0; puff < 4; puff += 1) {
        const angle = ((effect.seed + puff * 91) % 628) / 100;
        const puffReach = radius * (0.28 + puff * 0.12);
        ctx.beginPath();
        ctx.arc(cx + Math.cos(angle) * puffReach, cy + Math.sin(angle) * puffReach, 5 + progress * 9 + puff, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  ctx.restore();
}

function render() {
  const ctx = state.ctx;
  const camera = getCamera();
  const startX = Math.max(0, Math.floor(camera.x / TILE_SIZE) - 1);
  const startY = Math.max(0, Math.floor(camera.y / TILE_SIZE) - 1);
  const endX = Math.min(GRID_W, Math.ceil((camera.x + state.width) / TILE_SIZE) + 1);
  const endY = Math.min(GRID_H, Math.ceil((camera.y + state.height) / TILE_SIZE) + 1);

  ctx.clearRect(0, 0, state.width, state.height);

  const gradient = ctx.createLinearGradient(0, 0, 0, state.height);
  gradient.addColorStop(0, "#3a2415");
  gradient.addColorStop(0.45, "#24160f");
  gradient.addColorStop(1, "#0b0706");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, state.width, state.height);

  ctx.fillStyle = "rgba(224, 176, 96, 0.05)";
  ctx.beginPath();
  ctx.arc(state.width * 0.76, state.height * 0.1, 140, 0, Math.PI * 2);
  ctx.fill();

  for (let y = startY; y < endY; y += 1) {
    for (let x = startX; x < endX; x += 1) {
      const index = cellIndex(x, y);
      const sx = x * TILE_SIZE - camera.x;
      const sy = y * TILE_SIZE - camera.y;
      const visible = isVisibleCell(x, y);

      if (!visible) {
        ctx.fillStyle = "#050403";
        ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);
        ctx.strokeStyle = "rgba(255, 225, 179, 0.02)";
        ctx.strokeRect(sx, sy, TILE_SIZE, TILE_SIZE);
        continue;
      }

      if (state.tunnelMask[index]) {
        drawTileSprite(state.sprites.tunnel, sx, sy);
      } else if (state.gasPocketMask[index]) {
        drawTileSprite(state.sprites.gasPocket, sx, sy);
      } else if (state.steamPocketMask[index]) {
        drawTileSprite(state.sprites.steamPocket, sx, sy);
      } else if (state.boulderPocketMask[index]) {
        drawTileSprite(state.sprites.boulderPocket, sx, sy);
      } else {
        drawTileSprite(state.sprites.blocks[state.hardness[index]], sx, sy);
      }

      ctx.strokeStyle = "rgba(255, 225, 179, 0.05)";
      ctx.strokeRect(sx, sy, TILE_SIZE, TILE_SIZE);

      if (state.gasMask[index] && !state.gasPocketMask[index]) {
        const alpha = 0.18 + (Math.sin((state.lastTs || 0) * 0.008 + x + y) * 0.5 + 0.5) * 0.12;
        ctx.fillStyle = `rgba(158, 240, 108, ${alpha})`;
        ctx.beginPath();
        ctx.arc(sx + TILE_SIZE * 0.38, sy + TILE_SIZE * 0.44, 7, 0, Math.PI * 2);
        ctx.arc(sx + TILE_SIZE * 0.6, sy + TILE_SIZE * 0.54, 8, 0, Math.PI * 2);
        ctx.arc(sx + TILE_SIZE * 0.46, sy + TILE_SIZE * 0.7, 6, 0, Math.PI * 2);
        ctx.fill();
      }
      if (state.steamMask[index] && !state.steamPocketMask[index]) {
        const alpha = 0.16 + (Math.sin((state.lastTs || 0) * 0.01 + x * 0.7 + y) * 0.5 + 0.5) * 0.12;
        ctx.fillStyle = `rgba(255, 207, 122, ${alpha})`;
        ctx.beginPath();
        ctx.arc(sx + TILE_SIZE * 0.36, sy + TILE_SIZE * 0.48, 6, 0, Math.PI * 2);
        ctx.arc(sx + TILE_SIZE * 0.58, sy + TILE_SIZE * 0.38, 7, 0, Math.PI * 2);
        ctx.arc(sx + TILE_SIZE * 0.5, sy + TILE_SIZE * 0.68, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!state.tunnelMask[index] && !state.gasPocketMask[index] && !state.steamPocketMask[index] && !state.boulderPocketMask[index]) {
        const hazardType = state.hazardMask[index];
        if (hazardType) {
          drawTileSprite(state.sprites.hazards[hazardType], sx, sy);
        }
      }

      if (!state.tunnelMask[index] && state.health[index] < BLOCK_TYPES[state.hardness[index]].hp) {
        const ratio = clamp(state.health[index] / BLOCK_TYPES[state.hardness[index]].hp, 0, 1);
        const crackStage = clamp(Math.ceil((1 - ratio) * 3), 0, 3);
        if (crackStage > 0) {
          ctx.globalAlpha = 0.3 + (1 - ratio) * 0.5;
          drawTileSprite(state.sprites.cracks[crackStage], sx, sy);
          ctx.globalAlpha = 1;
        }
        ctx.fillStyle = "rgba(255, 231, 195, 0.2)";
        ctx.fillRect(sx + 6, sy + TILE_SIZE - 9, (TILE_SIZE - 12) * ratio, 4);
      }

      renderPerkZoneTile(x, y, sx, sy);
      renderPerkTile(x, y, sx, sy);
    }
  }

  renderPath(camera);
  renderEffects(camera);
  renderBase(camera);
  renderBoulders(camera);
  renderDrill(camera);
  renderFuelToast(camera);
  renderHpToast(camera);
  renderScrapToast(camera);
  renderPerkToast(camera);
  renderSignalStatus(camera);
  renderVisionMask(camera);
  renderHud();

  if (state.damageFlash > 0) {
    ctx.fillStyle = `rgba(255, 64, 64, ${0.16 * state.damageFlash})`;
    ctx.fillRect(0, 0, state.width, state.height);
  }

  if (state.baseFound) {
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(0, 0, state.width, state.height);
    ctx.fillStyle = "#ffffff";
    ctx.font = `700 28px ${HUD_FONT}`;
    ctx.textAlign = "center";
    ctx.fillText("База найдена", state.width * 0.5, state.height * 0.46);
    ctx.font = `400 16px ${HUD_FONT}`;
    ctx.fillText("Ты добрался до спрятанной цели. Можно расширять мета-игру поиска.", state.width * 0.5, state.height * 0.52);
  } else if (state.dead) {
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, state.width, state.height);
    ctx.fillStyle = "#ffe2d5";
    ctx.font = `700 28px ${HUD_FONT}`;
    ctx.textAlign = "center";
    ctx.fillText("Бур разбит", state.width * 0.5, state.height * 0.46);
    ctx.font = `400 16px ${HUD_FONT}`;
    ctx.fillText("Опасные блоки нужно обходить или добивать осторожно.", state.width * 0.5, state.height * 0.52);
  }
}

function renderBoulders(camera) {
  const ctx = state.ctx;
  ctx.save();
  for (let i = 0; i < state.boulders.length; i += 1) {
    const boulder = state.boulders[i];
    const x = boulder.x * TILE_SIZE - camera.x + TILE_SIZE * 0.5;
    const y = boulder.y * TILE_SIZE - camera.y + TILE_SIZE * 0.54;
    const gradient = ctx.createRadialGradient(x - 3, y - 4, 2, x, y, 12);
    gradient.addColorStop(0, "#bcab97");
    gradient.addColorStop(1, "#7d6857");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#d9c4aa";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(x - 4, y - 3, 5, 0, Math.PI * 2);
    ctx.arc(x + 4, y - 4, 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "rgba(255, 240, 220, 0.16)";
    ctx.beginPath();
    ctx.arc(x - 2, y - 5, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function renderPath(camera) {
  const ctx = state.ctx;
  ctx.lineWidth = 8;
  ctx.lineCap = "round";
  ctx.strokeStyle = "rgba(108, 62, 31, 0.65)";
  ctx.beginPath();
  for (let i = 0; i < state.pathTiles.length; i += 1) {
    const tile = state.pathTiles[i];
    const px = tile.x * TILE_SIZE + TILE_SIZE * 0.5 - camera.x;
    const py = tile.y * TILE_SIZE + TILE_SIZE * 0.5 - camera.y;
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.stroke();

  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(219, 171, 99, 0.52)";
  ctx.stroke();

  ctx.fillStyle = "rgba(247, 220, 172, 0.45)";
  for (let i = 0; i < state.pathTiles.length; i += 3) {
    const tile = state.pathTiles[i];
    ctx.beginPath();
    ctx.arc(tile.x * TILE_SIZE + TILE_SIZE * 0.5 - camera.x, tile.y * TILE_SIZE + TILE_SIZE * 0.5 - camera.y, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function renderBase(camera) {
  const ctx = state.ctx;
  if (!state.base.visible) {
    return;
  }

  const x = state.base.x * TILE_SIZE - camera.x;
  const y = state.base.y * TILE_SIZE - camera.y;
  ctx.save();
  ctx.fillStyle = "rgba(105, 210, 255, 0.14)";
  ctx.beginPath();
  ctx.arc(x + TILE_SIZE * 0.5, y + TILE_SIZE * 0.5, TILE_SIZE * 0.7, 0, Math.PI * 2);
  ctx.fill();
  const shell = ctx.createLinearGradient(x, y, x + TILE_SIZE, y + TILE_SIZE);
  shell.addColorStop(0, "#f0c785");
  shell.addColorStop(1, "#9b6233");
  ctx.fillStyle = "#2b1b14";
  fillRoundRect(ctx, x + 5, y + 5, TILE_SIZE - 10, TILE_SIZE - 10, 7);
  ctx.fillStyle = shell;
  fillRoundRect(ctx, x + 8, y + 8, TILE_SIZE - 16, TILE_SIZE - 16, 6);
  ctx.fillStyle = "#6c4120";
  fillRoundRect(ctx, x + 15, y + 12, TILE_SIZE - 30, TILE_SIZE - 20, 4);
  ctx.fillStyle = "rgba(255, 239, 194, 0.45)";
  fillRoundRect(ctx, x + 12, y + 12, TILE_SIZE - 24, 7, 4);
  ctx.strokeStyle = "rgba(255, 238, 214, 0.45)";
  ctx.strokeRect(x + 10.5, y + 10.5, TILE_SIZE - 21, TILE_SIZE - 21);
  renderCog(x + 14, y + TILE_SIZE - 13, 4, ctx);
  renderCog(x + TILE_SIZE - 14, y + TILE_SIZE - 13, 4, ctx);
  ctx.restore();
}

function renderPerkTile(x, y, sx, sy) {
  const ctx = state.ctx;
  const index = cellIndex(x, y);
  const perkType = state.perkMask[index];
  if (!perkType) {
    return;
  }

  const perk = TILE_PERK_TYPES[perkType];
  ctx.save();
  ctx.fillStyle = `${perk.color}28`;
  ctx.beginPath();
  ctx.arc(sx + TILE_SIZE * 0.5, sy + TILE_SIZE * 0.5, TILE_SIZE * 0.28, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `${perk.color}18`;
  ctx.beginPath();
  ctx.arc(sx + TILE_SIZE * 0.5, sy + TILE_SIZE * 0.5, TILE_SIZE * 0.38, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = perk.color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(sx + TILE_SIZE * 0.5, sy + 8);
  ctx.lineTo(sx + TILE_SIZE - 8, sy + TILE_SIZE * 0.5);
  ctx.lineTo(sx + TILE_SIZE * 0.5, sy + TILE_SIZE - 8);
  ctx.lineTo(sx + 8, sy + TILE_SIZE * 0.5);
  ctx.closePath();
  ctx.stroke();
  ctx.strokeStyle = "rgba(255, 247, 232, 0.3)";
  ctx.lineWidth = 1;
  ctx.strokeRect(sx + 10.5, sy + 10.5, TILE_SIZE - 21, TILE_SIZE - 21);
  ctx.fillStyle = "#2b1b14";
  ctx.font = `700 9px ${HUD_FONT}`;
  ctx.textAlign = "center";
  ctx.fillText(perk.icon, sx + TILE_SIZE * 0.5, sy + TILE_SIZE * 0.58);
  ctx.restore();
}

function renderPerkZoneTile(x, y, sx, sy) {
  const zoneId = state.perkZoneMask[cellIndex(x, y)];
  if (zoneId === -1) {
    return;
  }

  const zone = state.perkZones[zoneId];
  if (!zone || zone.collected || !state.tunnelMask[cellIndex(x, y)]) {
    return;
  }

  const perk = TILE_PERK_TYPES[zone.perkType];
  const localX = x - zone.x;
  const localY = y - zone.y;
  const ctx = state.ctx;

  ctx.save();
  ctx.strokeStyle = `${perk.color}66`;
  ctx.lineWidth = 2;
  ctx.strokeRect(sx + 3, sy + 3, TILE_SIZE - 6, TILE_SIZE - 6);

  ctx.fillStyle = `${perk.color}18`;
  ctx.fillRect(sx + 5, sy + 5, TILE_SIZE - 10, TILE_SIZE - 10);

  if (localX === 0 && localY === 0) {
    ctx.fillStyle = perk.color;
    ctx.font = `700 14px ${HUD_FONT}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(perk.icon, sx + TILE_SIZE * 0.5, sy + TILE_SIZE * 0.5 + 1);
  }

  ctx.restore();
}

function renderSteamStack(x, y, ctx) {
  ctx.fillStyle = "rgba(255, 232, 206, 0.2)";
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.arc(x + 7, y - 6, 4, 0, Math.PI * 2);
  ctx.arc(x - 5, y - 8, 3, 0, Math.PI * 2);
  ctx.fill();
}

function renderCog(cx, cy, radius, ctx) {
  ctx.fillStyle = "#c4914e";
  ctx.beginPath();
  for (let i = 0; i < 8; i += 1) {
    const angle = (Math.PI * 2 * i) / 8;
    const ox = Math.cos(angle) * (radius + 2);
    const oy = Math.sin(angle) * (radius + 2);
    ctx.rect(cx + ox - 2, cy + oy - 2, 4, 4);
  }
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#5f381f";
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.38, 0, Math.PI * 2);
  ctx.fill();
}

function renderDrill(camera) {
  const ctx = state.ctx;
  const strikeWave = Math.max(0, Math.sin(state.drill.strikePhase));
  const thrust = strikeWave * state.drill.strikeEnergy;
  const idleBob = Math.sin(state.drill.strikePhase * 0.5) * 0.7;
  const bodyOffsetX = -state.drill.facingX * thrust * 2.2;
  const bodyOffsetY = -state.drill.facingY * thrust * 2.2 + idleBob;
  const hammerOffsetX = state.drill.facingX * thrust * 7;
  const hammerOffsetY = state.drill.facingY * thrust * 7;
  const px = state.drill.x * TILE_SIZE - camera.x + bodyOffsetX;
  const py = state.drill.y * TILE_SIZE - camera.y + bodyOffsetY;
  const bodyGrad = ctx.createLinearGradient(px, py, px + TILE_SIZE, py + TILE_SIZE);
  bodyGrad.addColorStop(0, "#ebbe72");
  bodyGrad.addColorStop(1, "#8d552a");
  ctx.save();
  ctx.fillStyle = "#4e2e1d";
  fillRoundRect(ctx, px + 5, py + 9, TILE_SIZE - 10, TILE_SIZE - 14, 8);
  ctx.fillStyle = bodyGrad;
  fillRoundRect(ctx, px + 9, py + 11, TILE_SIZE - 18, TILE_SIZE - 18, 7);
  ctx.fillStyle = "#34231a";
  fillRoundRect(ctx, px + 12, py + 5, TILE_SIZE - 24, 11, 5);
  ctx.fillStyle = "#6e4324";
  fillRoundRect(ctx, px + TILE_SIZE - 18, py + 11, 7, 16, 3);
  ctx.fillStyle = "rgba(255, 240, 199, 0.22)";
  fillRoundRect(ctx, px + 12, py + 15, TILE_SIZE - 24, 4, 2);
  ctx.strokeStyle = "rgba(255, 239, 194, 0.28)";
  ctx.lineWidth = 1;
  ctx.strokeRect(px + 10.5, py + 12.5, TILE_SIZE - 21, TILE_SIZE - 21);
  ctx.restore();

  const drillBaseX = px + TILE_SIZE * 0.5;
  const drillBaseY = py + TILE_SIZE * 0.5;
  const drillTipX = drillBaseX + state.drill.facingX * (12 + hammerOffsetX) + (state.drill.facingX === 0 ? hammerOffsetX * 0.25 : 0);
  const drillTipY = drillBaseY + state.drill.facingY * (12 + hammerOffsetY) + (state.drill.facingY === 0 ? hammerOffsetY * 0.25 : 0);
  ctx.strokeStyle = "#ffe1a6";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(drillBaseX, drillBaseY);
  ctx.lineTo(drillTipX, drillTipY);
  ctx.stroke();
  ctx.strokeStyle = "#7a8b92";
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(drillBaseX + state.drill.facingX * 4, drillBaseY + state.drill.facingY * 4);
  ctx.lineTo(drillTipX, drillTipY);
  ctx.stroke();

  if (state.drill.strikeEnergy > 0.08 && strikeWave > 0.72) {
    ctx.strokeStyle = "rgba(255, 231, 173, 0.85)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(drillTipX, drillTipY);
    ctx.lineTo(drillTipX - state.drill.facingY * 6 + state.drill.facingX * 3, drillTipY + state.drill.facingX * 6 + state.drill.facingY * 3);
    ctx.moveTo(drillTipX, drillTipY);
    ctx.lineTo(drillTipX + state.drill.facingY * 5 + state.drill.facingX * 2, drillTipY - state.drill.facingX * 5 + state.drill.facingY * 2);
    ctx.stroke();
  }

  renderCog(px + 14, py + TILE_SIZE - 12, 5, ctx);
  renderCog(px + TILE_SIZE - 14, py + TILE_SIZE - 12, 5, ctx);
  ctx.fillStyle = "#553522";
  fillRoundRect(ctx, px + 4, py + TILE_SIZE * 0.46, 8, 6, 2);
  fillRoundRect(ctx, px + TILE_SIZE - 12, py + TILE_SIZE * 0.46, 8, 6, 2);
  renderSteamStack(px + TILE_SIZE - 14 - state.drill.facingX * thrust * 1.2, py + 7 - state.drill.facingY * thrust * 1.2, ctx);
}

function renderSignalStatus(camera) {
  if (state.signalMovesLeft <= 0) {
    return;
  }

  const ctx = state.ctx;
  const x = state.drill.x * TILE_SIZE + TILE_SIZE * 0.5 - camera.x;
  const y = state.drill.y * TILE_SIZE - camera.y - 14;
  const text = state.signalText;

  ctx.save();
  ctx.font = `700 13px ${HUD_FONT}`;
  ctx.textAlign = "center";
  const width = Math.max(74, ctx.measureText(text).width + 18);
  const barRatio = state.signalMovesMax > 0 ? clamp(state.signalMovesLeft / state.signalMovesMax, 0, 1) : 0;
  ctx.fillStyle = "rgba(23, 14, 9, 0.82)";
  ctx.strokeStyle = "rgba(196, 240, 255, 0.36)";
  ctx.lineWidth = 1.5;
  buildRoundedRectPath(ctx, x - width * 0.5, y - 18, width, 30, 10);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#c4f0ff";
  ctx.fillText(text, x, y - 1);
  ctx.fillStyle = "rgba(255, 244, 220, 0.12)";
  buildRoundedRectPath(ctx, x - width * 0.5 + 8, y + 2, width - 16, 4, 3);
  ctx.fill();
  if (barRatio > 0) {
    ctx.fillStyle = "#8ef0cb";
    buildRoundedRectPath(ctx, x - width * 0.5 + 8, y + 2, (width - 16) * barRatio, 4, 3);
    ctx.fill();
  }
  ctx.restore();
}

function renderPerkToast(camera) {
  if (state.perkToast.time <= 0 || !state.perkToast.text) {
    return;
  }

  const ctx = state.ctx;
  const x = state.drill.x * TILE_SIZE + TILE_SIZE * 0.5 - camera.x;
  const lift = (1.2 - state.perkToast.time) * 18;
  const y = state.drill.y * TILE_SIZE - camera.y - 34 - lift;
  const alpha = clamp(state.perkToast.time / 1.2, 0, 1);
  const text = `+ ${state.perkToast.text}`;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = `700 14px ${HUD_FONT}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const width = Math.max(86, ctx.measureText(text).width + 22);
  ctx.fillStyle = "rgba(36, 22, 13, 0.88)";
  ctx.strokeStyle = "rgba(255, 207, 122, 0.42)";
  ctx.lineWidth = 1.5;
  drawRoundedRectPath(x - width * 0.5, y - 13, width, 26, 12);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#ffcf7a";
  ctx.fillText(text, x, y + 1);
  ctx.restore();
}

function renderFuelToast(camera) {
  if (state.fuelToast.time <= 0 || state.fuelToast.value <= 0) {
    return;
  }

  const ctx = state.ctx;
  const x = state.drill.x * TILE_SIZE + TILE_SIZE * 0.5 - camera.x;
  const lift = (0.9 - state.fuelToast.time) * 22;
  const y = state.drill.y * TILE_SIZE - camera.y - 78 - lift;
  const alpha = clamp(state.fuelToast.time / 0.9, 0, 1);
  const text = `+${state.fuelToast.value} fuel`;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = `700 13px ${HUD_FONT}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const width = Math.max(80, ctx.measureText(text).width + 18);
  ctx.fillStyle = "rgba(41, 26, 12, 0.88)";
  ctx.strokeStyle = "rgba(255, 191, 98, 0.38)";
  ctx.lineWidth = 1.5;
  drawRoundedRectPath(x - width * 0.5, y - 12, width, 24, 11);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#ffbf62";
  ctx.fillText(text, x, y + 1);
  ctx.restore();
}

function renderHpToast(camera) {
  if (state.hpToast.time <= 0 || state.hpToast.value <= 0) {
    return;
  }

  const ctx = state.ctx;
  const sx = state.drill.x * TILE_SIZE + TILE_SIZE * 0.5 - camera.x;
  const sy = state.drill.y * TILE_SIZE - camera.y;
  const lift = (0.9 - state.hpToast.time) * 24;
  const alpha = clamp(state.hpToast.time / 0.9, 0, 1);
  const text = `-${state.hpToast.value} HP`;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#ff8a8a";
  ctx.strokeStyle = "rgba(43, 12, 12, 0.72)";
  ctx.lineWidth = 3;
  ctx.font = `700 14px ${HUD_FONT}`;
  ctx.textAlign = "center";
  ctx.strokeText(text, sx, sy - 26 - lift);
  ctx.fillText(text, sx, sy - 26 - lift);
  ctx.restore();
}

function renderScrapToast(camera) {
  if (state.scrapToast.time <= 0 || state.scrapToast.value <= 0) {
    return;
  }

  const ctx = state.ctx;
  const x = state.drill.x * TILE_SIZE + TILE_SIZE * 0.5 - camera.x;
  const lift = (0.9 - state.scrapToast.time) * 22;
  const y = state.drill.y * TILE_SIZE - camera.y - 56 - lift;
  const alpha = clamp(state.scrapToast.time / 0.9, 0, 1);
  const text = `+${state.scrapToast.value} scrap`;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = `700 13px ${HUD_FONT}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const width = Math.max(84, ctx.measureText(text).width + 18);
  ctx.fillStyle = "rgba(41, 31, 12, 0.88)";
  ctx.strokeStyle = "rgba(240, 223, 132, 0.38)";
  ctx.lineWidth = 1.5;
  drawRoundedRectPath(x - width * 0.5, y - 12, width, 24, 11);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#f0df84";
  ctx.fillText(text, x, y + 1);
  ctx.restore();
}

function renderHud() {
  const fuelRatio = clamp(state.fuel / state.maxFuel, 0, 1);
  const hpRatio = clamp(state.hp / state.maxHp, 0, 1);
  const currentScrapCost = getScrapPerkCost(state.scrapPerkLevel);
  const scrapCycle = state.nextScrapPerkAt - currentScrapCost;
  const scrapProgress = clamp(state.scrap - scrapCycle, 0, currentScrapCost);
  const scrapRatio = clamp(scrapProgress / currentScrapCost, 0, 1);
  const top = 14 + (window.visualViewport?.offsetTop || 0);
  const gap = 10;
  const totalWidth = Math.min(state.width - 28, 420);
  const panelWidth = (totalWidth - gap * 2) / 3;
  const panelHeight = 34;
  const left = state.width - 14 - totalWidth;

  drawHudBar(left, top, panelWidth, panelHeight, "HP", `${state.hp}/${state.maxHp}`, hpRatio, ["#ff9d7a", "#ff5c5c"]);
  drawHudBar(left + panelWidth + gap, top, panelWidth, panelHeight, "FUEL", `${Math.floor(state.fuel)}/${state.maxFuel}`, fuelRatio, ["#ffbf62", "#ff8c3b"]);
  drawHudBar(
    left + (panelWidth + gap) * 2,
    top,
    panelWidth,
    panelHeight,
    "SCRAP",
    `${Math.floor(scrapProgress)}/${currentScrapCost}`,
    scrapRatio,
    ["#f0df84", "#d7b548"],
  );

  const ctx = state.ctx;
  ctx.save();
  ctx.fillStyle = "rgba(31, 18, 12, 0.82)";
  ctx.strokeStyle = "rgba(220, 169, 93, 0.28)";
  ctx.lineWidth = 1;
  drawRoundedRectPath(left, top + panelHeight + 8, 150, 24, 10);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#c6ab84";
  ctx.font = `700 10px ${HUD_FONT}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(`SEED ${state.worldSeed}  •  Опасности: шипы, взрыв, газ, пар, валун`, left + 10, top + panelHeight + 20);
  ctx.restore();
}

function drawHudBar(x, y, width, height, label, value, ratio, colors) {
  const ctx = state.ctx;
  const trackX = x + 54;
  const trackY = y + 12;
  const trackWidth = Math.max(36, width - 104);
  const trackHeight = 10;

  drawHudPanel(x, y, width, height);

  ctx.save();
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#c6ab84";
  ctx.font = `700 10px ${HUD_FONT}`;
  ctx.textAlign = "left";
  ctx.fillText(label, x + 10, y + 15);

  ctx.fillStyle = "rgba(255, 240, 214, 0.08)";
  drawRoundedRectPath(trackX, trackY, trackWidth, trackHeight, 999);
  ctx.fill();

  if (ratio > 0) {
    const gradient = ctx.createLinearGradient(trackX, trackY, trackX + trackWidth, trackY);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, colors[1]);
    ctx.fillStyle = gradient;
    drawRoundedRectPath(trackX, trackY, trackWidth * ratio, trackHeight, 999);
    ctx.fill();
  }

  ctx.textAlign = "right";
  ctx.fillStyle = "#f7ebd4";
  ctx.font = `700 11px ${HUD_FONT}`;
  ctx.fillText(value, x + width - 10, y + 15);
  ctx.restore();
}

function drawHudPanel(x, y, width, height) {
  const ctx = state.ctx;
  ctx.save();
  ctx.fillStyle = "rgba(31, 18, 12, 0.82)";
  ctx.strokeStyle = "rgba(220, 169, 93, 0.28)";
  ctx.lineWidth = 1;
  drawRoundedRectPath(x, y, width, height, 14);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawRoundedRectPath(x, y, width, height, radius) {
  const ctx = state.ctx;
  const r = Math.min(radius, width * 0.5, height * 0.5);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function renderVisionMask(camera) {
  const ctx = state.ctx;
  const centerX = state.drill.x * TILE_SIZE + TILE_SIZE * 0.5 - camera.x;
  const centerY = state.drill.y * TILE_SIZE + TILE_SIZE * 0.5 - camera.y;
  const radius = state.visionRadius * TILE_SIZE;

  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.38)";
  ctx.beginPath();
  ctx.rect(0, 0, state.width, state.height);
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2, true);
  ctx.fill("evenodd");
  ctx.restore();
}

init();
