const TILE_SIZE = 36;
const GRID_W = 30;
const GRID_H = 44;
const HUD_FONT = 'Baskerville, "Palatino Linotype", "Book Antiqua", Georgia, serif';
const STEP_MS = 1000 / 60;
const MAX_FRAME_MS = 100;
const VISION_RADIUS = 5;
const START_X = Math.floor(GRID_W / 2);
const START_Y = Math.floor(GRID_H / 2);
const START_FUEL = 300;
const IDLE_FUEL_DRAIN = 1;
const MOVE_FUEL_COST = 2;
const STRIKE_FUEL_COST = 5;
const STRIKE_CYCLE_SPEED = 8;
const PERK_TILE_MIN_SPACING = 3;
const PERK_TILE_MAX_SPACING = 4;
const PERK_MIN_DISTANCE = 4;
const PERK_ZONE_COUNT = 4;
const PERK_ZONE_MIN_DISTANCE = 9;
const SCRAP_PERK_BASE_COST = 30;
const SCRAP_PERK_COST_GROWTH = 25;
const SCRAP_PERK_POPUP_DELAY = 0.5;

const BLOCK_TYPES = [
  { hp: 0, color: "#1a1410", scrap: 0, vein: "#3c2d22" },
  { hp: 6, color: "#5f4631", scrap: 2, vein: "#9b7a4a" },
  { hp: 9, color: "#715337", scrap: 4, vein: "#c59a5c" },
  { hp: 15, color: "#6f4f40", scrap: 7, vein: "#b66e3b" },
  { hp: 21, color: "#4f3d36", scrap: 11, vein: "#9cb1b7" },
];

const TILE_PERK_TYPES = [
  null,
  { name: "Бак", icon: "F", color: "#ffcf7a", desc: "+90 топлива прямо сейчас" },
  { name: "Радар", icon: "R", color: "#8ef0cb", desc: "+5 сигналов hotter/colder" },
  { name: "Бур", icon: "D", color: "#ff9f6b", desc: "+0.5 к силе удара бура" },
  { name: "Бомба", icon: "*", color: "#ff7c5f", desc: "Взрыв в радиусе 2 тайлов с уроном x10" },
  { name: "Скорость", icon: "S", color: "#9fd7ff", desc: "+15% к скорости нового удара" },
];

const SCRAP_PERK_TYPES = [
  null,
  { name: "Боковые буры", desc: "Удар также бьет по двум боковым клеткам" },
  { name: "Прыжковый привод", desc: "Каждые 10 блоков дает рывок, повторный выбор увеличивает дальность" },
  { name: "Длинный бур", desc: "Бьет следующий тайл вперед, повторно усиливает дальний удар" },
  { name: "Диагональные буры", desc: "Бьют по диагоналям вперед, повторно усиливают дальний удар" },
  { name: "Форсаж на нуле", desc: "Чем меньше топлива, тем быстрее следующий удар" },
  { name: "Саперный заряд", desc: "Каждые 15 разрушенных блоков кидает бомбу 2x2 на дистанцию 3" },
  { name: "Гео-линза", desc: "+2 к радиусу обзора и +2 шага от радара" },
  { name: "Рециркулятор", desc: "+2 скрапа и +2 топлива за каждый разрушенный блок" },
  { name: "Перегрузка", desc: "Переполнение топлива запускает дальнюю бомбу, бак -50, топлива +50" },
];

const TILE_PERK_WEIGHTS = [0, 7, 3, 2, 4, 3];

const state = {
  canvas: document.getElementById("game"),
  ctx: null,
  width: 0,
  height: 0,
  dpr: 1,
  timeAcc: 0,
  lastTs: 0,
  fuel: START_FUEL,
  maxFuel: START_FUEL,
  depth: 0,
  scrap: 0,
  baseFound: false,
  outOfFuel: false,
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
  health: new Float32Array(GRID_W * GRID_H),
  signalMovesLeft: 0,
  signalLastDistance: 0,
  signalText: "Старт",
  perkText: "Нет",
  moveFuelCost: MOVE_FUEL_COST,
  strikeFuelCost: STRIKE_FUEL_COST,
  strikeSpeed: 1,
  drillPower: 1,
  scrapBonus: 0,
  fuelOnBreak: 0,
  fuelPickupBonus: 0,
  overflowBomb: false,
  radarBonus: 0,
  blocksBroken: 0,
  sideDrills: 0,
  jumpDrive: false,
  jumpCharges: 0,
  jumpRange: 0,
  longDrillPower: 0,
  diagonalDrillPower: 0,
  lowFuelSpeedBonus: 0,
  remoteBombLevel: 0,
  perkToast: {
    text: "",
    time: 0,
  },
  fuelToast: {
    value: 0,
    time: 0,
  },
  scrapToast: {
    value: 0,
    time: 0,
  },
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

function chooseWeightedPerk(weights) {
  let total = 0;
  for (let i = 1; i < weights.length; i += 1) {
    total += weights[i];
  }

  let roll = Math.random() * total;
  for (let i = 1; i < weights.length; i += 1) {
    roll -= weights[i];
    if (roll <= 0) {
      return i;
    }
  }

  return 1;
}

function getScrapPerkCost(level) {
  return SCRAP_PERK_BASE_COST + level * SCRAP_PERK_COST_GROWTH;
}

function setupField() {
  state.pathIndexByCell.fill(-1);
  state.perkMask.fill(0);
  state.perkZoneMask.fill(-1);
  state.perkZones.length = 0;
  state.baseFound = false;
  state.base.visible = false;
  state.cameraShake.time = 0;
  state.cameraShake.amplitude = 0;
  state.outOfFuel = false;
  state.fuel = START_FUEL;
  state.maxFuel = START_FUEL;
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
  state.moveFuelCost = MOVE_FUEL_COST;
  state.strikeFuelCost = STRIKE_FUEL_COST;
  state.strikeSpeed = 1;
  state.drillPower = 1;
  state.scrapBonus = 0;
  state.fuelOnBreak = 0;
  state.fuelPickupBonus = 0;
  state.overflowBomb = false;
  state.radarBonus = 0;
  state.blocksBroken = 0;
  state.sideDrills = 0;
  state.jumpDrive = false;
  state.jumpCharges = 0;
  state.jumpRange = 0;
  state.longDrillPower = 0;
  state.diagonalDrillPower = 0;
  state.lowFuelSpeedBonus = 0;
  state.remoteBombLevel = 0;
  state.perkToast.text = "";
  state.perkToast.time = 0;
  state.fuelToast.value = 0;
  state.fuelToast.time = 0;
  state.scrapToast.value = 0;
  state.scrapToast.time = 0;
  state.drill.strikePhase = 0;
  state.drill.strikeEnergy = 0;
  state.drill.strikeLatch = false;

  for (let y = 0; y < GRID_H; y += 1) {
    for (let x = 0; x < GRID_W; x += 1) {
      const index = cellIndex(x, y);
      const depthBand = clamp(1 + Math.floor(y / 10), 1, 4);
      const noise = ((x * 13 + y * 7) % 3 === 0 ? 1 : 0) + (((x + y) % 11) === 0 ? 1 : 0);
      const type = clamp(depthBand + noise - 1, 1, 4);
      state.hardness[index] = type;
      state.health[index] = BLOCK_TYPES[type].hp;
      state.tunnelMask[index] = 0;
    }
  }

  state.pathTiles.length = 0;
  carveTunnel(state.drill.x, state.drill.y);
  extendPath(state.drill.x, state.drill.y);

  placeHiddenBase();
  placePerkTiles();
  placePerkZones();
  state.signalLastDistance = getDistanceToBase(state.drill.x, state.drill.y);
}

function placeHiddenBase() {
  const minY = 3;
  const maxY = GRID_H - 4;
  const minX = 3;
  const maxX = GRID_W - 4;
  let attempts = 0;

  while (attempts < 200) {
    const x = minX + Math.floor(Math.random() * (maxX - minX + 1));
    const y = minY + Math.floor(Math.random() * (maxY - minY + 1));
    const distance = Math.hypot(x - START_X, y - START_Y);
    if (distance >= 8) {
      state.base.x = x;
      state.base.y = y;
      return;
    }
    attempts += 1;
  }

  state.base.x = maxX;
  state.base.y = maxY;
}

function placePerkTiles() {
  const candidates = [];
  const placed = [];

  for (let x = 5, stepIndex = 0; x < GRID_W - 3; stepIndex += 1) {
    for (let y = 5, rowStep = 1; y < GRID_H - 3; rowStep += 1) {
      const perkX = clamp(x + (((y * 3 + stepIndex * 5) % 5) - 2), 2, GRID_W - 3);
      const perkY = clamp(y + (((x * 7 + rowStep * 11) % 5) - 2), 2, GRID_H - 3);
      candidates.push({ x: perkX, y: perkY });
      y += PERK_TILE_MIN_SPACING + (rowStep % (PERK_TILE_MAX_SPACING - PERK_TILE_MIN_SPACING + 1));
    }
    x += PERK_TILE_MIN_SPACING + (stepIndex % (PERK_TILE_MAX_SPACING - PERK_TILE_MIN_SPACING + 1));
  }

  for (let i = candidates.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = candidates[i];
    candidates[i] = candidates[j];
    candidates[j] = tmp;
  }

  for (let i = 0; i < candidates.length; i += 1) {
    const candidate = candidates[i];
    const index = cellIndex(candidate.x, candidate.y);

    if (state.tunnelMask[index]) {
      continue;
    }
    if ((candidate.x === state.base.x && candidate.y === state.base.y) || (candidate.x === START_X && candidate.y === START_Y)) {
      continue;
    }

    let tooClose = false;
    for (let j = 0; j < placed.length; j += 1) {
      const dx = candidate.x - placed[j].x;
      const dy = candidate.y - placed[j].y;
      if (Math.hypot(dx, dy) < PERK_MIN_DISTANCE) {
        tooClose = true;
        break;
      }
    }

    if (tooClose) {
      continue;
    }

    state.perkMask[index] = chooseWeightedPerk(TILE_PERK_WEIGHTS);
    placed.push(candidate);
  }
}

function placePerkZones() {
  const placed = [];
  let attempts = 0;

  while (state.perkZones.length < PERK_ZONE_COUNT && attempts < 400) {
    const centerX = 2 + Math.floor(Math.random() * (GRID_W - 4));
    const centerY = 2 + Math.floor(Math.random() * (GRID_H - 4));
    attempts += 1;

    if ((centerX === START_X && centerY === START_Y) || (centerX === state.base.x && centerY === state.base.y)) {
      continue;
    }

    let tooClose = false;
    for (let i = 0; i < placed.length; i += 1) {
      if (Math.hypot(centerX - placed[i].x, centerY - placed[i].y) < PERK_ZONE_MIN_DISTANCE) {
        tooClose = true;
        break;
      }
    }
    if (tooClose) {
      continue;
    }

    let blocked = false;
    for (let oy = -1; oy <= 1 && !blocked; oy += 1) {
      for (let ox = -1; ox <= 1; ox += 1) {
        const x = centerX + ox;
        const y = centerY + oy;
        const index = cellIndex(x, y);
        if (state.tunnelMask[index] || state.perkZoneMask[index] !== -1) {
          blocked = true;
          break;
        }
      }
    }
    if (blocked) {
      continue;
    }

    const zoneId = state.perkZones.length;
    const perkType = chooseWeightedPerk(TILE_PERK_WEIGHTS);
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
  applyTilePerk(perkType, x, y);
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

  for (let i = 0; i < 3; i += 1) {
    applyTilePerk(zone.perkType, zone.x, zone.y, false);
  }
}

function applyTilePerk(perkType, x, y, showToast = true) {
  switch (perkType) {
    case 1:
      addFuel(90, x, y);
      state.perkText = "Бак";
      break;
    case 2:
      state.signalMovesLeft += 5 + state.radarBonus;
      consumeSignalMove(x, y);
      state.perkText = "Радар";
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
    default:
      break;
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
      state.visionRadius = Math.min(9, state.visionRadius + 2);
      state.radarBonus += 2;
      state.perkText = "Гео-линза";
      break;
    case 8:
      state.scrapBonus += 2;
      state.fuelOnBreak += 2;
      state.perkText = "Рециркулятор";
      break;
    case 9:
      state.overflowBomb = true;
      state.fuelPickupBonus += 50;
      state.maxFuel = Math.max(100, state.maxFuel - 50);
      state.fuel = Math.min(state.fuel, state.maxFuel);
      state.perkText = "Перегрузка";
      break;
    default:
      break;
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

function rebuildPathIndex() {
  state.pathIndexByCell.fill(-1);
  for (let i = 0; i < state.pathTiles.length; i += 1) {
    const tile = state.pathTiles[i];
    state.pathIndexByCell[cellIndex(tile.x, tile.y)] = i;
  }
}

function init() {
  state.ctx = state.canvas.getContext("2d");
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
  if (state.isChoosingPerk) {
    return;
  }

  state.fuel = Math.max(0, state.fuel - IDLE_FUEL_DRAIN * dt);
  state.fuel = Math.min(state.maxFuel, state.fuel);
  if (state.fuel <= 0) {
    state.outOfFuel = true;
  }
  updateDrill(dt);
  updateDiscovery();
  updateCameraShake(dt);
  state.perkToast.time = Math.max(0, state.perkToast.time - dt);
  state.fuelToast.time = Math.max(0, state.fuelToast.time - dt);
  state.scrapToast.time = Math.max(0, state.scrapToast.time - dt);
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

function checkScrapPerkUnlock() {
  if (state.isChoosingPerk || state.pendingPerkChoice || state.scrap < state.nextScrapPerkAt) {
    return;
  }

  const bag = [1, 2, 3, 4, 5, 6, 7, 8, 9];
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

  applyScrapPerk(perkType);
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

  if (state.overflowBomb && overflow > 0) {
    triggerOverflowBomb(originX, originY);
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

  state.health[index] -= damage;
  if (state.health[index] > 0) {
    return false;
  }

  breakCell(x, y, index, options);
  return true;
}

function breakCell(x, y, index, options = {}) {
  const hardness = state.hardness[index];
  const scrapGain = BLOCK_TYPES[hardness].scrap + state.scrapBonus;
  state.scrap += scrapGain;
  addFuel(state.fuelOnBreak, x, y);
  state.blocksBroken += 1;
  showScrapToast(scrapGain);
  if (state.jumpDrive && state.blocksBroken % 10 === 0) {
    state.jumpCharges += 1;
  }
  if (state.remoteBombLevel > 0 && state.blocksBroken % 15 === 0) {
    triggerRemoteBombSquare(x, y, 3);
  }

  carveTunnel(x, y);

  if (options.moveDrill) {
    state.drill.x = x;
    state.drill.y = y;
    consumeSignalMove(x, y);
    extendPath(x, y);
  }
}

function explodeAt(x, y, damage, radius = 2) {
  const maxOffset = Math.ceil(radius);
  for (let oy = -maxOffset; oy <= maxOffset; oy += 1) {
    for (let ox = -maxOffset; ox <= maxOffset; ox += 1) {
      if (!ox && !oy) {
        continue;
      }
      if (Math.hypot(ox, oy) > radius) {
        continue;
      }
      damageCell(x + ox, y + oy, damage);
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
  const damage = state.drillPower * 10;
  const square = [
    { x: centerX, y: centerY },
    { x: clamp(centerX + (dir.x >= 0 ? 1 : -1), 1, GRID_W - 2), y: centerY },
    { x: centerX, y: clamp(centerY + (dir.y >= 0 ? 1 : -1), 1, GRID_H - 2) },
    {
      x: clamp(centerX + (dir.x >= 0 ? 1 : -1), 1, GRID_W - 2),
      y: clamp(centerY + (dir.y >= 0 ? 1 : -1), 1, GRID_H - 2),
    },
  ];

  for (let i = 0; i < square.length; i += 1) {
    damageCell(square[i].x, square[i].y, damage);
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
  const damage = state.drillPower * (8 + state.remoteBombLevel * 2);
  const square = [
    { x: centerX, y: centerY },
    { x: clamp(centerX + stepX, 1, GRID_W - 2), y: centerY },
    { x: centerX, y: clamp(centerY + stepY, 1, GRID_H - 2) },
    { x: clamp(centerX + stepX, 1, GRID_W - 2), y: clamp(centerY + stepY, 1, GRID_H - 2) },
  ];

  for (let i = 0; i < square.length; i += 1) {
    damageCell(square[i].x, square[i].y, damage);
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
    state.outOfFuel = true;
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
  consumeSignalMove(jumpX, jumpY);
  extendPath(jumpX, jumpY);
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
    state.outOfFuel = true;
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
        state.outOfFuel = true;
        return;
      }
      state.drill.strikeLatch = true;
      state.fuel -= state.moveFuelCost;
      state.drill.x = targetX;
      state.drill.y = targetY;
      consumeSignalMove(targetX, targetY);
      state.drill.progress = 0;
      state.drill.strikeEnergy = 0.35;
      extendPath(targetX, targetY);
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
      state.outOfFuel = true;
      return;
    }

    state.drill.strikeLatch = true;
    state.fuel -= state.strikeFuelCost;
    const strikeDamage = getStrikeDamage();
    const hardness = state.hardness[targetIndex];
    damageCell(targetX, targetY, strikeDamage, { moveDrill: true });
    state.drill.progress += strikeDamage;
    state.cameraShake.amplitude = Math.max(
      state.cameraShake.amplitude,
      Math.min(1.8, 0.28 + hardness * 0.22) * state.drill.strikeEnergy,
    );

    if (state.sideDrills > 0) {
      const sideDamage = strikeDamage * (0.5 + state.sideDrills * 0.25);
      damageCell(state.drill.x - dy, state.drill.y + dx, sideDamage);
      damageCell(state.drill.x + dy, state.drill.y - dx, sideDamage);
    }

    if (state.longDrillPower > 0) {
      const longDamage = strikeDamage * (0.1 + state.longDrillPower);
      damageCell(targetX + dx, targetY + dy, longDamage);
    }

    if (state.diagonalDrillPower > 0) {
      const diagonalDamage = strikeDamage * (0.15 + state.diagonalDrillPower);
      damageCell(targetX - dy, targetY + dx, diagonalDamage);
      damageCell(targetX + dy, targetY - dx, diagonalDamage);
    }
  } else if (strikeWave < 0.35) {
    state.drill.strikeLatch = false;
  }

  if (state.fuel <= 0 && state.health[targetIndex] > 0) {
    state.fuel = 0;
    state.outOfFuel = true;
    return;
  }
}

function consumeSignalMove(x, y) {
  if (state.signalMovesLeft <= 0) {
    return;
  }

  const currentDistance = getDistanceToBase(x, y);
  const delta = currentDistance - state.signalLastDistance;
  state.signalMovesLeft -= 1;

  if (Math.abs(delta) < 0.2) {
    state.signalText = `Ровно ${state.signalMovesLeft}`;
  } else if (delta < 0) {
    state.signalText = `Горячее ${state.signalMovesLeft}`;
  } else {
    state.signalText = `Холоднее ${state.signalMovesLeft}`;
  }

  state.signalLastDistance = currentDistance;
  if (state.signalMovesLeft === 0) {
    state.signalText = "Сигнал пуст";
  }
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
        ctx.fillStyle = y <= 3 ? "#38261a" : "#19110d";
      } else {
        ctx.fillStyle = BLOCK_TYPES[state.hardness[index]].color;
      }

      ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);
      ctx.strokeStyle = "rgba(255, 225, 179, 0.05)";
      ctx.strokeRect(sx, sy, TILE_SIZE, TILE_SIZE);

      if (state.tunnelMask[index]) {
        ctx.fillStyle = "rgba(230, 176, 99, 0.08)";
        ctx.fillRect(sx + 5, sy + 5, TILE_SIZE - 10, 4);
        ctx.fillRect(sx + 5, sy + TILE_SIZE - 9, TILE_SIZE - 10, 4);
        ctx.fillStyle = "rgba(255, 226, 184, 0.16)";
        ctx.beginPath();
        ctx.arc(sx + 8, sy + 8, 2, 0, Math.PI * 2);
        ctx.arc(sx + TILE_SIZE - 8, sy + 8, 2, 0, Math.PI * 2);
        ctx.arc(sx + 8, sy + TILE_SIZE - 8, 2, 0, Math.PI * 2);
        ctx.arc(sx + TILE_SIZE - 8, sy + TILE_SIZE - 8, 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        const type = BLOCK_TYPES[state.hardness[index]];
        ctx.strokeStyle = `${type.vein}66`;
        ctx.beginPath();
        ctx.moveTo(sx + 7, sy + TILE_SIZE * 0.3);
        ctx.lineTo(sx + TILE_SIZE * 0.48, sy + TILE_SIZE * 0.58);
        ctx.lineTo(sx + TILE_SIZE - 8, sy + TILE_SIZE * 0.22);
        ctx.stroke();
      }

      if (!state.tunnelMask[index] && state.health[index] < BLOCK_TYPES[state.hardness[index]].hp) {
        const ratio = clamp(state.health[index] / BLOCK_TYPES[state.hardness[index]].hp, 0, 1);
        ctx.fillStyle = "rgba(255, 231, 195, 0.2)";
        ctx.fillRect(sx + 6, sy + TILE_SIZE - 9, (TILE_SIZE - 12) * ratio, 4);
      }

      renderPerkZoneTile(x, y, sx, sy);
      renderPerkTile(x, y, sx, sy);
    }
  }

  renderPath(camera);
  renderBase(camera);
  renderDrill(camera);
  renderFuelToast(camera);
  renderScrapToast(camera);
  renderPerkToast(camera);
  renderSignalStatus(camera);
  renderVisionMask(camera);
  renderHud();

  if (state.baseFound) {
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(0, 0, state.width, state.height);
    ctx.fillStyle = "#ffffff";
    ctx.font = `700 28px ${HUD_FONT}`;
    ctx.textAlign = "center";
    ctx.fillText("База найдена", state.width * 0.5, state.height * 0.46);
    ctx.font = `400 16px ${HUD_FONT}`;
    ctx.fillText("Ты добрался до спрятанной цели. Можно расширять мета-игру поиска.", state.width * 0.5, state.height * 0.52);
  } else if (state.outOfFuel) {
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, state.width, state.height);
    ctx.fillStyle = "#fff5dd";
    ctx.font = `700 28px ${HUD_FONT}`;
    ctx.textAlign = "center";
    ctx.fillText("Топливо закончилось", state.width * 0.5, state.height * 0.46);
    ctx.font = `400 16px ${HUD_FONT}`;
    ctx.fillText("Ищи путь к перкам или перезагрузи карту.", state.width * 0.5, state.height * 0.52);
  }
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
  ctx.fillStyle = "#2b1b14";
  ctx.fillRect(x + 5, y + 5, TILE_SIZE - 10, TILE_SIZE - 10);
  ctx.fillStyle = "#c79b58";
  ctx.fillRect(x + 8, y + 8, TILE_SIZE - 16, TILE_SIZE - 16);
  ctx.fillStyle = "#6c4120";
  ctx.fillRect(x + 15, y + 12, TILE_SIZE - 30, TILE_SIZE - 20);
  ctx.fillStyle = "rgba(255, 239, 194, 0.45)";
  ctx.fillRect(x + 18, y + 16, TILE_SIZE - 36, 5);
  renderCog(x + 14, y + TILE_SIZE - 13, 4, ctx);
  renderCog(x + TILE_SIZE - 14, y + TILE_SIZE - 13, 4, ctx);
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
  ctx.fillStyle = `${perk.color}55`;
  ctx.beginPath();
  ctx.arc(sx + TILE_SIZE * 0.5, sy + TILE_SIZE * 0.5, TILE_SIZE * 0.22, 0, Math.PI * 2);
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
  const bodyOffsetX = -state.drill.facingX * thrust * 2.2;
  const bodyOffsetY = -state.drill.facingY * thrust * 2.2;
  const hammerOffsetX = state.drill.facingX * thrust * 7;
  const hammerOffsetY = state.drill.facingY * thrust * 7;
  const px = state.drill.x * TILE_SIZE - camera.x + bodyOffsetX;
  const py = state.drill.y * TILE_SIZE - camera.y + bodyOffsetY;

  ctx.fillStyle = "#5d3822";
  ctx.fillRect(px + 6, py + 10, TILE_SIZE - 12, TILE_SIZE - 16);
  ctx.fillStyle = "#d3a15a";
  ctx.fillRect(px + 10, py + 12, TILE_SIZE - 20, TILE_SIZE - 20);
  ctx.fillStyle = "#34231a";
  ctx.fillRect(px + 14, py + 6, TILE_SIZE - 28, 10);
  ctx.fillRect(px + TILE_SIZE - 18, py + 12, 6, 14);
  ctx.fillStyle = "rgba(255, 240, 199, 0.25)";
  ctx.fillRect(px + 12, py + 16, TILE_SIZE - 24, 4);

  const drillBaseX = px + TILE_SIZE * 0.5;
  const drillBaseY = py + TILE_SIZE * 0.5;
  const drillTipX = drillBaseX + state.drill.facingX * (12 + hammerOffsetX) + (state.drill.facingX === 0 ? hammerOffsetX * 0.25 : 0);
  const drillTipY = drillBaseY + state.drill.facingY * (12 + hammerOffsetY) + (state.drill.facingY === 0 ? hammerOffsetY * 0.25 : 0);
  ctx.strokeStyle = "#f0d09b";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(drillBaseX, drillBaseY);
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
  ctx.fillStyle = "rgba(23, 14, 9, 0.82)";
  ctx.strokeStyle = "rgba(196, 240, 255, 0.36)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(x - width * 0.5, y - 18, width, 24, 10);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#c4f0ff";
  ctx.fillText(text, x, y - 1);
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
  const currentScrapCost = getScrapPerkCost(state.scrapPerkLevel);
  const scrapCycle = state.nextScrapPerkAt - currentScrapCost;
  const scrapProgress = clamp(state.scrap - scrapCycle, 0, currentScrapCost);
  const scrapRatio = clamp(scrapProgress / currentScrapCost, 0, 1);
  const top = 14 + (window.visualViewport?.offsetTop || 0);
  const gap = 10;
  const totalWidth = Math.min(state.width - 28, 420);
  const panelWidth = (totalWidth - gap) * 0.5;
  const panelHeight = 34;
  const left = state.width - 14 - totalWidth;

  drawHudBar(left, top, panelWidth, panelHeight, "FUEL", `${Math.floor(state.fuel)}/${state.maxFuel}`, fuelRatio, ["#ffbf62", "#ff8c3b"]);
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
