import { initShop, openShop, closeShop, renderShop, unlockRandomTree, getLockedTrees, unlockTreeById, getAllTrees, isTreeUnlocked } from "./shop.js?v=40";
import { generateMap, mulberry32 as _mulberry32, GRID_W, GRID_H, START_X, START_Y, VISION_RADIUS } from "./worldgen.js?v=38";

const TILE_SIZE = 36;
const HUD_FONT = 'Baskerville, "Palatino Linotype", "Book Antiqua", Georgia, serif';
const STEP_MS = 1000 / 60;
const MAX_FRAME_MS = 100;
const START_FUEL = 200;
const START_HP = 7;
const MAX_HEAT = 100;
const IDLE_FUEL_DRAIN = 0.8;
const DRILL_FUEL_DRAIN = 8;
const STRIKE_CYCLE_SPEED = 8;
const PERK_MIN_DISTANCE = 4;
const PERK_ZONE_MIN_DISTANCE = 6;
const TILES_PER_PERK_TILE = 26;
const TILES_PER_PERK_ZONE = 370;
const BASE_MIN_DISTANCE = 50;
const START_EASY_RADIUS = 5;
const RADAR_BASE_DURATION = 10;
const GOLD_PERK_BASE_COST = 30;
const GOLD_PERK_COST_MULTIPLIER = 1.35;
const GOLD_PERK_LEVEL_MULTIPLIER_STEP = 0.05;
const GOLD_PERK_POPUP_DELAY = 0.5;
const IDLE_AUTO_CLOSE_DELAY = 4;
const IDLE_AUTO_CLOSE_MIN_DELAY = 1;
const IDLE_AUTO_CLOSE_PREVIEW_DELAY = 0.5;
const IDLE_AUTO_CLOSE_PREVIEW_RETURN_DURATION = 0.24;
const GAS_POCKET_GROUPS = 10;
const STEAM_POCKET_GROUPS = 8;
const BOULDER_POCKET_GROUPS = 8;
const METAL_VEIN_GROUPS = 16;
const GOLD_ORE_GROUPS = 50;
const GOLD_ORE_PER_BLOCK = 18;
const GAS_SPREAD_INTERVAL = 2;
const GAS_SPREAD_STEPS = 3;
const GAS_DAMAGE = 1;
const BOULDER_DELAY = 1;
const BOULDER_MOVE_INTERVAL = 0.12;
const BOULDER_BREAK_LIMIT = 20;
const BOULDER_DAMAGE = 5;
const BOULDER_MIN_START_DISTANCE = 4;
const BEACON_COUNT = 5;
const BEACON_MIN_DIST = 15;
const BEACON_MAX_DIST = 60;
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
const MOVE_SPEED_TILES = 5;
const POST_BREAK_MOVE_DELAY = 0.2;
const VISIBILITY_FADE_SPEED = 7;
const TILE_SWAP_ANIMATION_DURATION = 0.18;
const WORM_ACTIVATION_RADIUS = 10;
const WORM_ATTACK_INTERVAL = 10;
const WORM_SPEED = 4;
const WORM_DAMAGE = 3;
const WORM_BLOCK_DAMAGE_RATIO = 0.5;
const WORM_BODY_LENGTH = 8;
const WORM_DUST_DURATION = 0.6;
const XP_PER_BLOCK = 1;
const XP_PICKUP_RADIUS = 1;

const LEVEL_REWARD_DEFS = {
  1: [
    { id: "gold_5", label: "+5% золота", description: "Больше золота из разрушаемых блоков" },
    { id: "damage_0_5", label: "+0.35 урона", description: "Постоянный прирост силы бура" },
    { id: "speed_10", label: "+10% скорости", description: "Бур делает новые удары быстрее" },
  ],
  2: [
    { id: "gold_5", label: "+5% золота", description: "Еще больше золота из разрушаемых блоков" },
    { id: "fuel_100", label: "+100 топлива", description: "Мгновенно пополняет бак" },
  ],
  3: [
    { id: "damage_0_5", label: "+0.35 урона", description: "Еще сильнее увеличивает урон бура" },
    { id: "fuel_100", label: "+100 топлива", description: "Мгновенно пополняет бак" },
    { id: "hp_1", label: "+1 HP", description: "Повышает максимум HP и лечит на 1" },
  ],
  4: [
    { id: "artifact", label: "Артефакт", description: "Артефакт сразу выдается в руки: отнеси его к маяку" },
    { id: "full_restore", label: "Полное восстановление", description: "Полностью лечит и заполняет бак" },
  ],
  5: [
    { id: "speed_10", label: "+10% скорости", description: "Бур делает новые удары быстрее" },
    { id: "fuel_100", label: "+100 топлива", description: "Мгновенно пополняет бак" },
    { id: "hp_1", label: "+1 HP", description: "Повышает максимум HP и лечит на 1" },
  ],
  6: [
    { id: "gold_5", label: "+5% золота", description: "Еще больше золота из разрушаемых блоков" },
    { id: "fuel_100", label: "+100 топлива", description: "Мгновенно пополняет бак" },
    { id: "hp_1", label: "+1 HP", description: "Повышает максимум HP и лечит на 1" },
  ],
};

const LEVEL_REWARD_REPEAT_PATTERN = [3, 5, 6];

// Reusable buffers for visibility BFS — avoids per-frame allocations
const _visFogDistance = new Int16Array(GRID_W * GRID_H);
const _visBfsQueue = new Int32Array(GRID_W * GRID_H);
const _visFogQueue = new Int32Array(GRID_W * GRID_H);

const HAZARD_TYPES = {
  SPIKE: 1,
  VOLATILE: 2,
};
const HAZARD_DATA = {
  [HAZARD_TYPES.SPIKE]: { damage: 1, color: "#ff6b48" },
  [HAZARD_TYPES.VOLATILE]: { damage: 2, color: "#ffd166" },
};

const BLOCK_TYPES = [
  { hp: 0, color: "#1a1410", gold: 0, vein: "#3c2d22" },
  { hp: 60, color: "#7a6550", gold: 2, vein: "#97816a" },
  { hp: 90, color: "#6e5b48", gold: 4, vein: "#8b7560" },
  { hp: 120, color: "#625140", gold: 6, vein: "#7f6a58" },
  { hp: 180, color: "#564838", gold: 8, vein: "#736250" },
  { hp: 300, color: "#4b4035", gold: 11, vein: "#675a4c" },
  { hp: 420, color: "#423a36", gold: 14, vein: "#5e5550" },
  { hp: 600, color: "#3a3840", gold: 18, vein: "#56545e" },
];

const TILE_PERK_TYPES = [
  null,
  { name: "Бак", icon: "F", color: "#ffcf7a", desc: "+60 топлива прямо сейчас" },
  { name: "Радар", icon: "R", color: "#f2ede2", desc: "+10 сек направляющего радара" },
  { name: "Бур", icon: "D", color: "#ff9f6b", desc: "+0.35 к силе удара бура" },
  { name: "Бомба", icon: "*", color: "#c796ff", desc: "Ракета на дистанцию 2 в направлении бурения с взрывом x10" },
  { name: "Скорость", icon: "S", color: "#9fd7ff", desc: "+10% к скорости нового удара" },
  { name: "HP+", icon: "H", color: "#73e58f", desc: "+1 к текущему здоровью" },
  { name: "Броня", icon: "A", color: "#b4d7ff", desc: "+1 брони против внешней опасности" },
];

const GOLD_PERK_TYPES = [
  null,
  { name: "Боковые буры", icon: "⫼", desc: "Удар также бьет по двум боковым клеткам" },
  null,
  { name: "Длинный бур", icon: "⇢", desc: "Бьет следующий тайл вперед, повторно усиливает дальний удар" },
  { name: "Диагональные буры", icon: "✣", desc: "Бьют по диагоналям вперед, повторно усиливают дальний удар" },
  { name: "Контурный заряд", icon: "⬡", desc: "После замыкания контура дает временный бонус к урону бура от числа клеток внутри" },
  { name: "Форсаж на нуле", icon: "⏚", desc: "Чем меньше топлива, тем быстрее следующий удар" },
  { name: "Саперный заряд", icon: "✦", desc: "Каждые N сломанных буром блоков кидает ракету с малым радиусом на дистанцию 1" },
  { name: "Топливный контур", icon: "⛽", desc: "Любой перк дает +50 топлива, Бак дает на 50 меньше" },
  { name: "Линза обзора", icon: "◉", desc: "+1 к радиусу обзора, до максимума 9" },
  { name: "Радарный модуль", icon: "⌖", desc: "Отмечает ближайшие кристаллы на радаре" },
  { name: "Ломосбор", icon: "●", desc: "+2 золота за каждый разрушенный блок" },
  null,
  { name: "Перегрузка", icon: "⚡", desc: "Переполнение топлива дает 3 сек форсажа, затем взрыв и оглушение" },
  { name: "Усиленный корпус", icon: "✚", desc: "+1 к максимуму HP и лечит на 2" },
  { name: "Перелив адреналина", icon: "❤", desc: "Overheal дает 4 секунды бафа, потом растет до максимума 10" },
  { name: "Контурный трофей", icon: "◈", desc: "Большой контур может создать случайный перк внутри" },
  { name: "Автоконтур", icon: "◎", desc: "-1 сек к задержке автозамыкания контура, до минимума 1" },
  { name: "Кристальный катализатор", icon: "✧", desc: "Кристаллы начинают давать золото, потом fuel и HP" },
  { name: "Шиповой форсаж", icon: "✹", desc: "Разбитые шипы дают overdrive-баф на 6/9/12 секунд" },
  { name: "Термозаряд", icon: "☇", desc: "Усиливает урон и радиус взрыва от перегрева" },
  { name: "Терморасширение", icon: "☍", desc: "Скрыто: слито в Термозаряд" },
  { name: "Теплоотвод", icon: "⬢", desc: "Повышает предел нагрева до перегрева" },
  { name: "Накал бура", icon: "❉", desc: "Повышает урон бура в зависимости от нагрева" },
  { name: "Импульс остывания", icon: "⌁", desc: "При полном остывании дает 5 сек радара" },
  { name: "Разгонные демпферы", icon: "◍", desc: "Сокращают оглушение и ускоряют набор heat" },
  { name: "Контурный резонанс", icon: "⟲", desc: "+1% урона за каждую единицу длины контура до капа уровня" },
  { name: "Охлаждающие ракеты", icon: "❄", desc: "За каждые N остывшего heat выпускают ракету с малым радиусом на дистанцию 1-3" },
  { name: "Рекуперация контура", icon: "↺", desc: "Возврат по своему контуру дает топливо за шаг" },
  { name: "Терморакеты", icon: "☄", desc: "Перегрев выпускает ракеты с малым радиусом на дистанцию 1-3" },
  { name: "Усиленный бак", icon: "◌", desc: "Бак дает больше топлива, но растет расход в секунду" },
];

const TILE_PERK_WEIGHTS = [0, 7, 0, 0, 4, 0, 2, 2];
const CRYSTAL_TYPES = [
  null,
  { name: "Красный", color: "#ff4747", glow: "rgba(255,71,71,0.24)" },
  { name: "Желтый", color: "#ffd166", glow: "rgba(255,209,102,0.22)" },
  { name: "Светлый", color: "#f2ede2", glow: "rgba(242,237,226,0.24)" },
  { name: "Зеленый", color: "#73e58f", glow: "rgba(115,229,143,0.22)" },
  { name: "Синий", color: "#72b7ff", glow: "rgba(114,183,255,0.22)" },
];
const CRYSTAL_REWARD_TILE_PERKS = [0, 3, 1, 2, 6, 5];
const TILES_PER_CRYSTAL_TILE = 22;
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
  fps: 0,
  fpsHistory: [],
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
  gold: 0,
  unsafeGold: 0,
  xp: 0,
  level: 1,
  xpToNext: 12,
  levelRewardStep: 0,
  levelRewardQueue: [],
  levelUpModalOpen: false,
  goldParticles: [],
  xpParticles: [],
  baseFound: false,
  outOfFuel: false,
  dead: false,
  visionRadius: VISION_RADIUS,
  dragId: null,
  padCenterX: 0,
  padCenterY: 0,
  touchAimX: 0,
  touchAimY: 0,
  keyAimX: 0,
  keyAimY: 0,
  moveAimX: 0,
  moveAimY: 0,
  isChoosingPerk: false,
  pendingPerkChoice: false,
  pendingPerkDelay: 0,
  bonusPerkChoices: 0,
  perkRerolls: 0,
  manualModalOpen: false,
  shopModalOpen: false,
  beaconActivationAnim: null, // { beacon, startTs, pendingAction }
  debugPerkMenuOpen: false,
  debugPerkSelection: "",
  crystalRewardModalOpen: false,
  crystalRewardCloseReady: false,
  crystalRewardRevealStage: 0,
  crystalRewardAnimTimer: 0,
  crystalRewardShuffleTick: 0,
  crystalRewardPreviewPerks: [0, 0],
  crystalRewardPerks: [0, 0],
  nextGoldPerkAt: GOLD_PERK_BASE_COST,
  goldPerkLevel: 0,
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
  goldOreMask: new Uint8Array(GRID_W * GRID_H),
  gasPocketMask: new Uint8Array(GRID_W * GRID_H),
  gasMask: new Uint8Array(GRID_W * GRID_H),
  gasClouds: [],
  steamPocketMask: new Uint8Array(GRID_W * GRID_H),
  steamMask: new Uint8Array(GRID_W * GRID_H),
  steamJets: [],
  boulderPocketMask: new Uint8Array(GRID_W * GRID_H),
  boulders: [],
  beaconMask: new Uint8Array(GRID_W * GRID_H),
  artifactMask: new Uint8Array(GRID_W * GRID_H),
  heldArtifact: false,
  heldArtifactDropX: -1,
  heldArtifactDropY: -1,
  artifactBumpTime: 0,
  artifactBumpDir: null,
  artifactChoiceOpen: false,
  artifactChoiceTrees: [],
  artifactChoicePendingBeacon: null,
  // Safe/key system
  safes: [],
  safeDoorMask: new Int16Array(GRID_W * GRID_H),  // >0 = locked door (safeIdx+1), <0 = opened
  keyMask: new Uint8Array(GRID_W * GRID_H),        // >0 = key for safe (safeIdx+1)
  safeInteriorMask: new Int16Array(GRID_W * GRID_H), // >0 = safe interior (safeIdx+1)
  heldKeyForSafe: -1,      // index of safe this key belongs to, -1 = no key
  keyBumpTime: 0,
  keyBumpDir: null,
  pickupRadarTimer: 0,     // seconds remaining for pickup radar pulse
  pickupRadarKind: null,   // "artifact" or "key"
  pickupRadarTargetX: 0,
  pickupRadarTargetY: 0,
  wormNests: [],
  activeWorms: [],
  beacons: [],
  health: new Float32Array(GRID_W * GRID_H),
  crackAngle: new Float32Array(GRID_W * GRID_H),
  loopGoldMask: new Float32Array(GRID_W * GRID_H),
  droppedGoldMask: new Float32Array(GRID_W * GRID_H),
  xpPickupMask: new Uint16Array(GRID_W * GRID_H),
  visibleMask: new Uint8Array(GRID_W * GRID_H),
  visibleAlpha: new Float32Array(GRID_W * GRID_H),
  visibleTargetAlpha: new Float32Array(GRID_W * GRID_H),
  signalMovesLeft: 0,
  signalMovesMax: 0,
  signalPrevX: START_X,
  signalPrevY: START_Y,
  signalDirX: 0,
  signalDirY: -1,
  perkText: "Нет",
  crystalRecipe: [],
  crystalCollected: [0, 0, 0, 0, 0, 0],
  crystalProgress: 0,
  crystalStatusText: "",
  strikeSpeed: 1,
  drillPower: 1,
  miningGoldBonusMultiplier: 0,
  goldBonus: 0,
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
  radarCrystalModule: false,
  blocksBroken: 0,
  drillBrokenBlocks: 0,
  sideDrills: 0,
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
  autoClosePreview: null,
  autoClosePreviewReturnTimer: 0,
  autoClosePreviewFailed: false,
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
  goldToast: {
    value: 0,
    time: 0,
  },
  damageFlash: 0,
  fatalErrorText: "",
  goldHitRect: null,
  sprites: null,
  effects: [],
  tileAnimations: [],
  tileAnimDest: new Set(),
  visibilityDirty: true,
  chainExplosions: [],
  base: {
    x: 0,
    y: 0,
    renderX: 0,
    renderY: 0,
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
    moveResumeTimer: 0,
    digDelayTimer: 0,
    digDelayDx: 0,
    digDelayDy: 0,
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
  const t = (tier - 1) / 6; // 0..1

  // Градиент — контрастность растёт с тиром
  const gradLight = Math.round(6 + t * 20);
  const gradDark = Math.round(8 + t * 24);
  const gradient = ctx.createLinearGradient(0, 0, TILE_SIZE, TILE_SIZE);
  gradient.addColorStop(0, lightenColor(type.color, gradLight));
  gradient.addColorStop(0.52, type.color);
  gradient.addColorStop(1, darkenColor(type.color, gradDark));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);

  // Прожилки — количество растёт с тиром
  const veinCount = 1 + tier;
  ctx.strokeStyle = `${type.vein}aa`;
  ctx.lineWidth = 1.2 + t * 0.8;
  for (let i = 0; i < veinCount; i += 1) {
    const y0 = 4 + Math.random() * (TILE_SIZE - 8);
    const y1 = y0 + (Math.random() - 0.5) * 8;
    const y2 = y0 + (Math.random() - 0.5) * 8;
    ctx.beginPath();
    ctx.moveTo(2 + Math.random() * 4, y0);
    ctx.quadraticCurveTo(TILE_SIZE * 0.5, y1, TILE_SIZE - 2 - Math.random() * 4, y2);
    ctx.stroke();
  }

  // Зернистость — от 8 до 35 точек
  const grainCount = Math.round(8 + t * 27);
  for (let i = 0; i < grainCount; i += 1) {
    const x = 2 + Math.random() * (TILE_SIZE - 4);
    const y = 2 + Math.random() * (TILE_SIZE - 4);
    const bright = Math.random() > 0.5;
    ctx.fillStyle = bright
      ? `rgba(255, 240, 210, ${0.06 + t * 0.08})`
      : `rgba(10, 5, 2, ${0.08 + t * 0.12})`;
    ctx.fillRect(x, y, 1 + Math.round(Math.random()), 1 + Math.round(Math.random()));
  }

  // Виньетка — внутренняя тень по краям
  const vignetteAlpha = 0.02 + t * 0.18;
  const inset = 3;
  ctx.fillStyle = `rgba(8, 4, 2, ${vignetteAlpha})`;
  ctx.fillRect(0, 0, TILE_SIZE, inset);
  ctx.fillRect(0, TILE_SIZE - inset, TILE_SIZE, inset);
  ctx.fillRect(0, inset, inset, TILE_SIZE - inset * 2);
  ctx.fillRect(TILE_SIZE - inset, inset, inset, TILE_SIZE - inset * 2);

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
    const S = TILE_SIZE;
    ctx.lineCap = "round";

    // Two crossing vines with thorns
    const vines = [
      // vine 1: bottom-left to top-right
      { pts: [[0.1, 0.95], [0.25, 0.6], [0.45, 0.4], [0.7, 0.15]],
        thorns: [[0.22, 0.65, -1, 1], [0.44, 0.42, 1, -1], [0.65, 0.22, -1, 1]] },
      // vine 2: bottom-right to mid-left
      { pts: [[0.9, 0.9], [0.65, 0.55], [0.35, 0.55], [0.15, 0.3]],
        thorns: [[0.68, 0.52, 1, -1], [0.36, 0.53, -1, 1]] },
    ];

    for (const vine of vines) {
      // Stem
      ctx.beginPath();
      ctx.moveTo(S * vine.pts[0][0], S * vine.pts[0][1]);
      for (let i = 1; i < vine.pts.length; i += 1) {
        ctx.lineTo(S * vine.pts[i][0], S * vine.pts[i][1]);
      }
      ctx.strokeStyle = "rgba(80, 38, 18, 0.9)";
      ctx.lineWidth = 2.2;
      ctx.stroke();
      ctx.strokeStyle = hazard.color;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Thorns
      for (const [tx, ty, dx, dy] of vine.thorns) {
        const ox = S * tx;
        const oy = S * ty;
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.lineTo(ox + dx * 5, oy + dy * 5);
        ctx.strokeStyle = "rgba(80, 38, 18, 0.9)";
        ctx.lineWidth = 1.8;
        ctx.stroke();
        ctx.strokeStyle = hazard.color;
        ctx.lineWidth = 0.8;
        ctx.stroke();
        // Thorn tip
        ctx.fillStyle = "rgba(255, 140, 100, 0.8)";
        ctx.beginPath();
        ctx.arc(ox + dx * 5, oy + dy * 5, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
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

const CRACK_VARIANTS = 4;

function createCrackSprite(stage) {
  const canvas = makeSpriteCanvas();
  const ctx = canvas.getContext("2d");
  ctx.strokeStyle = `rgba(255, 242, 215, ${0.2 + stage * 0.12})`;
  ctx.lineWidth = 1.2 + stage * 0.35;
  for (let i = 0; i < stage; i += 1) {
    const x0 = 3 + Math.random() * (TILE_SIZE - 6);
    const y0 = 3 + Math.random() * (TILE_SIZE - 6);
    const x1 = 3 + Math.random() * (TILE_SIZE - 6);
    const y1 = 3 + Math.random() * (TILE_SIZE - 6);
    const x2 = 3 + Math.random() * (TILE_SIZE - 6);
    const y2 = 3 + Math.random() * (TILE_SIZE - 6);
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x2, y2);
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

function createGoldOreSprite() {
  const canvas = makeSpriteCanvas();
  const ctx = canvas.getContext("2d");

  const clusters = [
    [TILE_SIZE * 0.26, TILE_SIZE * 0.30, 4.5],
    [TILE_SIZE * 0.64, TILE_SIZE * 0.44, 4.0],
    [TILE_SIZE * 0.40, TILE_SIZE * 0.68, 3.8],
    [TILE_SIZE * 0.74, TILE_SIZE * 0.22, 3.2],
  ];

  for (const [x, y, r] of clusters) {
    const glow = ctx.createRadialGradient(x, y, 0, x, y, r * 2.5);
    glow.addColorStop(0, "rgba(248, 200, 48, 0.32)");
    glow.addColorStop(1, "rgba(220, 160, 0, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, r * 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const [x, y, r] of clusters) {
    ctx.fillStyle = "#c8920a";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f0c030";
    ctx.beginPath();
    ctx.arc(x, y, r * 0.72, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fae070";
    ctx.beginPath();
    ctx.arc(x - r * 0.28, y - r * 0.28, r * 0.35, 0, Math.PI * 2);
    ctx.fill();
  }

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

const BLOCK_VARIANTS = 4;

function createSpriteAtlas() {
  const blocks = [null];
  for (let i = 1; i < BLOCK_TYPES.length; i += 1) {
    blocks[i] = [];
    for (let v = 0; v < BLOCK_VARIANTS; v += 1) {
      blocks[i][v] = createBlockSprite(BLOCK_TYPES[i], i);
    }
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
    cracks: [null,
      Array.from({ length: CRACK_VARIANTS }, () => createCrackSprite(1)),
      Array.from({ length: CRACK_VARIANTS }, () => createCrackSprite(2)),
      Array.from({ length: CRACK_VARIANTS }, () => createCrackSprite(3)),
    ],
    metal: createMetalSprite(),
    goldOre: createGoldOreSprite(),
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

function spawnGoldOreEffect(x, y, value) {
  state.effects.push({
    kind: "goldOre",
    x,
    y,
    value,
    time: 0.88,
    duration: 0.88,
    seed: (x * 73417 + y * 53923 + value * 131) % 1000,
  });
}

function spawnGoldParticles(tileX, tileY, totalValue, options = {}) {
  if (totalValue <= 0) return;
  const count = Math.min(8, Math.max(3, totalValue));
  const baseValue = Math.floor(totalValue / count);
  for (let i = 0; i < count; i += 1) {
    const value = i === count - 1 ? totalValue - baseValue * (count - 1) : baseValue;
    const seed = (tileX * 73417 + tileY * 53923 + i * 131) % 1000;
    state.goldParticles.push({
      tileX: tileX + 0.5,
      tileY: tileY + 0.5,
      value,
      isLast: i === count - 1,
      toastValue: i === count - 1 ? totalValue : 0,
      skipArrivalEffect: options.skipArrivalEffect ?? false,
      delay: i * 0.055,
      elapsed: 0,
      duration: 0.38 + (seed % 10) * 0.012,
      seed,
    });
  }
}

function spawnExperienceParticles(tileX, tileY, totalValue) {
  if (totalValue <= 0) {
    return;
  }
  const count = Math.min(6, Math.max(1, Math.ceil(totalValue / 2)));
  const baseValue = Math.floor(totalValue / count);
  for (let i = 0; i < count; i += 1) {
    const value = i === count - 1 ? totalValue - baseValue * (count - 1) : baseValue;
    const seed = (tileX * 193 + tileY * 389 + i * 97) % 1000;
    state.xpParticles.push({
      tileX: tileX + 0.5,
      tileY: tileY + 0.5,
      value,
      elapsed: 0,
      delay: i * 0.03,
      duration: 0.24 + (seed % 6) * 0.02,
      seed,
    });
  }
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

const mulberry32 = _mulberry32;

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

function getGoldPerkCost(level) {
  const multiplier = GOLD_PERK_COST_MULTIPLIER + level * GOLD_PERK_LEVEL_MULTIPLIER_STEP;
  return Math.round(GOLD_PERK_BASE_COST * multiplier ** level);
}

function getIdleFuelDrain() {
  const baseDrain = IDLE_FUEL_DRAIN + Math.floor(state.goldPerkLevel / 3);
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
  return Math.round(60 * getTankFuelMultiplier()) - state.perkFuelBonus;
}

function getCenterDistanceRatio(x, y) {
  return clamp(Math.hypot(x - START_X, y - START_Y) / BASE_MIN_DISTANCE, 0, 1.8);
}

function chooseTilePerkForPosition(x, y, random = Math.random) {
  const ratio = clamp(getCenterDistanceRatio(x, y), 0, 1.2);
  const farBias = ratio;
  const centerBias = 1.2 - ratio;
  const weights = TILE_PERK_WEIGHTS.slice();
  return chooseWeightedPerk(weights, random);
}

function chooseCrystalType(random = Math.random) {
  return 1 + Math.floor(random() * 5);
}

function canPlaceGasPocketAt(x, y) {
  return x >= 2 && y >= 2 && x < GRID_W - 2 && y < GRID_H - 2 && !(x === START_X && y === START_Y) && !isInStartEasyRadius(x, y);
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
      if (nx < 2 || ny < 2 || nx >= GRID_W - 2 || ny >= GRID_H - 2) {
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

function setupField() {
  state.pathIndexByCell.fill(-1);
  state.perkMask.fill(0);
  state.crystalMask.fill(0);
  state.perkZoneMask.fill(-1);
  state.gasMask.fill(0);
  state.steamMask.fill(0);
  state.loopGoldMask.fill(0);
  state.droppedGoldMask.fill(0);
  state.xpPickupMask.fill(0);
  state.hazardTriggeredMask.fill(0);
  state.metalMask.fill(0);
  state.goldOreMask.fill(0);
  state.visibleMask.fill(0);
  state.gasPocketMask.fill(0);
  state.steamPocketMask.fill(0);
  state.boulderPocketMask.fill(0);
  state.beaconMask.fill(0);
  state.artifactMask.fill(0);
  state.heldArtifact = false;
  state.heldArtifactDropX = -1;
  state.heldArtifactDropY = -1;
  state.artifactBumpTime = 0;
  state.artifactBumpDir = null;
  state.artifactChoiceOpen = false;
  state.artifactChoiceTrees = [];
  state.artifactChoicePendingBeacon = null;
  state.safes.length = 0;
  state.wormNests.length = 0;
  state.activeWorms.length = 0;
  state.safeDoorMask.fill(0);
  state.keyMask.fill(0);
  state.safeInteriorMask.fill(0);
  state.heldKeyForSafe = -1;
  state.keyBumpTime = 0;
  state.keyBumpDir = null;
  state.beacons.length = 0;
  state.perkZones.length = 0;
  state.gasClouds.length = 0;
  state.steamJets.length = 0;
  state.boulders.length = 0;
  state.baseFound = false;
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
  state.gold = 0;
  state.unsafeGold = 0;
  state.xp = 0;
  state.level = 1;
  state.xpToNext = getXpNeededForLevel(state.level);
  state.levelRewardStep = 0;
  state.levelRewardQueue = [];
  state.levelUpModalOpen = false;
  state.depth = 0;
  state.perkText = "Нет";
  state.crystalRecipe = [];
  state.crystalCollected = [0, 0, 0, 0, 0, 0];
  state.crystalProgress = 0;
  state.crystalStatusText = "";
  state.isChoosingPerk = false;
  state.pendingPerkChoice = false;
  state.pendingPerkDelay = 0;
  state.bonusPerkChoices = 0;
  state.perkRerolls = 2;
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
  state.nextGoldPerkAt = GOLD_PERK_BASE_COST;
  state.goldPerkLevel = 0;
  state.perkChoices = [];
  state.signalMovesLeft = 0;
  state.signalMovesMax = 0;
  state.signalPrevX = START_X;
  state.signalPrevY = START_Y;
  state.signalDirX = 0;
  state.signalDirY = -1;
  state.strikeSpeed = 1;
  state.drillPower = 1;
  state.miningGoldBonusMultiplier = 0;
  state.goldBonus = 0;
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
  state.radarCrystalModule = false;
  state.blocksBroken = 0;
  state.drillBrokenBlocks = 0;
  state.sideDrills = 0;
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
  state.autoClosePreview = null;
  state.autoClosePreviewReturnTimer = 0;
  state.autoClosePreviewFailed = false;
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
  state.perkToast.text = "";
  state.perkToast.time = 0;
  state.fuelToast.value = 0;
  state.fuelToast.time = 0;
  state.hpToast.value = 0;
  state.hpToast.time = 0;
  state.goldParticles.length = 0;
  state.xpParticles.length = 0;
  state.goldToast.value = 0;
  state.goldToast.time = 0;
  state.damageFlash = 0;
  state.goldHitRect = null;
  state.effects.length = 0;
  state.tileAnimations.length = 0;
  state.tileAnimDest.clear();
  state.visibilityDirty = true;
  state.chainExplosions.length = 0;
  state.base.renderX = 0;
  state.base.renderY = 0;
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
  state.drill.moveResumeTimer = 0;
  state.drill.digDelayTimer = 0;
  state.drill.digDelayDx = 0;
  state.drill.digDelayDy = 0;
  state.worldSeed = newWorldSeed();
  state.worldRandom = mulberry32(state.worldSeed);
  window.__worldSeed = state.worldSeed;
  console.log("World seed:", state.worldSeed);

  const map = generateMap(state.worldSeed);
  state.hardness.set(map.hardness);
  state.hazardMask.set(map.hazardMask);
  state.metalMask.set(map.metalMask);
  state.goldOreMask.set(map.goldOreMask);
  state.gasPocketMask.set(map.gasPocketMask);
  state.steamPocketMask.set(map.steamPocketMask);
  state.boulderPocketMask.set(map.boulderPocketMask);
  state.beaconMask.set(map.beaconMask);
  state.artifactMask.set(map.artifactMask);
  state.tunnelMask.fill(0);
  for (let i = 0; i < GRID_W * GRID_H; i += 1) {
    state.health[i] = BLOCK_TYPES[state.hardness[i]].hp;
    if (map.beaconMask[i] >= 1) {
      state.hardness[i] = 0;
      state.health[i] = 0;
    }
    if (map.beaconMask[i] === 2) {
      state.tunnelMask[i] = 1;
    }
  }
  state.base.x = map.base.x;
  state.base.y = map.base.y;
  for (const b of map.beacons) {
    state.beacons.push({ x: b.x, y: b.y, active: false });
  }
  state.perkMask.set(map.perkMask);
  state.crystalMask.set(map.crystalMask);
  for (const zone of map.perkZones) {
    const zoneId = state.perkZones.length;
    state.perkZones.push({
      x: zone.x, y: zone.y, cells: zone.cells,
      iconX: zone.iconX, iconY: zone.iconY,
      perkType: zone.perkType,
      openedCount: 0, openedMask: 0,
      arming: false, armingTimer: 0, collected: false,
    });
    for (let i = 0; i < zone.cells.length; i += 1) {
      state.perkZoneMask[cellIndex(zone.cells[i].x, zone.cells[i].y)] = zoneId;
    }
  }

  // Load safes
  for (const s of map.safes) {
    const safeIdx = state.safes.length;
    state.safes.push({
      x: s.x, y: s.y, cx: s.cx, cy: s.cy,
      doorX: s.doorX, doorY: s.doorY,
      keyX: s.keyX, keyY: s.keyY,
      interiorCells: s.interiorCells,
      opened: false,
    });
    // Mark door
    state.safeDoorMask[cellIndex(s.doorX, s.doorY)] = safeIdx + 1;
    // Mark key
    state.keyMask[cellIndex(s.keyX, s.keyY)] = safeIdx + 1;
    // Mark interior (NOT tunneled yet — only when door opens)
    for (const c of s.interiorCells) {
      const ci = cellIndex(c.x, c.y);
      state.safeInteriorMask[ci] = safeIdx + 1;
    }
  }

  // Load worm nests
  for (const n of map.wormNests) {
    state.wormNests.push({ x: n.x, y: n.y, cooldown: 0, active: false, destroyed: false });
  }

  state.pathTiles.length = 0;
  carveTunnel(state.drill.x, state.drill.y);
  extendPath(state.drill.x, state.drill.y);

  state.base.renderX = state.base.x;
  state.base.renderY = state.base.y;
  {
    const zoom = getCameraZoom();
    const viewWidth = state.width / zoom;
    const viewHeight = state.height / zoom;
    state.camera.x = state.drill.x * TILE_SIZE + TILE_SIZE * 0.5 - viewWidth * 0.5;
    state.camera.y = state.drill.y * TILE_SIZE + TILE_SIZE * 0.5 - viewHeight * 0.56;
  }
  clearCrystalRecipe();
  rebuildVisibilityMask();
  for (let i = 0; i < state.visibleAlpha.length; i += 1) {
    state.visibleAlpha[i] = state.visibleTargetAlpha[i];
  }
  syncDebugPerkOverlay();
  syncLevelUpModal();

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

function awardBonusGoldPerkChoice() {
  if (state.isChoosingPerk || state.pendingPerkChoice) {
    state.bonusPerkChoices += 1;
    return;
  }
  if (!prepareGoldPerkChoices()) {
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

  state.unsafeGold += 30;
  showGoldToast(30);

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

function refreshSignalDirection(fromX = state.drill.x, fromY = state.drill.y) {
  const dx = state.base.x - fromX;
  const dy = state.base.y - fromY;
  const length = Math.hypot(dx, dy) || 1;
  state.signalDirX = dx / length;
  state.signalDirY = dy / length;
}

function carveTunnel(x, y) {
  const index = cellIndex(x, y);
  // Never carve through metal or locked safe doors
  if (state.metalMask[index]) return;
  if (state.safeDoorMask[index] > 0) return;
  const perkType = state.perkMask[index];
  const crystalType = state.crystalMask[index];
  const zoneId = state.perkZoneMask[index];
  if (!state.tunnelMask[index]) {
    state.tunnelMask[index] = 1;
    state.hardness[index] = 0;
    state.health[index] = 0;
    state.visibilityDirty = true;
  }

  // Pick up any dropped gold lying on this tile
  const droppedPickup = Math.floor(state.droppedGoldMask[index]);
  if (droppedPickup > 0) {
    state.droppedGoldMask[index] = 0;
    state.unsafeGold += droppedPickup;
    spawnGoldParticles(x, y, droppedPickup);
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
    explodeAt(Math.round(zone.x), Math.round(zone.y), state.drillPower * 10, 3);
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
      state.signalMovesLeft += RADAR_BASE_DURATION;
      state.signalMovesMax = Math.max(state.signalMovesMax, state.signalMovesLeft);
      refreshSignalDirection(x, y);
      state.perkText = "Радар";
      break;
    case 3:
      state.drillPower += 0.35;
      state.perkText = "Бур";
      break;
    case 4: {
      const targetX = clamp(x + state.drill.facingX * 2, 1, GRID_W - 2);
      const targetY = clamp(y + state.drill.facingY * 2, 1, GRID_H - 2);
      spawnRocketEffect(x, y, targetX, targetY, {
        kind: "radiusBomb",
        damage: state.drillPower * 10,
        radius: 2,
      });
      state.perkText = "Бомба";
      break;
    }
    case 5:
      state.strikeSpeed += 0.1;
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

function applyGoldPerk(perkType) {
  switch (perkType) {
    case 1:
      state.sideDrills += 1;
      state.perkText = "Боковые буры";
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
      state.radarCrystalModule = true;
      state.perkText = "Радарный модуль";
      break;
    case 11:
      state.goldBonus += 2;
      state.perkText = "Ломосбор";
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
      state.overhealOverdriveDuration = Math.min(10, state.overhealOverdriveDuration > 0 ? state.overhealOverdriveDuration + 2 : 4);
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

function applyShopPerk(nodeId, level) {
  switch (nodeId) {
    case "drill_power":
      state.strikeSpeed += 0.15;
      showPerkToast("Мощность бура");
      break;
    case "side_drills":
      state.sideDrills += 1;
      showPerkToast("Боковые буры");
      break;
    case "long_drill":
      state.longDrillPower += 0.2;
      showPerkToast("Длинный бур");
      break;
    case "diagonal_drills":
      state.diagonalDrillPower += 0.2;
      showPerkToast("Диагональные буры");
      break;
    case "sapper_charge":
      state.remoteBombLevel += 1;
      state.remoteBombInterval = Math.max(15, state.remoteBombInterval > 0 ? state.remoteBombInterval - 5 : 30);
      showPerkToast("Саперный заряд");
      break;
    case "fuel_tank":
      state.maxFuel += 60;
      showPerkToast("Расширенный бак");
      break;
    case "fuel_circuit":
      state.perkFuelBonus += 50;
      showPerkToast("Топливный контур");
      break;
    case "recirculator":
      state.goldBonus += 2;
      state.fuelPickupBonus += 2;
      showPerkToast("Рециркулятор");
      break;
    case "low_fuel_boost":
      state.lowFuelSpeedBonus += 0.35;
      showPerkToast("Форсаж на нуле");
      break;
    case "overload":
      state.overflowBomb = true;
      state.fuelPickupBonus += 50;
      state.maxFuel = Math.max(100, state.maxFuel - 150);
      state.fuel = Math.min(state.fuel, state.maxFuel);
      showPerkToast("Перегрузка");
      break;
    case "geo_lens":
      state.visionRadius = Math.min(12, state.visionRadius + 2);
      state.visibilityDirty = true;
      showPerkToast("Гео-линза");
      break;
    case "radar_module":
      state.radarCrystalModule = true;
      showPerkToast("Радарный модуль");
      break;
    case "radar_booster":
      state.radarBoosterLevel = (state.radarBoosterLevel || 0) + 1;
      showPerkToast("Усилитель радара");
      break;
    case "speed":
      state.strikeSpeed += 0.2;
      showPerkToast("Скорость бура");
      break;
    // ── Бурение (дополнение) ─────────────────────────────────────────────
    case "spike_boost":
      state.spikeOverdriveLevel = Math.min(3, (state.spikeOverdriveLevel || 0) + 1);
      showPerkToast("Шиповой форсаж");
      break;
    // ── Топливо (дополнение) ─────────────────────────────────────────────
    case "tank_boost":
      state.tankBoostLevel = Math.min(3, (state.tankBoostLevel || 0) + 1);
      showPerkToast("Усиленный бак");
      break;
    // ── Контур ───────────────────────────────────────────────────────────
    case "contour_charge":
      state.loopChargeLevel = Math.min(4, (state.loopChargeLevel || 0) + 1);
      state.loopChargeDuration = 2 + state.loopChargeLevel;
      showPerkToast("Контурный заряд");
      break;
    case "contour_trophy":
      state.loopPerkLevel = Math.min(2, (state.loopPerkLevel || 0) + 1);
      showPerkToast("Контурный трофей");
      break;
    case "auto_contour":
      state.idleAutoCloseDelay = Math.max(IDLE_AUTO_CLOSE_MIN_DELAY, state.idleAutoCloseDelay - 1);
      showPerkToast("Автоконтур");
      break;
    case "contour_resonance":
      state.contourLengthDamageLevel = Math.min(4, (state.contourLengthDamageLevel || 0) + 1);
      showPerkToast("Контурный резонанс");
      break;
    case "contour_recovery":
      state.contourReturnFuelLevel = Math.min(3, (state.contourReturnFuelLevel || 0) + 1);
      showPerkToast("Рекуперация контура");
      break;
    // ── Нагрев ───────────────────────────────────────────────────────────
    case "heat_sink":
      state.maxHeat += 20;
      showPerkToast("Теплоотвод");
      break;
    case "heat_drill":
      state.heatDamageBonus += 0.2;
      showPerkToast("Накал бура");
      break;
    case "thermo_charge":
      state.heatExplosionDamageBonus += 1;
      state.heatExplosionRadiusBonus += 0.5;
      showPerkToast("Термозаряд");
      break;
    case "accel_dampers":
      state.stunReduction += 0.4;
      state.heatGainBonus += 1;
      showPerkToast("Разгонные демпферы");
      break;
    case "cooling_pulse":
      state.heatCoolingRewardLevel += 1;
      showPerkToast("Импульс остывания");
      break;
    case "thermo_rockets":
      state.heatOverloadRocketLevel = Math.min(3, (state.heatOverloadRocketLevel || 0) + 1);
      showPerkToast("Терморакеты");
      break;
    case "cryo_rockets":
      state.coolingRocketLevel = Math.min(3, (state.coolingRocketLevel || 0) + 1);
      showPerkToast("Охлаждающие ракеты");
      break;
    // ── Выживание ────────────────────────────────────────────────────────
    case "reinforced_hull":
      state.maxHp += 1;
      healPlayer(2, "Усиленный корпус");
      showPerkToast("Усиленный корпус");
      break;
    case "adrenaline":
      state.overhealOverdrive = true;
      state.overhealOverdriveDuration = Math.min(10, (state.overhealOverdriveDuration || 0) + 2);
      showPerkToast("Перелив адреналина");
      break;
    case "ore_collector":
      state.goldBonus += 2;
      showPerkToast("Ломосбор");
      break;
    case "crystal_catalyst":
      state.crystalCatalystLevel = Math.min(3, (state.crystalCatalystLevel || 0) + 1);
      showPerkToast("Кристальный катализатор");
      break;
    default:
      break;
  }
}

function showDebugToast(text) {
  let el = document.getElementById("debugToast");
  if (!el) {
    el = document.createElement("div");
    el.id = "debugToast";
    el.style.cssText = "position:fixed;top:10px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.85);color:#ff0;font:bold 13px monospace;padding:6px 12px;border-radius:6px;z-index:99999;pointer-events:none;white-space:nowrap;";
    document.body.appendChild(el);
  }
  el.textContent = text;
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.textContent = ""; }, 4000);
}

function showPerkToast(text) {
  state.perkToast.text = text;
  state.perkToast.time = 1.2;
}

function showFuelToast(value) {
  state.fuelToast.value = value;
  state.fuelToast.time = 0.9;
}

function showGoldToast(value) {
  state.goldToast.value = value;
  state.goldToast.time = 0.9;
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
  state.tileAnimDest.add(toY * GRID_W + toX);
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
  }

  state.base.renderX = state.base.x;
  state.base.renderY = state.base.y;

  for (let i = state.tileAnimations.length - 1; i >= 0; i -= 1) {
    const anim = state.tileAnimations[i];
    anim.timer = Math.max(0, anim.timer - dt);
    const t = easeOutCubic(clamp(1 - anim.timer / anim.duration, 0, 1));
    anim.renderX = anim.fromX + (anim.toX - anim.fromX) * t;
    anim.renderY = anim.fromY + (anim.toY - anim.fromY) * t;
    if (anim.timer === 0) {
      state.tileAnimations.splice(i, 1);
      state.tileAnimDest.delete(anim.toY * GRID_W + anim.toX);
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
    initShop({ onClose: () => { state.shopModalOpen = false; syncTouchZonesInteractivity(); } });
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
  const shopOpenBtn = document.getElementById("shopOpen");
  const manualOpen = document.getElementById("manualOpen");
  const manualClose = document.getElementById("manualClose");
  const manualOverlay = document.getElementById("manualModal");
  const manualPanel = manualOverlay?.querySelector(".manual-modal__panel");
  const manualFrame = document.getElementById("manualFrame");
  const debugClose = document.getElementById("debugPerkClose");
  const debugOverlay = document.getElementById("debugPerkMenu");
  const debugPanel = debugOverlay?.querySelector(".debug-perk-menu__panel");
  const crystalRewardOverlay = document.getElementById("crystalReward");
  const crystalRewardClose = document.getElementById("crystalRewardClose");
  const artifactChoiceOverlay = document.getElementById("artifactChoice");
  const levelUpOverlay = document.getElementById("levelUpModal");
  const keysDown = new Set();

  window.addEventListener("resize", resize);
  window.visualViewport?.addEventListener("resize", resize);

  const syncKeyboardAim = () => {
    const left = keysDown.has("arrowleft") || keysDown.has("a") || keysDown.has("ф");
    const right = keysDown.has("arrowright") || keysDown.has("d") || keysDown.has("в");
    const up = keysDown.has("arrowup") || keysDown.has("w") || keysDown.has("ц");
    const down = keysDown.has("arrowdown") || keysDown.has("s") || keysDown.has("ы");
    let x = (right ? 1 : 0) - (left ? 1 : 0);
    let y = (down ? 1 : 0) - (up ? 1 : 0);
    if (x !== 0 || y !== 0) {
      const length = Math.hypot(x, y) || 1;
      x /= length;
      y /= length;
    }
    state.keyAimX = x;
    state.keyAimY = y;
    syncMoveAim();
  };

  zone.addEventListener("pointerdown", (event) => {
    if (state.beaconActivationAnim || state.debugPerkMenuOpen || state.manualModalOpen || state.shopModalOpen || state.levelUpModalOpen) {
      return;
    }
    if (state.goldHitRect && isPointInsideRect(event.clientX, event.clientY, state.goldHitRect)) {
      state.dragId = null;
      state.touchAimX = 0;
      state.touchAimY = 0;
      pad.classList.remove("move-pad--active");
      stick.style.transform = "translate(0px, 0px)";
      syncMoveAim();
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
    state.touchAimX = 0;
    state.touchAimY = 0;
    pad.classList.remove("move-pad--active");
    stick.style.transform = "translate(0px, 0px)";
    syncMoveAim();
  };

  zone.addEventListener("pointerup", resetPad);
  zone.addEventListener("pointercancel", resetPad);

  window.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    if (!["arrowleft", "arrowright", "arrowup", "arrowdown", "w", "a", "s", "d", "ц", "ф", "ы", "в"].includes(key)) {
      return;
    }
    event.preventDefault();
    keysDown.add(key);
    syncKeyboardAim();
  });

  window.addEventListener("keyup", (event) => {
    const key = event.key.toLowerCase();
    if (!["arrowleft", "arrowright", "arrowup", "arrowdown", "w", "a", "s", "d", "ц", "ф", "ы", "в"].includes(key)) {
      return;
    }
    keysDown.delete(key);
    syncKeyboardAim();
  });

  for (let i = 0; i < perkButtons.length; i += 1) {
    perkButtons[i].addEventListener("click", () => {
      chooseGoldPerk(i);
    });
  }

  if (rerollButton) {
    rerollButton.addEventListener("click", () => {
      rerollPerkChoices();
    });
  }

  if (shopOpenBtn) {
    shopOpenBtn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      resetPad();
      state.shopModalOpen = true;
      syncTouchZonesInteractivity();
      openShop(state.gold);
    });
  }

  document.addEventListener("shop:purchase", (e) => {
    const { cost, nodeId, level } = e.detail;
    state.gold = Math.max(0, state.gold - cost);
    applyShopPerk(nodeId, level);
    renderShop(state.gold);
  });

  if (manualOpen) {
    manualOpen.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      resetPad();
      if (manualFrame) {
        manualFrame.src = `./manual.html?v=${Date.now()}`;
      }
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

  const debugAddGold = document.getElementById("debugAddGold");
  if (debugAddGold) {
    debugAddGold.addEventListener("click", () => {
      state.gold += 500;
      renderShop(state.gold);
      showPerkToast("+500 золота");
    });
  }

  const debugAddUnsafeGold = document.getElementById("debugAddUnsafeGold");
  if (debugAddUnsafeGold) {
    debugAddUnsafeGold.addEventListener("click", () => {
      state.unsafeGold += 100;
      showPerkToast("+100 грязного золота");
    });
  }

  const debugAddFuel = document.getElementById("debugAddFuel");
  if (debugAddFuel) {
    debugAddFuel.addEventListener("click", () => {
      state.fuel = Math.min(state.fuel + 200, state.maxFuel);
      showPerkToast("+200 топлива");
    });
  }

  const debugHealFull = document.getElementById("debugHealFull");
  if (debugHealFull) {
    debugHealFull.addEventListener("click", () => {
      state.hp = state.maxHp;
      showPerkToast("HP восстановлено");
    });
  }

  const debugGiveArtifact = document.getElementById("debugGiveArtifact");
  if (debugGiveArtifact) {
    debugGiveArtifact.addEventListener("click", () => {
      state.heldArtifact = true;
      showPerkToast("Артефакт выдан!");
      state.debugPerkMenuOpen = false;
      syncDebugPerkOverlay();
    });
  }

  const debugGiveKey = document.getElementById("debugGiveKey");
  if (debugGiveKey) {
    debugGiveKey.addEventListener("click", () => {
      // Give key for nearest unopened safe
      let nearest = null;
      let bestDist = Infinity;
      for (let i = 0; i < state.safes.length; i++) {
        if (state.safes[i].opened) continue;
        const d = Math.abs(state.safes[i].cx - state.drill.x) + Math.abs(state.safes[i].cy - state.drill.y);
        if (d < bestDist) { bestDist = d; nearest = i; }
      }
      if (nearest !== null) {
        state.heldKeyForSafe = nearest;
        showPerkToast(`Ключ выдан (сейф #${nearest})`);
      } else {
        showPerkToast("Нет закрытых сейфов");
      }
      state.debugPerkMenuOpen = false;
      syncDebugPerkOverlay();
    });
  }

  const debugTeleportBeacon = document.getElementById("debugTeleportBeacon");
  if (debugTeleportBeacon) {
    debugTeleportBeacon.addEventListener("click", () => {
      let nearest = null;
      let bestDist = Infinity;
      for (const b of state.beacons) {
        const d = Math.abs(b.x - state.drill.x) + Math.abs(b.y - state.drill.y);
        if (d < bestDist) { bestDist = d; nearest = b; }
      }
      if (nearest) {
        const tx = nearest.x - 2;
        const ty = nearest.y;
        state.drill.x = tx;
        state.drill.y = ty;
        state.drill.renderX = tx;
        state.drill.renderY = ty;
        state.visibilityDirty = true;
        carveTunnel(tx, ty);
        state.pathTiles.length = 0;
        state.pathTiles.push({ x: tx, y: ty });
        rebuildPathIndex();
        showPerkToast(`Телепорт к маяку (${nearest.x}, ${nearest.y})`);
        state.debugPerkMenuOpen = false;
        syncDebugPerkOverlay();
      }
    });
  }

  const debugTeleportSafe = document.getElementById("debugTeleportSafe");
  if (debugTeleportSafe) {
    debugTeleportSafe.addEventListener("click", () => {
      let nearest = null;
      let bestDist = Infinity;
      for (const s of state.safes) {
        if (s.opened) continue;
        const d = Math.abs(s.doorX - state.drill.x) + Math.abs(s.doorY - state.drill.y);
        if (d < bestDist) { bestDist = d; nearest = s; }
      }
      if (nearest) {
        // Teleport in front of door (outside the safe)
        const dx = nearest.doorX - nearest.cx;
        const dy = nearest.doorY - nearest.cy;
        const tx = nearest.doorX + dx;
        const ty = nearest.doorY + dy;
        state.drill.x = tx;
        state.drill.y = ty;
        state.drill.renderX = tx;
        state.drill.renderY = ty;
        state.visibilityDirty = true;
        carveTunnel(tx, ty);
        state.pathTiles.length = 0;
        state.pathTiles.push({ x: tx, y: ty });
        rebuildPathIndex();
        showPerkToast(`Телепорт к сейфу (${nearest.doorX}, ${nearest.doorY})`);
      } else {
        showPerkToast("Нет закрытых сейфов");
      }
      state.debugPerkMenuOpen = false;
      syncDebugPerkOverlay();
    });
  }

  const debugTeleportWorm = document.getElementById("debugTeleportWorm");
  if (debugTeleportWorm) {
    debugTeleportWorm.addEventListener("click", () => {
      let nearest = null;
      let bestDist = Infinity;
      for (const n of state.wormNests) {
        const d = Math.abs(n.x - state.drill.x) + Math.abs(n.y - state.drill.y);
        if (d < bestDist) { bestDist = d; nearest = n; }
      }
      if (nearest) {
        // Teleport within activation radius
        const tx = nearest.x - 3;
        const ty = nearest.y;
        state.drill.x = tx;
        state.drill.y = ty;
        state.drill.renderX = tx;
        state.drill.renderY = ty;
        state.visibilityDirty = true;
        carveTunnel(tx, ty);
        state.pathTiles.length = 0;
        state.pathTiles.push({ x: tx, y: ty });
        rebuildPathIndex();
        showPerkToast(`Телепорт к гнезду (${nearest.x}, ${nearest.y})`);
      } else {
        showPerkToast("Нет гнёзд червей");
      }
      state.debugPerkMenuOpen = false;
      syncDebugPerkOverlay();
    });
  }

  function teleportToNearestZoneOfType(perkType) {
    let nearest = null;
    let bestDist = Infinity;
    for (const z of state.perkZones) {
      if (z.collected || z.perkType !== perkType) continue;
      const d = Math.abs(Math.round(z.x) - state.drill.x) + Math.abs(Math.round(z.y) - state.drill.y);
      if (d < bestDist) { bestDist = d; nearest = z; }
    }
    if (nearest) {
      const tx = Math.round(nearest.x) - 2;
      const ty = Math.round(nearest.y);
      state.drill.x = tx; state.drill.y = ty;
      state.drill.renderX = tx; state.drill.renderY = ty;
      state.visibilityDirty = true;
      carveTunnel(tx, ty);
      state.pathTiles.length = 0;
      state.pathTiles.push({ x: tx, y: ty });
      rebuildPathIndex();
      showPerkToast(`Зона ${TILE_PERK_TYPES[perkType].name} (${Math.round(nearest.x)}, ${Math.round(nearest.y)})`);
    } else {
      showPerkToast(`Нет зон: ${TILE_PERK_TYPES[perkType].name}`);
    }
    state.debugPerkMenuOpen = false;
    syncDebugPerkOverlay();
  }

  [
    ["debugZoneBak", 1],
    ["debugZoneBomba", 4],
    ["debugZoneHp", 6],
    ["debugZoneBronya", 7],
  ].forEach(([id, perkType]) => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener("click", () => teleportToNearestZoneOfType(perkType));
  });

  const debugOpenShop = document.getElementById("debugOpenShop");
  if (debugOpenShop) {
    debugOpenShop.addEventListener("click", () => {
      state.debugPerkMenuOpen = false;
      syncDebugPerkOverlay();
      state.shopModalOpen = true;
      syncTouchZonesInteractivity();
      openShop(state.gold);
    });
  }

  const debugUnlockTree = document.getElementById("debugUnlockTree");
  if (debugUnlockTree) {
    debugUnlockTree.addEventListener("click", () => {
      const tree = unlockRandomTree();
      if (tree) {
        showPerkToast(`Открыт: ${tree.icon} ${tree.name}`);
      } else {
        showPerkToast("Все инструменты уже открыты");
      }
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

  if (artifactChoiceOverlay) {
    artifactChoiceOverlay.addEventListener("click", (event) => {
      const card = event.target.closest(".artifact-choice__card");
      if (!card) return;
      const idx = card.id === "artifactChoiceCard0" ? 0 : 1;
      pickArtifactChoice(idx);
    });
  }

  if (levelUpOverlay) {
    levelUpOverlay.addEventListener("click", (event) => {
      const choice = event.target.closest("[data-level-reward-id]");
      if (choice) {
        claimLevelReward(choice.dataset.levelRewardId || "");
        return;
      }
    });
  }

  buildDebugPerkButtons();
  syncManualModal();
  syncDebugPerkOverlay();
  syncCrystalRewardOverlay();
  syncLevelUpModal();
}

function isPointInsideRect(x, y, rect) {
  return !!rect && x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
}

function buildDebugPerkButtons() {
  const tileRoot = document.getElementById("debugTilePerks");
  const goldRoot = document.getElementById("debugGoldPerks");
  const instrRoot = document.getElementById("debugInstruments");
  if (!tileRoot || !goldRoot) {
    return;
  }

  // Instruments list
  if (instrRoot) {
    instrRoot.innerHTML = "";
    const trees = getAllTrees();
    for (const tree of trees) {
      const unlocked = isTreeUnlocked(tree.id);
      const button = document.createElement("button");
      button.type = "button";
      button.className = `debug-perk-menu__button${unlocked ? " debug-perk-menu__button--selected" : ""}`;
      button.innerHTML = `<span class="debug-perk-menu__button-name">${tree.icon} ${tree.name}</span><span class="debug-perk-menu__button-meta">${unlocked ? "✓ Открыт" : "🔒 Закрыт — нажми чтобы открыть"}</span>`;
      button.addEventListener("click", () => {
        if (!unlocked) {
          const result = unlockTreeById(tree.id);
          if (result) showPerkToast(`Открыт: ${result.icon} ${result.name}`);
        }
        buildDebugPerkButtons();
      });
      instrRoot.appendChild(button);
    }
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

  goldRoot.innerHTML = "";
  for (let i = 1; i < GOLD_PERK_TYPES.length; i += 1) {
    if (i === 21) {
      continue;
    }
    if (!GOLD_PERK_TYPES[i]) {
      continue;
    }
    const perk = GOLD_PERK_TYPES[i];
    const key = `gold:${i}`;
    const isSelected = state.debugPerkSelection === key;
    const button = document.createElement("button");
    button.type = "button";
    button.className = `debug-perk-menu__button${isSelected ? " debug-perk-menu__button--selected" : ""}`;
    button.innerHTML = `<span class="debug-perk-menu__button-name"><span class="debug-perk-menu__icon">${getGoldPerkIconMarkup(i, "debug-perk-menu__icon-svg")}</span>${perk.name}</span>${isSelected ? `<span class="debug-perk-menu__button-meta">${perk.desc}</span><span class="debug-perk-menu__button-meta">Еще раз: выдать перк</span>` : ""}`;
    button.addEventListener("click", () => {
      if (state.debugPerkSelection !== key) {
        state.debugPerkSelection = key;
        buildDebugPerkButtons();
        return;
      }
      runFuelEvent(() => applyGoldPerk(i));
      state.debugPerkSelection = "";
      syncDebugPerkOverlay();
    });
    goldRoot.appendChild(button);
  }
}

function syncTouchZonesInteractivity() {
  const touchZones = document.querySelector(".touch-zones");
  if (!touchZones) {
    return;
  }
  touchZones.style.pointerEvents =
    state.beaconActivationAnim || state.isChoosingPerk || state.manualModalOpen || state.shopModalOpen || state.debugPerkMenuOpen || state.crystalRewardModalOpen || state.artifactChoiceOpen || state.levelUpModalOpen ? "none" : "auto";
  syncMoveAim();
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
  const seedDisplay = document.getElementById("debugSeedDisplay");
  if (seedDisplay) seedDisplay.textContent = `Seed: ${state.worldSeed}`;

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

function getCurrentLevelRewardEntry() {
  return state.levelRewardQueue[0] || null;
}

function getLevelRewardTemplateStep(step) {
  if (LEVEL_REWARD_DEFS[step]) {
    return step;
  }
  const cycleIndex = (step - 7) % LEVEL_REWARD_REPEAT_PATTERN.length;
  return LEVEL_REWARD_REPEAT_PATTERN[(cycleIndex + LEVEL_REWARD_REPEAT_PATTERN.length) % LEVEL_REWARD_REPEAT_PATTERN.length];
}

function getLevelRewardChoices(entry = getCurrentLevelRewardEntry()) {
  if (!entry) {
    return [];
  }
  return LEVEL_REWARD_DEFS[getLevelRewardTemplateStep(entry.step)] || [];
}

function resolveLevelRewardQueue() {
  while (state.levelRewardQueue.length > 0 && getLevelRewardChoices(state.levelRewardQueue[0]).length === 0) {
    state.levelRewardQueue.shift();
  }
  if (state.levelRewardQueue.length === 0) {
    state.levelUpModalOpen = false;
  }
}

function maybeOpenPendingLevelReward() {
  resolveLevelRewardQueue();
  if (state.levelRewardQueue.length === 0 || state.levelUpModalOpen) {
    return;
  }
  if (
    state.beaconActivationAnim ||
    state.manualModalOpen ||
    state.shopModalOpen ||
    state.debugPerkMenuOpen ||
    state.crystalRewardModalOpen ||
    state.artifactChoiceOpen ||
    state.isChoosingPerk
  ) {
    return;
  }
  openLevelUpModal();
}

function syncLevelUpModal() {
  const overlay = document.getElementById("levelUpModal");
  const eyebrow = document.getElementById("levelUpEyebrow");
  const title = document.getElementById("levelUpTitle");
  const text = document.getElementById("levelUpText");
  const choices = document.getElementById("levelUpChoices");
  const entry = getCurrentLevelRewardEntry();
  const rewardChoices = getLevelRewardChoices(entry);
  if (!overlay || !eyebrow || !title || !text || !choices) {
    return;
  }
  const isOpen = state.levelUpModalOpen && !!entry && rewardChoices.length > 0;
  overlay.hidden = !isOpen;
  if (state.levelUpModalOpen) {
    overlay.removeAttribute("hidden");
  }
  if (!isOpen) {
    choices.innerHTML = "";
    syncTouchZonesInteractivity();
    return;
  }
  eyebrow.textContent = `Уровень ${entry.level}`;
  title.textContent = entry.step === 4 ? "Выбор артефакта" : "Выберите награду";
  text.textContent =
    entry.step === 4
      ? "Выберите: взять артефакт в руки и нести к маяку или полностью восстановиться."
      : `Награда ${entry.step}: выберите один бонус.`;
  choices.innerHTML = rewardChoices.map((choice) => `
    <button class="level-up-modal__choice" type="button" data-level-reward-id="${choice.id}">
      <span class="level-up-modal__choice-label">${choice.label}</span>
      <span class="level-up-modal__choice-text">${choice.description}</span>
    </button>
  `).join("");
  syncTouchZonesInteractivity();
}

function openLevelUpModal() {
  resolveLevelRewardQueue();
  if (state.levelRewardQueue.length === 0) {
    state.levelUpModalOpen = false;
    syncLevelUpModal();
    return;
  }
  state.levelUpModalOpen = true;
  syncLevelUpModal();
}

function closeLevelUpModal() {
  state.levelUpModalOpen = false;
  syncLevelUpModal();
}

function grantLevelRewardArtifact() {
  if (state.heldArtifact) {
    showPerkToast("Артефакт уже у тебя");
    return;
  }
  state.heldArtifact = true;
  state.heldArtifactDropX = -1;
  state.heldArtifactDropY = -1;
  state.artifactBumpTime = 0;
  state.artifactBumpDir = null;
  showPerkToast("Артефакт получен! Неси к маяку");
  triggerPickupRadar("artifact", state.drill.x, state.drill.y);
}

function restorePlayerFully() {
  const fuelDelta = Math.max(0, state.maxFuel - state.fuel);
  state.fuel = state.maxFuel;
  if (fuelDelta > 0) {
    showFuelToast(fuelDelta);
  }
  const missingHp = Math.max(0, state.maxHp - state.hp);
  if (missingHp > 0) {
    healPlayer(missingHp, "Полное восстановление");
  }
  showPerkToast("Полное восстановление");
}

function applyLevelReward(choiceId) {
  switch (choiceId) {
    case "gold_5":
      state.miningGoldBonusMultiplier += 0.05;
      showPerkToast("+5% золота из блоков");
      return;
    case "damage_0_5":
      state.drillPower += 0.35;
      showPerkToast("+0.35 урона");
      return;
    case "speed_10":
      state.strikeSpeed += 0.1;
      showPerkToast("+10% скорости");
      return;
    case "fuel_100":
      addFuel(100, state.drill.x, state.drill.y);
      showPerkToast("+100 топлива");
      return;
    case "hp_1":
      state.maxHp += 1;
      healPlayer(1, "Награда уровня");
      showPerkToast("+1 HP");
      return;
    case "artifact":
      grantLevelRewardArtifact();
      return;
    case "full_restore":
      restorePlayerFully();
      return;
    case "heal_full":
      healPlayer(Math.max(0, state.maxHp - state.hp), "Лечение");
      showPerkToast("Полное лечение");
      return;
    default:
      return;
  }
}

function claimLevelReward(choiceId) {
  const entry = getCurrentLevelRewardEntry();
  const rewardChoices = getLevelRewardChoices(entry);
  if (!entry || !rewardChoices.some((choice) => choice.id === choiceId)) {
    return;
  }
  state.levelRewardQueue.shift();
  closeLevelUpModal();
  applyLevelReward(choiceId);
  maybeOpenPendingLevelReward();
}

// ─── Artifact choice modal ────────────────────────────────────────────────────

function openArtifactChoice() {
  state.artifactChoiceOpen = true;
  syncTouchZonesInteractivity();
  const overlay = document.getElementById("artifactChoice");
  if (!overlay) return;
  overlay.hidden = false;
  overlay.style.cssText =
    "position:absolute;inset:0;z-index:9999;display:flex;visibility:visible;pointer-events:auto;opacity:1;align-items:center;justify-content:center;background:rgba(10,8,6,0.85);";

  const [t0, t1] = state.artifactChoiceTrees;
  const card0 = document.getElementById("artifactChoiceCard0");
  const card1 = document.getElementById("artifactChoiceCard1");
  if (card0) card0.innerHTML = buildArtifactChoiceCard(t0);
  if (card1) card1.innerHTML = buildArtifactChoiceCard(t1);
}

function buildArtifactChoiceCard(tree) {
  const nodesPreview = tree.nodes.slice(0, 3).map(n =>
    `<div class="artifact-choice__node"><span class="artifact-choice__node-icon">${n.icon}</span> ${n.name}</div>`
  ).join("");
  return `
    <div class="artifact-choice__card-icon">${tree.icon}</div>
    <div class="artifact-choice__card-name">${tree.name}</div>
    <div class="artifact-choice__card-nodes">${nodesPreview}</div>
  `;
}

function pickArtifactChoice(idx) {
  if (!state.artifactChoiceOpen || !state.artifactChoiceTrees[idx]) return;
  const chosenId = state.artifactChoiceTrees[idx].id;
  const tree = unlockTreeById(chosenId);
  closeArtifactChoice();
  if (tree) showPerkToast(`Открыт инструмент: ${tree.icon} ${tree.name}`);
  state.shopModalOpen = true;
  syncTouchZonesInteractivity();
  openShop(state.gold, chosenId);
}

function closeArtifactChoice() {
  state.artifactChoiceOpen = false;
  state.artifactChoiceTrees = [];
  state.artifactChoicePendingBeacon = null;
  const overlay = document.getElementById("artifactChoice");
  if (overlay) {
    overlay.hidden = true;
    overlay.style.cssText = "display:none;visibility:hidden;pointer-events:none;opacity:0;";
  }
  syncTouchZonesInteractivity();
}

// ─── Crystal reward modal ─────────────────────────────────────────────────────

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

function syncMoveAim() {
  if (state.beaconActivationAnim || state.manualModalOpen || state.shopModalOpen || state.debugPerkMenuOpen || state.crystalRewardModalOpen || state.artifactChoiceOpen || state.levelUpModalOpen || state.isChoosingPerk) {
    state.moveAimX = 0;
    state.moveAimY = 0;
    return;
  }
  if (state.dragId !== null) {
    state.moveAimX = state.touchAimX;
    state.moveAimY = state.touchAimY;
    return;
  }
  state.moveAimX = state.keyAimX;
  state.moveAimY = state.keyAimY;
}

function updatePad(event, stick) {
  const dx = event.clientX - state.padCenterX;
  const dy = event.clientY - state.padCenterY;
  const length = Math.hypot(dx, dy) || 1;
  const maxRadius = 118 * 0.32;
  const limited = Math.min(maxRadius, length);
  const nx = dx / length;
  const ny = dy / length;
  state.touchAimX = nx * (limited / maxRadius);
  state.touchAimY = ny * (limited / maxRadius);
  syncMoveAim();
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
    const instantFps = delta > 0 ? 1000 / delta : 0;
    state.fps = state.fps > 0 ? state.fps * 0.88 + instantFps * 0.12 : instantFps;
    state.fpsHistory.push(Math.round(instantFps));
    if (state.fpsHistory.length > 40) state.fpsHistory.shift();
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

  if (state.autoClosePreviewReturnTimer > 0) {
    state.autoClosePreviewReturnTimer = Math.max(0, state.autoClosePreviewReturnTimer - dt);
    if (state.autoClosePreviewReturnTimer === 0 && state.idleTime < IDLE_AUTO_CLOSE_PREVIEW_DELAY) {
      state.autoClosePreview = null;
    }
  }

  updateMovementAnimations(dt);
  updateExperienceParticles(dt);

  if (state.crystalRewardModalOpen) {
    updateCrystalRewardModal(dt);
    return;
  }

  maybeOpenPendingLevelReward();

  if (state.levelUpModalOpen) {
    return;
  }

  if (state.isChoosingPerk) {
    return;
  }

  if (state.pickupRadarTimer > 0) {
    state.pickupRadarTimer = Math.max(0, state.pickupRadarTimer - dt);
  }

  pickupExperienceNearPlayer();

  if (state.signalMovesLeft > 0) {
    state.signalMovesLeft = Math.max(0, state.signalMovesLeft - dt);
    refreshSignalDirection();
    if (state.signalMovesLeft === 0) {
      state.signalMovesMax = 0;
    }
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
  updateWorms(dt);
  updatePerkZones(dt);
  updateChainExplosions(dt);
  updateEffects(dt);
  updateGoldParticles(dt);
  if (state.visibilityDirty) {
    rebuildVisibilityMask();
    state.visibilityDirty = false;
  }
  updateVisibilityFade(dt);
  updateDiscovery();
  updateCamera(dt);
  updateCameraShake(dt);
  updateBeaconActivationAnim();
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
      if (state.heatCoolingRewardLevel > 0 && state.heatCoolingPeak >= 30) {
        state.signalMovesLeft = Math.max(state.signalMovesLeft, 5);
        state.signalMovesMax = Math.max(state.signalMovesMax, state.signalMovesLeft);
        refreshSignalDirection();
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
  state.goldToast.time = Math.max(0, state.goldToast.time - dt);
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
    awardBonusGoldPerkChoice();
    return;
  }
  // checkGoldPerkUnlock(); // replaced by beacon shop
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

function updateGoldParticles(dt) {
  for (let i = state.goldParticles.length - 1; i >= 0; i -= 1) {
    const p = state.goldParticles[i];
    p.elapsed += dt;
    const active = p.elapsed - p.delay;
    if (active < p.duration) continue;
    // Particle arrived — credit unsafe gold (unless already credited as deposit)
    if (!p.skipCredit) {
      state.unsafeGold += p.value;
      if (p.isLast && !p.skipArrivalEffect) spawnGoldOreEffect(state.drill.x, state.drill.y, p.toastValue || p.value);
    } else if (p.destTileX !== undefined) {
      state.effects.push({
        kind: "depositArrival",
        x: p.destTileX,
        y: p.destTileY,
        time: 0.35,
        duration: 0.35,
        seed: (p.seed * 137) % 360,
      });
    }
    state.goldParticles.splice(i, 1);
  }
}

function updateExperienceParticles(dt) {
  for (let i = state.xpParticles.length - 1; i >= 0; i -= 1) {
    const particle = state.xpParticles[i];
    particle.elapsed += dt;
    if (particle.elapsed - particle.delay < particle.duration) {
      continue;
    }
    gainExperience(particle.value);
    state.xpParticles.splice(i, 1);
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
  state.visibleTargetAlpha.fill(0);
  const startX = state.drill.x;
  const startY = state.drill.y;
  const radiusSq = state.visionRadius * state.visionRadius;
  const startIndex = cellIndex(startX, startY);

  // BFS using flat indices — no per-iteration object allocation
  let bfsHead = 0;
  let bfsTail = 0;
  _visBfsQueue[bfsTail++] = startIndex;
  state.visibleMask[startIndex] = 1;

  const offsets = [-1, 1, -GRID_W, GRID_W, -GRID_W - 1, -GRID_W + 1, GRID_W - 1, GRID_W + 1];
  const stepDxLUT = [-1, 1, 0, 0, -1, 1, -1, 1];
  const stepDyLUT = [0, 0, -1, 1, -1, -1, 1, 1];

  while (bfsHead < bfsTail) {
    const idx = _visBfsQueue[bfsHead++];
    const cx = idx % GRID_W;
    const cy = (idx / GRID_W) | 0;
    for (let n = 0; n < 8; n += 1) {
      const nx = cx + stepDxLUT[n];
      const ny = cy + stepDyLUT[n];
      if (nx < 1 || ny < 1 || nx >= GRID_W - 1 || ny >= GRID_H - 1) continue;
      const ddx = nx - startX;
      const ddy = ny - startY;
      if (ddx * ddx + ddy * ddy > radiusSq) continue;
      const ni = cellIndex(nx, ny);
      if (state.visibleMask[ni]) continue;
      const sdx = stepDxLUT[n];
      const sdy = stepDyLUT[n];
      if (sdx !== 0 && sdy !== 0) {
        if (state.metalMask[cellIndex(cx + sdx, cy)] || state.metalMask[cellIndex(cx, cy + sdy)]) continue;
      }
      state.visibleMask[ni] = 1;
      if (!state.metalMask[ni]) {
        _visBfsQueue[bfsTail++] = ni;
      }
    }
  }

  // Fog gradient BFS — reuse persistent buffers
  const fogMaxDistance = 6;
  _visFogDistance.fill(-1);
  let fogHead = 0;
  let fogTail = 0;

  for (let i = 0; i < state.visibleMask.length; i += 1) {
    if (!state.visibleMask[i]) continue;
    state.visibleTargetAlpha[i] = 1;
    _visFogDistance[i] = 0;
    _visFogQueue[fogTail++] = i;
  }

  while (fogHead < fogTail) {
    const index = _visFogQueue[fogHead++];
    const distance = _visFogDistance[index];
    if (distance >= fogMaxDistance) continue;
    const x = index % GRID_W;
    const y = (index / GRID_W) | 0;
    for (let oy = -1; oy <= 1; oy += 1) {
      for (let ox = -1; ox <= 1; ox += 1) {
        if (ox === 0 && oy === 0) continue;
        const nx = x + ox;
        const ny = y + oy;
        if (nx < 1 || ny < 1 || nx >= GRID_W - 1 || ny >= GRID_H - 1) continue;
        const nextIndex = cellIndex(nx, ny);
        if (_visFogDistance[nextIndex] !== -1) continue;
        const nextDistance = distance + 1;
        _visFogDistance[nextIndex] = nextDistance;
        if (!state.visibleMask[nextIndex]) {
          state.visibleTargetAlpha[nextIndex] = nextDistance === 1 ? 0.4 : nextDistance === 2 ? 0.1 : 0;
        } else {
          state.visibleTargetAlpha[nextIndex] = 1;
        }
        _visFogQueue[fogTail++] = nextIndex;
      }
    }
  }
}

function prepareGoldPerkChoices() {
  const bag = [1, 3, 4, 5, 6, 8, 11, 14, 15, 20, 22, 23, 24, 25];
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
  if (!state.radarCrystalModule) {
    bag.push(10);
  }
  if (!state.overflowBomb) {
    bag.push(13);
  }
  if (state.overhealOverdriveDuration < 10) {
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

function checkGoldPerkUnlock() {
  if (state.isChoosingPerk || state.pendingPerkChoice || state.gold < state.nextGoldPerkAt) {
    return;
  }

  if (!prepareGoldPerkChoices()) {
    return;
  }
  state.pendingPerkChoice = true;
  state.pendingPerkDelay = GOLD_PERK_POPUP_DELAY;
  state.goldPerkLevel += 1;
  state.nextGoldPerkAt += getGoldPerkCost(state.goldPerkLevel);
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
  activateDrillOverdrive(state.overhealOverdriveDuration || 4, "Перелив адреналина");
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

function chooseGoldPerk(slotIndex) {
  if (!state.isChoosingPerk) {
    return;
  }

  const perkType = state.perkChoices[slotIndex];
  if (!perkType) {
    return;
  }

  runFuelEvent(() => applyGoldPerk(perkType));
  state.isChoosingPerk = false;
  state.perkChoices = [];
  syncPerkChoiceOverlay();
}

function rerollPerkChoices() {
  if (!state.isChoosingPerk || state.perkRerolls <= 0) {
    return;
  }

  if (!prepareGoldPerkChoices()) {
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

function getGoldPerkIconMarkup(perkType, className = "") {
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

function getGoldPerkNextLevel(perkType) {
  switch (perkType) {
    case 1:
      return state.sideDrills + 1;
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
      return 1;
    case 11:
      return Math.round(state.goldBonus / 2) + 1;
    case 13:
      return 1;
    case 14:
      return state.maxHp - START_HP + 1;
    case 15:
      return Math.max(1, Math.floor(Math.max(0, state.overhealOverdriveDuration - 2) / 2) + 1);
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

function getGoldPerkCurrentLevel(perkType) {
  switch (perkType) {
    case 1:
      return state.sideDrills;
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
      return state.radarCrystalModule ? 1 : 0;
    case 11:
      return Math.round(state.goldBonus / 2);
    case 13:
      return state.overflowBomb ? 1 : 0;
    case 14:
      return Math.max(0, state.maxHp - START_HP);
    case 15:
      return state.overhealOverdriveDuration > 0 ? Math.floor(Math.max(0, state.overhealOverdriveDuration - 2) / 2) : 0;
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

function getGoldPerkPreview(perkType) {
  switch (perkType) {
    case 1: {
      const currentPower = 0.5 + state.sideDrills * 0.25;
      const nextPower = 0.5 + (state.sideDrills + 1) * 0.25;
      return {
        effect: "Бьет слева и справа от героя",
        compare: `Урон ${formatPerkPercent(currentPower)} → ${formatPerkPercent(nextPower)}`,
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
        effect: "Показывает ближайшие кристаллы на кольце радара",
        compare: state.radarCrystalModule ? "Уже активно" : "Выкл → Вкл",
      };
    }
    case 11: {
      return {
        effect: "+2 gold за каждый блок",
        compare: `${state.goldBonus} → ${state.goldBonus + 2}`,
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
      const nextDuration = Math.min(10, state.overhealOverdriveDuration > 0 ? state.overhealOverdriveDuration + 2 : 4);
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
      let compare = "0 → +30 gold";
      if (level === 1) {
        compare = "+30 gold → +40 fuel";
      } else if (level === 2) {
        compare = "+40 fuel → +1 HP";
      } else if (level >= 3) {
        compare = "Макс.";
      }
      return { effect, compare };
    }
    case 19: {
      const durations = [0, 6, 9, 12];
      const currentDuration = durations[state.spikeOverdriveLevel] || 0;
      const nextDuration = durations[Math.min(3, state.spikeOverdriveLevel + 1)] || 12;
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
        effect: "После 30+ heat при остывании дает радар",
        compare: state.heatCoolingRewardLevel > 0 ? "Уже: 5 сек" : "Выкл → 5 сек",
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
      const nextBaseDrain = IDLE_FUEL_DRAIN + Math.floor(state.goldPerkLevel / 3);
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
    subtitle.textContent = `Апгрейд за ${getGoldPerkCost(state.goldPerkLevel)} золота`;
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
    const preview = getGoldPerkPreview(perkType);
    button.innerHTML = `<span class="perk-option__top"><span class="perk-option__title"><span class="perk-option__icon">${getGoldPerkIconMarkup(perkType, "perk-option__icon-svg")}</span><span class="perk-option__name">${GOLD_PERK_TYPES[perkType].name}</span></span><span class="perk-option__level">Лвл ${getGoldPerkNextLevel(perkType)}</span></span><span class="perk-option__effect">${preview.effect}</span><span class="perk-option__compare">${preview.compare}</span>`;
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

function getXpNeededForLevel(level) {
  return Math.round(40 * 1.5 ** Math.max(0, level - 1));
}

function applyMiningGoldBonus(amount) {
  if (amount <= 0) {
    return 0;
  }
  return Math.max(1, Math.floor(amount * (1 + state.miningGoldBonusMultiplier)));
}

function spawnExperienceCrystal(x, y, amount = XP_PER_BLOCK) {
  if (amount <= 0) {
    return;
  }
  const index = cellIndex(x, y);
  state.xpPickupMask[index] += amount;
}

function gainExperience(amount) {
  if (amount <= 0) {
    return;
  }
  state.xp += amount;
  while (state.xp >= state.xpToNext) {
    state.xp -= state.xpToNext;
    state.level += 1;
    state.xpToNext = getXpNeededForLevel(state.level);
    state.levelRewardStep += 1;
    state.levelRewardQueue.push({ step: state.levelRewardStep, level: state.level });
    showPerkToast(`Уровень ${state.level}`);
  }
  maybeOpenPendingLevelReward();
}

function pickupExperienceNearPlayer() {
  const px = state.drill.x;
  const py = state.drill.y;
  for (let dy = -XP_PICKUP_RADIUS; dy <= XP_PICKUP_RADIUS; dy += 1) {
    for (let dx = -XP_PICKUP_RADIUS; dx <= XP_PICKUP_RADIUS; dx += 1) {
      const tx = px + dx;
      const ty = py + dy;
      if (tx < 1 || ty < 1 || tx >= GRID_W - 1 || ty >= GRID_H - 1) {
        continue;
      }
      const index = cellIndex(tx, ty);
      const amount = state.xpPickupMask[index];
      if (amount <= 0) {
        continue;
      }
      state.xpPickupMask[index] = 0;
      spawnExperienceParticles(tx, ty, amount);
    }
  }
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

function dropArtifactOnDamage() {
  if (!state.heldArtifact) return;
  const dx = state.drill.facingX;
  const dy = state.drill.facingY;
  const candidates = [
    { x: state.drill.x - dx, y: state.drill.y - dy },
    { x: state.drill.x - dy, y: state.drill.y - dx },
    { x: state.drill.x + dy, y: state.drill.y + dx },
    { x: state.drill.x, y: state.drill.y },
  ];
  for (const c of candidates) {
    if (c.x < 0 || c.x >= GRID_W || c.y < 0 || c.y >= GRID_H) continue;
    const ci = cellIndex(c.x, c.y);
    if (!state.tunnelMask[ci]) continue;
    if (c.x === state.drill.x && c.y === state.drill.y) continue;
    state.artifactMask[ci] = 1;
    state.heldArtifactDropX = c.x;
    state.heldArtifactDropY = c.y;
    state.heldArtifact = false;
    state.artifactBumpTime = 0;
    state.artifactBumpDir = null;
    showPerkToast("Артефакт потерян!");
    return;
  }
  // Fallback: drop on self
  const selfIdx = cellIndex(state.drill.x, state.drill.y);
  state.artifactMask[selfIdx] = 1;
  state.heldArtifactDropX = state.drill.x;
  state.heldArtifactDropY = state.drill.y;
  state.heldArtifact = false;
  state.artifactBumpTime = 0;
  state.artifactBumpDir = null;
  showPerkToast("Артефакт потерян!");
}

function dropKeyOnDamage() {
  if (state.heldKeyForSafe === -1) return;
  const dx = state.drill.facingX;
  const dy = state.drill.facingY;
  const candidates = [
    { x: state.drill.x - dx, y: state.drill.y - dy },
    { x: state.drill.x - dy, y: state.drill.y - dx },
    { x: state.drill.x + dy, y: state.drill.y + dx },
    { x: state.drill.x, y: state.drill.y },
  ];
  for (const c of candidates) {
    if (c.x < 0 || c.x >= GRID_W || c.y < 0 || c.y >= GRID_H) continue;
    const ci = cellIndex(c.x, c.y);
    if (!state.tunnelMask[ci]) continue;
    if (c.x === state.drill.x && c.y === state.drill.y) continue;
    state.keyMask[ci] = state.heldKeyForSafe + 1;
    state.heldKeyForSafe = -1;
    state.keyBumpTime = 0;
    state.keyBumpDir = null;
    showPerkToast("Ключ потерян!");
    return;
  }
  // fallback: drop on self
  const selfIdx = cellIndex(state.drill.x, state.drill.y);
  state.keyMask[selfIdx] = state.heldKeyForSafe + 1;
  state.heldKeyForSafe = -1;
  state.keyBumpTime = 0;
  state.keyBumpDir = null;
  showPerkToast("Ключ потерян!");
}

function openSafeDoor(safeIdx, doorX, doorY) {
  const safe = state.safes[safeIdx];
  if (!safe || safe.opened) return;
  safe.opened = true;
  state.heldKeyForSafe = -1;
  state.keyBumpTime = 0;
  state.keyBumpDir = null;
  // Open the door tile
  const doorIdx = cellIndex(doorX, doorY);
  state.safeDoorMask[doorIdx] = -(safeIdx + 1); // negative = opened
  state.hardness[doorIdx] = 0;
  state.health[doorIdx] = 0;
  state.tunnelMask[doorIdx] = 1;
  // Tunnel interior
  for (const c of safe.interiorCells) {
    state.tunnelMask[cellIndex(c.x, c.y)] = 1;
  }
  // Gold reward: 200-300 spread across interior
  const totalGold = 200 + Math.floor(Math.random() * 101);
  const cells = safe.interiorCells;
  const goldPerCell = Math.floor(totalGold / cells.length);
  let remainder = totalGold - goldPerCell * cells.length;
  for (const c of cells) {
    const ci = cellIndex(c.x, c.y);
    state.droppedGoldMask[ci] += goldPerCell + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder--;
  }
  // 50/50: artifact or 3 random perks (+damage=3, +speed=5)
  if (Math.random() < 0.5) {
    // Artifact in center
    const center = cells[Math.floor(cells.length / 2)];
    state.artifactMask[cellIndex(center.x, center.y)] = 1;
    showPerkToast("Сейф открыт! Артефакт внутри!");
  } else {
    // 3 random perks: damage(3) or speed(5)
    const perkPool = [3, 5]; // Бур, Скорость
    const shuffled = cells.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    for (let p = 0; p < 3 && p < shuffled.length; p++) {
      const perkType = perkPool[Math.floor(Math.random() * perkPool.length)];
      state.perkMask[cellIndex(shuffled[p].x, shuffled[p].y)] = perkType;
    }
    showPerkToast("Сейф открыт! Перки внутри!");
  }
}

function scatterGoldAroundTile(sourceX, sourceY, dropAmount) {
  if (dropAmount <= 0) return false;
  // Collect valid drop candidates: regular block or empty ground, no metal
  const candidates = [];
  for (let dy = -1; dy <= 1; dy += 1) {
    for (let dx = -1; dx <= 1; dx += 1) {
      if (dx === 0 && dy === 0) continue;
      const nx = sourceX + dx;
      const ny = sourceY + dy;
      if (nx < 1 || nx >= GRID_W - 1 || ny < 1 || ny >= GRID_H - 1) continue;
      const idx = cellIndex(nx, ny);
      if (state.metalMask[idx]) continue;
      if (state.beaconMask[idx]) continue;
      candidates.push({ idx, x: nx, y: ny });
    }
  }

  if (candidates.length === 0) return false;

  // Pick 3–5 random targets
  const targetCount = Math.min(candidates.length, 3 + Math.floor(Math.random() * 3));
  // Shuffle candidates and take first targetCount
  for (let i = candidates.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }
  const targets = candidates.slice(0, targetCount);

  const perTarget = Math.floor(dropAmount / targetCount);
  let remainder = dropAmount - perTarget * targetCount;

  for (let i = 0; i < targets.length; i += 1) {
    const { idx, x: tx, y: ty } = targets[i];
    const tileValue = perTarget + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder -= 1;
    if (tileValue <= 0) continue;
    state.droppedGoldMask[idx] += tileValue;

    // Visual: particles fly from source tile to each target tile
    const particleCount = Math.max(1, Math.floor(tileValue / 5));
    for (let p = 0; p < particleCount; p += 1) {
      state.goldParticles.push({
        tileX: sourceX + 0.5,
        tileY: sourceY + 0.5,
        destTileX: tx,
        destTileY: ty,
        value: 0,
        isLast: false,
        skipCredit: true,
        delay: p * 0.04 + i * 0.03,
        elapsed: 0,
        duration: 0.3,
        seed: Math.floor(Math.random() * 1000),
      });
    }
  }

  return true;
}

function dropUnsafeGold() {
  if (state.unsafeGold <= 0) return;
  const total = Math.floor(state.unsafeGold);
  state.unsafeGold = 0;
  const dropAmount = Math.ceil(total / 2); // half disappears, half drops
  scatterGoldAroundTile(state.drill.x, state.drill.y, dropAmount);
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
  dropUnsafeGold();
  dropArtifactOnDamage();
  dropKeyOnDamage();
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
    prevX: x,
    prevY: y,
    animTimer: 0,
    rotation: 0,
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
    if (boulder.animTimer > 0) {
      boulder.animTimer = Math.max(0, boulder.animTimer - dt);
    }

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

    boulder.prevX = boulder.x;
    boulder.prevY = boulder.y;
    boulder.x = nextX;
    boulder.y = nextY;
    boulder.animTimer = BOULDER_MOVE_INTERVAL;
    boulder.rotation += (boulder.dirX !== 0 ? boulder.dirX : boulder.dirY) * (TILE_SIZE / 11);
    state.tunnelMask[nextIndex] = 1;
    state.hardness[nextIndex] = 0;
    state.health[nextIndex] = 0;
    if (boulder.x === state.drill.x && boulder.y === state.drill.y) {
      applyHazardDamage(BOULDER_DAMAGE);
    }
  }
}

function buildWormPath(nestX, nestY, playerX, playerY, radius) {
  const dx = playerX - nestX;
  const dy = playerY - nestY;
  // If player is on the nest, pick a default direction (down)
  const len = Math.hypot(dx, dy);
  const dirX = len > 0 ? dx / len : 0;
  const dirY = len > 0 ? dy / len : 1;
  // Extend the line to the edge of the radius (and a bit beyond)
  const endX = nestX + dirX * (radius + 5);
  const endY = nestY + dirY * (radius + 5);
  const path = [];
  let x0 = nestX, y0 = nestY;
  const x1 = Math.round(endX), y1 = Math.round(endY);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  const lineDx = x1 - nestX;
  const lineDy = y1 - nestY;
  while (true) {
    if (x0 >= 0 && x0 < GRID_W && y0 >= 0 && y0 < GRID_H) {
      path.push({ x: x0, y: y0 });
    }
    if (x0 === x1 && y0 === y1) break;
    if (path.length > radius * 3) break; // safety
    if (x0 !== x1 && y0 !== y1) {
      const stepXError = Math.abs((x0 + sx - nestX) * lineDy - (y0 - nestY) * lineDx);
      const stepYError = Math.abs((x0 - nestX) * lineDy - (y0 + sy - nestY) * lineDx);
      if (stepXError <= stepYError) {
        x0 += sx;
      } else {
        y0 += sy;
      }
    } else if (x0 !== x1) {
      x0 += sx;
    } else if (y0 !== y1) {
      y0 += sy;
    }
  }
  return path;
}

function updateWorms(dt) {
  if (state.dead) return;
  const drillX = state.drill.x;
  const drillY = state.drill.y;

  // Phase A: nest activation and spawning
  for (const nest of state.wormNests) {
    if (nest.destroyed) continue;
    const dist = Math.max(Math.abs(nest.x - drillX), Math.abs(nest.y - drillY));
    if (dist <= WORM_ACTIVATION_RADIUS) {
      nest.active = true;
      nest.cooldown -= dt;
      if (nest.cooldown <= 0) {
        nest.cooldown = WORM_ATTACK_INTERVAL;
        // Build path: straight line from nest through player to edge of activation radius
        const path = buildWormPath(nest.x, nest.y, drillX, drillY, WORM_ACTIVATION_RADIUS);
        if (path.length < 2) continue;
        state.activeWorms.push({
          path,
          pathIdx: 0,
          tileX: path[0].x,
          tileY: path[0].y,
          renderX: path[0].x,
          renderY: path[0].y,
          moveTimer: 0,
          alive: true,
          damagedCells: new Set(),
          hitPlayer: false,
          trail: [],
        });
      }
    } else {
      nest.active = false;
      nest.cooldown = 0;
    }
  }

  // Phase B: update active worms — follow precomputed path
  const wormMoveInterval = 1 / WORM_SPEED; // seconds per tile
  for (let i = state.activeWorms.length - 1; i >= 0; i--) {
    const worm = state.activeWorms[i];
    worm.moveTimer += dt;

    // Smooth render position interpolation between current and next path tile
    const progress = Math.min(worm.moveTimer / wormMoveInterval, 1);
    const cur = worm.path[worm.pathIdx];
    const prev = worm.pathIdx > 0 ? worm.path[worm.pathIdx - 1] : cur;
    worm.renderX = prev.x + (cur.x - prev.x) * progress;
    worm.renderY = prev.y + (cur.y - prev.y) * progress;

    if (worm.moveTimer >= wormMoveInterval) {
      worm.moveTimer -= wormMoveInterval;

      // Record trail
      worm.trail.push({ tileX: worm.tileX, tileY: worm.tileY });
      if (worm.trail.length > WORM_BODY_LENGTH) worm.trail.shift();

      // Advance along path
      worm.pathIdx += 1;
      if (worm.pathIdx >= worm.path.length) {
        state.activeWorms.splice(i, 1);
        continue;
      }

      const next = worm.path[worm.pathIdx];
      worm.tileX = next.x;
      worm.tileY = next.y;

      const idx = cellIndex(worm.tileX, worm.tileY);

      // Block damage: 50% of max HP
      if (!worm.damagedCells.has(idx)) {
        worm.damagedCells.add(idx);
        const h = state.hardness[idx];
        if (h > 0 && !state.tunnelMask[idx]) {
          const maxHp = BLOCK_TYPES[h].hp;
          state.health[idx] = Math.max(0, state.health[idx] - maxHp * WORM_BLOCK_DAMAGE_RATIO);
        }
        if (!state.tunnelMask[idx]) {
          state.effects.push({
            kind: "wormDust",
            x: worm.tileX,
            y: worm.tileY,
            time: WORM_DUST_DURATION,
            duration: WORM_DUST_DURATION,
          });
        }
      }

      // Player collision
      if (!worm.hitPlayer && worm.tileX === drillX && worm.tileY === drillY) {
        worm.hitPlayer = true;
        applyHazardDamage(WORM_DAMAGE);
      }
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
  // Locked safe door — cannot be drilled, need key
  if (state.safeDoorMask[index] > 0) {
    if (options.byDrill) {
      spawnImpactEffect(x, y, options.dirX ?? state.drill.facingX ?? 0, options.dirY ?? state.drill.facingY ?? 1, 8);
    }
    return false;
  }
  if (state.beaconMask[index]) {
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

  // Запомнить угол первого удара для ротации трещин
  if (state.health[index] >= BLOCK_TYPES[state.hardness[index]].hp) {
    const dirX = options.dirX ?? state.drill.facingX ?? 0;
    const dirY = options.dirY ?? state.drill.facingY ?? 1;
    state.crackAngle[index] = Math.atan2(dirY, dirX);
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
  const goldMultiplier = state.loopGoldMask[index] > 0 ? state.loopGoldMask[index] : 1;
  const goldGain =
    hazardType === HAZARD_TYPES.SPIKE && options.cause === "explosion"
      ? applyMiningGoldBonus(1)
      : state.goldOreMask[index]
        ? applyMiningGoldBonus(Math.floor(GOLD_ORE_PER_BLOCK * goldMultiplier))
        : 0;
  spawnBreakEffect(x, y, hardness, options.cause || "break");
  if (state.goldOreMask[index]) {
    spawnGoldParticles(x, y, goldGain);
  }
  const embeddedGold = Math.floor(state.droppedGoldMask[index]);
  if (embeddedGold > 0) {
    state.droppedGoldMask[index] = 0;
    spawnGoldParticles(x, y, embeddedGold);
  }
  state.hardness[index] = 0;
  state.health[index] = 0;
  state.blocksBroken += 1;
  if (options.byDrill) {
    state.drillBrokenBlocks += 1;
  }
  if (hazardType === HAZARD_TYPES.SPIKE && state.spikeOverdriveLevel > 0) {
    const durations = [0, 6, 9, 12];
    activateDrillOverdrive(durations[state.spikeOverdriveLevel] || 6, "Шиповой форсаж");
  }
  state.hazardMask[index] = 0;
  state.hazardTriggeredMask[index] = 0;
  state.loopGoldMask[index] = 0;
  state.goldOreMask[index] = 0;
  if (hazardType === HAZARD_TYPES.SPIKE && options.cause === "explosion") {
    triggerSpikeChain(x, y);
  }
  if (state.remoteBombInterval > 0 && options.byDrill && state.drillBrokenBlocks % state.remoteBombInterval === 0) {
    triggerRemoteBombSquare(x, y, 1);
  }

  carveTunnel(x, y);
  spawnExperienceCrystal(x, y);

  // Check if a worm nest was destroyed
  for (const nest of state.wormNests) {
    if (!nest.destroyed && nest.x === x && nest.y === y) {
      nest.destroyed = true;
      nest.active = false;
      const reward = 150 + Math.floor(Math.random() * 101);
      // Flashy gold ore effect (burst + floating value text)
      spawnGoldOreEffect(x, y, reward);
      const scattered = scatterGoldAroundTile(x, y, reward);
      if (!scattered) {
        spawnGoldParticles(x, y, reward);
        state.unsafeGold += reward;
      }
      showPerkToast(scattered ? `Гнездо уничтожено! ${reward} золота рассыпалось` : `Гнездо уничтожено! +${reward} золота`);
      break;
    }
  }

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
    state.drill.moveResumeTimer = Math.max(state.drill.moveResumeTimer, POST_BREAK_MOVE_DELAY);
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
  state.visibilityDirty = true;
  consumeSignalMove(fromX, fromY, toX, toY);
  extendPath(toX, toY);
  const moveIndex = cellIndex(toX, toY);
  const droppedPickup = Math.floor(state.droppedGoldMask[moveIndex]);
  if (droppedPickup > 0 && state.tunnelMask[moveIndex]) {
    state.droppedGoldMask[moveIndex] = 0;
    spawnGoldParticles(toX, toY, droppedPickup);
  }
  // Pick up perks/crystals on already-tunneled tiles (e.g. inside opened safe)
  const perkOnTile = state.perkMask[moveIndex];
  if (perkOnTile > 0 && state.tunnelMask[moveIndex]) {
    collectPerkTile(toX, toY, moveIndex, perkOnTile);
  }
  const crystalOnTile = state.crystalMask[moveIndex];
  if (crystalOnTile > 0 && state.tunnelMask[moveIndex]) {
    collectCrystalTile(toX, toY, moveIndex, crystalOnTile);
  }
  // Pick up artifact by walking over it
  if (!state.heldArtifact && state.artifactMask[moveIndex] > 0) {
    state.artifactMask[moveIndex] = 0;
    state.heldArtifact = true;
    state.heldArtifactDropX = -1;
    state.heldArtifactDropY = -1;
    state.artifactBumpTime = 0;
    state.artifactBumpDir = null;
    showPerkToast("Артефакт подобран! Неси к маяку");
    triggerPickupRadar("artifact", toX, toY);
  }
  // Pick up key by walking over it
  if (state.heldKeyForSafe === -1 && !state.heldArtifact && state.keyMask[moveIndex] > 0) {
    const safeIdx = state.keyMask[moveIndex] - 1;
    state.keyMask[moveIndex] = 0;
    state.heldKeyForSafe = safeIdx;
    state.keyBumpTime = 0;
    state.keyBumpDir = null;
    showPerkToast("Ключ подобран! Неси к замку");
    triggerPickupRadar("key", toX, toY);
  }
  state.signalPrevX = toX;
  state.signalPrevY = toY;
  applyGasContactDamage();
  applySteamContactDamage();
}


function moveDrillFreely(dx, dy, dt) {
  const currentCellX = state.drill.x;
  const currentCellY = state.drill.y;
  let nextX = state.drill.renderX;
  let nextY = state.drill.renderY;
  let maxDistance = MOVE_SPEED_TILES * dt;

  if (dx > 0) {
    nextY = currentCellY;
    const rightCell = currentCellX + 1 < GRID_W ? cellIndex(currentCellX + 1, currentCellY) : -1;
    const maxX = rightCell !== -1 && state.tunnelMask[rightCell] ? state.drill.renderX + maxDistance : Math.min(currentCellX + 0.5, state.drill.renderX + maxDistance);
    nextX = maxX;
  } else if (dx < 0) {
    nextY = currentCellY;
    const leftCell = currentCellX - 1 >= 0 ? cellIndex(currentCellX - 1, currentCellY) : -1;
    const minX = leftCell !== -1 && state.tunnelMask[leftCell] ? state.drill.renderX - maxDistance : Math.max(currentCellX - 0.5, state.drill.renderX - maxDistance);
    nextX = minX;
  } else if (dy > 0) {
    nextX = currentCellX;
    const downCell = currentCellY + 1 < GRID_H ? cellIndex(currentCellX, currentCellY + 1) : -1;
    const maxY = downCell !== -1 && state.tunnelMask[downCell] ? state.drill.renderY + maxDistance : Math.min(currentCellY + 0.5, state.drill.renderY + maxDistance);
    nextY = maxY;
  } else if (dy < 0) {
    nextX = currentCellX;
    const upCell = currentCellY - 1 >= 0 ? cellIndex(currentCellX, currentCellY - 1) : -1;
    const minY = upCell !== -1 && state.tunnelMask[upCell] ? state.drill.renderY - maxDistance : Math.max(currentCellY - 0.5, state.drill.renderY - maxDistance);
    nextY = minY;
  }

  const movedDistance = Math.hypot(nextX - state.drill.renderX, nextY - state.drill.renderY);
  if (movedDistance <= 0) {
    return;
  }

  state.drill.renderX = nextX;
  state.drill.renderY = nextY;

  const nextCellX = clamp(Math.round(state.drill.renderX), 1, GRID_W - 2);
  const nextCellY = clamp(Math.round(state.drill.renderY), 1, GRID_H - 2);
  if (nextCellX !== state.drill.x || nextCellY !== state.drill.y) {
    const fromX = state.drill.x;
    const fromY = state.drill.y;
    state.drill.x = nextCellX;
    state.drill.y = nextCellY;
    recordPlayerMove(fromX, fromY, nextCellX, nextCellY);
  }
}

function moveDrillRenderToward(targetX, targetY, dt, speed = MOVE_SPEED_TILES) {
  const dx = targetX - state.drill.renderX;
  const dy = targetY - state.drill.renderY;
  const distance = Math.hypot(dx, dy);
  if (distance <= 0.0001) {
    state.drill.renderX = targetX;
    state.drill.renderY = targetY;
    return;
  }
  const step = Math.min(distance, speed * dt);
  state.drill.renderX += (dx / distance) * step;
  state.drill.renderY += (dy / distance) * step;
}


function removePathTile(x, y) {
  const pathIndex = state.pathIndexByCell[cellIndex(x, y)];
  if (pathIndex === -1) {
    return;
  }

  state.pathTiles.splice(pathIndex, 1);
  rebuildPathIndex();
}

function getAutoCloseContourCandidate() {
  if (state.pathTiles.length < 4) {
    return null;
  }

  const current = state.pathTiles[state.pathTiles.length - 1];
  let bestVisibleCandidate = null;
  let bestAnyCandidate = null;
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

  for (let i = 0; i < candidates.length; i += 1) {
    const candidate = candidates[i];
    const stepX = Math.sign(candidate.targetX - current.x);
    const stepY = Math.sign(candidate.targetY - current.y);
    let x = current.x;
    let y = current.y;
    let blocked = false;
    let allVisible = true;
    let previewTo = null;

    while (x !== candidate.targetX || y !== candidate.targetY) {
      x += stepX;
      y += stepY;
      const index = cellIndex(x, y);
      const isTarget = x === candidate.targetX && y === candidate.targetY;
      if (isVisibleCell(x, y)) {
        previewTo = { x, y };
      } else {
        allVisible = false;
      }
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

    let enclosedCells = 0;
    for (let py = minY; py <= maxY; py += 1) {
      for (let px = minX; px <= maxX; px += 1) {
        if (isPointInPolygon(px + 0.5, py + 0.5, polygon)) {
          enclosedCells += 1;
        }
      }
    }
    if (enclosedCells <= 0) {
      continue;
    }

    const resolvedCandidate = {
      currentX: current.x,
      currentY: current.y,
      targetX: candidate.targetX,
      targetY: candidate.targetY,
      stepX,
      stepY,
      allVisible,
      previewTo,
      enclosedCells,
      distance: candidate.distance,
    };

    if (
      !bestAnyCandidate ||
      resolvedCandidate.enclosedCells > bestAnyCandidate.enclosedCells ||
      (resolvedCandidate.enclosedCells === bestAnyCandidate.enclosedCells && resolvedCandidate.distance < bestAnyCandidate.distance)
    ) {
      bestAnyCandidate = resolvedCandidate;
    }

    if (
      resolvedCandidate.allVisible &&
      (!bestVisibleCandidate ||
        resolvedCandidate.enclosedCells > bestVisibleCandidate.enclosedCells ||
        (resolvedCandidate.enclosedCells === bestVisibleCandidate.enclosedCells && resolvedCandidate.distance < bestVisibleCandidate.distance))
    ) {
      bestVisibleCandidate = resolvedCandidate;
    }
  }

  return bestVisibleCandidate || bestAnyCandidate;
}

function tryAutoCloseContour() {
  const candidate = getAutoCloseContourCandidate();
  if (!candidate || !candidate.allVisible) {
    return false;
  }

  const heroX = state.drill.x;
  const heroY = state.drill.y;
  let x = candidate.currentX;
  let y = candidate.currentY;
  while (x !== candidate.targetX || y !== candidate.targetY) {
    x += candidate.stepX;
    y += candidate.stepY;
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

  return true;
}

function updateCameraShake(dt) {
  state.cameraShake.time += dt * 24;
  state.cameraShake.amplitude = Math.max(0, state.cameraShake.amplitude - dt * 18);
}

function updateCamera(dt) {
  const zoom = getCameraZoom();
  const viewWidth = state.width / zoom;
  const viewHeight = state.height / zoom;
  const targetX = state.drill.renderX * TILE_SIZE + TILE_SIZE * 0.5 - viewWidth * 0.5;
  const targetY = state.drill.renderY * TILE_SIZE + TILE_SIZE * 0.5 - viewHeight * 0.56;
  const maxX = GRID_W * TILE_SIZE - viewWidth;
  const maxY = GRID_H * TILE_SIZE - viewHeight;
  const clampedTargetX = clamp(targetX, 0, Math.max(0, maxX));
  const clampedTargetY = clamp(targetY, 0, Math.max(0, maxY));
  const follow = 1 - Math.exp(-dt * 10);
  state.camera.x += (clampedTargetX - state.camera.x) * follow;
  state.camera.y += (clampedTargetY - state.camera.y) * follow;
}

function updateVisibilityFade(dt) {
  const step = Math.min(1, VISIBILITY_FADE_SPEED * dt);
  for (let i = 0; i < state.visibleAlpha.length; i += 1) {
    const target = state.visibleTargetAlpha[i];
    const current = state.visibleAlpha[i];
    state.visibleAlpha[i] = current + (target - current) * step;
  }
}

function updateDrill(dt) {
  state.drill.actionCooldown = Math.max(0, state.drill.actionCooldown - dt);
  state.drill.moveResumeTimer = Math.max(0, state.drill.moveResumeTimer - dt);

  if (state.stunTimer > 0) {
    state.drill.progress = 0;
    state.drill.strikeEnergy = Math.max(0, state.drill.strikeEnergy - dt * 6);
    state.drill.strikeLatch = false;
    return;
  }

  // Carrying artifact or key drains fuel passively
  if (state.heldArtifact || state.heldKeyForSafe >= 0) {
    state.fuel = Math.max(0, state.fuel - 4 * dt);
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
    if (state.autoClosePreviewReturnTimer > 0) {
      // Keep the last preview alive while it retracts.
    } else if (!state.autoClosePreviewFailed && state.idleTime >= IDLE_AUTO_CLOSE_PREVIEW_DELAY) {
      state.autoClosePreview = getAutoCloseContourCandidate();
    } else {
      state.autoClosePreview = null;
    }
    if (!state.idleAutoCloseTriggered && state.idleTime >= state.idleAutoCloseDelay) {
      state.idleAutoCloseTriggered = true;
      if (!tryAutoCloseContour()) {
        state.autoClosePreviewFailed = true;
        state.autoClosePreviewReturnTimer = IDLE_AUTO_CLOSE_PREVIEW_RETURN_DURATION;
        showPerkToast("Контур не найден");
      } else {
        state.autoClosePreview = null;
        state.autoClosePreviewReturnTimer = 0;
        state.autoClosePreviewFailed = false;
      }
    }
    state.drill.progress = 0;
    state.drill.strikeEnergy = Math.max(0, state.drill.strikeEnergy - dt * 5);
    state.drill.strikeLatch = false;
    state.drill.digDelayTimer = 0;
    state.drill.digDelayDx = 0;
    state.drill.digDelayDy = 0;
    return;
  }

  state.idleTime = 0;
  state.idleAutoCloseTriggered = false;
  state.autoClosePreview = null;
  state.autoClosePreviewReturnTimer = 0;
  state.autoClosePreviewFailed = false;

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

  if (state.tunnelMask[targetIndex]) {
    if (state.drill.moveResumeTimer > 0) {
      state.drill.strikePhase += dt * actionRate;
      state.drill.progress = 0;
      state.drill.strikeEnergy = Math.max(0.08, state.drill.strikeEnergy - dt * 4);
      return;
    }
    // Reset bump timers when moving freely
    state.artifactBumpTime = 0;
    state.artifactBumpDir = null;
    state.keyBumpTime = 0;
    state.keyBumpDir = null;
    moveDrillFreely(dx, dy, dt);
    state.drill.strikePhase += dt * actionRate;
    state.drill.progress = 0;
    state.drill.strikeEnergy = Math.max(0.08, state.drill.strikeEnergy - dt * 4);
    state.drill.digDelayTimer = 0;
    state.drill.digDelayDx = 0;
    state.drill.digDelayDy = 0;
    return;
  }

  // While carrying artifact: cannot drill, but can drop by bumping into wall for 1s
  if (state.heldArtifact) {
    const bumpKey = `${dx},${dy}`;
    if (state.artifactBumpDir === bumpKey) {
      state.artifactBumpTime += dt;
    } else {
      state.artifactBumpDir = bumpKey;
      state.artifactBumpTime = dt;
    }
    if (state.artifactBumpTime >= 1.0) {
      // Drop artifact into a nearby empty tunnel cell (opposite to bump direction, then sides, then behind)
      const candidates = [
        { x: state.drill.x - dx, y: state.drill.y - dy }, // behind
        { x: state.drill.x - dy, y: state.drill.y - dx }, // side 1
        { x: state.drill.x + dy, y: state.drill.y + dx }, // side 2
        { x: state.drill.x, y: state.drill.y },           // fallback: self
      ];
      let dropped = false;
      for (const c of candidates) {
        if (c.x < 0 || c.x >= GRID_W || c.y < 0 || c.y >= GRID_H) continue;
        const ci = cellIndex(c.x, c.y);
        if (!state.tunnelMask[ci]) continue;
        if (c.x === state.drill.x && c.y === state.drill.y) continue;
        state.artifactMask[ci] = 1;
        state.heldArtifactDropX = c.x;
        state.heldArtifactDropY = c.y;
        dropped = true;
        break;
      }
      if (!dropped) {
        // No empty neighbor — drop on self as last resort
        const selfIdx = cellIndex(state.drill.x, state.drill.y);
        state.artifactMask[selfIdx] = 1;
        state.heldArtifactDropX = state.drill.x;
        state.heldArtifactDropY = state.drill.y;
      }
      state.heldArtifact = false;
      state.artifactBumpTime = 0;
      state.artifactBumpDir = null;
      showPerkToast("Артефакт выброшен");
    }
    // Animate bumping but don't drill
    state.drill.strikePhase += dt * actionRate * 0.3;
    state.drill.strikeEnergy = Math.max(0, state.drill.strikeEnergy - dt * 3);
    moveDrillRenderToward(state.drill.x, state.drill.y, dt);
    return;
  }

  // While carrying key: cannot drill, drop by bumping wall for 1s (same as artifact)
  if (state.heldKeyForSafe >= 0) {
    // Check if bumping into this safe's door — open it!
    const doorVal = state.safeDoorMask[targetIndex];
    if (doorVal > 0 && doorVal - 1 === state.heldKeyForSafe) {
      openSafeDoor(state.heldKeyForSafe, targetX, targetY);
      moveDrillRenderToward(state.drill.x, state.drill.y, dt);
      return;
    }
    const bumpKey = `${dx},${dy}`;
    if (state.keyBumpDir === bumpKey) {
      state.keyBumpTime += dt;
    } else {
      state.keyBumpDir = bumpKey;
      state.keyBumpTime = dt;
    }
    if (state.keyBumpTime >= 1.0) {
      const candidates = [
        { x: state.drill.x - dx, y: state.drill.y - dy },
        { x: state.drill.x - dy, y: state.drill.y - dx },
        { x: state.drill.x + dy, y: state.drill.y + dx },
        { x: state.drill.x, y: state.drill.y },
      ];
      let dropped = false;
      for (const c of candidates) {
        if (c.x < 0 || c.x >= GRID_W || c.y < 0 || c.y >= GRID_H) continue;
        const ci = cellIndex(c.x, c.y);
        if (!state.tunnelMask[ci]) continue;
        if (c.x === state.drill.x && c.y === state.drill.y) continue;
        state.keyMask[ci] = state.heldKeyForSafe + 1;
        dropped = true;
        break;
      }
      if (!dropped) {
        const selfIdx = cellIndex(state.drill.x, state.drill.y);
        state.keyMask[selfIdx] = state.heldKeyForSafe + 1;
      }
      state.heldKeyForSafe = -1;
      state.keyBumpTime = 0;
      state.keyBumpDir = null;
      showPerkToast("Ключ выброшен");
    }
    state.drill.strikePhase += dt * actionRate * 0.3;
    state.drill.strikeEnergy = Math.max(0, state.drill.strikeEnergy - dt * 3);
    moveDrillRenderToward(state.drill.x, state.drill.y, dt);
    return;
  }

  // Delay before starting to dig: reset timer if direction changed.
  // Must run before actionCooldown check so approaching a new block
  // while cooldown is still active doesn't play the drill animation.
  if (state.drill.digDelayDx !== dx || state.drill.digDelayDy !== dy) {
    state.drill.digDelayTimer = 0.18;
    state.drill.digDelayDx = dx;
    state.drill.digDelayDy = dy;
  }
  if (state.drill.digDelayTimer > 0) {
    state.drill.digDelayTimer = Math.max(0, state.drill.digDelayTimer - dt);
    state.drill.strikePhase += dt * actionRate * 0.15;
    state.drill.strikeEnergy = Math.max(0, state.drill.strikeEnergy - dt * 5);
    moveDrillRenderToward(state.drill.x, state.drill.y, dt);
    return;
  }

  if (state.drill.actionCooldown > 0) {
    state.drill.strikePhase += dt * actionRate;
    state.drill.strikeEnergy = Math.min(1, state.drill.strikeEnergy + dt * 9);
    if (state.overhealDrillTimer <= 0) {
      state.fuel = Math.max(0, state.fuel - DRILL_FUEL_DRAIN * dt);
    }
    moveDrillRenderToward(state.drill.x, state.drill.y, dt);
    return;
  }

  state.drill.strikePhase += dt * actionRate;
  state.drill.strikeEnergy = Math.min(1, state.drill.strikeEnergy + dt * 9);
  const strikeWave = Math.max(0, Math.sin(state.drill.strikePhase));

  moveDrillRenderToward(state.drill.x, state.drill.y, dt);

  state.drill.strikePhase = Math.PI * 0.5;
  state.drill.actionCooldown = actionInterval;
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
    return false;
  }

  refreshSignalDirection(toX, toY);
  return true;
}

function updateDiscovery() {
  if (!state.baseFound && state.tunnelMask[cellIndex(state.base.x, state.base.y)]) {
    state.baseFound = true;
  }
}

function tryBeaconContourDeposit(x, y) {
  if (state.unsafeGold <= 0) return;
  for (const beacon of state.beacons) {
    if (beacon.active) continue;
    if (x < beacon.x - 1 || x > beacon.x + 2 || y < beacon.y - 1 || y > beacon.y + 2) continue;
    // Count tiles in beacon 4×4 area not yet covered by contour.
    // The current tile was just added to the path, so add 1 back to get
    // "uncovered before this step" — that is I in the formula N/I.
    let uncoveredAfter = 0;
    for (let ty = beacon.y - 1; ty <= beacon.y + 2; ty++) {
      for (let tx = beacon.x - 1; tx <= beacon.x + 2; tx++) {
        if (state.pathIndexByCell[cellIndex(tx, ty)] === -1) uncoveredAfter++;
      }
    }
    const i = uncoveredAfter + 1; // tiles remaining including current step
    const chunk = Math.max(1, Math.floor(state.unsafeGold / i));
    state.unsafeGold = Math.max(0, state.unsafeGold - chunk);
    state.gold += chunk;
    // Visual: particles fly from hero to beacon, one per 5 gold
    const particleCount = Math.max(1, Math.floor(chunk / 5));
    for (let i = 0; i < particleCount; i += 1) {
      state.goldParticles.push({
        tileX: 0,
        tileY: 0,
        destTileX: beacon.x + 0.5,
        destTileY: beacon.y + 0.5,
        value: 0,
        isLast: false,
        skipCredit: true,
        delay: i * 0.06,
        elapsed: 0,
        duration: 0.4,
        seed: Math.floor(Math.random() * 1000),
      });
    }
    break;
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
  tryBeaconContourDeposit(x, y);
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
      state.loopGoldMask[index] = 0.5;
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

  for (const beacon of state.beacons) {
    let allInside = true;
    for (let dy = 0; dy < 2 && allInside; dy += 1) {
      for (let dx = 0; dx < 2 && allInside; dx += 1) {
        if (!isPointInPolygon(beacon.x + dx + 0.5, beacon.y + dy + 0.5, polygon)) {
          allInside = false;
        }
      }
    }
    if (!allInside) continue;
    // All contour cells must be within the beacon's 4x4 area (the 2x2 beacon + 1-tile ring)
    const pathWithinBeaconArea = loopPath.every(
      (cell) =>
        cell.x >= beacon.x - 1 &&
        cell.x <= beacon.x + 2 &&
        cell.y >= beacon.y - 1 &&
        cell.y <= beacon.y + 2,
    );
    if (beacon.active) continue;
    if (pathWithinBeaconArea) {
      beacon.active = true;
      beacon.activationAnimStart = state.lastTs || performance.now();
      // Deposit any remaining unsafe gold (most was deposited progressively)
      if (state.unsafeGold > 0) {
        state.gold += Math.floor(state.unsafeGold);
        state.unsafeGold = 0;
      }
      // Build pending action, defer shop/artifact opening for animation
      let pendingAction;
      if (state.heldArtifact) {
        const locked = getLockedTrees();
        if (locked.length >= 2) {
          const shuffled = locked.slice();
          for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
          }
          state.heldArtifact = false;
          pendingAction = { type: "artifactChoice", trees: [shuffled[0], shuffled[1]], beacon };
        } else if (locked.length === 1) {
          state.heldArtifact = false;
          const lastId = locked[0].id;
          const tree = unlockTreeById(lastId);
          if (tree) showPerkToast(`Открыт инструмент: ${tree.icon} ${tree.name}`);
          pendingAction = { type: "shop", lastId };
        } else {
          state.heldArtifact = false;
          pendingAction = { type: "shop" };
        }
      } else {
        pendingAction = { type: "shop" };
      }
      showPerkToast("Маяк активирован!");
      addFuel(state.maxFuel - state.fuel, beacon.x, beacon.y);
      healPlayer(1, "Маяк");
      state.beaconActivationAnim = { beacon, startTs: beacon.activationAnimStart, pendingAction };
    }
  }

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
  state.loopGoldMask[index] = 0;
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

function getCameraZoom() {
  if (state.width <= 0 || state.height <= 0) {
    return 1;
  }

  const availableWidth = Math.max(240, state.width - 32);
  const availableHeight = Math.max(240, state.height - 170);
  const desiredDiameterTiles = state.visionRadius * 2 + 3;
  const fitZoom = Math.min(
    availableWidth / (desiredDiameterTiles * TILE_SIZE),
    availableHeight / (desiredDiameterTiles * TILE_SIZE),
  );

  return clamp(Math.min(1, fitZoom), 0.72, 1);
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
    } else if (effect.kind === "goldOre") {
      const t = progress;
      const easeOut = 1 - (1 - t) * (1 - t);

      // 1. Initial flash
      if (t < 0.32) {
        const ft = t / 0.32;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 4 + ft * 24);
        grad.addColorStop(0, `rgba(255, 245, 160, ${0.85 * (1 - ft)})`);
        grad.addColorStop(1, "rgba(240, 180, 0, 0)");
        ctx.globalAlpha = 1;
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, 4 + ft * 24, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Expanding ring
      if (t < 0.62) {
        const rt = t / 0.62;
        ctx.globalAlpha = 0.9 * (1 - rt);
        ctx.strokeStyle = "#f0c030";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(cx, cy, 5 + rt * 28, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 3. Star burst lines
      if (t < 0.28) {
        const st = t / 0.28;
        ctx.globalAlpha = 1 - st;
        ctx.strokeStyle = "#ffe878";
        ctx.lineWidth = 1.8;
        ctx.lineCap = "round";
        for (let s = 0; s < 6; s += 1) {
          const angle = ((effect.seed * 41 + s * 105) % 628) / 100;
          const r1 = 6 + st * 3;
          const r2 = 12 + st * 13;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(angle) * r1, cy + Math.sin(angle) * r1);
          ctx.lineTo(cx + Math.cos(angle) * r2, cy + Math.sin(angle) * r2);
          ctx.stroke();
        }
      }

      // 4. Gold particles
      for (let p = 0; p < 10; p += 1) {
        const pseed = effect.seed + p * 97;
        const angle = ((pseed * 67) % 628) / 100;
        const speed = 20 + (pseed % 14);
        const px = cx + Math.cos(angle) * speed * easeOut;
        const py = cy + Math.sin(angle) * speed * easeOut + t * t * 16;
        const palpha = Math.max(0, 1 - t * 1.15);
        const size = 2.2 + (pseed % 3) * 0.6;
        ctx.globalAlpha = palpha;
        ctx.fillStyle = "#c8920a";
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffe060";
        ctx.beginPath();
        ctx.arc(px, py, size * 0.55, 0, Math.PI * 2);
        ctx.fill();
      }

      // 5. Floating value text — punchy pop scale
      const textAlpha = t < 0.08 ? t / 0.08 : Math.max(0, 1 - (t - 0.25) / 0.75);
      const scale = t < 0.12 ? 1.5 - (t / 0.12) * 0.5 : 1.0;
      const lift = easeOut * 28;
      ctx.globalAlpha = textAlpha;
      ctx.save();
      ctx.translate(cx, cy - 10 - lift);
      ctx.scale(scale, scale);
      ctx.font = `700 14px ${HUD_FONT}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = "rgba(16, 8, 2, 0.95)";
      ctx.fillStyle = "#f8e040";
      ctx.strokeText(`+${effect.value} ●`, 0, 0);
      ctx.fillText(`+${effect.value} ●`, 0, 0);
      ctx.restore();
      ctx.globalAlpha = 1;
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
    } else if (effect.kind === "wormDust") {
      const alpha = 1 - progress;
      // Dust cloud puff
      ctx.globalAlpha = alpha * 0.3;
      ctx.fillStyle = "#a08060";
      ctx.beginPath();
      ctx.arc(cx, cy, 6 + progress * 10, 0, Math.PI * 2);
      ctx.fill();
      // Particles
      for (let p = 0; p < 8; p++) {
        const seed = (effect.x * 4219 + effect.y * 7331 + p * 137) % 1000;
        const angle = (seed / 1000) * Math.PI * 2;
        const speed = 10 + (seed % 12);
        const px = cx + Math.cos(angle) * speed * progress;
        const py = cy + Math.sin(angle) * speed * progress - progress * 8;
        const size = 2 + (seed % 3);
        ctx.globalAlpha = alpha * 0.6;
        ctx.fillStyle = "#c8a070";
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  ctx.restore();
}

function renderDepositArrivals(camera) {
  const ctx = state.ctx;
  ctx.save();
  for (let i = 0; i < state.effects.length; i += 1) {
    const effect = state.effects[i];
    if (effect.kind !== "depositArrival") continue;
    const progress = 1 - effect.time / effect.duration;
    const cx = effect.x * TILE_SIZE + TILE_SIZE * 0.5 - camera.x;
    const cy = effect.y * TILE_SIZE + TILE_SIZE * 0.5 - camera.y;
    const alpha = 1 - progress;
    // Expanding ring
    ctx.globalAlpha = alpha * 0.8;
    ctx.strokeStyle = "#ffe060";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 4 + progress * 14, 0, Math.PI * 2);
    ctx.stroke();
    // Sparks
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "#ffd030";
    for (let s = 0; s < 5; s += 1) {
      const angle = (effect.seed + s * 72) * (Math.PI / 180);
      const dist = progress * 12;
      const sx = cx + Math.cos(angle) * dist;
      const sy = cy + Math.sin(angle) * dist;
      ctx.beginPath();
      ctx.arc(sx, sy, 1.8 * (1 - progress * 0.6), 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function renderGoldParticles(camera) {
  if (state.goldParticles.length === 0) return;
  const ctx = state.ctx;
  const heroX = state.drill.renderX * TILE_SIZE - camera.x + TILE_SIZE * 0.5;
  const heroY = state.drill.renderY * TILE_SIZE - camera.y + TILE_SIZE * 0.5;

  for (let i = 0; i < state.goldParticles.length; i += 1) {
    const p = state.goldParticles[i];
    const active = p.elapsed - p.delay;
    if (active <= 0) continue;

    const t = Math.min(1, active / p.duration);
    const easeIn = t * t * (3 - 2 * t); // smoothstep — slow start, fast end

    const tileScreenX = p.tileX * TILE_SIZE - camera.x;
    const tileScreenY = p.tileY * TILE_SIZE - camera.y;

    // If destTileX/Y set — fly from hero to destination tile, otherwise from tile to hero
    const startX = p.destTileX !== undefined ? heroX : tileScreenX;
    const startY = p.destTileX !== undefined ? heroY : tileScreenY;
    const endX = p.destTileX !== undefined ? p.destTileX * TILE_SIZE - camera.x + TILE_SIZE * 0.5 : heroX;
    const endY = p.destTileX !== undefined ? p.destTileY * TILE_SIZE - camera.y + TILE_SIZE * 0.5 : heroY;

    // Curved arc: bulge perpendicular to flight path
    const perpSign = ((p.seed % 3) - 1) || 1;
    const dx = endX - startX;
    const dy = endY - startY;
    const len = Math.hypot(dx, dy) || 1;
    const bulge = Math.sin(t * Math.PI) * Math.min(28, len * 0.35) * perpSign;

    const px = startX + dx * easeIn - (dy / len) * bulge;
    const py = startY + dy * easeIn + (dx / len) * bulge;

    const alpha = t > 0.85 ? (1 - t) / 0.15 : 1;
    const size = 3.5 - t * 1.5;

    ctx.globalAlpha = alpha;
    ctx.fillStyle = "#c8920a";
    ctx.beginPath();
    ctx.arc(px, py, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffe060";
    ctx.beginPath();
    ctx.arc(px, py, size * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function renderExperienceParticles(camera) {
  if (state.xpParticles.length === 0) return;
  const ctx = state.ctx;
  const heroX = state.drill.renderX * TILE_SIZE - camera.x + TILE_SIZE * 0.5;
  const heroY = state.drill.renderY * TILE_SIZE - camera.y + TILE_SIZE * 0.5;

  for (let i = 0; i < state.xpParticles.length; i += 1) {
    const particle = state.xpParticles[i];
    const active = particle.elapsed - particle.delay;
    if (active <= 0) continue;

    const t = Math.min(1, active / particle.duration);
    const easeIn = t * t * (3 - 2 * t);
    const startX = particle.tileX * TILE_SIZE - camera.x;
    const startY = particle.tileY * TILE_SIZE - camera.y;
    const dx = heroX - startX;
    const dy = heroY - startY;
    const len = Math.hypot(dx, dy) || 1;
    const bulge = Math.sin(t * Math.PI) * Math.min(16, len * 0.18) * ((((particle.seed % 3) - 1) || 1));
    const px = startX + dx * easeIn - (dy / len) * bulge;
    const py = startY + dy * easeIn + (dx / len) * bulge;
    const alpha = t > 0.82 ? (1 - t) / 0.18 : 1;
    const size = 2.6 - t * 0.9;

    ctx.globalAlpha = alpha;
    ctx.fillStyle = "#7ee3ff";
    ctx.beginPath();
    ctx.arc(px, py, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#dbfbff";
    ctx.beginPath();
    ctx.arc(px, py, size * 0.45, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function render() {
  const ctx = state.ctx;
  const camera = getCamera();
  const zoom = getCameraZoom();
  const viewWidth = state.width / zoom;
  const viewHeight = state.height / zoom;
  const startX = Math.max(0, Math.floor(camera.x / TILE_SIZE) - 1);
  const startY = Math.max(0, Math.floor(camera.y / TILE_SIZE) - 1);
  const endX = Math.min(GRID_W, Math.ceil((camera.x + viewWidth) / TILE_SIZE) + 1);
  const endY = Math.min(GRID_H, Math.ceil((camera.y + viewHeight) / TILE_SIZE) + 1);

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

  ctx.save();
  ctx.scale(zoom, zoom);

  for (let y = startY; y < endY; y += 1) {
    for (let x = startX; x < endX; x += 1) {
      const index = cellIndex(x, y);
      let sx = x * TILE_SIZE - camera.x;
      let sy = y * TILE_SIZE - camera.y;
      const visibleAlpha = clamp(state.visibleAlpha[index], 0, 1);
      const visible = visibleAlpha >= 0.999;
      const hiddenByAnim = isAnimatedTileDestination(x, y);

      if (hiddenByAnim) {
        continue;
      }

      // Worm tile shake
      if (state.activeWorms.length > 0 && !state.tunnelMask[index]) {
        for (const worm of state.activeWorms) {
          const d = Math.max(Math.abs(x - worm.renderX), Math.abs(y - worm.renderY));
          if (d < 1.5) {
            const intensity = (1 - d / 1.5) * 1.5;
            const t = state.lastTs * 40 + x * 17 + y * 31;
            sx += Math.sin(t) * intensity;
            sy += Math.cos(t * 1.3) * intensity;
            break;
          }
        }
      }

      if (visibleAlpha <= 0.001) {
        ctx.globalAlpha = 0.16;
        if (state.tunnelMask[index] || state.beaconMask[index] === 1) {
          drawTileSprite(state.sprites.tunnel, sx, sy);
        } else if (state.gasPocketMask[index]) {
          drawTileSprite(state.sprites.gasPocket, sx, sy);
        } else if (state.steamPocketMask[index]) {
          drawTileSprite(state.sprites.steamPocket, sx, sy);
        } else if (state.boulderPocketMask[index]) {
          drawTileSprite(state.sprites.boulderPocket, sx, sy);
        } else {
          drawTileSprite(state.sprites.blocks[state.hardness[index]]?.[(x * 7 + y * 13) % BLOCK_VARIANTS], sx, sy);
        }
        ctx.globalAlpha = 1;
        ctx.fillStyle = "rgba(6, 4, 3, 0.72)";
        ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);
        ctx.strokeStyle = "rgba(255, 225, 179, 0.04)";
        ctx.strokeRect(sx, sy, TILE_SIZE, TILE_SIZE);
        continue;
      }

      if (visibleAlpha < 0.999) {
        ctx.globalAlpha = (1 - visibleAlpha) * 0.16;
        if (state.tunnelMask[index] || state.beaconMask[index] === 1) {
          drawTileSprite(state.sprites.tunnel, sx, sy);
        } else if (state.gasPocketMask[index]) {
          drawTileSprite(state.sprites.gasPocket, sx, sy);
        } else if (state.steamPocketMask[index]) {
          drawTileSprite(state.sprites.steamPocket, sx, sy);
        } else if (state.boulderPocketMask[index]) {
          drawTileSprite(state.sprites.boulderPocket, sx, sy);
        } else {
          drawTileSprite(state.sprites.blocks[state.hardness[index]]?.[(x * 7 + y * 13) % BLOCK_VARIANTS], sx, sy);
        }
        ctx.globalAlpha = 1;
        ctx.fillStyle = `rgba(6, 4, 3, ${(1 - visibleAlpha) * 0.72})`;
        ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);
        ctx.strokeStyle = `rgba(255, 225, 179, ${(1 - visibleAlpha) * 0.04})`;
        ctx.strokeRect(sx, sy, TILE_SIZE, TILE_SIZE);
      }

      ctx.globalAlpha = visibleAlpha;
      if (state.tunnelMask[index]) {
        drawTileSprite(state.sprites.tunnel, sx, sy);
        if (state.xpPickupMask[index] > 0) {
          const pulse = Math.sin((state.lastTs || 0) * 0.006 + x * 0.8 + y * 1.2) * 0.5 + 0.5;
          const amount = state.xpPickupMask[index];
          ctx.save();
          ctx.globalAlpha = visibleAlpha * (0.72 + pulse * 0.24);
          ctx.fillStyle = "#78d8ff";
          ctx.beginPath();
          ctx.arc(sx + TILE_SIZE * 0.5, sy + TILE_SIZE * 0.5, 3.2 + pulse * 0.55, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#bff4ff";
          ctx.beginPath();
          ctx.moveTo(sx + TILE_SIZE * 0.5, sy + TILE_SIZE * 0.5 - 4.4);
          ctx.lineTo(sx + TILE_SIZE * 0.5 + 4.4, sy + TILE_SIZE * 0.5);
          ctx.lineTo(sx + TILE_SIZE * 0.5, sy + TILE_SIZE * 0.5 + 4.4);
          ctx.lineTo(sx + TILE_SIZE * 0.5 - 4.4, sy + TILE_SIZE * 0.5);
          ctx.closePath();
          ctx.fill();
          if (amount > 1) {
            ctx.fillStyle = "#133040";
            ctx.font = `700 7px ${HUD_FONT}`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(String(amount), sx + TILE_SIZE * 0.5, sy + TILE_SIZE * 0.5 + 0.5);
          }
          ctx.restore();
          ctx.globalAlpha = visibleAlpha;
        }
      } else if (state.beaconMask[index] === 1) {
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
        drawTileSprite(state.sprites.blocks[state.hardness[index]]?.[(x * 7 + y * 13) % BLOCK_VARIANTS], sx, sy);
        if (state.goldOreMask[index]) {
          drawTileSprite(state.sprites.goldOre, sx, sy);
        }
        if (state.droppedGoldMask[index] > 0) {
          const amount = state.droppedGoldMask[index];
          const pulse = Math.sin((state.lastTs || 0) * 0.004 + x * 1.7 + y * 1.3) * 0.5 + 0.5;
          const intensity = Math.min(1, amount / 30);
          const dotCount = 2 + Math.floor(intensity * 4);
          ctx.globalAlpha = visibleAlpha * (0.55 + pulse * 0.3);
          ctx.fillStyle = "#f0c040";
          for (let d = 0; d < dotCount; d += 1) {
            const seed = index * 7 + d * 13;
            const fx = sx + 4 + ((seed * 23) % (TILE_SIZE - 8));
            const fy = sy + 4 + ((seed * 17) % (TILE_SIZE - 8));
            const r = 1.2 + (seed % 3) * 0.6;
            ctx.beginPath();
            ctx.arc(fx, fy, r, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = visibleAlpha;
        }
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
          const angle = state.crackAngle[index] || 0;
          const cx = sx + TILE_SIZE * 0.5;
          const cy = sy + TILE_SIZE * 0.5;
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(angle);
          ctx.translate(-cx, -cy);
          drawTileSprite(state.sprites.cracks[crackStage][(x * 7 + y * 13) % CRACK_VARIANTS], sx, sy);
          ctx.restore();
          ctx.globalAlpha = 1;
        }
        ctx.fillStyle = "rgba(255, 231, 195, 0.2)";
        ctx.fillRect(sx + 6, sy + TILE_SIZE - 9, (TILE_SIZE - 12) * ratio, 4);
      }

      renderSafeDoorTile(x, y, sx, sy);
      renderPerkZoneTile(x, y, sx, sy);
      renderPerkTile(x, y, sx, sy);
      renderCrystalTile(x, y, sx, sy);
      if (state.tunnelMask[index] && state.droppedGoldMask[index] > 0) {
        const pulse = Math.sin((state.lastTs || 0) * 0.004 + x * 1.3 + y * 0.9) * 0.5 + 0.5;
        ctx.globalAlpha = visibleAlpha * (0.65 + pulse * 0.35);
        ctx.fillStyle = "#f0c040";
        ctx.beginPath();
        ctx.arc(sx + TILE_SIZE * 0.5, sy + TILE_SIZE * 0.5, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
    }
  }

  // Artifact, key & worm nest overlay pass — drawn after all tiles so waves aren't clipped
  for (let y = startY; y < endY; y += 1) {
    for (let x = startX; x < endX; x += 1) {
      const idx = cellIndex(x, y);
      const hasArtifact = state.artifactMask[idx] > 0;
      const hasKey = state.keyMask[idx] > 0;
      let isNest = false;
      for (const n of state.wormNests) {
        if (!n.destroyed && n.x === x && n.y === y) { isNest = true; break; }
      }
      if (!hasArtifact && !hasKey && !isNest) continue;
      const alpha = state.visibleAlpha[idx];
      if (alpha < 0.01) continue;
      const sx = x * TILE_SIZE - camera.x;
      const sy = y * TILE_SIZE - camera.y;
      if (alpha < 0.999) ctx.globalAlpha = alpha;
      if (hasArtifact) renderArtifactTile(x, y, sx, sy);
      if (hasKey) renderKeyTile(x, y, sx, sy);
      if (isNest) renderWormNestTile(x, y, sx, sy);
      if (alpha < 0.999) ctx.globalAlpha = 1;
    }
  }

  renderPath(camera);
  renderMovingTiles(camera);
  renderSteamJets(camera);
  renderEffects(camera);
  renderBeacon(camera);
  renderGoldParticles(camera);
  renderExperienceParticles(camera);
  renderDepositArrivals(camera);
  renderBase(camera);
  renderBoulders(camera);
  renderWorms(camera);
  renderDrill(camera);
  renderBaseProximityDot(camera);
  renderFuelToast(camera);
  renderHpToast(camera);
  renderGoldToast(camera);
  renderPerkToast(camera);
  renderSignalStatus(camera);
  renderBeaconRadar(camera);
  renderPickupRadar(camera);
  renderOverdriveStatus(camera);
  renderStunStatus(camera);
  renderHeatWarningStatus(camera);
  renderLoopChargeStatus(camera);
  renderVisionMask(camera);
  ctx.restore();
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

    // Interpolate position
    const animT = boulder.animTimer > 0 ? 1 - boulder.animTimer / BOULDER_MOVE_INTERVAL : 1;
    const eased = easeOutCubic(animT);
    const rx = (boulder.prevX + (boulder.x - boulder.prevX) * eased) * TILE_SIZE - camera.x + TILE_SIZE * 0.5;
    const ry = (boulder.prevY + (boulder.y - boulder.prevY) * eased) * TILE_SIZE - camera.y + TILE_SIZE * 0.54;

    // Squash on landing: near end of anim briefly compress vertically
    const isAnimating = boulder.animTimer > 0;
    const squashT = isAnimating && animT > 0.75 ? (1 - animT) / 0.25 : 1;
    const scaleX = 1 + (1 - squashT) * 0.18;
    const scaleY = 1 - (1 - squashT) * 0.14;

    ctx.save();
    ctx.translate(rx, ry);
    ctx.rotate(boulder.rotation);
    ctx.scale(scaleX, scaleY);

    const gradient = ctx.createRadialGradient(-3, -4, 2, 0, 0, 12);
    gradient.addColorStop(0, "#bcab97");
    gradient.addColorStop(1, "#7d6857");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255, 240, 220, 0.16)";
    ctx.beginPath();
    ctx.arc(-2, -5, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
  ctx.restore();
}

function isAnimatedTileDestination(x, y) {
  return state.tileAnimDest.has(y * GRID_W + x);
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
    drawTileSprite(state.sprites.blocks[content.hardness]?.[(Math.round(sx) * 7 + Math.round(sy) * 13) % BLOCK_VARIANTS], sx, sy);
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
  const liveTail =
    state.pathTiles.length > 0
      ? {
          x: state.drill.renderX * TILE_SIZE + TILE_SIZE * 0.5 - camera.x,
          y: state.drill.renderY * TILE_SIZE + TILE_SIZE * 0.5 - camera.y,
        }
      : null;
  let renderPathLength = state.pathTiles.length;
  if (state.pathTiles.length >= 2) {
    const lastTile = state.pathTiles[state.pathTiles.length - 1];
    const prevTile = state.pathTiles[state.pathTiles.length - 2];
    const backDx = Math.sign(prevTile.x - lastTile.x);
    const backDy = Math.sign(prevTile.y - lastTile.y);
    const movingBack =
      state.drill.x === lastTile.x &&
      state.drill.y === lastTile.y &&
      state.drill.facingX === backDx &&
      state.drill.facingY === backDy &&
      ((backDx !== 0 && Math.abs(state.drill.renderX - lastTile.x) > 0.001) ||
        (backDy !== 0 && Math.abs(state.drill.renderY - lastTile.y) > 0.001));
    if (movingBack) {
      renderPathLength -= 1;
    }
  }
  ctx.lineWidth = 8;
  ctx.lineCap = "round";
  ctx.strokeStyle = "rgba(108, 62, 31, 0.65)";
  ctx.beginPath();
  for (let i = 0; i < renderPathLength; i += 1) {
    const tile = state.pathTiles[i];
    const px = tile.x * TILE_SIZE + TILE_SIZE * 0.5 - camera.x;
    const py = tile.y * TILE_SIZE + TILE_SIZE * 0.5 - camera.y;
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  if (liveTail) {
    ctx.lineTo(liveTail.x, liveTail.y);
  }
  ctx.stroke();

  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(219, 171, 99, 0.52)";
  ctx.stroke();

  ctx.fillStyle = "rgba(247, 220, 172, 0.45)";
  for (let i = 0; i < renderPathLength; i += 3) {
    const tile = state.pathTiles[i];
    ctx.beginPath();
    ctx.arc(tile.x * TILE_SIZE + TILE_SIZE * 0.5 - camera.x, tile.y * TILE_SIZE + TILE_SIZE * 0.5 - camera.y, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
  if (liveTail && renderPathLength > 0) {
    ctx.beginPath();
    ctx.arc(liveTail.x, liveTail.y, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }

  renderAutoClosePreview(camera);
}

function renderAutoClosePreview(camera) {
  const preview = state.autoClosePreview;
  if (!preview?.previewTo) {
    return;
  }

  let reveal = 0;
  if (state.autoClosePreviewReturnTimer > 0) {
    reveal = clamp(state.autoClosePreviewReturnTimer / IDLE_AUTO_CLOSE_PREVIEW_RETURN_DURATION, 0, 1);
  } else {
    if (state.idleTime < IDLE_AUTO_CLOSE_PREVIEW_DELAY) {
      return;
    }
    const duration = Math.max(0.01, state.idleAutoCloseDelay - IDLE_AUTO_CLOSE_PREVIEW_DELAY);
    reveal = clamp((state.idleTime - IDLE_AUTO_CLOSE_PREVIEW_DELAY) / duration, 0, 1);
  }
  if (reveal <= 0) {
    return;
  }

  const ctx = state.ctx;
  const fromX = preview.currentX * TILE_SIZE + TILE_SIZE * 0.5 - camera.x;
  const fromY = preview.currentY * TILE_SIZE + TILE_SIZE * 0.5 - camera.y;
  const fullToX = preview.previewTo.x * TILE_SIZE + TILE_SIZE * 0.5 - camera.x;
  const fullToY = preview.previewTo.y * TILE_SIZE + TILE_SIZE * 0.5 - camera.y;
  const toX = fromX + (fullToX - fromX) * reveal;
  const toY = fromY + (fullToY - fromY) * reveal;
  const pulse = 0.45 + (Math.sin((state.lastTs || 0) * 0.012) * 0.5 + 0.5) * 0.55;

  ctx.save();
  ctx.lineCap = "round";
  ctx.strokeStyle = `rgba(132, 210, 255, ${0.18 + pulse * 0.18})`;
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();

  ctx.strokeStyle = `rgba(168, 232, 255, ${0.38 + pulse * 0.28})`;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();

  ctx.fillStyle = `rgba(210, 245, 255, ${0.38 + pulse * 0.22})`;
  ctx.beginPath();
  ctx.arc(toX, toY, 3 + pulse * 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function updateBeaconActivationAnim() {
  const anim = state.beaconActivationAnim;
  if (!anim) return;
  const elapsed = (state.lastTs || 0) - anim.startTs;
  if (elapsed < 2500) return; // 2000ms animation + 500ms pause
  // Animation done — execute pending action
  state.beaconActivationAnim = null;
  const pa = anim.pendingAction;
  if (pa.type === "artifactChoice") {
    state.artifactChoiceTrees = pa.trees;
    state.artifactChoicePendingBeacon = pa.beacon;
    openArtifactChoice();
  } else {
    state.shopModalOpen = true;
    syncTouchZonesInteractivity();
    openShop(state.gold, pa.lastId);
  }
}

function renderBeacon(camera) {
  for (const beacon of state.beacons) {
    renderOneBeacon(camera, beacon);
  }
}

function renderOneBeacon(camera, beacon) {
  const ctx = state.ctx;
  const bx = beacon.x;
  const by = beacon.y;
  const visAlpha = Math.max(
    state.visibleAlpha[cellIndex(bx, by)],
    state.visibleAlpha[cellIndex(bx + 1, by)],
    state.visibleAlpha[cellIndex(bx, by + 1)],
    state.visibleAlpha[cellIndex(bx + 1, by + 1)],
  );
  if (visAlpha <= 0.001) return;
  const cx = bx * TILE_SIZE - camera.x;
  const cy = by * TILE_SIZE - camera.y;
  const w = TILE_SIZE * 2;
  const h = TILE_SIZE * 2;
  const t = state.lastTs || 0;
  const pulse = Math.sin(t * 0.008) * 0.5 + 0.5;
  const active = beacon.active;

  ctx.save();
  ctx.globalAlpha = visAlpha;

  // Base plate
  ctx.fillStyle = "#2a2320";
  buildRoundedRectPath(ctx, cx + 3, cy + 3, w - 6, h - 6, 5);
  ctx.fill();

  // Border
  ctx.strokeStyle = active ? `rgba(120, 190, 230, ${0.5 + pulse * 0.3})` : "rgba(140, 120, 100, 0.5)";
  ctx.lineWidth = 1.5;
  buildRoundedRectPath(ctx, cx + 3, cy + 3, w - 6, h - 6, 5);
  ctx.stroke();

  // Corner bolts
  const boltPositions = [[cx + 7, cy + 7], [cx + w - 7, cy + 7], [cx + 7, cy + h - 7], [cx + w - 7, cy + h - 7]];
  for (const [boltX, boltY] of boltPositions) {
    ctx.fillStyle = active ? "rgba(120, 190, 230, 0.7)" : "rgba(120, 100, 80, 0.7)";
    ctx.beginPath();
    ctx.arc(boltX, boltY, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Crystal
  const midX = cx + w * 0.5;
  const midY = cy + h * 0.5 + 2;
  const cr = active ? "rgba(160, 220, 255," : "rgba(180, 160, 130,";
  const glow = 0.25 + pulse * 0.2;

  // Outer glow
  if (active) {
    ctx.fillStyle = `rgba(120, 190, 255, ${glow * 0.4})`;
    ctx.beginPath();
    ctx.ellipse(midX, midY, 16, 20, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Crystal body — hexagon shape (tall diamond with shoulders)
  ctx.beginPath();
  ctx.moveTo(midX,      midY - 22); // tip
  ctx.lineTo(midX + 10, midY - 8);  // upper right
  ctx.lineTo(midX + 10, midY + 6);  // lower right
  ctx.lineTo(midX,      midY + 18); // bottom tip
  ctx.lineTo(midX - 10, midY + 6);  // lower left
  ctx.lineTo(midX - 10, midY - 8);  // upper left
  ctx.closePath();
  ctx.fillStyle = active ? `rgba(60, 130, 190, ${0.55 + pulse * 0.15})` : "rgba(80, 70, 55, 0.55)";
  ctx.fill();
  ctx.strokeStyle = `${cr} 0.85)`;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Inner facet lines
  ctx.strokeStyle = `${cr} 0.35)`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(midX, midY - 22);
  ctx.lineTo(midX, midY + 18);
  ctx.moveTo(midX - 10, midY - 1);
  ctx.lineTo(midX + 10, midY - 1);
  ctx.stroke();

  // Inner shine
  ctx.fillStyle = `${cr} ${active ? 0.35 + pulse * 0.2 : 0.12})`;
  ctx.beginPath();
  ctx.moveTo(midX - 3, midY - 18);
  ctx.lineTo(midX - 7, midY - 8);
  ctx.lineTo(midX - 3, midY - 4);
  ctx.closePath();
  ctx.fill();

  // Placeholder contour hint (only when not yet activated)
  if (!active) {
    const ringPath = [
      { x: bx - 1, y: by - 1 },
      { x: bx,     y: by - 1 },
      { x: bx + 1, y: by - 1 },
      { x: bx + 2, y: by - 1 },
      { x: bx + 2, y: by     },
      { x: bx + 2, y: by + 1 },
      { x: bx + 2, y: by + 2 },
      { x: bx + 1, y: by + 2 },
      { x: bx,     y: by + 2 },
      { x: bx - 1, y: by + 2 },
      { x: bx - 1, y: by + 1 },
      { x: bx - 1, y: by     },
    ];
    const n = ringPath.length;

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    for (let i = 0; i <= n; i += 1) {
      const tile = ringPath[i % n];
      const px = tile.x * TILE_SIZE + TILE_SIZE * 0.5 - camera.x;
      const py = tile.y * TILE_SIZE + TILE_SIZE * 0.5 - camera.y;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.lineWidth = 8;
    ctx.strokeStyle = "rgba(60, 42, 22, 0.32)";
    ctx.stroke();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(219, 171, 99, 0.25)";
    ctx.stroke();

    ctx.restore();
  }

  ctx.restore();
}

function renderBeaconRadar(camera) {
  for (const beacon of state.beacons) {
    if (!beacon.active) continue;
    renderOneBeaconRadar(camera, beacon);
  }
}

function renderOneBeaconRadar(camera, beacon) {
  const distToPlayer = Math.hypot(beacon.x - state.drill.x, beacon.y - state.drill.y);
  if (distToPlayer > state.visionRadius) return;
  const ctx = state.ctx;
  const midX = beacon.x * TILE_SIZE + TILE_SIZE - camera.x;
  const midY = beacon.y * TILE_SIZE + TILE_SIZE - camera.y;
  const radius = 52;
  const bdx = state.base.x - (beacon.x + 0.5);
  const bdy = state.base.y - (beacon.y + 0.5);
  const blen = Math.hypot(bdx, bdy) || 1;
  const angle = Math.atan2(bdy / blen, bdx / blen);
  const dotX = midX + Math.cos(angle) * radius;
  const dotY = midY + Math.sin(angle) * radius;
  const pulse = 0.55 + (Math.sin((state.lastTs || 0) * 0.008) * 0.5 + 0.5) * 0.45;

  // Activation animation progress (0..1 over 2000ms)
  // Phases: ring 0-40%, line 40-70%, dot 70-100%
  let animT = 1;
  if (beacon.activationAnimStart) {
    const elapsed = (state.lastTs || 0) - beacon.activationAnimStart;
    if (elapsed < 2000) {
      animT = elapsed / 2000;
    } else {
      beacon.activationAnimStart = null;
    }
  }

  ctx.save();

  // --- Phase 1: Ring (0% - 40%) ---
  const ringT = Math.min(1, animT / 0.4);
  const ringEase = 1 - Math.pow(1 - ringT, 3);

  if (ringT < 1) {
    const sweepAngle = ringEase * Math.PI * 2;
    ctx.strokeStyle = `rgba(160, 220, 255, ${0.6 * (1 - ringEase * 0.3)})`;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(midX, midY, radius, -Math.PI / 2, -Math.PI / 2 + sweepAngle);
    ctx.stroke();

    const flashRadius = radius * ringEase;
    ctx.strokeStyle = `rgba(200, 240, 255, ${0.5 * (1 - ringEase)})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(midX, midY, flashRadius, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    ctx.strokeStyle = "rgba(160, 220, 255, 0.45)";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(midX, midY, radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.strokeStyle = `rgba(160, 220, 255, ${0.15 * ringEase})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(midX, midY, radius - 5, 0, Math.PI * 2);
  ctx.stroke();

  // Center dot
  ctx.fillStyle = `rgba(200, 240, 255, ${0.25 * ringEase})`;
  ctx.beginPath();
  ctx.arc(midX, midY, 2.4, 0, Math.PI * 2);
  ctx.fill();

  // --- Phase 2: Direction line (40% - 70%) ---
  const lineT = animT < 0.4 ? 0 : Math.min(1, (animT - 0.4) / 0.3);
  const lineEase = 1 - Math.pow(1 - lineT, 3);

  if (lineEase > 0) {
    const lineDotX = midX + Math.cos(angle) * radius * lineEase;
    const lineDotY = midY + Math.sin(angle) * radius * lineEase;
    ctx.strokeStyle = `rgba(160, 220, 255, ${0.22 * lineEase})`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(midX, midY);
    ctx.lineTo(lineDotX, lineDotY);
    ctx.stroke();
  }

  // --- Phase 3: Radar dot (70% - 100%) ---
  const dotT = animT < 0.7 ? 0 : Math.min(1, (animT - 0.7) / 0.3);
  const dotEase = 1 - Math.pow(1 - dotT, 3);

  if (dotEase > 0) {
    // Flash on appear
    if (dotT < 0.8) {
      const flashAlpha = 0.6 * (1 - dotT / 0.8);
      ctx.fillStyle = `rgba(200, 240, 255, ${flashAlpha})`;
      ctx.beginPath();
      ctx.arc(dotX, dotY, 14 * dotEase, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = `rgba(180, 230, 255, ${(0.18 + pulse * 0.18) * dotEase})`;
    ctx.beginPath();
    ctx.arc(dotX, dotY, (5.8 + pulse * 2.6) * dotEase, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(200, 240, 255, ${dotEase})`;
    ctx.beginPath();
    ctx.arc(dotX, dotY, (3.2 + pulse * 1.2) * dotEase, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function triggerPickupRadar(kind, fromX, fromY) {
  let bestDist = Infinity;
  let bestX = 0, bestY = 0;
  if (kind === "artifact") {
    // Find nearest inactive beacon
    for (const b of state.beacons) {
      if (b.active) continue;
      const d = Math.hypot(b.x + 1 - fromX, b.y + 1 - fromY);
      if (d < bestDist) { bestDist = d; bestX = b.x + 1; bestY = b.y + 1; }
    }
  } else {
    // Find the safe this key belongs to
    const safe = state.safes[state.heldKeyForSafe];
    if (safe && !safe.opened) {
      bestX = safe.doorX;
      bestY = safe.doorY;
      bestDist = 1;
    }
  }
  if (bestDist === Infinity) return;
  state.pickupRadarTimer = 1.0;
  state.pickupRadarKind = kind;
  state.pickupRadarTargetX = bestX;
  state.pickupRadarTargetY = bestY;
}

function renderPickupRadar(camera) {
  if (state.pickupRadarTimer <= 0) return;
  const ctx = state.ctx;
  const t = state.lastTs || 0;
  const alpha = Math.min(1, state.pickupRadarTimer); // fade out in last second

  const heroX = state.drill.renderX * TILE_SIZE + TILE_SIZE * 0.5 - camera.x;
  const heroY = state.drill.renderY * TILE_SIZE + TILE_SIZE * 0.5 - camera.y;
  const targetX = state.pickupRadarTargetX;
  const targetY = state.pickupRadarTargetY;

  const dx = targetX - (state.drill.renderX + 0.5);
  const dy = targetY - (state.drill.renderY + 0.5);
  const dist = Math.hypot(dx, dy) || 1;
  const angle = Math.atan2(dy, dx);

  const radius = 44;
  const dotX = heroX + Math.cos(angle) * radius;
  const dotY = heroY + Math.sin(angle) * radius;
  const pulse = 0.55 + (Math.sin(t * 0.01) * 0.5 + 0.5) * 0.45;

  const isKey = state.pickupRadarKind === "key";
  const color1 = isKey ? "255, 210, 80" : "180, 120, 255";
  const color2 = isKey ? "255, 230, 130" : "220, 180, 255";

  ctx.save();
  ctx.globalAlpha = alpha;

  // Ring
  ctx.strokeStyle = `rgba(${color1}, 0.45)`;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(heroX, heroY, radius, 0, Math.PI * 2);
  ctx.stroke();

  // Direction line
  ctx.strokeStyle = `rgba(${color1}, 0.22)`;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(heroX, heroY);
  ctx.lineTo(dotX, dotY);
  ctx.stroke();

  // Outer glow dot
  ctx.fillStyle = `rgba(${color1}, ${0.18 + pulse * 0.18})`;
  ctx.beginPath();
  ctx.arc(dotX, dotY, 5.8 + pulse * 2.6, 0, Math.PI * 2);
  ctx.fill();

  // Inner dot
  ctx.fillStyle = `rgba(${color2}, 1)`;
  ctx.beginPath();
  ctx.arc(dotX, dotY, 3.2 + pulse * 1.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function renderBaseProximityDot(camera) {
  const ACTIVATE_RADIUS = 6;
  const dist = Math.hypot(state.base.x - state.drill.x, state.base.y - state.drill.y);
  if (dist > ACTIVATE_RADIUS || state.baseFound) return;

  const ctx = state.ctx;
  // t: 0 at edge of radius, 1 at base
  const t = 1 - dist / ACTIVATE_RADIUS;
  // how many bars are lit (1–3)
  const litBars = t < 0.34 ? 1 : t < 0.67 ? 2 : 3;
  const pulse = 0.88 + 0.12 * Math.sin((state.lastTs || 0) / 220);

  const BAR_W = 3;
  const GAP = 2;
  const BARS = 3;
  const totalW = BARS * BAR_W + (BARS - 1) * GAP;
  const maxH = 9;

  // center above hero head
  const baseX = state.drill.renderX * TILE_SIZE + TILE_SIZE * 0.5 - camera.x - totalW / 2;
  const baseY = state.drill.renderY * TILE_SIZE - camera.y - 14;

  ctx.save();
  ctx.shadowColor = "#ff3030";

  for (let i = 0; i < BARS; i++) {
    const barH = maxH * (i + 1) / BARS;
    const x = baseX + i * (BAR_W + GAP);
    const y = baseY - barH;
    const lit = i < litBars;
    ctx.globalAlpha = lit ? 0.9 * pulse : 0.18;
    ctx.shadowBlur = lit ? 5 + t * 7 : 0;
    ctx.fillStyle = "#ff4040";
    ctx.fillRect(x, y, BAR_W, barH);
  }

  ctx.restore();
}

function renderBase(camera) {
  const ctx = state.ctx;
  if (!state.baseFound) {
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

function renderWormNestTile(x, y, sx, sy) {
  const ctx = state.ctx;
  const cx = sx + TILE_SIZE / 2;
  const cy = sy + TILE_SIZE / 2;
  const t = state.lastTs / 1000;
  let nestState = null;
  for (const n of state.wormNests) {
    if (n.x === x && n.y === y) {
      nestState = n;
      break;
    }
  }
  ctx.save();

  // Dark burrow hole
  ctx.fillStyle = "#1a0e08";
  ctx.beginPath();
  ctx.ellipse(cx, cy + 2, 10, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Inner darker circle
  ctx.fillStyle = "#0d0604";
  ctx.beginPath();
  ctx.ellipse(cx, cy + 2, 6, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Pulsing warning ring when active
  const isActive = !!nestState?.active;
  if (isActive) {
    const pulse = 0.4 + Math.sin(t * 4) * 0.3;
    ctx.strokeStyle = `rgba(196, 80, 50, ${pulse})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, 14 + Math.sin(t * 3) * 2, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (isActive && nestState.cooldown > 0) {
    const progress = 1 - Math.min(1, nestState.cooldown / WORM_ATTACK_INTERVAL);
    const barWidth = 18;
    const barHeight = 4;
    const barX = cx - barWidth / 2;
    const barY = sy + 5;
    ctx.fillStyle = "rgba(20, 8, 6, 0.78)";
    ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);
    ctx.fillStyle = "rgba(80, 38, 24, 0.9)";
    ctx.fillRect(barX, barY, barWidth, barHeight);
    const glow = 0.75 + Math.sin(t * 5 + x * 0.7 + y * 0.4) * 0.15;
    ctx.fillStyle = `rgba(229, 119, 69, ${glow})`;
    ctx.fillRect(barX, barY, barWidth * progress, barHeight);
  }

  // Subtle cracks radiating from hole
  ctx.strokeStyle = "rgba(80, 40, 20, 0.5)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 + 0.3;
    const r1 = 8;
    const r2 = 13 + (i % 2) * 3;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * r1, cy + Math.sin(angle) * r1);
    ctx.lineTo(cx + Math.cos(angle) * r2, cy + Math.sin(angle) * r2);
    ctx.stroke();
  }

  ctx.restore();
}

function renderArtifactTile(x, y, sx, sy) {
  const index = cellIndex(x, y);
  if (!state.artifactMask[index]) return;

  const ctx = state.ctx;
  const t = state.lastTs || 0;
  const midX = sx + TILE_SIZE * 0.5;
  const midY = sy + TILE_SIZE * 0.5;
  const seed = x * 73 + y * 137; // per-tile phase offset

  ctx.save();

  // Expanding ripple waves (4 rings, faster & bolder)
  const WAVE_COUNT = 4;
  const WAVE_PERIOD = 2000; // ms per full cycle
  const MAX_R = TILE_SIZE * 1.1;
  for (let w = 0; w < WAVE_COUNT; w++) {
    const phase = ((t + seed * 40 + w * (WAVE_PERIOD / WAVE_COUNT)) % WAVE_PERIOD) / WAVE_PERIOD;
    const r = TILE_SIZE * 0.18 + phase * (MAX_R - TILE_SIZE * 0.18);
    const alpha = (1 - phase) * 0.45;
    ctx.strokeStyle = `rgba(190, 140, 255, ${alpha})`;
    ctx.lineWidth = 2.0 * (1 - phase * 0.4);
    ctx.beginPath();
    ctx.arc(midX, midY, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Soft glow underneath
  const glowPulse = Math.sin(t * 0.003 + seed) * 0.5 + 0.5;
  const grad = ctx.createRadialGradient(midX, midY, 0, midX, midY, TILE_SIZE * 0.35);
  grad.addColorStop(0, `rgba(200, 160, 255, ${0.3 + glowPulse * 0.15})`);
  grad.addColorStop(1, `rgba(160, 100, 240, 0)`);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(midX, midY, TILE_SIZE * 0.35, 0, Math.PI * 2);
  ctx.fill();

  // Hexagon body — gentle bob up/down
  const bob = Math.sin(t * 0.0025 + seed * 0.5) * 1.5;
  const hexY = midY + bob;
  const hexR = TILE_SIZE * 0.2;
  ctx.fillStyle = `rgba(180, 130, 255, ${0.7 + glowPulse * 0.2})`;
  ctx.strokeStyle = `rgba(230, 200, 255, ${0.8 + glowPulse * 0.2})`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = Math.PI / 6 + (Math.PI * 2 * i) / 6;
    const px = midX + Math.cos(a) * hexR;
    const py = hexY + Math.sin(a) * hexR;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Inner sparkle dot
  ctx.fillStyle = `rgba(255, 240, 255, ${0.7 + glowPulse * 0.3})`;
  ctx.beginPath();
  ctx.arc(midX, hexY, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function renderKeyTile(x, y, sx, sy) {
  const index = cellIndex(x, y);
  if (!state.keyMask[index]) return;

  const ctx = state.ctx;
  const t = state.lastTs || 0;
  const midX = sx + TILE_SIZE * 0.5;
  const midY = sy + TILE_SIZE * 0.5;
  const seed = x * 97 + y * 53;
  const bob = Math.sin(t * 0.003 + seed) * 1.5;
  const pulse = Math.sin(t * 0.004 + seed) * 0.5 + 0.5;

  ctx.save();
  // Glow
  const grad = ctx.createRadialGradient(midX, midY + bob, 0, midX, midY + bob, TILE_SIZE * 0.35);
  grad.addColorStop(0, `rgba(255, 210, 80, ${0.3 + pulse * 0.15})`);
  grad.addColorStop(1, `rgba(255, 180, 40, 0)`);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(midX, midY + bob, TILE_SIZE * 0.35, 0, Math.PI * 2);
  ctx.fill();
  // Key shape — circle head + shaft
  const ky = midY + bob;
  ctx.fillStyle = `rgba(255, 220, 100, ${0.85 + pulse * 0.15})`;
  ctx.strokeStyle = `rgba(200, 160, 40, 0.9)`;
  ctx.lineWidth = 1.5;
  // Head (circle)
  ctx.beginPath();
  ctx.arc(midX, ky - 3, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Shaft
  ctx.beginPath();
  ctx.moveTo(midX, ky + 1);
  ctx.lineTo(midX, ky + 7);
  ctx.stroke();
  // Teeth
  ctx.beginPath();
  ctx.moveTo(midX, ky + 5);
  ctx.lineTo(midX + 2.5, ky + 5);
  ctx.moveTo(midX, ky + 7);
  ctx.lineTo(midX + 2, ky + 7);
  ctx.stroke();

  ctx.restore();
}

function renderSafeDoorTile(x, y, sx, sy) {
  const index = cellIndex(x, y);
  const doorVal = state.safeDoorMask[index];
  if (doorVal === 0) return;

  const ctx = state.ctx;
  const t = state.lastTs || 0;
  const midX = sx + TILE_SIZE * 0.5;
  const midY = sy + TILE_SIZE * 0.5;

  if (doorVal > 0) {
    // Locked door
    const pulse = Math.sin(t * 0.003) * 0.5 + 0.5;
    ctx.save();
    ctx.fillStyle = `rgba(120, 90, 50, ${0.9 + pulse * 0.1})`;
    ctx.fillRect(sx + 2, sy + 2, TILE_SIZE - 4, TILE_SIZE - 4);
    ctx.strokeStyle = `rgba(180, 140, 60, 0.8)`;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(sx + 2, sy + 2, TILE_SIZE - 4, TILE_SIZE - 4);
    // Lock icon
    ctx.strokeStyle = `rgba(255, 220, 100, ${0.7 + pulse * 0.3})`;
    ctx.lineWidth = 1.5;
    // Lock body
    ctx.fillStyle = `rgba(200, 170, 80, ${0.8 + pulse * 0.2})`;
    ctx.fillRect(midX - 4, midY - 1, 8, 7);
    // Lock arch
    ctx.beginPath();
    ctx.arc(midX, midY - 1, 3.5, Math.PI, 0);
    ctx.stroke();
    // Keyhole
    ctx.fillStyle = "#3a2a15";
    ctx.beginPath();
    ctx.arc(midX, midY + 2, 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
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

function renderWormSegment(ctx, cx, cy, radius, alpha, color, tileX, tileY) {
  const idx = cellIndex(tileX, tileY);
  const isTunnel = state.tunnelMask[idx] || state.beaconMask[idx] === 1;
  if (isTunnel) {
    // Fully visible on open tiles
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Underground hint — subtle shadow/bump visible through block
    ctx.globalAlpha = alpha * 0.25;
    ctx.fillStyle = "#1a0e08";
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.8, 0, Math.PI * 2);
    ctx.fill();
  }
}

function renderWorms(camera) {
  if (state.activeWorms.length === 0) return;
  const ctx = state.ctx;
  ctx.save();
  for (const worm of state.activeWorms) {
    // Draw body segments from trail (oldest to newest)
    for (let s = 0; s < worm.trail.length; s++) {
      const seg = worm.trail[s];
      const sx = seg.tileX * TILE_SIZE + TILE_SIZE / 2 - camera.x;
      const sy = seg.tileY * TILE_SIZE + TILE_SIZE / 2 - camera.y;
      const t = s / Math.max(1, worm.trail.length - 1);
      const radius = 4 + t * 4;
      renderWormSegment(ctx, sx, sy, radius, 0.5 + t * 0.2, "#a06040", seg.tileX, seg.tileY);
    }
    // Draw head at smooth render position
    const hx = worm.renderX * TILE_SIZE + TILE_SIZE / 2 - camera.x;
    const hy = worm.renderY * TILE_SIZE + TILE_SIZE / 2 - camera.y;
    renderWormSegment(ctx, hx, hy, 8, 0.8, "#c47a5a", worm.tileX, worm.tileY);
    // Eyes — only on open tiles
    const headIdx = cellIndex(worm.tileX, worm.tileY);
    if (state.tunnelMask[headIdx] || state.beaconMask[headIdx] === 1) {
      const nextPt = worm.pathIdx + 1 < worm.path.length ? worm.path[worm.pathIdx + 1] : worm.path[worm.pathIdx];
      const curPt = worm.path[worm.pathIdx];
      const edx = nextPt.x - curPt.x, edy = nextPt.y - curPt.y;
      const elen = Math.hypot(edx, edy) || 1;
      const enx = edx / elen, eny = edy / elen;
      ctx.fillStyle = "#1a0e08";
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      ctx.arc(hx + enx * 4 - eny * 3, hy + eny * 4 + enx * 3, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(hx + enx * 4 + eny * 3, hy + eny * 4 - enx * 3, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
  ctx.restore();
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
  const frame = strikeWave > 0.78 && state.drill.strikeEnergy > 0.3 ? 2 + (Math.floor((state.lastTs || 0) / 50) % 2) : Math.floor((state.lastTs || 0) / 160) % 2;
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

  if (!state.heldArtifact && state.heldKeyForSafe < 0) {
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
  }

  renderCog(px + 14, py + TILE_SIZE - 12, 4 + (frame % 2), ctx);
  renderCog(px + TILE_SIZE - 14, py + TILE_SIZE - 12, 4 + ((frame + 1) % 2), ctx);
  renderSteamStack(px + TILE_SIZE - 14 - state.drill.facingX * thrust * 1.2, py + 7 - state.drill.facingY * thrust * 1.2, ctx);

  // Artifact carried indicator — floating hexagon above drill
  if (state.heldArtifact) {
    const t = state.lastTs || 0;
    const floatY = Math.sin(t * 0.005) * 3;
    const acx = px + TILE_SIZE * 0.5;
    const acy = py - 6 + floatY;
    const ar = 7;
    const pulse = Math.sin(t * 0.006) * 0.5 + 0.5;
    // Glow
    ctx.save();
    ctx.fillStyle = `rgba(180, 120, 255, ${0.2 + pulse * 0.15})`;
    ctx.beginPath();
    ctx.arc(acx, acy, ar + 4, 0, Math.PI * 2);
    ctx.fill();
    // Hexagon
    ctx.fillStyle = `rgba(200, 150, 255, ${0.6 + pulse * 0.2})`;
    ctx.strokeStyle = `rgba(230, 200, 255, ${0.8 + pulse * 0.2})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = Math.PI / 6 + (Math.PI * 2 * i) / 6;
      const hx = acx + Math.cos(a) * ar;
      const hy = acy + Math.sin(a) * ar;
      if (i === 0) ctx.moveTo(hx, hy); else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Center dot
    ctx.fillStyle = "#f0d8ff";
    ctx.beginPath();
    ctx.arc(acx, acy, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Key carried indicator — floating key above drill
  if (state.heldKeyForSafe >= 0) {
    const t = state.lastTs || 0;
    const floatY = Math.sin(t * 0.005) * 3;
    const kcx = px + TILE_SIZE * 0.5;
    const kcy = py - (state.heldArtifact ? 22 : 6) + floatY;
    const pulse = Math.sin(t * 0.006) * 0.5 + 0.5;
    ctx.save();
    // Glow
    ctx.fillStyle = `rgba(255, 210, 80, ${0.2 + pulse * 0.15})`;
    ctx.beginPath();
    ctx.arc(kcx, kcy, 10, 0, Math.PI * 2);
    ctx.fill();
    // Key shape
    ctx.strokeStyle = `rgba(255, 220, 100, ${0.8 + pulse * 0.2})`;
    ctx.fillStyle = `rgba(255, 220, 100, ${0.7 + pulse * 0.2})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(kcx, kcy - 3, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(kcx, kcy + 1.5);
    ctx.lineTo(kcx, kcy + 8);
    ctx.moveTo(kcx, kcy + 5.5);
    ctx.lineTo(kcx + 3, kcy + 5.5);
    ctx.moveTo(kcx, kcy + 8);
    ctx.lineTo(kcx + 2.5, kcy + 8);
    ctx.stroke();
    ctx.restore();
  }
}

function renderSignalStatus(camera) {
  if (state.signalMovesLeft <= 0) {
    return;
  }

  const ctx = state.ctx;
  const x = state.drill.renderX * TILE_SIZE + TILE_SIZE * 0.5 - camera.x;
  const y = state.drill.renderY * TILE_SIZE + TILE_SIZE * 0.5 - camera.y;
  const radius = 48;
  const barWidth = 44;
  const angle = Math.atan2(state.signalDirY, state.signalDirX);
  const dotX = x + Math.cos(angle) * radius;
  const dotY = y + Math.sin(angle) * radius;
  const pulse = 0.55 + (Math.sin((state.lastTs || 0) * 0.012) * 0.5 + 0.5) * 0.45;

  ctx.save();
  const barRatio = state.signalMovesMax > 0 ? clamp(state.signalMovesLeft / state.signalMovesMax, 0, 1) : 0;
  ctx.strokeStyle = "rgba(242, 237, 226, 0.54)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = "rgba(242, 237, 226, 0.18)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, y, radius - 5, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "rgba(255, 250, 241, 0.2)";
  ctx.beginPath();
  ctx.arc(x, y, 2.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(242, 237, 226, 0.22)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(dotX, dotY);
  ctx.stroke();

  ctx.fillStyle = `rgba(255, 250, 241, ${0.18 + pulse * 0.18})`;
  ctx.beginPath();
  ctx.arc(dotX, dotY, 5.8 + pulse * 2.6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#fffaf1";
  ctx.beginPath();
  ctx.arc(dotX, dotY, 3.2 + pulse * 1.2, 0, Math.PI * 2);
  ctx.fill();

  if (state.radarCrystalModule) {
    const crystalTargets = getNearestRadarCrystals();
    for (let i = 0; i < crystalTargets.length; i += 1) {
      const crystal = crystalTargets[i];
      const crystalAngle = Math.atan2(crystal.dirY, crystal.dirX);
      const crystalX = x + Math.cos(crystalAngle) * radius;
      const crystalY = y + Math.sin(crystalAngle) * radius;
      ctx.fillStyle = `${crystal.color}44`;
      ctx.beginPath();
      ctx.arc(crystalX, crystalY, 5.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = crystal.color;
      ctx.beginPath();
      ctx.arc(crystalX, crystalY, 2.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(38, 24, 16, 0.68)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(crystalX, crystalY, 3.2, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  ctx.fillStyle = "rgba(255, 244, 220, 0.12)";
  buildRoundedRectPath(ctx, x - barWidth * 0.5, y + radius + 12, barWidth, 4, 3);
  ctx.fill();
  if (barRatio > 0) {
    ctx.fillStyle = "#f2ede2";
    buildRoundedRectPath(ctx, x - barWidth * 0.5, y + radius + 12, barWidth * barRatio, 4, 3);
    ctx.fill();
  }
  ctx.restore();
}

function getNearestRadarCrystals() {
  const nearest = [];
  for (let crystalType = 1; crystalType < CRYSTAL_TYPES.length; crystalType += 1) {
    let best = null;
    for (let y = 1; y < GRID_H - 1; y += 1) {
      for (let x = 1; x < GRID_W - 1; x += 1) {
        if (state.crystalMask[cellIndex(x, y)] !== crystalType) {
          continue;
        }
        const dx = x - state.drill.x;
        const dy = y - state.drill.y;
        const distanceSq = dx * dx + dy * dy;
        if (!best || distanceSq < best.distanceSq) {
          const length = Math.hypot(dx, dy) || 1;
          best = {
            color: CRYSTAL_TYPES[crystalType].color,
            distanceSq,
            dirX: dx / length,
            dirY: dy / length,
          };
        }
      }
    }
    if (best) {
      nearest.push(best);
    }
  }
  return nearest;
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

function renderGoldToast(camera) {
  if (state.goldToast.time <= 0 || state.goldToast.value <= 0) {
    return;
  }

  const ctx = state.ctx;
  const x = state.drill.renderX * TILE_SIZE + TILE_SIZE * 0.5 - camera.x;
  const lift = (0.9 - state.goldToast.time) * 22;
  const y = state.drill.renderY * TILE_SIZE - camera.y - 56 - lift;
  const alpha = clamp(state.goldToast.time / 0.9, 0, 1);
  const text = `+${state.goldToast.value} золото`;

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
  const top = 14;
  const gap = 10;
  const totalWidth = Math.min(state.width - 28, 560);
  const panelWidth = (totalWidth - gap) / 2;
  const panelHeight = 34;
  const left = state.width - 14 - totalWidth;
  const secondRowTop = top + panelHeight + 8;

  const hpLabel = state.armor > 0 ? `${state.hp}/${state.maxHp} • A:${state.armor}` : `${state.hp}/${state.maxHp}`;
  drawHudBar(left, top, panelWidth, panelHeight, "HP", hpLabel, hpRatio, ["#ff9d7a", "#ff5c5c"]);
  state.goldHitRect = { x: left, y: top, width: panelWidth, height: panelHeight };

  // Crystal recipe in top-right slot
  const ctx = state.ctx;
  const recipeX = left + panelWidth + gap;
  drawHudPanel(recipeX, top, panelWidth, panelHeight);
  ctx.save();
  ctx.fillStyle = "#c6ab84";
  ctx.font = `700 10px ${HUD_FONT}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("CRYSTAL RECIPE", recipeX + 10, top + 16);
  if (state.crystalRecipe.length > 0) {
    const usedCounts = [0, 0, 0, 0, 0, 0];
    for (let i = 0; i < state.crystalRecipe.length; i += 1) {
      const crystalType = state.crystalRecipe[i];
      const crystal = CRYSTAL_TYPES[crystalType];
      const cx = recipeX + 118 + i * 26;
      const cy = top + panelHeight * 0.5;
      const completed = usedCounts[crystalType] < state.crystalCollected[crystalType];
      if (completed) usedCounts[crystalType] += 1;
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
  }
  ctx.restore();

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

  const thirdRowTop = secondRowTop + panelHeight + 8;
  const xpRatio = clamp(state.xp / Math.max(1, state.xpToNext), 0, 1);
  drawHudXpBar(left, thirdRowTop, totalWidth, panelHeight, `LVL ${state.level}`, `${state.xp}/${state.xpToNext}`, xpRatio);
  const detailTop = thirdRowTop + panelHeight + 8;

  const manualButton = document.getElementById("manualOpen");
  if (manualButton) {
    manualButton.style.top = `${detailTop - 1}px`;
    manualButton.style.left = "auto";
    manualButton.style.right = "14px";
  }

  // Artifact indicator
  if (state.heldArtifact) {
    const artifactX = left + panelWidth + gap;
    const artifactY = thirdRowTop - 30;
    const pulse = Math.sin((state.lastTs || 0) * 0.006) * 0.5 + 0.5;
    ctx.save();
    ctx.fillStyle = `rgba(180, 120, 255, ${0.5 + pulse * 0.3})`;
    ctx.beginPath();
    ctx.arc(artifactX + 12, artifactY + 12, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `rgba(220, 180, 255, ${0.7 + pulse * 0.3})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = Math.PI / 6 + (Math.PI * 2 * i) / 6;
      const px = artifactX + 12 + Math.cos(a) * 7;
      const py = artifactY + 12 + Math.sin(a) * 7;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = "#e8d0ff";
    ctx.font = `700 10px ${HUD_FONT}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("АРТЕФАКТ", artifactX + 26, artifactY + 12);
    ctx.restore();
  }

  // Key indicator
  if (state.heldKeyForSafe >= 0) {
    const keyX = left + panelWidth + gap;
    const keyY = thirdRowTop - (state.heldArtifact ? 54 : 30);
    const pulse = Math.sin((state.lastTs || 0) * 0.006) * 0.5 + 0.5;
    ctx.save();
    ctx.fillStyle = `rgba(255, 210, 80, ${0.5 + pulse * 0.3})`;
    ctx.beginPath();
    ctx.arc(keyX + 12, keyY + 12, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `rgba(200, 160, 40, ${0.7 + pulse * 0.3})`;
    ctx.lineWidth = 1.5;
    // Key icon
    ctx.beginPath();
    ctx.arc(keyX + 12, keyY + 9, 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(keyX + 12, keyY + 13);
    ctx.lineTo(keyX + 12, keyY + 18);
    ctx.moveTo(keyX + 12, keyY + 16);
    ctx.lineTo(keyX + 14.5, keyY + 16);
    ctx.stroke();
    ctx.fillStyle = "#ffe4a0";
    ctx.font = `700 10px ${HUD_FONT}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("КЛЮЧ", keyX + 26, keyY + 12);
    ctx.restore();
  }

  renderHudCoreStats(left, detailTop, panelWidth, "СТАТЫ");
  renderHudPerkColumn(left + panelWidth + gap, detailTop, panelWidth, "ПЕРКИ");

  ctx.save();
  ctx.fillStyle = "rgba(198, 171, 132, 0.68)";
  ctx.font = `700 10px ${HUD_FONT}`;
  ctx.textAlign = "right";
  ctx.textBaseline = "top";
  ctx.fillText(`FPS ${Math.round(state.fps || 0)}`, state.width - 14, detailTop + 52);

  // FPS sparkline graph
  const history = state.fpsHistory;
  if (history.length > 1) {
    const gx = state.width - 14 - 44 - 38;
    const gy = detailTop + 52;
    const gw = 44;
    const gh = 12;
    const maxFps = 70;
    ctx.fillStyle = "rgba(198, 171, 132, 0.1)";
    ctx.fillRect(gx, gy, gw, gh);
    ctx.beginPath();
    for (let i = 0; i < history.length; i++) {
      const x = gx + (i / (history.length - 1)) * gw;
      const y = gy + gh - clamp(history[i] / maxFps, 0, 1) * gh;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = "rgba(198, 171, 132, 0.7)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  ctx.restore();
}

function drawHudGoldCounter(x, y, width, height) {
  const ctx = state.ctx;
  ctx.save();
  const cy = y + height * 0.5;
  const iconX = x + 20;
  const iconSize = 18;
  const half = iconSize * 0.5;

  // Golden circle icon
  ctx.translate(iconX, cy);
  const r = iconSize * 0.38;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = "#d79f49";
  ctx.fill();
  ctx.strokeStyle = "#f0c060";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  // Safe gold value
  const textX = iconX + half + 6;
  const safeText = `${Math.floor(state.gold)}`;
  ctx.font = `700 11px ${HUD_FONT}`;
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.strokeStyle = "rgba(24, 12, 8, 0.82)";
  ctx.lineWidth = 3;
  ctx.strokeText(safeText, textX, cy);
  ctx.fillStyle = "#f1dfb6";
  ctx.fillText(safeText, textX, cy);

  // Unsafe gold
  if (state.unsafeGold > 0) {
    const unsafeX = textX + ctx.measureText(safeText).width + 6;
    const unsafeText = `+${Math.floor(state.unsafeGold)}`;
    ctx.strokeStyle = "rgba(24, 12, 8, 0.82)";
    ctx.lineWidth = 3;
    ctx.strokeText(unsafeText, unsafeX, cy);
    ctx.fillStyle = "#ff9940";
    ctx.fillText(unsafeText, unsafeX, cy);
  }
  ctx.restore();
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

function drawHudXpBar(x, y, width, height, label, value, ratio) {
  const ctx = state.ctx;
  const trackX = x + 86;
  const trackY = y + 12;
  const trackWidth = Math.max(96, width - 126);
  const trackHeight = 10;

  drawHudPanel(x, y, width, height);

  ctx.save();
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#8fdfff";
  ctx.font = `700 10px ${HUD_FONT}`;
  ctx.textAlign = "left";
  ctx.fillText(label, x + 12, y + 16);

  ctx.strokeStyle = "rgba(18, 12, 8, 0.78)";
  ctx.lineWidth = 3;
  ctx.font = `700 11px ${HUD_FONT}`;
  ctx.textAlign = "right";
  ctx.strokeText(value, x + width - 12, y + 16);
  ctx.fillStyle = "#e5f8ff";
  ctx.fillText(value, x + width - 12, y + 16);

  ctx.fillStyle = "rgba(180, 238, 255, 0.1)";
  drawRoundedRectPath(trackX, trackY, trackWidth, trackHeight, trackHeight * 0.5);
  ctx.fill();

  const fillWidth = Math.max(0, trackWidth * ratio);
  if (fillWidth > 0) {
    const glow = 0.8 + Math.sin((state.lastTs || 0) * 0.004) * 0.1;
    ctx.fillStyle = `rgba(125, 224, 255, ${glow})`;
    drawRoundedRectPath(trackX, trackY, fillWidth, trackHeight, trackHeight * 0.5);
    ctx.fill();
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

  // Gold row — first
  const goldRowY = y + 8;
  const half = 9;
  ctx.save();
  ctx.translate(x + 20, goldRowY);
  ctx.beginPath();
  ctx.arc(0, 0, 18 * 0.38, 0, Math.PI * 2);
  ctx.fillStyle = "#d79f49";
  ctx.fill();
  ctx.strokeStyle = "#f0c060";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();

  ctx.font = `700 11px ${HUD_FONT}`;
  ctx.textAlign = "left";
  const safeText = `${Math.floor(state.gold)}`;
  ctx.strokeStyle = "rgba(24, 12, 8, 0.82)";
  ctx.lineWidth = 3;
  ctx.strokeText(safeText, x + 36, goldRowY);
  ctx.fillStyle = "#f1dfb6";
  ctx.fillText(safeText, x + 36, goldRowY);
  if (state.unsafeGold > 0) {
    const unsafeX = x + 36 + ctx.measureText(safeText).width + 5;
    const unsafeText = `+${Math.floor(state.unsafeGold)}`;
    ctx.strokeStyle = "rgba(24, 12, 8, 0.82)";
    ctx.lineWidth = 3;
    ctx.strokeText(unsafeText, unsafeX, goldRowY);
    ctx.fillStyle = "#ff9940";
    ctx.fillText(unsafeText, unsafeX, goldRowY);
  }

  for (let i = 0; i < rows.length; i += 1) {
    const rowY = goldRowY + (i + 1) * rowHeight;
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
  for (let i = 1; i < GOLD_PERK_TYPES.length; i += 1) {
    if (i === 21) {
      continue;
    }
    if (!GOLD_PERK_TYPES[i]) {
      continue;
    }
    const level = getGoldPerkCurrentLevel(i);
    if (level <= 0) {
      continue;
    }
    perkRows.push({
      perkType: i,
      icon: GOLD_PERK_TYPES[i].icon || "?",
      name: GOLD_PERK_TYPES[i].name,
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
    ctx.fillText(GOLD_PERK_TYPES[perkType].icon || "?", cx, cy + 0.5);

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
  const zoom = getCameraZoom();
  const viewWidth = state.width / zoom;
  const viewHeight = state.height / zoom;
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
  ctx.rect(0, 0, viewWidth, viewHeight);
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
