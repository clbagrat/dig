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
const MAX_HEAT = 100;
const IDLE_FUEL_DRAIN = 0.8;
const MOVE_FUEL_COST = 1.8;
const STRIKE_FUEL_COST = 4.5;
const STRIKE_CYCLE_SPEED = 8;
const PERK_MIN_DISTANCE = 4;
const PERK_ZONE_MIN_DISTANCE = 6;
const TILES_PER_PERK_TILE = 26;
const TILES_PER_PERK_ZONE = 370;
const BASE_MIN_DISTANCE = 50;
const START_EASY_RADIUS = 5;
const RADAR_BASE_CHARGES = 10;
const SCRAP_PERK_BASE_COST = 30;
const SCRAP_PERK_COST_MULTIPLIER = 1.35;
const SCRAP_PERK_POPUP_DELAY = 0.5;
const BASE_MOVE_AWAY_CHANCE = 0.5;
const IDLE_AUTO_CLOSE_DELAY = 4;
const IDLE_AUTO_CLOSE_MIN_DELAY = 1;
const GAS_POCKET_GROUPS = 10;
const STEAM_POCKET_GROUPS = 8;
const BOULDER_POCKET_GROUPS = 8;
const METAL_VEIN_GROUPS = 16;
const GAS_SPREAD_INTERVAL = 2;
const GAS_SPREAD_STEPS = 3;
const GAS_DAMAGE = 1;
const BOULDER_DELAY = 1;
const BOULDER_MOVE_INTERVAL = 0.12;
const BOULDER_BREAK_LIMIT = 20;
const BOULDER_DAMAGE = 5;
const BOULDER_MIN_START_DISTANCE = 4;
const STEAM_RELEASE_DELAY = 2;
const STEAM_LIFETIME = 3;
const STEAM_DAMAGE = 1;
const STEAM_RANGE = 99;
const EXPLOSION_BREAK_DAMAGE = 9999;
const OVERFLOW_OVERDRIVE_DURATION = 3;
const OVERFLOW_STUN_DURATION = 3;
const HEAT_PER_STRIKE = 3;
const HEAT_COOL_RATE = 8;
const HEAT_STUN_DURATION = 3;
const FUEL_DEPLETION_HP_COST = 1;
const FUEL_DEPLETION_RECOVERY = 100;
const IMPACT_EFFECT_DURATION = 0.22;
const BREAK_EFFECT_DURATION = 0.42;
const EXPLOSION_EFFECT_DURATION = 0.48;
const LOOP_FIELD_EFFECT_DURATION = 0.52;
const CHAIN_EXPLOSION_DELAY = 0.14;
const PERK_ZONE_CHARGE_DELAY = 1;
const MOVE_ANIMATION_DURATION = 0.14;
const BASE_MOVE_ANIMATION_DURATION = 0.18;
const TILE_SWAP_ANIMATION_DURATION = 0.18;
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
  { hp: 60, color: "#5f4631", scrap: 2, vein: "#9b7a4a" },
  { hp: 90, color: "#715337", scrap: 4, vein: "#c59a5c" },
  { hp: 120, color: "#6a4f37", scrap: 6, vein: "#d0a66a" },
  { hp: 180, color: "#6f4f40", scrap: 8, vein: "#b66e3b" },
  { hp: 300, color: "#60473f", scrap: 11, vein: "#a57f58" },
  { hp: 420, color: "#4f3d36", scrap: 14, vein: "#9cb1b7" },
  { hp: 600, color: "#3e3236", scrap: 18, vein: "#d6d9df" },
];

const TILE_PERK_TYPES = [
  null,
  { name: "Бак", icon: "F", color: "#ffcf7a", desc: "+120 топлива прямо сейчас" },
  { name: "Радар", icon: "R", color: "#f2ede2", desc: "+5 сигналов hotter/colder" },
  { name: "Бур", icon: "D", color: "#ff9f6b", desc: "+0.35 к силе удара бура" },
  { name: "Бомба", icon: "*", color: "#c796ff", desc: "Взрыв в радиусе 2 тайлов с уроном x10" },
  { name: "Скорость", icon: "S", color: "#9fd7ff", desc: "+15% к скорости нового удара" },
  { name: "HP+", icon: "H", color: "#73e58f", desc: "+1 к текущему здоровью" },
  { name: "Броня", icon: "A", color: "#b4d7ff", desc: "+1 брони против внешней опасности" },
];

const SCRAP_PERK_TYPES = [
  null,
  { name: "Боковые буры", icon: "⫼", desc: "Удар также бьет по двум боковым клеткам" },
  { name: "Прыжковый привод", icon: "↠", desc: "Каждые 10 блоков дает рывок, повторный выбор увеличивает дальность" },
  { name: "Длинный бур", icon: "⇢", desc: "Бьет следующий тайл вперед, повторно усиливает дальний удар" },
  { name: "Диагональные буры", icon: "✣", desc: "Бьют по диагоналям вперед, повторно усиливают дальний удар" },
  { name: "Контурный заряд", icon: "⬡", desc: "После замыкания контура дает временный бонус к урону бура от числа клеток внутри" },
  { name: "Форсаж на нуле", icon: "⏚", desc: "Чем меньше топлива, тем быстрее следующий удар" },
  { name: "Саперный заряд", icon: "✦", desc: "Каждые N сломанных буром блоков кидает ракету с малым радиусом на дистанцию 1" },
  { name: "Топливный контур", icon: "⛽", desc: "Любой перк дает +50 топлива, Бак дает на 50 меньше" },
  { name: "Линза обзора", icon: "◉", desc: "+1 к радиусу обзора, до максимума 9" },
  { name: "Радарный модуль", icon: "⌖", desc: "+2 шага от радара" },
  { name: "Ломосбор", icon: "⛭", desc: "+2 скрапа за каждый разрушенный блок" },
  { name: "Топлорециркулятор", icon: "♲", desc: "+1 топлива за каждый разрушенный блок, до +2" },
  { name: "Перегрузка", icon: "⚡", desc: "Переполнение топлива дает 3 сек форсажа, затем взрыв и оглушение" },
  { name: "Усиленный корпус", icon: "✚", desc: "+1 к максимуму HP и лечит на 2" },
  { name: "Перелив адреналина", icon: "❤", desc: "Overheal дает 3 секунды бафа, потом растет до максимума 7" },
  { name: "Контурный трофей", icon: "◈", desc: "Большой контур может создать случайный перк внутри" },
  { name: "Автоконтур", icon: "◎", desc: "-1 сек к задержке автозамыкания контура, до минимума 1" },
  { name: "Кристальный катализатор", icon: "✧", desc: "Кристаллы начинают давать scrap, потом fuel и HP" },
  { name: "Шиповой форсаж", icon: "✹", desc: "Разбитые шипы дают overdrive-баф на 5/7/10 секунд" },
  { name: "Термозаряд", icon: "☇", desc: "Усиливает урон и радиус взрыва от перегрева" },
  { name: "Терморасширение", icon: "☍", desc: "Скрыто: слито в Термозаряд" },
  { name: "Теплоотвод", icon: "⬢", desc: "Повышает предел нагрева до перегрева" },
  { name: "Накал бура", icon: "❉", desc: "Повышает урон бура в зависимости от нагрева" },
  { name: "Импульс остывания", icon: "⌁", desc: "В момент начала остывания дает шаги радара" },
  { name: "Разгонные демпферы", icon: "◍", desc: "Сокращают оглушение и ускоряют набор heat" },
  { name: "Контурный резонанс", icon: "⟲", desc: "+1% урона за каждую единицу длины контура до капа уровня" },
  { name: "Охлаждающие ракеты", icon: "❄", desc: "За каждые N остывшего heat выпускают ракету с малым радиусом на дистанцию 1-3" },
  { name: "Рекуперация контура", icon: "↺", desc: "Возврат по своему контуру дает топливо за шаг" },
  { name: "Терморакеты", icon: "☄", desc: "Перегрев выпускает ракеты с малым радиусом на дистанцию 1-3" },
  { name: "Усиленный бак", icon: "◌", desc: "Бак дает больше топлива, но растет расход в секунду" },
];

const TILE_PERK_WEIGHTS = [0, 7, 3, 2, 4, 3, 2, 2];
const CRYSTAL_TYPES = [
  null,
  { name: "Красный", color: "#ff4747", glow: "rgba(255,71,71,0.24)" },
  { name: "Желтый", color: "#ffd166", glow: "rgba(255,209,102,0.22)" },
  { name: "Светлый", color: "#f2ede2", glow: "rgba(242,237,226,0.24)" },
  { name: "Зеленый", color: "#73e58f", glow: "rgba(115,229,143,0.22)" },
  { name: "Синий", color: "#72b7ff", glow: "rgba(114,183,255,0.22)" },
];
const CRYSTAL_REWARD_TILE_PERKS = [0, 3, 1, 2, 6, 5];
const TILES_PER_CRYSTAL_TILE = 32;
const CRYSTAL_MIN_DISTANCE = 3;
const CRYSTAL_RECIPE_LENGTH = 3;
const CARDINAL_DIRS = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
];

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
  heat: 0,
  maxHeat: MAX_HEAT,
  heatExplosionDamageBonus: 0,
  heatExplosionRadiusBonus: 0,
  heatDamageBonus: 0,
  armor: 0,
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
  bonusPerkChoices: 0,
  perkRerolls: 0,
  manualModalOpen: false,
  debugPerkMenuOpen: false,
  debugPerkSelection: "",
  crystalRewardModalOpen: false,
  crystalRewardCloseReady: false,
  crystalRewardRevealStage: 0,
  crystalRewardAnimTimer: 0,
  crystalRewardShuffleTick: 0,
  crystalRewardPreviewPerks: [0, 0],
  crystalRewardPerks: [0, 0],
  nextScrapPerkAt: SCRAP_PERK_BASE_COST,
  scrapPerkLevel: 0,
  perkChoices: [],
  pathTiles: [],
  pathIndexByCell: new Int16Array(GRID_W * GRID_H),
  tunnelMask: new Uint8Array(GRID_W * GRID_H),
  perkMask: new Uint8Array(GRID_W * GRID_H),
  crystalMask: new Uint8Array(GRID_W * GRID_H),
  perkZoneMask: new Int16Array(GRID_W * GRID_H),
  perkZones: [],
  hardness: new Uint8Array(GRID_W * GRID_H),
  hazardMask: new Uint8Array(GRID_W * GRID_H),
  hazardTriggeredMask: new Uint8Array(GRID_W * GRID_H),
  metalMask: new Uint8Array(GRID_W * GRID_H),
  gasPocketMask: new Uint8Array(GRID_W * GRID_H),
  gasMask: new Uint8Array(GRID_W * GRID_H),
  gasClouds: [],
  steamPocketMask: new Uint8Array(GRID_W * GRID_H),
  steamMask: new Uint8Array(GRID_W * GRID_H),
  steamJets: [],
  boulderPocketMask: new Uint8Array(GRID_W * GRID_H),
  boulders: [],
  health: new Float32Array(GRID_W * GRID_H),
  loopScrapMask: new Float32Array(GRID_W * GRID_H),
  visibleMask: new Uint8Array(GRID_W * GRID_H),
  signalMovesLeft: 0,
  signalMovesMax: 0,
  signalPrevX: START_X,
  signalPrevY: START_Y,
  signalText: "Старт",
  perkText: "Нет",
  crystalRecipe: [],
  crystalCollected: [0, 0, 0, 0, 0, 0],
  crystalProgress: 0,
  crystalStatusText: "",
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
  overflowOverdriveTimer: 0,
  stunTimer: 0,
  stunDisplayDuration: 0,
  stunReduction: 0,
  heatGainBonus: 0,
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
  loopChargeLevel: 0,
  loopChargeTimer: 0,
  loopChargeDuration: 0,
  loopChargeDamageBonus: 0,
  contourLengthDamageLevel: 0,
  loopPerkLevel: 0,
  lowFuelSpeedBonus: 0,
  remoteBombLevel: 0,
  remoteBombInterval: 0,
  overhealOverdrive: false,
  overhealOverdriveDuration: 0,
  overhealDrillTimer: 0,
  overdriveDisplayDuration: 0,
  idleTime: 0,
  idleAutoCloseTriggered: false,
  idleAutoCloseDelay: IDLE_AUTO_CLOSE_DELAY,
  crystalCatalystLevel: 0,
  spikeOverdriveLevel: 0,
  struckThisFrame: false,
  drillIdleFrame: false,
  heatCooldownTime: 0,
  heatCoolingRewardLevel: 0,
  heatCoolingRewardArmed: false,
  heatCoolingPeak: 0,
  coolingRocketLevel: 0,
  coolingRocketCharge: 0,
  contourReturnFuelLevel: 0,
  heatOverloadRocketLevel: 0,
  tankBoostLevel: 0,
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
  fatalErrorText: "",
  scrapHitRect: null,
  sprites: null,
  effects: [],
  tileAnimations: [],
  chainExplosions: [],
  base: {
    x: 0,
    y: 0,
    visible: false,
    renderX: 0,
    renderY: 0,
    animFromX: 0,
    animFromY: 0,
    animToX: 0,
    animToY: 0,
    animTimer: 0,
    animDuration: 0,
  },
  camera: {
    x: 0,
    y: 0,
  },
  cameraShake: {
    time: 0,
    amplitude: 0,
  },
  drill: {
    x: START_X,
    y: START_Y,
    renderX: START_X,
    renderY: START_Y,
    animFromX: START_X,
    animFromY: START_Y,
    animToX: START_X,
    animToY: START_Y,
    animTimer: 0,
    animDuration: 0,
    px: 0,
    py: 0,
    facingX: 0,
    facingY: 1,
    progress: 0,
    rate: 24,
    strikePhase: 0,
    strikeEnergy: 0,
    strikeLatch: false,
    actionCooldown: 0,
  },
};

function cellIndex(x, y) {
  return y * GRID_W + x;
}

function isInStartEasyRadius(x, y) {
  return Math.hypot(x - START_X, y - START_Y) <= START_EASY_RADIUS;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
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

function createMetalSprite() {
  const canvas = makeSpriteCanvas();
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, TILE_SIZE, TILE_SIZE);
  gradient.addColorStop(0, "#d7dde0");
  gradient.addColorStop(0.3, "#8f9ca4");
  gradient.addColorStop(0.7, "#5c6971");
  gradient.addColorStop(1, "#2f3940");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);

  ctx.strokeStyle = "rgba(255,255,255,0.28)";
  ctx.lineWidth = 1.2;
  for (let i = -1; i < 4; i += 1) {
    const offset = i * 10;
    ctx.beginPath();
    ctx.moveTo(offset, 0);
    ctx.lineTo(offset + 16, TILE_SIZE);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(25, 32, 38, 0.46)";
  fillRoundRect(ctx, 4, 4, TILE_SIZE - 8, TILE_SIZE - 8, 5);
  ctx.strokeStyle = "rgba(214, 225, 233, 0.38)";
  ctx.lineWidth = 1;
  ctx.strokeRect(4.5, 4.5, TILE_SIZE - 9, TILE_SIZE - 9);

  ctx.fillStyle = "#ced6db";
  for (const [x, y] of [
    [8, 8],
    [TILE_SIZE - 8, 8],
    [8, TILE_SIZE - 8],
    [TILE_SIZE - 8, TILE_SIZE - 8],
  ]) {
    ctx.beginPath();
    ctx.arc(x, y, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.beginPath();
  ctx.moveTo(7, TILE_SIZE * 0.3);
  ctx.lineTo(TILE_SIZE - 7, TILE_SIZE * 0.3);
  ctx.moveTo(7, TILE_SIZE * 0.7);
  ctx.lineTo(TILE_SIZE - 7, TILE_SIZE * 0.7);
  ctx.stroke();

  return canvas;
}

function createDrillFrame(frame) {
  const canvas = makeSpriteCanvas();
  const ctx = canvas.getContext("2d");
  const bodyGrad = ctx.createLinearGradient(0, 0, TILE_SIZE, TILE_SIZE);
  bodyGrad.addColorStop(0, "#f3c57b");
  bodyGrad.addColorStop(1, "#8a5128");

  ctx.fillStyle = "#4a2b1a";
  fillRoundRect(ctx, 5, 9, TILE_SIZE - 10, TILE_SIZE - 14, 8);
  ctx.fillStyle = bodyGrad;
  fillRoundRect(ctx, 9, 11, TILE_SIZE - 18, TILE_SIZE - 18, 7);
  ctx.fillStyle = "#362218";
  fillRoundRect(ctx, 12, 5, TILE_SIZE - 24, 11, 5);
  ctx.fillStyle = "rgba(255, 241, 205, 0.22)";
  fillRoundRect(ctx, 12, 15, TILE_SIZE - 24, 4, 2);
  ctx.strokeStyle = "rgba(255, 236, 205, 0.25)";
  ctx.strokeRect(10.5, 12.5, TILE_SIZE - 21, TILE_SIZE - 21);

  const pistonShift = [-1, 1, 2, 0][frame % 4];
  ctx.fillStyle = "#6c4325";
  fillRoundRect(ctx, TILE_SIZE - 14 + pistonShift, 11, 6, 16, 3);
  ctx.fillStyle = "#4f311f";
  fillRoundRect(ctx, 4, TILE_SIZE * 0.46, 8, 6, 2);
  fillRoundRect(ctx, TILE_SIZE - 12, TILE_SIZE * 0.46, 8, 6, 2);

  ctx.fillStyle = "#5c3116";
  fillRoundRect(ctx, 8, 25, 8, 5, 2);
  fillRoundRect(ctx, TILE_SIZE - 16, 25, 8, 5, 2);
  ctx.fillStyle = "#2d1a12";
  fillRoundRect(ctx, 9, 29, 6, 3, 1);
  fillRoundRect(ctx, TILE_SIZE - 15, 29, 6, 3, 1);

  const windowGlow = 0.18 + ((frame + 1) % 2) * 0.12;
  ctx.fillStyle = `rgba(255, 246, 219, ${windowGlow})`;
  fillRoundRect(ctx, 13, 8, TILE_SIZE - 26, 5, 2);

  return canvas;
}

function createBaseFrame(frame) {
  const canvas = makeSpriteCanvas();
  const ctx = canvas.getContext("2d");
  const shell = ctx.createLinearGradient(0, 0, TILE_SIZE, TILE_SIZE);
  shell.addColorStop(0, "#f0c785");
  shell.addColorStop(1, "#9b6233");

  ctx.fillStyle = "rgba(105, 210, 255, 0.12)";
  ctx.beginPath();
  ctx.arc(TILE_SIZE * 0.5, TILE_SIZE * 0.5, TILE_SIZE * 0.68, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2b1b14";
  fillRoundRect(ctx, 5, 5, TILE_SIZE - 10, TILE_SIZE - 10, 7);
  ctx.fillStyle = shell;
  fillRoundRect(ctx, 8, 8, TILE_SIZE - 16, TILE_SIZE - 16, 6);
  ctx.fillStyle = "#6c4120";
  fillRoundRect(ctx, 15, 12, TILE_SIZE - 30, TILE_SIZE - 20, 4);
  ctx.fillStyle = `rgba(255, 239, 194, ${0.26 + ((frame + 1) % 3) * 0.08})`;
  fillRoundRect(ctx, 11, 11, TILE_SIZE - 22, 7, 4);
  ctx.strokeStyle = "rgba(255, 238, 214, 0.45)";
  ctx.strokeRect(10.5, 10.5, TILE_SIZE - 21, TILE_SIZE - 21);

  const antennaLift = [-1, 1, 0, 2][frame % 4];
  ctx.strokeStyle = "#d8eefd";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(TILE_SIZE * 0.5, 10);
  ctx.lineTo(TILE_SIZE * 0.5, 3 + antennaLift);
  ctx.stroke();
  ctx.fillStyle = "#8fe7ff";
  ctx.beginPath();
  ctx.arc(TILE_SIZE * 0.5, 3 + antennaLift, 2.2, 0, Math.PI * 2);
  ctx.fill();

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
    metal: createMetalSprite(),
    drillFrames: [createDrillFrame(0), createDrillFrame(1), createDrillFrame(2), createDrillFrame(3)],
    baseFrames: [createBaseFrame(0), createBaseFrame(1), createBaseFrame(2), createBaseFrame(3)],
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

function spawnDamageNumberEffect(x, y, value) {
  if (value <= 0) {
    return;
  }

  state.effects.push({
    kind: "damageNumber",
    x,
    y,
    value,
    time: 0.55,
    duration: 0.55,
    seed: (x * 1877 + y * 3541 + Math.round(value * 10)) % 1000,
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

function getIdleFuelDrain() {
  const baseDrain = IDLE_FUEL_DRAIN + Math.floor(state.scrapPerkLevel / 3);
  const tankPenalty = state.tankBoostLevel > 0 ? Math.max(1, baseDrain * 0.1) * state.tankBoostLevel : 0;
  return baseDrain + tankPenalty;
}

function getTankFuelMultiplier(level = state.tankBoostLevel) {
  if (level <= 0) {
    return 1;
  }
  if (level === 1) {
    return 1.5;
  }
  if (level === 2) {
    return 1.75;
  }
  return 2;
}

function getTankFuelDelta() {
  return Math.round(120 * getTankFuelMultiplier()) - state.perkFuelBonus;
}

function getTargetPerkTileCount() {
  return Math.max(1, Math.round((GRID_W * GRID_H) / TILES_PER_PERK_TILE));
}

function getTargetPerkZoneCount() {
  return Math.max(1, Math.round((GRID_W * GRID_H) / TILES_PER_PERK_ZONE));
}

function getTargetCrystalTileCount() {
  return Math.max(4, Math.round((GRID_W * GRID_H) / TILES_PER_CRYSTAL_TILE));
}

function getCenterDistanceRatio(x, y) {
  return clamp(Math.hypot(x - START_X, y - START_Y) / BASE_MIN_DISTANCE, 0, 1.8);
}

function getCenterPerkDensity(x, y) {
  const ratio = getCenterDistanceRatio(x, y);
  return clamp(0.72 + ratio * 0.42, 0.5, 1.45);
}

function getPerkZoneDensity(x, y) {
  const ratio = getCenterDistanceRatio(x, y);
  return clamp(0.6 + ratio * 0.5, 0.45, 1.5);
}

function chooseTilePerkForPosition(x, y, random = Math.random) {
  const ratio = clamp(getCenterDistanceRatio(x, y), 0, 1.2);
  const farBias = ratio;
  const centerBias = 1.2 - ratio;
  const weights = TILE_PERK_WEIGHTS.slice();
  weights[2] += Math.round(farBias * 7);
  weights[3] += Math.round(centerBias * 5);
  weights[5] += Math.round(centerBias * 4);
  return chooseWeightedPerk(weights, random);
}

function chooseCrystalType(random = Math.random) {
  return 1 + Math.floor(random() * 5);
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
  return x >= 1 && y >= 1 && x < GRID_W - 1 && y < GRID_H - 1 && !(x === START_X && y === START_Y) && !isInStartEasyRadius(x, y);
}

function canPlaceMetalAt(x, y) {
  return x >= 1 && y >= 1 && x < GRID_W - 1 && y < GRID_H - 1 && !(x === START_X && y === START_Y) && !isInStartEasyRadius(x, y);
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

function placeMetalVein(random, blockCount) {
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
      state.metalMask[index] = 1;
      state.hazardMask[index] = 0;
      state.gasPocketMask[index] = 0;
      state.steamPocketMask[index] = 0;
      state.boulderPocketMask[index] = 0;
      placed += 1;
    }
    angle += (random() - 0.5) * 0.55;
    x = clamp(x + Math.cos(angle) * 1.05, 1, GRID_W - 2);
    y = clamp(y + Math.sin(angle) * 1.05, 1, GRID_H - 2);
  }
}

function canPlaceGasPocketAt(x, y) {
  return x >= 2 && y >= 2 && x < GRID_W - 2 && y < GRID_H - 2 && !(x === START_X && y === START_Y) && !isInStartEasyRadius(x, y);
}

function canPlaceSteamPocketAt(x, y) {
  return x >= 2 && y >= 2 && x < GRID_W - 2 && y < GRID_H - 2 && !(x === START_X && y === START_Y) && !isInStartEasyRadius(x, y);
}

function canPlaceBoulderPocketAt(x, y) {
  return x >= 2 && y >= 2 && x < GRID_W - 2 && y < GRID_H - 2 && !(x === START_X && y === START_Y) && !isInStartEasyRadius(x, y);
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
  for (let y = 1; y < GRID_H - 1; y += 1) {
    if (state.boulderPocketMask[cellIndex(origin.x, y)]) {
      return;
    }
  }
  for (let x = 1; x < GRID_W - 1; x += 1) {
    if (state.boulderPocketMask[cellIndex(x, origin.y)]) {
      return;
    }
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

  addSteamCells(released, 1);
  applySteamContactDamage();
  const jet = {
    origins: released,
    dirX,
    dirY,
    timer: STEAM_RELEASE_DELAY,
    released: false,
    lifetime: STEAM_LIFETIME,
    cells: released.slice(),
  };
  state.steamJets.push(jet);
}

function generateHardnessMap(random) {
  const danger = new Float32Array(GRID_W * GRID_H);

  for (let y = 0; y < GRID_H; y += 1) {
    for (let x = 0; x < GRID_W; x += 1) {
      const distanceRatio = clamp(Math.hypot(x - START_X, y - START_Y) / 95, 0, 1);
      danger[cellIndex(x, y)] = 1 + distanceRatio * 4.9;
    }
  }

  const area = GRID_W * GRID_H;
  const blobCount = Math.max(24, Math.round(area / 1200));
  for (let i = 0; i < blobCount; i += 1) {
    addDangerBlob(
      danger,
      2 + random() * (GRID_W - 4),
      2 + random() * (GRID_H - 4),
      10 + random() * 24,
      -1.6 + random() * 3.2,
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
      const microNoise = (((x * 17 + y * 31) % 13) - 6) * 0.16;
      state.hardness[index] = clamp(Math.round(danger[index] + microNoise), 1, 7);
      if (isInStartEasyRadius(x, y)) {
        state.hardness[index] = 1;
      }
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
  for (let i = 0; i < METAL_VEIN_GROUPS; i += 1) {
    placeMetalVein(random, 12 + Math.floor(random() * 22));
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
  state.crystalMask.fill(0);
  state.perkZoneMask.fill(-1);
  state.gasMask.fill(0);
  state.steamMask.fill(0);
  state.loopScrapMask.fill(0);
  state.hazardTriggeredMask.fill(0);
  state.metalMask.fill(0);
  state.visibleMask.fill(0);
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
  state.heat = 0;
  state.maxHeat = MAX_HEAT;
  state.heatExplosionDamageBonus = 0;
  state.heatExplosionRadiusBonus = 0;
  state.heatDamageBonus = 0;
  state.armor = 0;
  state.scrap = 0;
  state.depth = 0;
  state.signalText = "Старт";
  state.perkText = "Нет";
  state.crystalRecipe = [];
  state.crystalCollected = [0, 0, 0, 0, 0, 0];
  state.crystalProgress = 0;
  state.crystalStatusText = "";
  state.isChoosingPerk = false;
  state.pendingPerkChoice = false;
  state.pendingPerkDelay = 0;
  state.bonusPerkChoices = 0;
  state.perkRerolls = 0;
  state.manualModalOpen = false;
  state.debugPerkMenuOpen = false;
  state.debugPerkSelection = "";
  state.crystalRewardModalOpen = false;
  state.crystalRewardCloseReady = false;
  state.crystalRewardRevealStage = 0;
  state.crystalRewardAnimTimer = 0;
  state.crystalRewardShuffleTick = 0;
  state.crystalRewardPreviewPerks = [0, 0];
  state.crystalRewardPerks = [0, 0];
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
  state.overflowOverdriveTimer = 0;
  state.stunTimer = 0;
  state.stunDisplayDuration = 0;
  state.stunReduction = 0;
  state.heatGainBonus = 0;
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
  state.loopChargeLevel = 0;
  state.loopChargeTimer = 0;
  state.loopChargeDuration = 0;
  state.loopChargeDamageBonus = 0;
  state.contourLengthDamageLevel = 0;
  state.loopPerkLevel = 0;
  state.lowFuelSpeedBonus = 0;
  state.remoteBombLevel = 0;
  state.remoteBombInterval = 0;
  state.overhealOverdrive = false;
  state.overhealOverdriveDuration = 0;
  state.overhealDrillTimer = 0;
  state.overdriveDisplayDuration = 0;
  state.idleTime = 0;
  state.idleAutoCloseTriggered = false;
  state.idleAutoCloseDelay = IDLE_AUTO_CLOSE_DELAY;
  state.crystalCatalystLevel = 0;
  state.spikeOverdriveLevel = 0;
  state.struckThisFrame = false;
  state.drillIdleFrame = false;
  state.heatCooldownTime = 0;
  state.heatCoolingRewardLevel = 0;
  state.heatCoolingRewardArmed = false;
  state.heatCoolingPeak = 0;
  state.coolingRocketLevel = 0;
  state.coolingRocketCharge = 0;
  state.contourReturnFuelLevel = 0;
  state.heatOverloadRocketLevel = 0;
  state.tankBoostLevel = 0;
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
  state.scrapHitRect = null;
  state.effects.length = 0;
  state.tileAnimations.length = 0;
  state.chainExplosions.length = 0;
  state.base.renderX = 0;
  state.base.renderY = 0;
  state.base.animFromX = 0;
  state.base.animFromY = 0;
  state.base.animToX = 0;
  state.base.animToY = 0;
  state.base.animTimer = 0;
  state.base.animDuration = 0;
  state.drill.renderX = state.drill.x;
  state.drill.renderY = state.drill.y;
  state.drill.animFromX = state.drill.x;
  state.drill.animFromY = state.drill.y;
  state.drill.animToX = state.drill.x;
  state.drill.animToY = state.drill.y;
  state.drill.animTimer = 0;
  state.drill.animDuration = 0;
  state.drill.strikePhase = 0;
  state.drill.strikeEnergy = 0;
  state.drill.strikeLatch = false;
  state.drill.actionCooldown = 0;
  state.worldSeed = newWorldSeed();
  state.worldRandom = mulberry32(state.worldSeed);

  generateHardnessMap(state.worldRandom);

  state.pathTiles.length = 0;
  carveTunnel(state.drill.x, state.drill.y);
  extendPath(state.drill.x, state.drill.y);

  placeHiddenBase();
  state.base.renderX = state.base.x;
  state.base.renderY = state.base.y;
  state.base.animFromX = state.base.x;
  state.base.animFromY = state.base.y;
  state.base.animToX = state.base.x;
  state.base.animToY = state.base.y;
  state.camera.x = state.drill.x * TILE_SIZE - state.width * 0.5;
  state.camera.y = state.drill.y * TILE_SIZE - state.height * 0.56;
  placePerkTiles();
  placeCrystalTiles();
  placePerkZones();
  // placeDebugStartPerkZone();
  clearCrystalRecipe();
  rebuildVisibilityMask();
  syncDebugPerkOverlay();
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
      !state.metalMask[cellIndex(x, y)] &&
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

    if (state.tunnelMask[index] || state.perkMask[index] > 0 || state.metalMask[index]) {
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

function placeCrystalTiles() {
  const placed = [];
  const targetCount = getTargetCrystalTileCount();
  let attempts = 0;

  while (placed.length < targetCount && attempts < targetCount * 90) {
    const x = 2 + Math.floor(state.worldRandom() * (GRID_W - 4));
    const y = 2 + Math.floor(state.worldRandom() * (GRID_H - 4));
    const index = cellIndex(x, y);
    attempts += 1;

    if (
      state.tunnelMask[index] ||
      state.perkMask[index] > 0 ||
      state.crystalMask[index] > 0 ||
      state.perkZoneMask[index] !== -1 ||
      state.metalMask[index] ||
      state.gasPocketMask[index] ||
      state.steamPocketMask[index] ||
      state.boulderPocketMask[index]
    ) {
      continue;
    }
    if ((x === state.base.x && y === state.base.y) || (x === START_X && y === START_Y)) {
      continue;
    }
    if (!isFarEnoughFromPlaced(x, y, placed, CRYSTAL_MIN_DISTANCE)) {
      continue;
    }

    state.crystalMask[index] = chooseCrystalType(state.worldRandom);
    placed.push({ x, y });
  }
}

function placePerkZones() {
  const placed = [];
  const targetCount = getTargetPerkZoneCount();
  let attempts = 0;

  while (state.perkZones.length < targetCount && attempts < targetCount * 120) {
    const shape = createPerkZoneShape(state.worldRandom);
    const originX = 1 + Math.floor(state.worldRandom() * Math.max(1, GRID_W - shape.width - 2));
    const originY = 1 + Math.floor(state.worldRandom() * Math.max(1, GRID_H - shape.height - 2));
    attempts += 1;

    const centerX = originX + shape.centerX;
    const centerY = originY + shape.centerY;

    if (!isFarEnoughFromPlaced(centerX, centerY, placed, PERK_ZONE_MIN_DISTANCE)) {
      continue;
    }
    if (state.worldRandom() > getPerkZoneDensity(centerX, centerY)) {
      continue;
    }

    let blocked = false;
    const cells = [];
    for (let i = 0; i < shape.cells.length; i += 1) {
      const cell = shape.cells[i];
      const x = originX + cell.x;
      const y = originY + cell.y;
      const index = cellIndex(x, y);
      if (
        (x === START_X && y === START_Y) ||
        (x === state.base.x && y === state.base.y) ||
        state.tunnelMask[index] ||
        state.metalMask[index] ||
        state.perkZoneMask[index] !== -1 ||
        state.gasPocketMask[index] ||
        state.steamPocketMask[index] ||
        state.boulderPocketMask[index]
      ) {
        blocked = true;
        break;
      }
      cells.push({ x, y });
    }
    if (blocked) {
      continue;
    }

    const zoneId = state.perkZones.length;
    const perkType = chooseTilePerkForPosition(centerX, centerY, state.worldRandom);
    state.perkZones.push({
      x: centerX,
      y: centerY,
      cells,
      iconX: originX + shape.iconX,
      iconY: originY + shape.iconY,
      perkType,
      openedCount: 0,
      openedMask: 0,
      arming: false,
      armingTimer: 0,
      collected: false,
    });
    placed.push({ x: centerX, y: centerY });

    for (let i = 0; i < cells.length; i += 1) {
      state.perkZoneMask[cellIndex(cells[i].x, cells[i].y)] = zoneId;
    }
  }
}

function placeDebugStartPerkZone() {
  const cells = [
    { x: START_X, y: START_Y },
    { x: START_X - 1, y: START_Y },
    { x: START_X + 1, y: START_Y },
    { x: START_X, y: START_Y - 1 },
    { x: START_X, y: START_Y + 1 },
  ];
  const zoneId = state.perkZones.length;
  const perkType = chooseTilePerkForPosition(START_X, START_Y, state.worldRandom);
  let openedMask = 0;
  let openedCount = 0;

  for (let i = 0; i < cells.length; i += 1) {
    const cell = cells[i];
    const index = cellIndex(cell.x, cell.y);
    state.perkZoneMask[index] = zoneId;
    state.perkMask[index] = 0;
    state.crystalMask[index] = 0;
    if (state.tunnelMask[index]) {
      openedMask |= 1 << i;
      openedCount += 1;
    }
  }

  state.perkZones.push({
    x: START_X,
    y: START_Y,
    cells,
    iconX: START_X,
    iconY: START_Y,
    perkType,
    openedCount,
    openedMask,
    arming: false,
    armingTimer: 0,
    collected: false,
  });
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

function clearCrystalRecipe() {
  state.crystalRecipe = [];
  state.crystalCollected = [0, 0, 0, 0, 0, 0];
  state.crystalProgress = 0;
  state.crystalStatusText = "";
}

function startCrystalRecipe(firstCrystalType) {
  state.crystalRecipe = [firstCrystalType];
  for (let i = 1; i < CRYSTAL_RECIPE_LENGTH; i += 1) {
    state.crystalRecipe.push(chooseCrystalType(state.worldRandom));
  }
  state.crystalCollected = [0, 0, 0, 0, 0, 0];
  state.crystalCollected[firstCrystalType] = 1;
  state.crystalProgress = 1;
  state.crystalStatusText = `${CRYSTAL_TYPES[firstCrystalType].name}: 1/${state.crystalRecipe.length}`;
}

function awardBonusScrapPerkChoice() {
  if (state.isChoosingPerk || state.pendingPerkChoice) {
    state.bonusPerkChoices += 1;
    return;
  }
  if (!prepareScrapPerkChoices()) {
    return;
  }
  state.isChoosingPerk = true;
  syncPerkChoiceOverlay();
}

function grantCrystalRecipeReward(firstCrystalType, x, y) {
  const firstPerkType = CRYSTAL_REWARD_TILE_PERKS[firstCrystalType] || 1;
  const secondPerkType = getRandomTilePerkExcluding([firstPerkType]);
  state.perkRerolls += 1;
  runFuelEvent(() => {
    applyTilePerk(firstPerkType, x, y, false);
    applyTilePerk(secondPerkType, x, y, false);
  });
  openCrystalRewardModal(firstPerkType, secondPerkType);
}

function applyCrystalCatalystBonus(x, y) {
  if (state.crystalCatalystLevel <= 0) {
    return;
  }

  state.scrap += 30;
  showScrapToast(30);

  if (state.crystalCatalystLevel >= 2) {
    addFuel(40, x, y);
  }
  if (state.crystalCatalystLevel >= 3) {
    healPlayer(1, "Кристальный катализатор");
  }
}

function collectCrystalTile(x, y, index, crystalType) {
  state.crystalMask[index] = 0;
  runFuelEvent(() => applyCrystalCatalystBonus(x, y));
  if (state.crystalRecipe.length === 0) {
    startCrystalRecipe(crystalType);
    showPerkToast(state.crystalStatusText);
    return;
  }

  let recipeCount = 0;
  for (let i = 0; i < state.crystalRecipe.length; i += 1) {
    if (state.crystalRecipe[i] === crystalType) {
      recipeCount += 1;
    }
  }

  if (recipeCount > 0 && state.crystalCollected[crystalType] < recipeCount) {
    state.crystalCollected[crystalType] += 1;
    state.crystalProgress += 1;
    state.crystalStatusText = `${CRYSTAL_TYPES[crystalType].name}: ${state.crystalProgress}/${state.crystalRecipe.length}`;
    showPerkToast(state.crystalStatusText);
    if (state.crystalProgress >= state.crystalRecipe.length) {
      const firstCrystalType = state.crystalRecipe[0];
      showPerkToast("Кристаллы собраны");
      clearCrystalRecipe();
      grantCrystalRecipeReward(firstCrystalType, x, y);
    }
    return;
  }

  showPerkToast("Рецепт сорван");
  clearCrystalRecipe();
}

function getDistanceToBase(x, y) {
  return Math.hypot(state.base.x - x, state.base.y - y);
}

function carveTunnel(x, y) {
  const index = cellIndex(x, y);
  const perkType = state.perkMask[index];
  const crystalType = state.crystalMask[index];
  const zoneId = state.perkZoneMask[index];
  if (!state.tunnelMask[index]) {
    state.tunnelMask[index] = 1;
    state.hardness[index] = 0;
    state.health[index] = 0;
  }

  if (perkType > 0) {
    collectPerkTile(x, y, index, perkType);
  }

  if (crystalType > 0) {
    collectCrystalTile(x, y, index, crystalType);
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
  if (!zone || zone.collected || zone.arming) {
    return;
  }

  let cellOrder = -1;
  for (let i = 0; i < zone.cells.length; i += 1) {
    if (zone.cells[i].x === x && zone.cells[i].y === y) {
      cellOrder = i;
      break;
    }
  }
  if (cellOrder === -1) {
    return;
  }

  const bit = 1 << cellOrder;
  if (zone.openedMask & bit) {
    return;
  }

  zone.openedMask |= bit;
  zone.openedCount += 1;
  if (zone.openedCount === zone.cells.length) {
    zone.arming = true;
    zone.armingTimer = PERK_ZONE_CHARGE_DELAY;
  }
}

function collectPerkZone(zone) {
  zone.arming = false;
  zone.armingTimer = 0;
  zone.collected = true;
  state.perkText = `${TILE_PERK_TYPES[zone.perkType].name} x3`;
  showPerkToast(state.perkText);

  if (zone.perkType === 4) {
    explodeAt(zone.x, zone.y, state.drillPower * 10, 6);
    return;
  }

  runFuelEvent(() => {
    for (let i = 0; i < 3; i += 1) {
      applyTilePerk(zone.perkType, zone.x, zone.y, false);
    }
  });
}

function updatePerkZones(dt) {
  for (let i = 0; i < state.perkZones.length; i += 1) {
    const zone = state.perkZones[i];
    if (!zone || zone.collected || !zone.arming) {
      continue;
    }
    zone.armingTimer = Math.max(0, zone.armingTimer - dt);
    if (zone.armingTimer === 0) {
      collectPerkZone(zone);
    }
  }
}

function applyTilePerk(perkType, x, y, showToast = true) {
  switch (perkType) {
    case 1: {
      const fuelDelta = getTankFuelDelta();
      if (fuelDelta >= 0) {
        addFuel(fuelDelta, x, y);
      } else {
        state.fuel = Math.max(0, state.fuel + fuelDelta);
        showFuelToast(fuelDelta);
      }
      state.perkText = "Бак";
      break;
    }
    case 2:
      state.signalMovesLeft += RADAR_BASE_CHARGES + state.radarBonus;
      state.signalMovesMax = Math.max(state.signalMovesMax, state.signalMovesLeft);
      state.perkText = `Радар: ${consumeSignalMove(state.signalPrevX, state.signalPrevY, x, y)}`;
      break;
    case 3:
      state.drillPower += 0.35;
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
      healPlayer(1, "HP+");
      state.perkText = "HP+";
      break;
    case 7:
      state.armor += 1;
      state.perkText = "Броня";
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
      state.loopChargeLevel = Math.min(4, state.loopChargeLevel + 1);
      state.loopChargeDuration = 2 + state.loopChargeLevel;
      state.perkText = "Контурный заряд";
      break;
    case 6:
      state.lowFuelSpeedBonus += 0.35;
      state.perkText = "Форсаж на нуле";
      break;
    case 7:
      state.remoteBombLevel += 1;
      state.remoteBombInterval = Math.max(15, state.remoteBombInterval > 0 ? state.remoteBombInterval - 5 : 30);
      state.perkText = "Саперный заряд";
      break;
    case 8:
      state.perkFuelBonus += 50;
      state.perkText = "Топливный контур";
      break;
    case 9:
      state.visionRadius = Math.min(9, state.visionRadius + 1);
      state.perkText = "Линза обзора";
      break;
    case 10:
      state.radarBonus += 2;
      state.perkText = "Радарный модуль";
      break;
    case 11:
      state.scrapBonus += 2;
      state.perkText = "Ломосбор";
      break;
    case 12:
      state.fuelOnBreak = Math.min(2, state.fuelOnBreak + 1);
      state.perkText = "Топлорециркулятор";
      break;
    case 13:
      state.overflowBomb = true;
      state.fuelPickupBonus += 50;
      state.maxFuel = Math.max(100, state.maxFuel - 150);
      state.fuel = Math.min(state.fuel, state.maxFuel);
      state.perkText = "Перегрузка";
      break;
    case 14:
      state.maxHp += 1;
      healPlayer(2, "Усиленный корпус");
      state.perkText = "Усиленный корпус";
      break;
    case 15:
      state.overhealOverdrive = true;
      state.overhealOverdriveDuration = Math.min(7, state.overhealOverdriveDuration > 0 ? state.overhealOverdriveDuration + 1 : 3);
      state.perkText = "Перелив адреналина";
      break;
    case 16:
      state.loopPerkLevel = Math.min(2, state.loopPerkLevel + 1);
      state.perkText = "Контурный трофей";
      break;
    case 17:
      state.idleAutoCloseDelay = Math.max(IDLE_AUTO_CLOSE_MIN_DELAY, state.idleAutoCloseDelay - 1);
      state.perkText = "Автоконтур";
      break;
    case 18:
      state.crystalCatalystLevel = Math.min(3, state.crystalCatalystLevel + 1);
      state.perkText = "Кристальный катализатор";
      break;
    case 19:
      state.spikeOverdriveLevel = Math.min(3, state.spikeOverdriveLevel + 1);
      state.perkText = "Шиповой форсаж";
      break;
    case 20:
      state.heatExplosionDamageBonus += 1;
      state.heatExplosionRadiusBonus += 0.5;
      state.perkText = "Термозаряд";
      break;
    case 21:
      break;
    case 22:
      state.maxHeat += 20;
      state.perkText = "Теплоотвод";
      break;
    case 23:
      state.heatDamageBonus += 0.2;
      state.perkText = "Накал бура";
      break;
    case 24:
      state.heatCoolingRewardLevel += 1;
      state.perkText = "Импульс остывания";
      break;
    case 25:
      state.stunReduction += 0.4;
      state.heatGainBonus += 1;
      state.perkText = "Разгонные демпферы";
      break;
    case 26:
      state.contourLengthDamageLevel = Math.min(4, state.contourLengthDamageLevel + 1);
      state.perkText = "Контурный резонанс";
      break;
    case 27:
      state.coolingRocketLevel = Math.min(3, state.coolingRocketLevel + 1);
      state.perkText = "Охлаждающие ракеты";
      break;
    case 28:
      state.contourReturnFuelLevel = Math.min(3, state.contourReturnFuelLevel + 1);
      state.perkText = "Рекуперация контура";
      break;
    case 29:
      state.heatOverloadRocketLevel = Math.min(3, state.heatOverloadRocketLevel + 1);
      state.perkText = "Терморакеты";
      break;
    case 30:
      state.tankBoostLevel = Math.min(3, state.tankBoostLevel + 1);
      state.perkText = "Усиленный бак";
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

function getAnimatedPosition(renderX, renderY, animFromX, animFromY, animToX, animToY, animTimer, animDuration) {
  if (animTimer <= 0 || animDuration <= 0) {
    return { x: renderX, y: renderY };
  }
  const t = easeOutCubic(clamp(1 - animTimer / animDuration, 0, 1));
  return {
    x: animFromX + (animToX - animFromX) * t,
    y: animFromY + (animToY - animFromY) * t,
  };
}

function getCurrentDrillRenderPosition() {
  return getAnimatedPosition(
    state.drill.renderX,
    state.drill.renderY,
    state.drill.animFromX,
    state.drill.animFromY,
    state.drill.animToX,
    state.drill.animToY,
    state.drill.animTimer,
    state.drill.animDuration,
  );
}

function getCurrentBaseRenderPosition() {
  return getAnimatedPosition(
    state.base.renderX,
    state.base.renderY,
    state.base.animFromX,
    state.base.animFromY,
    state.base.animToX,
    state.base.animToY,
    state.base.animTimer,
    state.base.animDuration,
  );
}

function startDrillMoveAnimation(toX, toY, duration = MOVE_ANIMATION_DURATION) {
  const current = getCurrentDrillRenderPosition();
  state.drill.renderX = current.x;
  state.drill.renderY = current.y;
  state.drill.animFromX = current.x;
  state.drill.animFromY = current.y;
  state.drill.animToX = toX;
  state.drill.animToY = toY;
  state.drill.animTimer = duration;
  state.drill.animDuration = duration;
}

function startBaseMoveAnimation(toX, toY, duration = BASE_MOVE_ANIMATION_DURATION) {
  const current = getCurrentBaseRenderPosition();
  state.base.renderX = current.x;
  state.base.renderY = current.y;
  state.base.animFromX = current.x;
  state.base.animFromY = current.y;
  state.base.animToX = toX;
  state.base.animToY = toY;
  state.base.animTimer = duration;
  state.base.animDuration = duration;
}

function captureCellVisualData(index) {
  return {
    tunnel: state.tunnelMask[index],
    hardness: state.hardness[index],
    perk: state.perkMask[index],
    crystal: state.crystalMask[index],
    hazard: state.hazardMask[index],
    metal: state.metalMask[index],
    gasPocket: state.gasPocketMask[index],
    steamPocket: state.steamPocketMask[index],
    boulderPocket: state.boulderPocketMask[index],
    gas: state.gasMask[index],
    steam: state.steamMask[index],
  };
}

function hasCellVisualData(content) {
  return (
    content &&
    (content.tunnel ||
      content.hardness ||
      content.perk ||
      content.crystal ||
      content.hazard ||
      content.metal ||
      content.gasPocket ||
      content.steamPocket ||
      content.boulderPocket ||
      content.gas ||
      content.steam)
  );
}

function startTileMoveAnimation(content, fromX, fromY, toX, toY, duration = TILE_SWAP_ANIMATION_DURATION) {
  if (!hasCellVisualData(content)) {
    return;
  }
  state.tileAnimations.push({
    content,
    fromX,
    fromY,
    toX,
    toY,
    renderX: fromX,
    renderY: fromY,
    timer: duration,
    duration,
  });
}

function rebuildPathIndex() {
  state.pathIndexByCell.fill(-1);
  for (let i = 0; i < state.pathTiles.length; i += 1) {
    const tile = state.pathTiles[i];
    state.pathIndexByCell[cellIndex(tile.x, tile.y)] = i;
  }
}

function updateMovementAnimations(dt) {
  if (state.drill.animTimer > 0 && state.drill.animDuration > 0) {
    state.drill.animTimer = Math.max(0, state.drill.animTimer - dt);
    const current = getCurrentDrillRenderPosition();
    state.drill.renderX = current.x;
    state.drill.renderY = current.y;
    if (state.drill.animTimer === 0) {
      state.drill.renderX = state.drill.animToX;
      state.drill.renderY = state.drill.animToY;
    }
  } else {
    state.drill.renderX = state.drill.x;
    state.drill.renderY = state.drill.y;
  }

  if (state.base.animTimer > 0 && state.base.animDuration > 0) {
    state.base.animTimer = Math.max(0, state.base.animTimer - dt);
    const current = getCurrentBaseRenderPosition();
    state.base.renderX = current.x;
    state.base.renderY = current.y;
    if (state.base.animTimer === 0) {
      state.base.renderX = state.base.animToX;
      state.base.renderY = state.base.animToY;
    }
  } else {
    state.base.renderX = state.base.x;
    state.base.renderY = state.base.y;
  }

  for (let i = state.tileAnimations.length - 1; i >= 0; i -= 1) {
    const anim = state.tileAnimations[i];
    anim.timer = Math.max(0, anim.timer - dt);
    const t = easeOutCubic(clamp(1 - anim.timer / anim.duration, 0, 1));
    anim.renderX = anim.fromX + (anim.toX - anim.fromX) * t;
    anim.renderY = anim.fromY + (anim.toY - anim.fromY) * t;
    if (anim.timer === 0) {
      state.tileAnimations.splice(i, 1);
    }
  }
}

function stringifyFatalReason(reason) {
  if (reason instanceof Error) {
    return reason.stack || `${reason.name}: ${reason.message}`;
  }
  if (typeof reason === "string") {
    return reason;
  }
  try {
    return JSON.stringify(reason, null, 2);
  } catch {
    return String(reason);
  }
}

function syncFatalErrorOverlay() {
  const overlay = document.getElementById("fatalError");
  const textNode = document.getElementById("fatalErrorText");
  if (!overlay || !textNode) {
    return;
  }
  overlay.hidden = !state.fatalErrorText;
  textNode.textContent = state.fatalErrorText;
}

function reportFatalError(reason, source = "runtime") {
  const seedLine = state.worldSeed ? `Seed: ${state.worldSeed}\n` : "";
  const sourceLine = source ? `Source: ${source}\n` : "";
  const timeLine = `Time: ${new Date().toISOString()}\n`;
  state.fatalErrorText = `${sourceLine}${timeLine}${seedLine}\n${stringifyFatalReason(reason)}`;
  console.error("Fatal game error:", reason);
  syncFatalErrorOverlay();
}

function bindFatalErrorHandlers() {
  window.addEventListener("error", (event) => {
    reportFatalError(event.error || new Error(event.message || "Unknown runtime error"), "window.error");
  });
  window.addEventListener("unhandledrejection", (event) => {
    reportFatalError(event.reason || "Unhandled promise rejection", "unhandledrejection");
  });
}

function init() {
  bindFatalErrorHandlers();
  try {
    state.ctx = state.canvas.getContext("2d");
    state.sprites = createSpriteAtlas();
    resize();
    setupField();
    bindUi();
    requestAnimationFrame(frame);
  } catch (error) {
    reportFatalError(error, "init");
  }
}

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const viewport = window.visualViewport;
  state.dpr = dpr;
  state.width = Math.round(viewport?.width || window.innerWidth);
  state.height = Math.round(viewport?.height || window.innerHeight);
  state.canvas.width = Math.floor(state.width * dpr);
  state.canvas.height = Math.floor(state.height * dpr);
  state.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function bindUi() {
  const zone = document.querySelector(".touch-zones");
  const pad = document.getElementById("movePad");
  const stick = document.getElementById("moveStick");
  const perkButtons = document.querySelectorAll("[data-perk-slot]");
  const rerollButton = document.getElementById("perkReroll");
  const manualOpen = document.getElementById("manualOpen");
  const manualClose = document.getElementById("manualClose");
  const manualOverlay = document.getElementById("manualModal");
  const manualPanel = manualOverlay?.querySelector(".manual-modal__panel");
  const debugClose = document.getElementById("debugPerkClose");
  const debugOverlay = document.getElementById("debugPerkMenu");
  const debugPanel = debugOverlay?.querySelector(".debug-perk-menu__panel");
  const crystalRewardOverlay = document.getElementById("crystalReward");
  const crystalRewardClose = document.getElementById("crystalRewardClose");

  window.addEventListener("resize", resize);
  window.visualViewport?.addEventListener("resize", resize);

  zone.addEventListener("pointerdown", (event) => {
    if (state.debugPerkMenuOpen || state.manualModalOpen) {
      return;
    }
    if (state.scrapHitRect && isPointInsideRect(event.clientX, event.clientY, state.scrapHitRect)) {
      state.dragId = null;
      state.moveAimX = 0;
      state.moveAimY = 0;
      pad.classList.remove("move-pad--active");
      stick.style.transform = "translate(0px, 0px)";
      state.debugPerkMenuOpen = true;
      state.debugPerkSelection = "";
      showPerkToast("Debug");
      syncDebugPerkOverlay();
      return;
    }
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

  if (rerollButton) {
    rerollButton.addEventListener("click", () => {
      rerollPerkChoices();
    });
  }

  if (manualOpen) {
    manualOpen.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      resetPad();
      state.manualModalOpen = true;
      syncManualModal();
    });
  }

  if (manualClose) {
    manualClose.addEventListener("click", () => {
      resetPad();
      state.manualModalOpen = false;
      syncManualModal();
    });
  }

  if (manualOverlay) {
    manualOverlay.addEventListener("click", (event) => {
      if (event.target !== manualOverlay) {
        return;
      }
      resetPad();
      state.manualModalOpen = false;
      syncManualModal();
    });
  }

  if (manualPanel) {
    manualPanel.addEventListener("pointerdown", (event) => {
      event.stopPropagation();
    });
    manualPanel.addEventListener("click", (event) => {
      event.stopPropagation();
    });
  }

  if (debugClose) {
    debugClose.addEventListener("click", () => {
      resetPad();
      state.debugPerkMenuOpen = false;
      state.debugPerkSelection = "";
      syncDebugPerkOverlay();
    });
  }

  if (debugOverlay) {
    debugOverlay.addEventListener("click", (event) => {
      if (event.target !== debugOverlay) {
        return;
      }
      resetPad();
      state.debugPerkMenuOpen = false;
      state.debugPerkSelection = "";
      syncDebugPerkOverlay();
    });
  }

  if (debugPanel) {
    debugPanel.addEventListener("pointerdown", (event) => {
      event.stopPropagation();
    });
    debugPanel.addEventListener("click", (event) => {
      event.stopPropagation();
    });
  }

  if (crystalRewardClose) {
    crystalRewardClose.addEventListener("click", () => {
      if (!state.crystalRewardCloseReady) {
        return;
      }
      closeCrystalRewardModal();
    });
  }

  if (crystalRewardOverlay) {
    crystalRewardOverlay.addEventListener("click", (event) => {
      if (event.target !== crystalRewardOverlay || !state.crystalRewardCloseReady) {
        return;
      }
      closeCrystalRewardModal();
    });
  }

  buildDebugPerkButtons();
  syncManualModal();
  syncDebugPerkOverlay();
  syncCrystalRewardOverlay();
}

function isPointInsideRect(x, y, rect) {
  return !!rect && x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
}

function buildDebugPerkButtons() {
  const tileRoot = document.getElementById("debugTilePerks");
  const scrapRoot = document.getElementById("debugScrapPerks");
  if (!tileRoot || !scrapRoot) {
    return;
  }

  tileRoot.innerHTML = "";
  for (let i = 1; i < TILE_PERK_TYPES.length; i += 1) {
    const perk = TILE_PERK_TYPES[i];
    const key = `tile:${i}`;
    const isSelected = state.debugPerkSelection === key;
    const button = document.createElement("button");
    button.type = "button";
    button.className = `debug-perk-menu__button${isSelected ? " debug-perk-menu__button--selected" : ""}`;
    button.innerHTML = `<span class="debug-perk-menu__button-name"><span class="debug-perk-menu__icon" style="--perk-icon:${JSON.stringify(perk.color)}">${perk.icon}</span>${perk.name}</span>${isSelected ? `<span class="debug-perk-menu__button-meta">${perk.desc}</span><span class="debug-perk-menu__button-meta">Еще раз: выдать перк</span>` : ""}`;
    button.addEventListener("click", () => {
      if (state.debugPerkSelection !== key) {
        state.debugPerkSelection = key;
        buildDebugPerkButtons();
        return;
      }
      applyTilePerk(i, state.drill.x, state.drill.y, true);
      state.debugPerkSelection = "";
      syncDebugPerkOverlay();
    });
    tileRoot.appendChild(button);
  }

  scrapRoot.innerHTML = "";
  for (let i = 1; i < SCRAP_PERK_TYPES.length; i += 1) {
    if (i === 21) {
      continue;
    }
    const perk = SCRAP_PERK_TYPES[i];
    const key = `scrap:${i}`;
    const isSelected = state.debugPerkSelection === key;
    const button = document.createElement("button");
    button.type = "button";
    button.className = `debug-perk-menu__button${isSelected ? " debug-perk-menu__button--selected" : ""}`;
    button.innerHTML = `<span class="debug-perk-menu__button-name"><span class="debug-perk-menu__icon">${getScrapPerkIconMarkup(i, "debug-perk-menu__icon-svg")}</span>${perk.name}</span>${isSelected ? `<span class="debug-perk-menu__button-meta">${perk.desc}</span><span class="debug-perk-menu__button-meta">Еще раз: выдать перк</span>` : ""}`;
    button.addEventListener("click", () => {
      if (state.debugPerkSelection !== key) {
        state.debugPerkSelection = key;
        buildDebugPerkButtons();
        return;
      }
      runFuelEvent(() => applyScrapPerk(i));
      state.debugPerkSelection = "";
      syncDebugPerkOverlay();
    });
    scrapRoot.appendChild(button);
  }
}

function syncTouchZonesInteractivity() {
  const touchZones = document.querySelector(".touch-zones");
  if (!touchZones) {
    return;
  }
  touchZones.style.pointerEvents =
    state.isChoosingPerk || state.manualModalOpen || state.debugPerkMenuOpen || state.crystalRewardModalOpen ? "none" : "auto";
}

function syncManualModal() {
  const overlay = document.getElementById("manualModal");
  if (!overlay) {
    return;
  }
  if (state.manualModalOpen) {
    overlay.hidden = false;
    overlay.removeAttribute("hidden");
    overlay.style.cssText = [
      "position:absolute",
      "inset:0",
      "z-index:9997",
      "display:flex",
      "visibility:visible",
      "pointer-events:auto",
      "opacity:1",
      "align-items:center",
      "justify-content:center",
    ].join(";");
  } else {
    overlay.hidden = true;
    overlay.style.cssText = "display:none;visibility:hidden;pointer-events:none;opacity:0;";
  }
  syncTouchZonesInteractivity();
}

function syncDebugPerkOverlay() {
  const overlay = document.getElementById("debugPerkMenu");
  if (!overlay) {
    return;
  }
  if (state.debugPerkMenuOpen) {
    overlay.hidden = false;
    overlay.removeAttribute("hidden");
    overlay.style.cssText = [
      "position:absolute",
      "inset:0",
      "z-index:9999",
      "display:flex",
      "visibility:visible",
      "pointer-events:auto",
      "opacity:1",
      "align-items:center",
      "justify-content:center",
      "padding:20px",
      "background:rgba(20,8,6,0.88)",
      "backdrop-filter:blur(6px)",
    ].join(";");
  } else {
    overlay.hidden = true;
    overlay.style.cssText = "display:none;visibility:hidden;pointer-events:none;opacity:0;";
  }
  syncTouchZonesInteractivity();
}

function getRandomTilePerkExcluding(excluded = []) {
  const options = [];
  for (let i = 1; i < TILE_PERK_TYPES.length; i += 1) {
    if (excluded.includes(i)) {
      continue;
    }
    options.push(i);
  }
  return options[Math.floor(state.worldRandom() * options.length)] || 1;
}

function buildCrystalRewardCard(perkType, isRevealed, isShuffling) {
  if (!perkType) {
    return `<div class="crystal-reward__placeholder">...</div>`;
  }
  const perk = TILE_PERK_TYPES[perkType];
  return `<div class="crystal-reward__tile" style="--perk-color:${perk.color}"><span class="crystal-reward__tile-icon">${perk.icon}</span></div><div class="crystal-reward__name">${isRevealed ? perk.name : "???"}</div><div class="crystal-reward__desc">${isRevealed ? perk.desc : "Перемешивание..."}</div>`;
}

function syncCrystalRewardOverlay() {
  const overlay = document.getElementById("crystalReward");
  const closeButton = document.getElementById("crystalRewardClose");
  const card0 = document.getElementById("crystalRewardCard0");
  const card1 = document.getElementById("crystalRewardCard1");
  if (!overlay || !card0 || !card1 || !closeButton) {
    return;
  }

  if (state.crystalRewardModalOpen) {
    overlay.hidden = false;
    overlay.removeAttribute("hidden");
    overlay.style.cssText = [
      "position:absolute",
      "inset:0",
      "z-index:9998",
      "display:flex",
      "visibility:visible",
      "pointer-events:auto",
      "opacity:1",
      "align-items:center",
      "justify-content:center",
      "padding:20px",
      "background:rgba(20,8,6,0.78)",
      "backdrop-filter:blur(8px)",
    ].join(";");
  } else {
    overlay.hidden = true;
    overlay.style.cssText = "display:none;visibility:hidden;pointer-events:none;opacity:0;";
  }
  closeButton.disabled = !state.crystalRewardCloseReady;
  if (!state.crystalRewardModalOpen) {
    card0.className = "crystal-reward__card";
    card1.className = "crystal-reward__card";
    card0.innerHTML = "";
    card1.innerHTML = "";
  } else {
    const previewA = state.crystalRewardRevealStage >= 1 ? state.crystalRewardPerks[0] : state.crystalRewardPreviewPerks[0];
    const previewB = state.crystalRewardRevealStage >= 2 ? state.crystalRewardPerks[1] : state.crystalRewardPreviewPerks[1];
    card0.className = `crystal-reward__card${state.crystalRewardRevealStage < 1 ? " crystal-reward__card--shuffling" : ""}`;
    card1.className = `crystal-reward__card${state.crystalRewardRevealStage < 2 ? " crystal-reward__card--shuffling" : ""}`;
    card0.innerHTML = buildCrystalRewardCard(previewA, state.crystalRewardRevealStage >= 1, state.crystalRewardRevealStage < 1);
    card1.innerHTML = buildCrystalRewardCard(previewB, state.crystalRewardRevealStage >= 2, state.crystalRewardRevealStage < 2);
  }
  syncTouchZonesInteractivity();
}

function closeCrystalRewardModal() {
  state.crystalRewardModalOpen = false;
  state.crystalRewardCloseReady = false;
  state.crystalRewardRevealStage = 0;
  state.crystalRewardAnimTimer = 0;
  state.crystalRewardShuffleTick = 0;
  state.crystalRewardPreviewPerks = [0, 0];
  state.crystalRewardPerks = [0, 0];
  syncCrystalRewardOverlay();
}

function openCrystalRewardModal(firstPerkType, secondPerkType) {
  state.crystalRewardModalOpen = true;
  state.crystalRewardCloseReady = false;
  state.crystalRewardRevealStage = 0;
  state.crystalRewardAnimTimer = 1.4;
  state.crystalRewardShuffleTick = 0;
  state.crystalRewardPerks = [firstPerkType, secondPerkType];
  state.crystalRewardPreviewPerks = [getRandomTilePerkExcluding([]), getRandomTilePerkExcluding([])];
  syncCrystalRewardOverlay();
}

function updateCrystalRewardModal(dt) {
  if (!state.crystalRewardModalOpen) {
    return;
  }

  state.crystalRewardShuffleTick += dt;
  while (state.crystalRewardShuffleTick >= 0.08) {
    state.crystalRewardShuffleTick -= 0.08;
    if (state.crystalRewardRevealStage < 1) {
      state.crystalRewardPreviewPerks[0] = getRandomTilePerkExcluding([]);
    }
    if (state.crystalRewardRevealStage < 2) {
      state.crystalRewardPreviewPerks[1] = getRandomTilePerkExcluding([state.crystalRewardPreviewPerks[0]]);
    }
  }

  const prevTime = state.crystalRewardAnimTimer;
  state.crystalRewardAnimTimer = Math.max(0, state.crystalRewardAnimTimer - dt);
  if (prevTime > 0.8 && state.crystalRewardAnimTimer <= 0.8) {
    state.crystalRewardRevealStage = 1;
  }
  if (prevTime > 0.35 && state.crystalRewardAnimTimer <= 0.35) {
    state.crystalRewardRevealStage = 2;
  }
  if (state.crystalRewardAnimTimer === 0) {
    state.crystalRewardCloseReady = true;
  }
  syncCrystalRewardOverlay();
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
  if (state.fatalErrorText) {
    syncFatalErrorOverlay();
    return;
  }

  try {
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
  } catch (error) {
    reportFatalError(error, "frame");
  }
}

function update(dt) {
  if (state.dead) {
    return;
  }

  updateMovementAnimations(dt);

  if (state.crystalRewardModalOpen) {
    updateCrystalRewardModal(dt);
    return;
  }

  if (state.isChoosingPerk) {
    return;
  }

  state.fuel = Math.max(0, state.fuel - getIdleFuelDrain() * dt);
  state.fuel = Math.min(state.maxFuel, state.fuel);
  consumeFuelEmergency();
  state.struckThisFrame = false;
  state.drillIdleFrame = false;
  updateDrill(dt);
  updateGas(dt);
  updateSteam(dt);
  updateBoulders(dt);
  updatePerkZones(dt);
  updateChainExplosions(dt);
  updateEffects(dt);
  rebuildVisibilityMask();
  updateDiscovery();
  updateCamera(dt);
  updateCameraShake(dt);
  state.overhealDrillTimer = Math.max(0, state.overhealDrillTimer - dt);
  if (state.overhealDrillTimer === 0) {
    state.overdriveDisplayDuration = 0;
  }
  const hadOverflowSurge = state.overflowOverdriveTimer > 0;
  state.overflowOverdriveTimer = Math.max(0, state.overflowOverdriveTimer - dt);
  if (hadOverflowSurge && state.overflowOverdriveTimer === 0 && !state.dead) {
    explodeAt(state.drill.x, state.drill.y, EXPLOSION_BREAK_DAMAGE, 2);
    applyStun(OVERFLOW_STUN_DURATION, "Оглушение");
    state.cameraShake.amplitude = Math.max(state.cameraShake.amplitude, 2.4);
    state.damageFlash = Math.min(1, state.damageFlash + 0.65);
  }
  state.stunTimer = Math.max(0, state.stunTimer - dt);
  if (state.stunTimer === 0) {
    state.stunDisplayDuration = 0;
  }
  if (!state.struckThisFrame && state.drillIdleFrame) {
    state.heatCooldownTime += dt;
    const cooldownBoost = 1 + state.heatCooldownTime * state.heatCooldownTime * 0.65;
    const speedCoolingBoost = 1 + Math.max(0, state.strikeSpeed - 1) * 0.7;
    const prevHeat = state.heat;
    state.heat = Math.max(0, state.heat - HEAT_COOL_RATE * cooldownBoost * speedCoolingBoost * dt);
    const cooledHeat = Math.max(0, prevHeat - state.heat);
    if (state.coolingRocketLevel > 0 && cooledHeat > 0) {
      state.coolingRocketCharge += cooledHeat;
      const coolingRocketThreshold = getCoolingRocketThreshold();
      while (state.coolingRocketCharge >= coolingRocketThreshold) {
        state.coolingRocketCharge -= coolingRocketThreshold;
        triggerRemoteBombSquare(state.drill.x, state.drill.y, 1 + Math.floor(Math.random() * 3));
      }
    }
    if (state.heat === 0 && state.heatCoolingRewardArmed) {
      state.heatCoolingRewardArmed = false;
      if (state.heatCoolingRewardLevel > 0 && state.heatCoolingPeak >= 50) {
        state.signalMovesLeft += state.heatCoolingRewardLevel * 2;
        state.signalMovesMax = Math.max(state.signalMovesMax, state.signalMovesLeft);
        if (state.signalText === "Сигнал пуст" || state.signalText === "Старт") {
          state.signalText = "Горячо";
        }
        showPerkToast("Импульс остывания");
      }
      state.heatCoolingPeak = 0;
    }
  } else {
    state.heatCooldownTime = 0;
  }
  state.loopChargeTimer = Math.max(0, state.loopChargeTimer - dt);
  if (state.loopChargeTimer === 0) {
    state.loopChargeDamageBonus = 0;
  }
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
  if (!state.isChoosingPerk && !state.pendingPerkChoice && state.bonusPerkChoices > 0) {
    state.bonusPerkChoices -= 1;
    awardBonusScrapPerkChoice();
    return;
  }
  checkScrapPerkUnlock();
}

function updateEffects(dt) {
  for (let i = state.effects.length - 1; i >= 0; i -= 1) {
    const effect = state.effects[i];
    effect.time -= dt;
    if (effect.time <= 0) {
      if (effect.kind === "rocket") {
        detonateRocketEffect(effect);
      }
      state.effects.splice(i, 1);
    }
  }
}

function scheduleChainExplosion(task) {
  for (let i = 0; i < state.chainExplosions.length; i += 1) {
    const queued = state.chainExplosions[i];
    if (queued.kind === task.kind && queued.x === task.x && queued.y === task.y) {
      return;
    }
  }
  state.chainExplosions.push({
    delay: CHAIN_EXPLOSION_DELAY,
    ...task,
  });
}

function updateChainExplosions(dt) {
  for (let i = state.chainExplosions.length - 1; i >= 0; i -= 1) {
    const task = state.chainExplosions[i];
    task.delay -= dt;
    if (task.delay > 0) {
      continue;
    }

    state.chainExplosions.splice(i, 1);
    if (task.kind === "volatile") {
      explodeAt(task.x, task.y, task.damage, task.radius, { cause: "explosion" });
    } else if (task.kind === "gas") {
      removeGasCell(task.x, task.y);
      explodeAt(task.x, task.y, EXPLOSION_BREAK_DAMAGE, 2, {
        cause: "explosion",
        triggerGas: true,
      });
    } else if (task.kind === "spike") {
      damageCell(task.x, task.y, EXPLOSION_BREAK_DAMAGE, {
        ignoreHazardEffect: true,
        cause: "explosion",
      });
    }
  }
}

function rebuildVisibilityMask() {
  state.visibleMask.fill(0);
  const startX = state.drill.x;
  const startY = state.drill.y;
  const radiusSq = state.visionRadius * state.visionRadius;
  const queue = [{ x: startX, y: startY }];
  state.visibleMask[cellIndex(startX, startY)] = 1;

  for (let i = 0; i < queue.length; i += 1) {
    const cell = queue[i];
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

    for (let n = 0; n < neighbors.length; n += 1) {
      const nx = neighbors[n].x;
      const ny = neighbors[n].y;
      if (nx < 1 || ny < 1 || nx >= GRID_W - 1 || ny >= GRID_H - 1) {
        continue;
      }
      const dx = nx - startX;
      const dy = ny - startY;
      if (dx * dx + dy * dy > radiusSq) {
        continue;
      }

      const index = cellIndex(nx, ny);
      if (state.visibleMask[index]) {
        continue;
      }

      const stepDx = nx - cell.x;
      const stepDy = ny - cell.y;
      if (stepDx !== 0 && stepDy !== 0) {
        const sideA = cellIndex(cell.x + stepDx, cell.y);
        const sideB = cellIndex(cell.x, cell.y + stepDy);
        if (state.metalMask[sideA] || state.metalMask[sideB]) {
          continue;
        }
      }

      state.visibleMask[index] = 1;
      if (!state.metalMask[index]) {
        queue.push({ x: nx, y: ny });
      }
    }
  }
}

function prepareScrapPerkChoices() {
  const bag = [1, 2, 3, 4, 5, 6, 8, 10, 11, 12, 14, 15, 20, 22, 23, 24, 25];
  if (state.contourLengthDamageLevel < 4) {
    bag.push(26);
  }
  if (state.coolingRocketLevel < 3) {
    bag.push(27);
  }
  if (state.contourReturnFuelLevel < 3) {
    bag.push(28);
  }
  if (state.heatOverloadRocketLevel < 3) {
    bag.push(29);
  }
  if (state.tankBoostLevel < 3) {
    bag.push(30);
  }
  if (state.loopChargeLevel >= 4) {
    const idx = bag.indexOf(5);
    if (idx !== -1) {
      bag.splice(idx, 1);
    }
  }
  if (state.remoteBombInterval === 0 || state.remoteBombInterval > 15) {
    bag.push(7);
  }
  if (state.visionRadius < 9) {
    bag.push(9);
  }
  if (state.fuelOnBreak < 2) {
    bag.push(12);
  }
  if (!state.overflowBomb) {
    bag.push(13);
  }
  if (state.overhealOverdriveDuration < 7) {
    bag.push(15);
  }
  if (state.loopPerkLevel < 2) {
    bag.push(16);
  }
  if (state.idleAutoCloseDelay > IDLE_AUTO_CLOSE_MIN_DELAY) {
    bag.push(17);
  }
  if (state.crystalCatalystLevel < 3) {
    bag.push(18);
  }
  if (state.spikeOverdriveLevel < 3) {
    bag.push(19);
  }
  for (let i = bag.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = bag[i];
    bag[i] = bag[j];
    bag[j] = tmp;
  }

  state.perkChoices = bag.slice(0, 3);
  return state.perkChoices.length > 0;
}

function checkScrapPerkUnlock() {
  if (state.isChoosingPerk || state.pendingPerkChoice || state.scrap < state.nextScrapPerkAt) {
    return;
  }

  if (!prepareScrapPerkChoices()) {
    return;
  }
  state.pendingPerkChoice = true;
  state.pendingPerkDelay = SCRAP_PERK_POPUP_DELAY;
  state.scrapPerkLevel += 1;
  state.nextScrapPerkAt += getScrapPerkCost(state.scrapPerkLevel);
}

function activateDrillOverdrive(duration, toastText = "") {
  if (duration <= 0) {
    return;
  }
  state.overhealDrillTimer = Math.max(state.overhealDrillTimer, duration);
  state.overdriveDisplayDuration = Math.max(state.overdriveDisplayDuration, duration);
  if (toastText) {
    showPerkToast(toastText);
  }
}

function applyStun(duration, toastText = "") {
  if (duration <= 0) {
    return;
  }
  const actualDuration = Math.max(0.5, duration - state.stunReduction);
  state.stunTimer = Math.max(state.stunTimer, actualDuration);
  state.stunDisplayDuration = Math.max(state.stunDisplayDuration, actualDuration);
  if (toastText) {
    showPerkToast(toastText);
  }
}

function triggerOverflowSurge() {
  state.resolvingOverflowBomb = true;
  try {
    activateDrillOverdrive(OVERFLOW_OVERDRIVE_DURATION, "Перегрузка");
    state.overflowOverdriveTimer = OVERFLOW_OVERDRIVE_DURATION;
  } finally {
    state.resolvingOverflowBomb = false;
  }
}

function activateOverhealDrillBoost() {
  activateDrillOverdrive(state.overhealOverdriveDuration || 3, "Перелив адреналина");
}

function triggerHeatOverload() {
  const damageMultiplier = 1 + state.heatExplosionDamageBonus;
  const radius = 1 + state.heatExplosionRadiusBonus;
  state.heat = 0;
  state.heatCoolingRewardArmed = false;
  state.heatCoolingPeak = 0;
  explodeAt(state.drill.x, state.drill.y, getStrikeDamage() * damageMultiplier, radius, {
    guaranteedBreak: false,
    cause: "explosion",
  });
  for (let i = 0; i < state.heatOverloadRocketLevel; i += 1) {
    triggerRemoteBombSquare(state.drill.x, state.drill.y, 1 + Math.floor(Math.random() * 3));
  }
  applyStun(HEAT_STUN_DURATION, "Перегрев");
  state.cameraShake.amplitude = Math.max(state.cameraShake.amplitude, 2.8);
  state.damageFlash = Math.min(1, state.damageFlash + 0.75);
}

function addHeatOnStrike(amount) {
  if (amount <= 0 || state.dead) {
    return;
  }
  if (state.overhealDrillTimer > 0) {
    return;
  }
  state.heat = Math.min(state.maxHeat, state.heat + amount);
  state.struckThisFrame = true;
  state.heatCoolingRewardArmed = state.heat > 0;
  state.heatCoolingPeak = Math.max(state.heatCoolingPeak, state.heat);
  if (state.heat >= state.maxHeat) {
    triggerHeatOverload();
  }
}

function healPlayer(amount, sourceText = "") {
  if (amount <= 0) {
    return 0;
  }

  const missingHp = Math.max(0, state.maxHp - state.hp);
  const actualHeal = Math.min(amount, missingHp);
  const overheal = Math.max(0, amount - actualHeal);
  state.hp = Math.min(state.maxHp, state.hp + amount);

  if (overheal > 0 && state.overhealOverdrive) {
    activateOverhealDrillBoost();
    if (sourceText) {
      state.perkText = sourceText;
    }
  }

  return actualHeal;
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

function rerollPerkChoices() {
  if (!state.isChoosingPerk || state.perkRerolls <= 0) {
    return;
  }

  if (!prepareScrapPerkChoices()) {
    return;
  }

  state.perkRerolls -= 1;
  syncPerkChoiceOverlay();
}

function formatPerkPercent(value) {
  return `${Math.round(value * 100)}%`;
}

function formatPerkNumber(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function formatSignedNumber(value, suffix = "") {
  const text = `${value >= 0 ? "+" : ""}${formatPerkNumber(value)}`;
  return suffix ? `${text}${suffix}` : text;
}

function getScrapPerkIconMarkup(perkType, className = "") {
  const cls = className ? ` class="${className}"` : "";
  const stroke = 'stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"';
  switch (perkType) {
    case 1:
      return `<svg${cls} viewBox="0 0 24 24" aria-hidden="true"><path ${stroke} d="M4 7v10M20 7v10M8 12h8"/><path ${stroke} d="M10 9l-3 3 3 3M14 9l3 3-3 3"/></svg>`;
    case 2:
      return `<svg${cls} viewBox="0 0 24 24" aria-hidden="true"><path ${stroke} d="M4 12h11"/><path ${stroke} d="M11 7l6 5-6 5"/><path ${stroke} d="M18 8v8"/></svg>`;
    case 3:
      return `<svg${cls} viewBox="0 0 24 24" aria-hidden="true"><path ${stroke} d="M4 12h12"/><path ${stroke} d="M12 8l6 4-6 4"/><path ${stroke} d="M18 9l2 3-2 3"/></svg>`;
    case 4:
      return `<svg${cls} viewBox="0 0 24 24" aria-hidden="true"><path ${stroke} d="M6 6l12 12M18 6L6 18"/><path ${stroke} d="M9 6h3v3M15 18h-3v-3M18 9h-3V6M6 15h3v3"/></svg>`;
    case 5:
      return `<svg${cls} viewBox="0 0 24 24" aria-hidden="true"><path ${stroke} d="M8 4h8l4 8-4 8H8l-4-8 4-8z"/><path ${stroke} d="M9 12h6"/></svg>`;
    case 6:
      return `<svg${cls} viewBox="0 0 24 24" aria-hidden="true"><path ${stroke} d="M6 16.5A6.5 6.5 0 0 1 12.5 10"/><path ${stroke} d="M13 6l-2 5h3l-2 7 5-8h-3l2-4"/></svg>`;
    case 7:
      return `<svg${cls} viewBox="0 0 24 24" aria-hidden="true"><path ${stroke} d="M6 16l6-8 6 8"/><path ${stroke} d="M12 8V4M9 18h6"/><path ${stroke} d="M7 11l-2 1M17 11l2 1"/></svg>`;
    case 8:
      return `<svg${cls} viewBox="0 0 24 24" aria-hidden="true"><path ${stroke} d="M7 8h9l1 3v5H7z"/><path ${stroke} d="M10 8V5h4v3M9 13h6"/><path ${stroke} d="M5 12l-2 2 2 2"/></svg>`;
    case 9:
      return `<svg${cls} viewBox="0 0 24 24" aria-hidden="true"><path ${stroke} d="M3 12s3-5 9-5 9 5 9 5-3 5-9 5-9-5-9-5z"/><circle cx="12" cy="12" r="2.5" fill="currentColor"/></svg>`;
    case 10:
      return `<svg${cls} viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="2" fill="currentColor"/><path ${stroke} d="M12 6a6 6 0 0 1 6 6M12 3a9 9 0 0 1 9 9"/><path ${stroke} d="M12 18a6 6 0 0 0 6-6"/></svg>`;
    case 11:
      return `<svg${cls} viewBox="0 0 24 24" aria-hidden="true"><path ${stroke} d="M12 4l1.5 2.2 2.7.4-1.9 2 0.5 2.8-2.8-1.1-2.8 1.1 0.5-2.8-1.9-2 2.7-.4z"/><path ${stroke} d="M6 14l2 2M16 14l2 2M9 18h6"/></svg>`;
    case 12:
      return `<svg${cls} viewBox="0 0 24 24" aria-hidden="true"><path ${stroke} d="M8 7h8l1 3v6H7V10z"/><path ${stroke} d="M10 7V4h4v3"/><path ${stroke} d="M5 15c1 2 3 3 5 3M19 9c-1-2-3-3-5-3"/></svg>`;
    case 13:
      return `<svg${cls} viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" ${stroke}/><path ${stroke} d="M13 5l-3 7h3l-2 7 5-8h-3l2-6"/></svg>`;
    case 14:
      return `<svg${cls} viewBox="0 0 24 24" aria-hidden="true"><path ${stroke} d="M12 5v14M5 12h14"/><path ${stroke} d="M7 7h10v10H7z"/></svg>`;
    case 15:
      return `<svg${cls} viewBox="0 0 24 24" aria-hidden="true"><path ${stroke} d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.6-7 10-7 10z"/><path ${stroke} d="M12 7v5M9.5 9.5h5"/></svg>`;
    case 16:
      return `<svg${cls} viewBox="0 0 24 24" aria-hidden="true"><path ${stroke} d="M12 4l6 4v8l-6 4-6-4V8z"/><path ${stroke} d="M12 8l2 4-2 4-2-4z"/></svg>`;
    case 17:
      return `<svg${cls} viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7" ${stroke}/><path ${stroke} d="M12 8v4l3 2"/><path ${stroke} d="M7 5l-2 2M17 5l2 2"/></svg>`;
    case 18:
      return `<svg${cls} viewBox="0 0 24 24" aria-hidden="true"><path ${stroke} d="M12 4l4 4-1 6-3 4-3-4-1-6z"/><path ${stroke} d="M6 18l2-2M18 18l-2-2"/></svg>`;
    case 19:
      return `<svg${cls} viewBox="0 0 24 24" aria-hidden="true"><path ${stroke} d="M12 4l1.6 4.4 4.4 1.6-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6z"/><path ${stroke} d="M18 6l2 2M4 18l2 2"/></svg>`;
    case 20:
      return `<svg${cls} viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3" fill="currentColor"/><path ${stroke} d="M12 3v3M12 18v3M3 12h3M18 12h3M5.5 5.5l2.1 2.1M16.4 16.4l2.1 2.1M18.5 5.5l-2.1 2.1M7.6 16.4l-2.1 2.1"/></svg>`;
    case 22:
      return `<svg${cls} viewBox="0 0 24 24" aria-hidden="true"><path ${stroke} d="M10 5a2 2 0 1 1 4 0v7.2a4 4 0 1 1-4 0z"/><path ${stroke} d="M12 9v5"/></svg>`;
    case 23:
      return `<svg${cls} viewBox="0 0 24 24" aria-hidden="true"><path ${stroke} d="M13 4c2 3-1 4.5-1 7a3 3 0 0 0 6 0c0-2-1.3-3.2-2.8-4.7M12 20c-3.3 0-6-2.2-6-5.5 0-3.5 2.8-4.6 4.8-7.5 1.7 2.3 2.2 3.7 2.2 5.5"/></svg>`;
    case 24:
      return `<svg${cls} viewBox="0 0 24 24" aria-hidden="true"><path ${stroke} d="M6 9c2 0 2 2 4 2s2-2 4-2 2 2 4 2"/><path ${stroke} d="M6 15c2 0 2-2 4-2s2 2 4 2 2-2 4-2"/><path ${stroke} d="M12 5v14"/></svg>`;
    case 25:
      return `<svg${cls} viewBox="0 0 24 24" aria-hidden="true"><path ${stroke} d="M8 5v4l2 2-2 2 2 2-2 2v2M16 5v4l-2 2 2 2-2 2 2 2v2"/><path ${stroke} d="M5 12h14"/></svg>`;
    case 26:
      return `<svg${cls} viewBox="0 0 24 24" aria-hidden="true"><path ${stroke} d="M7 7h10v10H7z"/><path ${stroke} d="M12 4v3M20 12h-3M12 20v-3M4 12h3"/><circle cx="12" cy="12" r="2" fill="currentColor"/></svg>`;
    case 27:
      return `<svg${cls} viewBox="0 0 24 24" aria-hidden="true"><path ${stroke} d="M8 6l1.5 2.5L12 7l-1 3 2.5 1.5L10 12l1 3-2.5-1.5L7 16l.5-3L5 12l2.5-1.5L7 7z"/><path ${stroke} d="M15 17l4-5"/></svg>`;
    case 28:
      return `<svg${cls} viewBox="0 0 24 24" aria-hidden="true"><path ${stroke} d="M8 8H6a4 4 0 0 0 0 8h8"/><path ${stroke} d="M11 19l3-3-3-3"/><path ${stroke} d="M16 6c1 1.5 1 3.5 0 5"/></svg>`;
    case 29:
      return `<svg${cls} viewBox="0 0 24 24" aria-hidden="true"><path ${stroke} d="M6 16l6-8 6 8"/><path ${stroke} d="M9 19h6"/><path ${stroke} d="M12 4c1.5 1.3 1.8 2.8.7 4.5"/></svg>`;
    case 30:
      return `<svg${cls} viewBox="0 0 24 24" aria-hidden="true"><path ${stroke} d="M6 8h10l2 4v5H6z"/><path ${stroke} d="M10 8V5h4v3"/><path ${stroke} d="M12 11v4M10 13h4"/></svg>`;
    default:
      return `<svg${cls} viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="6" ${stroke}/></svg>`;
  }
}

function getCoolingRocketThreshold() {
  const thresholds = [0, 50, 40, 30];
  return thresholds[state.coolingRocketLevel] || 50;
}

function getLoopPerkChance(cellCount, level = state.loopPerkLevel) {
  if (level <= 0) {
    return 0;
  }
  const largeLoop = cellCount >= 9;
  if (level === 1) {
    return largeLoop ? 0.35 : 0.15;
  }
  return largeLoop ? 0.75 : 0.4;
}

function getScrapPerkNextLevel(perkType) {
  switch (perkType) {
    case 1:
      return state.sideDrills + 1;
    case 2:
      return Math.max(1, state.jumpRange);
    case 3:
      return Math.round(state.longDrillPower / 0.1) + 1;
    case 4:
      return Math.round(state.diagonalDrillPower / 0.05) + 1;
    case 5:
      return Math.min(4, state.loopChargeLevel + 1);
    case 6:
      return Math.round(state.lowFuelSpeedBonus / 0.35) + 1;
    case 7:
      return state.remoteBombLevel + 1;
    case 8:
      return Math.round(state.perkFuelBonus / 50) + 1;
    case 9:
      return Math.max(1, state.visionRadius - VISION_RADIUS + 1);
    case 10:
      return Math.round(state.radarBonus / 2) + 1;
    case 11:
      return Math.round(state.scrapBonus / 2) + 1;
    case 12:
      return Math.min(2, state.fuelOnBreak + 1);
    case 13:
      return 1;
    case 14:
      return state.maxHp - START_HP + 1;
    case 15:
      return Math.max(1, state.overhealOverdriveDuration - 1);
    case 16:
      return Math.min(2, state.loopPerkLevel + 1);
    case 17:
      return IDLE_AUTO_CLOSE_DELAY - Math.max(IDLE_AUTO_CLOSE_MIN_DELAY, state.idleAutoCloseDelay - 1);
    case 18:
      return Math.min(3, state.crystalCatalystLevel + 1);
    case 19:
      return Math.min(3, state.spikeOverdriveLevel + 1);
    case 20:
      return Math.round(state.heatExplosionDamageBonus) + 1;
    case 21:
      return 0;
    case 22:
      return Math.round((state.maxHeat - MAX_HEAT) / 20) + 1;
    case 23:
      return Math.round(state.heatDamageBonus / 0.2) + 1;
    case 24:
      return state.heatCoolingRewardLevel + 1;
    case 25:
      return Math.round(state.stunReduction / 0.4) + 1;
    case 26:
      return Math.min(4, state.contourLengthDamageLevel + 1);
    case 27:
      return Math.min(3, state.coolingRocketLevel + 1);
    case 28:
      return Math.min(3, state.contourReturnFuelLevel + 1);
    case 29:
      return Math.min(3, state.heatOverloadRocketLevel + 1);
    case 30:
      return Math.min(3, state.tankBoostLevel + 1);
    default:
      return 1;
  }
}

function getScrapPerkCurrentLevel(perkType) {
  switch (perkType) {
    case 1:
      return state.sideDrills;
    case 2:
      return state.jumpDrive ? Math.max(1, state.jumpRange - 1) : 0;
    case 3:
      return Math.round(state.longDrillPower / 0.1);
    case 4:
      return Math.round(state.diagonalDrillPower / 0.05);
    case 5:
      return state.loopChargeLevel;
    case 6:
      return Math.round(state.lowFuelSpeedBonus / 0.35);
    case 7:
      return state.remoteBombLevel;
    case 8:
      return Math.round(state.perkFuelBonus / 50);
    case 9:
      return Math.max(0, state.visionRadius - VISION_RADIUS);
    case 10:
      return Math.round(state.radarBonus / 2);
    case 11:
      return Math.round(state.scrapBonus / 2);
    case 12:
      return state.fuelOnBreak;
    case 13:
      return state.overflowBomb ? 1 : 0;
    case 14:
      return Math.max(0, state.maxHp - START_HP);
    case 15:
      return state.overhealOverdriveDuration > 0 ? state.overhealOverdriveDuration - 2 : 0;
    case 16:
      return state.loopPerkLevel;
    case 17:
      return Math.max(0, IDLE_AUTO_CLOSE_DELAY - state.idleAutoCloseDelay);
    case 18:
      return state.crystalCatalystLevel;
    case 19:
      return state.spikeOverdriveLevel;
    case 20:
      return Math.round(state.heatExplosionDamageBonus);
    case 21:
      return 0;
    case 22:
      return Math.max(0, Math.round((state.maxHeat - MAX_HEAT) / 20));
    case 23:
      return Math.round(state.heatDamageBonus / 0.2);
    case 24:
      return state.heatCoolingRewardLevel;
    case 25:
      return Math.round(state.stunReduction / 0.4);
    case 26:
      return state.contourLengthDamageLevel;
    case 27:
      return state.coolingRocketLevel;
    case 28:
      return state.contourReturnFuelLevel;
    case 29:
      return state.heatOverloadRocketLevel;
    case 30:
      return state.tankBoostLevel;
    default:
      return 0;
  }
}

function getScrapPerkPreview(perkType) {
  switch (perkType) {
    case 1: {
      const currentPower = 0.5 + state.sideDrills * 0.25;
      const nextPower = 0.5 + (state.sideDrills + 1) * 0.25;
      return {
        effect: "Бьет слева и справа от героя",
        compare: `Урон ${formatPerkPercent(currentPower)} → ${formatPerkPercent(nextPower)}`,
      };
    }
    case 2: {
      const currentRange = state.jumpDrive ? state.jumpRange : 0;
      const nextRange = Math.max(2, state.jumpRange + 1);
      return {
        effect: "Рывок после каждых 10 шагов",
        compare: `Дальность ${currentRange} → ${nextRange}`,
      };
    }
    case 3: {
      const currentPower = state.longDrillPower > 0 ? 0.1 + state.longDrillPower : 0;
      const nextPower = 0.1 + state.longDrillPower + 0.1;
      return {
        effect: "Бьет следующий тайл по прямой",
        compare: `Урон ${formatPerkPercent(currentPower)} → ${formatPerkPercent(nextPower)}`,
      };
    }
    case 4: {
      const currentPower = state.diagonalDrillPower > 0 ? 0.15 + state.diagonalDrillPower : 0;
      const nextPower = 0.15 + state.diagonalDrillPower + 0.05;
      return {
        effect: "Бьет две диагонали вперед",
        compare: `Урон ${formatPerkPercent(currentPower)} → ${formatPerkPercent(nextPower)}`,
      };
    }
    case 5: {
      const nextLevel = Math.min(4, state.loopChargeLevel + 1);
      const currentDuration = state.loopChargeDuration || 0;
      const nextDuration = 2 + nextLevel;
      return {
        effect: "+5% урона за клетку в контуре",
        compare: `Длительность ${currentDuration} → ${nextDuration} сек`,
      };
    }
    case 6: {
      return {
        effect: "Ускоряет бур при низком топливе",
        compare: `Бонус ${formatPerkPercent(state.lowFuelSpeedBonus)} → ${formatPerkPercent(state.lowFuelSpeedBonus + 0.35)}`,
      };
    }
    case 7: {
      const currentInterval = state.remoteBombInterval || 0;
      const nextInterval = Math.max(15, currentInterval > 0 ? currentInterval - 5 : 30);
      return {
        effect: "Ракета за сломанные буром блоки",
        compare: `Интервал ${currentInterval || 30} → ${nextInterval}`,
      };
    }
    case 8: {
      const currentTankDelta = 120 - state.perkFuelBonus;
      const nextFuelBonus = state.perkFuelBonus + 50;
      const nextTankDelta = 120 - nextFuelBonus;
      return {
        effect: "Все перки дают топливо, Бак слабеет",
        compare: `Бак ${formatSignedNumber(currentTankDelta)} → ${formatSignedNumber(nextTankDelta)}`,
      };
    }
    case 9: {
      const nextRadius = Math.min(9, state.visionRadius + 1);
      return {
        effect: "+1 радиус (макс. 9)",
        compare: `Радиус ${state.visionRadius} → ${nextRadius}`,
      };
    }
    case 10: {
      return {
        effect: "+2 шага после подбора радара",
        compare: `${state.radarBonus} → ${state.radarBonus + 2}`,
      };
    }
    case 11: {
      return {
        effect: "+2 scrap за каждый блок",
        compare: `${state.scrapBonus} → ${state.scrapBonus + 2}`,
      };
    }
    case 12: {
      return {
        effect: "+1 топливо за каждый блок (макс. 2)",
        compare: `${state.fuelOnBreak} → ${Math.min(2, state.fuelOnBreak + 1)}`,
      };
    }
    case 13: {
      return {
        effect: "Переполнение дает форсаж, потом взрыв",
        compare: `Бак ${state.maxFuel} → ${Math.max(100, state.maxFuel - 150)}`,
      };
    }
    case 14: {
      return {
        effect: "+1 макс HP, +2 лечение",
        compare: `Макс HP ${state.maxHp} → ${state.maxHp + 1}`,
      };
    }
    case 15: {
      const nextDuration = Math.min(7, state.overhealOverdriveDuration > 0 ? state.overhealOverdriveDuration + 1 : 3);
      return {
        effect: "Лишнее лечение включает форсаж",
        compare: `Длительность ${state.overhealOverdriveDuration || 0} → ${nextDuration} сек`,
      };
    }
    case 16: {
      const currentSmall = getLoopPerkChance(0);
      const currentLarge = getLoopPerkChance(9);
      const nextSmall = getLoopPerkChance(0, Math.min(2, state.loopPerkLevel + 1));
      const nextLarge = getLoopPerkChance(9, Math.min(2, state.loopPerkLevel + 1));
      return {
        effect: "Малый и большой контур могут дать тайловый перк",
        compare: `${formatPerkPercent(currentSmall)}/${formatPerkPercent(currentLarge)} → ${formatPerkPercent(nextSmall)}/${formatPerkPercent(nextLarge)}`,
      };
    }
    case 17: {
      const nextDelay = Math.max(IDLE_AUTO_CLOSE_MIN_DELAY, state.idleAutoCloseDelay - 1);
      return {
        effect: "Контур дорисовывается сам в простое",
        compare: `${state.idleAutoCloseDelay} → ${nextDelay} сек`,
      };
    }
    case 18: {
      const level = state.crystalCatalystLevel;
      let effect = "Бонусы за кристаллы";
      let compare = "0 → +30 scrap";
      if (level === 1) {
        compare = "+30 scrap → +40 fuel";
      } else if (level === 2) {
        compare = "+40 fuel → +1 HP";
      } else if (level >= 3) {
        compare = "Макс.";
      }
      return { effect, compare };
    }
    case 19: {
      const durations = [0, 5, 7, 10];
      const currentDuration = durations[state.spikeOverdriveLevel] || 0;
      const nextDuration = durations[Math.min(3, state.spikeOverdriveLevel + 1)] || 10;
      return {
        effect: "Разбитые шипы дают форсаж",
        compare: `${currentDuration} → ${nextDuration} сек`,
      };
    }
    case 20: {
      return {
        effect: "Усиляет взрыв от перегрева",
        compare: `x${formatPerkNumber(1 + state.heatExplosionDamageBonus)} r${formatPerkNumber(1 + state.heatExplosionRadiusBonus)} → x${formatPerkNumber(2 + state.heatExplosionDamageBonus)} r${formatPerkNumber(1.5 + state.heatExplosionRadiusBonus)}`,
      };
    }
    case 21: {
      return {
        effect: "Слит в Термозаряд",
        compare: "—",
      };
    }
    case 22: {
      return {
        effect: "+20 к лимиту перегрева",
        compare: `${state.maxHeat} → ${state.maxHeat + 20}`,
      };
    }
    case 23: {
      return {
        effect: "Чем выше нагрев, тем выше урон",
        compare: `${formatPerkPercent(state.heatDamageBonus)} → ${formatPerkPercent(state.heatDamageBonus + 0.2)}`,
      };
    }
    case 24: {
      return {
        effect: "Полное остывание дает шаги радара",
        compare: `${state.heatCoolingRewardLevel * 2} → ${(state.heatCoolingRewardLevel + 1) * 2}`,
      };
    }
    case 25: {
      return {
        effect: "Меньше стан, но быстрее перегрев",
        compare: `${HEAT_PER_STRIKE + state.heatGainBonus} → ${HEAT_PER_STRIKE + state.heatGainBonus + 1} heat`,
      };
    }
    case 26: {
      const caps = [0, 15, 30, 50, 100];
      const contourLength = Math.max(0, state.pathTiles.length - 1);
      const currentBonus = Math.min(caps[state.contourLengthDamageLevel] || 0, contourLength);
      const nextCap = caps[Math.min(4, state.contourLengthDamageLevel + 1)] || 100;
      return {
        effect: `+1% урона за длину контура (макс. ${nextCap}%)`,
        compare: `${currentBonus}% → ${Math.min(nextCap, contourLength)}%`,
      };
    }
    case 27: {
      const thresholds = [0, 50, 40, 30];
      const currentThreshold = thresholds[state.coolingRocketLevel] || 50;
      const nextThreshold = thresholds[Math.min(3, state.coolingRocketLevel + 1)] || 30;
      return {
        effect: "Остывание выпускает ракету малого радиуса",
        compare: `${currentThreshold} → ${nextThreshold} heat`,
      };
    }
    case 28: {
      const gains = [0, 3, 4, 5];
      const currentGain = gains[state.contourReturnFuelLevel] || 0;
      const nextGain = gains[Math.min(3, state.contourReturnFuelLevel + 1)] || 5;
      return {
        effect: "Шаг назад по контуру дает топливо",
        compare: `${currentGain} → ${nextGain}`,
      };
    }
    case 29: {
      const currentCount = state.heatOverloadRocketLevel;
      const nextCount = Math.min(3, currentCount + 1);
      return {
        effect: "Перегрев выпускает ракеты малого радиуса",
        compare: `${currentCount} → ${nextCount}`,
      };
    }
    case 30: {
      const currentMultiplier = getTankFuelMultiplier();
      const nextMultiplier = getTankFuelMultiplier(Math.min(3, state.tankBoostLevel + 1));
      const currentTank = Math.round(120 * currentMultiplier) - state.perkFuelBonus;
      const nextTank = Math.round(120 * nextMultiplier) - state.perkFuelBonus;
      const currentDrain = getIdleFuelDrain();
      const nextBaseDrain = IDLE_FUEL_DRAIN + Math.floor(state.scrapPerkLevel / 3);
      const nextDrain = nextBaseDrain + Math.max(1, nextBaseDrain * 0.1) * Math.min(3, state.tankBoostLevel + 1);
      return {
        effect: "Бак сильнее, но растет расход в секунду",
        compare: `Бак ${formatSignedNumber(currentTank)} / ${formatPerkNumber(currentDrain)} → ${formatSignedNumber(nextTank)} / ${formatPerkNumber(nextDrain)}`,
      };
    }
    default:
      return {
        effect: "Без данных",
        compare: "—",
      };
  }
}

function syncPerkChoiceOverlay() {
  const overlay = document.getElementById("perkChoice");
  if (!overlay) {
    return;
  }

  overlay.hidden = !state.isChoosingPerk;
  const subtitle = overlay.querySelector(".perk-choice__subtitle");
  const rerollButton = document.getElementById("perkReroll");
  const rerollCount = document.getElementById("perkRerollCount");
  if (subtitle) {
    subtitle.textContent = `Апгрейд за ${getScrapPerkCost(state.scrapPerkLevel)} скрапа`;
  }
  if (rerollButton) {
    rerollButton.disabled = !state.isChoosingPerk || state.perkRerolls <= 0;
  }
  if (rerollCount) {
    rerollCount.textContent = `Рероллы ${state.perkRerolls}`;
  }
  syncDebugPerkOverlay();
  const buttons = document.querySelectorAll("[data-perk-slot]");
  for (let i = 0; i < buttons.length; i += 1) {
    const button = buttons[i];
    const perkType = state.perkChoices[i];
    if (!perkType) {
      button.innerHTML = "";
      continue;
    }
    const preview = getScrapPerkPreview(perkType);
    button.innerHTML = `<span class="perk-option__top"><span class="perk-option__title"><span class="perk-option__icon">${getScrapPerkIconMarkup(perkType, "perk-option__icon-svg")}</span><span class="perk-option__name">${SCRAP_PERK_TYPES[perkType].name}</span></span><span class="perk-option__level">Лвл ${getScrapPerkNextLevel(perkType)}</span></span><span class="perk-option__effect">${preview.effect}</span><span class="perk-option__compare">${preview.compare}</span>`;
  }
}

function getStrikeDamage() {
  const chargeBoost = state.loopChargeTimer > 0 ? 1 + state.loopChargeDamageBonus : 1;
  const heatBoost = 1 + clamp(state.heat / Math.max(1, state.maxHeat), 0, 1) * state.heatDamageBonus;
  const contourCap = [0, 0.15, 0.3, 0.5, 1][state.contourLengthDamageLevel] || 0;
  const contourLength = Math.max(0, state.pathTiles.length - 1);
  const contourBoost = 1 + Math.min(contourCap, contourLength * 0.01);
  return (state.drill.rate / STRIKE_CYCLE_SPEED) * state.drillPower * 10 * chargeBoost * heatBoost * contourBoost;
}

function addFuel(amount, originX = state.drill.x, originY = state.drill.y, options = {}) {
  if (amount <= 0) {
    return;
  }

  const totalGain = amount + state.fuelPickupBonus;
  showFuelToast(totalGain);
  const overflow = state.fuel + totalGain - state.maxFuel;
  state.fuel = Math.min(state.maxFuel, state.fuel + totalGain);

  if (!options.preventOverflowTrigger && state.overflowBomb && overflow > 0 && !state.overflowTriggeredInEvent && !state.resolvingOverflowBomb) {
    state.overflowTriggeredInEvent = true;
    triggerOverflowSurge();
  }
}

function applyHazardDamage(amount, options = {}) {
  if (amount <= 0 || state.dead) {
    return;
  }

  let damageLeft = amount;
  if (options.affectsArmor !== false && state.armor > 0) {
    const absorbed = Math.min(state.armor, damageLeft);
    state.armor -= absorbed;
    damageLeft -= absorbed;
    if (absorbed > 0 && damageLeft <= 0) {
      state.cameraShake.amplitude = Math.max(state.cameraShake.amplitude, 1.1);
      state.damageFlash = Math.min(1, state.damageFlash + 0.45);
      showPerkToast(`Броня -${absorbed}`);
      return;
    }
    if (absorbed > 0) {
      showPerkToast(`Броня -${absorbed}`);
    }
  }

  state.hp = Math.max(0, state.hp - damageLeft);
  state.cameraShake.amplitude = Math.max(state.cameraShake.amplitude, 1.3);
  state.damageFlash = Math.min(1, state.damageFlash + 0.8);
  showHpToast(damageLeft);
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
  applyHazardDamage(FUEL_DEPLETION_HP_COST, { affectsArmor: false });
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

function removeGasCell(x, y) {
  const index = cellIndex(x, y);
  if (!state.gasMask[index]) {
    return;
  }

  state.gasMask[index] = 0;
  const key = `${x},${y}`;
  for (let i = state.gasClouds.length - 1; i >= 0; i -= 1) {
    const cloud = state.gasClouds[i];
    cloud.cells = cloud.cells.filter((cell) => !(cell.x === x && cell.y === y));
    cloud.frontier = cloud.frontier.filter((cell) => !(cell.x === x && cell.y === y));
    cloud.visited.delete(key);
    if (cloud.cells.length === 0) {
      state.gasClouds.splice(i, 1);
    }
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
    if (jet.released) {
      jet.lifetime -= dt;
      if (jet.lifetime <= 0) {
        addSteamCells(jet.cells, -1);
        state.steamJets.splice(i, 1);
      }
      continue;
    }
    jet.timer -= dt;
    if (jet.timer > 0) {
      continue;
    }
    jet.released = true;
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
    let hitsOtherBoulder = false;
    for (let j = 0; j < state.boulders.length; j += 1) {
      if (j === i) {
        continue;
      }
      if (state.boulders[j].x === nextX && state.boulders[j].y === nextY) {
        hitsOtherBoulder = true;
        break;
      }
    }
    if (hitsOtherBoulder || state.boulderPocketMask[nextIndex]) {
      state.boulders.splice(i, 1);
      continue;
    }
    if (state.metalMask[nextIndex]) {
      state.boulders.splice(i, 1);
      continue;
    }
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
    if (options.delayedChain) {
      scheduleChainExplosion({
        kind: "volatile",
        x,
        y,
        damage: Math.max(1, state.drillPower * 3),
        radius: 1.25,
      });
    } else {
      explodeAt(x, y, Math.max(1, state.drillPower * 3), 1.25, { cause: "explosion" });
    }
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
  if (state.metalMask[index]) {
    if (options.byDrill) {
      spawnImpactEffect(x, y, options.dirX ?? state.drill.facingX ?? 0, options.dirY ?? state.drill.facingY ?? 1, 8);
    }
    return false;
  }
  if (!state.hardness[index]) {
    return false;
  }
  const hazardType = state.hazardMask[index];
  const allowHazardChain = options.allowHazardChain && hazardType === HAZARD_TYPES.VOLATILE;
  const spikeExplosion = hazardType === HAZARD_TYPES.SPIKE && options.cause === "explosion";
  if ((!options.ignoreHazardEffect || allowHazardChain) && hazardType && !state.hazardTriggeredMask[index]) {
    state.hazardTriggeredMask[index] = 1;
    triggerHazardEffect(hazardType, x, y, {
      suppressPlayerDamage: !!options.allowHazardChain,
      delayedChain: allowHazardChain,
    });
  }

  if (options.byDrill) {
    spawnImpactEffect(x, y, options.dirX ?? state.drill.facingX ?? 0, options.dirY ?? state.drill.facingY ?? 1, state.hardness[index]);
  }

  const actualDamage = spikeExplosion ? state.health[index] : Math.min(state.health[index], damage);
  spawnDamageNumberEffect(x, y, actualDamage);
  state.health[index] -= spikeExplosion ? actualDamage : damage;
  if (state.health[index] > 0) {
    return false;
  }

  breakCell(x, y, index, options);
  return true;
}

function triggerSpikeChain(x, y) {
  for (let oy = -1; oy <= 1; oy += 1) {
    for (let ox = -1; ox <= 1; ox += 1) {
      if (ox === 0 && oy === 0) {
        continue;
      }
      const nx = x + ox;
      const ny = y + oy;
      if (nx < 1 || ny < 1 || nx >= GRID_W - 1 || ny >= GRID_H - 1) {
        continue;
      }
      const index = cellIndex(nx, ny);
      if (state.hazardMask[index] !== HAZARD_TYPES.SPIKE || !state.hardness[index]) {
        continue;
      }
      scheduleChainExplosion({
        kind: "spike",
        x: nx,
        y: ny,
      });
    }
  }
}

function breakCell(x, y, index, options = {}) {
  const hardness = state.hardness[index];
  const blockType = BLOCK_TYPES[hardness];
  if (!blockType) {
    return;
  }
  const hazardType = state.hazardMask[index];
  const scrapMultiplier = state.loopScrapMask[index] > 0 ? state.loopScrapMask[index] : 1;
  const scrapGain =
    hazardType === HAZARD_TYPES.SPIKE && options.cause === "explosion"
      ? 1
      : Math.max(0, Math.floor((blockType.scrap + state.scrapBonus) * scrapMultiplier));
  spawnBreakEffect(x, y, hardness, options.cause || "break");
  state.hardness[index] = 0;
  state.health[index] = 0;
  state.scrap += scrapGain;
  runFuelEvent(() => addFuel(state.fuelOnBreak, x, y, { preventOverflowTrigger: true }));
  state.blocksBroken += 1;
  if (options.byDrill) {
    state.drillBrokenBlocks += 1;
  }
  if (hazardType === HAZARD_TYPES.SPIKE && state.spikeOverdriveLevel > 0) {
    const durations = [0, 5, 7, 10];
    activateDrillOverdrive(durations[state.spikeOverdriveLevel] || 5, "Шиповой форсаж");
  }
  showScrapToast(scrapGain);
  state.hazardMask[index] = 0;
  state.hazardTriggeredMask[index] = 0;
  state.loopScrapMask[index] = 0;
  if (hazardType === HAZARD_TYPES.SPIKE && options.cause === "explosion") {
    triggerSpikeChain(x, y);
  }
  if (state.remoteBombInterval > 0 && options.byDrill && state.drillBrokenBlocks % state.remoteBombInterval === 0) {
    triggerRemoteBombSquare(x, y, 1);
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
    startDrillMoveAnimation(x, y);
    state.drill.x = x;
    state.drill.y = y;
    recordPlayerMove(options.fromX, options.fromY, x, y);
  }
}

function explodeAt(x, y, damage, radius = 2, options = {}) {
  spawnExplosionEffect(x, y, radius);
  const breakDamage = options.guaranteedBreak === false ? damage : Math.max(damage, EXPLOSION_BREAK_DAMAGE);
  const maxOffset = Math.ceil(radius);
  for (let oy = -maxOffset; oy <= maxOffset; oy += 1) {
    for (let ox = -maxOffset; ox <= maxOffset; ox += 1) {
      if (Math.hypot(ox, oy) > radius) {
        continue;
      }
      const tx = x + ox;
      const ty = y + oy;
      if (options.triggerGas !== false && tx >= 1 && ty >= 1 && tx < GRID_W - 1 && ty < GRID_H - 1 && state.gasMask[cellIndex(tx, ty)]) {
        scheduleChainExplosion({
          kind: "gas",
          x: tx,
          y: ty,
        });
      }
      damageCell(tx, ty, breakDamage, {
        ignoreHazardEffect: true,
        allowHazardChain: true,
        cause: "explosion",
      });
    }
  }
}

function spawnRocketEffect(fromX, fromY, targetX, targetY, payload) {
  const dx = targetX - fromX;
  const dy = targetY - fromY;
  const distance = Math.hypot(dx, dy);
  const duration = 0.18 + distance * 0.07;
  state.effects.push({
    kind: "rocket",
    time: duration,
    duration,
    fromX,
    fromY,
    targetX,
    targetY,
    arcHeight: 10 + distance * 4,
    seed: (state.lastTs || 0) + targetX * 31 + targetY * 17,
    payload,
  });
}

function detonateRocketEffect(effect) {
  if (!effect?.payload) {
    return;
  }

  if (effect.payload.kind === "radiusBomb") {
    explodeAt(effect.targetX, effect.targetY, effect.payload.damage, effect.payload.radius, {
      guaranteedBreak: true,
    });
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
  const damage = EXPLOSION_BREAK_DAMAGE;

  spawnRocketEffect(originX, originY, centerX, centerY, {
    kind: "radiusBomb",
    damage,
    radius: 1,
  });
}

function recordPlayerMove(fromX, fromY, toX, toY) {
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
  state.playerMoveProgress += 1;
  const baseMoveInterval = getBaseMoveInterval();
  if (state.playerMoveProgress >= baseMoveInterval) {
    state.playerMoveProgress -= baseMoveInterval;
    maybeMoveBase();
  }
}

function recordJumpMove(fromX, fromY, toX, toY) {
  const stepX = Math.sign(toX - fromX);
  const stepY = Math.sign(toY - fromY);
  let prevX = fromX;
  let prevY = fromY;
  let x = fromX;
  let y = fromY;

  while (x !== toX || y !== toY) {
    x += stepX;
    y += stepY;
    recordPlayerMove(prevX, prevY, x, y);
    prevX = x;
    prevY = y;
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
    if (state.metalMask[cellIndex(toX, toY)]) {
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

function getBaseMoveInterval() {
  const distance = Math.hypot(state.base.x - state.drill.x, state.base.y - state.drill.y);
  if (distance <= 5) {
    return 3;
  }
  return 8;
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
  const sourceTunnel = state.tunnelMask[fromIndex];
  const sourceHardness = state.hardness[fromIndex];
  const sourceHealth = state.health[fromIndex];
  const sourcePerk = state.perkMask[fromIndex];
  const sourceCrystal = state.crystalMask[fromIndex];
  const sourceHazard = state.hazardMask[fromIndex];
  const sourceHazardTriggered = state.hazardTriggeredMask[fromIndex];
  const sourceLoopScrap = state.loopScrapMask[fromIndex];
  const targetVisual = captureCellVisualData(toIndex);
  const targetTunnel = state.tunnelMask[toIndex];
  const targetHardness = state.hardness[toIndex];
  const targetHealth = state.health[toIndex];
  const targetPerk = state.perkMask[toIndex];
  const targetCrystal = state.crystalMask[toIndex];
  const targetHazard = state.hazardMask[toIndex];
  const targetHazardTriggered = state.hazardTriggeredMask[toIndex];
  const targetLoopScrap = state.loopScrapMask[toIndex];

  state.tunnelMask[toIndex] = sourceTunnel;
  state.hardness[toIndex] = sourceHardness;
  state.health[toIndex] = sourceHealth;
  state.perkMask[toIndex] = sourcePerk;
  state.crystalMask[toIndex] = sourceCrystal;
  state.hazardMask[toIndex] = sourceHazard;
  state.hazardTriggeredMask[toIndex] = sourceHazardTriggered;
  state.loopScrapMask[toIndex] = sourceLoopScrap;

  state.tunnelMask[fromIndex] = targetTunnel;
  state.hardness[fromIndex] = targetHardness;
  state.health[fromIndex] = targetHealth;
  state.perkMask[fromIndex] = targetPerk;
  state.crystalMask[fromIndex] = targetCrystal;
  state.hazardMask[fromIndex] = targetHazard;
  state.hazardTriggeredMask[fromIndex] = targetHazardTriggered;
  state.loopScrapMask[fromIndex] = targetLoopScrap;
  startBaseMoveAnimation(toX, toY);
  startTileMoveAnimation(targetVisual, toX, toY, fromX, fromY, BASE_MOVE_ANIMATION_DURATION);
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

function tryAutoCloseContour() {
  if (state.pathTiles.length < 4) {
    return false;
  }

  const current = state.pathTiles[state.pathTiles.length - 1];
  const heroX = state.drill.x;
  const heroY = state.drill.y;
  const candidates = [];
  for (let i = 0; i < state.pathTiles.length - 1; i += 1) {
    const point = state.pathTiles[i];
    const sameRow = point.y === current.y && point.x !== current.x;
    const sameCol = point.x === current.x && point.y !== current.y;
    if (!sameRow && !sameCol) {
      continue;
    }
    candidates.push({
      targetX: point.x,
      targetY: point.y,
      targetIndex: i,
      distance: Math.abs(point.x - current.x) + Math.abs(point.y - current.y),
    });
  }

  candidates.sort((a, b) => a.distance - b.distance);

  for (let i = 0; i < candidates.length; i += 1) {
    const candidate = candidates[i];
    const stepX = Math.sign(candidate.targetX - current.x);
    const stepY = Math.sign(candidate.targetY - current.y);
    let x = current.x;
    let y = current.y;
    let blocked = false;

    while (x !== candidate.targetX || y !== candidate.targetY) {
      x += stepX;
      y += stepY;
      const index = cellIndex(x, y);
      const isTarget = x === candidate.targetX && y === candidate.targetY;
      if (!isTarget && state.pathIndexByCell[index] !== -1) {
        blocked = true;
        break;
      }
    }

    if (blocked) {
      continue;
    }

    const loopPath = state.pathTiles.slice(candidate.targetIndex);
    if (loopPath.length < 3) {
      continue;
    }
    const polygon = [];
    for (let j = 0; j < loopPath.length; j += 1) {
      polygon.push({
        x: loopPath[j].x + 0.5,
        y: loopPath[j].y + 0.5,
      });
    }
    polygon.push({ x: candidate.targetX + 0.5, y: candidate.targetY + 0.5 });

    let minX = GRID_W;
    let maxX = 0;
    let minY = GRID_H;
    let maxY = 0;
    for (let j = 0; j < loopPath.length; j += 1) {
      minX = Math.min(minX, loopPath[j].x);
      maxX = Math.max(maxX, loopPath[j].x);
      minY = Math.min(minY, loopPath[j].y);
      maxY = Math.max(maxY, loopPath[j].y);
    }
    minX = clamp(minX, 1, GRID_W - 2);
    maxX = clamp(maxX, 1, GRID_W - 2);
    minY = clamp(minY, 1, GRID_H - 2);
    maxY = clamp(maxY, 1, GRID_H - 2);
    if (maxX - minX < 1 || maxY - minY < 1) {
      continue;
    }

    x = current.x;
    y = current.y;
    while (x !== candidate.targetX || y !== candidate.targetY) {
      x += stepX;
      y += stepY;
      const index = cellIndex(x, y);
      if (!state.tunnelMask[index]) {
        damageCell(x, y, EXPLOSION_BREAK_DAMAGE, {
          ignoreHazardEffect: true,
          allowHazardChain: true,
          cause: "explosion",
        });
      }
      extendPath(x, y);
      if (state.pathTiles.length === 1 && state.pathTiles[0].x === x && state.pathTiles[0].y === y) {
        state.pathTiles[0] = { x: heroX, y: heroY };
        rebuildPathIndex();
        return true;
      }
    }
    if (blocked) {
      continue;
    }
    return true;
  }

  return false;
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
  if (state.metalMask[targetIndex]) {
    return false;
  }
  const targetWasTunnel = state.tunnelMask[targetIndex] === 1;
  const targetHardness = state.hardness[targetIndex];
  const targetHealth = state.health[targetIndex];
  const targetVisual = captureCellVisualData(targetIndex);

  state.fuel -= moveCost;
  state.jumpCharges -= 1;

  if (!targetWasTunnel) {
    state.tunnelMask[fromIndex] = 0;
    state.hardness[fromIndex] = targetHardness;
    state.health[fromIndex] = targetHealth;
    state.perkMask[fromIndex] = 0;
    removePathTile(fromX, fromY);
  }

  startDrillMoveAnimation(jumpX, jumpY, MOVE_ANIMATION_DURATION + Math.max(Math.abs(jumpX - fromX), Math.abs(jumpY - fromY)) * 0.04);
  state.drill.x = jumpX;
  state.drill.y = jumpY;
  carveTunnel(jumpX, jumpY);
  if (!targetWasTunnel) {
    startTileMoveAnimation(targetVisual, jumpX, jumpY, fromX, fromY, TILE_SWAP_ANIMATION_DURATION + Math.max(Math.abs(jumpX - fromX), Math.abs(jumpY - fromY)) * 0.04);
  }
  recordJumpMove(fromX, fromY, jumpX, jumpY);
  state.drill.progress = 0;
  state.drill.strikeEnergy = 0.35;
  return true;
}

function updateCameraShake(dt) {
  state.cameraShake.time += dt * 24;
  state.cameraShake.amplitude = Math.max(0, state.cameraShake.amplitude - dt * 18);
}

function updateCamera(dt) {
  const targetX = state.drill.renderX * TILE_SIZE - state.width * 0.5;
  const targetY = state.drill.renderY * TILE_SIZE - state.height * 0.56;
  const maxX = GRID_W * TILE_SIZE - state.width;
  const maxY = GRID_H * TILE_SIZE - state.height;
  const clampedTargetX = clamp(targetX, 0, Math.max(0, maxX));
  const clampedTargetY = clamp(targetY, 0, Math.max(0, maxY));
  const follow = 1 - Math.exp(-dt * 10);
  state.camera.x += (clampedTargetX - state.camera.x) * follow;
  state.camera.y += (clampedTargetY - state.camera.y) * follow;
}

function updateDrill(dt) {
  state.drill.actionCooldown = Math.max(0, state.drill.actionCooldown - dt);

  if (state.stunTimer > 0) {
    state.drill.progress = 0;
    state.drill.strikeEnergy = Math.max(0, state.drill.strikeEnergy - dt * 6);
    state.drill.strikeLatch = false;
    return;
  }

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
    state.drillIdleFrame = true;
    state.idleTime += dt;
    if (!state.idleAutoCloseTriggered && state.idleTime >= state.idleAutoCloseDelay) {
      state.idleAutoCloseTriggered = true;
      if (!tryAutoCloseContour()) {
        showPerkToast("Контур не найден");
      }
    }
    state.drill.progress = 0;
    state.drill.strikeEnergy = Math.max(0, state.drill.strikeEnergy - dt * 5);
    state.drill.strikeLatch = false;
    return;
  }

  state.idleTime = 0;
  state.idleAutoCloseTriggered = false;

  const targetX = clamp(state.drill.x + dx, 1, GRID_W - 2);
  const targetY = clamp(state.drill.y + dy, 1, GRID_H - 2);
  const targetIndex = cellIndex(targetX, targetY);

  state.drill.facingX = dx;
  state.drill.facingY = dy;
  const fuelFactor = state.maxFuel > 0 ? 1 - state.fuel / state.maxFuel : 0;
  const lowFuelBoost = 1 + fuelFactor * state.lowFuelSpeedBonus;
  const overdriveBoost = state.overhealDrillTimer > 0 ? 1.75 : 1;
  const actionRate = STRIKE_CYCLE_SPEED * state.strikeSpeed * lowFuelBoost * overdriveBoost;
  const actionInterval = (Math.PI * 2) / actionRate;
  state.drill.strikePhase += dt * actionRate;
  state.drill.strikeEnergy = Math.min(1, state.drill.strikeEnergy + dt * 9);
  const strikeWave = Math.max(0, Math.sin(state.drill.strikePhase));

  if (state.tunnelMask[targetIndex]) {
    if (state.drill.actionCooldown > 0) {
      return;
    }

    if (tryJumpMove(dx, dy)) {
      state.drill.strikePhase = Math.PI * 0.5;
      state.drill.actionCooldown = actionInterval;
      return;
    }

    if (state.fuel < state.moveFuelCost) {
      state.fuel = 0;
      return;
    }
    state.drill.strikePhase = Math.PI * 0.5;
    state.drill.actionCooldown = actionInterval;
    state.fuel -= state.moveFuelCost;
    const fromX = state.drill.x;
    const fromY = state.drill.y;
    startDrillMoveAnimation(targetX, targetY);
    state.drill.x = targetX;
    state.drill.y = targetY;
    state.drill.progress = 0;
    state.drill.strikeEnergy = 0.35;
    recordPlayerMove(fromX, fromY, targetX, targetY);
    return;
  }

  if (state.drill.actionCooldown > 0) {
    return;
  }

  if (tryJumpMove(dx, dy)) {
    state.drill.strikePhase = Math.PI * 0.5;
    state.drill.actionCooldown = actionInterval;
    return;
  }

  if (state.overhealDrillTimer <= 0 && state.fuel < state.strikeFuelCost) {
    state.fuel = 0;
    return;
  }

  state.drill.strikePhase = Math.PI * 0.5;
  state.drill.actionCooldown = actionInterval;
  if (state.overhealDrillTimer <= 0) {
    state.fuel -= state.strikeFuelCost;
  }
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
    Math.min(1.8, 0.28 + hardness * 0.22) * Math.max(state.drill.strikeEnergy, 0.35),
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
    damageCell(targetX - dy, targetY + dx, diagonalDamage, { byDrill: true, dirX: dx - dy, dirY: dy + dx });
    damageCell(targetX + dy, targetY - dx, diagonalDamage, { byDrill: true, dirX: dx + dy, dirY: dy - dx });
  }

  addHeatOnStrike(HEAT_PER_STRIKE + state.heatGainBonus);

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
  let reading = "Холодно";

  if (delta < 0) {
    state.signalText = "Горячо";
    reading = "Горячо";
  } else {
    state.signalText = "Холодно";
    reading = "Холодно";
  }

  if (state.signalMovesLeft === 0) {
    state.signalMovesMax = 0;
    state.signalText = "Сигнал пуст";
  }
  return reading;
}

function updateDiscovery() {
  state.base.visible = isVisibleCell(state.base.x, state.base.y);
  if (state.drill.x === state.base.x && state.drill.y === state.base.y) {
    state.baseFound = true;
  }
}

function extendPath(x, y) {
  const tail = state.pathTiles[state.pathTiles.length - 1];
  if (tail && tail.x === x && tail.y === y) {
    return;
  }

  const existingIndex = state.pathIndexByCell[cellIndex(x, y)];
  if (existingIndex !== -1) {
    if (existingIndex === state.pathTiles.length - 2) {
      const fuelByLevel = [0, 3, 4, 5];
      const returnFuel = fuelByLevel[state.contourReturnFuelLevel] || 0;
      if (returnFuel > 0) {
        addFuel(returnFuel, x, y);
      }
      state.pathTiles.length = existingIndex + 1;
      rebuildPathIndex();
      return;
    }
    if (triggerPathLoop(existingIndex, x, y)) {
      state.pathTiles.length = 0;
      state.pathTiles.push({ x, y });
      rebuildPathIndex();
    }
    return;
  }

  state.depth = Math.max(state.depth, Math.abs(y - START_Y));
  state.pathTiles.push({ x, y });
  rebuildPathIndex();
}

function triggerPathLoop(loopStartIndex, targetX, targetY) {
  const loopPath = state.pathTiles.slice(loopStartIndex);
  if (loopPath.length < 3) {
    return false;
  }

  const polygon = [];
  for (let i = 0; i < loopPath.length; i += 1) {
    polygon.push({
      x: loopPath[i].x + 0.5,
      y: loopPath[i].y + 0.5,
    });
  }
  polygon.push({ x: targetX + 0.5, y: targetY + 0.5 });

  let minX = GRID_W;
  let maxX = 0;
  let minY = GRID_H;
  let maxY = 0;
  for (let i = 0; i < loopPath.length; i += 1) {
    minX = Math.min(minX, loopPath[i].x);
    maxX = Math.max(maxX, loopPath[i].x);
    minY = Math.min(minY, loopPath[i].y);
    maxY = Math.max(maxY, loopPath[i].y);
  }
  minX = clamp(minX, 1, GRID_W - 2);
  maxX = clamp(maxX, 1, GRID_W - 2);
  minY = clamp(minY, 1, GRID_H - 2);
  maxY = clamp(maxY, 1, GRID_H - 2);

  if (maxX - minX < 1 || maxY - minY < 1) {
    return false;
  }

  const affectedCells = [];
  const interiorCells = [];
  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      if (!isPointInPolygon(x + 0.5, y + 0.5, polygon)) {
        continue;
      }
      interiorCells.push({ x, y });
      const index = cellIndex(x, y);
      state.loopScrapMask[index] = 0.5;
      if (state.tunnelMask[index]) {
        continue;
      }
      affectedCells.push({ x, y });
      damageCell(x, y, EXPLOSION_BREAK_DAMAGE, {
        ignoreHazardEffect: true,
        allowHazardChain: true,
        cause: "explosion",
      });
    }
  }

  activateLoopCharge(interiorCells.length);
  maybeSpawnLoopPerk(interiorCells);
  spawnLoopFieldEffect(loopPath, affectedCells);
  return true;
}

function activateLoopCharge(cellCount) {
  if (state.loopChargeLevel <= 0 || cellCount <= 0) {
    return;
  }
  state.loopChargeDuration = Math.max(3, Math.min(6, 2 + state.loopChargeLevel));
  state.loopChargeTimer = state.loopChargeDuration;
  state.loopChargeDamageBonus = cellCount * 0.05;
  showPerkToast(`Контурный заряд +${Math.round(state.loopChargeDamageBonus * 100)}%`);
}

function getLoopPerkBlockHardness(x, y) {
  let total = 0;
  let count = 0;
  for (let i = 0; i < CARDINAL_DIRS.length; i += 1) {
    const nx = x + CARDINAL_DIRS[i].x;
    const ny = y + CARDINAL_DIRS[i].y;
    if (nx < 1 || ny < 1 || nx >= GRID_W - 1 || ny >= GRID_H - 1) {
      continue;
    }
    const neighborHardness = state.hardness[cellIndex(nx, ny)];
    if (neighborHardness > 0) {
      total += neighborHardness;
      count += 1;
    }
  }
  if (count > 0) {
    return clamp(Math.round(total / count), 1, BLOCK_TYPES.length - 1);
  }
  const centerRatio = clamp(getCenterDistanceRatio(x, y), 0, 1.8);
  return clamp(1 + Math.round(centerRatio * 2 + state.worldRandom() * 2), 1, BLOCK_TYPES.length - 1);
}

function maybeSpawnLoopPerk(interiorCells) {
  const chance = getLoopPerkChance(interiorCells.length);
  if (chance <= 0 || state.worldRandom() >= chance) {
    return;
  }

  const candidates = [];
  for (let i = 0; i < interiorCells.length; i += 1) {
    const cell = interiorCells[i];
    const index = cellIndex(cell.x, cell.y);
    if (
      state.perkMask[index] > 0 ||
      state.perkZoneMask[index] !== -1 ||
      state.metalMask[index] ||
      state.gasPocketMask[index] ||
      state.steamPocketMask[index] ||
      state.boulderPocketMask[index] ||
      (cell.x === state.base.x && cell.y === state.base.y) ||
      (cell.x === START_X && cell.y === START_Y)
    ) {
      continue;
    }
    candidates.push(cell);
  }

  if (!candidates.length) {
    return;
  }

  const cell = candidates[Math.floor(state.worldRandom() * candidates.length)];
  const index = cellIndex(cell.x, cell.y);
  const hardness = getLoopPerkBlockHardness(cell.x, cell.y);
  state.tunnelMask[index] = 0;
  state.hardness[index] = hardness;
  state.health[index] = BLOCK_TYPES[hardness].hp;
  state.hazardMask[index] = 0;
  state.hazardTriggeredMask[index] = 0;
  state.loopScrapMask[index] = 0;
  state.perkMask[index] = chooseTilePerkForPosition(cell.x, cell.y, state.worldRandom);
  showPerkToast("Контурный трофей");
}

function isPointInPolygon(px, py, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;
    const intersects =
      yi > py !== yj > py &&
      px < ((xj - xi) * (py - yi)) / ((yj - yi) || 1e-6) + xi;
    if (intersects) {
      inside = !inside;
    }
  }
  return inside;
}

function spawnLoopFieldEffect(loopPath, affectedCells) {
  const sampleLimit = 84;
  const sampledCells = [];
  const sampleStep = Math.max(1, Math.floor(affectedCells.length / sampleLimit));
  for (let i = 0; i < affectedCells.length; i += sampleStep) {
    sampledCells.push(affectedCells[i]);
    if (sampledCells.length >= sampleLimit) {
      break;
    }
  }

  const perimeter = loopPath.map((tile) => ({ x: tile.x, y: tile.y }));
  perimeter.push({ x: loopPath[0].x, y: loopPath[0].y });

  state.effects.push({
    kind: "loopField",
    time: LOOP_FIELD_EFFECT_DURATION,
    duration: LOOP_FIELD_EFFECT_DURATION,
    perimeter,
    cells: sampledCells,
    seed: (state.lastTs || 0) + affectedCells.length * 17,
  });
}

function isVisibleCell(x, y) {
  return state.visibleMask[cellIndex(x, y)] === 1;
}

function getCamera() {
  const shakeX = Math.sin(state.cameraShake.time * 1.7) * state.cameraShake.amplitude;
  const shakeY = Math.cos(state.cameraShake.time * 2.3) * state.cameraShake.amplitude * 0.7;
  return {
    x: state.camera.x + shakeX,
    y: state.camera.y + shakeY,
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
      const length = Math.hypot(effect.dirX, effect.dirY) || 1;
      const dirX = effect.dirX / length;
      const dirY = effect.dirY / length;
      const perpX = -dirY;
      const perpY = dirX;
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = "#ffe2a6";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + dirX * reach, cy + dirY * reach);
      ctx.stroke();
      ctx.strokeStyle = "rgba(255, 248, 220, 0.8)";
      ctx.beginPath();
      ctx.moveTo(cx + dirX * reach, cy + dirY * reach);
      ctx.lineTo(cx + dirX * (reach + 6) + perpX * 4, cy + dirY * (reach + 6) + perpY * 4);
      ctx.moveTo(cx + dirX * reach, cy + dirY * reach);
      ctx.lineTo(cx + dirX * (reach + 5) - perpX * 4, cy + dirY * (reach + 5) - perpY * 4);
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
    } else if (effect.kind === "rocket") {
      const t = clamp(progress, 0, 1);
      const startX = effect.fromX * TILE_SIZE + TILE_SIZE * 0.5 - camera.x;
      const startY = effect.fromY * TILE_SIZE + TILE_SIZE * 0.5 - camera.y;
      const endX = effect.targetX * TILE_SIZE + TILE_SIZE * 0.5 - camera.x;
      const endY = effect.targetY * TILE_SIZE + TILE_SIZE * 0.5 - camera.y;
      const midX = startX + (endX - startX) * t;
      const midY = startY + (endY - startY) * t - Math.sin(t * Math.PI) * effect.arcHeight;
      const tailX = startX + (endX - startX) * Math.max(0, t - 0.08);
      const tailY = startY + (endY - startY) * Math.max(0, t - 0.08) - Math.sin(Math.max(0, t - 0.08) * Math.PI) * effect.arcHeight;

      ctx.strokeStyle = "rgba(255, 213, 155, 0.8)";
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(midX, midY);
      ctx.stroke();

      const gradient = ctx.createRadialGradient(midX - 1, midY - 1, 1, midX, midY, 8);
      gradient.addColorStop(0, "rgba(255,248,224,0.95)");
      gradient.addColorStop(0.45, "rgba(255,172,92,0.85)");
      gradient.addColorStop(1, "rgba(255,120,32,0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(midX, midY, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffd59b";
      ctx.beginPath();
      ctx.arc(midX, midY, 2.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "rgba(255, 238, 196, 0.65)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(midX - 3, midY);
      ctx.lineTo(midX + 3, midY);
      ctx.moveTo(midX, midY - 3);
      ctx.lineTo(midX, midY + 3);
      ctx.stroke();
    } else if (effect.kind === "damageNumber") {
      const alpha = 1 - progress;
      const driftX = (((effect.seed % 7) - 3) / 3) * 6 * progress;
      const lift = progress * 18;
      const text = `${Math.max(1, Math.round(effect.value))}`;

      ctx.globalAlpha = alpha;
      ctx.font = `700 15px ${HUD_FONT}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.lineWidth = 3.2;
      ctx.strokeStyle = "rgba(27, 15, 10, 0.88)";
      ctx.fillStyle = "#fff7ea";
      ctx.strokeText(text, cx + driftX, cy - 8 - lift);
      ctx.fillText(text, cx + driftX, cy - 8 - lift);
    } else if (effect.kind === "loopField") {
      const alpha = 1 - progress;
      ctx.globalAlpha = alpha;
      for (let cellIndex = 0; cellIndex < effect.cells.length; cellIndex += 1) {
        const cell = effect.cells[cellIndex];
        const sx = cell.x * TILE_SIZE - camera.x;
        const sy = cell.y * TILE_SIZE - camera.y;
        const pulse = 0.35 + (Math.sin(progress * 16 - cellIndex * 0.6) * 0.5 + 0.5) * 0.45;
        ctx.fillStyle = `rgba(110, 228, 255, ${0.1 + pulse * 0.22})`;
        ctx.fillRect(sx + 3, sy + 3, TILE_SIZE - 6, TILE_SIZE - 6);
        ctx.strokeStyle = `rgba(255, 230, 164, ${0.18 + pulse * 0.28})`;
        ctx.lineWidth = 1.4;
        ctx.strokeRect(sx + 5, sy + 5, TILE_SIZE - 10, TILE_SIZE - 10);
      }

      if (effect.perimeter.length > 1) {
        ctx.strokeStyle = `rgba(255, 219, 142, ${0.32 + alpha * 0.42})`;
        ctx.lineWidth = 8;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        for (let pointIndex = 0; pointIndex < effect.perimeter.length; pointIndex += 1) {
          const point = effect.perimeter[pointIndex];
          const px = point.x * TILE_SIZE + TILE_SIZE * 0.5 - camera.x;
          const py = point.y * TILE_SIZE + TILE_SIZE * 0.5 - camera.y;
          if (pointIndex === 0) {
            ctx.moveTo(px, py);
          } else {
            ctx.lineTo(px, py);
          }
        }
        ctx.stroke();

        ctx.strokeStyle = `rgba(112, 232, 255, ${0.28 + alpha * 0.4})`;
        ctx.lineWidth = 3;
        ctx.stroke();
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
      const hiddenByAnim = isAnimatedTileDestination(x, y);

      if (hiddenByAnim) {
        continue;
      }

      if (!visible) {
        ctx.save();
        ctx.globalAlpha = 0.16;
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
        ctx.restore();
        ctx.fillStyle = "rgba(6, 4, 3, 0.72)";
        ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);
        ctx.strokeStyle = "rgba(255, 225, 179, 0.04)";
        ctx.strokeRect(sx, sy, TILE_SIZE, TILE_SIZE);
        continue;
      }

      if (state.tunnelMask[index]) {
        drawTileSprite(state.sprites.tunnel, sx, sy);
      } else if (state.metalMask[index]) {
        drawTileSprite(state.sprites.metal, sx, sy);
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

      if (!state.tunnelMask[index] && !state.metalMask[index] && !state.gasPocketMask[index] && !state.steamPocketMask[index] && !state.boulderPocketMask[index]) {
        const hazardType = state.hazardMask[index];
        if (hazardType) {
          drawTileSprite(state.sprites.hazards[hazardType], sx, sy);
        }
      }

      if (!state.tunnelMask[index] && !state.metalMask[index] && state.health[index] < BLOCK_TYPES[state.hardness[index]].hp) {
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
      renderCrystalTile(x, y, sx, sy);
    }
  }

  renderPath(camera);
  renderMovingTiles(camera);
  renderSteamJets(camera);
  renderEffects(camera);
  renderBase(camera);
  renderBoulders(camera);
  renderDrill(camera);
  renderFuelToast(camera);
  renderHpToast(camera);
  renderScrapToast(camera);
  renderPerkToast(camera);
  renderSignalStatus(camera);
  renderOverdriveStatus(camera);
  renderStunStatus(camera);
  renderHeatWarningStatus(camera);
  renderLoopChargeStatus(camera);
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

function isAnimatedTileDestination(x, y) {
  for (let i = 0; i < state.tileAnimations.length; i += 1) {
    const anim = state.tileAnimations[i];
    if (anim.toX === x && anim.toY === y) {
      return true;
    }
  }
  return false;
}

function drawCellVisualContent(content, sx, sy) {
  if (content.tunnel) {
    drawTileSprite(state.sprites.tunnel, sx, sy);
  } else if (content.metal) {
    drawTileSprite(state.sprites.metal, sx, sy);
  } else if (content.gasPocket) {
    drawTileSprite(state.sprites.gasPocket, sx, sy);
  } else if (content.steamPocket) {
    drawTileSprite(state.sprites.steamPocket, sx, sy);
  } else if (content.boulderPocket) {
    drawTileSprite(state.sprites.boulderPocket, sx, sy);
  } else {
    drawTileSprite(state.sprites.blocks[content.hardness], sx, sy);
  }

  const ctx = state.ctx;
  ctx.strokeStyle = "rgba(255, 225, 179, 0.05)";
  ctx.strokeRect(sx, sy, TILE_SIZE, TILE_SIZE);

  if (content.gas && !content.gasPocket) {
    const alpha = 0.22;
    ctx.fillStyle = `rgba(158, 240, 108, ${alpha})`;
    ctx.beginPath();
    ctx.arc(sx + TILE_SIZE * 0.38, sy + TILE_SIZE * 0.44, 7, 0, Math.PI * 2);
    ctx.arc(sx + TILE_SIZE * 0.6, sy + TILE_SIZE * 0.54, 8, 0, Math.PI * 2);
    ctx.arc(sx + TILE_SIZE * 0.46, sy + TILE_SIZE * 0.7, 6, 0, Math.PI * 2);
    ctx.fill();
  }
  if (content.steam && !content.steamPocket) {
    const alpha = 0.22;
    ctx.fillStyle = `rgba(255, 207, 122, ${alpha})`;
    ctx.beginPath();
    ctx.arc(sx + TILE_SIZE * 0.36, sy + TILE_SIZE * 0.48, 6, 0, Math.PI * 2);
    ctx.arc(sx + TILE_SIZE * 0.58, sy + TILE_SIZE * 0.38, 7, 0, Math.PI * 2);
    ctx.arc(sx + TILE_SIZE * 0.5, sy + TILE_SIZE * 0.68, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  if (!content.tunnel && !content.metal && !content.gasPocket && !content.steamPocket && !content.boulderPocket && content.hazard) {
    drawTileSprite(state.sprites.hazards[content.hazard], sx, sy);
  }

  if (content.perk) {
    renderPerkTileAt(content.perk, sx, sy);
  }
  if (content.crystal) {
    renderCrystalTileAt(content.crystal, sx, sy);
  }
}

function renderMovingTiles(camera) {
  const ctx = state.ctx;
  ctx.save();
  for (let i = 0; i < state.tileAnimations.length; i += 1) {
    const anim = state.tileAnimations[i];
    const sx = anim.renderX * TILE_SIZE - camera.x;
    const sy = anim.renderY * TILE_SIZE - camera.y;
    drawCellVisualContent(anim.content, sx, sy);
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

  const x = state.base.renderX * TILE_SIZE - camera.x;
  const y = state.base.renderY * TILE_SIZE - camera.y;
  const frame = Math.floor((state.lastTs || 0) / 220) % state.sprites.baseFrames.length;
  ctx.save();
  ctx.fillStyle = "rgba(105, 210, 255, 0.14)";
  ctx.beginPath();
  ctx.arc(x + TILE_SIZE * 0.5, y + TILE_SIZE * 0.5, TILE_SIZE * 0.7, 0, Math.PI * 2);
  ctx.fill();
  ctx.drawImage(state.sprites.baseFrames[frame], x, y, TILE_SIZE, TILE_SIZE);
  renderCog(x + 14, y + TILE_SIZE - 13, 4 + (frame % 2), ctx);
  renderCog(x + TILE_SIZE - 14, y + TILE_SIZE - 13, 4 + ((frame + 1) % 2), ctx);
  ctx.restore();
}

function renderPerkTile(x, y, sx, sy) {
  const index = cellIndex(x, y);
  const perkType = state.perkMask[index];
  if (!perkType) {
    return;
  }

  renderPerkTileAt(perkType, sx, sy);
}

function renderPerkTileAt(perkType, sx, sy) {
  const ctx = state.ctx;
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

function renderCrystalTile(x, y, sx, sy) {
  const crystalType = state.crystalMask[cellIndex(x, y)];
  if (!crystalType) {
    return;
  }

  renderCrystalTileAt(crystalType, sx, sy);
}

function renderCrystalTileAt(crystalType, sx, sy) {
  const ctx = state.ctx;
  const crystal = CRYSTAL_TYPES[crystalType];
  ctx.save();
  ctx.fillStyle = crystal.glow;
  ctx.beginPath();
  ctx.arc(sx + TILE_SIZE * 0.5, sy + TILE_SIZE * 0.5, TILE_SIZE * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = crystal.color;
  ctx.beginPath();
  ctx.moveTo(sx + TILE_SIZE * 0.5, sy + 7);
  ctx.lineTo(sx + TILE_SIZE - 10, sy + TILE_SIZE * 0.38);
  ctx.lineTo(sx + TILE_SIZE * 0.62, sy + TILE_SIZE - 8);
  ctx.lineTo(sx + TILE_SIZE * 0.38, sy + TILE_SIZE - 8);
  ctx.lineTo(sx + 10, sy + TILE_SIZE * 0.38);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(38,24,16,0.72)";
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(sx + TILE_SIZE * 0.5, sy + 10);
  ctx.lineTo(sx + TILE_SIZE * 0.58, sy + TILE_SIZE * 0.48);
  ctx.lineTo(sx + TILE_SIZE * 0.45, sy + TILE_SIZE - 9);
  ctx.stroke();
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
  const ctx = state.ctx;
  const chargeRatio = zone.arming ? 1 - zone.armingTimer / PERK_ZONE_CHARGE_DELAY : 0;
  const isZoneCell = (tx, ty) => {
    if (tx < 0 || ty < 0 || tx >= GRID_W || ty >= GRID_H) {
      return false;
    }
    return state.perkZoneMask[cellIndex(tx, ty)] === zoneId;
  };

  ctx.save();
  if (zone.arming) {
    const pulse = 0.45 + (Math.sin((state.lastTs || 0) * 0.018) * 0.5 + 0.5) * 0.55;
    ctx.fillStyle = `${perk.color}${Math.round((0x20 + chargeRatio * 80 * pulse)).toString(16).padStart(2, "0")}`;
    ctx.fillRect(sx + 2, sy + 2, TILE_SIZE - 4, TILE_SIZE - 4);
    ctx.strokeStyle = `${perk.color}cc`;
    ctx.shadowColor = perk.color;
    ctx.shadowBlur = 10 + pulse * 10;
  } else {
    ctx.strokeStyle = `${perk.color}66`;
  }
  ctx.lineWidth = 2;
  ctx.fillStyle = `${perk.color}18`;
  ctx.fillRect(sx + 5, sy + 5, TILE_SIZE - 10, TILE_SIZE - 10);
  ctx.beginPath();
  if (!isZoneCell(x, y - 1)) {
    ctx.moveTo(sx + 4, sy + 4);
    ctx.lineTo(sx + TILE_SIZE - 4, sy + 4);
  }
  if (!isZoneCell(x + 1, y)) {
    ctx.moveTo(sx + TILE_SIZE - 4, sy + 4);
    ctx.lineTo(sx + TILE_SIZE - 4, sy + TILE_SIZE - 4);
  }
  if (!isZoneCell(x, y + 1)) {
    ctx.moveTo(sx + 4, sy + TILE_SIZE - 4);
    ctx.lineTo(sx + TILE_SIZE - 4, sy + TILE_SIZE - 4);
  }
  if (!isZoneCell(x - 1, y)) {
    ctx.moveTo(sx + 4, sy + 4);
    ctx.lineTo(sx + 4, sy + TILE_SIZE - 4);
  }
  ctx.stroke();

  if (x === zone.iconX && y === zone.iconY) {
    ctx.fillStyle = perk.color;
    ctx.font = `700 14px ${HUD_FONT}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(perk.icon, sx + TILE_SIZE * 0.5, sy + TILE_SIZE * 0.5 + 1);
  }

  ctx.restore();
}

function renderSteamJets(camera) {
  const ctx = state.ctx;
  const time = (state.lastTs || 0) * 0.01;

  ctx.save();
  for (let i = 0; i < state.steamJets.length; i += 1) {
    const jet = state.steamJets[i];
    if (!jet.released || jet.cells.length === 0) {
      continue;
    }

    const dirLength = Math.hypot(jet.dirX, jet.dirY) || 1;
    const dirX = jet.dirX / dirLength;
    const dirY = jet.dirY / dirLength;
    const perpX = -dirY;
    const perpY = dirX;
    const lifeRatio = clamp(jet.lifetime / Math.max(0.001, STEAM_LIFETIME), 0, 1);

    for (let c = 0; c < jet.cells.length; c += 1) {
      const cell = jet.cells[c];
      const cx = cell.x * TILE_SIZE + TILE_SIZE * 0.5 - camera.x;
      const cy = cell.y * TILE_SIZE + TILE_SIZE * 0.5 - camera.y;

      for (let s = 0; s < 3; s += 1) {
        const wave = (time * 2.6 + c * 0.37 + s * 0.22) % 1;
        const offset = (wave - 0.5) * TILE_SIZE * 0.78;
        const side = (s - 1) * 4.5;
        const sx = cx + dirX * offset + perpX * side;
        const sy = cy + dirY * offset + perpY * side;
        const ex = sx + dirX * (10 + s * 2);
        const ey = sy + dirY * (10 + s * 2);

        ctx.strokeStyle = `rgba(255, 242, 214, ${0.24 + lifeRatio * 0.3})`;
        ctx.lineWidth = 1.4 + s * 0.35;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, ey);
        ctx.stroke();
      }

      ctx.fillStyle = `rgba(255, 220, 170, ${0.06 + lifeRatio * 0.08})`;
      ctx.beginPath();
      ctx.ellipse(cx, cy, TILE_SIZE * 0.34, TILE_SIZE * 0.18, Math.atan2(dirY, dirX), 0, Math.PI * 2);
      ctx.fill();
    }
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
  const heatRatio = clamp(state.heat / Math.max(1, state.maxHeat), 0, 1);
  const idleCharge = clamp(state.idleTime / Math.max(IDLE_AUTO_CLOSE_MIN_DELAY, state.idleAutoCloseDelay), 0, 1);
  const idleBob = Math.sin(state.drill.strikePhase * 0.5) * 0.7;
  const bodyOffsetX = -state.drill.facingX * thrust * 2.2;
  const bodyOffsetY = -state.drill.facingY * thrust * 2.2 + idleBob;
  const hammerOffsetX = state.drill.facingX * thrust * 7;
  const hammerOffsetY = state.drill.facingY * thrust * 7;
  const px = state.drill.renderX * TILE_SIZE - camera.x + bodyOffsetX;
  const py = state.drill.renderY * TILE_SIZE - camera.y + bodyOffsetY;
  const frame = strikeWave > 0.78 ? 2 + (Math.floor((state.lastTs || 0) / 50) % 2) : Math.floor((state.lastTs || 0) / 160) % 2;
  const angle = state.drill.facingX > 0 ? Math.PI * 0.5 : state.drill.facingX < 0 ? -Math.PI * 0.5 : state.drill.facingY < 0 ? Math.PI : 0;
  ctx.save();
  ctx.translate(px + TILE_SIZE * 0.5, py + TILE_SIZE * 0.5);
  if (idleCharge > 0.01) {
    const pulse = 0.55 + Math.sin((state.lastTs || 0) * 0.012) * 0.15;
    ctx.fillStyle = `rgba(109, 239, 255, ${0.08 + idleCharge * 0.14 * pulse})`;
    ctx.beginPath();
    ctx.arc(0, 0, TILE_SIZE * (0.34 + idleCharge * 0.24), 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `rgba(132, 241, 255, ${0.22 + idleCharge * 0.5})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, TILE_SIZE * (0.28 + idleCharge * 0.18), 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 3; i += 1) {
      const angle = (state.lastTs || 0) * 0.01 + i * ((Math.PI * 2) / 3);
      const radius = TILE_SIZE * (0.18 + idleCharge * 0.22);
      const sx = Math.cos(angle) * radius;
      const sy = Math.sin(angle) * radius;
      ctx.fillStyle = `rgba(187, 247, 255, ${0.35 + idleCharge * 0.45})`;
      ctx.beginPath();
      ctx.arc(sx, sy, 1.7 + idleCharge * 1.1, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.rotate(angle);
  ctx.drawImage(state.sprites.drillFrames[frame], -TILE_SIZE * 0.5, -TILE_SIZE * 0.5, TILE_SIZE, TILE_SIZE);
  ctx.restore();

  if (heatRatio > 0.04) {
    ctx.save();
    const tipX = px + TILE_SIZE * 0.5 + state.drill.facingX * 10;
    const tipY = py + TILE_SIZE * 0.5 + state.drill.facingY * 10;
    const glowRadius = TILE_SIZE * (0.12 + heatRatio * 0.14);
    ctx.fillStyle = `rgba(255, 98, 58, ${0.08 + heatRatio * 0.18})`;
    ctx.beginPath();
    ctx.arc(tipX, tipY, glowRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `rgba(255, 175, 92, ${0.18 + heatRatio * 0.4})`;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(tipX, tipY, glowRadius + 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

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
  if (heatRatio > 0.02) {
    ctx.strokeStyle = `rgba(255, 92, 64, ${0.2 + heatRatio * 0.45})`;
    ctx.lineWidth = 4.4;
    ctx.beginPath();
    ctx.moveTo(drillBaseX + state.drill.facingX * 5, drillBaseY + state.drill.facingY * 5);
    ctx.lineTo(drillTipX, drillTipY);
    ctx.stroke();
    ctx.fillStyle = `rgba(255, 164, 98, ${0.18 + heatRatio * 0.35})`;
    ctx.beginPath();
    ctx.arc(drillTipX, drillTipY, 2.4 + heatRatio * 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

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

  renderCog(px + 14, py + TILE_SIZE - 12, 4 + (frame % 2), ctx);
  renderCog(px + TILE_SIZE - 14, py + TILE_SIZE - 12, 4 + ((frame + 1) % 2), ctx);
  renderSteamStack(px + TILE_SIZE - 14 - state.drill.facingX * thrust * 1.2, py + 7 - state.drill.facingY * thrust * 1.2, ctx);
}

function renderSignalStatus(camera) {
  if (state.signalMovesLeft <= 0) {
    return;
  }

  const ctx = state.ctx;
  const x = state.drill.renderX * TILE_SIZE + TILE_SIZE * 0.5 - camera.x;
  const y = state.drill.renderY * TILE_SIZE - camera.y - 14;
  const text = state.signalText;

  ctx.save();
  ctx.font = `700 13px ${HUD_FONT}`;
  ctx.textAlign = "center";
  const width = Math.max(74, ctx.measureText(text).width + 18);
  const barRatio = state.signalMovesMax > 0 ? clamp(state.signalMovesLeft / state.signalMovesMax, 0, 1) : 0;
  ctx.fillStyle = "rgba(23, 14, 9, 0.82)";
  ctx.strokeStyle = "rgba(242, 237, 226, 0.42)";
  ctx.lineWidth = 1.5;
  buildRoundedRectPath(ctx, x - width * 0.5, y - 18, width, 30, 10);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#fffaf1";
  ctx.fillText(text, x, y - 1);
  ctx.fillStyle = "rgba(255, 244, 220, 0.12)";
  buildRoundedRectPath(ctx, x - width * 0.5 + 8, y + 2, width - 16, 4, 3);
  ctx.fill();
  if (barRatio > 0) {
    ctx.fillStyle = "#f2ede2";
    buildRoundedRectPath(ctx, x - width * 0.5 + 8, y + 2, (width - 16) * barRatio, 4, 3);
    ctx.fill();
  }
  ctx.restore();
}

function renderOverdriveStatus(camera) {
  if (state.overhealDrillTimer <= 0) {
    return;
  }

  const ctx = state.ctx;
  const x = state.drill.renderX * TILE_SIZE + TILE_SIZE * 0.5 - camera.x;
  const y = state.drill.renderY * TILE_SIZE - camera.y + 20;
  const width = 64;
  const ratio = clamp(state.overhealDrillTimer / Math.max(1, state.overdriveDisplayDuration || state.overhealOverdriveDuration || 3), 0, 1);

  ctx.save();
  ctx.fillStyle = "rgba(23, 14, 9, 0.76)";
  ctx.strokeStyle = "rgba(255, 188, 118, 0.34)";
  ctx.lineWidth = 1.2;
  buildRoundedRectPath(ctx, x - width * 0.5, y - 4, width, 8, 4);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "rgba(255, 244, 220, 0.12)";
  buildRoundedRectPath(ctx, x - width * 0.5 + 2, y - 2, width - 4, 4, 3);
  ctx.fill();
  ctx.fillStyle = "#ff9b52";
  buildRoundedRectPath(ctx, x - width * 0.5 + 2, y - 2, (width - 4) * ratio, 4, 3);
  ctx.fill();
  ctx.restore();
}

function renderStunStatus(camera) {
  if (state.stunTimer <= 0) {
    return;
  }

  const ctx = state.ctx;
  const x = state.drill.renderX * TILE_SIZE + TILE_SIZE * 0.5 - camera.x;
  const y = state.drill.renderY * TILE_SIZE - camera.y + 42;
  const width = 64;
  const ratio = clamp(state.stunTimer / Math.max(1, state.stunDisplayDuration || 1), 0, 1);

  ctx.save();
  ctx.fillStyle = "rgba(23, 14, 9, 0.76)";
  ctx.strokeStyle = "rgba(255, 123, 123, 0.34)";
  ctx.lineWidth = 1.2;
  buildRoundedRectPath(ctx, x - width * 0.5, y - 4, width, 8, 4);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "rgba(255, 244, 220, 0.12)";
  buildRoundedRectPath(ctx, x - width * 0.5 + 2, y - 2, width - 4, 4, 3);
  ctx.fill();
  ctx.fillStyle = "#ff5f5f";
  buildRoundedRectPath(ctx, x - width * 0.5 + 2, y - 2, (width - 4) * ratio, 4, 3);
  ctx.fill();
  ctx.restore();
}

function renderHeatWarningStatus(camera) {
  const threshold = state.maxHeat * 0.8;
  if (state.heat < threshold) {
    return;
  }

  const ctx = state.ctx;
  const x = state.drill.renderX * TILE_SIZE + TILE_SIZE * 0.5 - camera.x;
  const y = state.drill.renderY * TILE_SIZE - camera.y + 54;
  const width = 64;
  const ratio = clamp(state.heat / Math.max(1, state.maxHeat), 0, 1);

  ctx.save();
  ctx.fillStyle = "rgba(23, 14, 9, 0.76)";
  ctx.strokeStyle = "rgba(255, 155, 95, 0.34)";
  ctx.lineWidth = 1.2;
  buildRoundedRectPath(ctx, x - width * 0.5, y - 4, width, 8, 4);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "rgba(255, 244, 220, 0.12)";
  buildRoundedRectPath(ctx, x - width * 0.5 + 2, y - 2, width - 4, 4, 3);
  ctx.fill();
  ctx.fillStyle = "#ff8f49";
  buildRoundedRectPath(ctx, x - width * 0.5 + 2, y - 2, (width - 4) * ratio, 4, 3);
  ctx.fill();
  ctx.restore();
}

function renderLoopChargeStatus(camera) {
  if (state.loopChargeTimer <= 0 || state.loopChargeDamageBonus <= 0) {
    return;
  }

  const ctx = state.ctx;
  const x = state.drill.renderX * TILE_SIZE + TILE_SIZE * 0.5 - camera.x;
  const y = state.drill.renderY * TILE_SIZE - camera.y + 31;
  const width = 76;
  const ratio = clamp(state.loopChargeTimer / Math.max(1, state.loopChargeDuration || 3), 0, 1);
  const text = `+${Math.round(state.loopChargeDamageBonus * 100)}%`;

  ctx.save();
  ctx.font = `700 11px ${HUD_FONT}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillStyle = "#a9f5ff";
  ctx.fillText(text, x, y - 6);
  ctx.fillStyle = "rgba(18, 16, 24, 0.8)";
  ctx.strokeStyle = "rgba(109, 235, 255, 0.38)";
  ctx.lineWidth = 1.2;
  buildRoundedRectPath(ctx, x - width * 0.5, y - 4, width, 8, 4);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "rgba(255, 244, 220, 0.12)";
  buildRoundedRectPath(ctx, x - width * 0.5 + 2, y - 2, width - 4, 4, 3);
  ctx.fill();
  ctx.fillStyle = "#6defff";
  buildRoundedRectPath(ctx, x - width * 0.5 + 2, y - 2, (width - 4) * ratio, 4, 3);
  ctx.fill();
  ctx.restore();
}

function renderPerkToast(camera) {
  if (state.perkToast.time <= 0 || !state.perkToast.text) {
    return;
  }

  const ctx = state.ctx;
  const x = state.drill.renderX * TILE_SIZE + TILE_SIZE * 0.5 - camera.x;
  const lift = (1.2 - state.perkToast.time) * 18;
  const y = state.drill.renderY * TILE_SIZE - camera.y - 34 - lift;
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
  if (state.fuelToast.time <= 0 || state.fuelToast.value === 0) {
    return;
  }

  const ctx = state.ctx;
  const x = state.drill.renderX * TILE_SIZE + TILE_SIZE * 0.5 - camera.x;
  const lift = (0.9 - state.fuelToast.time) * 22;
  const y = state.drill.renderY * TILE_SIZE - camera.y - 78 - lift;
  const alpha = clamp(state.fuelToast.time / 0.9, 0, 1);
  const text = `${state.fuelToast.value > 0 ? "+" : ""}${state.fuelToast.value} fuel`;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = `700 13px ${HUD_FONT}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const width = Math.max(80, ctx.measureText(text).width + 18);
  ctx.fillStyle = "rgba(41, 26, 12, 0.88)";
  ctx.strokeStyle = state.fuelToast.value > 0 ? "rgba(255, 191, 98, 0.38)" : "rgba(255, 128, 128, 0.4)";
  ctx.lineWidth = 1.5;
  drawRoundedRectPath(x - width * 0.5, y - 12, width, 24, 11);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = state.fuelToast.value > 0 ? "#ffbf62" : "#ff8f8f";
  ctx.fillText(text, x, y + 1);
  ctx.restore();
}

function renderHpToast(camera) {
  if (state.hpToast.time <= 0 || state.hpToast.value <= 0) {
    return;
  }

  const ctx = state.ctx;
  const sx = state.drill.renderX * TILE_SIZE + TILE_SIZE * 0.5 - camera.x;
  const sy = state.drill.renderY * TILE_SIZE - camera.y;
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
  const x = state.drill.renderX * TILE_SIZE + TILE_SIZE * 0.5 - camera.x;
  const lift = (0.9 - state.scrapToast.time) * 22;
  const y = state.drill.renderY * TILE_SIZE - camera.y - 56 - lift;
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
  const heatRatio = clamp(state.heat / state.maxHeat, 0, 1);
  const currentScrapCost = getScrapPerkCost(state.scrapPerkLevel);
  const scrapCycle = state.nextScrapPerkAt - currentScrapCost;
  const scrapProgress = clamp(state.scrap - scrapCycle, 0, currentScrapCost);
  const scrapRatio = clamp(scrapProgress / currentScrapCost, 0, 1);
  const top = 14;
  const gap = 10;
  const totalWidth = Math.min(state.width - 28, 560);
  const panelWidth = (totalWidth - gap) / 2;
  const panelHeight = 34;
  const left = state.width - 14 - totalWidth;
  const secondRowTop = top + panelHeight + 8;

  const hpLabel = state.armor > 0 ? `${state.hp}/${state.maxHp} • A:${state.armor}` : `${state.hp}/${state.maxHp}`;
  drawHudBar(left, top, panelWidth, panelHeight, "HP", hpLabel, hpRatio, ["#ff9d7a", "#ff5c5c"]);
  drawHudBar(
    left + panelWidth + gap,
    top,
    panelWidth,
    panelHeight,
    "SCRAP",
    `${Math.floor(scrapProgress)}/${currentScrapCost}`,
    scrapRatio,
    ["#f0df84", "#d7b548"],
  );
  state.scrapHitRect = {
    x: left + panelWidth + gap,
    y: top,
    width: panelWidth,
    height: panelHeight,
  };
  drawHudBar(left, secondRowTop, panelWidth, panelHeight, "FUEL", `${Math.floor(state.fuel)}/${state.maxFuel}`, fuelRatio, ["#ffbf62", "#ff8c3b"]);
  drawHudBar(
    left + panelWidth + gap,
    secondRowTop,
    panelWidth,
    panelHeight,
    "HEAT",
    `${Math.floor(state.heat)}/${state.maxHeat}`,
    heatRatio,
    ["#ffb36d", "#ff4c3f"],
  );

  const ctx = state.ctx;
  const recipeTop = secondRowTop + panelHeight + 8;
  const recipeWidth = 232;
  const manualButton = document.getElementById("manualOpen");
  if (manualButton) {
    manualButton.style.top = `${recipeTop - 1}px`;
    manualButton.style.left = `${left + recipeWidth + 8}px`;
    manualButton.style.right = "auto";
  }
  ctx.save();
  ctx.fillStyle = "rgba(31, 18, 12, 0.82)";
  ctx.strokeStyle = "rgba(220, 169, 93, 0.28)";
  ctx.lineWidth = 1;
  drawRoundedRectPath(left, recipeTop, recipeWidth, 32, 10);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#c6ab84";
  ctx.font = `700 10px ${HUD_FONT}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("CRYSTAL RECIPE", left + 10, recipeTop + 16);
  if (state.crystalRecipe.length === 0) {
    ctx.restore();
  } else {
    const usedCounts = [0, 0, 0, 0, 0, 0];
    for (let i = 0; i < state.crystalRecipe.length; i += 1) {
      const crystalType = state.crystalRecipe[i];
      const crystal = CRYSTAL_TYPES[crystalType];
      const cx = left + 118 + i * 26;
      const cy = recipeTop + 16;
      const completed = usedCounts[crystalType] < state.crystalCollected[crystalType];
      if (completed) {
        usedCounts[crystalType] += 1;
      }
      ctx.globalAlpha = completed ? 1 : 0.82;
      ctx.fillStyle = crystal.glow;
      ctx.beginPath();
      ctx.arc(cx, cy, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = crystal.color;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 9);
      ctx.lineTo(cx + 7, cy - 2);
      ctx.lineTo(cx + 4, cy + 8);
      ctx.lineTo(cx - 4, cy + 8);
      ctx.lineTo(cx - 7, cy - 2);
      ctx.closePath();
      ctx.fill();
      if (completed) {
        ctx.strokeStyle = "rgba(255, 244, 214, 0.9)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(cx, cy, 11, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  const detailTop = recipeTop + 40;
  renderHudCoreStats(left, detailTop, panelWidth, "СТАТЫ");
  renderHudPerkColumn(left + panelWidth + gap, detailTop, panelWidth, "ПЕРКИ");
}

function drawHudBar(x, y, width, height, label, value, ratio, colors) {
  const ctx = state.ctx;
  const trackX = x + 72;
  const trackY = y + 12;
  const trackWidth = Math.max(44, width - 106);
  const trackHeight = 10;

  drawHudPanel(x, y, width, height);

  ctx.save();
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#c6ab84";
  ctx.font = `700 10px ${HUD_FONT}`;
  ctx.textAlign = "left";
  ctx.fillText(label, x + 10, y + 13);

  ctx.fillStyle = "#f7ebd4";
  ctx.font = `700 11px ${HUD_FONT}`;
  ctx.fillText(value, x + 10, y + 27);

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
  ctx.restore();
}

function renderHudInfoColumn(x, y, width, rows, title) {
  const ctx = state.ctx;
  const rowHeight = 16;
  const panelHeight = 24 + rows.length * rowHeight + 8;

  ctx.save();
  ctx.fillStyle = "rgba(31, 18, 12, 0.78)";
  ctx.strokeStyle = "rgba(220, 169, 93, 0.24)";
  ctx.lineWidth = 1;
  drawRoundedRectPath(x, y, width, panelHeight, 10);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#c6ab84";
  ctx.font = `700 10px ${HUD_FONT}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(title, x + 10, y + 14);

  for (let i = 0; i < rows.length; i += 1) {
    const rowY = y + 30 + i * rowHeight;
    const row = rows[i];
    ctx.fillStyle = "rgba(214, 188, 150, 0.78)";
    ctx.font = `700 10px ${HUD_FONT}`;
    ctx.fillText(row.label, x + 10, rowY);
    ctx.textAlign = "right";
    ctx.fillStyle = "#f1dfb6";
    ctx.font = `700 11px ${HUD_FONT}`;
    ctx.fillText(row.value, x + width - 10, rowY);
    ctx.textAlign = "left";
  }
  ctx.restore();
}

function renderHudMiniPerkIcon(perkType, x, y, size) {
  const perk = TILE_PERK_TYPES[perkType];
  if (!perk) {
    return;
  }
  const ctx = state.ctx;
  const half = size * 0.5;

  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = `${perk.color}28`;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.32, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = perk.color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, -half + 2);
  ctx.lineTo(half - 2, 0);
  ctx.lineTo(0, half - 2);
  ctx.lineTo(-half + 2, 0);
  ctx.closePath();
  ctx.stroke();
  ctx.fillStyle = "#2b1b14";
  ctx.font = `700 ${Math.max(8, size * 0.38)}px ${HUD_FONT}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(perk.icon, 0, 0.5);
  ctx.restore();
}

function renderHudCoreStats(x, y, width, title) {
  const ctx = state.ctx;
  const rows = [
    { perkType: 3, value: formatPerkNumber(state.drillPower) },
    { perkType: 5, value: formatPerkPercent(state.strikeSpeed - 1) },
  ];
  const rowHeight = 22;

  ctx.save();
  ctx.textBaseline = "middle";

  for (let i = 0; i < rows.length; i += 1) {
    const rowY = y + 8 + i * rowHeight;
    renderHudMiniPerkIcon(rows[i].perkType, x + 20, rowY, 18);
    ctx.strokeStyle = "rgba(24, 12, 8, 0.82)";
    ctx.lineWidth = 3;
    ctx.font = `700 11px ${HUD_FONT}`;
    ctx.textAlign = "left";
    ctx.strokeText(rows[i].value, x + 36, rowY);
    ctx.fillStyle = "#f1dfb6";
    ctx.fillText(rows[i].value, x + 36, rowY);
  }
  ctx.restore();
}

function renderHudPerkColumn(x, y, width, title) {
  const ctx = state.ctx;
  const perkRows = [];
  for (let i = 1; i < SCRAP_PERK_TYPES.length; i += 1) {
    if (i === 21) {
      continue;
    }
    const level = getScrapPerkCurrentLevel(i);
    if (level <= 0) {
      continue;
    }
    perkRows.push({
      perkType: i,
      icon: SCRAP_PERK_TYPES[i].icon || "?",
      name: SCRAP_PERK_TYPES[i].name,
      level,
    });
  }

  const iconsPerRow = 9;
  const iconSize = 18;
  const gap = 6;
  const rowHeight = 22;
  const startRight = x + width - 10;

  ctx.save();
  ctx.textBaseline = "middle";

  for (let i = 0; i < perkRows.length; i += 1) {
    const rowIndex = Math.floor(i / iconsPerRow);
    const colIndex = i % iconsPerRow;
    const cx = startRight - colIndex * (iconSize + gap) - iconSize * 0.5;
    const cy = y + 8 + rowIndex * rowHeight;
    const perkType = perkRows[i].perkType;

    ctx.fillStyle = "rgba(50, 28, 16, 0.42)";
    ctx.strokeStyle = "rgba(215, 159, 73, 0.24)";
    ctx.lineWidth = 1;
    drawRoundedRectPath(cx - iconSize * 0.5, cy - iconSize * 0.5, iconSize, iconSize, 7);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#ffeacb";
    ctx.font = `700 10px ${HUD_FONT}`;
    ctx.textAlign = "center";
    ctx.fillText(SCRAP_PERK_TYPES[perkType].icon || "?", cx, cy + 0.5);

    if (perkRows[i].level >= 2) {
      const badgeText = String(perkRows[i].level);
      const badgeX = cx + iconSize * 0.35;
      const badgeY = cy - iconSize * 0.35;
      ctx.fillStyle = "rgba(36, 20, 12, 0.92)";
      ctx.strokeStyle = "rgba(255, 207, 122, 0.45)";
      ctx.lineWidth = 1;
      drawRoundedRectPath(badgeX - 5, badgeY - 5, 10, 10, 5);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#ffcf7a";
      ctx.font = `700 8px ${HUD_FONT}`;
      ctx.fillText(badgeText, badgeX, badgeY + 0.5);
    }
  }
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
  const centerX = state.drill.renderX * TILE_SIZE + TILE_SIZE * 0.5 - camera.x;
  const centerY = state.drill.renderY * TILE_SIZE + TILE_SIZE * 0.5 - camera.y;
  const radius = state.visionRadius * TILE_SIZE;
  const facingX = state.drill.facingX ?? 0;
  const facingY = state.drill.facingY ?? 1;
  const angle = Math.atan2(facingY, facingX);
  const coneLength = radius * 1.15;
  const coneSpread = 0.48;

  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.48)";
  ctx.beginPath();
  ctx.rect(0, 0, state.width, state.height);
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2, true);
  ctx.fill("evenodd");

  const glow = ctx.createRadialGradient(centerX, centerY, radius * 0.2, centerX, centerY, radius);
  glow.addColorStop(0, "rgba(255, 214, 133, 0.12)");
  glow.addColorStop(0.55, "rgba(255, 196, 104, 0.07)");
  glow.addColorStop(1, "rgba(255, 196, 104, 0)");
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fill();

  const cone = ctx.createRadialGradient(centerX, centerY, radius * 0.1, centerX, centerY, coneLength);
  cone.addColorStop(0, "rgba(255, 228, 171, 0.16)");
  cone.addColorStop(0.55, "rgba(255, 205, 112, 0.1)");
  cone.addColorStop(1, "rgba(255, 205, 112, 0)");
  ctx.fillStyle = cone;
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.arc(centerX, centerY, coneLength, angle - coneSpread, angle + coneSpread);
  ctx.closePath();
  ctx.fill();

  ctx.globalCompositeOperation = "source-over";
  ctx.strokeStyle = "rgba(255, 227, 170, 0.08)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * 0.98, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

init();
