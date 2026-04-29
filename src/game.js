import { initShop, openShop, closeShop, renderShop, getEquipmentLevels, addSlot, unlockCategory, getLockedCategories, resetShopState, getItemStacks, grantItem, grantGood, getEquippedParts, getPurchasedItems, replaceOneBaseOfferWithSpecial, setShopRarityGuarantees, showGoodTooltip, hideGoodTooltip, showStatTooltipForStat, hideStatTooltip } from "./shop.js?v=47";
import { t, setLocale, getLocale } from "./i18n.js";
import { playSound, initSounds, getSoundPreloadProgress, setMuted, isMuted } from "./sounds.js?v=1";
import { CATEGORIES, TAG_SYNERGIES, RARITY_COLORS, RARITY_NAMES, ALL_GOODS, ALL_EQUIPMENT, ALL_ITEMS, RARITY, getGoodDescription } from "./items-catalog.js?v=1";
import {
  generateMap,
  mulberry32 as _mulberry32,
  GRID_W,
  GRID_H,
  START_X,
  START_Y,
  VISION_RADIUS,
  DEPTH_LEVELS,
  TILE_PERK_WEIGHTS,
  getGenerationConfig,
  setGenerationConfig,
  resetGenerationConfig,
} from "./worldgen.js?v=42";

const CUTSCENE_MODE =
  location.pathname === "/cut" ||
  location.pathname === "/cut/" ||
  new URLSearchParams(location.search).has("cutscene");
const INTRO_CUTSCENE_SEEN_KEY = "dig_intro_cutscene_seen_v1";

const TILE_SIZE = 36;
const HUD_FONT = 'Baskerville, "Palatino Linotype", "Book Antiqua", Georgia, serif';
const STEP_MS = 1000 / 60;
const MAX_FRAME_MS = 100;
const START_FUEL = 350;
const START_HP = 100;
const MAX_HEAT = 100;
const BASE_DRILL_DAMAGE = 13.4;
const IDLE_FUEL_DRAIN = 0.8;
const DRILL_FUEL_DRAIN = 8;
const STRIKE_CYCLE_SPEED = 10.64;
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
const TOAST_DURATION_LEVEL_1 = 0.9;
const TOAST_DURATION_LEVEL_2 = 2.0;
const TOAST_DURATION_LEVEL_3 = 3.5;
const IDLE_AUTO_CLOSE_DELAY = 4;
const IDLE_AUTO_CLOSE_MIN_DELAY = 1;
const AUTO_CLOSE_SEC_PER_BLOCK = 0.52;
const IDLE_AUTO_CLOSE_PREVIEW_DELAY = 0.5;
const IDLE_AUTO_CLOSE_PREVIEW_RETURN_DURATION = 0.24;
const BEACON_ACTIVATION_MS = 2000;
const BEACON_WIRE_BREAK_TELEGRAPH_MS = 700;
const BEACON_WIRE_BREAK_WAVE_DELAY_MS = 70;
const BEACON_WIRE_POST_SHOP_DELAY_MS = 350;
const BEACON_WIRE_FLARE_MS = 650;
const BEACON_WIRE_RECOVER_MS = 1400;
const FULL_FREEDOM_WIRE_HIDE_MS = 900;
const GAS_POCKET_GROUPS = 10;
const STEAM_POCKET_GROUPS = 8;
const BOULDER_POCKET_GROUPS = 8;
const METAL_VEIN_GROUPS = 16;
const GOLD_ORE_GROUPS = 50;
const GOLD_ORE_PER_BLOCK = 25;
const GAS_SPREAD_INTERVAL = 2;
const GAS_SPREAD_STEPS = 3;
const GAS_DAMAGE = 25;
const BOULDER_DELAY = 1;
const BOULDER_MOVE_INTERVAL = 0.12;
const BOULDER_BREAK_LIMIT = 20;
const BOULDER_DAMAGE = 75;
const BOULDER_MIN_START_DISTANCE = 4;
const BEACON_COUNT = 5;
const BEACON_MIN_DIST = 15;
const BEACON_MAX_DIST = 60;
const STEAM_RELEASE_DELAY = 2;
const STEAM_LIFETIME = 3;
const STEAM_DAMAGE = 25;
const STEAM_RANGE = 99;
const EXPLOSION_BREAK_DAMAGE = 9999;
const ROCKET_ARMED_DURATION = 1.0;
const BREACH_MISSILE_DAMAGE = 20;
const BREACH_MISSILE_RADIUS = 1.5;
const FUEL_ROCKET_DAMAGE = 20;
const FUEL_ROCKET_RADIUS = 1;
const CRYO_ROCKET_DAMAGE = 20;
const SHARD_DRILL_BLAST_RADIUS = 1.0;
const BLOCK_HP_BAR_HIGHLIGHT_MS = 3000;
const BLUEPRINT_CATEGORY_CONCEPT_MAP = {
  basic: ["breach", "contour", "xp"],
  economy: ["luck", "xp", "find"],
  handwork: ["breach", "contour", "fuel"],
  heat: ["heat", "explosion", "collapse"],
  выживание: ["fuel", "starvation", "hp", "armor", "concentration"],
  поиск_бреши: ["breach", "afterburner", "concentration"],
  ракеты: ["explosion", "collapse", "heat", "afterburner"],
  контур: ["contour", "contourMonster", "effectDuration"],
  навигация: ["radar", "beacon", "find"],
  алхимия: ["beacon", "crystals", "xp"],
};

const ITEM_INSPECT_STAT_META = new Proxy({
  adrenalineLevel:           { key: "stat.adrenalineLevel",           mode: "percent" },
  armor:                     { key: "stat.armor",                     mode: "armor" },
  blueprintRadarMode:         { key: "stat.blueprintRadarMode",         mode: "toggle" },
  beaconCatalystLevel:       { key: "stat.beaconCatalystLevel",       mode: "level" },
  bonusFindChance:           { key: "stat.bonusFindChance",           mode: "percent" },
  breachAfterburnerSeconds:  { key: "stat.breachAfterburnerSeconds",  mode: "fixed1" },
  breachChainHitsOnTrigger:  { key: "stat.breachChainHitsOnTrigger",  mode: "integer" },
  breachMissCool:            { key: "stat.breachMissCool",            mode: "fixed1" },
  breachMissileLevel:        { key: "stat.breachMissileLevel",        mode: "level" },
  breachPresenceChance:      { key: "stat.breachPresenceChance",      mode: "percent" },
  breachThermostatLevel:     { key: "stat.breachThermostatLevel",     mode: "level" },
  concentration:             { key: "stat.concentration",             mode: "multiplier" },
  collapseBudgetMaxScale:    { key: "stat.collapseBudgetMaxScale",    mode: "percent" },
  recipeCollapseDelayPercent:{ key: "stat.recipeCollapseDelayPercent",mode: "rawpercent" },
  contourResMultiplier:      { key: "stat.contourResMultiplier",      mode: "percent" },
  contourEnemyHpPerTileBonus:{ key: "stat.contourEnemyHpPerTileBonus",mode: "integer" },
  contourEnemyRewardPerTileBonus:{ key: "stat.contourEnemyRewardPerTileBonus",mode: "integer" },
  contourEnemySpawnRateBonus:{ key: "stat.contourEnemySpawnRateBonus",mode: "percent" },
  drillPiercingCount:        { key: "stat.drillPiercingCount",        mode: "integer" },
  drillPiercingDamage:       { key: "stat.drillPiercingDamage",       mode: "rawpercent" },
  overhealSpindlePiercingGain:{ key: "stat.overhealSpindlePiercingGain", mode: "rawpercent" },
  overflowGovernorDrillGain: { key: "stat.overflowGovernorDrillGain", mode: "fixed1" },
  drillDiagonalCount:        { key: "stat.drillDiagonalCount",        mode: "integer" },
  drillDiagonalDamage:       { key: "stat.drillDiagonalDamage",       mode: "rawpercent" },
  cryoRocketCount:           { key: "stat.cryoRocketCount",           mode: "level" },
  crystalGoldGain:           { key: "stat.crystalGoldGain",           mode: "integer" },
  crystalRedDrillGain:       { key: "stat.crystalRedDrillGain",       mode: "fixed1" },
  crystalYellowExplosionGain:{ key: "stat.crystalYellowExplosionGain",mode: "fixed1" },
  crystalLightRadarSeconds:  { key: "stat.crystalLightRadarSeconds",  mode: "fixed1" },
  crystalGreenHealGain:      { key: "stat.crystalGreenHealGain",      mode: "hp" },
  crystalBlueSpeedGain:      { key: "stat.crystalBlueSpeedGain",      mode: "rawpercent" },
  crystalXpGain:             { key: "stat.crystalXpGain",             mode: "integer" },
  damageBonus:               { key: "stat.damageBonus",               mode: "percent" },
  drillPower:                { key: "stat.drillPower",                mode: "fixed1" },
  drillPowerPerLevel:        { key: "stat.drillPowerPerLevel",        mode: "fixed1" },
  explosionPowerPerLevel:    { key: "stat.explosionPowerPerLevel",    mode: "fixed1" },
  effectDurationRate:        { key: "stat.effectDurationRate",        mode: "multiplier" },
  explosionPower:            { key: "stat.explosionPower",            mode: "fixed1" },
  explosionBonus:            { key: "stat.explosionBonus",            mode: "rawpercent" },
  explosionHeatTaken:        { key: "stat.explosionHeatTaken",        mode: "rawpercent" },
  fuelConverterLevel:        { key: "stat.fuelConverterLevel",        mode: "level" },
  fuelDrainRate:             { key: "stat.fuelDrainRate",             mode: "multiplier" },
  fuelStarvationResistance:  { key: "stat.fuelStarvationResistance",  mode: "rawpercent" },
  fuelPerLevel:              { key: "stat.fuelPerLevel",              mode: "integer" },
  fuelRocketLevel:           { key: "stat.fuelRocketLevel",           mode: "level" },
  goldBonus:                 { key: "stat.goldBonus",                 mode: "percent" },
  goldBonusPerLevel:         { key: "stat.goldBonusPerLevel",         mode: "integer" },
  goldRadarMode:             { key: "stat.goldRadarMode",             mode: "toggle" },
  healPerLevel:              { key: "stat.healPerLevel",              mode: "hp" },
  heatRate:                  { key: "stat.heatRate",                  mode: "multiplier" },
  insuranceLevel:            { key: "stat.insuranceLevel",            mode: "level" },
  levelCatalystLevel:        { key: "stat.levelCatalystLevel",        mode: "level" },
  loopSpawnBonusChance:      { key: "stat.loopSpawnBonusChance",      mode: "percent" },
  lowFuelSpeedBonus:         { key: "stat.lowFuelSpeedBonus",         mode: "percent" },
  lowFuelDamageBonus:        { key: "stat.lowFuelDamageBonus",        mode: "percent" },
  lowFuelWeakSpotChance:     { key: "stat.lowFuelWeakSpotChance",     mode: "percent" },
  overdriveBreachChance:     { key: "stat.overdriveBreachChance",     mode: "percent" },
  luckAsWeakSpotChance:      { key: "stat.luckAsWeakSpotChance",      mode: "rawpercent" },
  luck:                      { key: "stat.luck",                      mode: "integer" },
  maxFuel:                   { key: "stat.maxFuel",                   mode: "integer" },
  maxHeat:                   { key: "stat.maxHeat",                   mode: "integer" },
  maxHp:                     { key: "stat.maxHp",                     mode: "hp" },
  maxContour:                { key: "stat.maxContour",                mode: "integer" },
  miningGoldBonusMultiplier: { key: "stat.miningGoldBonusMultiplier", mode: "percent" },
  navigatorMode:             { key: "stat.navigatorMode",             mode: "toggle" },
  radarCrystalModule:        { key: "stat.radarCrystalModule",        mode: "toggle" },
  shardDrillLevel:           { key: "stat.shardDrillLevel",           mode: "level" },
  speedOfAutoClose:          { key: "stat.speedOfAutoClose",          mode: "rawpercent" },
  strikeSpeed:               { key: "stat.strikeSpeed",               mode: "rawpercent" },
  strikeSpeedPerLevel:       { key: "stat.strikeSpeedPerLevel",       mode: "rawpercent" },
  stunAfterburnerLevel:      { key: "stat.stunAfterburnerLevel",      mode: "level" },
  stunDetonatorLevel:        { key: "stat.stunDetonatorLevel",        mode: "level" },
  stunReservoirLevel:        { key: "stat.stunReservoirLevel",        mode: "level" },
  visionRadius:              { key: "stat.visionRadius",              mode: "integer" },
  weakSpotChance:            { key: "stat.weakSpotChance",            mode: "percent" },
  weakSpotFuelGain:          { key: "stat.weakSpotFuelGain",          mode: "integer" },
  weakSpotMult:              { key: "stat.weakSpotMult",              mode: "percent" },
  weakSpotChancePerLevel:    { key: "stat.weakSpotChancePerLevel",    mode: "percent" },
  weakSpotPierce:            { key: "stat.weakSpotPierce",            mode: "integer" },
  xpBonus:         { key: "stat.xpBonus",        mode: "percent" },
}, {
  get(target, prop) {
    const entry = target[prop];
    if (!entry) return undefined;
    return { label: t(entry.key), mode: entry.mode };
  },
});

const ITEM_INSPECT_SPECIAL_DESCRIPTION_IDS = new Set([
  "thermo_drill",
  "basic_drill",
  "blast_drill",
  "tradeoff_drill",
  "fragile_drill",
  "telescopic_drill",
  "diagonal_drill_array",
  "lucky_pickaxe",
  "shard_drill",
  "beacon_alchemy_drill",
  "recipe_alchemy_drill",
  "contour_overload_drill",
  "contour_line_drill",
  "contour_resonance_drill",
  "loop_pressure",
  "contour_blast_pressure",
]);

const DEBUG_CORE_STATS = [
  { key: "maxHp",                label: "maxHp",                 step: 1,    fmt: v => Math.round(v) },
  { key: "maxFuel",              label: "maxFuel",               step: 50,   fmt: v => Math.round(v) },
  { key: "fuelDrainRate",        label: "fuelDrainRate",         step: 0.1,  fmt: v => v.toFixed(1) },
  { key: "fuelStarvationResistance", label: "fuelStarvationResistance", step: 5, fmt: v => Math.round(v) },
  { key: "contourResMultiplier", label: "contourResMultiplier",  step: 0.05, fmt: v => v.toFixed(2) },
  { key: "maxHeat",              label: "maxHeat",               step: 10,   fmt: v => Math.round(v) },
  { key: "heatRate",             label: "heatRate",              step: 0.1,  fmt: v => v.toFixed(1) },
  { key: "strikeSpeed",          label: "strikeSpeed",           step: 5,    fmt: v => Math.round(v) },
  { key: "drillPower",           label: "drillPower",            step: 1,    fmt: v => v.toFixed(1) },
  { key: "drillPiercingCount",   label: "drillPiercingCount",    step: 1,    fmt: v => Math.round(v) },
  { key: "drillPiercingDamage",  label: "drillPiercingDamage(%)",step: 5,    fmt: v => Math.round(v) },
  { key: "drillDiagonalCount",   label: "drillDiagonalCount",    step: 1,    fmt: v => Math.round(v) },
  { key: "drillDiagonalDamage",  label: "drillDiagonalDamage(%)",step: 5,    fmt: v => Math.round(v) },
  { key: "weakSpotChance",       label: "Breach%",               step: 0.05, fmt: v => `${Math.round(v * 100)}%` },
  { key: "weakSpotMult",         label: "Breach%",               step: 0.5,  fmt: v => `${Math.round(v * 100)}%` },
  { key: "luck",                 label: "luck",                  step: 1,    fmt: v => Math.round(v) },
  { key: "visionRadius",         label: "visionRadius",          step: 1,    fmt: v => Math.round(v) },
  { key: "concentration",        label: "concentration (%)",     step: 5,    fmt: v => Math.round(v) },
  { key: "effectDurationRate",   label: "effectDurationRate",    step: 0.1,  fmt: v => `${Math.round(v * 100)}%` },
  { key: "goldBonus",            label: "goldBonus",             step: 0.05, fmt: v => `${Math.round(v * 100)}%` },
  { key: "xpBonus",    label: "xpBonus",               step: 0.05, fmt: v => `${Math.round(v * 100)}%` },
  { key: "fuelBonus",            label: "fuelBonus",             step: 0.05, fmt: v => `${Math.round(v * 100)}%` },
  { key: "speedOfAutoClose",     label: "speedOfAutoClose (%)",  step: 10,   fmt: v => Math.round(v) },
  { key: "maxContour",           label: "maxContour",            step: 1,    fmt: v => Math.round(v) },
  { key: "damageBonus",          label: "damageBonus (%)",       step: 5,    fmt: v => Math.round(v) },
  { key: "explosionPower",       label: "explosionPower",        step: 1,    fmt: v => v.toFixed(1) },
  { key: "explosionRadiusBonus", label: "explosionRadiusBonus",  step: 0.5,  fmt: v => v.toFixed(1) },
  { key: "weakSpotPierce",       label: "weakSpotPierce",        step: 1,    fmt: v => Math.round(v) },
  { key: "weakSpotFuelGain",     label: "weakSpotFuelGain",      step: 1,    fmt: v => Math.round(v) },
  { key: "lowFuelSpeedBonus",    label: "lowFuelSpeedBonus",     step: 0.05, fmt: v => `${Math.round(v * 100)}%` },
  { key: "lowFuelDamageBonus",   label: "lowFuelDamageBonus",    step: 0.05, fmt: v => `${Math.round(v * 100)}%` },
  { key: "loopSpawnBonusChance", label: "loopSpawnBonusChance",  step: 0.05, fmt: v => `${Math.round(v * 100)}%` },
  { key: "drillPowerPerLevel",   label: "drillPowerPerLevel",    step: 0.5,  fmt: v => v.toFixed(1) },
  { key: "explosionPowerPerLevel", label: "explosionPowerPerLevel", step: 0.5, fmt: v => v.toFixed(1) },
  { key: "strikeSpeedPerLevel",  label: "strikeSpeedPerLevel",   step: 1,    fmt: v => Math.round(v) },
  { key: "fuelPerLevel",         label: "fuelPerLevel",          step: 1,    fmt: v => Math.round(v) },
  { key: "healPerLevel",         label: "healPerLevel",          step: 1,    fmt: v => Math.round(v) },
  { key: "goldBonusPerLevel",    label: "goldBonusPerLevel",     step: 0.05, fmt: v => `${Math.round(v * 100)}%` },
  { key: "bonusFindChance",      label: "bonusFindChance",       step: 0.1,  fmt: v => `${Math.round(v * 100)}%` },
];
const CRYO_ROCKET_RADIUS = 1.0;
const COOLING_ROCKET_DAMAGE = 30;
const COOLING_ROCKET_RADIUS = 1.0;
const OVERLOAD_ROCKET_DAMAGE = 55;
const OVERLOAD_ROCKET_RADIUS = 1.5;
const REMOTE_BOMB_DAMAGE = 40;
const REMOTE_BOMB_RADIUS = 1.0;
const OVERFLOW_OVERDRIVE_DURATION = 3;
const OVERFLOW_STUN_DURATION = 3;
const HEAT_PER_STRIKE = 2.01;
const HEAT_COOL_RATE = 8;
const HEAT_STUN_DURATION = 3;
const FUEL_DEPLETION_HP_COST = 25;
const FUEL_DEPLETION_RECOVERY = 100;
const IMPACT_EFFECT_DURATION = 0.22;
const BREAK_EFFECT_DURATION = 0.42;
const EXPLOSION_EFFECT_DURATION = 0.48;
const WEAK_SPOT_HIT_DURATION = 0.52;
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
const WORM_DAMAGE = 50;
const WORM_BLOCK_DAMAGE_RATIO = 0.5;
const WORM_BODY_LENGTH = 8;
const WORM_DUST_DURATION = 0.6;
const CONTOUR_ENEMY_MIN_PATH_LENGTH = 4;
const CONTOUR_ENEMY_SPEED = 2.0;
const CONTOUR_ENEMY_TURN_DELAY = 0.38;
const CONTOUR_ENEMY_BASE_HP = 30;
const CONTOUR_ENEMY_HP_PER_TILE = 7;
const CONTOUR_ENEMY_BASE_REWARD = 5;
const CONTOUR_ENEMY_REWARD_PER_TILE = 3;
const CONTOUR_ENEMY_ATTACK_INTERVAL = 1.8;
const CONTOUR_ENEMY_ATTACK_RANGE = 2;
const CONTOUR_ENEMY_ATTACK_TELEGRAPH = 0.55;
const CONTOUR_ENEMY_DAMAGE = 22;
const CONTOUR_ENEMY_EXTRA_HEAT = 14;
const CONTOUR_ENEMY_STUN_DURATION = 0.7;
const COLLAPSE_BUDGET_INITIAL = 600;
const CONTOUR_ENEMY_BUDGET_INITIAL = 500;
const COLLAPSE_WARNING_DURATION = 2.4;
const COLLAPSE_MIN_TILES = 3;
const COLLAPSE_MAX_TILES = 6;
const COLLAPSE_LAND_INTERVAL = 0.12;
const XP_INFLATION = 10;
const XP_PER_BLOCK = 1 * XP_INFLATION;
const XP_PICKUP_RADIUS = 1;
const GENERATION_CONFIG_STORAGE_KEY = "dig:generation-config";
const DEBUG_MODE = new URLSearchParams(location.search).has("debug-map");

// ─── Level reward pool ────────────────────────────────────────────────────────
// Each entry: { stat, minRarity, values: [C, U, R, L], label, fmt }
// fmt(value) → display string for the label
const LEVEL_REWARD_POOL = [
  { stat: "drillPower",       minRarity: 1, values: [5, 10, 15, 20],                get label() { return t("reward.drillPower"); },       fmt: v => `+${v}` },
  { stat: "explosionPower",   minRarity: 1, values: [5, 10, 15, 20],                get label() { return t("reward.explosionPower"); },   fmt: v => `+${v}` },
  { stat: "strikeSpeed",      minRarity: 1, values: [3, 6, 10, 15],                 get label() { return t("reward.strikeSpeed"); },      fmt: v => `+${v}%` },
  { stat: "damageBonus",      minRarity: 1, values: [3, 5, 8, 10],                   get label() { return t("reward.damageBonus"); },      fmt: v => `+${Math.round(v)}%` },
  { stat: "goldBonus",        minRarity: 1, values: [0.03, 0.06, 0.10, 0.15],       get label() { return t("reward.goldBonus"); },        fmt: v => `+${Math.round(v*100)}%` },
  { stat: "maxFuel",          minRarity: 1, values: [10, 20, 30, 40],               get label() { return t("reward.maxFuel"); },          fmt: v => `+${v}` },
  { stat: "weakSpotChance",   minRarity: 1, values: [0.03, 0.05, 0.07, 0.11],       get label() { return t("reward.weakSpotChance"); },   fmt: v => `+${Math.round(v*100)}%` },
  { stat: "weakSpotMult",     minRarity: 1, values: [0.3, 0.4, 0.5, 0.8],           get label() { return t("reward.weakSpotMult"); },     fmt: v => `+${Math.round(v * 100)}%` },
  { stat: "luck",             minRarity: 1, values: [3, 5, 7, 11],                  get label() { return t("reward.luck"); },             fmt: v => `+${v}` },
  { stat: "fuelBonus",        minRarity: 2, values: [null, 0.05, 0.10, 0.15, 0.20], get label() { return t("reward.fuelBonus"); },        fmt: v => `+${Math.round(v*100)}%` },
  { stat: "maxHeat",          minRarity: 2, values: [null, 5, 10, 15],              get label() { return t("reward.maxHeat"); },          fmt: v => `+${v}` },
  { stat: "maxHp",            minRarity: 3, values: [null, null, 25, 50],           get label() { return t("reward.maxHp"); },            fmt: v => `+${v}` },
  { stat: "xpBonus",minRarity: 1, values: [0.03, 0.06, 0.10, 0.15],       get label() { return t("reward.xpBonus"); },fmt: v => `+${Math.round(v*100)}%` },
  { stat: "effectDurationRate",minRarity: 2, values: [null, 0.10, 0.18, 0.28],      get label() { return t("reward.effectDurationRate"); },fmt: v => `+${Math.round(v*100)}%` },
  { stat: "bonusFindChance",  minRarity: 2, values: [null, 0.10, 0.20, 0.35],       get label() { return t("reward.bonusFindChance"); },  fmt: v => `+${Math.round(v*100)}%` },
];

function rollLevelRewardRarity(playerLevel) {
  const t = Math.min(playerLevel / 12, 1);
  const luck = state.luck || 0;
  const luckBonus = 1 + luck * 0.01;
  const legendary = Math.min(0.08, t * 0.08 * luckBonus);
  const rare      = Math.min(0.25, t * 0.25 * luckBonus);
  const uncommon  = Math.min(0.45, (0.10 + t * 0.35) * luckBonus);
  const roll = Math.random();
  if (roll < legendary) return 4;
  if (roll < legendary + rare) return 3;
  if (roll < legendary + rare + uncommon) return 2;
  return 1;
}

function generateLevelRewardChoices(playerLevel) {
  const choices = [];
  const used = new Set();
  let attempts = 0;
  while (choices.length < 3 && attempts < 60) {
    attempts++;
    const rarity = rollLevelRewardRarity(playerLevel);
    const pool = LEVEL_REWARD_POOL.filter(e => e.minRarity <= rarity && !used.has(e.stat));
    if (pool.length === 0) continue;
    const entry = pool[Math.floor(Math.random() * pool.length)];
    const valueIndex = rarity - 1;
    const value = entry.values[valueIndex];
    if (value == null) continue;
    used.add(entry.stat);
    choices.push({
      id: `${entry.stat}:${rarity}`,
      stat: entry.stat,
      value,
      rarity,
      label: `${entry.fmt(value)} ${entry.label}`,
      description: RARITY_NAMES[rarity],
    });
  }
  return choices;
}

// Reusable buffers for visibility BFS — avoids per-frame allocations
let _visFogDistance = new Int16Array(GRID_W * GRID_H);
let _visBfsQueue = new Int32Array(GRID_W * GRID_H);
let _visFogQueue = new Int32Array(GRID_W * GRID_H);

function createGridStateBuffers() {
  const cellCount = GRID_W * GRID_H;
  return {
    pathIndexByCell: new Int16Array(cellCount),
    tunnelMask: new Uint8Array(cellCount),
    perkMask: new Uint8Array(cellCount),
    crystalMask: new Uint8Array(cellCount),
    perkZoneMask: new Int16Array(cellCount),
    hardness: new Uint8Array(cellCount),
    hazardMask: new Uint8Array(cellCount),
    hazardTriggeredMask: new Uint8Array(cellCount),
    metalMask: new Uint8Array(cellCount),
    goldOreMask: new Uint8Array(cellCount),
    gasPocketMask: new Uint8Array(cellCount),
    gasMask: new Uint8Array(cellCount),
    steamPocketMask: new Uint8Array(cellCount),
    steamMask: new Uint8Array(cellCount),
    boulderPocketMask: new Uint8Array(cellCount),
    beaconMask: new Uint8Array(cellCount),
    blueprintMask: new Uint8Array(cellCount),
    safeDoorMask: new Int16Array(cellCount),
    keyMask: new Uint8Array(cellCount),
    safeInteriorMask: new Int16Array(cellCount),
    health: new Float32Array(cellCount),
    blockHpBarLastHitTs: new Float32Array(cellCount),
    crackAngle: new Float32Array(cellCount),
    loopGoldMask: new Float32Array(cellCount),
    droppedGoldMask: new Float32Array(cellCount),
    xpPickupMask: new Uint16Array(cellCount),
    xpBonusPickupMask: new Uint16Array(cellCount),
    goldPickupMask: new Float32Array(cellCount),
    goldBonusPickupMask: new Float32Array(cellCount),
    visibleMask: new Uint8Array(cellCount),
    visibleAlpha: new Float32Array(cellCount),
    visibleTargetAlpha: new Float32Array(cellCount),
    weakSpotMask: new Float32Array(cellCount),
    microResourceMask: new Uint8Array(cellCount),
    microResourceRevealedMask: new Uint8Array(cellCount),
  };
}

function ensureGridBuffers() {
  const cellCount = GRID_W * GRID_H;
  if (_visFogDistance.length !== cellCount) {
    _visFogDistance = new Int16Array(cellCount);
    _visBfsQueue = new Int32Array(cellCount);
    _visFogQueue = new Int32Array(cellCount);
  }
  if (state.pathIndexByCell.length !== cellCount) {
    Object.assign(state, createGridStateBuffers());
  }
}

const HAZARD_TYPES = {
  SPIKE: 1,
  VOLATILE: 2,
};
const HAZARD_DATA = {
  [HAZARD_TYPES.SPIKE]: { damage: 25, color: "#ff6b48" },
  [HAZARD_TYPES.VOLATILE]: { damage: 50, color: "#ffd166" },
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
  { get name() { return t("perk.tile.tank.name"); },  icon: "F", color: "#ffcf7a", get desc() { return t("perk.tile.tank.desc"); } },
  { get name() { return t("perk.tile.radar.name"); }, icon: "R", color: "#f2ede2", get desc() { return t("perk.tile.radar.desc"); } },
  { get name() { return t("perk.tile.drill.name"); }, icon: "D", color: "#ff9f6b", get desc() { return t("perk.tile.drill.desc"); } },
  { get name() { return t("perk.tile.bomb.name"); },  icon: "*", color: "#c796ff", get desc() { return t("perk.tile.bomb.desc"); } },
  { get name() { return t("perk.tile.speed.name"); }, icon: "S", color: "#9fd7ff", get desc() { return t("perk.tile.speed.desc"); } },
  { get name() { return t("perk.tile.hp.name"); },    icon: "H", color: "#73e58f", get desc() { return t("perk.tile.hp.desc"); } },
  { get name() { return t("perk.tile.armor.name"); }, icon: "A", color: "#b4d7ff", get desc() { return t("perk.tile.armor.desc"); } },
  { get name() { return t("perk.tile.boost.name"); }, icon: "⚡", color: "#ff4444", get desc() { return t("perk.tile.boost.desc"); } },
];

const GOLD_PERK_TYPES = [
  null,
  null,
  null,
  null,
  null,
  { get name() { return t("perk.gold.contour_charge.name"); },     icon: "⬡" },
  { get name() { return t("perk.gold.empty_boost.name"); },         icon: "⏚" },
  { get name() { return t("perk.gold.sapper_charge.name"); },       icon: "✦" },
  { get name() { return t("perk.gold.fuel_contour.name"); },        icon: "⛽" },
  { get name() { return t("perk.gold.vision_lens.name"); },         icon: "◉" },
  { get name() { return t("perk.gold.radar_module.name"); },        icon: "⌖" },
  { get name() { return t("perk.gold.ore_collector.name"); },       icon: "●" },
  null,
  { get name() { return t("perk.gold.overload.name"); },            icon: "⚡" },
  { get name() { return t("perk.gold.reinforced_hull.name"); },     icon: "✚" },
  { get name() { return t("perk.gold.adrenaline_overflow.name"); }, icon: "❤" },
  { get name() { return t("perk.gold.contour_trophy.name"); },      icon: "◈" },
  { get name() { return t("perk.gold.auto_contour.name"); },        icon: "◎" },
  { get name() { return t("perk.gold.crystal_catalyst.name"); },    icon: "✧" },
  { get name() { return t("perk.gold.spike_boost.name"); },         icon: "✹" },
  { get name() { return t("perk.gold.heat_charge.name"); },         icon: "☇" },
  { get name() { return t("perk.gold.thermal_expansion.name"); },   icon: "☍" },
  { get name() { return t("perk.gold.heat_sink.name"); },           icon: "⬢" },
  { get name() { return t("perk.gold.drill_heat.name"); },          icon: "❉" },
  { get name() { return t("perk.gold.cool_pulse.name"); },          icon: "⌁" },
  { get name() { return t("perk.gold.stun_dampers.name"); },        icon: "◍" },
  { get name() { return t("perk.gold.contour_resonance.name"); },   icon: "⟲" },
  { get name() { return t("perk.gold.cooling_rockets.name"); },     icon: "❄" },
  { get name() { return t("perk.gold.contour_recovery.name"); },    icon: "↺" },
  { get name() { return t("perk.gold.heat_rockets.name"); },        icon: "☄" },
  { get name() { return t("perk.gold.reinforced_tank.name"); },     icon: "◌" },
];

const CRYSTAL_TYPES = [
  null,
  { get name() { return t("crystal.red"); },    color: "#ff4747", glow: "rgba(255,71,71,0.24)" },
  { get name() { return t("crystal.yellow"); }, color: "#ffd166", glow: "rgba(255,209,102,0.22)" },
  { get name() { return t("crystal.light"); },  color: "#f2ede2", glow: "rgba(242,237,226,0.24)" },
  { get name() { return t("crystal.green"); },  color: "#73e58f", glow: "rgba(115,229,143,0.22)" },
  { get name() { return t("crystal.blue"); },   color: "#72b7ff", glow: "rgba(114,183,255,0.22)" },
];
const CRYSTAL_RED = 1;
const CRYSTAL_YELLOW = 2;
const CRYSTAL_LIGHT = 3;
const CRYSTAL_GREEN = 4;
const CRYSTAL_BLUE = 5;
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
  debugMapActive: false,
  debugMapCamera: { zoom: 1, x: 0, y: 0 },
  cutsceneModeActive: false,
  cutsceneLaunchesGame: false,
  cutscene: null,
  cutsceneControlsBound: false,
  coreReady: false,
  gameLoopRunning: false,
  worldSeed: 0,
  worldRandom: Math.random,
  timeAcc: 0,
  lastTs: 0,
  fps: 0,
  fpsHistory: [],
  hudBarFx: {
    hp: { ratio: 1, ghostRatio: 1, pulse: 0, deltaDir: 0, intensity: 0 },
    fuel: { ratio: 1, ghostRatio: 1, pulse: 0, deltaDir: 0, intensity: 0 },
    heat: { ratio: 0, ghostRatio: 0, pulse: 0, deltaDir: 0, intensity: 0 },
    xp: { ratio: 0, ghostRatio: 0, pulse: 0, deltaDir: 0, intensity: 0 },
  },
  lastFuelHudChangeKind: "active",
  fuel: START_FUEL,
  maxFuel: START_FUEL,
  hp: START_HP,
  maxHp: START_HP,
  heat: 0,
  maxHeat: MAX_HEAT,
  luck: 0,

  heatRate: 1,
  effectDurationRate: 1,
  concentration: 0,
  collapseBudgetMaxScale: 0,
  recipeCollapseDelayPercent: 0,
  fuelDrainRate: 1,
  fuelStarvationResistance: 0,
  armor: 0,
  stunDetonatorLevel: 0,
  stunReservoirLevel: 0,
  stunAfterburnerLevel: 0,
  breachMissileLevel: 0,
  fuelRocketLevel: 0,
  cryoRocketAccumulator: 0,
  cryoRocketThreshold: 0,
  cryoRocketCount: 0,
  beaconCatalystLevel: 0,
  levelCatalystLevel: 0,
  crystalGoldGain: 0,
  crystalXpGain: 0,
  crystalRedDrillGain: 0,
  crystalYellowExplosionGain: 0,
  crystalLightRadarSeconds: 0,
  crystalGreenHealGain: 0,
  crystalBlueSpeedGain: 0,
  depth: 0,
  gold: 0,
  unsafeGold: 0,
  goldBonusRemainder: 0,
  miningGoldBonusRemainder: 0,
  xp: 0,
  xpBonusRemainder: 0,
  level: 1,
  xpToNext: 40 * XP_INFLATION,
  levelRewardStep: 0,
  levelRewardQueue: [],
  levelUpModalOpen: false,
  goldParticles: [],
  xpParticles: [],
  drillSmokeParticles: [],
  baseFound: false,
  runTimeSec: 0,
  baseFoundRunTimeSec: 0,
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
  menuOpen: false,
  manualModalOpen: false,
  shopModalOpen: false,
  beaconActivationAnim: null, // { beacon, startTs, pendingAction, blueprintFlightCount, blueprintFlightFromX, blueprintFlightFromY }
  debugPerkMenuOpen: false,
  debugPerkSelection: "",
  generationEditorText: "",
  generationEditorStatus: "",
  generationEditorStatusTone: "",
  generationEditorFocused: false,
  generationEditorExpanded: false,
  debugMapRequestRender: null,
  debugMapGenerationPanelCollapsed: false,
  crystalRewardModalOpen: false,
  crystalRewardCloseReady: false,
  crystalRewardRevealStage: 0,
  crystalRewardAnimTimer: 0,
  crystalRewardShuffleTick: 0,
  crystalRewardPreviewPerks: [0, 0],
  crystalRewardPerks: [0, 0],
  crystalItemOfferOpen: false,
  crystalItemOfferGood: null,
  crystalItemOfferRarity: 1,
  crystalItemOfferAnimTimer: 0,
  crystalItemOfferRevealed: false,
  crystalItemOfferShuffleTick: 0,
  crystalItemOfferPreview: null,
  crystalItemOfferTitle: "",
  crystalCompleteAnimDelay: 0,
  crystalCompleteAnimRecipe: [],
  nextGoldPerkAt: GOLD_PERK_BASE_COST,
  goldPerkLevel: 0,
  perkChoices: [],
  pathTiles: [],
  perkZones: [],
  gasClouds: [],
  steamJets: [],
  boulders: [],
  blueprintCount: 0,
  blueprintChoiceOpen: false,
  blueprintChoiceMode: "category",
  blueprintChoiceCategories: [],
  blueprintChoicePendingBeacon: null,
  blueprintChoiceRemaining: 0,
  blueprintChoiceGrantSlot: true,
  blueprintChoiceReplaceBaseSlot: false,
  blueprintChoiceBenefitSubtitleKey: "",
  blueprintActivationCount: 0,
  // Safe/key system
  safes: [],
  heldKeyForSafe: -1,      // index of safe this key belongs to, -1 = no key
  keyBumpTime: 0,
  keyBumpDir: null,
  pickupRadarTimer: 0,     // seconds remaining for pickup radar pulse
  crystalLightRadarTimer: 0, // seconds remaining for temporary crystal radar after light crystal
  pickupRadarKind: null,   // "blueprint" or "key"
  pickupRadarTargetX: 0,
  pickupRadarTargetY: 0,
  wormNests: [],
  activeWorms: [],
  contourEnemy: null,
  beacons: [],
  beaconWires: [],
  beaconWireBreaks: [],
  collapseWarnings: [],
  pendingCollapseCount: 0,
  collapseBudget: COLLAPSE_BUDGET_INITIAL,
  pendingBeaconWireActivation: null,
  pendingBeaconWireActivationAt: 0,
  signalMovesLeft: 0,
  signalMovesMax: 0,
  signalPrevX: START_X,
  signalPrevY: START_Y,
  signalDirX: 0,
  signalDirY: -1,
  perkText: t("toast.none"),
  crystalRecipe: [],
  crystalCollected: [0, 0, 0, 0, 0, 0],
  crystalProgress: 0,
  recipesCompletedThisRun: 0,
  crystalStatusText: "",
  strikeSpeed: 0,
  drillPower: 0,
  goldBonus: 0,
  xpBonus: 0,
  fuelBonus: 0,
  overflowBomb: false,
  fuelEventDepth: 0,
  overflowTriggeredInEvent: false,
  resolvingOverflowBomb: false,
  overflowOverdriveTimer: 0,
  stunTimer: 0,
  stunDisplayDuration: 0,
  radarCrystalModule: false,
  navigatorMode: false,
  blueprintRadarMode: false,
  goldRadarMode: false,
  goldClustersCache: null,
  blocksBroken: 0,
  drillBrokenBlocks: 0,
  comboCount: 0,
  seekerPodTargetIndex: -1,
  seekerPodHitCount: 0,
  weakSpotChance: 0,
  weakSpotMult: 2,
  weakSpotPierce: 0,
  weakSpotChancePerLevel: 0,
  adrenalineLevel: 0,
  weakSpotFuelGain: 0,
  breachAfterburnerSeconds: 0,
  breachChainHitsOnTrigger: 0,
  breachChainEmpoweredHits: 0,
  breachPresenceChance: 0,
  overdriveBreachChance: 0,
  breachMissCool: 0,
  lowFuelWeakSpotChance: 0,
  luckAsWeakSpotChance: 0,
  breachThermostatLevel: 0,
  breachThermostatCharge: 0,
  pendingGuaranteedBreaches: 0,
  lastStrikeHitWeakSpot: false,
  insuranceLevel: 0,
  fuelConverterLevel: 0,
  contourLengthDamageLevel: 0,
  loopSpawnBonusChance: 0,
  contourResMultiplier: 1.15,
  loopPerkLevel: 0,
  lowFuelSpeedBonus: 0,
  lowFuelDamageBonus: 0,
  lowFuelStrikeSpeedApplied: 0,
  shardDrillLevel: 0,
  remoteBombLevel: 0,
  remoteBombInterval: 0,
  overhealOverdrive: false,
  overhealOverdriveDuration: 0,
  overhealDrillTimer: 0,
  overdriveElapsedForDetonation: 0,
  overdriveDisplayDuration: 0,
  idleTime: 0,
  idleAutoCloseTriggered: false,
  speedOfAutoClose: 0,
  damageBonus: 0,
  explosionPower: 0,
  explosionBonus: 0,
  explosionHeatTaken: 0,
  explosionRadiusBonus: 0,
  bonusFindChance: 0,
  autoClosePreview: null,
  autoClosePreviewReturnTimer: 0,
  autoClosePreviewFailed: false,
  crystalCatalystLevel: 0,
  spikeOverdriveLevel: 0,
  struckThisFrame: false,
  drillIdleFrame: false,
  heatCooldownTime: 0,
  coolingRocketLevel: 0,
  coolingRocketCharge: 0,
  pathTailFade: 0,
  pathTailGhost: null,
  contourResonanceFlashTimer: 0,
  loopPressureTimer: 0,
  loopPressureDisplayDuration: 0,
  loopPressureDrillPowerBonus: 0,
  contourBlastPressureTimer: 0,
  contourBlastPressureDisplayDuration: 0,
  contourBlastPressureExplosionBonus: 0,
  contourEnemyHpPerTileBonus: 0,
  contourEnemyRewardPerTileBonus: 0,
  contourEnemySpawnRateBonus: 0,
  drillPiercingCount: 0,
  drillPiercingDamage: 0,
  overhealSpindlePiercingGain: 0,
  overflowGovernorDrillGain: 0,
  drillDiagonalCount: 0,
  drillDiagonalDamage: 0,
  contourReturnFuelLevel: 0,
  maxContour: 12,
  contourOverloadBrokenBlocks: 0,
  heatOverloadRocketLevel: 0,
  tankBoostLevel: 0,
  levelUpFlash: 0,
  levelUpPulse: 0,
  levelUpModalDelay: 0,
  drillPowerPerLevel: 0,
  explosionPowerPerLevel: 0,
  fuelPerLevel: 0,
  strikeSpeedPerLevel: 0,
  healPerLevel: 0,
  goldBonusPerLevel: 0,
  activeToasts: [],
  toastQueue: [],
  toastQueueTimer: 0,
  toastDebounceMap: {},
  toastSeq: 0,
  debugAudioToastsEnabled: false,
  depthTitle: {
    text: "",
    time: 0,
  },
  currentDepthLevel: 1,
  damageFlash: 0,
  fatalErrorText: "",
  goldHitRect: null,
  hudInspectableRects: [],
  itemInspectModalOpen: false,
  itemInspectItems: [],
  itemInspectIndex: -1,
  sprites: null,
  effects: [],
  tileAnimations: [],
  tileAnimDest: new Set(),
  ...createGridStateBuffers(),
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
  const r = Math.max(0, Math.min(radius, width * 0.5, height * 0.5));
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

function getImpactSoundId(x, y) {
  const index = cellIndex(x, y);
  if (state.hazardMask[index] === HAZARD_TYPES.SPIKE) {
    return { id: "drill_strike_thorns", volume: 1 };
  }
  if (state.metalMask[index] || state.safeDoorMask[index] > 0) {
    return { id: "drill_strike_metal", volume: 1 };
  }
  if (state.goldOreMask[index]) {
    return { id: "drill_strike_ore", volume: 0.6 };
  }
  return { id: "drill_strike", volume: 0.6 };
}

function spawnImpactEffect(x, y, dirX, dirY, hardness) {
  const impactSound = getImpactSoundId(x, y);
  playSound(impactSound.id, { volume: impactSound.volume, pitch: 0.9 + Math.random() * 0.2 });
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
  playSound("block_break", { pitch: 0.85 + Math.random() * 0.3 });
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

function spawnBeaconWireDustEffect(x, y, progress = 0) {
  state.effects.push({
    kind: "wireDust",
    x,
    y,
    progress,
    time: 0.32,
    duration: 0.32,
    seed: (x * 48271 + y * 69621 + Math.round(progress * 1000)) % 1000,
  });
}

function spawnExplosionEffect(x, y, radius) {
  playSound("explosion");
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

function spawnWeakSpotHitEffect(x, y, dirX, dirY) {
  playSound("weak_spot_hit");
  state.effects.push({
    kind: "weakSpotHit",
    x, y, dirX, dirY,
    time: WEAK_SPOT_HIT_DURATION,
    duration: WEAK_SPOT_HIT_DURATION,
    seed: (x * 73417 + y * 53923 + Math.round(dirX * 10 + dirY * 100)) % 1000,
  });
}

function spawnXpPickupEffect(x, y, value) {
  playSound("xp_pickup", { volume: 0.6, pitch: 0.95 + Math.random() * 0.1 });
  state.effects.push({
    kind: "xpPickup",
    x, y, value,
    time: 0.88,
    duration: 0.88,
    seed: (x * 73417 + y * 53923 + value * 131) % 1000,
  });
}

function spawnGoldOreEffect(x, y, value) {
  playSound("gold_pickup", { volume: 0.7 });
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

function spawnMicroBonusRevealEffect(tileX, tileY, mType) {
  playSound("micro_bonus", { volume: 0.4 });
  state.effects.push({
    kind: "microReveal",
    x: tileX,
    y: tileY,
    mType,
    time: 0.38,
    duration: 0.38,
    seed: (tileX * 73417 + tileY * 53923) % 1000,
  });
}

function spawnLevelUpBurst(x, y) {
  playSound("level_up");
  state.effects.push({
    kind: "levelup",
    x, y,
    time: 0.9,
    duration: 0.9,
    seed: (x * 73417 + y * 53923) % 1000,
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

function spawnExperienceParticles(tileX, tileY, totalValue, options = {}) {
  if (totalValue <= 0) {
    return;
  }
  const showToast = options.showToast === true;
  const isBonusXp = options.isBonusXp === true;
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
      isBonusXp,
      showTotal: showToast && i === count - 1 ? totalValue : 0,
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

function getSeedFromUrl() {
  const urlSeed = new URLSearchParams(location.search).get("seed");
  if (urlSeed) {
    const n = Number(urlSeed) >>> 0;
    if (n) return n;
  }
  return null;
}

function newWorldSeed() {
  if (globalThis.crypto && typeof globalThis.crypto.getRandomValues === "function") {
    const buf = new Uint32Array(1);
    globalThis.crypto.getRandomValues(buf);
    return buf[0];
  }
  return ((Date.now() >>> 0) ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
}

function loadStoredGenerationConfig() {
  try {
    const raw = localStorage.getItem(GENERATION_CONFIG_STORAGE_KEY);
    if (!raw) {
      state.generationEditorText = JSON.stringify(getGenerationConfig(), null, 2);
      state.generationEditorStatus = "";
      state.generationEditorStatusTone = "";
      return;
    }
    const config = setGenerationConfig(JSON.parse(raw));
    state.generationEditorText = JSON.stringify(config, null, 2);
    state.generationEditorStatus = "Stored generation config loaded.";
    state.generationEditorStatusTone = "ok";
  } catch (error) {
    const resetConfig = resetGenerationConfig();
    clearStoredGenerationConfig();
    console.warn("Stored generation config was invalid and got reset:", error);
    state.generationEditorText = JSON.stringify(resetConfig, null, 2);
    state.generationEditorStatus = `Stored generation config was invalid and reset to defaults: ${error.message || error}`;
    state.generationEditorStatusTone = "error";
  }
}

function persistGenerationConfig(config) {
  localStorage.setItem(GENERATION_CONFIG_STORAGE_KEY, JSON.stringify(config));
}

function clearStoredGenerationConfig() {
  localStorage.removeItem(GENERATION_CONFIG_STORAGE_KEY);
}

const GENERATION_QUICK_FIELDS = [
  { label: "Height", source: "height", min: 8, step: 1 },
  { label: "Width", source: "width", min: 6, max: GRID_W - 2, step: 1 },
  { label: "Perk Zone Count", source: "rules.perkZones", min: 0, step: 1 },
  { label: "Dual Perk Zone Count", source: "rules.dualStatPerkZones", min: 0, step: 1 },
  { label: "Boulder Pocket Groups", source: "rules.boulderPocketGroups", min: 0, step: 1 },
  { label: "Safe Count", source: "rules.safes", min: 0, step: 1 },
  { label: "Worm Nest Count", source: "rules.wormNests", min: 0, step: 1 },
  { label: "Blueprint Count", source: "rules.blueprints", min: 0, step: 1 },
  { label: "Minimum Crystals", source: "rules.minCrystals", min: 0, step: 1 },
  { label: "Maximum Crystals", source: "rules.maxCrystals", min: 0, step: 1 },
  { label: "Hardness Bias", source: "rules.hardnessBias", min: -5, max: 5, step: 0.1, defaultValue: 0 },
  { label: "Hardness Depth Scale", source: "rules.hardnessDepthScale", min: 0, max: 10, step: 0.1, defaultValue: 4.9 },
  { label: "Hardness Local Scale", source: "rules.hardnessLocalScale", min: 0, max: 5, step: 0.1, defaultValue: 1.2 },
];
const GENERATION_QUICK_FIELD_BY_SOURCE = new Map(GENERATION_QUICK_FIELDS.map((field) => [field.source, field]));

const GENERATION_TRIPLET_FIELDS = [
  { label: "Thorn Blob", source: "rules.thornBlob" },
  { label: "Thorn Vein", source: "rules.thornVein" },
  { label: "Bomb Blob", source: "rules.bombBlob" },
  { label: "Bomb Vein", source: "rules.bombVein" },
  { label: "Metal Vein", source: "rules.metalVein" },
  { label: "Gold Ore", source: "rules.goldOre" },
  { label: "Gas Pocket", source: "rules.gasPocket" },
  { label: "Steam Pocket", source: "rules.steamPocket" },
];

function setGenerationEditingActive(active, statusText = "") {
  state.generationEditorFocused = active;
  state.timeAcc = 0;
  if (statusText) {
    state.generationEditorStatus = statusText;
    state.generationEditorStatusTone = "ok";
    syncGenerationStatusOnly();
  }
}

function syncGenerationPauseState(statusText = "") {
  state.timeAcc = 0;
  if (statusText) {
    state.generationEditorStatus = statusText;
    state.generationEditorStatusTone = "ok";
    syncGenerationStatusOnly();
  }
}

function syncGenerationStatusOnly() {
  const status = document.getElementById("debugGenStatus");
  if (!status) {
    return;
  }
  status.textContent = state.generationEditorStatus || `Current seed: ${state.worldSeed}. Apply regenerates the same seed with the edited config.`;
  if (state.generationEditorStatusTone) {
    status.dataset.tone = state.generationEditorStatusTone;
  } else {
    delete status.dataset.tone;
  }
}

function isGenerationEditorVisible() {
  const overlay = document.getElementById("debugPerkMenu");
  const section = document.getElementById("debugGenerationSection");
  if (!overlay || !section) {
    return false;
  }
  if (overlay.hidden || section.hidden) {
    return false;
  }
  if (overlay.style.display === "none" || overlay.style.visibility === "hidden") {
    return false;
  }
  return true;
}

function getValueByPath(target, source) {
  const parts = source.split(".");
  let current = target;
  for (let i = 0; i < parts.length; i += 1) {
    current = current?.[parts[i]];
  }
  return current;
}

function setValueByPath(target, source, value) {
  const parts = source.split(".");
  let current = target;
  for (let i = 0; i < parts.length - 1; i += 1) {
    if (!current[parts[i]] || typeof current[parts[i]] !== "object") {
      current[parts[i]] = {};
    }
    current = current[parts[i]];
  }
  current[parts[parts.length - 1]] = value;
}

function getTripletValue(target, source, index) {
  const value = getValueByPath(target, source);
  if (!Array.isArray(value)) {
    return 0;
  }
  return Number.isFinite(Number(value[index])) ? Math.round(Number(value[index])) : 0;
}

function setTripletValue(target, source, index, nextValue) {
  const value = getValueByPath(target, source);
  const triplet = Array.isArray(value) ? [...value] : [0, 0, 0];
  triplet[index] = nextValue;
  setValueByPath(target, source, triplet);
}

function tryCopyText(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.cssText = "position:fixed;top:0;left:0;opacity:0;font-size:16px";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  textarea.setSelectionRange(0, text.length);
  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }
  document.body.removeChild(textarea);
  return copied;
}

function tryParseGenerationEditorText() {
  try {
    return JSON.parse(state.generationEditorText || "[]");
  } catch {
    return null;
  }
}

function getGenerationQuickFieldValue(level, field) {
  const raw = getValueByPath(level, field.source);
  const numeric = Number(raw);
  if (Number.isFinite(numeric)) {
    return numeric;
  }
  return Number.isFinite(Number(field.defaultValue)) ? Number(field.defaultValue) : 0;
}

function formatGenerationQuickFieldValue(field, value) {
  const step = Number(field?.step ?? 1);
  if (step > 0 && step < 1) {
    const decimals = Math.min(4, Math.max(1, String(step).split(".")[1]?.length || 1));
    return Number(value).toFixed(decimals).replace(/\.?0+$/, "");
  }
  return String(Math.round(Number(value)));
}

function renderGenerationQuickEditor() {
  const root = document.getElementById("debugGenerationQuickEditor");
  if (!root) {
    return;
  }
  const config = tryParseGenerationEditorText() || getGenerationConfig();
  if (!Array.isArray(config) || config.length === 0) {
    root.innerHTML = "";
    return;
  }
  const totalHeight = config.reduce((sum, level) => sum + (Math.round(Number(level.height)) || 0), 0);
  const hostBaseCount = config.filter((level) => !!level.canHostBase).length;
  const prevOpenStates = Array.from(
    root.querySelectorAll(".debug-generation__level")
  ).map((el) => el.open);
  root.innerHTML = "";

  const summary = document.createElement("div");
  summary.className = "debug-generation__summary";
  summary.innerHTML = [
    `<div class="debug-generation__pill">Levels: ${config.length}</div>`,
    `<div class="debug-generation__pill">Total height: ${totalHeight}</div>`,
    `<div class="debug-generation__pill">Base hosts: ${hostBaseCount}</div>`,
  ].join("");
  root.appendChild(summary);

  const levels = document.createElement("div");
  levels.className = "debug-generation__levels";
  for (let i = 0; i < config.length; i += 1) {
    const level = config[i];
    const card = document.createElement("details");
    card.className = "debug-generation__level";
    if (i < prevOpenStates.length ? prevOpenStates[i] : i === 0) {
      card.open = true;
    }
    const beacons = Number(level?.rules?.beacons) || 0;
    const hidden = Number(level?.rules?.hiddenBeacons) || 0;
    const upper = Number(level?.rules?.upperBeacons) || 0;
    const lower = Number(level?.rules?.lowerBeacons) || 0;
    const prevLevel = i > 0 ? config[i - 1] : null;
    const ph = (val) => val !== null && val !== undefined ? `<span class="debug-generation__field-prev">${val}</span>` : "";
    const prevBeacons = prevLevel ? Number(prevLevel?.rules?.beacons) || 0 : null;
    const prevHidden = prevLevel ? Number(prevLevel?.rules?.hiddenBeacons) || 0 : null;
    const prevUpper = prevLevel ? Number(prevLevel?.rules?.upperBeacons) || 0 : null;
    const prevLower = prevLevel ? Number(prevLevel?.rules?.lowerBeacons) || 0 : null;
    card.innerHTML = `
      <summary class="debug-generation__level-summary">
        <div class="debug-generation__level-header">
          <div class="debug-generation__level-title">Level ${i + 1}</div>
          <div class="debug-generation__level-meta">Beacon split: hidden ${hidden}, upper ${upper}, lower ${lower}, flexible ${Math.max(0, beacons - upper - lower)}</div>
          <button class="debug-generation__level-delete" data-action="delete-level" data-level-index="${i}" title="Delete level">✕</button>
        </div>
      </summary>
      <div class="debug-generation__level-body">
        <label class="debug-generation__level-meta">
          <input type="checkbox" data-level-index="${i}" data-source="canHostBase" ${level.canHostBase ? "checked" : ""}>
          Base host
        </label>
        <div class="debug-generation__grid"></div>
        <div class="debug-generation__triplet">
          <div class="debug-generation__triplet-title">Beacon Placement</div>
          <div class="debug-generation__triplet-grid">
            <label class="debug-generation__field">
              <span class="debug-generation__field-label">Beacon Count${ph(prevBeacons)}</span>
              <input
                class="debug-generation__field-input"
                type="number"
                inputmode="numeric"
                data-level-index="${i}"
                data-source="rules.beacons"
                min="0"
                step="1"
                value="${beacons}"
              >
            </label>
            <label class="debug-generation__field">
              <span class="debug-generation__field-label">Hidden Beacons${ph(prevHidden)}</span>
              <input
                class="debug-generation__field-input"
                type="number"
                inputmode="numeric"
                data-level-index="${i}"
                data-source="rules.hiddenBeacons"
                min="0"
                step="1"
                value="${hidden}"
              >
            </label>
            <label class="debug-generation__field">
              <span class="debug-generation__field-label">Upper Beacons${ph(prevUpper)}</span>
              <input
                class="debug-generation__field-input"
                type="number"
                inputmode="numeric"
                data-level-index="${i}"
                data-source="rules.upperBeacons"
                min="0"
                step="1"
                value="${upper}"
              >
            </label>
            <label class="debug-generation__field">
              <span class="debug-generation__field-label">Lower Beacons${ph(prevLower)}</span>
              <input
                class="debug-generation__field-input"
                type="number"
                inputmode="numeric"
                data-level-index="${i}"
                data-source="rules.lowerBeacons"
                min="0"
                step="1"
                value="${lower}"
              >
            </label>
          </div>
        </div>
        <div class="debug-generation__triplets"></div>
      </div>
    `;
    const grid = card.querySelector(".debug-generation__grid");
    const triplets = card.querySelector(".debug-generation__triplets");
    for (let j = 0; j < GENERATION_QUICK_FIELDS.length; j += 1) {
      const field = GENERATION_QUICK_FIELDS[j];
      const fieldWrap = document.createElement("label");
      fieldWrap.className = "debug-generation__field";
      const value = getGenerationQuickFieldValue(level, field);
      const prevValue = prevLevel !== null ? getGenerationQuickFieldValue(prevLevel, field) : null;
      const prevValueFmt = prevValue !== null ? formatGenerationQuickFieldValue(field, prevValue) : null;
      fieldWrap.innerHTML = `
        <span class="debug-generation__field-label">${field.label}${ph(prevValueFmt)}</span>
        <input
          class="debug-generation__field-input"
          type="number"
          inputmode="numeric"
          data-level-index="${i}"
          data-source="${field.source}"
          min="${field.min ?? 0}"
          ${field.max !== undefined ? `max="${field.max}"` : ""}
          step="${field.step ?? 1}"
          value="${formatGenerationQuickFieldValue(field, value)}"
        >
      `;
      grid?.appendChild(fieldWrap);
    }
    for (let j = 0; j < GENERATION_TRIPLET_FIELDS.length; j += 1) {
      const field = GENERATION_TRIPLET_FIELDS[j];
      const wrap = document.createElement("div");
      wrap.className = "debug-generation__triplet";
      const pt0 = prevLevel !== null ? getTripletValue(prevLevel, field.source, 0) : null;
      const pt1 = prevLevel !== null ? getTripletValue(prevLevel, field.source, 1) : null;
      const pt2 = prevLevel !== null ? getTripletValue(prevLevel, field.source, 2) : null;
      wrap.innerHTML = `
        <div class="debug-generation__triplet-title">${field.label}</div>
        <div class="debug-generation__triplet-grid">
          <label class="debug-generation__field">
            <span class="debug-generation__field-label">Groups${ph(pt0)}</span>
            <input
              class="debug-generation__field-input"
              type="number"
              inputmode="numeric"
              data-level-index="${i}"
              data-source="${field.source}"
              data-triplet-index="0"
              min="0"
              step="1"
              value="${getTripletValue(level, field.source, 0)}"
            >
          </label>
          <label class="debug-generation__field">
            <span class="debug-generation__field-label">Min${ph(pt1)}</span>
            <input
              class="debug-generation__field-input"
              type="number"
              inputmode="numeric"
              data-level-index="${i}"
              data-source="${field.source}"
              data-triplet-index="1"
              min="0"
              step="1"
              value="${getTripletValue(level, field.source, 1)}"
            >
          </label>
          <label class="debug-generation__field">
            <span class="debug-generation__field-label">Max${ph(pt2)}</span>
            <input
              class="debug-generation__field-input"
              type="number"
              inputmode="numeric"
              data-level-index="${i}"
              data-source="${field.source}"
              data-triplet-index="2"
              min="0"
              step="1"
              value="${getTripletValue(level, field.source, 2)}"
            >
          </label>
        </div>
      `;
      triplets?.appendChild(wrap);
    }
    levels.appendChild(card);
  }
  root.appendChild(levels);

  const addBtn = document.createElement("button");
  addBtn.className = "debug-generation__add-level";
  addBtn.dataset.action = "add-level";
  addBtn.textContent = "+ Add level";
  root.appendChild(addBtn);
}

function bindGenerationDebugControls() {
  const debugGenerationSection = document.getElementById("debugGenerationSection");
  if (debugGenerationSection) {
    debugGenerationSection.hidden = !DEBUG_MODE;
  }

  const debugGenerationEditor = document.getElementById("debugGenerationEditor");
  if (debugGenerationEditor && !debugGenerationEditor.dataset.bound) {
    debugGenerationEditor.value = state.generationEditorText || JSON.stringify(getGenerationConfig(), null, 2);
    debugGenerationEditor.addEventListener("input", () => {
      state.generationEditorText = debugGenerationEditor.value;
      state.generationEditorStatus = "Generation config edited but not applied.";
      state.generationEditorStatusTone = "";
      syncGenerationDebugEditor();
    });
    debugGenerationEditor.addEventListener("focus", () => {
      setGenerationEditingActive(true, "Editing mode: simulation paused to reduce heat and battery drain.");
    });
    debugGenerationEditor.addEventListener("blur", () => {
      setGenerationEditingActive(false, state.generationEditorExpanded ? "Advanced JSON open: simulation remains paused." : "Editing finished. Simulation resumed.");
    });
    debugGenerationEditor.dataset.bound = "1";
  }

  const debugGenerationAdvanced = document.getElementById("debugGenerationAdvanced");
  if (debugGenerationAdvanced && !debugGenerationAdvanced.dataset.bound) {
    state.generationEditorExpanded = debugGenerationAdvanced.open;
    debugGenerationAdvanced.addEventListener("toggle", () => {
      state.generationEditorExpanded = debugGenerationAdvanced.open;
      syncGenerationPauseState(
        debugGenerationAdvanced.open
          ? "Advanced JSON open: simulation paused to reduce heat and battery drain."
          : (document.activeElement?.id === "debugGenerationEditor"
              ? "Editing mode: simulation paused to reduce heat and battery drain."
              : "Advanced JSON closed. Simulation resumed.")
      );
    });
    debugGenerationAdvanced.dataset.bound = "1";
  }

  const debugGenerationQuickEditor = document.getElementById("debugGenerationQuickEditor");
  if (debugGenerationQuickEditor && !debugGenerationQuickEditor.dataset.bound) {
    debugGenerationQuickEditor.addEventListener("input", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement)) {
        return;
      }
      const levelIndex = Number(target.dataset.levelIndex);
      const source = target.dataset.source || "";
      const config = tryParseGenerationEditorText() || getGenerationConfig();
      if (!Array.isArray(config) || !config[levelIndex] || !source) {
        return;
      }
      if (target.type === "checkbox") {
        setValueByPath(config[levelIndex], source, target.checked);
      } else {
        const field = GENERATION_QUICK_FIELD_BY_SOURCE.get(source);
        const parsed = Number(target.value);
        const isDecimalField = !!field && Number(field.step) > 0 && Number(field.step) < 1;
        const nextValue = isDecimalField ? parsed : Math.round(parsed);
        if (!Number.isFinite(nextValue)) {
          return;
        }
        const tripletIndex = Number(target.dataset.tripletIndex);
        if (Number.isFinite(tripletIndex)) {
          setTripletValue(config[levelIndex], source, tripletIndex, nextValue);
        } else {
          setValueByPath(config[levelIndex], source, nextValue);
        }
      }
      state.generationEditorText = JSON.stringify(config, null, 2);
      state.generationEditorStatus = "Generation config edited but not applied.";
      state.generationEditorStatusTone = "";
      syncGenerationDebugEditor();
    });
    debugGenerationQuickEditor.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLButtonElement)) return;
      const action = target.dataset.action;
      if (action === "delete-level") {
        event.preventDefault();
        const levelIndex = Number(target.dataset.levelIndex);
        const config = tryParseGenerationEditorText() || getGenerationConfig();
        if (!Array.isArray(config) || config.length <= 1) return;
        config.splice(levelIndex, 1);
        config.forEach((l, idx) => { l.id = idx + 1; });
        state.generationEditorText = JSON.stringify(config, null, 2);
        state.generationEditorStatus = "Level deleted.";
        state.generationEditorStatusTone = "";
        syncGenerationDebugEditor();
      } else if (action === "add-level") {
        const config = tryParseGenerationEditorText() || getGenerationConfig();
        if (!Array.isArray(config) || config.length === 0) return;
        const last = config[config.length - 1];
        const newLevel = JSON.parse(JSON.stringify(last));
        newLevel.id = config.length + 1;
        config.push(newLevel);
        state.generationEditorText = JSON.stringify(config, null, 2);
        state.generationEditorStatus = "Level added.";
        state.generationEditorStatusTone = "";
        syncGenerationDebugEditor();
      }
    });
    debugGenerationQuickEditor.addEventListener("focusin", () => {
      setGenerationEditingActive(true, "Editing mode: simulation paused to reduce heat and battery drain.");
    });
    debugGenerationQuickEditor.addEventListener("focusout", () => {
      requestAnimationFrame(() => {
        const root = document.getElementById("debugGenerationQuickEditor");
        if (root?.contains(document.activeElement)) {
          return;
        }
        setGenerationEditingActive(false, "Editing finished. Simulation resumed.");
      });
    });
    debugGenerationQuickEditor.dataset.bound = "1";
  }

  const debugGenApply = document.getElementById("debugGenApply");
  if (debugGenApply && !debugGenApply.dataset.bound) {
    debugGenApply.addEventListener("click", () => {
      try {
        const nextConfig = JSON.parse(document.getElementById("debugGenerationEditor")?.value || "[]");
        const appliedConfig = setGenerationConfig(nextConfig);
        persistGenerationConfig(appliedConfig);
        state.generationEditorText = JSON.stringify(appliedConfig, null, 2);
        state.generationEditorStatus = "Generation config applied. Current seed regenerated.";
        state.generationEditorStatusTone = "ok";
        regenerateCurrentSeed(true);
      } catch (error) {
        state.generationEditorStatus = `Apply failed: ${error.message || error}`;
        state.generationEditorStatusTone = "error";
        syncGenerationDebugEditor();
      }
    });
    debugGenApply.dataset.bound = "1";
  }

  const debugGenReset = document.getElementById("debugGenReset");
  if (debugGenReset && !debugGenReset.dataset.bound) {
    debugGenReset.addEventListener("click", () => {
      const resetConfig = resetGenerationConfig();
      clearStoredGenerationConfig();
      state.generationEditorText = JSON.stringify(resetConfig, null, 2);
      state.generationEditorStatus = "Generation config reset to defaults. Current seed regenerated.";
      state.generationEditorStatusTone = "ok";
      regenerateCurrentSeed(true);
    });
    debugGenReset.dataset.bound = "1";
  }

  const debugGenRandomSeed = document.getElementById("debugGenRandomSeed");
  if (debugGenRandomSeed && !debugGenRandomSeed.dataset.bound) {
    debugGenRandomSeed.addEventListener("click", () => {
      const nextSeed = newWorldSeed();
      state.worldSeed = nextSeed;
      state.generationEditorStatus = `Random seed generated: ${nextSeed}.`;
      state.generationEditorStatusTone = "ok";
      regenerateCurrentSeed(true);
    });
    debugGenRandomSeed.dataset.bound = "1";
  }

  const debugGenCopyJson = document.getElementById("debugGenCopyJson");
  if (debugGenCopyJson && !debugGenCopyJson.dataset.bound) {
    debugGenCopyJson.addEventListener("click", () => {
      const text = state.generationEditorText || JSON.stringify(getGenerationConfig(), null, 2);
      const editor = document.getElementById("debugGenerationEditor");
      const advanced = document.getElementById("debugGenerationAdvanced");
      const onCopySuccess = () => {
        state.generationEditorStatus = "Generation JSON copied to clipboard.";
        state.generationEditorStatusTone = "ok";
        syncGenerationDebugEditor();
      };
      const onCopyFailure = (error = null) => {
        if (tryCopyText(text)) {
          state.generationEditorStatus = "Generation JSON copied to clipboard.";
          state.generationEditorStatusTone = "ok";
        } else {
          state.generationEditorText = text;
          if (advanced) {
            advanced.open = true;
          }
          requestAnimationFrame(() => {
            editor?.focus({ preventScroll: false });
            editor?.select();
            editor?.setSelectionRange(0, text.length);
          });
          state.generationEditorStatus = error
            ? `Copy failed: ${error.message || error}. Advanced JSON selected for manual copy.`
            : "Clipboard copy failed. Advanced JSON selected for manual copy.";
          state.generationEditorStatusTone = "error";
        }
        syncGenerationDebugEditor();
      };
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).then(onCopySuccess).catch(onCopyFailure);
      } else {
        onCopyFailure();
      }
    });
    debugGenCopyJson.dataset.bound = "1";
  }

}

function syncDebugMapGenerationPanelCollapse() {
  const overlay = document.getElementById("debugPerkMenu");
  const panel = overlay?.querySelector(".debug-perk-menu__panel");
  const generationSection = document.getElementById("debugGenerationSection");
  const closeButton = document.getElementById("debugPerkClose");
  if (!overlay || !panel || !generationSection || !closeButton || !DEBUG_MODE) {
    return;
  }

  generationSection.hidden = state.debugMapGenerationPanelCollapsed;
  closeButton.textContent = state.debugMapGenerationPanelCollapsed ? t("ui.expand") : t("ui.collapse");
  panel.style.width = state.debugMapGenerationPanelCollapsed
    ? "min(320px, calc(100vw - 24px))"
    : "min(560px, calc(100vw - 24px))";
}

function showDebugMapGenerationPanel() {
  const overlay = document.getElementById("debugPerkMenu");
  const panel = overlay?.querySelector(".debug-perk-menu__panel");
  const seedDisplay = document.getElementById("debugSeedDisplay");
  const subtitle = overlay?.querySelector(".debug-perk-menu__subtitle");
  const closeButton = document.getElementById("debugPerkClose");
  if (!overlay || !panel) {
    return;
  }

  overlay.hidden = false;
  overlay.removeAttribute("hidden");
  overlay.style.cssText = [
    "position:fixed",
    "top:12px",
    "left:12px",
    "right:auto",
    "bottom:auto",
    "z-index:150",
    "display:block",
    "visibility:visible",
    "pointer-events:auto",
    "opacity:1",
    "padding:0",
    "background:none",
    "backdrop-filter:none",
  ].join(";");
  panel.style.maxWidth = "min(560px, calc(100vw - 24px))";
  panel.style.maxHeight = "calc(100dvh - 24px)";
  panel.style.overflowY = "auto";
  panel.style.webkitOverflowScrolling = "touch";

  overlay.querySelectorAll(".debug-perk-menu__section").forEach((section) => {
    section.hidden = section.id !== "debugGenerationSection";
  });
  if (subtitle) {
    subtitle.textContent = "Generation config editor";
  }
  if (seedDisplay) {
    seedDisplay.textContent = `Seed: ${state.worldSeed}`;
  }
  if (closeButton) {
    closeButton.hidden = false;
    closeButton.textContent = state.debugMapGenerationPanelCollapsed ? t("ui.expand") : t("ui.collapse");
    if (!closeButton.dataset.boundDebugMapToggle) {
      closeButton.addEventListener("click", () => {
        state.debugMapGenerationPanelCollapsed = !state.debugMapGenerationPanelCollapsed;
        syncDebugMapGenerationPanelCollapse();
      });
      closeButton.dataset.boundDebugMapToggle = "1";
    }
  }
  bindGenerationDebugControls();
  syncGenerationDebugEditor();
  syncDebugMapGenerationPanelCollapse();
}

function revealFullMapInDebugMode() {
  if (!state.debugMapActive) {
    return;
  }
  state.visibleAlpha.fill(1);
  state.visibleMask.fill(1);
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
  const stunPenalty = state.stunTimer > 0 ? 3 : 1;
  return (baseDrain + tankPenalty) * Math.max(0, state.fuelDrainRate) * stunPenalty;
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
  return Math.round(70 * getTankFuelMultiplier());
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
  playSound("gas_release");
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
  playSound("steam_burst");
}

function setupField(seedOverride = null) {
  ensureGridBuffers();
  state.drill.x = START_X;
  state.drill.y = START_Y;
  state.drill.renderX = START_X;
  state.drill.renderY = START_Y;
  state.drill.animFromX = START_X;
  state.drill.animFromY = START_Y;
  state.drill.animToX = START_X;
  state.drill.animToY = START_Y;
  state.drill.facingX = 0;
  state.drill.facingY = 1;
  state.pathIndexByCell.fill(-1);
  state.perkMask.fill(0);
  state.crystalMask.fill(0);
  state.perkZoneMask.fill(-1);
  state.gasMask.fill(0);
  state.steamMask.fill(0);
  state.loopGoldMask.fill(0);
  state.droppedGoldMask.fill(0);
  state.xpPickupMask.fill(0);
  state.xpBonusPickupMask.fill(0);
  state.goldPickupMask.fill(0);
  state.goldBonusPickupMask.fill(0);
  state.hazardTriggeredMask.fill(0);
  state.metalMask.fill(0);
  state.goldOreMask.fill(0);
  state.microResourceMask.fill(0);
  state.microResourceRevealedMask.fill(0);
  state.visibleMask.fill(0);
  state.gasPocketMask.fill(0);
  state.steamPocketMask.fill(0);
  state.boulderPocketMask.fill(0);
  state.beaconMask.fill(0);
  state.blueprintMask.fill(0);
  state.blueprintCount = 0;
  state.blueprintChoiceOpen = false;
  state.blueprintChoiceMode = "category";
  state.blueprintChoiceCategories = [];
  state.blueprintChoicePendingBeacon = null;
  state.blueprintChoiceRemaining = 0;
  state.blueprintChoiceGrantSlot = true;
  state.blueprintChoiceReplaceBaseSlot = false;
  state.blueprintChoiceBenefitSubtitleKey = "";
  state.blueprintActivationCount = 0;
  resetShopState();
  state.safes.length = 0;
  state.wormNests.length = 0;
  state.activeWorms.length = 0;
  state.contourEnemy = null;
  state.safeDoorMask.fill(0);
  state.keyMask.fill(0);
  state.safeInteriorMask.fill(0);
  state.heldKeyForSafe = -1;
  state.keyBumpTime = 0;
  state.keyBumpDir = null;
  state.beacons.length = 0;
  state.beaconWires = [];
  state.beaconWireBreaks.length = 0;
  state.pendingBeaconWireActivation = null;
  state.pendingBeaconWireActivationAt = 0;
  state.perkZones.length = 0;
  state.gasClouds.length = 0;
  state.steamJets.length = 0;
  state.boulders.length = 0;
  state.baseFound = false;
  state.runTimeSec = 0;
  state.baseFoundRunTimeSec = 0;
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
  state.luck = 0;

  state.heatRate = 1;
  state.effectDurationRate = 1;
  state.concentration = 0;
  state.collapseBudgetMaxScale = 0;
  state.recipeCollapseDelayPercent = 0;
  state.fuelDrainRate = 1;
  state.fuelStarvationResistance = 0;
  state.armor = 0;
  state.stunDetonatorLevel = 0;
  state.stunReservoirLevel = 0;
  state.stunAfterburnerLevel = 0;
  state.breachMissileLevel = 0;
  state.fuelRocketLevel = 0;
  state.cryoRocketAccumulator = 0;
  state.cryoRocketThreshold = 0;
  state.cryoRocketCount = 0;
  state.beaconCatalystLevel = 0;
  state.levelCatalystLevel = 0;
  state.crystalGoldGain = 0;
  state.crystalXpGain = 0;
  state.crystalRedDrillGain = 0;
  state.crystalYellowExplosionGain = 0;
  state.crystalLightRadarSeconds = 0;
  state.crystalGreenHealGain = 0;
  state.crystalBlueSpeedGain = 0;
  state.gold = 0;
  state.unsafeGold = 0;
  state.goldBonusRemainder = 0;
  state.miningGoldBonusRemainder = 0;
  state.xp = 0;
  state.xpBonusRemainder = 0;
  state.level = 1;
  state.xpToNext = getXpNeededForLevel(state.level);
  state.levelRewardStep = 0;
  state.levelRewardQueue = [];
  state.levelUpModalOpen = false;
  state.depth = 0;
  state.perkText = t("toast.none");
  state.crystalRecipe = [];
  state.crystalCollected = [0, 0, 0, 0, 0, 0];
  state.crystalProgress = 0;
  state.recipesCompletedThisRun = 0;
  state.crystalStatusText = "";
  state.isChoosingPerk = false;
  state.pendingPerkChoice = false;
  state.pendingPerkDelay = 0;
  state.bonusPerkChoices = 0;
  state.perkRerolls = 2;
  state.menuOpen = false;
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
  state.crystalItemOfferOpen = false;
  state.crystalItemOfferGood = null;
  state.crystalItemOfferRarity = 1;
  state.crystalItemOfferAnimTimer = 0;
  state.crystalItemOfferRevealed = false;
  state.crystalItemOfferShuffleTick = 0;
  state.crystalItemOfferPreview = null;
  state.crystalItemOfferTitle = t("ui.recipe_complete");
  state.crystalCompleteAnimDelay = 0;
  state.crystalCompleteAnimRecipe = [];
  state.nextGoldPerkAt = GOLD_PERK_BASE_COST;
  state.goldPerkLevel = 0;
  state.perkChoices = [];
  state.signalMovesLeft = 0;
  state.signalMovesMax = 0;
  state.signalPrevX = START_X;
  state.signalPrevY = START_Y;
  state.signalDirX = 0;
  state.signalDirY = -1;
  state.crystalLightRadarTimer = 0;
  state.collapseWarnings.length = 0;
  state.pendingCollapseCount = 0;
  state.collapseBudget = getCollapseBudgetMaxPoints();
  state.contourEnemyBudget = CONTOUR_ENEMY_BUDGET_INITIAL;
  state.hudBarFx.hp = { ratio: 1, ghostRatio: 1, pulse: 0, deltaDir: 0, intensity: 0 };
  state.hudBarFx.fuel = { ratio: 1, ghostRatio: 1, pulse: 0, deltaDir: 0, intensity: 0 };
  state.hudBarFx.heat = { ratio: 0, ghostRatio: 0, pulse: 0, deltaDir: 0, intensity: 0 };
  state.hudBarFx.xp = { ratio: 0, ghostRatio: 0, pulse: 0, deltaDir: 0, intensity: 0 };
  state.lastFuelHudChangeKind = "active";
  state.strikeSpeed = 0;
  state.drillPower = 0;
  state.goldBonus = 0;
  state.xpBonus = 0;
  state.fuelBonus = 0;
  state.overflowBomb = false;
  state.fuelEventDepth = 0;
  state.overflowTriggeredInEvent = false;
  state.resolvingOverflowBomb = false;
  state.overflowOverdriveTimer = 0;
  state.stunTimer = 0;
  state.stunDisplayDuration = 0;
  state.radarCrystalModule = false;
  state.navigatorMode = false;
  state.blueprintRadarMode = false;
  state.goldRadarMode = false;
  state.goldClustersCache = null;
  state.blocksBroken = 0;
  state.drillBrokenBlocks = 0;
  state.comboCount = 0;
  state.seekerPodTargetIndex = -1;
  state.seekerPodHitCount = 0;
  state.weakSpotChance = 0;
  state.weakSpotMult = 2;
  state.weakSpotPierce = 0;
  state.weakSpotChancePerLevel = 0;
  state.adrenalineLevel = 0;
  state.weakSpotFuelGain = 0;
  state.breachAfterburnerSeconds = 0;
  state.breachChainHitsOnTrigger = 0;
  state.breachChainEmpoweredHits = 0;
  state.breachPresenceChance = 0;
  state.overdriveBreachChance = 0;
  state.breachMissCool = 0;
  state.lowFuelWeakSpotChance = 0;
  state.luckAsWeakSpotChance = 0;
  state.breachThermostatLevel = 0;
  state.breachThermostatCharge = 0;
  state.pendingGuaranteedBreaches = 0;
  state.lastStrikeHitWeakSpot = false;
  state.insuranceLevel = 0;
  state.fuelConverterLevel = 0;
  state.weakSpotMask.fill(0);
  state.contourLengthDamageLevel = 0;
  state.loopSpawnBonusChance = 0;
  state.contourResMultiplier = 1.15;
  state.loopPerkLevel = 0;
  state.lowFuelSpeedBonus = 0;
  state.lowFuelDamageBonus = 0;
  state.lowFuelStrikeSpeedApplied = 0;
  state.shardDrillLevel = 0;
  state.remoteBombLevel = 0;
  state.remoteBombInterval = 0;
  state.overhealOverdrive = false;
  state.overhealOverdriveDuration = 0;
  state.overhealDrillTimer = 0;
  state.overdriveElapsedForDetonation = 0;
  state.overdriveDisplayDuration = 0;
  state.idleTime = 0;
  state.idleAutoCloseTriggered = false;
  state.speedOfAutoClose = 0;
  state.damageBonus = 0;
  state.explosionPower = 0;
  state.explosionBonus = 0;
  state.explosionHeatTaken = 0;
  state.explosionRadiusBonus = 0;
  state.bonusFindChance = 0;
  state.autoClosePreview = null;
  state.autoClosePreviewReturnTimer = 0;
  state.autoClosePreviewFailed = false;
  state.crystalCatalystLevel = 0;
  state.spikeOverdriveLevel = 0;
  state.struckThisFrame = false;
  state.drillIdleFrame = false;
  state.heatCooldownTime = 0;
  state.coolingRocketLevel = 0;
  state.coolingRocketCharge = 0;
  state.pathTailFade = 0;
  state.pathTailGhost = null;
  state.contourResonanceFlashTimer = 0;
  state.loopPressureTimer = 0;
  state.loopPressureDisplayDuration = 0;
  state.loopPressureDrillPowerBonus = 0;
  state.contourBlastPressureTimer = 0;
  state.contourBlastPressureDisplayDuration = 0;
  state.contourBlastPressureExplosionBonus = 0;
  state.contourEnemyHpPerTileBonus = 0;
  state.contourEnemyRewardPerTileBonus = 0;
  state.contourEnemySpawnRateBonus = 0;
  state.drillPiercingCount = 0;
  state.drillPiercingDamage = 0;
  state.overhealSpindlePiercingGain = 0;
  state.overflowGovernorDrillGain = 0;
  state.drillDiagonalCount = 0;
  state.drillDiagonalDamage = 0;
  state.contourReturnFuelLevel = 0;
  state.maxContour = 12;
  state.contourOverloadBrokenBlocks = 0;
  state.heatOverloadRocketLevel = 0;
  state.tankBoostLevel = 0;
  state.levelUpFlash = 0;
  state.levelUpPulse = 0;
  state.levelUpModalDelay = 0;
  state.drillPowerPerLevel = 0;
  state.explosionPowerPerLevel = 0;
  state.fuelPerLevel = 0;
  state.strikeSpeedPerLevel = 0;
  state.healPerLevel = 0;
  state.goldBonusPerLevel = 0;
  state.activeToasts.length = 0;
  state.toastQueue.length = 0;
  state.toastQueueTimer = 0;
  state.toastDebounceMap = {};
  state.toastSeq = 0;
  state.goldParticles.length = 0;
  state.xpParticles.length = 0;
  state.drillSmokeParticles.length = 0;
  state.depthTitle.text = "";
  state.depthTitle.time = 0;
  state.damageFlash = 0;
  state.goldHitRect = null;
  state.hudInspectableRects = [];
  state.itemInspectModalOpen = false;
  state.itemInspectItems = [];
  state.itemInspectIndex = -1;
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
  state.worldSeed = seedOverride ?? getSeedFromUrl() ?? newWorldSeed();
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
  state.blueprintMask.set(map.blueprintMask);
  state.tunnelMask.fill(0);
  state.microResourceMask.fill(0);
  state.microResourceRevealedMask.fill(0);
  for (let i = 0; i < GRID_W * GRID_H; i += 1) {
    state.health[i] = BLOCK_TYPES[state.hardness[i]].hp;
    if (map.beaconMask[i] === 1 || map.beaconMask[i] === 2) {
      state.hardness[i] = 0;
      state.health[i] = 0;
    }
    if (map.beaconMask[i] === 2) {
      state.tunnelMask[i] = 1;
    }
    // Seed micro-resources into solid blocks (~12% chance each)
    if (state.hardness[i] > 0 && !state.goldOreMask[i] && !state.gasPocketMask[i] && !state.boulderPocketMask[i]) {
      const roll = (i * 2654435761 + state.worldSeed * 1234567) & 0xffffffff;
      const r = (roll >>> 0) % 100;
      if (r < 4) {
        state.microResourceMask[i] = 1; // gold
      } else if (r < 8) {
        state.microResourceMask[i] = 2; // fuel
      } else if (r < 12) {
        state.microResourceMask[i] = 3; // xp
      }
    }
  }
  state.base.x = map.base.x;
  state.base.y = map.base.y;
  for (const b of map.beacons) {
    state.beacons.push({
      x: b.x,
      y: b.y,
      hidden: !!b.hidden,
      active: false,
      wireActivationStart: null,
      wireDamageTriggered: false,
      wiresFreedToastShown: false,
      wireTrackedCells: [],
      rewardContourReady: false,
      rewardClaimed: false,
      rewardRecipe: null,
      rewardRevealStart: 0,
      rewardGranted: false,
      rewardAutoAfterShop: false,
    });
  }
  state.beaconWires = map.beaconWires;
  state.perkMask.set(map.perkMask);
  state.crystalMask.set(map.crystalMask);
  for (const zone of map.perkZones) {
    const zoneId = state.perkZones.length;
    const isDualStat = zone?.kind === "dual_stat" && Array.isArray(zone?.sides);
    const nextZone = {
      x: zone.x,
      y: zone.y,
      cells: Array.isArray(zone.cells) ? zone.cells : [],
      kind: isDualStat ? "dual_stat" : "standard",
      rarity: clamp(Math.round(zone.rarity || RARITY.COMMON), RARITY.COMMON, RARITY.LEGENDARY),
      iconX: zone.iconX,
      iconY: zone.iconY,
      perkType: zone.perkType,
      openedCount: 0,
      openedMask: 0,
      arming: false,
      armingTimer: 0,
      pendingResolve: false,
      resolving: false,
      collected: false,
      sides: null,
    };
    if (isDualStat) {
      const sides = {
        drill: { iconX: Math.round(zone.x), iconY: Math.round(zone.y), cells: [], openedCount: 0, openedMask: 0, completed: false, collected: false },
        explosion: { iconX: Math.round(zone.x), iconY: Math.round(zone.y), cells: [], openedCount: 0, openedMask: 0, completed: false, collected: false },
      };
      for (const rawSide of zone.sides) {
        const sideKey = rawSide?.kind === "explosion" ? "explosion" : "drill";
        sides[sideKey] = {
          iconX: rawSide.iconX,
          iconY: rawSide.iconY,
          cells: Array.isArray(rawSide.cells) ? rawSide.cells : [],
          openedCount: 0,
          openedMask: 0,
          completed: false,
          collected: false,
        };
      }
      nextZone.sides = sides;
    }
    state.perkZones.push(nextZone);
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
  state.currentDepthLevel = getDepthLevelForCell(state.drill.x, state.drill.y)?.level || 1;
  {
    const zoom = getCameraZoom();
    const viewWidth = state.width / zoom;
    const viewHeight = state.height / zoom;
    state.camera.x = state.drill.x * TILE_SIZE + TILE_SIZE * 0.5 - viewWidth * 0.5;
    state.camera.y = state.drill.y * TILE_SIZE + TILE_SIZE * 0.5 - viewHeight * 0.5;
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

function getDepthLevelForCell(x, y) {
  for (let i = 0; i < DEPTH_LEVELS.length; i += 1) {
    const level = DEPTH_LEVELS[i];
    if (x >= level.xMin && x <= level.xMax && y >= level.startY && y <= level.endY) {
      return level;
    }
  }
  return null;
}

function showDepthTitle(level) {
  if (!Number.isFinite(level) || level <= 0) {
    return;
  }
  playSound("depth_announce");
  state.depthTitle.text = t("ui.depth", { level });
  state.depthTitle.time = 1.8;
}

function updateDepthLevelTransition() {
  const levelNumber = getDepthLevelForCell(state.drill.x, state.drill.y)?.level || 0;
  if (levelNumber <= 0 || levelNumber === state.currentDepthLevel) {
    return;
  }
  state.currentDepthLevel = levelNumber;
  showDepthTitle(levelNumber);
}

function getCollapseHardness(depth = state.depth) {
  return clamp(1 + Math.floor(Math.max(0, depth) / 10), 1, BLOCK_TYPES.length - 1);
}

function getCollapseDamage(hardness) {
  return 25 + 0.5 * Math.max(0, hardness || 0);
}

function getCollapseBudgetMaxPointsFromScale(scale = 0) {
  return Math.max(1, Math.round(COLLAPSE_BUDGET_INITIAL * (1 + scale)));
}

function getCollapseBudgetMaxPoints() {
  return getCollapseBudgetMaxPointsFromScale(state.collapseBudgetMaxScale || 0);
}

function delayCollapseByRecipeBonus() {
  const percent = Number(state.recipeCollapseDelayPercent || 0);
  if (!Number.isFinite(percent) || percent <= 0) {
    return;
  }
  const maxBudget = getCollapseBudgetMaxPoints();
  const gain = maxBudget * (percent / 100);
  state.collapseBudget = clamp((state.collapseBudget || 0) + gain, 0, maxBudget);
}

function applyCollapseBudgetMaxScaleDelta(delta) {
  if (!Number.isFinite(delta) || Math.abs(delta) <= 1e-9) {
    return;
  }
  const oldScale = state.collapseBudgetMaxScale || 0;
  const oldMax = getCollapseBudgetMaxPointsFromScale(oldScale);
  const oldCurrent = Number.isFinite(state.collapseBudget) ? state.collapseBudget : oldMax;
  state.collapseBudgetMaxScale = oldScale + delta;
  const newMax = getCollapseBudgetMaxPointsFromScale(state.collapseBudgetMaxScale);
  const ratio = oldMax > 0 ? oldCurrent / oldMax : 1;
  state.collapseBudget = clamp(ratio * newMax, 0, newMax);
}

function spendCollapseBudget(amount) {
  if (amount <= 0) {
    return;
  }
  const maxBudget = getCollapseBudgetMaxPoints();
  state.collapseBudget -= amount;
  while (state.collapseBudget <= 0) {
    state.pendingCollapseCount += 1;
    state.collapseBudget += maxBudget;
  }
}

function spendContourEnemyBudget(hardness, pathLength) {
  if (state.contourEnemy) return;
  if (pathLength < CONTOUR_ENEMY_MIN_PATH_LENGTH) return;
  const spawnRateMult = Math.max(0, 1 + (state.contourEnemySpawnRateBonus || 0));
  state.contourEnemyBudget -= hardness * (1 + 0.1 * pathLength) * spawnRateMult;
  if (state.contourEnemyBudget <= 0) {
    state.contourEnemyBudget = CONTOUR_ENEMY_BUDGET_INITIAL;
    spawnContourEnemy();
  }
}

function isCollapseCandidateCell(x, y) {
  if (x < 1 || y < 1 || x >= GRID_W - 1 || y >= GRID_H - 1) {
    return false;
  }
  const index = cellIndex(x, y);
  if (!isWalkableTileIndex(index)) {
    return false;
  }
  if ((x === START_X && y === START_Y) || (x === state.base.x && y === state.base.y)) {
    return false;
  }
  if (
    state.perkMask[index] > 0 ||
    state.crystalMask[index] > 0 ||
    state.blueprintMask[index] > 0 ||
    state.keyMask[index] > 0 ||
    state.goldPickupMask[index] > 0 ||
    state.xpPickupMask[index] > 0 ||
    state.goldBonusPickupMask[index] > 0 ||
    state.xpBonusPickupMask[index] > 0 ||
    state.safeDoorMask[index] > 0
  ) {
    return false;
  }
  for (const beacon of state.beacons) {
    if (!beacon) continue;
    if (x >= beacon.x - 1 && x <= beacon.x + 2 && y >= beacon.y - 1 && y <= beacon.y + 2) {
      return false;
    }
  }
  return true;
}

function hasCollapseCeiling(x, y) {
  for (let offset = 1; offset <= 3; offset += 1) {
    const ny = y - offset;
    if (ny < 1) {
      break;
    }
    const index = cellIndex(x, ny);
    if (!state.tunnelMask[index] || state.metalMask[index] || state.beaconMask[index] > 0) {
      return true;
    }
  }
  return false;
}

function buildCollapseWarningCells() {
  const targetCount = clamp(COLLAPSE_MIN_TILES + Math.floor(state.depth / 20), COLLAPSE_MIN_TILES, COLLAPSE_MAX_TILES);
  const offsets = [
    { x: 0, y: 0 },
    { x: 0, y: -1 },
    { x: -1, y: 0 },
    { x: 1, y: 0 },
    { x: -1, y: -1 },
    { x: 1, y: -1 },
    { x: 0, y: -2 },
    { x: -2, y: 0 },
    { x: 2, y: 0 },
    { x: -1, y: 1 },
    { x: 1, y: 1 },
    { x: -2, y: -1 },
    { x: 2, y: -1 },
    { x: 0, y: 1 },
    { x: -2, y: 1 },
    { x: 2, y: 1 },
  ];
  const preferred = [];
  const fallback = [];
  const seen = new Set();
  for (const offset of offsets) {
    const x = state.drill.x + offset.x;
    const y = state.drill.y + offset.y;
    const key = `${x},${y}`;
    if (seen.has(key) || !isCollapseCandidateCell(x, y)) {
      continue;
    }
    seen.add(key);
    const cell = { x, y };
    if (hasCollapseCeiling(x, y)) {
      preferred.push(cell);
    } else {
      fallback.push(cell);
    }
  }
  return preferred.concat(fallback).slice(0, targetCount);
}

function beginCollapseWarning() {
  const cells = buildCollapseWarningCells();
  state.pendingCollapseCount = Math.max(0, state.pendingCollapseCount - 1);
  if (cells.length <= 0) {
    return;
  }
  state.cameraShake.amplitude = Math.max(state.cameraShake.amplitude, 1.6);
  state.collapseWarnings.push({
    cells,
    timer: COLLAPSE_WARNING_DURATION,
    duration: COLLAPSE_WARNING_DURATION,
    hardness: getCollapseHardness(),
    resolveIndex: 0,
    landDelay: 0,
    heroDamaged: false,
    clearPath: false,
  });
  showPerkToast(t("toast.collapse"));
}

function resolveNextCollapseCell(warning) {
  if (!warning || !Array.isArray(warning.cells) || warning.resolveIndex >= warning.cells.length) {
    return true;
  }

  const blockedKeys = new Set();
  for (let i = warning.resolveIndex; i < warning.cells.length; i += 1) {
    blockedKeys.add(`${warning.cells[i].x},${warning.cells[i].y}`);
  }

  const cell = warning.cells[warning.resolveIndex];
  warning.resolveIndex += 1;
  const key = `${cell.x},${cell.y}`;
  const enemy = state.contourEnemy;
  if (enemy && key === `${enemy.x},${enemy.y}`) {
    hitContourEnemy(enemy.hp + 1);
  }
  if (!warning.heroDamaged && key === `${state.drill.x},${state.drill.y}`) {
    warning.heroDamaged = true;
    applyHazardDamage(getCollapseDamage(warning.hardness));
    const fallback = findNearestWalkableTileExcluding(state.drill.x, state.drill.y, blockedKeys);
    if (fallback) {
      state.drill.x = fallback.x;
      state.drill.y = fallback.y;
      state.drill.renderX = fallback.x;
      state.drill.renderY = fallback.y;
      state.drill.animFromX = fallback.x;
      state.drill.animFromY = fallback.y;
      state.drill.animToX = fallback.x;
      state.drill.animToY = fallback.y;
      refreshSignalDirection();
      warning.clearPath = true;
    } else {
      return warning.resolveIndex >= warning.cells.length;
    }
  }

  const index = cellIndex(cell.x, cell.y);
  if (isWalkableTileIndex(index)) {
    if (state.pathIndexByCell[index] !== -1) {
      warning.clearPath = true;
    }
    removeGasCell(cell.x, cell.y);
    state.steamMask[index] = 0;
    state.tunnelMask[index] = 0;
    state.hardness[index] = warning.hardness;
    state.health[index] = BLOCK_TYPES[warning.hardness].hp;
    state.hazardMask[index] = 0;
    state.hazardTriggeredMask[index] = 0;
    state.loopGoldMask[index] = 0;
    spawnBreakEffect(cell.x, cell.y, warning.hardness, "collapse");
    state.cameraShake.amplitude = Math.max(state.cameraShake.amplitude, 0.7);
  }

  if (warning.resolveIndex >= warning.cells.length) {
    if (warning.clearPath) {
      state.pathTiles.length = 0;
      rebuildPathIndex();
    }
    state.visibilityDirty = true;
    return true;
  }
  warning.landDelay = COLLAPSE_LAND_INTERVAL;
  state.visibilityDirty = true;
  return false;
}

function updateCollapseWarnings(dt) {
  for (let i = state.collapseWarnings.length - 1; i >= 0; i -= 1) {
    const warning = state.collapseWarnings[i];
    if (warning.timer > 0) {
      warning.timer -= dt;
      continue;
    }
    if (warning.landDelay > 0) {
      warning.landDelay -= dt;
      continue;
    }
    if (resolveNextCollapseCell(warning)) {
      state.collapseWarnings.splice(i, 1);
    }
  }

  if (state.collapseWarnings.length === 0 && state.pendingCollapseCount > 0) {
    beginCollapseWarning();
  }
}

function buildCrystalRecipePool(level, firstCrystalType) {
  const pool = [firstCrystalType];
  if (!level) {
    return pool;
  }
  for (let y = level.startY; y <= level.endY; y += 1) {
    for (let x = level.xMin; x <= level.xMax; x += 1) {
      const crystalType = state.crystalMask[cellIndex(x, y)];
      if (crystalType > 0) {
        pool.push(crystalType);
      }
    }
  }
  return pool;
}

function startCrystalRecipe(firstCrystalType) {
  state.crystalRecipe = [firstCrystalType];
  const level = getDepthLevelForCell(state.drill.x, state.drill.y);
  const recipePool = buildCrystalRecipePool(level, firstCrystalType);
  for (let i = 1; i < CRYSTAL_RECIPE_LENGTH; i += 1) {
    if (recipePool.length <= 0) {
      state.crystalRecipe.push(chooseCrystalType(state.worldRandom));
      continue;
    }
    const pickIndex = Math.floor(state.worldRandom() * recipePool.length);
    const pickedCrystalType = recipePool[pickIndex] || firstCrystalType;
    state.crystalRecipe.push(pickedCrystalType);
    recipePool.splice(pickIndex, 1);
  }
  state.crystalCollected = [0, 0, 0, 0, 0, 0];
  state.crystalCollected[firstCrystalType] = 1;
  state.crystalProgress = 1;
  state.crystalStatusText = `${CRYSTAL_TYPES[firstCrystalType].name}: 1/${state.crystalRecipe.length}`;
}

function buildBeaconBonusRecipe(beacon) {
  const level = getDepthLevelForCell(beacon.x, beacon.y);
  if (!level) {
    const fallbackType = chooseCrystalType(state.worldRandom);
    return [fallbackType, fallbackType, fallbackType];
  }
  const available = [];
  for (let y = level.startY; y <= level.endY; y += 1) {
    for (let x = level.xMin; x <= level.xMax; x += 1) {
      const crystalType = state.crystalMask[cellIndex(x, y)];
      if (crystalType > 0) {
        available.push(crystalType);
      }
    }
  }
  if (available.length <= 0) {
    const fallbackType = chooseCrystalType(state.worldRandom);
    return [fallbackType, fallbackType, fallbackType];
  }
  const recipe = [];
  for (let i = 0; i < CRYSTAL_RECIPE_LENGTH; i += 1) {
    const pickIndex = Math.floor(state.worldRandom() * available.length);
    recipe.push(available[pickIndex] || available[0]);
  }
  return recipe;
}

function isHiddenBeaconCore(index) {
  return state.beaconMask[index] === 3;
}

function isWalkableTileIndex(index) {
  return state.tunnelMask[index] && state.beaconMask[index] !== 1;
}

function revealHiddenBeacon(beacon) {
  if (!beacon?.hidden) {
    return;
  }
  finalizeHiddenBeaconExcavation(beacon);
}

function isBeaconFullyExcavated(beacon) {
  for (let dy = 0; dy < 2; dy += 1) {
    for (let dx = 0; dx < 2; dx += 1) {
      const index = cellIndex(beacon.x + dx, beacon.y + dy);
      if (!state.tunnelMask[index]) {
        return false;
      }
    }
  }
  return true;
}

function isInsideBeaconCore(beacon, x, y) {
  return x >= beacon.x && x <= beacon.x + 1 && y >= beacon.y && y <= beacon.y + 1;
}

function findNearestWalkableTileOutsideBeacon(beacon, fromX, fromY) {
  const visited = new Uint8Array(GRID_W * GRID_H);
  const queue = [{ x: fromX, y: fromY }];
  visited[cellIndex(fromX, fromY)] = 1;
  while (queue.length > 0) {
    const current = queue.shift();
    if (
      !isInsideBeaconCore(beacon, current.x, current.y) &&
      isWalkableTileIndex(cellIndex(current.x, current.y))
    ) {
      return current;
    }
    for (let i = 0; i < CARDINAL_DIRS.length; i += 1) {
      const nx = current.x + CARDINAL_DIRS[i].x;
      const ny = current.y + CARDINAL_DIRS[i].y;
      if (nx < 1 || ny < 1 || nx >= GRID_W - 1 || ny >= GRID_H - 1) {
        continue;
      }
      const index = cellIndex(nx, ny);
      if (visited[index]) {
        continue;
      }
      visited[index] = 1;
      queue.push({ x: nx, y: ny });
    }
  }
  return null;
}

function findNearestWalkableTileExcluding(fromX, fromY, blockedKeys = new Set()) {
  const visited = new Uint8Array(GRID_W * GRID_H);
  const queue = [{ x: fromX, y: fromY }];
  visited[cellIndex(fromX, fromY)] = 1;
  while (queue.length > 0) {
    const current = queue.shift();
    const key = `${current.x},${current.y}`;
    if (!blockedKeys.has(key) && isWalkableTileIndex(cellIndex(current.x, current.y))) {
      return current;
    }
    for (let i = 0; i < CARDINAL_DIRS.length; i += 1) {
      const nx = current.x + CARDINAL_DIRS[i].x;
      const ny = current.y + CARDINAL_DIRS[i].y;
      if (nx < 1 || ny < 1 || nx >= GRID_W - 1 || ny >= GRID_H - 1) {
        continue;
      }
      const index = cellIndex(nx, ny);
      if (visited[index]) {
        continue;
      }
      visited[index] = 1;
      queue.push({ x: nx, y: ny });
    }
  }
  return null;
}

function clearHiddenBeaconRing(beacon) {
  for (let dy = -1; dy <= 2; dy += 1) {
    for (let dx = -1; dx <= 2; dx += 1) {
      if (dx >= 0 && dx < 2 && dy >= 0 && dy < 2) {
        continue;
      }
      const x = beacon.x + dx;
      const y = beacon.y + dy;
      if (x < 1 || y < 1 || x >= GRID_W - 1 || y >= GRID_H - 1) {
        continue;
      }
      const index = cellIndex(x, y);
      if (state.metalMask[index] || state.safeDoorMask[index] > 0 || state.beaconMask[index] > 0) {
        continue;
      }
      if (state.hardness[index] > 0) {
        breakCell(x, y, index, { cause: "explosion" });
      }
    }
  }
}

function finalizeHiddenBeaconExcavation(beacon) {
  if (!beacon?.hidden || !isBeaconFullyExcavated(beacon)) {
    return false;
  }
  beacon.hidden = false;
  for (let dy = 0; dy < 2; dy += 1) {
    for (let dx = 0; dx < 2; dx += 1) {
      const index = cellIndex(beacon.x + dx, beacon.y + dy);
      state.beaconMask[index] = 1;
    }
  }
  clearHiddenBeaconRing(beacon);
  state.pathTiles.length = 0;
  rebuildPathIndex();
  if (isInsideBeaconCore(beacon, state.drill.x, state.drill.y)) {
    const fallback = findNearestWalkableTileOutsideBeacon(beacon, state.drill.x, state.drill.y);
    if (fallback) {
      state.drill.x = fallback.x;
      state.drill.y = fallback.y;
      state.drill.renderX = fallback.x;
      state.drill.renderY = fallback.y;
      refreshSignalDirection();
      state.visibilityDirty = true;
    }
  }
  showPerkToast(t("toast.beacon_excavated"));
  return true;
}

function renderHiddenBeaconReveal(camera) {
  const ctx = state.ctx;
  for (const beacon of state.beacons) {
    if (!beacon.hidden || beacon.active) {
      continue;
    }
    let hasRevealedCell = false;
    ctx.save();
    ctx.beginPath();
    for (let dy = 0; dy < 2; dy += 1) {
      for (let dx = 0; dx < 2; dx += 1) {
        const tx = beacon.x + dx;
        const ty = beacon.y + dy;
        const index = cellIndex(tx, ty);
        if (!state.tunnelMask[index]) {
          continue;
        }
        hasRevealedCell = true;
        ctx.rect(tx * TILE_SIZE - camera.x, ty * TILE_SIZE - camera.y, TILE_SIZE, TILE_SIZE);
      }
    }
    if (!hasRevealedCell) {
      ctx.restore();
      continue;
    }
    ctx.clip();
    renderOneBeacon(camera, beacon, { suppressContourHint: true });
    ctx.restore();
  }
}

function beginFullFreedom(beacon, announce = true) {
  const rewardRecipe = Array.isArray(beacon.rewardRecipe) && beacon.rewardRecipe.length > 0
    ? beacon.rewardRecipe
    : buildBeaconBonusRecipe(beacon);
  beacon.rewardContourReady = false;
  beacon.rewardClaimed = true;
  beacon.rewardRecipe = rewardRecipe;
  beacon.rewardRevealStart = state.lastTs || performance.now();
  beacon.rewardGranted = false;
  beacon.rewardAutoAfterShop = false;
  if (announce) {
    showPerkToast(t("toast.full_freedom"));
  }
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

function rollCrystalItemRarity() {
  return rollLevelRewardRarity(state.level);
}

function pickCrystalRewardItem() {
  const picks = 1;
  let best = null;
  for (let pick = 0; pick < picks; pick++) {
    for (let attempt = 0; attempt < 40; attempt++) {
      const rarity = rollCrystalItemRarity();
      const pool = ALL_GOODS.filter(g =>
        g.type === "item" &&
        (g.minRarity ?? 1) <= rarity &&
        (!g.maxRarity || g.maxRarity >= rarity) &&
        !(g.unique && getItemStacks(g.id) > 0)
      );
      if (pool.length === 0) continue;
      const good = pool[Math.floor(Math.random() * pool.length)];
      if (!best || rarity > best.rarity) best = { good, rarity };
      break;
    }
  }
  return best;
}

function grantCrystalRecipeReward(firstCrystalType, completedRecipe, x, y, options = {}) {
  state.recipesCompletedThisRun = Math.max(0, (state.recipesCompletedThisRun || 0) + 1);
  delayCollapseByRecipeBonus();
  const offer = pickCrystalRewardItem();
  if (!offer) return;
  const showRecipeAnimation = options.showRecipeAnimation !== false;
  const delaySeconds = Number.isFinite(options.delaySeconds)
    ? Math.max(0, options.delaySeconds)
    : 1.1;
  // Store offer for deferred open
  state.crystalItemOfferGood = offer.good;
  state.crystalItemOfferRarity = offer.rarity;
  state.crystalItemOfferRevealed = false;
  state.crystalItemOfferShuffleTick = 0;
  state.crystalItemOfferPreview = getRandomShuffleItem();
  state.crystalItemOfferTitle = options.title || t("ui.recipe_complete");
  state.crystalCompleteAnimDelay = delaySeconds;
  if (!showRecipeAnimation) {
    return;
  }
  // Spawn crystal completion animation; modal opens after it finishes
  const recipe = Array.isArray(completedRecipe) && completedRecipe.length > 0
    ? completedRecipe
    : [firstCrystalType, firstCrystalType, firstCrystalType];
  state.effects.push({
    kind: "crystalComplete",
    x, y,
    time: delaySeconds,
    duration: delaySeconds,
    recipe,
  });
}

function openCrystalItemOfferModal() {
  state.crystalItemOfferOpen = true;
  state.crystalItemOfferAnimTimer = 1.2;
  syncCrystalItemOffer();
}

function getRandomShuffleItem() {
  const pool = ALL_GOODS.filter(g => g.type === "item");
  return pool[Math.floor(Math.random() * pool.length)] || null;
}

function applyCrystalCatalystBonus(x, y) {
  if (state.crystalCatalystLevel <= 0) {
    return;
  }
  playSound("crystal_catalyst", { volume: 0.6 });
  state.unsafeGold += applyGoldBonus(30);
  showGoldToast(30);

  if (state.crystalCatalystLevel >= 2) {
    addFuel(40, x, y);
  }
  if (state.crystalCatalystLevel >= 3) {
    healPlayer(25, t("toast.crystal_catalyst_heal"));
  }
}

function collectCrystalTile(x, y, index, crystalType) {
  state.crystalMask[index] = 0;
  runFuelEvent(() => applyCrystalCatalystBonus(x, y));
  if (state.crystalGoldGain > 0) {
    state.unsafeGold += applyGoldBonus(state.crystalGoldGain);
    showGoldToast(state.crystalGoldGain);
  }
  if (state.crystalXpGain > 0) {
    const gainedXp = scaleExperienceGain(state.crystalXpGain);
    gainExperience(gainedXp);
    if (gainedXp > 0) {
      showBonusXpToast(gainedXp);
    }
  }
  if (crystalType === CRYSTAL_RED && state.crystalRedDrillGain > 0) {
    state.drillPower += state.crystalRedDrillGain;
  }
  if (crystalType === CRYSTAL_YELLOW && state.crystalYellowExplosionGain > 0) {
    state.explosionPower += state.crystalYellowExplosionGain;
  }
  if (crystalType === CRYSTAL_GREEN && state.crystalGreenHealGain > 0) {
    healPlayer(state.crystalGreenHealGain);
  }
  if (crystalType === CRYSTAL_BLUE && state.crystalBlueSpeedGain > 0) {
    state.strikeSpeed += state.crystalBlueSpeedGain;
  }
  if (crystalType === CRYSTAL_LIGHT && state.crystalLightRadarSeconds > 0) {
    state.crystalLightRadarTimer = Math.max(state.crystalLightRadarTimer, state.crystalLightRadarSeconds);
  }
  if (state.crystalRecipe.length === 0) {
    playSound("crystal_pickup");
    startCrystalRecipe(crystalType);
    showCrystalToast(state.crystalStatusText);
    return;
  }

  let recipeCount = 0;
  for (let i = 0; i < state.crystalRecipe.length; i += 1) {
    if (state.crystalRecipe[i] === crystalType) {
      recipeCount += 1;
    }
  }

  if (recipeCount > 0 && state.crystalCollected[crystalType] < recipeCount) {
    playSound("crystal_pickup");
    state.crystalCollected[crystalType] += 1;
    state.crystalProgress += 1;
    state.crystalStatusText = `${CRYSTAL_TYPES[crystalType].name}: ${state.crystalProgress}/${state.crystalRecipe.length}`;
    showCrystalToast(state.crystalStatusText);
    if (state.crystalProgress >= state.crystalRecipe.length) {
      const firstCrystalType = state.crystalRecipe[0];
      const completedRecipe = [...state.crystalRecipe];
      showCrystalToast(t("toast.crystals_collected"));
      playSound("recipe_complete");
      clearCrystalRecipe();
      grantCrystalRecipeReward(firstCrystalType, completedRecipe, x, y);
    }
    return;
  }

  playSound("crystal_wrong");
  applyStun(1, t("toast.wrong_crystal"));
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

function carveTunnel(x, y, resMultiplier = 1) {
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
    addToGoldPickupMask(x, y, droppedPickup);
  }

  if (perkType > 0) {
    collectPerkTile(x, y, index, perkType, resMultiplier);
  }

  if (crystalType > 0) {
    collectCrystalTile(x, y, index, crystalType);
  }

  if (zoneId !== -1) {
    revealPerkZoneCell(zoneId, x, y);
  }

}

function collectPerkTile(x, y, index, perkType, resMultiplier = 1) {
  playSound("perk_pickup");
  state.perkMask[index] = 0;
  runFuelEvent(() => applyTilePerk(perkType, x, y, true, resMultiplier));
  state.outOfFuel = false;
}

function getDualPerkZoneSideMeta(sideKey) {
  if (sideKey === "explosion") {
    return { icon: "E", color: "#ffad63" };
  }
  return { icon: "D", color: "#69b7ff" };
}

function getDualPerkZoneCellData(zone, x, y) {
  if (!zone?.sides) {
    return null;
  }
  for (const sideKey of ["drill", "explosion"]) {
    const side = zone.sides[sideKey];
    if (!side || !Array.isArray(side.cells)) continue;
    for (let i = 0; i < side.cells.length; i += 1) {
      const cell = side.cells[i];
      if (cell.x === x && cell.y === y) {
        return { sideKey, side, cellOrder: i };
      }
    }
  }
  return null;
}

function getDualPerkZoneDepthLevel(side) {
  const level = getDepthLevelForCell(side.iconX, side.iconY)?.level || state.currentDepthLevel || 1;
  return Math.max(1, level);
}

function applyDualPerkZoneReward(zone, sideKey) {
  const side = zone?.sides?.[sideKey];
  if (!side || side.collected) {
    return;
  }
  side.collected = true;
  const depthLevel = getDualPerkZoneDepthLevel(side);
  const amount = 5 * depthLevel;
  const signedAmount = `+${amount}`;
  if (sideKey === "explosion") {
    state.explosionPower += amount;
    state.perkText = t("toast.dual_zone_explosion", { val: signedAmount, depth: depthLevel });
  } else {
    state.drillPower += amount;
    state.perkText = t("toast.dual_zone_drill", { val: signedAmount, depth: depthLevel });
  }
  showPerkToast(state.perkText);
}

function detonateDualPerkZoneSide(zone, sideKey) {
  const side = zone?.sides?.[sideKey];
  if (!side || !Array.isArray(side.cells) || side.cells.length === 0) {
    return;
  }
  playSound("explosion");
  let sumX = 0;
  let sumY = 0;
  for (let i = 0; i < side.cells.length; i += 1) {
    const cell = side.cells[i];
    sumX += cell.x;
    sumY += cell.y;
    const index = cellIndex(cell.x, cell.y);
    if (!state.tunnelMask[index] && state.hardness[index] > 0) {
      breakCell(cell.x, cell.y, index, { cause: "explosion" });
    }
  }
  const cx = Math.round(sumX / side.cells.length);
  const cy = Math.round(sumY / side.cells.length);
  spawnExplosionEffect(cx, cy, 1);
}

function revealDualPerkZoneCell(zone, x, y) {
  if (!zone || zone.collected || zone.resolving) {
    return;
  }
  const hit = getDualPerkZoneCellData(zone, x, y);
  if (!hit) {
    return;
  }
  const { side, cellOrder } = hit;
  const bit = 1 << cellOrder;
  if (side.openedMask & bit) {
    return;
  }
  side.openedMask |= bit;
  side.openedCount += 1;
  if (side.openedCount >= side.cells.length) {
    side.completed = true;
    zone.pendingResolve = true;
    zone.arming = true;
    zone.armingTimer = PERK_ZONE_CHARGE_DELAY;
  }
}

function revealPerkZoneCell(zoneId, x, y) {
  const zone = state.perkZones[zoneId];
  if (!zone || zone.collected) {
    return;
  }
  if (zone.kind === "dual_stat") {
    revealDualPerkZoneCell(zone, x, y);
    return;
  }
  if (zone.arming) {
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

  if (zone.perkType === 4) {
    explodeAt(Math.round(zone.x), Math.round(zone.y), getStrikeDamage(), 3, { skipRadiusBonus: true });
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
    if (!zone || zone.collected) {
      continue;
    }
    if (zone.kind === "dual_stat") {
      if (!zone.arming || zone.resolving) {
        continue;
      }
      zone.armingTimer = Math.max(0, zone.armingTimer - dt);
      if (zone.armingTimer === 0) {
        zone.arming = false;
        if (!zone.pendingResolve) {
          continue;
        }
        const drillDone = !!zone.sides?.drill?.completed;
        const explosionDone = !!zone.sides?.explosion?.completed;
        if (!drillDone && !explosionDone) {
          zone.pendingResolve = false;
          continue;
        }
        zone.pendingResolve = false;
        zone.resolving = true;
        if (drillDone && explosionDone) {
          applyDualPerkZoneReward(zone, "drill");
          applyDualPerkZoneReward(zone, "explosion");
        } else if (drillDone) {
          applyDualPerkZoneReward(zone, "drill");
          detonateDualPerkZoneSide(zone, "explosion");
        } else {
          applyDualPerkZoneReward(zone, "explosion");
          detonateDualPerkZoneSide(zone, "drill");
        }
        zone.resolving = false;
        zone.collected = true;
      }
      continue;
    }
    if (!zone.arming) {
      continue;
    }
    zone.armingTimer = Math.max(0, zone.armingTimer - dt);
    if (zone.armingTimer === 0) {
      collectPerkZone(zone);
    }
  }
}

function applyTilePerk(perkType, x, y, showToast = true, resMultiplier = 1) {
  switch (perkType) {
    case 1: {
      const fuelDelta = getTankFuelDelta();
      if (fuelDelta >= 0) {
        const baseFuelGain = Math.round(fuelDelta);
        const scaledFuelGain = Math.round(baseFuelGain * resMultiplier);
        addFuel(scaledFuelGain, x, y, { baseAmount: baseFuelGain });
      } else {
        state.fuel = Math.max(0, state.fuel + fuelDelta);
        showFuelToast(fuelDelta);
      }
      state.perkText = t("perk.tile.tank.name");
      break;
    }
    case 2:
      state.signalMovesLeft += RADAR_BASE_DURATION;
      state.signalMovesMax = Math.max(state.signalMovesMax, state.signalMovesLeft);
      refreshSignalDirection(x, y);
      state.perkText = t("perk.tile.radar.name");
      break;
    case 3:
      state.drillPower += 0.35;
      state.perkText = t("perk.tile.drill.name");
      break;
    case 4: {
      const targetX = clamp(x + state.drill.facingX * 3, 1, GRID_W - 2);
      const targetY = clamp(y + state.drill.facingY * 3, 1, GRID_H - 2);
      spawnRocketEffect(x, y, targetX, targetY, {
        kind: "radiusBomb",
        damage: BASE_DRILL_DAMAGE * 10,
        radius: 2,
        skipRadiusBonus: true,
      }, { instant: true });
      state.perkText = t("perk.tile.bomb.name");
      break;
    }
    case 5:
      state.strikeSpeed += 10;
      state.perkText = t("perk.tile.speed.name");
      break;
    case 6: {
      const baseHeal = 25;
      const scaledHeal = Math.max(0, Math.round(baseHeal * resMultiplier));
      healPlayer(scaledHeal, t("toast.hp_plus"));
      const baseHealShown = Math.min(baseHeal, scaledHeal);
      const bonusHealShown = Math.max(0, scaledHeal - baseHealShown);
      showHpGainToast(baseHealShown);
      showBonusHpToast(bonusHealShown);
      state.perkText = t("perk.tile.hp.name");
      break;
    }
    case 7: {
      const baseArmor = 25;
      const scaledArmor = Math.max(0, Math.round(baseArmor * resMultiplier));
      state.armor += scaledArmor;
      const baseArmorShown = Math.min(baseArmor, scaledArmor);
      const bonusArmorShown = Math.max(0, scaledArmor - baseArmorShown);
      showArmorGainToast(baseArmorShown);
      showBonusArmorToast(bonusArmorShown);
      state.perkText = t("perk.tile.armor.name");
      break;
    }
    case 8:
      activateDrillOverdrive(8, "");
      showPerkToast(t("toast.tile_boost_seconds", { sec: 8 }));
      state.perkText = t("perk.tile.boost.name");
      break;
    default:
      break;
  }
  void showToast;
}

function applyGoldPerk(perkType) {
  switch (perkType) {
    case 1:
      break;
    case 3:
      break;
    case 4:
      break;
    case 5:
      break;
    case 6:
      state.lowFuelSpeedBonus += 0.35;
      state.perkText = t("perk.gold.empty_boost.name");
      break;
    case 7:
      state.remoteBombLevel += 1;
      state.remoteBombInterval = Math.max(15, state.remoteBombInterval > 0 ? state.remoteBombInterval - 5 : 30);
      state.perkText = t("perk.gold.sapper_charge.name");
      break;
    case 8:
      break;
    case 9:
      state.visionRadius = Math.min(9, state.visionRadius + 1);
      state.perkText = t("perk.gold.vision_lens.name");
      break;
    case 10:
      state.radarCrystalModule = true;
      state.perkText = t("perk.gold.radar_module.name");
      break;
    case 11:
      break;
    case 13:
      state.overflowBomb = true;
      state.fuelBonus += 0.20;
      state.maxFuel = Math.max(100, state.maxFuel - 150);
      state.fuel = Math.min(state.fuel, state.maxFuel);
      state.perkText = t("perk.gold.overload.name");
      break;
    case 14:
      state.maxHp += 25;
      healPlayer(50, t("toast.reinforced_hull_heal"));
      state.perkText = t("perk.gold.reinforced_hull.name");
      break;
    case 15:
      state.overhealOverdrive = true;
      state.overhealOverdriveDuration = Math.min(10, state.overhealOverdriveDuration > 0 ? state.overhealOverdriveDuration + 2 : 4);
      state.perkText = t("perk.gold.adrenaline_overflow.name");
      break;
    case 16:
      state.loopPerkLevel = Math.min(2, state.loopPerkLevel + 1);
      state.perkText = t("perk.gold.contour_trophy.name");
      break;
    case 17:
      break;
    case 18:
      state.crystalCatalystLevel = Math.min(3, state.crystalCatalystLevel + 1);
      state.perkText = t("perk.gold.crystal_catalyst.name");
      break;
    case 19:
      state.spikeOverdriveLevel = Math.min(3, state.spikeOverdriveLevel + 1);
      state.perkText = t("perk.gold.spike_boost.name");
      break;
    case 20:
    case 21:
      break;
    case 22:
      state.maxHeat += 20;
      state.perkText = t("perk.gold.heat_sink.name");
      break;
    case 23:
    case 24:
      break;
    case 25:
      break;
    case 26:
      state.contourLengthDamageLevel = Math.min(4, state.contourLengthDamageLevel + 1);
      state.perkText = t("perk.gold.contour_resonance.name");
      break;
    case 27:
      state.coolingRocketLevel = Math.min(3, state.coolingRocketLevel + 1);
      state.perkText = t("perk.gold.cooling_rockets.name");
      break;
    case 28:
      state.contourReturnFuelLevel = Math.min(3, state.contourReturnFuelLevel + 1);
      state.perkText = t("perk.gold.contour_recovery.name");
      break;
    case 29:
      state.heatOverloadRocketLevel = Math.min(3, state.heatOverloadRocketLevel + 1);
      state.perkText = t("perk.gold.heat_rockets.name");
      break;
    case 30:
      state.tankBoostLevel = Math.min(3, state.tankBoostLevel + 1);
      state.perkText = t("perk.gold.reinforced_tank.name");
      break;
    default:
      break;
  }
}

function applyShopPerk(effectId, rarityMult, rarity) {
  const showPerkToast = () => {};
  const m = rarityMult || 1;
  switch (effectId) {
    case "drill_power":
      state.strikeSpeed += 15 * m;
      showPerkToast(t("toast.drill_power"));
      break;
    case "side_drills":
    case "long_drill":
    case "diagonal_drills":
      break;
    case "sapper_charge":
      state.remoteBombLevel += 1;
      state.remoteBombInterval = Math.max(15, state.remoteBombInterval > 0 ? state.remoteBombInterval - 5 : 30);
      showPerkToast(t("toast.sapper_charge"));
      break;
    case "fuel_tank":
      state.maxFuel += Math.round(60 * m);
      showPerkToast(t("toast.expanded_tank"));
      break;
    case "fuel_circuit":
      break;
    case "recirculator":
      state.fuelBonus += 0.05 * m;
      showPerkToast(t("toast.recirculator"));
      break;
    case "low_fuel_boost":
      state.lowFuelSpeedBonus += 0.35 * m;
      showPerkToast(t("toast.empty_boost"));
      break;
    case "overload":
      state.overflowBomb = true;
      state.fuelBonus += 0.20 * m;
      state.maxFuel = Math.max(100, state.maxFuel - 150);
      state.fuel = Math.min(state.fuel, state.maxFuel);
      showPerkToast(t("toast.overload"));
      break;
    case "geo_lens":
      state.visionRadius = Math.min(12, state.visionRadius + Math.round(2 * m));
      state.visibilityDirty = true;
      showPerkToast(t("toast.geo_lens"));
      break;
    case "radar_module":
      state.radarCrystalModule = true;
      showPerkToast(t("toast.radar_module"));
      break;
    case "radar_booster":
      showPerkToast(t("toast.radar_amplifier"));
      break;
    case "speed":
      state.strikeSpeed += 20 * m;
      showPerkToast(t("toast.drill_speed"));
      break;
    case "spike_boost":
      state.spikeOverdriveLevel = Math.min(3, (state.spikeOverdriveLevel || 0) + 1);
      showPerkToast(t("toast.spike_boost"));
      break;
    case "tank_boost":
      state.tankBoostLevel = Math.min(3, (state.tankBoostLevel || 0) + 1);
      showPerkToast(t("toast.reinforced_tank"));
      break;
    case "contour_trophy":
      state.loopPerkLevel = Math.min(2, (state.loopPerkLevel || 0) + 1);
      showPerkToast(t("toast.contour_trophy"));
      break;
    case "auto_contour":
      break;
    case "contour_resonance":
      state.contourLengthDamageLevel = Math.min(4, (state.contourLengthDamageLevel || 0) + 1);
      showPerkToast(t("toast.contour_resonance"));
      break;
    case "contour_recovery":
      state.contourReturnFuelLevel = Math.min(3, (state.contourReturnFuelLevel || 0) + 1);
      showPerkToast(t("toast.contour_recovery"));
      break;
    case "heat_sink":
      state.maxHeat += Math.round(20 * m);
      showPerkToast(t("toast.heat_sink"));
      break;
    case "heat_drill":
    case "thermo_charge":
    case "cooling_pulse":
      break;
    case "accel_dampers":
      break;
    case "thermo_rockets":
      state.heatOverloadRocketLevel = Math.min(3, (state.heatOverloadRocketLevel || 0) + 1);
      showPerkToast(t("toast.heat_rockets"));
      break;
    case "cryo_rockets":
      state.coolingRocketLevel = Math.min(3, (state.coolingRocketLevel || 0) + 1);
      showPerkToast(t("toast.cooling_rockets"));
      break;
    case "reinforced_hull":
      state.maxHp += Math.round(25 * m);
      healPlayer(Math.round(50 * m), t("toast.reinforced_hull_heal"));
      showPerkToast(t("toast.reinforced_hull"));
      break;
    case "adrenaline":
      state.overhealOverdrive = true;
      state.overhealOverdriveDuration = Math.min(10, (state.overhealOverdriveDuration || 0) + Math.round(2 * m));
      showPerkToast(t("toast.adrenaline_overflow"));
      break;
    case "ore_collector":
      break;
    case "crystal_catalyst":
      state.crystalCatalystLevel = Math.min(3, (state.crystalCatalystLevel || 0) + 1);
      showPerkToast(t("toast.crystal_catalyst"));
      break;
    case "basic_drill":
      showPerkToast(t("item.basic_drill.name"));
      break;
    case "blast_drill":
      showPerkToast(t("item.blast_drill.name"));
      break;
    case "tradeoff_drill":
      showPerkToast(t("item.tradeoff_drill.name"));
      break;
    case "fragile_drill":
      showPerkToast(t("item.fragile_drill.name"));
      break;
    case "lucky_pickaxe":
      showPerkToast(t("item.lucky_pickaxe.name"));
      break;
    case "shard_drill":
      state.shardDrillLevel += 1;
      {
        const good = ALL_GOODS.find(g => g.id === effectId);
        const weakSpotChanceEffect = Array.isArray(good?.effect)
          ? good.effect.find((entry) => entry?.stat === "weakSpotChance")
          : null;
        if (weakSpotChanceEffect) {
          applyItemEffect(weakSpotChanceEffect, rarityMult, rarity);
        }
      }
      showPerkToast(t("item.shard_drill.name"));
      break;
    default: {
      const good = ALL_GOODS.find(g => g.id === effectId);
      if (good?.effect) applyItemEffect(good.effect, rarityMult, rarity);
      break;
    }
  }
}

function removeShopPerk(effectId, rarityMult, rarity) {
  const m = rarityMult || 1;
  switch (effectId) {
    case "drill_power": state.strikeSpeed -= 15 * m; break;
    case "side_drills": break;
    case "long_drill": break;
    case "diagonal_drills": break;
    case "sapper_charge":
      state.remoteBombLevel = Math.max(0, state.remoteBombLevel - 1);
      state.remoteBombInterval = state.remoteBombLevel > 0 ? Math.max(15, 30 - (state.remoteBombLevel - 1) * 5) : 0;
      break;
    case "fuel_tank": state.maxFuel -= Math.round(60 * m); state.fuel = Math.min(state.fuel, state.maxFuel); break;
    case "fuel_circuit": break;
    case "recirculator": state.fuelBonus -= 0.05 * m; break;
    case "low_fuel_boost": state.lowFuelSpeedBonus -= 0.35 * m; break;
    case "overload": state.overflowBomb = false; state.fuelBonus -= 0.20 * m; break;
    case "geo_lens": state.visionRadius = Math.max(VISION_RADIUS, state.visionRadius - Math.round(2 * m)); state.visibilityDirty = true; break;
    case "radar_module": state.radarCrystalModule = false; break;
    case "radar_booster": break;
    case "speed": state.strikeSpeed -= 20 * m; break;
    case "spike_boost": state.spikeOverdriveLevel = Math.max(0, (state.spikeOverdriveLevel || 0) - 1); break;
    case "tank_boost": state.tankBoostLevel = Math.max(0, (state.tankBoostLevel || 0) - 1); break;
    case "contour_trophy": state.loopPerkLevel = Math.max(0, (state.loopPerkLevel || 0) - 1); break;
    case "auto_contour": break;
    case "contour_resonance": state.contourLengthDamageLevel = Math.max(0, (state.contourLengthDamageLevel || 0) - 1); break;
    case "contour_recovery": state.contourReturnFuelLevel = Math.max(0, (state.contourReturnFuelLevel || 0) - 1); break;
    case "heat_sink": state.maxHeat -= Math.round(20 * m); break;
    case "heat_drill": break;
    case "thermo_charge": break;
    case "accel_dampers": break;
    case "cooling_pulse": break;
    case "thermo_rockets": state.heatOverloadRocketLevel = Math.max(0, (state.heatOverloadRocketLevel || 0) - 1); break;
    case "cryo_rockets": state.coolingRocketLevel = Math.max(0, (state.coolingRocketLevel || 0) - 1); break;
    case "reinforced_hull": state.maxHp -= Math.round(1 * m); state.hp = Math.min(state.hp, state.maxHp); break;
    case "adrenaline": state.overhealOverdriveDuration = Math.max(0, (state.overhealOverdriveDuration || 0) - Math.round(2 * m)); if (state.overhealOverdriveDuration <= 0) state.overhealOverdrive = false; break;
    case "ore_collector": break;
    case "crystal_catalyst": state.crystalCatalystLevel = Math.max(0, (state.crystalCatalystLevel || 0) - 1); break;
    case "basic_drill": break;
    case "blast_drill": break;
    case "tradeoff_drill": break;
    case "fragile_drill": break;
    case "lucky_pickaxe": break;
    case "shard_drill":
      state.shardDrillLevel = Math.max(0, state.shardDrillLevel - 1);
      {
        const good = ALL_GOODS.find(g => g.id === effectId);
        const weakSpotChanceEffect = Array.isArray(good?.effect)
          ? good.effect.find((entry) => entry?.stat === "weakSpotChance")
          : null;
        if (weakSpotChanceEffect) {
          reverseItemEffect(weakSpotChanceEffect, rarityMult, rarity);
        }
      }
      break;
    default: {
      const good = ALL_GOODS.find(g => g.id === effectId);
      if (good?.effect) reverseItemEffect(good.effect, rarityMult, rarity);
      break;
    }
  }
}

function getShopStatsSnapshot() {
  return {
    drillPower: state.drillPower,
    drillPiercingCount: state.drillPiercingCount || 0,
    drillPiercingDamage: state.drillPiercingDamage || 0,
    drillDiagonalCount: state.drillDiagonalCount || 0,
    drillDiagonalDamage: state.drillDiagonalDamage || 0,
    strikeSpeed: state.strikeSpeed + getFragileDrillSpeedBonus(),
    maxHp: state.maxHp,
    maxFuel: state.maxFuel,
    maxHeat: state.maxHeat,
    visionRadius: state.visionRadius,
    luck: state.luck,

    heatRate: state.heatRate,
    heat: state.heat,
    effectDurationRate: state.effectDurationRate,
    concentration: state.concentration,
    collapseBudgetMaxScale: state.collapseBudgetMaxScale || 0,
    fuelDrainRate: state.fuelDrainRate,
    fuelStarvationResistance: state.fuelStarvationResistance,
    goldBonus: state.goldBonus,
    fuelBonus: state.fuelBonus,
    goldBonusPerLevel: state.goldBonusPerLevel,
    explosionPowerPerLevel: state.explosionPowerPerLevel,
    speedOfAutoClose: state.speedOfAutoClose,
    damageBonus: state.damageBonus,
    explosionPower: state.explosionPower,
    explosionBonus: state.explosionBonus,
    explosionRadiusBonus: state.explosionRadiusBonus,
    lowFuelDamageBonus: state.lowFuelDamageBonus,
    weakSpotChance: state.weakSpotChance,
    weakSpotMult: state.weakSpotMult,
    miningGoldBonusMultiplier: state.miningGoldBonusMultiplier || 0,
    recipesCompletedThisRun: state.recipesCompletedThisRun || 0,
    contourLength: Math.max(0, state.pathTiles.length - 1),
    contourEnemyHpPerTileBonus: state.contourEnemyHpPerTileBonus || 0,
    contourEnemyRewardPerTileBonus: state.contourEnemyRewardPerTileBonus || 0,
    contourEnemySpawnRateBonus: state.contourEnemySpawnRateBonus || 0,
  };
}

function getShopDefaultStatsSnapshot() {
  return {
    drillPower: 0,
    drillPiercingCount: 0,
    drillPiercingDamage: 0,
    drillDiagonalCount: 0,
    drillDiagonalDamage: 0,
    strikeSpeed: 0,
    maxHp: START_HP,
    maxFuel: START_FUEL,
    maxHeat: MAX_HEAT,
    visionRadius: VISION_RADIUS,
    luck: 0,
    heatRate: 1,
    effectDurationRate: 1,
    concentration: 0,
    collapseBudgetMaxScale: 0,
    fuelDrainRate: 1,
    fuelStarvationResistance: 0,
    goldBonus: 0,
    fuelBonus: 0,
    speedOfAutoClose: 0,
    damageBonus: 0,
    explosionPower: 0,
    explosionBonus: 0,
    explosionRadiusBonus: 0,
    lowFuelDamageBonus: 0,
    weakSpotChance: 0,
    weakSpotMult: 2,
    miningGoldBonusMultiplier: 0,
    recipesCompletedThisRun: 0,
    contourLength: 0,
    contourEnemyHpPerTileBonus: 0,
    contourEnemyRewardPerTileBonus: 0,
    contourEnemySpawnRateBonus: 0,
  };
}

function normalizeItemEffectStat(stat) {
  return stat;
}

function applyItemEffect(effect, rarityMult, rarity) {
  if (!effect) return;
  const effects = Array.isArray(effect) ? effect : [effect];
  for (const e of effects) {
    if (!e.stat) continue;
    const stat = normalizeItemEffectStat(e.stat);
    const value = e.effectByRarity
      ? (e.effectByRarity[rarity] ?? e.effectByRarity[1] ?? 0)
      : e.value * (rarityMult || 1);
    if (stat === "goldRadarMode") {
      state.goldRadarMode = true;
      state.goldClustersCache = null;
    } else if (stat === "blueprintRadarMode") {
      state.blueprintRadarMode = true;
    } else if (stat === "navigatorMode") {
      state.navigatorMode = true;
    } else if (stat === "radarCrystalModule") {
      state.radarCrystalModule = true;
    } else if (stat === "collapseBudgetMaxScale") {
      applyCollapseBudgetMaxScaleDelta(value);
    } else if (stat === "maxHp" && value < 0) {
      state.maxHp = Math.max(1, state.maxHp + value);
      state.hp = Math.min(state.hp, state.maxHp);
    } else {
      state[stat] = (state[stat] || 0) + value;
    }
    if (stat === "visionRadius") state.visibilityDirty = true;
  }
}

function reverseItemEffect(effect, rarityMult, rarity) {
  if (!effect) return;
  const effects = Array.isArray(effect) ? effect : [effect];
  for (const e of effects) {
    if (!e.stat) continue;
    const stat = normalizeItemEffectStat(e.stat);
    const value = e.effectByRarity
      ? (e.effectByRarity[rarity] ?? e.effectByRarity[1] ?? 0)
      : e.value * (rarityMult || 1);
    if (stat === "maxHp" && value < 0) {
      state.maxHp = Math.max(1, state.maxHp - value);
      state.hp = Math.min(state.hp, state.maxHp);
    } else if (stat === "collapseBudgetMaxScale") {
      applyCollapseBudgetMaxScaleDelta(-value);
    } else {
      state[stat] = (state[stat] || 0) - value;
    }
    if (stat === "visionRadius") state.visibilityDirty = true;
  }
}

async function openDebugMapWindow() {
  const url = new URL(window.location.href);
  url.searchParams.set("debug-map", "1");
  url.searchParams.set("seed", String(state.worldSeed));
  const popup = window.open(url.toString(), "_blank");
  if (!popup) {
    showPerkToast(t("toast.browser_blocked_map"));
  }
}

function showDebugToast(text) {
  let host = document.getElementById("debugToastHost");
  if (!host) {
    host = document.createElement("div");
    host.id = "debugToastHost";
    host.style.cssText = "position:fixed;top:10px;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:6px;z-index:99999;pointer-events:none;";
    document.body.appendChild(host);
  }
  const el = document.createElement("div");
  el.style.cssText = "max-width:min(90vw,720px);background:rgba(0,0,0,0.85);color:#ff0;font:bold 13px monospace;padding:6px 12px;border-radius:6px;white-space:nowrap;box-shadow:0 6px 18px rgba(0,0,0,0.28);";
  el.textContent = text;
  host.appendChild(el);
  while (host.childElementCount > 8) {
    host.firstElementChild?.remove();
  }
  window.setTimeout(() => {
    el.remove();
    if (!host.childElementCount) host.remove();
  }, 4000);
}

window.__digShowAudioToast = (id, opts = {}) => {
  if (!state.debugAudioToastsEnabled) {
    return;
  }
  const parts = [`[audio] ${id}`];
  if (typeof opts.volume === "number") parts.push(`vol=${opts.volume.toFixed(2)}`);
  if (typeof opts.pitch === "number") parts.push(`pitch=${opts.pitch.toFixed(2)}`);
  showDebugToast(parts.join(" "));
};

function applyToast(item) {
  const duration = Math.max(0.1, Number(item.duration) || TOAST_DURATION_LEVEL_1);
  state.toastSeq += 1;
  const stackGap = 5;
  const baseHeight = 18;
  let nextStackOffset = 0;
  if (state.activeToasts.length > 0) {
    const maxOffset = Math.max(...state.activeToasts.map((toast) => toast.stackOffset || 0));
    nextStackOffset = maxOffset + baseHeight + stackGap;
  }
  state.activeToasts.push({
    id: state.toastSeq,
    text: item.text,
    color: item.color,
    time: duration,
    duration,
    stackOffset: nextStackOffset,
    wx: state.drill.renderX * TILE_SIZE + TILE_SIZE * 0.5 + (Math.random() - 0.5) * TILE_SIZE * 1.6,
    wy: state.drill.renderY * TILE_SIZE - 10,
  });
}

function getToastDurationByLevel(level = 1) {
  if (level >= 3) {
    return TOAST_DURATION_LEVEL_3;
  }
  if (level === 2) {
    return TOAST_DURATION_LEVEL_2;
  }
  return TOAST_DURATION_LEVEL_1;
}

function queueToast(text, color, level = 1) {
  state.toastQueue.push({ text, color, duration: getToastDurationByLevel(level) });
}

function debounceToast(key, value, color, fmt, level = 1) {
  const duration = getToastDurationByLevel(level);
  if (state.toastDebounceMap[key]) {
    state.toastDebounceMap[key].value += value;
    state.toastDebounceMap[key].timer = 0.1;
    state.toastDebounceMap[key].duration = duration;
  } else {
    state.toastDebounceMap[key] = { value, color, fmt, timer: 0.1, duration };
  }
}

function showPerkToast(text) {
  queueToast(`+ ${text}`, "#ffcf7a", 3);
}

function showCrystalToast(text) {
  queueToast(`+ ${text}`, "#ffcf7a", 2);
}

function showLevelToast(text) {
  queueToast(`+ ${text}`, "#ffcf7a", 3);
}

function showFuelToast(value) {
  const key = value >= 0 ? "fuel_pos" : "fuel_neg";
  debounceToast(
    key,
    value,
    value >= 0 ? "#ffbf62" : "#ff8f8f",
    v => (v >= 0 ? t("toast.fuel_plus_amount", { val: v }) : t("toast.fuel_minus_amount", { val: Math.abs(v) })),
    1,
  );
}

function showBonusFuelToast(value) {
  if (value <= 0) {
    return;
  }
  debounceToast("fuel_bonus", value, "#ffbf62", v => t("toast.fuel_bonus_amount", { val: v }), 1);
}

function showGoldToast(value) {
  debounceToast("gold", value, "#f8e040", v => `+${v} ●`, 1);
}

function showBonusGoldToast(value) {
  debounceToast("gold_bonus", value, "#f8e040", v => t("toast.bonus_gold", { val: v }), 1);
}

function showXpToast(value) {
  debounceToast("xp", value, "#78d8ff", v => `+${v} ◆`, 1);
}

function showBonusXpToast(value) {
  debounceToast("xp_bonus", value, "#78d8ff", v => t("toast.bonus_xp", { val: v }), 1);
}

function showHpGainToast(value) {
  if (value <= 0) {
    return;
  }
  debounceToast("hp_pos", value, "#8ff0a4", v => `+${v} HP`, 2);
}

function showBonusHpToast(value) {
  if (value <= 0) {
    return;
  }
  debounceToast("hp_bonus", value, "#8ff0a4", v => t("toast.bonus_hp", { val: v }), 2);
}

function showArmorGainToast(value) {
  if (value <= 0) {
    return;
  }
  debounceToast("armor_pos", value, "#9dd3ff", v => t("toast.armor_plus", { amount: v }), 2);
}

function showBonusArmorToast(value) {
  if (value <= 0) {
    return;
  }
  debounceToast("armor_bonus", value, "#9dd3ff", v => t("toast.bonus_armor", { val: v }), 2);
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
  if (state.pathTiles.length <= 1) {
    state.contourOverloadBrokenBlocks = 0;
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

function getEffectValueForRarity(effect, rarity) {
  if (!effect?.stat) {
    return 0;
  }
  if (effect.effectByRarity) {
    return effect.effectByRarity[rarity] ?? effect.effectByRarity[1] ?? 0;
  }
  return effect.value ?? 0;
}

function formatInspectSignedNumber(value, digits = 0) {
  const rounded = digits > 0 ? value.toFixed(digits) : String(Math.round(value));
  return `${value > 0 ? "+" : ""}${rounded}`;
}

function formatInspectEffectValue(stat, value) {
  const meta = ITEM_INSPECT_STAT_META[stat] || { label: stat, mode: "integer" };
  switch (meta.mode) {
    case "armor":
    case "hp":
      return formatInspectSignedNumber(value / 25);
    case "fixed1": {
      const digits = Math.abs(value % 1) > 0.001 ? 1 : 0;
      return formatInspectSignedNumber(value, digits);
    }
    case "integer":
      return formatInspectSignedNumber(value);
    case "rawpercent":
      return `${formatInspectSignedNumber(value)}%`;
    case "percent":
      return `${formatInspectSignedNumber(value * 100)}%`;
    case "multiplier":
      return `${formatInspectSignedNumber((value - 1) * 100)}%`;
    case "toggle":
      return t("ui.active");
    case "level":
      return t("ui.level_val", { val: Math.max(0, Math.round(value)) });
    default:
      return formatInspectSignedNumber(value);
  }
}

function getInspectEffectLines(good, rarity) {
  const specialLines = getSpecialInspectEffectLines(good, rarity);
  if (specialLines.length > 0) {
    return specialLines;
  }
  const effects = Array.isArray(good?.effect)
    ? good.effect
    : (good?.effect ? [good.effect] : []);
  return effects
    .filter((effect) => effect?.stat)
    .map((effect) => {
      const meta = ITEM_INSPECT_STAT_META[effect.stat] || { label: effect.stat, mode: "integer" };
      const value = getEffectValueForRarity(effect, rarity);
      return {
        label: meta.label,
        value: formatInspectEffectValue(effect.stat, value),
      };
    })
    .filter((line) => line.value && line.value !== "+0" && line.value !== "+0%" && line.value !== t("ui.level_val", { val: 0 }));
}

function getSpecialInspectEffectLines(good, rarity) {
  switch (good?.id) {
    case "basic_drill": {
      const flatDamage = [0, 10, 15, 20, 25][rarity] || 0;
      const damageScale = [0, 10, 15, 20, 25][rarity] || 0;
      const totalDamage = flatDamage + state.drillPower * (damageScale / 100);
      return [
        { label: t("inspect.flat_damage"), value: `+${flatDamage}` },
        { label: t("inspect.drill_scale"), value: `+${damageScale}%` },
        { label: t("inspect.current_damage"), value: formatPerkNumber(totalDamage) },
      ];
    }
    case "blast_drill": {
      const flatDamage = [0, 6, 10, 14, 18][rarity] || 0;
      const explosionScale = [0, 30, 40, 50, 60][rarity] || 0;
      const totalDamage = flatDamage + state.explosionPower * (explosionScale / 100);
      return [
        { label: t("inspect.flat_damage"), value: `+${flatDamage}` },
        { label: t("inspect.explosion_scale"), value: `+${explosionScale}%` },
        { label: t("inspect.current_damage"), value: formatPerkNumber(totalDamage) },
      ];
    }
    case "tradeoff_drill": {
      const flatDamage = [0, 16, 22, 30, 40][rarity] || 0;
      const weakSpotPenalty = [0, -0.3, -0.5, -0.7, -1.0][rarity] || 0;
      return [
        { label: t("inspect.flat_damage"), value: `+${flatDamage}` },
        { label: t("inspect.breach_penalty"), value: formatPerkNumber(weakSpotPenalty) },
      ];
    }
    case "thermo_drill": {
      const flatDamage = [0, 0, 20, 25, 30][rarity] || 0;
      const damageScale = [0, 0, 15, 20, 25][rarity] || 0;
      const heatBonus = [0, 0, 1, 2, 3][rarity] || 0;
      const totalDamage = flatDamage + state.drillPower * (damageScale / 100) + Math.floor(state.heat / 10) * heatBonus;
      return [
        { label: t("inspect.flat_damage"), value: `+${flatDamage}` },
        { label: t("inspect.drill_scale"), value: `+${damageScale}%` },
        { label: t("inspect.heat_bonus"), value: `+${heatBonus}` },
        { label: t("inspect.current_damage"), value: formatPerkNumber(totalDamage) },
      ].filter((line) => line.value !== "+0");
    }
    case "fragile_drill": {
      const flatDamage = [0, 10, 15, 20, 25][rarity] || 0;
      const damageScale = [0, 10, 15, 20, 25][rarity] || 0;
      const speedBonus = [0, 10, 15, 20, 30][rarity] || 0;
      const totalDamage = flatDamage + state.drillPower * (damageScale / 100);
      return [
        { label: t("inspect.flat_damage"), value: `+${flatDamage}` },
        { label: t("inspect.drill_scale"), value: `+${damageScale}%` },
        { label: t("inspect.speed_with_armor"), value: `+${speedBonus}%` },
        { label: t("inspect.current_damage"), value: formatPerkNumber(totalDamage) },
      ];
    }
    case "telescopic_drill": {
      const flatDamage = 10;
      const drillScale = [0, 10, 20, 30, 40][rarity] || 0;
      const pierceCount = 1;
      const pierceDamage = [0, 10, 20, 30, 40][rarity] || 0;
      const totalDamage = flatDamage + state.drillPower * (drillScale / 100);
      return [
        { label: t("inspect.flat_damage"), value: `+${flatDamage}` },
        { label: t("inspect.drill_scale"), value: `+${drillScale}%` },
        { label: t("stat.drillPiercingCount"), value: `+${pierceCount}` },
        { label: t("stat.drillPiercingDamage"), value: `+${pierceDamage}%` },
        { label: t("inspect.current_damage"), value: formatPerkNumber(totalDamage) },
      ];
    }
    case "diagonal_drill_array": {
      const flatDamage = 10;
      const drillScale = [0, 10, 15, 20, 25][rarity] || 0;
      const diagonalCount = 2;
      const diagonalDamage = [0, 10, 20, 30, 40][rarity] || 0;
      const totalDamage = flatDamage + state.drillPower * (drillScale / 100);
      return [
        { label: t("inspect.flat_damage"), value: `+${flatDamage}` },
        { label: t("inspect.drill_scale"), value: `+${drillScale}%` },
        { label: t("stat.drillDiagonalCount"), value: `+${diagonalCount}` },
        { label: t("stat.drillDiagonalDamage"), value: `+${diagonalDamage}%` },
        { label: t("inspect.current_damage"), value: formatPerkNumber(totalDamage) },
      ];
    }
    case "lucky_pickaxe": {
      const flatDamage = [0, 10, 15, 20, 25][rarity] || 0;
      const damageScale = [0, 10, 20, 30, 40][rarity] || 0;
      const luckScale = [0, 10, 15, 20, 25][rarity] || 0;
      const oreGain = [0, 1, 2, 3, 4][rarity] || 0;
      const totalDamage = flatDamage + state.drillPower * (damageScale / 100) + state.luck * (luckScale / 100);
      return [
        { label: t("inspect.flat_damage"), value: `+${flatDamage}` },
        { label: t("inspect.drill_scale"), value: `+${damageScale}%` },
        { label: t("inspect.luck_scale"), value: `+${luckScale}%` },
        { label: t("inspect.vein_value"), value: `+${oreGain}` },
        { label: t("inspect.current_damage"), value: formatPerkNumber(totalDamage) },
      ];
    }
    case "shard_drill": {
      const flatDamage = [0, 8, 12, 16, 20][rarity] || 0;
      const weakSpotChance = [0, 0.04, 0.06, 0.08, 0.10][rarity] || 0;
      const explosionDamage = [0, 20, 30, 45, 60][rarity] || 0;
      const explosionScale = 10;
      const totalExplosion = explosionDamage + state.explosionPower * (explosionScale / 100);
      return [
        { label: t("inspect.flat_damage"), value: `+${flatDamage}` },
        { label: t("inspect.breach_chance"), value: `+${Math.round(weakSpotChance * 100)}%` },
        { label: t("inspect.breach_explosion"), value: `+${explosionDamage} +${explosionScale}% [${formatPerkNumber(totalExplosion)}]` },
        { label: t("inspect.explosion_radius"), value: formatPerkNumber(SHARD_DRILL_BLAST_RADIUS, 1) },
      ];
    }
    case "cryo_rocket": {
      const rocketCount = 1;
      const rocketDamage = 20;
      const rocketScale = [0, 10, 15, 20, 25][rarity] || 0;
      const rocketTotal = rocketDamage + state.explosionPower * (rocketScale / 100);
      return [
        { label: t("stat.cryoRocketCount"), value: `${rocketCount}` },
        { label: t("inspect.on_cooling"), value: "20 heat" },
        { label: t("inspect.breach_explosion"), value: `+${rocketDamage} +${rocketScale}% [${formatPerkNumber(rocketTotal)}]` },
        { label: t("inspect.explosion_radius"), value: "1" },
        { label: t("stat.heatRate"), value: "-15%" },
      ];
    }
    case "contour_salvo_rack": {
      const rocketDamage = 20;
      const rocketScale = [0, 10, 15, 20, 25][rarity] || 0;
      const rocketTotal = rocketDamage + state.explosionPower * (rocketScale / 100);
      const contourBlocks = Math.max(0, Math.floor(state.pathTiles.length || 0));
      const rockets = Math.floor(contourBlocks / 4);
      return [
        { label: t("inspect.on_contour_closure"), value: t("inspect.one_rocket_per_4_blocks") },
        { label: t("inspect.current_rockets"), value: `${rockets}` },
        { label: t("inspect.breach_explosion"), value: `+${rocketDamage} +${rocketScale}% [${formatPerkNumber(rocketTotal)}]` },
        { label: t("inspect.explosion_radius"), value: "1" },
      ];
    }
    case "fuel_rocket": {
      const flatDamage = 15;
      const drillScale = [0, 10, 15, 20, 25][rarity] || 0;
      const rocketDamage = 20;
      const rocketScale = [0, 15, 20, 25, 30][rarity] || 0;
      const totalDamage = flatDamage + state.drillPower * (drillScale / 100);
      const rocketTotal = rocketDamage + state.explosionPower * (rocketScale / 100);
      return [
        { label: t("inspect.flat_damage"), value: `+${flatDamage}` },
        { label: t("inspect.drill_scale"), value: `+${drillScale}%` },
        { label: t("inspect.current_damage"), value: formatPerkNumber(totalDamage) },
        { label: t("inspect.on_fuel_pickup"), value: `+${rocketDamage} +${rocketScale}% [${formatPerkNumber(rocketTotal)}]` },
        { label: t("inspect.explosion_radius"), value: "1" },
      ];
    }
    case "beacon_alchemy_drill": {
      const baseFlat = 12;
      const beaconFlat = 20;
      const beaconScale = [0, 15, 20, 25, 30][rarity] || 0;
      const baseTotal = baseFlat;
      const beaconTotal = beaconFlat + state.drillPower * (beaconScale / 100);
      return [
        { label: t("inspect.flat_damage"), value: `+${baseFlat}` },
        { label: t("inspect.current_damage"), value: formatPerkNumber(baseTotal) },
        { label: t("inspect.beacon_direction_bonus"), value: `+${beaconFlat} +${beaconScale}% [${formatPerkNumber(beaconTotal)}]` },
        { label: t("inspect.beacon_radius"), value: "10" },
      ];
    }
    case "recipe_alchemy_drill": {
      const baseFlat = 5;
      const perRecipe = [0, 5, 7, 9, 11][rarity] || 0;
      const recipes = Math.max(0, Math.round(state.recipesCompletedThisRun || 0));
      const total = baseFlat + perRecipe * recipes;
      return [
        { label: t("inspect.flat_damage"), value: `+${baseFlat}` },
        { label: t("inspect.recipe_bonus"), value: `+${perRecipe}` },
        { label: t("inspect.recipes_collected"), value: `${recipes}` },
        { label: t("inspect.current_damage"), value: formatPerkNumber(total) },
      ];
    }
    case "contour_overload_drill": {
      const baseFlat = [0, 15, 20, 25, 30][rarity] || 0;
      const overflowFlat = [0, 30, 40, 50, 60][rarity] || 0;
      const overflowScale = [0, 20, 30, 40, 50][rarity] || 0;
      const overflowTotal = overflowFlat + state.explosionPower * (overflowScale / 100);
      return [
        { label: t("inspect.flat_damage"), value: `+${baseFlat}` },
        { label: t("inspect.current_damage"), value: formatPerkNumber(baseFlat) },
        { label: t("inspect.contour_overflow_explosion"), value: `+${overflowFlat} +${overflowScale}% [${formatPerkNumber(overflowTotal)}]` },
        { label: t("inspect.explosion_radius"), value: "1" },
        { label: t("inspect.unique_hit_rule"), value: t("inspect.unique_hit_rule_value") },
      ];
    }
    case "contour_line_drill": {
      const baseFlat = 10;
      const drillScale = [0, 10, 20, 30, 40][rarity] || 0;
      const perLength = [0, 1, 2, 3, 4][rarity] || 0;
      const contourLength = Math.max(0, state.pathTiles.length - 1);
      const total = baseFlat + state.drillPower * (drillScale / 100) + perLength * contourLength;
      return [
        { label: t("inspect.flat_damage"), value: `+${baseFlat}` },
        { label: t("inspect.drill_scale"), value: `+${drillScale}%` },
        { label: t("inspect.contour_length_scale"), value: `+${perLength}` },
        { label: t("inspect.contour_length"), value: `${contourLength}` },
        { label: t("inspect.current_damage"), value: formatPerkNumber(total) },
      ];
    }
    case "contour_resonance_drill": {
      const flat = 20;
      const explosionScale = [0, 10, 15, 20, 30][rarity] || 0;
      const total = flat + state.explosionPower * (explosionScale / 100);
      return [
        { label: t("inspect.contour_resonance_blast"), value: `+${flat} +${explosionScale}% [${formatPerkNumber(total)}]` },
        { label: t("inspect.on_breach_hit"), value: t("inspect.on_breach_hit_value") },
      ];
    }
    case "loop_pressure": {
      const duration = [0, 4, 4.5, 5, 5.5][rarity] || 0;
      const perBlock = [0, 3, 4, 5, 6][rarity] || 0;
      return [
        { label: t("inspect.duration"), value: `${formatPerkNumber(duration, 1)}s` },
        { label: t("inspect.drill_power_per_block"), value: `+${perBlock}` },
        { label: t("inspect.current_bonus"), value: `+${formatPerkNumber(state.loopPressureDrillPowerBonus || 0)}` },
      ];
    }
    case "contour_blast_pressure": {
      const duration = [0, 5, 6, 7, 8][rarity] || 0;
      const perBlock = 5;
      return [
        { label: t("inspect.duration"), value: `${formatPerkNumber(duration, 1)}s` },
        { label: t("inspect.explosion_power_per_block"), value: `+${perBlock}` },
        { label: t("inspect.current_bonus"), value: `+${formatPerkNumber(state.contourBlastPressureExplosionBonus || 0)}` },
      ];
    }
    default:
      return [];
  }
}

function getDebugCoreStatLines() {
  return DEBUG_CORE_STATS.map((def) => ({
    label: def.label,
    value: def.fmt(state[def.key] ?? 0),
  }));
}

function buildItemInspectEntries() {
  const entries = [];
  const equipped = getEquippedParts();
  for (let index = 0; index < equipped.length; index += 1) {
    const part = equipped[index];
    const def = ALL_EQUIPMENT.find((item) => item.id === part.id);
    if (!def) continue;
    entries.push({
      key: `equipment:${index}:${part.id}:${part.rarity || RARITY.COMMON}`,
      good: def,
      rarity: part.rarity || RARITY.COMMON,
      sourceLabel: t("ui.slot", { n: index + 1 }),
      stackCount: equipped.filter((entry) => entry.id === part.id).length,
    });
  }
  const purchased = getPurchasedItems();
  for (let index = 0; index < purchased.length; index += 1) {
    const item = purchased[index];
    const def = ALL_ITEMS.find((entry) => entry.id === item.id);
    if (!def) continue;
    entries.push({
      key: `item:${index}:${item.id}:${item.rarity || RARITY.COMMON}`,
      good: def,
      rarity: item.rarity || RARITY.COMMON,
      sourceLabel: t("ui.inventory"),
      stackCount: purchased.filter((entry) => entry.id === item.id).length,
    });
  }
  return entries;
}

function closeItemInspectModal() {
  state.itemInspectModalOpen = false;
  state.itemInspectItems = [];
  state.itemInspectIndex = -1;
  syncItemInspectModal();
}

function openItemInspectModal(entry) {
  if (!entry?.good) {
    return;
  }
  const items = buildItemInspectEntries();
  const index = items.findIndex((item) => item.key === entry.key);
  if (index >= 0) {
    state.itemInspectItems = items;
    state.itemInspectIndex = index;
  } else {
    state.itemInspectItems = [entry];
    state.itemInspectIndex = 0;
  }
  state.itemInspectModalOpen = true;
  syncItemInspectModal();
}

function stepItemInspectModal(direction) {
  if (!state.itemInspectModalOpen || state.itemInspectItems.length <= 1) {
    return;
  }
  const count = state.itemInspectItems.length;
  state.itemInspectIndex = (state.itemInspectIndex + direction + count) % count;
  syncItemInspectModal();
}

function findHudInspectableAt(clientX, clientY) {
  for (let i = state.hudInspectableRects.length - 1; i >= 0; i -= 1) {
    const entry = state.hudInspectableRects[i];
    if (isPointInsideRect(clientX, clientY, entry.rect)) {
      return entry;
    }
  }
  return null;
}

function syncItemInspectModal() {
  const overlay = document.getElementById("itemInspectModal");
  const panel = overlay?.querySelector(".item-inspect-modal__panel");
  if (!overlay || !panel) {
    return;
  }

  const currentEntry = state.itemInspectItems[state.itemInspectIndex];
  if (!state.itemInspectModalOpen || !currentEntry?.good) {
    overlay.hidden = true;
    overlay.style.cssText = "display:none;visibility:hidden;pointer-events:none;opacity:0;";
    syncTouchZonesInteractivity();
    return;
  }

  const { good, rarity, sourceLabel, stackCount } = currentEntry;
  const rarityColor = RARITY_COLORS[rarity] || "#aaa";
  const desc = getGoodDescription(good, rarity, getShopStatsSnapshot());
  const category = CATEGORIES.find((entry) => entry.id === good.category);
  const metaBits = [
    sourceLabel,
    category ? `${category.icon} ${category.name}` : null,
    stackCount > 1 ? t("ui.copies", { count: stackCount }) : null,
  ].filter(Boolean);
  const characterStatLines = getDebugCoreStatLines();
  const canNavigate = state.itemInspectItems.length > 1;
  const positionText = `${state.itemInspectIndex + 1}/${state.itemInspectItems.length}`;

  panel.innerHTML = `
    <button id="itemInspectClose" class="item-inspect-modal__close" type="button" aria-label="${t("ui.close_item")}">✕</button>
    <div class="item-inspect-modal__toolbar">
      <button id="itemInspectPrev" class="item-inspect-modal__nav" type="button" ${canNavigate ? "" : "disabled"} aria-label="${t("ui.prev_item")}">‹</button>
      <div class="item-inspect-modal__position">${positionText}</div>
      <button id="itemInspectNext" class="item-inspect-modal__nav" type="button" ${canNavigate ? "" : "disabled"} aria-label="${t("ui.next_item")}">›</button>
    </div>
    <div class="item-inspect-modal__head">
      <div class="item-inspect-modal__icon" style="--inspect-color:${rarityColor}">${good.icon || "?"}</div>
      <div class="item-inspect-modal__title-wrap">
        <div class="item-inspect-modal__eyebrow">${good.type === "equipment" ? t("ui.equipment") : t("ui.item")}</div>
        <div class="item-inspect-modal__title">${good.name}</div>
        <div class="item-inspect-modal__rarity" style="color:${rarityColor}">${RARITY_NAMES[rarity] || "Unknown"}</div>
      </div>
    </div>
    <div class="item-inspect-modal__meta">${metaBits.map((bit) => `<span class="item-inspect-modal__chip">${bit}</span>`).join("")}</div>
    <div class="item-inspect-modal__section">
      <div class="item-inspect-modal__section-title">${t("ui.description")}</div>
      <div class="item-inspect-modal__desc">${desc.replace(/\n/g, "<br>")}</div>
    </div>
    <div class="item-inspect-modal__section">
      <div class="item-inspect-modal__section-title">Core Stats</div>
      <div class="item-inspect-modal__stats item-inspect-modal__stats--character">
        ${characterStatLines.map((line) => `
          <div class="item-inspect-modal__stat">
            <span class="item-inspect-modal__stat-label">${line.label}</span>
            <span class="item-inspect-modal__stat-value">${line.value}</span>
          </div>
        `).join("")}
      </div>
    </div>
  `;

  overlay.hidden = false;
  overlay.removeAttribute("hidden");
  overlay.style.cssText = [
    "position:absolute",
    "inset:0",
    "z-index:10001",
    "display:flex",
    "visibility:visible",
    "pointer-events:auto",
    "opacity:1",
    "align-items:flex-end",
    "justify-content:center",
    "padding:20px",
    "background:rgba(8,4,2,0.72)",
    "backdrop-filter:blur(6px)",
  ].join(";");

  panel.querySelector("#itemInspectClose")?.addEventListener("click", closeItemInspectModal, { once: true });
  panel.querySelector("#itemInspectPrev")?.addEventListener("click", () => stepItemInspectModal(-1), { once: true });
  panel.querySelector("#itemInspectNext")?.addEventListener("click", () => stepItemInspectModal(1), { once: true });
  syncTouchZonesInteractivity();
}

function getShopInitOptions() {
  return {
    onClose: () => {
      playSound("shop_close");
      state.shopModalOpen = false;
      syncTouchZonesInteractivity();
      for (const beacon of state.beacons) {
        if (!beacon.rewardAutoAfterShop || beacon.rewardClaimed) continue;
        beginFullFreedom(beacon);
      }
      if (state.pendingBeaconWireActivation) {
        if (state.pendingBeaconWireActivation.rewardClaimed) {
          state.pendingBeaconWireActivation = null;
          state.pendingBeaconWireActivationAt = 0;
        } else {
          state.pendingBeaconWireActivationAt = (state.lastTs || performance.now()) + BEACON_WIRE_POST_SHOP_DELAY_MS;
        }
      }
    },
  };
}

function ensureCoreReady() {
  if (state.coreReady) return;
  initSounds();
  loadStoredGenerationConfig();
  state.ctx = state.canvas.getContext("2d");
  state.sprites = createSpriteAtlas();
  resize();
  initShop(getShopInitOptions());
  bindUi();
  state.coreReady = true;
}

function hasSeenIntroCutscene() {
  try {
    return localStorage.getItem(INTRO_CUTSCENE_SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

function markIntroCutsceneSeen() {
  try {
    localStorage.setItem(INTRO_CUTSCENE_SEEN_KEY, "1");
  } catch {}
}

function showStartOverlay(show) {
  const overlay = document.getElementById("startOverlay");
  if (!overlay) return;
  overlay.hidden = !show;
  if (show) {
    const newGameButton = document.getElementById("newGameButton");
    if (newGameButton) newGameButton.textContent = t("ui.new_game");
  }
}

function showFindHerButton(show) {
  const button = document.getElementById("cutFindHerButton");
  if (!button) return;
  button.textContent = t("ui.find_her");
  button.hidden = !show;
  button.style.display = show ? "inline-flex" : "none";
}

function formatRunTime(totalSeconds) {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function showBaseFoundOverlay(show, runTimeSec = 0) {
  const overlay = document.getElementById("baseFoundOverlay");
  if (!overlay) return;
  overlay.hidden = !show;
  if (!show) return;

  const title = document.getElementById("baseFoundTitle");
  const subtitle = document.getElementById("baseFoundSubtitle");
  const button = document.getElementById("playAgainButton");
  const timeText = formatRunTime(runTimeSec);
  if (title) title.textContent = t("ui.found_her_title");
  if (subtitle) subtitle.textContent = t("ui.found_her_desc_time", { time: timeText });
  if (button) button.textContent = t("ui.play_again");
}

function showDeadOverlay(show) {
  const overlay = document.getElementById("baseFoundOverlay");
  if (!overlay) return;
  overlay.hidden = !show;
  if (!show) return;

  const title = document.getElementById("baseFoundTitle");
  const subtitle = document.getElementById("baseFoundSubtitle");
  const button = document.getElementById("playAgainButton");
  if (title) title.textContent = t("ui.drill_broken");
  if (subtitle) subtitle.textContent = t("ui.drill_broken_desc");
  if (button) button.textContent = t("ui.play_again");
}

function startGameplayLoop() {
  if (state.gameLoopRunning) return;
  state.lastTs = 0;
  state.timeAcc = 0;
  state.gameLoopRunning = true;
  requestAnimationFrame(frame);
}

function startGameplayRun() {
  state.cutsceneModeActive = false;
  state.cutsceneLaunchesGame = false;
  state.cutscene = null;
  state.debugMapActive = false;
  state.debugMapGenerationPanelCollapsed = false;
  showFindHerButton(false);
  showStartOverlay(false);
  showBaseFoundOverlay(false);
  setupField();
  startGameplayLoop();
}

function startIntroCutsceneFromMenu() {
  showStartOverlay(false);
  showBaseFoundOverlay(false);
  state.cutsceneLaunchesGame = true;
  prepareCutsceneField();
  state.cutsceneModeActive = true;
  updateCutsceneControlsUi();
  requestAnimationFrame(cutsceneFrame);
}

function initMainMenuMode() {
  bindFatalErrorHandlers();
  try {
    ensureCoreReady();
    bindCutsceneControls();
    showFindHerButton(false);
    showBaseFoundOverlay(false);
    showStartOverlay(true);
    const newGameButton = document.getElementById("newGameButton");
    if (newGameButton && !newGameButton.dataset.boundStart) {
      newGameButton.dataset.boundStart = "1";
      newGameButton.addEventListener("click", () => {
        if (state.gameLoopRunning || state.cutsceneModeActive) return;
        if (hasSeenIntroCutscene()) {
          startGameplayRun();
        } else {
          startIntroCutsceneFromMenu();
        }
      });
    }
  } catch (error) {
    reportFatalError(error, "initMainMenuMode");
  }
}

function init() {
  bindFatalErrorHandlers();
  try {
    ensureCoreReady();
    setupField();
    startGameplayLoop();
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
  const menuToggle = document.getElementById("menuToggle");
  const menuPanel = document.getElementById("menuPanel");
  const reloadButton = document.getElementById("reloadGame");
  const soundToggle = document.getElementById("soundToggle");
  const langToggle = document.getElementById("langToggle");
  const playAgainButton = document.getElementById("playAgainButton");
  const manualOpen = document.getElementById("manualOpen");
  const manualClose = document.getElementById("manualClose");
  const manualOverlay = document.getElementById("manualModal");
  const manualPanel = manualOverlay?.querySelector(".manual-modal__panel");
  const manualFrame = document.getElementById("manualFrame");
  const menuSummaryItems = document.getElementById("menuSummaryItems");
  const menuSummaryStats = document.getElementById("menuSummaryStats");
  const menuSummaryItemsTitle = document.getElementById("menuSummaryItemsTitle");
  const menuSummaryStatsTitle = document.getElementById("menuSummaryStatsTitle");
  const itemInspectOverlay = document.getElementById("itemInspectModal");
  const itemInspectPanel = itemInspectOverlay?.querySelector(".item-inspect-modal__panel");
  const blueprintCategoryInspectOverlay = document.getElementById("blueprintCategoryInspectModal");
  const blueprintCategoryInspectPanel = document.getElementById("blueprintCategoryInspectPanel");
  const debugClose = document.getElementById("debugPerkClose");
  const debugOverlay = document.getElementById("debugPerkMenu");
  const debugPanel = debugOverlay?.querySelector(".debug-perk-menu__panel");
  const debugGenerationSection = document.getElementById("debugGenerationSection");
  const crystalRewardOverlay = document.getElementById("crystalReward");
  const crystalRewardClose = document.getElementById("crystalRewardClose");
  const blueprintChoiceOverlay = document.getElementById("blueprintChoice");
  const levelUpOverlay = document.getElementById("levelUpModal");
  const keysDown = new Set();

  window.addEventListener("resize", resize);
  window.visualViewport?.addEventListener("resize", resize);
  bindGenerationDebugControls();

  const closeMenu = () => {
    hideGoodTooltip();
    hideStatTooltip();
    if (menuPanel) menuPanel.hidden = true;
    state.menuOpen = false;
  };

  const formatMenuStatValue = (value, mode = "number") => {
    if (!Number.isFinite(value)) return "0";
    if (mode === "percent") {
      const rounded = Math.round(value * 100);
      return `${rounded > 0 ? "+" : ""}${rounded}%`;
    }
    if (mode === "rawpercent") {
      const rounded = Math.round(value);
      return `${rounded > 0 ? "+" : ""}${rounded}%`;
    }
    if (mode === "multiplier") {
      return `x${value.toFixed(2)}`;
    }
    if (mode === "fixed1") {
      return value % 1 === 0 ? String(Math.round(value)) : value.toFixed(1);
    }
    return String(Math.round(value));
  };

  const syncMenuSummary = () => {
    if (!menuSummaryItems || !menuSummaryStats) return;
    if (menuSummaryItemsTitle) menuSummaryItemsTitle.textContent = t("ui.inventory");
    if (menuSummaryStatsTitle) menuSummaryStatsTitle.textContent = t("ui.stats_hud");
    const equipped = getEquippedParts();
    const purchased = getPurchasedItems();
    const stacks = new Map();
    for (const part of equipped) {
      const rarity = part.rarity || RARITY.COMMON;
      const key = `eq:${part.id}:${rarity}`;
      const next = stacks.get(key) || { id: part.id, rarity, count: 0, source: "equipment" };
      next.count += 1;
      stacks.set(key, next);
    }
    for (const item of purchased) {
      const rarity = item.rarity || RARITY.COMMON;
      const key = `it:${item.id}:${rarity}`;
      const next = stacks.get(key) || { id: item.id, rarity, count: 0, source: "item" };
      next.count += 1;
      stacks.set(key, next);
    }
    const stackList = Array.from(stacks.values())
      .map((stack) => {
        const def = stack.source === "equipment"
          ? ALL_EQUIPMENT.find((entry) => entry.id === stack.id)
          : ALL_ITEMS.find((entry) => entry.id === stack.id);
        if (!def) return null;
        return {
          id: def.id,
          icon: def.icon || "?",
          count: stack.count,
          rarity: stack.rarity,
          source: stack.source,
          sourceLabel: stack.source === "equipment" ? t("ui.equipment") : t("ui.item"),
        };
      })
      .filter(Boolean);
    if (stackList.length === 0) {
      menuSummaryItems.innerHTML = `<div class="menu-summary__item">—</div>`;
    } else {
      menuSummaryItems.innerHTML = stackList
        .map(
          (entry) =>
            `<button class="menu-summary__item" type="button" data-good-id="${entry.id}" data-good-rarity="${entry.rarity}" data-good-source="${entry.source}" data-source-label="${entry.sourceLabel}">${entry.icon}${entry.count > 1 ? `<span class="menu-summary__count">x${entry.count}</span>` : ""}</button>`,
        )
        .join("");
    }

    const current = getShopStatsSnapshot();
    const defaults = getShopDefaultStatsSnapshot();
    const statDefs = [
      { key: "drillPower", format: "fixed1" },
      { key: "drillPiercingCount", format: null },
      { key: "drillPiercingDamage", format: "rawpercent" },
      { key: "drillDiagonalCount", format: null },
      { key: "drillDiagonalDamage", format: "rawpercent" },
      { key: "damageBonus", format: "rawpercent" },
      { key: "strikeSpeed", format: "rawpercent" },
      { key: "maxHp", format: null },
      { key: "maxFuel", format: null },
      { key: "maxHeat", format: null },
      { key: "heatRate", format: "multiplier" },
      { key: "effectDurationRate", format: "multiplier" },
      { key: "concentration", format: "multiplier" },
      { key: "fuelDrainRate", format: "multiplier" },
      { key: "visionRadius", format: null },
      { key: "luck", format: null },
      { key: "weakSpotChance", format: "percent" },
      { key: "weakSpotMult", format: "percent" },
      { key: "fuelStarvationResistance", format: "rawpercent" },
      { key: "goldBonus", format: "percent" },
      { key: "fuelBonus", format: "percent" },
      { key: "explosionPower", format: "fixed1" },
      { key: "explosionBonus", format: "rawpercent" },
      { key: "explosionRadiusBonus", format: "fixed1" },
      { key: "lowFuelDamageBonus", format: "percent" },
      { key: "goldBonusPerLevel", format: "percent" },
      { key: "miningGoldBonusMultiplier", format: "percent" },
      { key: "speedOfAutoClose", format: "rawpercent" },
    ];
    const changedRows = statDefs
      .map((def) => {
        const currentValue = Number.isFinite(current[def.key]) ? current[def.key] : 0;
        const baselineValue = Number.isFinite(defaults[def.key]) ? defaults[def.key] : 0;
        if (Math.abs(currentValue - baselineValue) <= 1e-6) return null;
        return {
          key: def.key,
          label: t(`shop.stat.${def.key}.short`),
          value: formatMenuStatValue(currentValue, def.format),
          delta: currentValue - baselineValue,
        };
      })
      .filter(Boolean);
    if (changedRows.length === 0) {
      menuSummaryStats.innerHTML = "";
    } else {
      menuSummaryStats.innerHTML = changedRows
        .map((row) => `<button class="menu-summary__stat" type="button" data-stat-key="${row.key}"><span class="menu-summary__stat-label">${row.label}</span><span class="menu-summary__stat-value ${row.delta >= 0 ? "menu-summary__stat-value--pos" : "menu-summary__stat-value--neg"}">${row.value}</span></button>`)
        .join("");
    }
  };
  state.syncMenuSummary = syncMenuSummary;

  if (menuSummaryItems) {
    const handleMenuSummaryItemActivate = (event) => {
      const hit = event.target instanceof Element ? event.target : null;
      const target = hit?.closest(".menu-summary__item[data-good-id][data-good-rarity]");
      if (!target) return;
      event.preventDefault();
      event.stopPropagation();
      const goodId = target.dataset.goodId || "";
      const sourceType = target.dataset.goodSource || "";
      const rarity = Number(target.dataset.goodRarity) || RARITY.COMMON;
      const sourceLabel = target.dataset.sourceLabel || t("ui.item");
      let good = null;
      if (sourceType === "equipment") {
        good = ALL_EQUIPMENT.find((entry) => entry.id === goodId) || null;
      } else if (sourceType === "item") {
        good = ALL_ITEMS.find((entry) => entry.id === goodId) || null;
      } else {
        good = ALL_GOODS.find((entry) => entry.id === goodId) || null;
      }
      if (!good) return;
      showGoodTooltip(
        {
          anchor: target,
          good,
          rarity,
          sourceLabel,
          stackCount: 1,
        },
        getShopStatsSnapshot(),
      );
    };
    menuSummaryItems.addEventListener("pointerdown", handleMenuSummaryItemActivate);
  }

  if (menuSummaryStats) {
    menuSummaryStats.addEventListener("pointerdown", (event) => {
      const hit = event.target instanceof Element ? event.target : null;
      const target = hit?.closest(".menu-summary__stat[data-stat-key]");
      if (!target) return;
      event.preventDefault();
      event.stopPropagation();
      const statKey = target.dataset.statKey || "";
      if (!statKey) return;
      showStatTooltipForStat(target, statKey, t(`shop.stat.${statKey}`));
    });
  }

  const syncLangToggle = () => {
    if (!langToggle) return;
    const locale = getLocale();
    langToggle.textContent = locale === "en" ? "🌐 EN → RU" : "🌐 RU → EN";
  };

  const syncSoundToggle = () => {
    if (!soundToggle) return;
    const muted = isMuted();
    const preload = getSoundPreloadProgress();
    const loadingText = !muted && preload.total > 0 && preload.percent < 100 ? ` ${preload.percent}%` : "";
    soundToggle.textContent = `${muted ? "🔇" : "🔊"} Sound${loadingText}`;
    soundToggle.setAttribute("aria-label", muted ? t("ui.enable_sound") : t("ui.disable_sound"));
  };

  syncSoundToggle();
  syncLangToggle();
  syncMenuSummary();

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
    if (state.beaconActivationAnim || isAnyBlockingModalOpen()) {
      return;
    }
    const inspectEntry = findHudInspectableAt(event.clientX, event.clientY);
    if (inspectEntry) {
      event.preventDefault();
      event.stopPropagation();
      resetPad();
      playSound("shop_open", { volume: 0.45 });
      openItemInspectModal(inspectEntry);
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
      playSound("perk_choose");
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
      playSound("shop_open");
      openShop(state.gold, state.currentDepthLevel, state.luck, getShopStatsSnapshot(), getShopDefaultStatsSnapshot());
    });
  }

  if (menuToggle && menuPanel) {
    menuToggle.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      state.menuOpen = !state.menuOpen;
      menuPanel.hidden = !state.menuOpen;
      if (state.menuOpen) {
        syncMenuSummary();
      }
      resetPad();
    });
    menuPanel.addEventListener("pointerdown", (event) => {
      const target = event.target instanceof Element ? event.target : null;
      const openTooltip = document.querySelector(".shop-item-tooltip:not([hidden]), .stat-tooltip:not([hidden])");
      if (openTooltip) {
        if (target?.closest(".shop-item-tooltip, .stat-tooltip")) return;
        hideGoodTooltip();
        hideStatTooltip();
        return;
      }
      if (target?.closest(".menu-modal__panel")) return;
      if (target?.closest("#menuSummary")) return;
      closeMenu();
    });
  }

  if (reloadButton) {
    reloadButton.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      window.location.reload();
    });
  }

  if (soundToggle) {
    soundToggle.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      setMuted(!isMuted());
      syncSoundToggle();
      closeMenu();
    });
  }

  if (langToggle) {
    langToggle.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      setLocale(getLocale() === "en" ? "ru" : "en");
      closeMenu();
      window.location.reload();
    });
  }

  if (playAgainButton && !playAgainButton.dataset.boundReplay) {
    playAgainButton.dataset.boundReplay = "1";
    playAgainButton.addEventListener("click", () => {
      if (state.cutsceneModeActive) return;
      startGameplayRun();
    });
  }

  document.addEventListener("shop:purchase-equipment", (e) => {
    const { effectId, cost, rarity, rarityMultiplier, isMerge, oldRarity, oldRarityMultiplier } = e.detail;
    playSound(isMerge ? "equipment_merge" : "purchase");
    state.gold = Math.max(0, state.gold - cost);
    if (isMerge) removeShopPerk(effectId, oldRarityMultiplier, oldRarity);
    applyShopPerk(effectId, rarityMultiplier, rarity);
    renderShop(state.gold, getShopStatsSnapshot(), getShopDefaultStatsSnapshot());
  });

  document.addEventListener("shop:purchase-item", (e) => {
    const { effect, cost, rarityMultiplier, rarity } = e.detail;
    playSound("purchase");
    state.gold = Math.max(0, state.gold - cost);
    applyItemEffect(effect, rarityMultiplier, rarity);
    renderShop(state.gold, getShopStatsSnapshot(), getShopDefaultStatsSnapshot());
  });

  document.addEventListener("shop:recycle", (e) => {
    const { effectId, rarity, rarityMultiplier, refund } = e.detail;
    playSound("recycle");
    removeShopPerk(effectId, rarityMultiplier, rarity);
    state.gold += refund;
    renderShop(state.gold, getShopStatsSnapshot(), getShopDefaultStatsSnapshot());
  });

  document.addEventListener("shop:rarity-upgrade", (e) => {
    const { cost } = e.detail;
    playSound("reroll");
    state.gold = Math.max(0, state.gold - cost);
    renderShop(state.gold, getShopStatsSnapshot(), getShopDefaultStatsSnapshot());
  });

  document.addEventListener("shop:synergies-changed", (e) => {
    const { removed, added } = e.detail;
    if (added.length > 0) playSound("synergy_found");
    for (const tier of removed) {
      for (const bonus of tier.bonuses) {
        if (typeof bonus.value === "number") {
          state[bonus.stat] = (state[bonus.stat] || 0) - bonus.value;
          if (bonus.stat === "visionRadius") state.visibilityDirty = true;
        }
      }
    }
    for (const tier of added) {
      for (const bonus of tier.bonuses) {
        if (typeof bonus.value === "number") {
          state[bonus.stat] = (state[bonus.stat] || 0) + bonus.value;
          if (bonus.stat === "visionRadius") state.visibilityDirty = true;
        }
      }
    }
  });

  if (manualOpen) {
    manualOpen.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      closeMenu();
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

  if (itemInspectOverlay) {
    itemInspectOverlay.addEventListener("click", (event) => {
      if (event.target !== itemInspectOverlay) {
        return;
      }
      closeItemInspectModal();
    });
  }

  if (itemInspectPanel) {
    itemInspectPanel.addEventListener("pointerdown", (event) => {
      event.stopPropagation();
    });
    itemInspectPanel.addEventListener("click", (event) => {
      event.stopPropagation();
    });
  }

  if (blueprintCategoryInspectOverlay) {
    blueprintCategoryInspectOverlay.addEventListener("click", (event) => {
      if (event.target !== blueprintCategoryInspectOverlay) {
        return;
      }
      closeBlueprintCategoryInspectModal();
    });
  }

  if (blueprintCategoryInspectPanel) {
    blueprintCategoryInspectPanel.addEventListener("pointerdown", (event) => {
      event.stopPropagation();
    });
    blueprintCategoryInspectPanel.addEventListener("click", (event) => {
      event.stopPropagation();
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

  const debugToggleAudioToasts = document.getElementById("debugToggleAudioToasts");
  if (debugToggleAudioToasts) {
    debugToggleAudioToasts.addEventListener("click", () => {
      state.debugAudioToastsEnabled = !state.debugAudioToastsEnabled;
      showPerkToast(`Audio toasts ${state.debugAudioToastsEnabled ? "ON" : "OFF"}`);
      syncDebugPerkOverlay();
    });
  }

  const debugAddGold = document.getElementById("debugAddGold");
  if (debugAddGold) {
    debugAddGold.addEventListener("click", () => {
      state.gold += 500;
      renderShop(state.gold, getShopStatsSnapshot(), getShopDefaultStatsSnapshot());
      showPerkToast(t("toast.gold_added"));
    });
  }

  const debugAddUnsafeGold = document.getElementById("debugAddUnsafeGold");
  if (debugAddUnsafeGold) {
    debugAddUnsafeGold.addEventListener("click", () => {
      state.unsafeGold += 100;
      showPerkToast(t("toast.unsafe_gold_added"));
    });
  }

  const debugAddFuel = document.getElementById("debugAddFuel");
  if (debugAddFuel) {
    debugAddFuel.addEventListener("click", () => {
      state.fuel = Math.min(state.fuel + 200, state.maxFuel);
      showPerkToast(t("toast.fuel_added"));
    });
  }

  const debugZeroFuel = document.getElementById("debugZeroFuel");
  if (debugZeroFuel) {
    debugZeroFuel.addEventListener("click", () => {
      state.fuel = 0;
      showPerkToast(t("toast.fuel_zero"));
    });
  }

  const debugHealFull = document.getElementById("debugHealFull");
  if (debugHealFull) {
    debugHealFull.addEventListener("click", () => {
      state.hp = state.maxHp;
      showPerkToast(t("toast.hp_restored"));
    });
  }

  const debugGiveBlueprint = document.getElementById("debugGiveBlueprint");
  if (debugGiveBlueprint) {
    debugGiveBlueprint.addEventListener("click", () => {
      state.blueprintCount++;
      showPerkToast(t("toast.artifact_given"));
      state.debugPerkMenuOpen = false;
      syncDebugPerkOverlay();
    });
  }

  const debugResetIntroCutscene = document.getElementById("debugResetIntroCutscene");
  if (debugResetIntroCutscene) {
    debugResetIntroCutscene.addEventListener("click", () => {
      try {
        localStorage.removeItem(INTRO_CUTSCENE_SEEN_KEY);
      } catch {}
      showPerkToast("Intro cutscene flag reset");
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
        showPerkToast(t("toast.key_given", { id: nearest }));
      } else {
        showPerkToast(t("toast.no_closed_safes"));
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
        showPerkToast(t("toast.teleport_beacon", { x: nearest.x, y: nearest.y }));
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
        showPerkToast(t("toast.teleport_safe", { x: nearest.doorX, y: nearest.doorY }));
      } else {
        showPerkToast(t("toast.no_closed_safes"));
      }
      state.debugPerkMenuOpen = false;
      syncDebugPerkOverlay();
    });
  }

  const debugSpawnContourEnemy = document.getElementById("debugSpawnContourEnemy");
  if (debugSpawnContourEnemy) {
    debugSpawnContourEnemy.addEventListener("click", () => {
      state.contourEnemy = null;
      if (state.pathTiles.length >= 2) {
        spawnContourEnemy();
        showPerkToast(t("toast.enemy_spawned"));
      } else {
        // Force-spawn at drill position even without contour
        const hp = CONTOUR_ENEMY_BASE_HP;
        const fx = state.drill.x + (state.drill.facingX || 1) * 3;
        const fy = state.drill.y + (state.drill.facingY || 0) * 3;
        state.contourEnemy = {
          x: fx, y: fy,
          renderX: fx, renderY: fy,
          prevX: fx, prevY: fy,
          hp, maxHp: hp,
          reward: CONTOUR_ENEMY_BASE_REWARD,
          tilesEaten: 0,
          mode: 'pathing', turnDelayTimer: 0,
          attackTimer: CONTOUR_ENEMY_ATTACK_INTERVAL,
          attackPhase: null, attackTelegraphTimer: 0,
          attackTargetX: 0, attackTargetY: 0,
          facingX: 0, facingY: 1, stunTimer: 0,
          knockbackTimer: 0,
          knockbackFromX: fx, knockbackFromY: fy,
          bobPhase: 0,
        };
        showPerkToast(t("toast.enemy_spawned_nearby"));
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
        showPerkToast(t("toast.teleport_beacon", { x: nearest.x, y: nearest.y }));
      } else {
        showPerkToast(t("toast.no_worm_nests"));
      }
      state.debugPerkMenuOpen = false;
      syncDebugPerkOverlay();
    });
  }

  const debugTeleportBoulder = document.getElementById("debugTeleportBoulder");
  if (debugTeleportBoulder) {
    debugTeleportBoulder.addEventListener("click", () => {
      let nearest = null;
      let bestDist = Infinity;

      for (const b of state.boulders) {
        const d = Math.abs(b.x - state.drill.x) + Math.abs(b.y - state.drill.y);
        if (d < bestDist) {
          bestDist = d;
          nearest = { x: b.x, y: b.y };
        }
      }

      for (let y = 1; y < GRID_H - 1; y += 1) {
        for (let x = 1; x < GRID_W - 1; x += 1) {
          if (!state.boulderPocketMask[cellIndex(x, y)]) continue;
          const d = Math.abs(x - state.drill.x) + Math.abs(y - state.drill.y);
          if (d < bestDist) {
            bestDist = d;
            nearest = { x, y };
          }
        }
      }

      if (nearest) {
        const tx = clamp(nearest.x - 2, 1, GRID_W - 2);
        const ty = clamp(nearest.y, 1, GRID_H - 2);
        state.drill.x = tx;
        state.drill.y = ty;
        state.drill.renderX = tx;
        state.drill.renderY = ty;
        state.visibilityDirty = true;
        carveTunnel(tx, ty);
        state.pathTiles.length = 0;
        state.pathTiles.push({ x: tx, y: ty });
        rebuildPathIndex();
        showPerkToast(t("toast.teleport_boulder", { x: nearest.x, y: nearest.y }));
      } else {
        showPerkToast(t("toast.no_boulders"));
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
      showPerkToast(t("toast.zone", { name: TILE_PERK_TYPES[perkType].name, x: Math.round(nearest.x), y: Math.round(nearest.y) }));
    } else {
      showPerkToast(t("toast.no_zones", { name: TILE_PERK_TYPES[perkType].name }));
    }
    state.debugPerkMenuOpen = false;
    syncDebugPerkOverlay();
  }

  function teleportToNearestDualStatZone() {
    let nearest = null;
    let bestDist = Infinity;
    for (const z of state.perkZones) {
      if (z.collected || z.kind !== "dual_stat") continue;
      const d = Math.abs(Math.round(z.x) - state.drill.x) + Math.abs(Math.round(z.y) - state.drill.y);
      if (d < bestDist) {
        bestDist = d;
        nearest = z;
      }
    }
    if (nearest) {
      const tx = clamp(Math.round(nearest.x) - 2, 1, GRID_W - 2);
      const ty = clamp(Math.round(nearest.y), 1, GRID_H - 2);
      state.drill.x = tx;
      state.drill.y = ty;
      state.drill.renderX = tx;
      state.drill.renderY = ty;
      state.visibilityDirty = true;
      carveTunnel(tx, ty);
      state.pathTiles.length = 0;
      state.pathTiles.push({ x: tx, y: ty });
      rebuildPathIndex();
      showPerkToast(t("toast.zone", { name: "D/E", x: Math.round(nearest.x), y: Math.round(nearest.y) }));
    } else {
      showPerkToast(t("toast.no_zones", { name: "D/E" }));
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
  const debugZoneDual = document.getElementById("debugZoneDual");
  if (debugZoneDual) {
    debugZoneDual.addEventListener("click", teleportToNearestDualStatZone);
  }

  const debugOpenShop = document.getElementById("debugOpenShop");
  if (debugOpenShop) {
    debugOpenShop.addEventListener("click", () => {
      state.debugPerkMenuOpen = false;
      syncDebugPerkOverlay();
      state.shopModalOpen = true;
      syncTouchZonesInteractivity();
      playSound("shop_open");
      openShop(state.gold, state.currentDepthLevel, state.luck, getShopStatsSnapshot(), getShopDefaultStatsSnapshot());
    });
  }

  const debugOpenMap = document.getElementById("debugOpenMap");
  if (debugOpenMap) {
    debugOpenMap.addEventListener("click", () => {
      openDebugMapWindow().catch((error) => {
        reportFatalError(error, "openDebugMapWindow");
      });
    });
  }

  const debugFinishRecipe = document.getElementById("debugFinishRecipe");
  if (debugFinishRecipe) {
    debugFinishRecipe.addEventListener("click", () => {
      if (state.crystalRecipe && state.crystalRecipe.length > 0) {
        const firstType = state.crystalRecipe[0];
        const recipe = [...state.crystalRecipe];
        clearCrystalRecipe();
        grantCrystalRecipeReward(firstType, recipe, state.drill.x, state.drill.y);
        showPerkToast(t("toast.recipe_done"));
      } else {
        showPerkToast(t("toast.no_active_recipe"));
      }
      state.debugPerkMenuOpen = false;
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

  if (blueprintChoiceOverlay) {
    blueprintChoiceOverlay.addEventListener("click", (event) => {
      const inspectBtn = event.target.closest(".blueprint-choice__card-inspect");
      if (inspectBtn) {
        event.stopPropagation();
        const categoryId = inspectBtn.dataset.categoryInspect || "";
        const category = state.blueprintChoiceCategories.find((cat) => cat.id === categoryId);
        if (category) openBlueprintCategoryInspectModal(category);
        return;
      }
      const continueBtn = event.target.closest("#blueprintChoiceContinue");
      if (continueBtn) {
        continueArtifactBenefitChoice();
        return;
      }
      const card = event.target.closest(".blueprint-choice__card");
      if (!card) return;
      const idx = card.id === "blueprintChoiceCard0" ? 0 : 1;
      pickArtifactChoice(idx);
    });
  }

  if (levelUpOverlay) {
    levelUpOverlay.addEventListener("click", (event) => {
      const inspectBtn = event.target.closest("[data-level-reward-inspect-stat]");
      if (inspectBtn) {
        event.stopPropagation();
        const statKey = inspectBtn.dataset.levelRewardInspectStat;
        if (statKey) {
          showStatTooltipForStat(inspectBtn, statKey, t(`shop.stat.${statKey}.label`));
        }
        return;
      }
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
  state.syncSoundToggleButton = syncSoundToggle;
}

function isPointInsideRect(x, y, rect) {
  return !!rect && x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
}

function buildDebugPerkButtons() {
  const tileRoot = document.getElementById("debugTilePerks");
  const instrRoot = document.getElementById("debugInstruments");
  const goodsRoot = document.getElementById("debugGoods");
  const statsRoot = document.getElementById("debugCoreStats");
  if (!tileRoot) {
    return;
  }

  // Categories list
  if (instrRoot) {
    instrRoot.innerHTML = "";
    const lockedCats = getLockedCategories();
    const lockedIds = new Set(lockedCats.map(c => c.id));
    for (const cat of CATEGORIES) {
      const unlocked = !lockedIds.has(cat.id);
      const button = document.createElement("button");
      button.type = "button";
      button.className = `debug-perk-menu__button${unlocked ? " debug-perk-menu__button--selected" : ""}`;
      button.innerHTML = `<span class="debug-perk-menu__button-name">${cat.icon} ${cat.name}</span><span class="debug-perk-menu__button-meta">${unlocked ? t("ui.cat_unlocked") : t("ui.cat_locked")}</span>`;
      button.addEventListener("click", () => {
        if (!unlocked) {
          unlockCategory(cat.id);
          addSlot();
          showPerkToast(t("toast.category_unlocked", { icon: cat.icon, name: cat.name }));
        }
        buildDebugPerkButtons();
      });
      instrRoot.appendChild(button);
    }
  }

  if (goodsRoot) {
    goodsRoot.innerHTML = "";
    const debugGoods = ALL_GOODS
      .filter((good) => good.type === "item" || good.type === "equipment")
      .slice();

    const byName = (a, b) => {
      const nameCmp = (a.name || "").localeCompare(b.name || "", "ru", { sensitivity: "base" });
      return nameCmp !== 0 ? nameCmp : a.id.localeCompare(b.id);
    };
    const categoryNameById = new Map(CATEGORIES.map((cat) => [cat.id, `${cat.icon} ${cat.name}`]));
    const grouped = new Map();
    for (const good of debugGoods) {
      const key = good.category || "uncategorized";
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(good);
    }

    const orderedCategoryIds = [
      ...CATEGORIES.map((cat) => cat.id),
      ...Array.from(grouped.keys()).filter((id) => !CATEGORIES.some((cat) => cat.id === id)).sort(),
    ];

    for (const categoryId of orderedCategoryIds) {
      const goodsInCategory = grouped.get(categoryId);
      if (!goodsInCategory || goodsInCategory.length === 0) continue;

      goodsInCategory.sort(byName);
      const heading = document.createElement("div");
      heading.className = "debug-perk-menu__subhead";
      heading.textContent = categoryNameById.get(categoryId) || categoryId;
      goodsRoot.appendChild(heading);

      for (const good of goodsInCategory) {
        const minRarity = good.minRarity ?? RARITY.COMMON;
        const isEquipment = good.type === "equipment";
        const button = document.createElement("button");
        button.type = "button";
        button.className = "debug-perk-menu__button";
        button.innerHTML = `<span class="debug-perk-menu__button-name">${good.icon || "?"} ${good.name}</span><span class="debug-perk-menu__button-meta">${isEquipment ? t("ui.equipment") : t("ui.item")} · ${RARITY_NAMES[minRarity]}</span>`;
        button.addEventListener("click", () => {
          const result = grantGood(good, minRarity);
          if (result.ok) {
            showPerkToast(`${good.icon || "?"} ${good.name} (${RARITY_NAMES[result.rarity]})`);
            state.syncMenuSummary?.();
            return;
          }
          if (result.reason === "no-slot") {
            showPerkToast("Нет свободных слотов экипировки");
            return;
          }
          showPerkToast("Не удалось добавить");
        });
        goodsRoot.appendChild(button);
      }
    }
  }

  // Core stats -/+ controls
  if (statsRoot) {
    statsRoot.innerHTML = "";
    for (const def of DEBUG_CORE_STATS) {
      const row = document.createElement("div");
      row.className = "debug-stat-row";
      const nameEl = document.createElement("span");
      nameEl.className = "debug-stat-row__name";
      nameEl.textContent = def.label;
      const valueEl = document.createElement("span");
      valueEl.className = "debug-stat-row__value";
      valueEl.textContent = def.fmt(state[def.key] ?? 0);
      const minus = document.createElement("button");
      minus.type = "button";
      minus.className = "debug-stat-row__btn";
      minus.textContent = "−";
      minus.addEventListener("click", () => {
        state[def.key] = (state[def.key] ?? 0) - def.step;
        if (def.key === "visionRadius") state.visibilityDirty = true;
        valueEl.textContent = def.fmt(state[def.key]);
      });
      const plus = document.createElement("button");
      plus.type = "button";
      plus.className = "debug-stat-row__btn";
      plus.textContent = "+";
      plus.addEventListener("click", () => {
        state[def.key] = (state[def.key] ?? 0) + def.step;
        if (def.key === "visionRadius") state.visibilityDirty = true;
        valueEl.textContent = def.fmt(state[def.key]);
      });
      row.append(nameEl, minus, valueEl, plus);
      statsRoot.appendChild(row);
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
    button.innerHTML = `<span class="debug-perk-menu__button-name"><span class="debug-perk-menu__icon" style="--perk-icon:${JSON.stringify(perk.color)}">${perk.icon}</span>${perk.name}</span>${isSelected ? `<span class="debug-perk-menu__button-meta">${perk.desc}</span><span class="debug-perk-menu__button-meta">${t("ui.perk_click_again")}</span>` : ""}`;
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
}

function syncGenerationDebugEditor() {
  const editor = document.getElementById("debugGenerationEditor");
  const quickEditor = document.getElementById("debugGenerationQuickEditor");
  if (editor && document.activeElement !== editor) {
    if (!state.generationEditorText) {
      state.generationEditorText = JSON.stringify(getGenerationConfig(), null, 2);
    }
    editor.value = state.generationEditorText;
  }
  if (!quickEditor?.contains(document.activeElement)) {
    renderGenerationQuickEditor();
  }
  syncGenerationStatusOnly();
}

function regenerateCurrentSeed(reopenDebugMenu = false) {
  const seed = state.worldSeed || newWorldSeed();
  setupField(seed);
  revealFullMapInDebugMode();
  state.debugMapRequestRender?.();
  if (reopenDebugMenu) {
    if (DEBUG_MODE && state.debugMapActive) {
      showDebugMapGenerationPanel();
      return;
    }
    state.debugPerkMenuOpen = true;
    syncDebugPerkOverlay();
  }
}

function syncCrystalItemOffer() {
  const overlay = document.getElementById("crystalItemOffer");
  if (!overlay) return;
  if (!state.crystalItemOfferOpen || !state.crystalItemOfferGood) {
    overlay.hidden = true;
    overlay.style.cssText = "display:none;visibility:hidden;pointer-events:none;opacity:0;";
    syncTouchZonesInteractivity();
    return;
  }
  overlay.hidden = false;
  overlay.removeAttribute("hidden");
  overlay.style.cssText = [
    "position:absolute", "inset:0", "z-index:9998", "display:flex",
    "visibility:visible", "pointer-events:auto", "opacity:1",
    "align-items:center", "justify-content:center", "padding:20px",
    "background:rgba(7,4,3,0.78)", "backdrop-filter:blur(8px)",
  ].join(";");

  const revealed = state.crystalItemOfferRevealed;
  const displayGood = revealed ? state.crystalItemOfferGood : (state.crystalItemOfferPreview || state.crystalItemOfferGood);
  const rarity = state.crystalItemOfferRarity;
  const color = revealed ? (RARITY_COLORS[rarity] || "#aaa") : "#6e5b48";
  const rarityName = RARITY_NAMES[rarity] || "";

  const panel = overlay.querySelector(".crystal-item-offer__panel") || overlay;

  overlay.innerHTML = `
    <div class="crystal-item-offer__panel">
      <div class="crystal-item-offer__eyebrow">${state.crystalItemOfferTitle || t("ui.recipe_complete")}</div>
      <div class="crystal-item-offer__card ${revealed ? "crystal-item-offer__card--revealed" : "crystal-item-offer__card--shuffling"}" style="--offer-color:${color}">
        <div class="crystal-item-offer__icon">${displayGood?.icon || "?"}</div>
        <div class="crystal-item-offer__name">${revealed ? displayGood?.name : "???"}</div>
        <div class="crystal-item-offer__rarity" style="color:${color}">${revealed ? rarityName : "·····"}</div>
        <div class="crystal-item-offer__desc">${revealed ? getGoodDescription(displayGood, rarity) : t("ui.shuffling")}</div>
      </div>
      ${revealed ? `
        <div class="crystal-item-offer__actions">
          <button class="crystal-item-offer__btn crystal-item-offer__btn--accept" type="button" id="crystalItemAccept" style="border-color:${color}">${t("ui.take")}</button>
          <button class="crystal-item-offer__btn crystal-item-offer__btn--decline" type="button" id="crystalItemDecline">${t("ui.decline")}</button>
        </div>
      ` : ""}
    </div>
  `;

  if (revealed) {
    overlay.querySelector("#crystalItemAccept")?.addEventListener("click", () => acceptCrystalItemOffer());
    overlay.querySelector("#crystalItemDecline")?.addEventListener("click", () => declineCrystalItemOffer());
  }
  syncTouchZonesInteractivity();
}

function acceptCrystalItemOffer() {
  if (!state.crystalItemOfferGood) return;
  grantItem(state.crystalItemOfferGood, state.crystalItemOfferRarity);
  state.crystalItemOfferOpen = false;
  state.crystalItemOfferGood = null;
  state.crystalItemOfferTitle = t("ui.recipe_complete");
  syncCrystalItemOffer();
}

function declineCrystalItemOffer() {
  state.crystalItemOfferOpen = false;
  state.crystalItemOfferGood = null;
  state.crystalItemOfferTitle = t("ui.recipe_complete");
  syncCrystalItemOffer();
}

function syncTouchZonesInteractivity() {
  const touchZones = document.querySelector(".touch-zones");
  if (!touchZones) {
    return;
  }
  touchZones.style.pointerEvents = state.beaconActivationAnim || isAnyBlockingModalOpen()
    ? "none"
    : "auto";
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
  syncGenerationDebugEditor();
  syncTouchZonesInteractivity();
}

function syncDebugPerkOverlay() {
  const overlay = document.getElementById("debugPerkMenu");
  if (!overlay) {
    return;
  }
  const seedDisplay = document.getElementById("debugSeedDisplay");
  const debugToggleAudioToasts = document.getElementById("debugToggleAudioToasts");
  if (seedDisplay) seedDisplay.textContent = `Seed: ${state.worldSeed}`;
  if (debugToggleAudioToasts) {
    debugToggleAudioToasts.textContent = `🔊 Audio Toasts: ${state.debugAudioToastsEnabled ? "ON" : "OFF"}`;
    debugToggleAudioToasts.classList.toggle("debug-perk-menu__button--selected", state.debugAudioToastsEnabled);
  }

  if (state.debugPerkMenuOpen) {
    overlay.hidden = false;
    overlay.removeAttribute("hidden");
    overlay.style.cssText = [
      "position:fixed",
      "inset:0",
      "z-index:9999",
      "display:flex",
      "visibility:visible",
      "pointer-events:auto",
      "opacity:1",
      "align-items:flex-start",
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
  return `<div class="crystal-reward__tile" style="--perk-color:${perk.color}"><span class="crystal-reward__tile-icon">${perk.icon}</span></div><div class="crystal-reward__name">${isRevealed ? perk.name : "???"}</div><div class="crystal-reward__desc">${isRevealed ? perk.desc : t("ui.shuffling")}</div>`;
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

function getLevelRewardChoices(entry = getCurrentLevelRewardEntry()) {
  if (!entry) return [];
  return entry.choices || [];
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
  if (state.levelUpModalDelay > 0) {
    return;
  }
  if (
    state.beaconActivationAnim ||
    state.itemInspectModalOpen ||
    state.menuOpen ||
    state.manualModalOpen ||
    state.shopModalOpen ||
    state.debugPerkMenuOpen ||
    state.crystalRewardModalOpen ||
    state.blueprintChoiceOpen ||
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
  eyebrow.textContent = t("levelup.eyebrow", { level: entry.level });
  title.textContent = t("levelup.title");
  text.textContent = t("levelup.text");
  choices.innerHTML = rewardChoices.map((choice) => {
    const color = RARITY_COLORS[choice.rarity] || "#aaa";
    const rarityName = RARITY_NAMES[choice.rarity] || "";
    return `
    <button class="level-up-modal__choice" type="button" data-level-reward-id="${choice.id}" style="border-color:${color}">
      <span class="level-up-modal__choice-head">
        <span class="level-up-modal__choice-label">${choice.label}</span>
        <span class="level-up-modal__choice-inspect" role="button" tabindex="0" data-level-reward-inspect-stat="${choice.stat}" aria-label="${t("ui.description")}">i</span>
      </span>
      <span class="level-up-modal__choice-text" style="color:${color}">${rarityName}</span>
    </button>`;
  }).join("");
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
  state.blueprintCount++;
  showPerkToast(t("toast.artifact_received"));
}

function restorePlayerFully() {
  const fuelDelta = Math.max(0, state.maxFuel - state.fuel);
  state.fuel = state.maxFuel;
  if (fuelDelta > 0) {
    showFuelToast(fuelDelta);
  }
  const missingHp = Math.max(0, state.maxHp - state.hp);
  if (missingHp > 0) {
    healPlayer(missingHp, t("toast.full_recovery"));
  }
  showPerkToast(t("toast.full_recovery"));
}

function applyLevelUpItemBonuses() {
  if (state.drillPowerPerLevel > 0) {
    state.drillPower += state.drillPowerPerLevel;
  }
  if (state.explosionPowerPerLevel > 0) {
    state.explosionPower += state.explosionPowerPerLevel;
  }
  if (state.strikeSpeedPerLevel > 0) {
    state.strikeSpeed += state.strikeSpeedPerLevel;
  }
  if (state.fuelPerLevel > 0) {
    addFuel(state.fuelPerLevel, state.drill.x, state.drill.y);
  }
  if (state.healPerLevel > 0) {
    healPlayer(state.healPerLevel, t("toast.xp_regen"));
  }
  if (state.goldBonusPerLevel > 0) {
    state.goldBonus += state.goldBonusPerLevel;
  }
  if (state.weakSpotChancePerLevel > 0) {
    state.weakSpotChance += state.weakSpotChancePerLevel;
  }
}

function applyLevelReward(choiceId) {
  const entry = getCurrentLevelRewardEntry();
  const choice = (entry?.choices || []).find(c => c.id === choiceId);
  if (!choice) return;
  const { stat, value, label } = choice;
  if (stat === "maxHp") {
    state.maxHp += value;
    healPlayer(value, t("toast.reward_level"));
  } else {
    state[stat] = (state[stat] || 0) + value;
  }
  if (stat === "visionRadius") state.visibilityDirty = true;
  showPerkToast(label);
}

function claimLevelReward(choiceId) {
  const entry = getCurrentLevelRewardEntry();
  const rewardChoices = getLevelRewardChoices(entry);
  if (!entry || !rewardChoices.some((c) => c.id === choiceId)) return;
  playSound("reward_choose");
  applyLevelReward(choiceId);
  state.levelRewardQueue.shift();
  closeLevelUpModal();
  maybeOpenPendingLevelReward();
}

// ─── Blueprint choice modal ────────────────────────────────────────────────────

function openNextArtifactChoice() {
  if (state.blueprintChoiceRemaining <= 0) {
    state.shopModalOpen = true;
    syncTouchZonesInteractivity();
    playSound("shop_open");
    openShop(state.gold, state.currentDepthLevel, state.luck, getShopStatsSnapshot(), getShopDefaultStatsSnapshot());
    return;
  }

  state.blueprintChoiceRemaining--;
  state.blueprintActivationCount += 1;
  const activation = state.blueprintActivationCount;
  addSlot();

  if (activation <= 2) {
    beginArtifactCategoryChoice({ grantSlot: true, replaceBaseSlot: false });
    return;
  }
  if (activation === 3) {
    beginArtifactCategoryChoice({ grantSlot: true, replaceBaseSlot: true });
    return;
  }
  if (activation === 4) {
    setShopRarityGuarantees(1, 0);
    openArtifactBenefitChoice("ui.artifact_benefit_one_uncommon");
    return;
  }
  if (activation === 5) {
    setShopRarityGuarantees(2, 0);
    openArtifactBenefitChoice("ui.artifact_benefit_two_uncommon");
    return;
  }
  if (activation === 6) {
    setShopRarityGuarantees(1, 1);
    openArtifactBenefitChoice("ui.artifact_benefit_one_uncommon_one_rare");
    return;
  }

  state.gold += 500;
  showGoldToast(500);
  openArtifactBenefitChoice("ui.artifact_benefit_gold");
}

function beginArtifactCategoryChoice({ grantSlot, replaceBaseSlot }) {
  const locked = getLockedCategories();
  if (locked.length === 0) {
    if (replaceBaseSlot) {
      state.gold += 500;
      showGoldToast(500);
      openArtifactBenefitChoice("ui.artifact_benefit_gold");
      return;
    }
    openNextArtifactChoice();
    return;
  }
  state.blueprintChoiceMode = "category";
  state.blueprintChoiceGrantSlot = !!grantSlot;
  state.blueprintChoiceReplaceBaseSlot = !!replaceBaseSlot;
  if (locked.length === 1) {
    applyArtifactCategoryChoice(locked[0]);
    openNextArtifactChoice();
    return;
  }
  // 2+ locked: show choice modal for this blueprint
  const shuffled = locked.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  state.blueprintChoiceCategories = [shuffled[0], shuffled[1]];
  openArtifactChoice();
}

function applyArtifactCategoryChoice(chosen) {
  unlockCategory(chosen.id);
  if (state.blueprintChoiceReplaceBaseSlot) {
    replaceOneBaseOfferWithSpecial();
    showPerkToast(t("toast.artifact_replace_basic_offer"));
  }
  showPerkToast(t("toast.category_unlocked", { icon: chosen.icon, name: chosen.name }));
}

function openArtifactBenefitChoice(subtitleKey) {
  state.blueprintChoiceMode = "benefit";
  state.blueprintChoiceCategories = [];
  state.blueprintChoiceBenefitSubtitleKey = subtitleKey;
  openArtifactChoice();
}

function openArtifactChoice() {
  state.blueprintChoiceOpen = true;
  syncTouchZonesInteractivity();
  const overlay = document.getElementById("blueprintChoice");
  if (!overlay) return;
  overlay.hidden = false;
  overlay.style.cssText =
    "position:absolute;inset:0;z-index:9999;display:flex;visibility:visible;pointer-events:auto;opacity:1;align-items:center;justify-content:center;background:rgba(10,8,6,0.85);";

  const titleEl = document.getElementById("blueprintChoiceTitle");
  const subtitleEl = document.getElementById("blueprintChoiceSubtitle");
  const cardsRoot = document.getElementById("blueprintChoiceCards");
  const continueBtn = document.getElementById("blueprintChoiceContinue");
  const isBenefitMode = state.blueprintChoiceMode === "benefit";

  if (titleEl) titleEl.textContent = isBenefitMode ? t("ui.artifact_benefit_title") : t("ui.choose_category");
  if (subtitleEl) {
    if (isBenefitMode) {
      subtitleEl.textContent = t(state.blueprintChoiceBenefitSubtitleKey || "ui.artifact_subtitle");
    } else if (state.blueprintChoiceReplaceBaseSlot) {
      subtitleEl.textContent = t("ui.artifact_subtitle_replace_basic");
    } else {
      subtitleEl.textContent = t("ui.artifact_subtitle");
    }
  }
  if (cardsRoot) cardsRoot.hidden = isBenefitMode;
  if (continueBtn) {
    continueBtn.hidden = !isBenefitMode;
    continueBtn.disabled = !isBenefitMode;
  }
  if (isBenefitMode) {
    return;
  }

  const [t0, t1] = state.blueprintChoiceCategories;
  const card0 = document.getElementById("blueprintChoiceCard0");
  const card1 = document.getElementById("blueprintChoiceCard1");
  if (card0) card0.innerHTML = buildArtifactChoiceCard(t0);
  if (card1) card1.innerHTML = buildArtifactChoiceCard(t1);
}

function getBlueprintCategoryConceptRows(categoryId) {
  const conceptIds = BLUEPRINT_CATEGORY_CONCEPT_MAP[categoryId] || [];
  const rows = [];
  for (const conceptId of conceptIds) {
    const titleKey = `inspect.concept.${conceptId}.title`;
    const descKey = `inspect.concept.${conceptId}.desc`;
    const title = t(titleKey);
    const desc = t(descKey);
    if (title === titleKey || desc === descKey) continue;
    rows.push({ title, desc });
  }
  return rows;
}

function openBlueprintCategoryInspectModal(category) {
  if (!category) return;
  const descKey = `category.desc.${category.id}`;
  const descRaw = t(descKey);
  const desc = descRaw === descKey ? "—" : descRaw;
  const conceptRows = getBlueprintCategoryConceptRows(category.id);
  const modal = document.getElementById("blueprintCategoryInspectModal");
  if (!modal) return;
  const icon = document.getElementById("blueprintCategoryInspectIcon");
  const name = document.getElementById("blueprintCategoryInspectName");
  const rarity = document.getElementById("blueprintCategoryInspectRarity");
  const tags = document.getElementById("blueprintCategoryInspectTags");
  const descEl = document.getElementById("blueprintCategoryInspectDesc");
  const conceptsWrap = document.getElementById("blueprintCategoryInspectConcepts");
  const conceptsList = document.getElementById("blueprintCategoryInspectStats");

  if (icon) icon.textContent = category.icon || "✦";
  if (name) name.textContent = category.name;
  if (rarity) rarity.textContent = t("ui.choose_category");
  if (tags) {
    tags.innerHTML = `<span class="shop-tag">${category.icon} ${category.name}</span>`;
  }
  if (descEl) {
    descEl.textContent = desc;
  }
  if (conceptsList) {
    if (!conceptRows.length) {
      conceptsList.innerHTML = `<div class="shop-inspect-modal__stat"><div class="shop-inspect-modal__stat-desc">${t("ui.no_concepts_mapped")}</div></div>`;
      if (conceptsWrap) conceptsWrap.hidden = false;
    } else {
      conceptsList.innerHTML = conceptRows.map((row) => `
        <div class="shop-inspect-modal__stat">
          <div class="shop-inspect-modal__stat-name">${row.title}</div>
          <div class="shop-inspect-modal__stat-desc">${row.desc}</div>
        </div>
      `).join("");
      if (conceptsWrap) conceptsWrap.hidden = false;
    }
  }
  modal.hidden = false;
  modal.style.cssText = "z-index:10002;";
  syncTouchZonesInteractivity();
}

function closeBlueprintCategoryInspectModal() {
  const modal = document.getElementById("blueprintCategoryInspectModal");
  if (!modal) return;
  modal.hidden = true;
  modal.style.cssText = "";
  syncTouchZonesInteractivity();
}

function buildArtifactChoiceCard(category) {
  const nodeText = state.blueprintChoiceGrantSlot ? t("ui.hull_slot") : t("ui.replace_basic_offer");
  const descKey = `category.desc.${category.id}`;
  const descText = t(descKey);
  const hasDesc = descText && descText !== descKey;
  return `
    <div class="blueprint-choice__card-icon">${category.icon}</div>
    <div class="blueprint-choice__card-name">${category.name}</div>
    ${hasDesc ? `<div class="blueprint-choice__card-desc">${descText}</div>` : ""}
    <div class="blueprint-choice__card-nodes"><div class="blueprint-choice__node">${nodeText}</div></div>
    <button class="blueprint-choice__card-inspect" type="button" data-category-inspect="${category.id}" aria-label="${t("ui.description")}">i</button>
  `;
}

function pickArtifactChoice(idx) {
  if (!state.blueprintChoiceOpen || state.blueprintChoiceMode !== "category" || !state.blueprintChoiceCategories[idx]) return;
  const chosen = state.blueprintChoiceCategories[idx];
  applyArtifactCategoryChoice(chosen);
  closeArtifactChoice();
  openNextArtifactChoice();
}

function continueArtifactBenefitChoice() {
  if (!state.blueprintChoiceOpen || state.blueprintChoiceMode !== "benefit") return;
  closeArtifactChoice();
  openNextArtifactChoice();
}

function closeArtifactChoice() {
  state.blueprintChoiceOpen = false;
  state.blueprintChoiceMode = "category";
  state.blueprintChoiceGrantSlot = true;
  state.blueprintChoiceReplaceBaseSlot = false;
  state.blueprintChoiceBenefitSubtitleKey = "";
  state.blueprintChoiceCategories = [];
  state.blueprintChoicePendingBeacon = null;
  const overlay = document.getElementById("blueprintChoice");
  if (overlay) {
    overlay.hidden = true;
    overlay.style.cssText = "display:none;visibility:hidden;pointer-events:none;opacity:0;";
  }
  closeBlueprintCategoryInspectModal();
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

function updateCrystalItemOffer(dt) {
  if (!state.crystalItemOfferOpen || state.crystalItemOfferRevealed) return;
  state.crystalItemOfferShuffleTick += dt;
  while (state.crystalItemOfferShuffleTick >= 0.08) {
    state.crystalItemOfferShuffleTick -= 0.08;
    state.crystalItemOfferPreview = getRandomShuffleItem();
  }
  state.crystalItemOfferAnimTimer = Math.max(0, state.crystalItemOfferAnimTimer - dt);
  if (state.crystalItemOfferAnimTimer === 0) {
    state.crystalItemOfferRevealed = true;
  }
  syncCrystalItemOffer();
}

function isAnyBlockingModalOpen() {
  return !!(
    state.isChoosingPerk ||
    state.itemInspectModalOpen ||
    state.menuOpen ||
    state.manualModalOpen ||
    state.shopModalOpen ||
    state.debugPerkMenuOpen ||
    state.crystalRewardModalOpen ||
    state.blueprintChoiceOpen ||
    state.levelUpModalOpen ||
    state.crystalItemOfferOpen
  );
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
  if (state.beaconActivationAnim || isAnyBlockingModalOpen()) {
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

    if (state.debugMapActive && !state.debugMapGenerationPanelCollapsed) {
      state.lastTs = ts;
      state.timeAcc = 0;
      setTimeout(() => requestAnimationFrame(frame), 250);
      return;
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
    if (state.gameLoopRunning) {
      requestAnimationFrame(frame);
    }
  } catch (error) {
    reportFatalError(error, "frame");
  }
}

function update(dt) {
  if (state.dead) {
    return;
  }
  if (!state.cutsceneModeActive && !state.baseFound) {
    state.runTimeSec += dt;
  }

  updateHudBarFx(dt);

  if (state.autoClosePreviewReturnTimer > 0) {
    state.autoClosePreviewReturnTimer = Math.max(0, state.autoClosePreviewReturnTimer - dt);
    if (state.autoClosePreviewReturnTimer === 0 && state.idleTime < IDLE_AUTO_CLOSE_PREVIEW_DELAY) {
      state.autoClosePreview = null;
    }
  }

  updateMovementAnimations(dt);
  updateExperienceParticles(dt);
  updateDrillSmokeParticles(dt);

  if (state.crystalRewardModalOpen) {
    updateCrystalRewardModal(dt);
    return;
  }

  if (state.crystalItemOfferOpen && !state.crystalItemOfferRevealed) {
    updateCrystalItemOffer(dt);
  }

  if (state.crystalItemOfferOpen) {
    return;
  }

  if (
    state.itemInspectModalOpen ||
    state.menuOpen ||
    state.manualModalOpen ||
    state.shopModalOpen ||
    state.debugPerkMenuOpen ||
    state.blueprintChoiceOpen ||
    state.levelUpModalOpen ||
    state.isChoosingPerk
  ) {
    return;
  }

  if (state.crystalCompleteAnimDelay > 0) {
    state.crystalCompleteAnimDelay = Math.max(0, state.crystalCompleteAnimDelay - dt);
    if (state.crystalCompleteAnimDelay === 0) {
      openCrystalItemOfferModal();
    }
  }

  maybeOpenPendingLevelReward();

  if (isAnyBlockingModalOpen()) {
    return;
  }

  if (state.pickupRadarTimer > 0) {
    state.pickupRadarTimer = Math.max(0, state.pickupRadarTimer - dt);
  }
  if (state.crystalLightRadarTimer > 0) {
    state.crystalLightRadarTimer = Math.max(0, state.crystalLightRadarTimer - dt);
  }

  pickupExperienceNearPlayer();
  pickupGoldNearPlayer();

  if (state.signalMovesLeft > 0) {
    state.signalMovesLeft = Math.max(0, state.signalMovesLeft - dt);
    refreshSignalDirection();
    if (state.signalMovesLeft === 0) {
      state.signalMovesMax = 0;
    }
  }

  drainFuel(getIdleFuelDrain() * dt, { hudKind: "idle" });
  state.struckThisFrame = false;
  state.drillIdleFrame = false;
  updateDrill(dt);
  updateCollapseWarnings(dt);
  updateGas(dt);
  updateSteam(dt);
  updateBoulders(dt);
  updateWorms(dt);
  updateContourEnemy(dt);
  updatePerkZones(dt);
  updateChainExplosions(dt);
  updateBeaconWireBreaks(dt);
  updateEffects(dt);
  updateGoldParticles(dt);
  updateDepthLevelTransition();
  if (state.visibilityDirty) {
    rebuildVisibilityMask();
    state.visibilityDirty = false;
  }
  updateVisibilityFade(dt);
  updateDiscovery();
  updateCamera(dt);
  updateCameraShake(dt);
  if (state.pendingBeaconWireActivation && state.pendingBeaconWireActivationAt > 0 && (state.lastTs || 0) >= state.pendingBeaconWireActivationAt) {
    state.pendingBeaconWireActivation.wireActivationStart = state.lastTs || performance.now();
    state.pendingBeaconWireActivation.wireDamageTriggered = false;
    state.pendingBeaconWireActivation = null;
    state.pendingBeaconWireActivationAt = 0;
  }
  for (const beacon of state.beacons) {
    if (!beacon.wireActivationStart || beacon.wireDamageTriggered) continue;
    if ((state.lastTs || 0) - beacon.wireActivationStart < BEACON_WIRE_FLARE_MS) continue;
    activateBeaconWires(beacon);
    beacon.wireDamageTriggered = true;
  }
  for (const beacon of state.beacons) {
    if (!beacon.active || !beacon.wireDamageTriggered || beacon.wiresFreedToastShown === true) continue;
    if (!areBeaconWiresFreed(beacon)) continue;
    beacon.wiresFreedToastShown = true;
    beacon.rewardContourReady = true;
    beacon.rewardRecipe = buildBeaconBonusRecipe(beacon);
    showPerkToast(t("toast.wires_freed"));
    if (state.shopModalOpen || state.beaconActivationAnim) {
      beacon.rewardAutoAfterShop = true;
    } else {
      beginFullFreedom(beacon, false);
    }
  }
  for (const beacon of state.beacons) {
    if (!beacon.rewardClaimed || beacon.rewardGranted || beacon.rewardRevealStart <= 0) continue;
    if ((state.lastTs || 0) - beacon.rewardRevealStart < FULL_FREEDOM_WIRE_HIDE_MS) continue;
    const rewardRecipe = Array.isArray(beacon.rewardRecipe) && beacon.rewardRecipe.length > 0
      ? beacon.rewardRecipe
      : buildBeaconBonusRecipe(beacon);
    beacon.rewardRecipe = rewardRecipe;
    beacon.rewardGranted = true;
    playSound("recipe_complete");
    grantCrystalRecipeReward(rewardRecipe[0], rewardRecipe, beacon.x, beacon.y, {
      title: t("ui.full_freedom"),
      showRecipeAnimation: false,
      delaySeconds: 0,
    });
    openCrystalItemOfferModal();
  }
  updateBeaconActivationAnim();
  const prevOverdriveTimer = state.overhealDrillTimer;
  state.overhealDrillTimer = Math.max(0, state.overhealDrillTimer - dt);
  const consumedOverdrive = Math.max(0, prevOverdriveTimer - state.overhealDrillTimer);
  if (consumedOverdrive > 0) {
    state.overdriveElapsedForDetonation += consumedOverdrive;
  }
  if (prevOverdriveTimer > 0 && state.overhealDrillTimer === 0) {
    triggerAfterburnFlashChargeExplosion(state.overdriveElapsedForDetonation);
    state.overdriveElapsedForDetonation = 0;
    state.overdriveDisplayDuration = 0;
  } else if (state.overhealDrillTimer === 0) {
    state.overdriveElapsedForDetonation = 0;
    state.overdriveDisplayDuration = 0;
  }
  const hadOverflowSurge = state.overflowOverdriveTimer > 0;
  state.overflowOverdriveTimer = Math.max(0, state.overflowOverdriveTimer - dt);
  if (hadOverflowSurge && state.overflowOverdriveTimer === 0 && !state.dead) {
    explodeAt(state.drill.x, state.drill.y, EXPLOSION_BREAK_DAMAGE, 2);
    applyStun(OVERFLOW_STUN_DURATION, t("toast.stun"));
    state.cameraShake.amplitude = Math.max(state.cameraShake.amplitude, 2.4);
    state.damageFlash = Math.min(1, state.damageFlash + 0.65);
  }
  const prevStunTimer = state.stunTimer;
  state.stunTimer = Math.max(0, state.stunTimer - dt);
  if (state.stunTimer === 0) {
    if (prevStunTimer > 0 && state.stunAfterburnerLevel > 0) {
      const afterDuration = [0, 3, 4, 5, 6][Math.max(0, Math.floor(state.stunAfterburnerLevel || 0))] || 0;
      if (afterDuration > 0) {
        activateDrillOverdrive(afterDuration, t("toast.afterburner_after_stun"));
      }
    }
    if (prevStunTimer > 0) {
      const stunSalvoRocketCount = getStunSalvoRocketCount();
      for (let ri = 0; ri < stunSalvoRocketCount; ri += 1) {
        fireRocket(
          state.drill.x,
          state.drill.y,
          20,
          1,
          1 + Math.floor(Math.random() * 3),
          {
            explosionPowerScale: 0.20,
            skipRadiusBonus: true,
          },
        );
      }
    }
    state.stunDisplayDuration = 0;
  }
  if (!state.struckThisFrame && state.drillIdleFrame) {
    state.heatCooldownTime += dt;
    const cooldownBoost = 1 + state.heatCooldownTime * state.heatCooldownTime * 0.65;
    const speedCoolingBoost = 1 + Math.max(0, state.strikeSpeed / 100) * 0.7;
    const prevHeat = state.heat;
    state.heat = Math.max(0, state.heat - HEAT_COOL_RATE * cooldownBoost * speedCoolingBoost * dt);
    const cooledHeat = Math.max(0, prevHeat - state.heat);
    if (state.breachThermostatLevel > 0 && cooledHeat > 0) {
      state.breachThermostatCharge += cooledHeat * state.breachThermostatLevel;
      while (state.breachThermostatCharge >= 20) {
        if (!spawnWeakSpotNearDrill()) {
          break;
        }
        state.breachThermostatCharge -= 20;
      }
    }
    if (state.coolingRocketLevel > 0 && cooledHeat > 0) {
      state.coolingRocketCharge += cooledHeat;
      const coolingRocketThreshold = getCoolingRocketThreshold();
      while (state.coolingRocketCharge >= coolingRocketThreshold) {
        state.coolingRocketCharge -= coolingRocketThreshold;
        for (let ri = 0; ri < state.coolingRocketLevel; ri += 1) {
          fireRocket(state.drill.x, state.drill.y, COOLING_ROCKET_DAMAGE, COOLING_ROCKET_RADIUS, 1 + Math.floor(Math.random() * 3));
        }
      }
    }
    if (state.cryoRocketCount > 0 && cooledHeat > 0) {
      state.cryoRocketAccumulator += cooledHeat;
      while (state.cryoRocketAccumulator >= 20) {
        state.cryoRocketAccumulator -= 20;
        const cryoRocketTiers = getItemTiers("cryo_rocket");
        if (cryoRocketTiers.length > 0) {
          for (const tier of cryoRocketTiers) {
            fireRocket(
              state.drill.x,
              state.drill.y,
              CRYO_ROCKET_DAMAGE,
              CRYO_ROCKET_RADIUS,
              1 + Math.floor(Math.random() * 3),
              {
                explosionPowerScale: getCryoRocketExplosionScaleForTier(tier),
                skipRadiusBonus: true,
              },
            );
          }
        } else {
          for (let ri = 0; ri < state.cryoRocketCount; ri += 1) {
            fireRocket(
              state.drill.x,
              state.drill.y,
              CRYO_ROCKET_DAMAGE,
              CRYO_ROCKET_RADIUS,
              1 + Math.floor(Math.random() * 3),
              {
                explosionPowerScale: 0.10,
                skipRadiusBonus: true,
              },
            );
          }
        }
      }
    }
  } else {
    state.heatCooldownTime = 0;
  }
  if (state.pathTailFade > 0) {
    state.pathTailFade = Math.max(0, state.pathTailFade - dt * 8);
    if (state.pathTailFade === 0) state.pathTailGhost = null;
  }
  if (state.loopPressureTimer > 0) {
    state.loopPressureTimer = Math.max(0, state.loopPressureTimer - dt);
    if (state.loopPressureTimer === 0 && state.loopPressureDrillPowerBonus > 0) {
      state.drillPower = Math.max(0, state.drillPower - state.loopPressureDrillPowerBonus);
      state.loopPressureDrillPowerBonus = 0;
      state.loopPressureDisplayDuration = 0;
    }
  }
  if (state.contourBlastPressureTimer > 0) {
    state.contourBlastPressureTimer = Math.max(0, state.contourBlastPressureTimer - dt);
    if (state.contourBlastPressureTimer === 0 && state.contourBlastPressureExplosionBonus > 0) {
      state.explosionPower = Math.max(0, state.explosionPower - state.contourBlastPressureExplosionBonus);
      state.contourBlastPressureExplosionBonus = 0;
      state.contourBlastPressureDisplayDuration = 0;
    }
  }
  if (state.contourResonanceFlashTimer > 0) {
    state.contourResonanceFlashTimer = Math.max(0, state.contourResonanceFlashTimer - dt);
  }
  for (let i = state.activeToasts.length - 1; i >= 0; i--) {
    state.activeToasts[i].time -= dt;
    if (state.activeToasts[i].time <= 0) state.activeToasts.splice(i, 1);
  }
  for (const key in state.toastDebounceMap) {
    const entry = state.toastDebounceMap[key];
    entry.timer -= dt;
    if (entry.timer <= 0) {
      state.toastQueue.push({ text: entry.fmt(entry.value), color: entry.color, duration: entry.duration });
      delete state.toastDebounceMap[key];
    }
  }
  if (state.toastQueueTimer > 0) {
    state.toastQueueTimer = Math.max(0, state.toastQueueTimer - dt);
  } else if (state.toastQueue.length > 0) {
    applyToast(state.toastQueue.shift());
    state.toastQueueTimer = 0.16;
  }
  state.depthTitle.time = Math.max(0, state.depthTitle.time - dt);
  state.damageFlash = Math.max(0, state.damageFlash - dt * 2.4);
  state.levelUpFlash = Math.max(0, state.levelUpFlash - dt * 2.2);
  state.levelUpPulse = Math.max(0, state.levelUpPulse - dt * 1.1);
  if (state.levelUpModalDelay > 0) {
    state.levelUpModalDelay = Math.max(0, state.levelUpModalDelay - dt);
    if (state.levelUpModalDelay === 0) {
      maybeOpenPendingLevelReward();
    }
  }
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
        if (effect.phase === "flying") {
          if (effect.instant) {
            detonateRocketEffect(effect);
            state.effects.splice(i, 1);
            continue;
          }
          effect.phase = "armed";
          effect.time = ROCKET_ARMED_DURATION;
          effect.duration = ROCKET_ARMED_DURATION;
        } else {
          detonateRocketEffect(effect);
          state.effects.splice(i, 1);
        }
      } else {
        state.effects.splice(i, 1);
      }
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
      state.unsafeGold += applyGoldBonus(p.value);
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
    if (particle.isGold || particle.isGoldBonus) {
      playSound("gold_pickup", { volume: particle.isGoldBonus ? 0.8 : 0.7 });
      state.unsafeGold += applyGoldBonus(particle.value);
      if (particle.showTotal) {
        if (particle.isGoldBonus) {
          showBonusGoldToast(particle.showTotal);
        } else {
          showGoldToast(particle.showTotal);
        }
      }
    } else {
      playSound("xp_pickup", { volume: 0.6, pitch: 0.95 + Math.random() * 0.1 });
      gainExperience(particle.value);
      if (particle.showTotal) {
        if (particle.isBonusXp) {
          showBonusXpToast(particle.showTotal);
        } else {
          showXpToast(particle.showTotal);
        }
      }
    }
    state.xpParticles.splice(i, 1);
  }
}

function spawnDrillSmokeParticles(tileX, tileY, dirX, dirY) {
  for (let i = 0; i < 5; i += 1) {
    const angle = Math.atan2(-dirY || 0, -dirX || 0) + (Math.random() - 0.5) * 0.9;
    const speed = 18 + Math.random() * 24;
    state.drillSmokeParticles.push({
      x: tileX * TILE_SIZE + TILE_SIZE * 0.5 + (Math.random() - 0.5) * 8,
      y: tileY * TILE_SIZE + TILE_SIZE * 0.5 + (Math.random() - 0.5) * 8,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (10 + Math.random() * 14),
      life: 0.22 + Math.random() * 0.18,
      maxLife: 0.22 + Math.random() * 0.18,
      size: 3 + Math.random() * 3,
    });
  }
}

function updateDrillSmokeParticles(dt) {
  for (let i = state.drillSmokeParticles.length - 1; i >= 0; i -= 1) {
    const p = state.drillSmokeParticles[i];
    p.life -= dt;
    if (p.life <= 0) {
      state.drillSmokeParticles.splice(i, 1);
      continue;
    }
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= Math.max(0, 1 - dt * 4.5);
    p.vy *= Math.max(0, 1 - dt * 3.5);
    p.vy -= 8 * dt;
  }
}

function scheduleBeaconWireBreak(x, y, startDelay = 0) {
  if (x < 0 || y < 0 || x >= GRID_W || y >= GRID_H) return;
  const index = cellIndex(x, y);
  if (state.hardness[index] <= 0 || state.metalMask[index]) return;
  for (const pending of state.beaconWireBreaks) {
    if (pending.index !== index) continue;
    pending.startDelay = Math.min(pending.startDelay, startDelay);
    return;
  }
  state.beaconWireBreaks.push({
    x,
    y,
    index,
    startDelay,
    delay: BEACON_WIRE_BREAK_TELEGRAPH_MS / 1000,
    dustTimer: 0.04 + state.worldRandom() * 0.08,
  });
}

function updateBeaconWireBreaks(dt) {
  for (let i = state.beaconWireBreaks.length - 1; i >= 0; i -= 1) {
    const pending = state.beaconWireBreaks[i];
    if (state.hardness[pending.index] <= 0 || state.metalMask[pending.index]) {
      state.beaconWireBreaks.splice(i, 1);
      continue;
    }
    if (pending.startDelay > 0) {
      pending.startDelay -= dt;
      continue;
    }
    pending.dustTimer -= dt;
    if (pending.dustTimer <= 0) {
      const progress = 1 - clamp(pending.delay / (BEACON_WIRE_BREAK_TELEGRAPH_MS / 1000), 0, 1);
      spawnBeaconWireDustEffect(pending.x, pending.y, progress);
      pending.dustTimer = 0.08 + state.worldRandom() * 0.12;
    }
    pending.delay -= dt;
    if (pending.delay > 0) continue;
    damageCell(pending.x, pending.y, getStrikeDamage(), { suppressHazardPlayerDamage: true });
    state.beaconWireBreaks.splice(i, 1);
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
    if (task.kind === "explosionCell") {
      const tx = task.x;
      const ty = task.y;
      if (task.triggerGas && tx >= 1 && ty >= 1 && tx < GRID_W - 1 && ty < GRID_H - 1 && state.gasMask[cellIndex(tx, ty)]) {
        scheduleChainExplosion({ kind: "gas", x: tx, y: ty });
      }
      if (state.contourEnemy && state.contourEnemy.x === tx && state.contourEnemy.y === ty) {
        hitContourEnemy(task.damage);
      }
      damageCell(tx, ty, task.damage, {
        ignoreHazardEffect: true,
        allowHazardChain: true,
        cause: "explosion",
      });
    } else if (task.kind === "volatile") {
      explodeAt(task.x, task.y, task.damage, task.radius, { cause: "explosion", skipRadiusBonus: true });
    } else if (task.kind === "gas") {
      removeGasCell(task.x, task.y);
      const gasBlastRadius = getScaledExplosionRadius(2, { skipRadiusBonus: true });
      const distToHero = Math.hypot(task.x - state.drill.x, task.y - state.drill.y);
      if (distToHero <= gasBlastRadius) {
        applyHazardDamage(GAS_DAMAGE);
      }
      explodeAt(task.x, task.y, EXPLOSION_BREAK_DAMAGE, 2, {
        cause: "explosion",
        skipRadiusBonus: true,
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
      if (nx < 0 || ny < 0 || nx >= GRID_W || ny >= GRID_H) continue;
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

  const facingX = state.drill.facingX ?? 0;
  const facingY = state.drill.facingY ?? 1;
  const coneAngle = Math.atan2(facingY, facingX);
  const CONE_SPREAD = 0.48;
  const coneLengthSq = (state.visionRadius * 1.15) * (state.visionRadius * 1.15);

  for (let i = 0; i < state.visibleMask.length; i += 1) {
    if (!state.visibleMask[i]) continue;
    state.visibleTargetAlpha[i] = 1;
    _visFogDistance[i] = 0;
    _visFogQueue[fogTail++] = i;
    // Reveal micro-resources only when the light cone hits them
    if (state.microResourceMask[i] > 0 && !state.microResourceRevealedMask[i]) {
      const tx = (i % GRID_W) - startX;
      const ty = ((i / GRID_W) | 0) - startY;
      const distSq = tx * tx + ty * ty;
      if (distSq <= coneLengthSq) {
        const tileAngle = Math.atan2(ty, tx);
        let angleDiff = tileAngle - coneAngle;
        // Normalize to [-π, π]
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        if (Math.abs(angleDiff) <= CONE_SPREAD) {
          if (Math.random() < state.bonusFindChance) {
            state.microResourceRevealedMask[i] = 1;
            spawnMicroBonusRevealEffect(i % GRID_W, (i / GRID_W) | 0, state.microResourceMask[i]);
          } else {
            state.microResourceMask[i] = 0; // chance failed — bonus lost
          }
        }
      }
    }
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
        if (nx < 0 || ny < 0 || nx >= GRID_W || ny >= GRID_H) continue;
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
  const bag = [5, 6, 8, 11, 14, 15, 20, 22, 23, 24, 25];
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
  playSound("gold_perk_unlock");
  state.goldPerkLevel += 1;
  state.nextGoldPerkAt += getGoldPerkCost(state.goldPerkLevel);
}

function getScaledEffectDuration(duration) {
  if (duration <= 0) {
    return 0;
  }
  return Math.max(0.1, duration * Math.max(0, state.effectDurationRate || 0));
}

function activateDrillOverdrive(duration, toastText = "") {
  const actualDuration = getScaledEffectDuration(duration);
  if (actualDuration <= 0) {
    return 0;
  }
  playSound("drill_overdrive");
  state.overhealDrillTimer += actualDuration;
  state.overdriveDisplayDuration += actualDuration;
  if (toastText) {
    showPerkToast(toastText);
  }
  return actualDuration;
}

function applyStun(duration, toastText = "") {
  if (duration <= 0) {
    return;
  }
  playSound("stun");
  const actualDuration = Math.max(0.5, duration / Math.max(0.1, 1 + state.concentration / 100));
  const wasStunned = state.stunTimer > 0;
  state.stunTimer = Math.max(state.stunTimer, actualDuration);
  state.stunDisplayDuration = Math.max(state.stunDisplayDuration, actualDuration);
  if (toastText) {
    showPerkToast(toastText);
  }
  if (!wasStunned && actualDuration > 0) {
    if (state.stunDetonatorLevel > 0) {
      explodeAt(state.drill.x, state.drill.y, getStrikeDamage() * state.stunDetonatorLevel, 1.5, { cause: "explosion" });
    }
    if (state.stunReservoirLevel > 0) {
      addFuel(state.stunReservoirLevel * 40, state.drill.x, state.drill.y);
    }
  }
}

function triggerOverflowSurge() {
  playSound("overflow_surge");
  state.resolvingOverflowBomb = true;
  try {
    state.overflowOverdriveTimer = activateDrillOverdrive(OVERFLOW_OVERDRIVE_DURATION, t("toast.overflow_overdrive"));
  } finally {
    state.resolvingOverflowBomb = false;
  }
}

function activateOverhealDrillBoost() {
  playSound("overheal_boost");
  activateDrillOverdrive(state.overhealOverdriveDuration || 4, t("toast.adrenaline_boost"));
}

function triggerHeatOverload() {
  playSound("heat_overload");
  state.heat = 0;
  const overloadDamage = getStrikeDamage();
  const overloadRadius = 1;
  const overloadCellX = state.drill.x;
  const overloadCellY = state.drill.y;
  explodeAt(state.drill.x, state.drill.y, overloadDamage, overloadRadius, {
    guaranteedBreak: false,
    cause: "explosion",
  });
  // Extra visual burst so overheating explosion always has debris particles
  // even when no blocks are actually destroyed by low-radius/low-damage blast.
  for (let oy = -1; oy <= 1; oy += 1) {
    for (let ox = -1; ox <= 1; ox += 1) {
      const tx = overloadCellX + ox;
      const ty = overloadCellY + oy;
      if (tx < 1 || ty < 1 || tx >= GRID_W - 1 || ty >= GRID_H - 1) continue;
      const idx = cellIndex(tx, ty);
      const hardness = state.hardness[idx];
      if (hardness <= 0 || state.metalMask[idx]) continue;
      if (Math.random() < 0.65) {
        spawnBreakEffect(tx, ty, hardness, "explosion");
      }
    }
  }
  for (let i = 0; i < state.heatOverloadRocketLevel; i += 1) {
    fireRocket(state.drill.x, state.drill.y, OVERLOAD_ROCKET_DAMAGE, OVERLOAD_ROCKET_RADIUS, 1 + Math.floor(Math.random() * 3));
  }
  applyStun(HEAT_STUN_DURATION, t("toast.heat_overload"));
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
  const wasBelowWarning = state.heat < state.maxHeat * 0.8;
  state.heat = Math.min(state.maxHeat, state.heat + amount);
  state.struckThisFrame = true;
  if (wasBelowWarning && state.heat >= state.maxHeat * 0.8) {
    playSound("heat_warning");
  }
  if (state.heat >= state.maxHeat) {
    triggerHeatOverload();
  }
}

function healPlayer(amount, sourceText = "") {
  if (amount <= 0) {
    return 0;
  }

  playSound("player_heal");
  const missingHp = Math.max(0, state.maxHp - state.hp);
  const actualHeal = Math.min(amount, missingHp);
  const overheal = Math.max(0, amount - actualHeal);
  state.hp = Math.min(state.maxHp, state.hp + amount);
  if (overheal > 0 && state.overhealSpindlePiercingGain > 0) {
    state.drillPiercingDamage += state.overhealSpindlePiercingGain;
  }
  if (overheal > 0) {
    const overhealExplosionGain = getOverhealWarheadExplosionGain();
    if (overhealExplosionGain > 0) {
      state.explosionPower += overhealExplosionGain;
    }
  }

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
      return 0;
    case 3:
      return 0;
    case 4:
      return 0;
    case 5:
      return 1;
    case 6:
      return Math.round(state.lowFuelSpeedBonus / 0.35) + 1;
    case 7:
      return state.remoteBombLevel + 1;
    case 8:
      return 1;
    case 9:
      return Math.max(1, state.visionRadius - VISION_RADIUS + 1);
    case 10:
      return 1;
    case 11:
      return 1;
    case 13:
      return 1;
    case 14:
      return state.maxHp - START_HP + 1;
    case 15:
      return Math.max(1, Math.floor(Math.max(0, state.overhealOverdriveDuration - 2) / 2) + 1);
    case 16:
      return Math.min(2, state.loopPerkLevel + 1);
    case 17:
      return 0;
    case 18:
      return Math.min(3, state.crystalCatalystLevel + 1);
    case 19:
      return Math.min(3, state.spikeOverdriveLevel + 1);
    case 20:
    case 21:
    case 23:
    case 24:
      return 1;
    case 22:
      return Math.round((state.maxHeat - MAX_HEAT) / 20) + 1;
    case 25:
      return 0;
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
      return 0;
    case 3:
      return 0;
    case 4:
      return 0;
    case 5:
      return Math.round(state.contourChargeDamagePerCell / 0.05);
    case 6:
      return Math.round(state.lowFuelSpeedBonus / 0.35);
    case 7:
      return state.remoteBombLevel;
    case 8:
      return 0;
    case 9:
      return Math.max(0, state.visionRadius - VISION_RADIUS);
    case 10:
      return state.radarCrystalModule ? 1 : 0;
    case 11:
      return 0;
    case 13:
      return state.overflowBomb ? 1 : 0;
    case 14:
      return Math.max(0, state.maxHp - START_HP);
    case 15:
      return state.overhealOverdriveDuration > 0 ? Math.floor(Math.max(0, state.overhealOverdriveDuration - 2) / 2) : 0;
    case 16:
      return state.loopPerkLevel;
    case 17:
      return 0;
    case 18:
      return state.crystalCatalystLevel;
    case 19:
      return state.spikeOverdriveLevel;
    case 20:
    case 21:
    case 23:
    case 24:
      return 0;
    case 22:
      return Math.max(0, Math.round((state.maxHeat - MAX_HEAT) / 20));
    case 25:
      return 0;
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
      return {
        effect: t("preview.removed"),
        compare: "—",
      };
    }
    case 3: {
      return {
        effect: t("preview.removed"),
        compare: "—",
      };
    }
    case 4: {
      return {
        effect: t("preview.removed"),
        compare: "—",
      };
    }
    case 5: {
      return {
        effect: "—",
        compare: "—",
      };
    }
    case 6: {
      return {
        effect: t("preview.empty_boost.effect"),
        compare: t("preview.empty_boost.compare", { current: formatPerkPercent(state.lowFuelSpeedBonus), next: formatPerkPercent(state.lowFuelSpeedBonus + 0.35) }),
      };
    }
    case 7: {
      const currentInterval = state.remoteBombInterval || 0;
      const nextInterval = Math.max(15, currentInterval > 0 ? currentInterval - 5 : 30);
      return {
        effect: t("preview.sapper_charge.effect"),
        compare: t("preview.sapper_charge.compare", { current: currentInterval || 30, next: nextInterval }),
      };
    }
    case 8: {
      return {
        effect: t("preview.fuel_contour.effect"),
        compare: "—",
      };
    }
    case 9: {
      const nextRadius = Math.min(9, state.visionRadius + 1);
      return {
        effect: t("preview.vision_lens.effect"),
        compare: t("preview.vision_lens.compare", { current: state.visionRadius, next: nextRadius }),
      };
    }
    case 10: {
      return {
        effect: t("preview.radar_module.effect"),
        compare: state.radarCrystalModule ? t("preview.radar_module.compare_active") : t("preview.radar_module.compare_inactive"),
      };
    }
    case 11: {
      return {
        effect: t("preview.ore_collector.effect"),
        compare: "—",
      };
    }
    case 13: {
      return {
        effect: t("preview.overload.effect"),
        compare: t("preview.overload.compare", { current: state.maxFuel, next: Math.max(100, state.maxFuel - 150) }),
      };
    }
    case 14: {
      return {
        effect: t("preview.reinforced_hull.effect"),
        compare: t("preview.reinforced_hull.compare", { current: state.maxHp, next: state.maxHp + 1 }),
      };
    }
    case 15: {
      const nextDuration = Math.min(10, state.overhealOverdriveDuration > 0 ? state.overhealOverdriveDuration + 2 : 4);
      return {
        effect: t("preview.adrenaline_overflow.effect"),
        compare: t("preview.adrenaline_overflow.compare", { current: state.overhealOverdriveDuration || 0, next: nextDuration }),
      };
    }
    case 16: {
      const currentSmall = getLoopPerkChance(0);
      const currentLarge = getLoopPerkChance(9);
      const nextSmall = getLoopPerkChance(0, Math.min(2, state.loopPerkLevel + 1));
      const nextLarge = getLoopPerkChance(9, Math.min(2, state.loopPerkLevel + 1));
      return {
        effect: t("preview.contour_trophy.effect"),
        compare: `${formatPerkPercent(currentSmall)}/${formatPerkPercent(currentLarge)} → ${formatPerkPercent(nextSmall)}/${formatPerkPercent(nextLarge)}`,
      };
    }
    case 17: {
      return {
        effect: t("preview.auto_contour.effect"),
        compare: "",
      };
    }
    case 18: {
      const level = state.crystalCatalystLevel;
      let effect = t("preview.crystal_catalyst.effect");
      let compare = "0 → +30 gold";
      if (level === 1) {
        compare = "+30 gold → +40 fuel";
      } else if (level === 2) {
        compare = "+40 fuel → +1 HP";
      } else if (level >= 3) {
        compare = t("preview.crystal_catalyst.compare_max");
      }
      return { effect, compare };
    }
    case 19: {
      const durations = [0, 6, 9, 12];
      const currentDuration = durations[state.spikeOverdriveLevel] || 0;
      const nextDuration = durations[Math.min(3, state.spikeOverdriveLevel + 1)] || 12;
      return {
        effect: t("preview.spike_boost.effect"),
        compare: t("preview.spike_boost.compare", { current: currentDuration, next: nextDuration }),
      };
    }
    case 20: {
      return {
        effect: t("preview.heat_charge.effect"),
        compare: "—",
      };
    }
    case 21: {
      return {
        effect: t("preview.heat_sink_merged.effect"),
        compare: "—",
      };
    }
    case 22: {
      return {
        effect: t("preview.heat_sink.effect"),
        compare: `${state.maxHeat} → ${state.maxHeat + 20}`,
      };
    }
    case 23: {
      return {
        effect: t("preview.drill_heat.effect"),
        compare: "—",
      };
    }
    case 24: {
      return {
        effect: t("preview.cool_pulse.effect"),
        compare: "—",
      };
    }
    case 25: {
      return { effect: t("preview.stun_dampers.effect"), compare: "—" };
    }
    case 26: {
      const caps = [0, 15, 30, 50, 100];
      const contourLength = Math.max(0, state.pathTiles.length - 1);
      const currentBonus = Math.min(caps[state.contourLengthDamageLevel] || 0, contourLength);
      const nextCap = caps[Math.min(4, state.contourLengthDamageLevel + 1)] || 100;
      return {
        effect: t("preview.contour_resonance.effect", { cap: nextCap }),
        compare: `${currentBonus}% → ${Math.min(nextCap, contourLength)}%`,
      };
    }
    case 27: {
      const thresholds = [0, 50, 40, 30];
      const currentThreshold = thresholds[state.coolingRocketLevel] || 50;
      const nextThreshold = thresholds[Math.min(3, state.coolingRocketLevel + 1)] || 30;
      return {
        effect: t("preview.cooling_rockets.effect"),
        compare: t("preview.cooling_rockets.compare", { current: currentThreshold, next: nextThreshold }),
      };
    }
    case 28: {
      const gains = [0, 3, 4, 5];
      const currentGain = gains[state.contourReturnFuelLevel] || 0;
      const nextGain = gains[Math.min(3, state.contourReturnFuelLevel + 1)] || 5;
      return {
        effect: t("preview.contour_recovery.effect"),
        compare: `${currentGain} → ${nextGain}`,
      };
    }
    case 29: {
      const currentCount = state.heatOverloadRocketLevel;
      const nextCount = Math.min(3, currentCount + 1);
      return {
        effect: t("preview.heat_rockets.effect"),
        compare: `${currentCount} → ${nextCount}`,
      };
    }
    case 30: {
      const currentMultiplier = getTankFuelMultiplier();
      const nextMultiplier = getTankFuelMultiplier(Math.min(3, state.tankBoostLevel + 1));
      const currentTank = Math.round(120 * currentMultiplier);
      const nextTank = Math.round(120 * nextMultiplier);
      const currentDrain = getIdleFuelDrain();
      const nextBaseDrain = IDLE_FUEL_DRAIN + Math.floor(state.goldPerkLevel / 3);
      const nextDrain = nextBaseDrain + Math.max(1, nextBaseDrain * 0.1) * Math.min(3, state.tankBoostLevel + 1);
      return {
        effect: t("preview.reinforced_tank.effect"),
        compare: t("preview.reinforced_tank.compare", { currentTank: formatSignedNumber(currentTank), currentDrain: formatPerkNumber(currentDrain), nextTank: formatSignedNumber(nextTank), nextDrain: formatPerkNumber(nextDrain) }),
      };
    }
    default:
      return {
        effect: t("preview.no_data.effect"),
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
    subtitle.textContent = t("ui.upgrade_cost_dynamic", { cost: getGoldPerkCost(state.goldPerkLevel) });
  }
  if (rerollButton) {
    rerollButton.disabled = !state.isChoosingPerk || state.perkRerolls <= 0;
  }
  if (rerollCount) {
    rerollCount.textContent = t("ui.rerolls", { count: state.perkRerolls });
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
    button.innerHTML = `<span class="perk-option__top"><span class="perk-option__title"><span class="perk-option__icon">${getGoldPerkIconMarkup(perkType, "perk-option__icon-svg")}</span><span class="perk-option__name">${GOLD_PERK_TYPES[perkType].name}</span></span><span class="perk-option__level">${t("ui.level_badge", { level: getGoldPerkNextLevel(perkType) })}</span></span><span class="perk-option__effect">${preview.effect}</span><span class="perk-option__compare">${preview.compare}</span>`;
  }
}

function hasActiveWeakSpot() {
  const mask = state.weakSpotMask;
  for (let i = 0; i < mask.length; i += 1) {
    if (mask[i]) return true;
  }
  return false;
}

function isWeakSpotCandidateCell(index) {
  if (index < 0 || index >= state.health.length) return false;
  if (state.health[index] <= 0) return false;
  if (!state.hardness[index]) return false;
  if (state.tunnelMask[index]) return false;
  if (state.metalMask[index]) return false;
  if (state.safeDoorMask[index]) return false;
  if (state.beaconMask[index] && !isHiddenBeaconCore(index)) return false;
  return true;
}

function spawnWeakSpotNearDrill() {
  if (hasActiveWeakSpot()) return false;
  let bestDistance = Infinity;
  const bestCandidates = [];
  for (let y = 1; y < GRID_H - 1; y += 1) {
    for (let x = 1; x < GRID_W - 1; x += 1) {
      const index = cellIndex(x, y);
      if (!isWeakSpotCandidateCell(index)) continue;
      const distance = Math.abs(x - state.drill.x) + Math.abs(y - state.drill.y);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestCandidates.length = 0;
        bestCandidates.push(index);
      } else if (distance === bestDistance) {
        bestCandidates.push(index);
      }
    }
  }
  if (bestCandidates.length === 0) return false;
  const pick = bestCandidates[Math.floor(Math.random() * bestCandidates.length)];
  state.weakSpotMask[pick] = state.lastTs || 1;
  return true;
}

function getEffectiveWeakSpotChance(hasWeakSpotOnField = false) {
  void hasWeakSpotOnField;
  let chance = state.weakSpotChance || 0;
  if (state.breachPresenceChance) {
    chance += state.armor > 0 ? state.breachPresenceChance : -state.breachPresenceChance;
  }
  if (state.overhealDrillTimer > 0 && state.overdriveBreachChance) {
    chance += state.overdriveBreachChance;
  }
  if (state.lowFuelWeakSpotChance > 0 && state.maxFuel > 0 && state.fuel / state.maxFuel <= 0.25) {
    chance += state.lowFuelWeakSpotChance;
  }
  if (state.luckAsWeakSpotChance) {
    chance += (state.luck || 0) * (state.luckAsWeakSpotChance / 100);
  }
  return clamp(chance, 0, 1);
}

function isMiningTowardNearbyBeacon(targetX, targetY, radius = 10) {
  if (!Number.isFinite(targetX) || !Number.isFinite(targetY)) {
    return false;
  }
  const radiusSq = radius * radius;
  const fromX = state.drill.x + 0.5;
  const fromY = state.drill.y + 0.5;
  const toX = targetX + 0.5;
  const toY = targetY + 0.5;
  for (const beacon of state.beacons) {
    const bx = beacon.x + 0.5;
    const by = beacon.y + 0.5;
    const fromDx = bx - fromX;
    const fromDy = by - fromY;
    const fromDistSq = fromDx * fromDx + fromDy * fromDy;
    if (fromDistSq > radiusSq) continue;
    const toDx = bx - toX;
    const toDy = by - toY;
    const toDistSq = toDx * toDx + toDy * toDy;
    if (toDistSq < fromDistSq) {
      return true;
    }
  }
  return false;
}

function getBeaconAlchemyDrillDamageBonus(targetX, targetY) {
  const towardBeacon = isMiningTowardNearbyBeacon(targetX, targetY, 10);
  let total = 0;
  for (const tier of getEquipmentTiers("beacon_alchemy_drill")) {
    const baseFlat = 12;
    total += baseFlat;
    if (towardBeacon) {
      const beaconFlat = 20;
      const beaconScale = [0, 0.15, 0.20, 0.25, 0.30][tier] || 0;
      total += beaconFlat + state.drillPower * beaconScale;
    }
  }
  return total;
}

function getStrikeDamage(targetX = null, targetY = null) {
  const contourCap = [0, 0.15, 0.3, 0.5, 1][state.contourLengthDamageLevel] || 0;
  const contourLength = Math.max(0, state.pathTiles.length - 1);
  const contourBoost = 1 + Math.min(contourCap, contourLength * 0.01);
  const lowFuelFactor = state.maxFuel > 0 ? 1 - state.fuel / state.maxFuel : 0;
  const lowFuelDamageBoost = 1 + lowFuelFactor * (state.lowFuelDamageBonus || 0);
  let damage =
    BASE_DRILL_DAMAGE * contourBoost +
    getBasicDrillDamageBonus() +
    getBlastDrillDamageBonus() +
    getTradeoffDrillDamageBonus() +
    getFragileDrillDamageBonus() +
    getTelescopicDrillDamageBonus() +
    getDiagonalDrillArrayDamageBonus() +
    getLuckyPickaxeDamageBonus() +
    getShardDrillDamageBonus() +
    getBreachMissileDamageBonus() +
    getFuelRocketDamageBonus() +
    getBreachAfterburnerDamageBonus() +
    getBreachChainDrillDamageBonus() +
    getThermoDrillDamageBonus() +
    getBeaconAlchemyDrillDamageBonus(targetX, targetY) +
    getRecipeAlchemyDrillDamageBonus() +
    getContourOverloadDrillDamageBonus() +
    getContourLineDrillDamageBonus();
  return damage * (1 + state.damageBonus / 100) * lowFuelDamageBoost;
}

function getEquipmentTiers(effectId) {
  return getEquippedParts()
    .filter((part) => part.id === effectId)
    .map((part) => clamp(Math.round(part.rarity || RARITY.COMMON), RARITY.COMMON, RARITY.LEGENDARY));
}

function getItemTiers(effectId) {
  return getPurchasedItems()
    .filter((item) => item.id === effectId)
    .map((item) => clamp(Math.round(item.rarity || RARITY.COMMON), RARITY.COMMON, RARITY.LEGENDARY));
}

function sumItemTierValues(effectId, values) {
  let total = 0;
  for (const tier of getItemTiers(effectId)) {
    total += values[tier] || 0;
  }
  return total;
}

function sumEquipmentTierValues(effectId, values) {
  let total = 0;
  for (const tier of getEquipmentTiers(effectId)) {
    total += values[tier] || 0;
  }
  return total;
}

function getRocketDamageMultiplier() {
  const bonusPercent = sumItemTierValues("siege_warhead", [0, 15, 20, 25, 30]);
  return 1 + bonusPercent / 100;
}

function getOverhealWarheadExplosionGain() {
  return sumItemTierValues("overheal_warhead_matrix", [0, 1, 2, 2, 3]);
}

function getOverflowBoosterExplosionBonusGain() {
  return sumItemTierValues("overflow_booster_manifold", [0, 2, 3, 4, 5]);
}

function getStunSalvoRocketCount() {
  return sumItemTierValues("stun_salvo_relay", [0, 1, 2, 3, 4]);
}

function getSeekerPodRocketDamage() {
  return sumItemTierValues("seeker_pod", [0, 12, 16, 20, 24]);
}

function getSeekerPodRocketCount() {
  return sumItemTierValues("seeker_pod", [0, 1, 2, 3, 4]);
}

function getCarpetPayloadRocketCount() {
  return sumItemTierValues("carpet_payload", [0, 2, 3, 4, 5]);
}

function getCarpetPayloadRocketDamage() {
  return sumItemTierValues("carpet_payload", [0, 8, 10, 12, 15]);
}

function getFragileDrillDamageBonus() {
  let total = 0;
  for (const tier of getEquipmentTiers("fragile_drill")) {
    const flat = [0, 10, 15, 20, 25][tier] || 0;
    const damageScale = [0, 0.10, 0.15, 0.20, 0.25][tier] || 0;
    total += flat + state.drillPower * damageScale;
  }
  return total;
}

function getFragileDrillSpeedBonus() {
  if (state.armor <= 0) return 0;
  return sumEquipmentTierValues("fragile_drill", [0, 10, 15, 20, 30]);
}

function getAdrenalineSpeedBonus() {
  if (!state.adrenalineLevel || state.hp >= 50) return 0;
  return state.adrenalineLevel;
}

function getBasicDrillDamageBonus() {
  let total = 0;
  for (const tier of getEquipmentTiers("basic_drill")) {
    const flat = [0, 10, 15, 20, 25][tier] || 0;
    const damageScale = [0, 0.10, 0.15, 0.20, 0.25][tier] || 0;
    total += flat + state.drillPower * damageScale;
  }
  return total;
}

function getBlastDrillDamageBonus() {
  let total = 0;
  for (const tier of getEquipmentTiers("blast_drill")) {
    const flat = [0, 6, 10, 14, 18][tier] || 0;
    const explosionScale = [0, 0.30, 0.40, 0.50, 0.60][tier] || 0;
    total += flat + state.explosionPower * explosionScale;
  }
  return total;
}

function getTradeoffDrillDamageBonus() {
  let total = 0;
  for (const tier of getEquipmentTiers("tradeoff_drill")) {
    const flat = [0, 16, 22, 30, 40][tier] || 0;
    const damageScale = [0, 0.10, 0.10, 0.10, 0.10][tier] || 0;
    total += flat + state.drillPower * damageScale;
  }
  return total;
}

function getLuckyPickaxeDamageBonus() {
  let total = 0;
  for (const tier of getEquipmentTiers("lucky_pickaxe")) {
    const flat = [0, 10, 15, 20, 25][tier] || 0;
    const damageScale = [0, 0.10, 0.20, 0.30, 0.40][tier] || 0;
    const luckScale = [0, 0.10, 0.15, 0.20, 0.25][tier] || 0;
    total += flat + state.drillPower * damageScale + state.luck * luckScale;
  }
  return total;
}

function getTelescopicDrillDamageBonus() {
  let total = 0;
  for (const tier of getEquipmentTiers("telescopic_drill")) {
    const flat = 10;
    const drillScale = [0, 0.10, 0.20, 0.30, 0.40][tier] || 0;
    total += flat + state.drillPower * drillScale;
  }
  return total;
}

function getDiagonalDrillArrayDamageBonus() {
  let total = 0;
  for (const tier of getEquipmentTiers("diagonal_drill_array")) {
    const flat = 10;
    const drillScale = [0, 0.10, 0.15, 0.20, 0.25][tier] || 0;
    total += flat + state.drillPower * drillScale;
  }
  return total;
}

function getThermoDrillDamageBonus() {
  let total = 0;
  for (const tier of getEquipmentTiers("thermo_drill")) {
    const flat = [0, 0, 20, 25, 30][tier] || 0;
    const drillScale = [0, 0, 0.15, 0.20, 0.25][tier] || 0;
    const heatBonus = [0, 0, 1, 2, 3][tier] || 0;
    total += flat + state.drillPower * drillScale + Math.floor(state.heat / 10) * heatBonus;
  }
  return total;
}

function getRecipeAlchemyDrillDamageBonus() {
  let total = 0;
  const recipes = Math.max(0, Math.round(state.recipesCompletedThisRun || 0));
  for (const tier of getEquipmentTiers("recipe_alchemy_drill")) {
    const flat = 5;
    const perRecipe = [0, 5, 7, 9, 11][tier] || 0;
    total += flat + perRecipe * recipes;
  }
  return total;
}

function getContourOverloadDrillDamageBonus() {
  return sumEquipmentTierValues("contour_overload_drill", [0, 15, 20, 25, 30]);
}

function getContourOverloadExplosionDamage() {
  const flat = sumEquipmentTierValues("contour_overload_drill", [0, 30, 40, 50, 60]);
  const scale = sumEquipmentTierValues("contour_overload_drill", [0, 20, 30, 40, 50]);
  return flat + state.explosionPower * (scale / 100);
}

function getContourLineDrillDamageBonus() {
  let total = 0;
  const contourLength = Math.max(0, state.pathTiles.length - 1);
  for (const tier of getEquipmentTiers("contour_line_drill")) {
    const flat = 10;
    const drillScale = [0, 0.10, 0.20, 0.30, 0.40][tier] || 0;
    const perLength = [0, 1, 2, 3, 4][tier] || 0;
    total += flat + state.drillPower * drillScale + perLength * contourLength;
  }
  return total;
}

function getContourResonanceDrillBlastDamage() {
  let total = 0;
  for (const tier of getItemTiers("contour_resonance_drill")) {
    const flat = 20;
    const explosionScale = [0, 0.10, 0.15, 0.20, 0.30][tier] || 0;
    total += flat + state.explosionPower * explosionScale;
  }
  return total;
}

function applyLoopPressureBuff(brokenCellCount) {
  if (brokenCellCount <= 0) return;
  let bonus = 0;
  let duration = 0;
  for (const tier of getItemTiers("loop_pressure")) {
    const perBlock = [0, 3, 4, 5, 6][tier] || 0;
    const tierDuration = [0, 4, 4.5, 5, 5.5][tier] || 0;
    bonus += perBlock * brokenCellCount;
    duration = Math.max(duration, tierDuration);
  }
  if (bonus <= 0 || duration <= 0) return;
  const actualDuration = getScaledEffectDuration(duration);
  if (actualDuration <= 0) return;

  if (state.loopPressureDrillPowerBonus > 0) {
    state.drillPower = Math.max(0, state.drillPower - state.loopPressureDrillPowerBonus);
  }
  state.loopPressureDrillPowerBonus = bonus;
  state.loopPressureTimer = actualDuration;
  state.loopPressureDisplayDuration = actualDuration;
  state.drillPower += bonus;
}

function applyContourBlastPressureBuff(brokenCellCount) {
  if (brokenCellCount <= 0) return;
  let bonus = 0;
  let duration = 0;
  for (const tier of getItemTiers("contour_blast_pressure")) {
    const perBlock = 5;
    const tierDuration = [0, 5, 6, 7, 8][tier] || 0;
    bonus += perBlock * brokenCellCount;
    duration = Math.max(duration, tierDuration);
  }
  if (bonus <= 0 || duration <= 0) return;
  const actualDuration = getScaledEffectDuration(duration);
  if (actualDuration <= 0) return;

  if (state.contourBlastPressureExplosionBonus > 0) {
    state.explosionPower = Math.max(0, state.explosionPower - state.contourBlastPressureExplosionBonus);
  }
  state.contourBlastPressureExplosionBonus = bonus;
  state.contourBlastPressureTimer = actualDuration;
  state.contourBlastPressureDisplayDuration = actualDuration;
  state.explosionPower += bonus;
}

function applyContourExplosionDamageToEnemy(uniqueTargets, damage) {
  if (!state.contourEnemy || damage <= 0) return;
  if (!(uniqueTargets instanceof Set) || uniqueTargets.size === 0) return;
  const enemyIndex = cellIndex(state.contourEnemy.x, state.contourEnemy.y);
  if (uniqueTargets.has(enemyIndex)) {
    hitContourEnemy(damage);
  }
}

function triggerContourResonancePulse() {
  if (state.pathTiles.length === 0) return;
  const damage = getContourResonanceDrillBlastDamage();
  if (damage <= 0) return;

  const radius = getScaledExplosionRadius(1);
  const maxOffset = Math.ceil(radius);
  const uniqueTargets = new Set();

  playSound("explosion");
  for (const segment of state.pathTiles) {
    state.effects.push({
      kind: "explosion",
      x: segment.x,
      y: segment.y,
      radius,
      time: EXPLOSION_EFFECT_DURATION,
      duration: EXPLOSION_EFFECT_DURATION,
      seed: (segment.x * 7219 + segment.y * 3571 + 31) % 1000,
    });
    for (let oy = -maxOffset; oy <= maxOffset; oy += 1) {
      for (let ox = -maxOffset; ox <= maxOffset; ox += 1) {
        if (Math.hypot(ox, oy) > radius) continue;
        const tx = segment.x + ox;
        const ty = segment.y + oy;
        if (tx < 1 || ty < 1 || tx >= GRID_W - 1 || ty >= GRID_H - 1) continue;
        uniqueTargets.add(cellIndex(tx, ty));
      }
    }
  }

  applyContourExplosionDamageToEnemy(uniqueTargets, damage);
  for (const index of uniqueTargets) {
    const tx = index % GRID_W;
    const ty = Math.floor(index / GRID_W);
    damageCell(tx, ty, damage, {
      cause: "explosion",
      showActualDamage: true,
      suppressHazardPlayerDamage: true,
    });
  }
  state.contourResonanceFlashTimer = Math.max(state.contourResonanceFlashTimer || 0, 0.22);
}

function getShardDrillDamageBonus() {
  return sumEquipmentTierValues("shard_drill", [0, 8, 12, 16, 20]);
}

function getShardDrillExplosionDamage() {
  const flat = sumEquipmentTierValues("shard_drill", [0, 20, 30, 45, 60]);
  const scale = sumEquipmentTierValues("shard_drill", [0, 10, 10, 10, 10]);
  return flat + state.explosionPower * (scale / 100);
}

function getBreachMissileDamageBonus() {
  const flat = sumEquipmentTierValues("breach_missile", [0, 10, 10, 10, 10]);
  const scale = sumEquipmentTierValues("breach_missile", [0, 10, 15, 20, 25]);
  return flat + state.drillPower * (scale / 100);
}

function getFuelRocketDamageBonus() {
  let total = 0;
  for (const tier of getEquipmentTiers("fuel_rocket")) {
    const flat = 15;
    const scale = [0, 0.10, 0.15, 0.20, 0.25][tier] || 0;
    total += flat + state.drillPower * scale;
  }
  return total;
}

function getBreachAfterburnerDamageBonus() {
  let total = 0;
  const weakSpotMultPoints = (state.weakSpotMult || 0) * 100;
  for (const tier of getEquipmentTiers("breach_afterburner")) {
    const flat = 12;
    const drillScale = [0, 0.10, 0.12, 0.15, 0.20][tier] || 0;
    const weakSpotScale = [0, 0.02, 0.04, 0.06, 0.10][tier] || 0;
    total += flat + state.drillPower * drillScale + weakSpotMultPoints * weakSpotScale;
  }
  return total;
}

function getBreachChainDrillDamageBonus() {
  let total = 0;
  const weakSpotChancePoints = (state.weakSpotChance || 0) * 100;
  for (const tier of getEquipmentTiers("breach_chain_drill")) {
    const flat = 15;
    const explosionScale = [0, 0.10, 0.12, 0.15, 0.20][tier] || 0;
    const weakSpotChanceScale = [0, 0.02, 0.04, 0.06, 0.10][tier] || 0;
    total += flat + state.explosionPower * explosionScale + weakSpotChancePoints * weakSpotChanceScale;
  }
  return total;
}

function getBreachMissileExplosionScaleForTier(tier) {
  return [0, 0.3, 0.4, 0.5, 0.6][tier] || 0.3;
}

function getFuelRocketExplosionScaleForTier(tier) {
  return [0, 0.15, 0.20, 0.25, 0.30][tier] || 0.15;
}

function getCryoRocketExplosionScaleForTier(tier) {
  return [0, 0.10, 0.15, 0.20, 0.25][tier] || 0.10;
}

function triggerAfterburnFlashChargeExplosion(overdriveSeconds) {
  const seconds = Math.max(0, Number(overdriveSeconds) || 0);
  if (seconds <= 0 || state.dead) return;
  let damagePerSecond = 0;
  for (const tier of getItemTiers("afterburn_flash_charge")) {
    damagePerSecond += [0, 10, 15, 20, 25][tier] || 0;
  }
  if (damagePerSecond <= 0) return;

  const damage = seconds * damagePerSecond;
  explodeAt(state.drill.x, state.drill.y, damage, 1.5, {
    guaranteedBreak: false,
    cause: "explosion",
    explosionPowerScale: 0,
  });
}

function triggerContourSalvoRack(loopBlockCount) {
  const contourBlocks = Math.max(0, Math.floor(loopBlockCount || 0));
  if (contourBlocks < 4) return;
  const tiers = getItemTiers("contour_salvo_rack");
  if (tiers.length === 0) return;
  const rocketsPerItem = Math.floor(contourBlocks / 4);
  if (rocketsPerItem <= 0) return;

  for (const tier of tiers) {
    const explosionPowerScale = getCryoRocketExplosionScaleForTier(tier);
    for (let i = 0; i < rocketsPerItem; i += 1) {
      fireRocket(
        state.drill.x,
        state.drill.y,
        CRYO_ROCKET_DAMAGE,
        CRYO_ROCKET_RADIUS,
        1 + Math.floor(Math.random() * 3),
        {
          explosionPowerScale,
          skipRadiusBonus: true,
        },
      );
    }
  }
}

function getLuckyPickaxeOreGain() {
  return sumEquipmentTierValues("lucky_pickaxe", [0, 1, 2, 3, 4]);
}

function getXpNeededForLevel(level) {
  return Math.round(40 * XP_INFLATION * 1.15 ** Math.max(0, level - 1));
}

function applyGoldBonus(amount) {
  if (amount <= 0) {
    return 0;
  }
  const multiplier = Math.max(0, 1 + (state.goldBonus || 0));
  const total = amount * multiplier + (state.goldBonusRemainder || 0);
  const whole = Math.max(1, Math.floor(total + 1e-9));
  state.goldBonusRemainder = Math.max(0, total - whole);
  return whole;
}

function applyMiningGoldBonus(amount) {
  if (amount <= 0) {
    return 0;
  }
  const multiplier = Math.max(0, 1 + (state.miningGoldBonusMultiplier || 0));
  const total = amount * multiplier + (state.miningGoldBonusRemainder || 0);
  const whole = Math.max(1, Math.floor(total + 1e-9));
  state.miningGoldBonusRemainder = Math.max(0, total - whole);
  return whole;
}

function spawnExperienceCrystal(x, y, amount = XP_PER_BLOCK) {
  if (amount <= 0) {
    return;
  }
  const index = cellIndex(x, y);
  state.xpPickupMask[index] += amount;
}

function scaleExperienceGain(amount) {
  if (amount <= 0) {
    return 0;
  }
  const multiplier = Math.max(0, 1 + (state.xpBonus || 0));
  const total = amount * multiplier + (state.xpBonusRemainder || 0);
  const whole = Math.max(0, Math.floor(total + 1e-9));
  state.xpBonusRemainder = Math.max(0, total - whole);
  return whole;
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
    state.levelRewardQueue.push({ step: state.levelRewardStep, level: state.level, choices: generateLevelRewardChoices(state.level) });
    applyLevelUpItemBonuses();
    if (state.levelCatalystLevel > 0 && state.crystalRecipe.length > 0 && state.crystalProgress < state.crystalRecipe.length) {
      const firstType = state.crystalRecipe[0];
      const completedRecipe = [...state.crystalRecipe];
      clearCrystalRecipe();
      grantCrystalRecipeReward(firstType, completedRecipe, state.drill.x, state.drill.y);
    }
    state.levelUpFlash = Math.min(1, (state.levelUpFlash || 0) + 0.55);
    state.levelUpPulse = 0.9;
    state.levelUpModalDelay = 0.9;
    spawnLevelUpBurst(state.drill.x, state.drill.y);
    showLevelToast(t("toast.level", { level: state.level }));
  }
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
      if (amount > 0) {
        state.xpPickupMask[index] = 0;
        spawnExperienceParticles(tx, ty, scaleExperienceGain(amount), { showToast: false });
      }
      const bonusAmount = state.xpBonusPickupMask[index];
      if (bonusAmount <= 0) {
        continue;
      }
      state.xpBonusPickupMask[index] = 0;
      spawnExperienceParticles(tx, ty, scaleExperienceGain(bonusAmount), { showToast: true, isBonusXp: true });
    }
  }
}

function addToGoldPickupMask(x, y, amount) {
  if (amount <= 0) return;
  state.goldPickupMask[cellIndex(x, y)] += amount;
}

function addToGoldBonusPickupMask(x, y, amount) {
  if (amount <= 0) return;
  state.goldBonusPickupMask[cellIndex(x, y)] += amount;
}

function spawnGoldPickupParticle(tx, ty, amount, isBonus, options = {}) {
  const seed = (tx * 193 + ty * 389 + (isBonus ? 777 : 0)) % 1000;
  const showToast = options.showToast === true;
  state.xpParticles.push({
    tileX: tx + 0.5,
    tileY: ty + 0.5,
    value: amount,
    elapsed: 0,
    delay: 0,
    duration: 0.24 + (seed % 6) * 0.02,
    seed,
    isGold: true,
    isGoldBonus: isBonus,
    showTotal: showToast ? amount : 0,
  });
}

function pickupGoldNearPlayer() {
  const px = state.drill.x;
  const py = state.drill.y;
  for (let dy = -XP_PICKUP_RADIUS; dy <= XP_PICKUP_RADIUS; dy += 1) {
    for (let dx = -XP_PICKUP_RADIUS; dx <= XP_PICKUP_RADIUS; dx += 1) {
      const tx = px + dx;
      const ty = py + dy;
      if (tx < 1 || ty < 1 || tx >= GRID_W - 1 || ty >= GRID_H - 1) continue;
      const index = cellIndex(tx, ty);
      const amount = state.goldPickupMask[index];
      if (amount > 0) {
        state.goldPickupMask[index] = 0;
        spawnGoldPickupParticle(tx, ty, amount, false, { showToast: true });
      }
      const bonusAmount = state.goldBonusPickupMask[index];
      if (bonusAmount > 0) {
        state.goldBonusPickupMask[index] = 0;
        spawnGoldPickupParticle(tx, ty, bonusAmount, true, { showToast: true });
      }
    }
  }
}

function addFuel(amount, originX = state.drill.x, originY = state.drill.y, options = {}) {
  if (amount <= 0) {
    return;
  }

  playSound("fuel_pickup", { volume: 0.7 });
  const baseAmountFromSource = Number.isFinite(options.baseAmount) ? Math.max(0, Math.round(options.baseAmount)) : null;
  const baseGainRaw = baseAmountFromSource ?? Math.max(0, Math.round(amount));
  const totalGain = Math.round(amount * Math.max(0, 1 + (state.fuelBonus || 0)));
  const baseGain = Math.min(baseGainRaw, totalGain);
  const bonusGain = Math.max(0, totalGain - baseGain);
  if (baseGain > 0) {
    showFuelToast(baseGain);
  } else if (totalGain > 0) {
    showFuelToast(totalGain);
  }
  if (bonusGain > 0) {
    showBonusFuelToast(bonusGain);
  }
  const overflow = state.fuel + totalGain - state.maxFuel;
  state.fuel = Math.min(state.maxFuel, state.fuel + totalGain);
  if (overflow > 0 && state.overflowGovernorDrillGain > 0) {
    state.drillPower += state.overflowGovernorDrillGain;
  }
  if (overflow > 0) {
    const overflowExplosionBonusGain = getOverflowBoosterExplosionBonusGain();
    if (overflowExplosionBonusGain > 0) {
      state.explosionBonus += overflowExplosionBonusGain;
    }
  }

  if (!options.preventOverflowTrigger && state.overflowBomb && overflow > 0 && !state.overflowTriggeredInEvent && !state.resolvingOverflowBomb) {
    state.overflowTriggeredInEvent = true;
    triggerOverflowSurge();
  }
  if (state.fuelConverterLevel > 0 && overflow > 0) {
    const duration = getScaledEffectDuration(2 + state.fuelConverterLevel);
    activateDrillOverdrive(duration, t("toast.fuel_converter_boost"));
  }
  const fuelRocketTiers = getEquipmentTiers("fuel_rocket");
  if (fuelRocketTiers.length > 0) {
    for (const tier of fuelRocketTiers) {
      fireRocket(
        state.drill.x,
        state.drill.y,
        FUEL_ROCKET_DAMAGE,
        FUEL_ROCKET_RADIUS,
        1 + Math.floor(Math.random() * 3),
        {
          explosionPowerScale: getFuelRocketExplosionScaleForTier(tier),
          skipRadiusBonus: true,
        },
      );
    }
  } else {
    for (let ri = 0; ri < state.fuelRocketLevel; ri += 1) {
      fireRocket(
        state.drill.x,
        state.drill.y,
        FUEL_ROCKET_DAMAGE,
        FUEL_ROCKET_RADIUS,
        1 + Math.floor(Math.random() * 3),
        {
          explosionPowerScale: 0.15,
          skipRadiusBonus: true,
        },
      );
    }
  }
}

function dropArtifactOnDamage() {
  if (state.blueprintCount <= 0) return;
  playSound("artifact_drop");
  state.blueprintCount--;
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
    state.blueprintMask[ci] = 1;
    showPerkToast(t("toast.artifact_lost"));
    return;
  }
  // Fallback: drop on self
  state.blueprintMask[cellIndex(state.drill.x, state.drill.y)] = 1;
  showPerkToast(t("toast.artifact_lost"));
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
    showPerkToast(t("toast.key_lost"));
    return;
  }
  // fallback: drop on self
  const selfIdx = cellIndex(state.drill.x, state.drill.y);
  state.keyMask[selfIdx] = state.heldKeyForSafe + 1;
  state.heldKeyForSafe = -1;
  state.keyBumpTime = 0;
  state.keyBumpDir = null;
  showPerkToast(t("toast.key_lost"));
}

function openSafeDoor(safeIdx, doorX, doorY) {
  const safe = state.safes[safeIdx];
  if (!safe || safe.opened) return;
  playSound("safe_door_open");
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
  // 50/50: blueprint or 3 random perks (+damage=3, +speed=5)
  if (Math.random() < 0.5) {
    // Blueprint in center
    const center = cells[Math.floor(cells.length / 2)];
    state.blueprintMask[cellIndex(center.x, center.y)] = 1;
    showPerkToast(t("toast.safe_opened_artifact"));
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
    showPerkToast(t("toast.safe_opened_perks"));
  }
}

function scatterGoldAroundTile(sourceX, sourceY, dropAmount, options = {}) {
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

  const minTargets = Math.max(1, Math.floor(options.minTargets ?? 3));
  const maxTargets = Math.max(minTargets, Math.floor(options.maxTargets ?? 5));
  const randomTargetCount = minTargets + Math.floor(Math.random() * (maxTargets - minTargets + 1));
  const targetCount = Math.min(candidates.length, randomTargetCount);
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
  const saveRate = [0, 0.30, 0.50, 0.70, 0.90][Math.min(4, state.insuranceLevel || 0)];
  let remaining = total;
  if (saveRate > 0) {
    const saved = Math.floor(total * saveRate);
    state.gold += saved;
    remaining -= saved;
    if (saved > 0) showPerkToast(t("toast.insurance", { saved }));
  }
  const lostAmount = Math.floor(remaining * 0.3);
  const dropAmount = Math.max(0, remaining - lostAmount);
  scatterGoldAroundTile(state.drill.x, state.drill.y, dropAmount, { minTargets: 1, maxTargets: 1 });
}

function drainFuel(amount, options = {}) {
  if (amount <= 0 || state.dead) return;
  const hudKind = options.hudKind || "active";
  if (state.fuel >= amount) {
    state.fuel -= amount;
    state.lastFuelHudChangeKind = hudKind;
    state.outOfFuel = false;
    return;
  }
  const fromFuel = state.fuel;
  const fromHp = (amount - fromFuel) * 0.7 * Math.max(0, 1 - state.fuelStarvationResistance / 100);
  state.fuel = 0;
  if (fromFuel > 0) {
    state.lastFuelHudChangeKind = hudKind;
  }
  if (!state.outOfFuel) {
    state.outOfFuel = true;
    playSound("fuel_emergency");
  }
  applyHazardDamage(fromHp, { affectsArmor: false, dropOnDamage: false, silent: true });
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
      showPerkToast(t("toast.armor_absorbed", { amount: absorbed }));
      return;
    }
    if (absorbed > 0) {
      showPerkToast(t("toast.armor_absorbed", { amount: absorbed }));
    }
  }

  state.hp = Math.max(0, state.hp - damageLeft);
  if (options.silent !== true) {
    playSound("player_hit");
    state.cameraShake.amplitude = Math.max(state.cameraShake.amplitude, 1.3);
    state.damageFlash = Math.min(1, state.damageFlash + 0.8);
  }
  if (options.silent !== true) {
    showHpToast(damageLeft);
  }
  if (options.dropOnDamage !== false) {
    dropUnsafeGold();
    dropArtifactOnDamage();
    dropKeyOnDamage();
  }
  if (state.hp <= 0) {
    playSound("player_death");
    state.dead = true;
  }
}

function showHpToast(value) {
  if (value <= 0) {
    return;
  }
  debounceToast("hp", value, "#ff8a8a", v => `-${v} HP`, 2);
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
    rollingStarted: false,
  });
}

function updateBoulders(dt) {
  for (let i = state.boulders.length - 1; i >= 0; i -= 1) {
    const boulder = state.boulders[i];
    if (boulder.animTimer > 0) {
      boulder.animTimer = Math.max(0, boulder.animTimer - dt);
    }

    if (boulder.delay > 0) {
      boulder.delay = Math.max(0, boulder.delay - dt);
      if (boulder.delay === 0 && !boulder.rollingStarted) {
        boulder.rollingStarted = true;
        playSound("boulder_roll");
      }
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
          telegraphTimer: 1.0,
          alive: true,
          damagedCells: new Set(),
          hitPlayer: false,
          trail: [],
        });
        playSound("worm_spawn");
      }
    } else {
      nest.active = false;
    }
  }

  // Phase B: update active worms — follow precomputed path
  const wormMoveInterval = 1 / WORM_SPEED; // seconds per tile
  for (let i = state.activeWorms.length - 1; i >= 0; i--) {
    const worm = state.activeWorms[i];
    worm.moveTimer += dt;
    if (worm.telegraphTimer > 0) worm.telegraphTimer -= dt;

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
        playSound("worm_attack");
        applyHazardDamage(WORM_DAMAGE);
      }
    }
  }
}

// ─── Contour enemy ────────────────────────────────────────────────────────────

function bfsContourEnemyPath(startX, startY, targetX, targetY) {
  if (startX === targetX && startY === targetY) return [];
  const N = GRID_W * GRID_H;
  const parent = new Int32Array(N).fill(-1);
  const startIdx = startY * GRID_W + startX;
  const targetIdx = targetY * GRID_W + targetX;
  parent[startIdx] = startIdx;
  const queue = [startIdx];
  let qi = 0;
  while (qi < queue.length) {
    const cur = queue[qi++];
    const cx = cur % GRID_W;
    const cy = (cur / GRID_W) | 0;
    const ns = [
      cx > 0        ? cur - 1      : -1,
      cx < GRID_W-1 ? cur + 1      : -1,
      cy > 0        ? cur - GRID_W : -1,
      cy < GRID_H-1 ? cur + GRID_W : -1,
    ];
    for (const nidx of ns) {
      if (nidx < 0 || parent[nidx] !== -1) continue;
      if (!state.tunnelMask[nidx] && nidx !== targetIdx) continue;
      parent[nidx] = cur;
      if (nidx === targetIdx) {
        const path = [];
        let c = targetIdx;
        while (c !== startIdx) {
          path.unshift({ x: c % GRID_W, y: (c / GRID_W) | 0 });
          c = parent[c];
        }
        return path;
      }
      queue.push(nidx);
    }
  }
  return null;
}

function spawnContourEnemy() {
  const tail = state.pathTiles[0];
  const depthMult = Math.pow(1.8, (state.currentDepthLevel || 1) - 1);
  const hp = Math.round(CONTOUR_ENEMY_BASE_HP * depthMult);
  state.contourEnemy = {
    x: tail.x, y: tail.y,
    renderX: tail.x, renderY: tail.y,
    hp, maxHp: hp,
    depthMult,
    reward: Math.round(CONTOUR_ENEMY_BASE_REWARD * depthMult),
    tilesEaten: 0,
    mode: 'eating',
    attackTimer: CONTOUR_ENEMY_ATTACK_INTERVAL,
    attackPhase: null,
    attackTelegraphTimer: 0,
    attackTargetX: 0,
    attackTargetY: 0,
    facingX: 0, facingY: 1,
    stunTimer: 0,
    bobPhase: 0,
  };
  playSound("worm_spawn");
}

function hitContourEnemy(damage) {
  const enemy = state.contourEnemy;
  if (!enemy || enemy.stunTimer > 0) return;
  enemy.hp -= damage;
  spawnDamageNumberEffect(enemy.x, enemy.y, damage);
  addHeatOnStrike(CONTOUR_ENEMY_EXTRA_HEAT);
  state.drill.moveResumeTimer = Math.max(state.drill.moveResumeTimer, POST_BREAK_MOVE_DELAY * 1.5);
  if (enemy.hp <= 0) {
    spawnGoldParticles(enemy.x, enemy.y, enemy.reward);
    showGoldToast(enemy.reward);
    spawnExperienceParticles(enemy.x, enemy.y, Math.max(1, enemy.tilesEaten * 2 + 5));
    playSound("block_break", { pitch: 0.6 });
    state.contourEnemy = null;
    return;
  }
  enemy.stunTimer = CONTOUR_ENEMY_STUN_DURATION;
  enemy.attackPhase = null;
  enemy.attackTimer = CONTOUR_ENEMY_ATTACK_INTERVAL;
}

function contourEnemyGlide(enemy, dt) {
  const dx = enemy.x - enemy.renderX;
  const dy = enemy.y - enemy.renderY;
  const dist = Math.hypot(dx, dy);
  const step = CONTOUR_ENEMY_SPEED * dt;
  if (dist <= step) {
    enemy.renderX = enemy.x;
    enemy.renderY = enemy.y;
    return true;
  }
  enemy.renderX += (dx / dist) * step;
  enemy.renderY += (dy / dist) * step;
  return false;
}

function contourEnemyPickNext(enemy) {
  const path = state.pathTiles;
  const hx = state.drill.x, hy = state.drill.y;

  if (Math.abs(hx - enemy.x) + Math.abs(hy - enemy.y) <= 1) return;

  // Rejoin contour if possible
  if (enemy.mode === 'pathing' && path.length >= 2 &&
      path[0].x === enemy.x && path[0].y === enemy.y) {
    enemy.mode = 'eating';
  }

  let nextX = -1, nextY = -1;

  if (enemy.mode === 'eating') {
    if (path.length >= 2 && path[0].x === enemy.x && path[0].y === enemy.y) {
      const next = path[1];
      if (!(next.x === hx && next.y === hy)) {
        path.shift();
        rebuildPathIndex();
        const hpGainPerTile = Math.max(0, CONTOUR_ENEMY_HP_PER_TILE + (state.contourEnemyHpPerTileBonus || 0));
        const rewardGainPerTile = Math.max(0, CONTOUR_ENEMY_REWARD_PER_TILE + (state.contourEnemyRewardPerTileBonus || 0));
        enemy.hp += hpGainPerTile;
        enemy.maxHp = enemy.hp;
        enemy.reward += rewardGainPerTile;
        enemy.tilesEaten++;
        nextX = next.x;
        nextY = next.y;
      }
    } else {
      enemy.mode = 'pathing';
    }
  }

  if (enemy.mode === 'pathing') {
    // BFS through tunnels toward hero
    const startKey = `${enemy.x},${enemy.y}`;
    const goalKey = `${hx},${hy}`;
    const visited = new Map([[startKey, null]]);
    const queue = [{ x: enemy.x, y: enemy.y }];
    let found = false;
    const dirs4 = [[1,0],[-1,0],[0,1],[0,-1]];
    outer: for (let qi = 0; qi < queue.length; qi++) {
      const cur = queue[qi];
      for (const [ddx, ddy] of dirs4) {
        const nx = cur.x + ddx, ny = cur.y + ddy;
        if (nx < 0 || ny < 0 || nx >= GRID_W || ny >= GRID_H) continue;
        const nk = `${nx},${ny}`;
        if (visited.has(nk)) continue;
        if (!state.tunnelMask[cellIndex(nx, ny)] && !(nx === hx && ny === hy)) continue;
        visited.set(nk, `${cur.x},${cur.y}`);
        if (nx === hx && ny === hy) { found = true; break outer; }
        queue.push({ x: nx, y: ny });
      }
    }
    if (found) {
      // Trace back to find first step from enemy
      let cur = goalKey;
      let prev = visited.get(cur);
      while (prev && prev !== startKey) { cur = prev; prev = visited.get(cur); }
      if (prev === startKey) {
        const [sx, sy] = cur.split(',').map(Number);
        nextX = sx; nextY = sy;
      }
    } else {
      // No tunnel path to hero — destroy enemy
      state.contourEnemy = null;
      return;
    }
  }

  if (nextX >= 0) {
    enemy.facingX = nextX - enemy.x;
    enemy.facingY = nextY - enemy.y;
    enemy.x = nextX;
    enemy.y = nextY;
  }
}

function updateContourEnemy(dt) {
  if (state.dead) return;
  const path = state.pathTiles;

  if (!state.contourEnemy) return;

  const enemy = state.contourEnemy;
  enemy.bobPhase += dt * 4;

  // Stun: frozen in place
  if (enemy.stunTimer > 0) {
    enemy.stunTimer -= dt;
    return;
  }

  // Telegraph phase
  if (enemy.attackPhase === 'telegraph') {
    enemy.attackTelegraphTimer -= dt;
    if (enemy.attackTelegraphTimer <= 0) {
      if (state.drill.x === enemy.attackTargetX && state.drill.y === enemy.attackTargetY) {
        applyHazardDamage(Math.round(CONTOUR_ENEMY_DAMAGE * enemy.depthMult));
        playSound("worm_attack");
      }
      enemy.attackPhase = null;
      enemy.attackTimer = CONTOUR_ENEMY_ATTACK_INTERVAL;
    }
    // Keep render gliding to logical position during telegraph
    contourEnemyGlide(enemy, dt);
    return;
  }

  // Attack timer
  enemy.attackTimer -= dt;
  if (enemy.attackTimer <= 0) {
    const adx = state.drill.x - enemy.x;
    const ady = state.drill.y - enemy.y;
    if (Math.abs(adx) + Math.abs(ady) <= CONTOUR_ENEMY_ATTACK_RANGE) {
      const tx = enemy.x + (Math.abs(adx) >= Math.abs(ady) ? Math.sign(adx) : 0);
      const ty = enemy.y + (Math.abs(ady) >  Math.abs(adx) ? Math.sign(ady) : 0);
      enemy.attackPhase = 'telegraph';
      enemy.attackTelegraphTimer = CONTOUR_ENEMY_ATTACK_TELEGRAPH;
      enemy.attackTargetX = tx;
      enemy.attackTargetY = ty;
      enemy.facingX = tx - enemy.x;
      enemy.facingY = ty - enemy.y;
    } else {
      enemy.attackTimer = CONTOUR_ENEMY_ATTACK_INTERVAL * 0.4;
    }
  }

  // Move render toward logical position; pick next tile on arrival
  const arrived = contourEnemyGlide(enemy, dt);
  if (arrived) contourEnemyPickNext(enemy);
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
        damage: Math.max(1, BASE_DRILL_DAMAGE * 0.3),
        radius: 1.25,
      });
    } else {
      explodeAt(x, y, Math.max(1, getStrikeDamage() * 0.3), 1.25, { cause: "explosion", skipRadiusBonus: true });
    }
  }
}

function damageCell(x, y, damage, options = {}) {
  if (x < 1 || y < 1 || x >= GRID_W - 1 || y >= GRID_H - 1 || damage <= 0) {
    return false;
  }

  const index = cellIndex(x, y);
  if (options.cause === "explosion" && state.gasMask[index]) {
    scheduleChainExplosion({ kind: "gas", x, y });
  }
  const pierceLeft = options.pierceLeft ?? 0;
  const forcePierce = !!options.forcePierce;
  const pierceDamageMult = Number.isFinite(options.pierceDamageMult) ? Math.max(0, options.pierceDamageMult) : 1;
  const pierceBaseDamage = Number.isFinite(options.pierceBaseDamage) ? options.pierceBaseDamage : damage;
  let pierceActive = !!options.pierceActive;
  if (options.byDrill && state.weakSpotMask[index]) {
    state.lastStrikeHitWeakSpot = true;
    damage *= state.weakSpotMult;
    state.weakSpotMask[index] = 0;
    pierceActive = true;
    spawnWeakSpotHitEffect(x, y, options.dirX ?? 0, options.dirY ?? 1);
    if (state.weakSpotFuelGain > 0) {
      addFuel(state.weakSpotFuelGain);
    }
    if (state.breachAfterburnerSeconds > 0) {
      activateDrillOverdrive(state.breachAfterburnerSeconds);
    }
    if (state.breachChainHitsOnTrigger > 0) {
      state.breachChainEmpoweredHits += Math.max(0, Math.round(state.breachChainHitsOnTrigger));
    }
    for (const tier of getEquipmentTiers("breach_missile")) {
      fireRocket(
        x,
        y,
        BREACH_MISSILE_DAMAGE,
        BREACH_MISSILE_RADIUS,
        1 + Math.floor(Math.random() * 3),
        { explosionPowerScale: getBreachMissileExplosionScaleForTier(tier) },
      );
    }
    const shardBlastDamage = getShardDrillExplosionDamage();
    if (shardBlastDamage > 0) {
      explodeAt(x, y, shardBlastDamage, SHARD_DRILL_BLAST_RADIUS, {
        guaranteedBreak: false,
      });
    }
    if (getItemTiers("contour_resonance_drill").length > 0) {
      triggerContourResonancePulse();
    }
    const carpetPayloadCount = getCarpetPayloadRocketCount();
    const carpetPayloadDamage = getCarpetPayloadRocketDamage();
    if (carpetPayloadCount > 0 && carpetPayloadDamage > 0) {
      for (let ri = 0; ri < carpetPayloadCount; ri += 1) {
        fireRocket(
          x,
          y,
          carpetPayloadDamage,
          1,
          1 + Math.floor(Math.random() * 3),
          {
            explosionPowerScale: 0.10,
            skipRadiusBonus: true,
          },
        );
      }
    }
  }
  const continuePierce = () => {
    if ((!pierceActive && !forcePierce) || pierceLeft <= 0) {
      return;
    }
    const px = x + (options.dirX ?? 0);
    const py = y + (options.dirY ?? 1);
    damageCell(px, py, pierceBaseDamage * pierceDamageMult, {
      ...options,
      byDrill: true,
      pierceActive: true,
      forcePierce,
      pierceDamageMult,
      pierceBaseDamage,
      pierceLeft: pierceLeft - 1,
    });
  };
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
  if (state.beaconMask[index] && !isHiddenBeaconCore(index)) {
    return false;
  }
  if (!state.hardness[index]) {
    return false;
  }
  if (options.byDrill && state.goldOreMask[index]) {
    const oreGain = getLuckyPickaxeOreGain();
    if (oreGain > 0) {
      state.droppedGoldMask[index] += oreGain;
    }
  }
  const hazardType = state.hazardMask[index];
  const allowHazardChain = options.allowHazardChain && hazardType === HAZARD_TYPES.VOLATILE;
  const spikeExplosion = hazardType === HAZARD_TYPES.SPIKE && options.cause === "explosion";
  if ((!options.ignoreHazardEffect || allowHazardChain) && hazardType && !state.hazardTriggeredMask[index]) {
    state.hazardTriggeredMask[index] = 1;
    triggerHazardEffect(hazardType, x, y, {
      suppressPlayerDamage: !!options.suppressHazardPlayerDamage || !!options.allowHazardChain,
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
  const displayedDamage = options.showActualDamage ? actualDamage : damage;
  if (actualDamage > 0) {
    state.blockHpBarLastHitTs[index] = state.lastTs || performance.now();
  }
  spawnDamageNumberEffect(x, y, displayedDamage);
  state.health[index] -= spikeExplosion ? actualDamage : damage;
  if (state.health[index] > 0) {
    continuePierce();
    return false;
  }

  if (options.cause === "explosion") {
    spendCollapseBudget(10);
  }
  breakCell(x, y, index, options);
  continuePierce();
  return true;
}

function triggerSpikeChain(x, y) {
  playSound("spike_trigger");
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
  spendCollapseBudget(hardness);
  spendContourEnemyBudget(hardness, state.pathTiles.length);
  const hazardType = state.hazardMask[index];
  const goldMultiplier = state.loopGoldMask[index] > 0 ? state.loopGoldMask[index] : 1;
  const oreBaseGold = state.goldOreMask[index] ? GOLD_ORE_PER_BLOCK : 0;
  const oreScaledGold = oreBaseGold > 0 ? Math.floor(oreBaseGold * goldMultiplier) : 0;
  const oreScaledGoldWithStat = applyMiningGoldBonus(oreScaledGold);
  spawnBreakEffect(x, y, hardness, options.cause || "break");
  if (oreScaledGoldWithStat > 0) {
    playSound("block_break_ore");
    const contourBonusGold = Math.max(0, oreScaledGoldWithStat - oreBaseGold);
    addToGoldPickupMask(x, y, oreScaledGoldWithStat - contourBonusGold);
    if (contourBonusGold > 0) {
      addToGoldBonusPickupMask(x, y, contourBonusGold);
    }
  }
  const embeddedGold = Math.floor(state.droppedGoldMask[index]);
  if (embeddedGold > 0) {
    state.droppedGoldMask[index] = 0;
    addToGoldPickupMask(x, y, embeddedGold);
  }
  const microRes = state.microResourceMask[index];
  if (microRes > 0) {
    state.microResourceMask[index] = 0;
    state.microResourceRevealedMask[index] = 0;
    if (microRes === 1) {
      const microBase = Math.round(1 * goldMultiplier);
      addToGoldPickupMask(x, y, microBase);
    } else if (microRes === 2) {
      addFuel(Math.round(5 * goldMultiplier), x, y);
    } else if (microRes === 3) {
      state.xpBonusPickupMask[cellIndex(x, y)] += Math.round(XP_PER_BLOCK * goldMultiplier);
    }
  }
  state.hardness[index] = 0;
  state.health[index] = 0;
  state.blocksBroken += 1;
  if (options.byDrill) {
    state.drillBrokenBlocks += 1;
    state.contourOverloadBrokenBlocks = Math.max(0, state.contourOverloadBrokenBlocks || 0) + 1;
  }
  if (hazardType === HAZARD_TYPES.SPIKE && state.spikeOverdriveLevel > 0) {
    const durations = [0, 6, 9, 12];
    activateDrillOverdrive(durations[state.spikeOverdriveLevel] || 6, t("toast.spike_boost_activated"));
  }
  state.hazardMask[index] = 0;
  state.hazardTriggeredMask[index] = 0;
  state.loopGoldMask[index] = 0;
  state.goldOreMask[index] = 0;
  state.goldClustersCache = null;
  if (hazardType === HAZARD_TYPES.SPIKE && options.cause === "explosion") {
    triggerSpikeChain(x, y);
  }
  if (state.remoteBombInterval > 0 && options.byDrill && state.drillBrokenBlocks % state.remoteBombInterval === 0) {
    triggerRemoteBombSquare(x, y, 1);
  }

  carveTunnel(x, y, goldMultiplier);
  for (const beacon of state.beacons) {
    if (!beacon.hidden) {
      continue;
    }
    if (!isInsideBeaconCore(beacon, x, y)) {
      continue;
    }
    finalizeHiddenBeaconExcavation(beacon);
    break;
  }
  const baseBlockXp = XP_PER_BLOCK;
  const totalBlockXp = Math.round(XP_PER_BLOCK * goldMultiplier);
  const bonusBlockXp = Math.max(0, totalBlockXp - baseBlockXp);
  spawnExperienceCrystal(x, y, baseBlockXp);
  if (bonusBlockXp > 0) {
    state.xpBonusPickupMask[index] += bonusBlockXp;
  }

  // Check if a worm nest was destroyed
  for (const nest of state.wormNests) {
    if (!nest.destroyed && nest.x === x && nest.y === y) {
      nest.destroyed = true;
      nest.active = false;
      const reward = 150 + Math.floor(Math.random() * 101);
      // Flashy gold ore effect (burst + floating value text)
      showGoldToast(reward);
      const scattered = scatterGoldAroundTile(x, y, reward);
      if (!scattered) {
        spawnGoldParticles(x, y, reward);
        state.unsafeGold += reward;
      }
      showPerkToast(scattered ? t("toast.nest_destroyed_scattered", { reward }) : t("toast.nest_destroyed", { reward }));
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

const EXPLOSION_WAVE_DELAY = 0.05;
const EXPLOSION_FALLOFF_MIN = 0.05;
const EXPLOSION_STEP_FALLOFF = [1, 0.92, 0.78, 0.6, 0.42];

function getScaledExplosionDamage(baseDamage, options = {}) {
  const explosionPowerScale = Number.isFinite(options.explosionPowerScale) ? options.explosionPowerScale : 1;
  return (baseDamage + state.explosionPower * explosionPowerScale) * (1 + state.explosionBonus / 100);
}

function getScaledExplosionRadius(baseRadius = 2, options = {}) {
  return Math.max(1, baseRadius + (options.skipRadiusBonus ? 0 : (state.explosionRadiusBonus || 0)));
}

function explodeAt(x, y, damage, radius = 2, options = {}) {
  const scaledRadius = getScaledExplosionRadius(radius, options);
  spawnExplosionEffect(x, y, scaledRadius);
  const scaledDamage = getScaledExplosionDamage(damage, options);
  const breakDamage = options.guaranteedBreak === false ? scaledDamage : Math.max(scaledDamage, EXPLOSION_BREAK_DAMAGE);
  const maxOffset = Math.ceil(scaledRadius);
  for (let oy = -maxOffset; oy <= maxOffset; oy += 1) {
    for (let ox = -maxOffset; ox <= maxOffset; ox += 1) {
      const dist = Math.hypot(ox, oy);
      if (dist > scaledRadius) continue;
      const tx = x + ox;
      const ty = y + oy;
      if (tx < 1 || ty < 1 || tx >= GRID_W - 1 || ty >= GRID_H - 1) continue;
      const step = Math.floor(dist);
      const baseFalloff = step < EXPLOSION_STEP_FALLOFF.length
        ? EXPLOSION_STEP_FALLOFF[step]
        : EXPLOSION_STEP_FALLOFF[EXPLOSION_STEP_FALLOFF.length - 1] * (0.7 ** (step - (EXPLOSION_STEP_FALLOFF.length - 1)));
      const falloff = Math.max(EXPLOSION_FALLOFF_MIN, baseFalloff);
      const cellDamage = breakDamage * falloff;
      const delay = step * EXPLOSION_WAVE_DELAY;
      state.chainExplosions.push({
        kind: "explosionCell",
        x: tx, y: ty,
        damage: cellDamage,
        triggerGas: options.triggerGas !== false,
        delay,
      });
    }
  }
}

function spawnRocketEffect(fromX, fromY, targetX, targetY, payload, { instant = false } = {}) {
  playSound("rocket_launch");
  const dx = targetX - fromX;
  const dy = targetY - fromY;
  const distance = Math.hypot(dx, dy);
  const travelDuration = 0.18 + distance * 0.07;
  state.effects.push({
    kind: "rocket",
    phase: "flying",
    instant,
    time: travelDuration,
    duration: travelDuration,
    travelDuration,
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
  playSound("rocket_detonate");
  if (effect.payload.kind === "radiusBomb") {
    const blastRadius = getScaledExplosionRadius(effect.payload.radius, effect.payload);
    const distToPlayer = Math.hypot(effect.targetX - state.drill.x, effect.targetY - state.drill.y);
    if (distToPlayer <= blastRadius) {
      const scaledDamage = getScaledExplosionDamage(effect.payload.damage, effect.payload);
      const heatTakenMult = Math.max(0, 1 + (state.explosionHeatTaken || 0) / 100);
      addHeatOnStrike(Math.round(scaledDamage * 0.3 * heatTakenMult));
    }
    explodeAt(effect.targetX, effect.targetY, effect.payload.damage, effect.payload.radius, {
      guaranteedBreak: false,
      explosionPowerScale: effect.payload.explosionPowerScale,
      skipRadiusBonus: !!effect.payload.skipRadiusBonus,
    });
  }
}

function fireRocket(originX, originY, baseDamage, baseRadius, distance, options = {}) {
  const rocketDamage = baseDamage * getRocketDamageMultiplier();
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
  spawnRocketEffect(originX, originY, centerX, centerY, {
    kind: "radiusBomb",
    damage: rocketDamage,
    radius: baseRadius,
    explosionPowerScale: options.explosionPowerScale,
    skipRadiusBonus: !!options.skipRadiusBonus,
  });
}

function triggerRemoteBombSquare(originX, originY, distance) {
  playSound("remote_bomb");
  const directions = [
    { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 },
    { x: 1, y: 1 }, { x: 1, y: -1 }, { x: -1, y: 1 }, { x: -1, y: -1 },
  ];
  const dir = directions[Math.floor(Math.random() * directions.length)];
  const centerX = clamp(originX + dir.x * distance, 1, GRID_W - 2);
  const centerY = clamp(originY + dir.y * distance, 1, GRID_H - 2);
  explodeAt(centerX, centerY, REMOTE_BOMB_DAMAGE, REMOTE_BOMB_RADIUS, { guaranteedBreak: true });
}

function recordPlayerMove(fromX, fromY, toX, toY) {
  state.visibilityDirty = true;
  consumeSignalMove(fromX, fromY, toX, toY);
  extendPath(toX, toY);
  const moveIndex = cellIndex(toX, toY);
  const droppedPickup = Math.floor(state.droppedGoldMask[moveIndex]);
  if (droppedPickup > 0 && state.tunnelMask[moveIndex]) {
    state.droppedGoldMask[moveIndex] = 0;
    addToGoldPickupMask(toX, toY, droppedPickup);
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
  // Pick up blueprint by walking over it — currency, no restrictions
  if (state.blueprintMask[moveIndex] > 0) {
    state.blueprintMask[moveIndex] = 0;
    state.blueprintCount++;
    playSound("artifact_pickup");
    showPerkToast(t("toast.artifact_picked_up"));
  }
  // Pick up key by walking over it
  if (state.heldKeyForSafe === -1 && state.keyMask[moveIndex] > 0) {
    const safeIdx = state.keyMask[moveIndex] - 1;
    state.keyMask[moveIndex] = 0;
    state.heldKeyForSafe = safeIdx;
    state.keyBumpTime = 0;
    state.keyBumpDir = null;
    playSound("key_pickup");
    showPerkToast(t("toast.key_picked_up"));
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
    const maxX = rightCell !== -1 && isWalkableTileIndex(rightCell) ? state.drill.renderX + maxDistance : Math.min(currentCellX + 0.5, state.drill.renderX + maxDistance);
    nextX = maxX;
  } else if (dx < 0) {
    nextY = currentCellY;
    const leftCell = currentCellX - 1 >= 0 ? cellIndex(currentCellX - 1, currentCellY) : -1;
    const minX = leftCell !== -1 && isWalkableTileIndex(leftCell) ? state.drill.renderX - maxDistance : Math.max(currentCellX - 0.5, state.drill.renderX - maxDistance);
    nextX = minX;
  } else if (dy > 0) {
    nextX = currentCellX;
    const downCell = currentCellY + 1 < GRID_H ? cellIndex(currentCellX, currentCellY + 1) : -1;
    const maxY = downCell !== -1 && isWalkableTileIndex(downCell) ? state.drill.renderY + maxDistance : Math.min(currentCellY + 0.5, state.drill.renderY + maxDistance);
    nextY = maxY;
  } else if (dy < 0) {
    nextX = currentCellX;
    const upCell = currentCellY - 1 >= 0 ? cellIndex(currentCellX, currentCellY - 1) : -1;
    const minY = upCell !== -1 && isWalkableTileIndex(upCell) ? state.drill.renderY - maxDistance : Math.max(currentCellY - 0.5, state.drill.renderY - maxDistance);
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
    // Auto-close boundary cells should receive contour resource bonus
    // even though they can be broken before the loop interior pass runs.
    state.loopGoldMask[index] = Math.max(state.loopGoldMask[index], state.contourResMultiplier);
    if (!state.tunnelMask[index]) {
      damageCell(x, y, EXPLOSION_BREAK_DAMAGE, {
        ignoreHazardEffect: true,
        allowHazardChain: true,
        cause: "explosion",
        showActualDamage: true,
      });
    }
    extendPath(x, y, true);
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
  const targetY = state.drill.renderY * TILE_SIZE + TILE_SIZE * 0.5 - viewHeight * 0.5;
  const maxX = GRID_W * TILE_SIZE - viewWidth;
  const maxY = GRID_H * TILE_SIZE - viewHeight;
  const clampedTargetX = clamp(targetX, 0, Math.max(0, maxX));
  const clampedTargetY = clamp(targetY, -viewHeight * 0.5, Math.max(0, maxY));
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

function collectExtraDrillStrikeTargets(targetX, targetY, dx, dy) {
  const out = [];
  const seen = new Set();
  const push = (x, y) => {
    if (x < 1 || y < 1 || x >= GRID_W - 1 || y >= GRID_H - 1) return;
    if (x === targetX && y === targetY) return;
    const key = `${x},${y}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ x, y });
  };
  const diagonalCount = Math.max(0, Math.floor(state.drillDiagonalCount || 0));
  if (diagonalCount > 0) {
    push(targetX - dy, targetY + dx);
  }
  if (diagonalCount > 1) {
    push(targetX + dy, targetY - dx);
  }
  return out;
}

function updateDrill(dt) {
  state.drill.actionCooldown = Math.max(0, state.drill.actionCooldown - dt);
  state.drill.moveResumeTimer = Math.max(0, state.drill.moveResumeTimer - dt);

  if (state.stunTimer > 0) {
    drainFuel(5 * dt);
    state.drill.progress = 0;
    state.drill.strikeEnergy = Math.max(0, state.drill.strikeEnergy - dt * 6);
    state.drill.strikeLatch = false;
    return;
  }

  // Carrying key drains fuel passively
  if (state.heldKeyForSafe >= 0) {
    drainFuel(4 * dt);
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
    const _autoCloseCandidate = state.autoClosePreview;
    const _autoCloseDistance = _autoCloseCandidate ? _autoCloseCandidate.distance : null;
    const _autoCloseDelay = _autoCloseDistance !== null
      ? Math.max(IDLE_AUTO_CLOSE_MIN_DELAY, _autoCloseDistance * AUTO_CLOSE_SEC_PER_BLOCK / (1 + state.speedOfAutoClose / 100))
      : Infinity;
    if (!state.idleAutoCloseTriggered && state.idleTime >= _autoCloseDelay) {
      state.idleAutoCloseTriggered = true;
      if (!tryAutoCloseContour()) {
        state.autoClosePreviewFailed = true;
        state.autoClosePreviewReturnTimer = IDLE_AUTO_CLOSE_PREVIEW_RETURN_DURATION;
        showPerkToast(t("toast.contour_not_found"));
      } else {
        state.autoClosePreview = null;
        state.autoClosePreviewReturnTimer = 0;
        state.autoClosePreviewFailed = false;
      }
    }
    if (_autoCloseCandidate && !state.idleAutoCloseTriggered) {
      drainFuel(DRILL_FUEL_DRAIN * Math.max(0, state.fuelDrainRate) * dt, { hudKind: "active" });
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

  if (state.drill.facingX !== dx || state.drill.facingY !== dy) {
    state.drill.facingX = dx;
    state.drill.facingY = dy;
    state.visibilityDirty = true;
  }
  const fuelFactor = state.maxFuel > 0 ? 1 - state.fuel / state.maxFuel : 0;
  const lowFuelStrikeSpeedBonus = fuelFactor * state.lowFuelSpeedBonus * 100;
  const lowFuelStrikeSpeedDelta = lowFuelStrikeSpeedBonus - (state.lowFuelStrikeSpeedApplied || 0);
  if (lowFuelStrikeSpeedDelta !== 0) {
    state.strikeSpeed += lowFuelStrikeSpeedDelta;
    state.lowFuelStrikeSpeedApplied = lowFuelStrikeSpeedBonus;
  }
  const overdriveBoost = state.overhealDrillTimer > 0 ? 1.75 : 1;
  const actionRate = STRIKE_CYCLE_SPEED * (1 + (state.strikeSpeed + getFragileDrillSpeedBonus() + getAdrenalineSpeedBonus()) / 100) * overdriveBoost;
  const actionInterval = (Math.PI * 2) / actionRate;

  const enemyBlocksTarget = state.contourEnemy !== null &&
    state.contourEnemy.x === targetX && state.contourEnemy.y === targetY;

  if (isWalkableTileIndex(targetIndex) && !enemyBlocksTarget) {
    if (state.drill.moveResumeTimer > 0) {
      state.drill.strikePhase += dt * actionRate;
      state.drill.progress = 0;
      state.drill.strikeEnergy = Math.max(0.08, state.drill.strikeEnergy - dt * 4);
      return;
    }
    // Reset bump timers when moving freely
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

  // While carrying key: cannot drill, drop by bumping wall for 1s (same as blueprint)
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
        if (!isWalkableTileIndex(ci)) continue;
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
      showPerkToast(t("toast.key_dropped"));
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
    drainFuel(DRILL_FUEL_DRAIN * Math.max(0, state.fuelDrainRate) * dt);
    moveDrillRenderToward(state.drill.x, state.drill.y, dt);
    return;
  }

  state.drill.strikePhase += dt * actionRate;
  state.drill.strikeEnergy = Math.min(1, state.drill.strikeEnergy + dt * 9);
  const strikeWave = Math.max(0, Math.sin(state.drill.strikePhase));

  moveDrillRenderToward(state.drill.x, state.drill.y, dt);

  state.drill.strikePhase = Math.PI * 0.5;
  state.drill.actionCooldown = actionInterval;
  const hadWeakSpotOnField = hasActiveWeakSpot();
  state.lastStrikeHitWeakSpot = false;
  const empoweredStrike = state.breachChainEmpoweredHits > 0;
  let strikeDamage = getStrikeDamage(targetX, targetY);
  if (empoweredStrike) {
    strikeDamage *= Math.max(1, state.weakSpotMult || 1);
  }
  const piercingCount = Math.max(0, Math.floor(state.drillPiercingCount || 0));
  const piercingDamageMult = Math.max(0, (state.drillPiercingDamage || 0) / 100);
  const weakSpotPierceDamageMult = Math.max(0, Math.floor(state.weakSpotPierce || 0)) > 0
    ? piercingDamageMult
    : 1;
  const diagonalDamageMult = Math.max(0, (state.drillDiagonalDamage || 0) / 100);
  const hardness = state.hardness[targetIndex];
  if (hardness > 0 && !state.metalMask[targetIndex]) {
    spawnDrillSmokeParticles(targetX, targetY, dx, dy);
  }
  const extraStrikeTargets = collectExtraDrillStrikeTargets(targetX, targetY, dx, dy);
  const brokeTargetBlock = damageCell(targetX, targetY, strikeDamage, {
    moveDrill: true,
    fromX: state.drill.x,
    fromY: state.drill.y,
    byDrill: true,
    dirX: dx,
    dirY: dy,
    pierceLeft: Math.max(0, Math.floor(state.weakSpotPierce || 0)) + piercingCount,
    forcePierce: piercingCount > 0,
    pierceDamageMult: piercingCount > 0 ? piercingDamageMult : weakSpotPierceDamageMult,
  });
  let brokeAnyBlock = brokeTargetBlock;
  if (empoweredStrike) {
    state.breachChainEmpoweredHits = Math.max(0, state.breachChainEmpoweredHits - 1);
  }
  if (hadWeakSpotOnField && !state.lastStrikeHitWeakSpot && state.breachMissCool > 0) {
    state.heat = Math.max(0, state.heat - state.breachMissCool);
  }
  if (state.contourEnemy && state.contourEnemy.x === targetX && state.contourEnemy.y === targetY) {
    hitContourEnemy(strikeDamage);
  }
  for (const extra of extraStrikeTargets) {
    const brokeExtra = damageCell(extra.x, extra.y, strikeDamage * diagonalDamageMult, {
      moveDrill: false,
      fromX: state.drill.x,
      fromY: state.drill.y,
      byDrill: true,
      dirX: dx,
      dirY: dy,
      pierceLeft: Math.max(0, Math.floor(state.weakSpotPierce || 0)),
      pierceDamageMult: weakSpotPierceDamageMult,
    });
    brokeAnyBlock = brokeAnyBlock || brokeExtra;
    if (state.contourEnemy && state.contourEnemy.x === extra.x && state.contourEnemy.y === extra.y) {
      hitContourEnemy(strikeDamage);
    }
  }
  const seekerRocketDamage = getSeekerPodRocketDamage();
  const seekerRocketCount = getSeekerPodRocketCount();
  if (seekerRocketDamage <= 0 || seekerRocketCount <= 0) {
    state.seekerPodTargetIndex = -1;
    state.seekerPodHitCount = 0;
  } else if (brokeTargetBlock) {
    state.seekerPodTargetIndex = -1;
    state.seekerPodHitCount = 0;
  } else if (state.hardness[targetIndex] > 0) {
    if (state.seekerPodTargetIndex !== targetIndex) {
      state.seekerPodTargetIndex = targetIndex;
      state.seekerPodHitCount = 1;
    } else {
      state.seekerPodHitCount += 1;
    }
    if (state.seekerPodHitCount >= 3) {
      for (let ri = 0; ri < seekerRocketCount; ri += 1) {
        fireRocket(
          state.drill.x,
          state.drill.y,
          seekerRocketDamage,
          1,
          1 + Math.floor(Math.random() * 3),
          {
            explosionPowerScale: 0.20,
            skipRadiusBonus: true,
          },
        );
      }
      state.seekerPodHitCount = 0;
    }
  } else {
    state.seekerPodTargetIndex = -1;
    state.seekerPodHitCount = 0;
  }
  state.comboCount = brokeAnyBlock ? (state.comboCount + 1) : 0;
  state.drill.progress += strikeDamage;
  state.cameraShake.amplitude = Math.max(
    state.cameraShake.amplitude,
    Math.min(1.8, 0.28 + hardness * 0.22) * Math.max(state.drill.strikeEnergy, 0.35),
  );

  state.weakSpotMask.fill(0);
  const weakSpotChance = getEffectiveWeakSpotChance(hadWeakSpotOnField);
  const canSpawnWeakSpot = !empoweredStrike && state.health[targetIndex] > 0;
  if (canSpawnWeakSpot && weakSpotChance > 0 && Math.random() < weakSpotChance) {
    const weakCandidates = [];
    const _wcAdd = (cx, cy) => {
      if (cx < 1 || cy < 1 || cx >= GRID_W - 1 || cy >= GRID_H - 1) return;
      const ci = cellIndex(cx, cy);
      if (isWeakSpotCandidateCell(ci)) weakCandidates.push(ci);
    };
    _wcAdd(targetX, targetY);
    _wcAdd(state.drill.x - dy, state.drill.y + dx);
    _wcAdd(state.drill.x + dy, state.drill.y - dx);
    if (weakCandidates.length > 0) {
      state.weakSpotMask[weakCandidates[Math.floor(Math.random() * weakCandidates.length)]] = state.lastTs || 1;
    }
  }

  addHeatOnStrike(HEAT_PER_STRIKE * Math.max(0, state.heatRate));

  if (state.fuel <= 0) {
    state.fuel = 0;
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
    state.baseFoundRunTimeSec = state.runTimeSec;
    playSound("base_found");
  }
}

function tryBeaconContourDeposit(x, y) {
  if (state.unsafeGold <= 0) return;
  for (const beacon of state.beacons) {
    if (beacon.active) continue;
    if (beacon.hidden && !isBeaconFullyExcavated(beacon)) continue;
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

function triggerContourOverloadExplosion(pathTiles) {
  const tiers = getEquipmentTiers("contour_overload_drill");
  if (tiers.length === 0) return false;
  if (!Array.isArray(pathTiles) || pathTiles.length === 0) return false;

  const maxContour = Math.max(9, Math.round(state.maxContour || 0));
  const brokenBlocks = Math.max(0, state.contourOverloadBrokenBlocks || 0);
  const damageCoef = Math.min(brokenBlocks / maxContour, 1);
  const damage = getContourOverloadExplosionDamage() * damageCoef;
  if (damage <= 0) return false;
  const radius = getScaledExplosionRadius(1);
  const maxOffset = Math.ceil(radius);
  const uniqueTargets = new Set();

  playSound("explosion");
  for (const segment of pathTiles) {
    state.effects.push({
      kind: "explosion",
      x: segment.x,
      y: segment.y,
      radius,
      time: EXPLOSION_EFFECT_DURATION,
      duration: EXPLOSION_EFFECT_DURATION,
      seed: (segment.x * 7219 + segment.y * 3571 + 10) % 1000,
    });
    for (let oy = -maxOffset; oy <= maxOffset; oy += 1) {
      for (let ox = -maxOffset; ox <= maxOffset; ox += 1) {
        if (Math.hypot(ox, oy) > radius) continue;
        const tx = segment.x + ox;
        const ty = segment.y + oy;
        if (tx < 1 || ty < 1 || tx >= GRID_W - 1 || ty >= GRID_H - 1) continue;
        uniqueTargets.add(cellIndex(tx, ty));
      }
    }
  }

  applyContourExplosionDamageToEnemy(uniqueTargets, damage);
  for (const index of uniqueTargets) {
    const tx = index % GRID_W;
    const ty = Math.floor(index / GRID_W);
    damageCell(tx, ty, damage, {
      cause: "explosion",
      suppressHazardPlayerDamage: true,
    });
  }
  return true;
}

function extendPath(x, y, ignoreMaxLength = false) {
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
  if (!ignoreMaxLength && state.pathTiles.length > state.maxContour) {
    const hasContourOverloadDrill = getEquipmentTiers("contour_overload_drill").length > 0;
    const didExplode = hasContourOverloadDrill && triggerContourOverloadExplosion(state.pathTiles);
    if (hasContourOverloadDrill || didExplode) {
      state.pathTiles.length = 0;
      state.pathTiles.push({ x, y });
      state.pathTailGhost = null;
      state.pathTailFade = 0;
      rebuildPathIndex();
      tryBeaconContourDeposit(x, y);
      return;
    }
    state.pathTailGhost = state.pathTiles[0];
    state.pathTiles.shift();
    state.pathTailFade = 1;
  }
  rebuildPathIndex();
  tryBeaconContourDeposit(x, y);
}

function triggerPathLoop(loopStartIndex, targetX, targetY) {
  const loopPath = state.pathTiles.slice(loopStartIndex);
  if (loopPath.length < 3) {
    return false;
  }
  playSound("contour_close");

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
  let brokenCellCount = 0;
  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      if (!isPointInPolygon(x + 0.5, y + 0.5, polygon)) {
        continue;
      }
      interiorCells.push({ x, y });
      const index = cellIndex(x, y);
      state.loopGoldMask[index] = state.contourResMultiplier;
      if (state.tunnelMask[index]) {
        continue;
      }
      affectedCells.push({ x, y });
      if (damageCell(x, y, EXPLOSION_BREAK_DAMAGE, {
        ignoreHazardEffect: true,
        allowHazardChain: true,
        cause: "explosion",
        showActualDamage: true,
      })) {
        brokenCellCount += 1;
      }
    }
  }

  maybeSpawnLoopPerk(interiorCells, brokenCellCount);
  applyLoopPressureBuff(brokenCellCount);
  applyContourBlastPressureBuff(brokenCellCount);
  triggerContourSalvoRack(loopPath.length);
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
    if (!pathWithinBeaconArea) continue;
    if (beacon.hidden && !isBeaconFullyExcavated(beacon)) continue;
    if (beacon.active) {
      continue;
    }
    if (pathWithinBeaconArea) {
      revealHiddenBeacon(beacon);
      beacon.active = true;
      playSound("beacon_activate");
      beacon.activationAnimStart = state.lastTs || performance.now();
      state.pendingBeaconWireActivation = beacon;
      if (state.beaconCatalystLevel > 0 && state.crystalRecipe.length > 0 && state.crystalProgress < state.crystalRecipe.length) {
        const firstType = state.crystalRecipe[0];
        const completedRecipe = [...state.crystalRecipe];
        clearCrystalRecipe();
        grantCrystalRecipeReward(firstType, completedRecipe, beacon.x, beacon.y);
      }
      // Deposit any remaining unsafe gold (most was deposited progressively)
      if (state.unsafeGold > 0) {
        state.gold += Math.floor(state.unsafeGold);
        state.unsafeGold = 0;
      }
      // Drain all blueprints now; each one will show a sequential choice modal
      const blueprintRemaining = state.blueprintCount;
      state.blueprintCount = 0;
      const pendingAction = blueprintRemaining > 0
        ? { type: "blueprintChoice", remaining: blueprintRemaining, beacon }
        : { type: "shop", beaconY: beacon.y };
      showPerkToast(t("toast.beacon_activated"));
      addFuel(Math.ceil(state.maxFuel - state.fuel), beacon.x, beacon.y);
      state.beaconActivationAnim = {
        beacon,
        startTs: beacon.activationAnimStart,
        pendingAction,
        blueprintFlightCount: blueprintRemaining,
        blueprintFlightFromX: state.drill.renderX,
        blueprintFlightFromY: state.drill.renderY,
      };
    }
  }

  return true;
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

function maybeSpawnLoopPerk(interiorCells, brokenCellCount = 0) {
  const chance = Math.min(1, getLoopPerkChance(brokenCellCount) + (state.loopSpawnBonusChance || 0));
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
  showPerkToast(t("toast.contour_trophy"));
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
  playSound("loop_field");
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
  if (state.debugMapActive) return { x: state.debugMapCamera.x, y: state.debugMapCamera.y };
  const shakeX = Math.sin(state.cameraShake.time * 1.7) * state.cameraShake.amplitude;
  const shakeY = Math.cos(state.cameraShake.time * 2.3) * state.cameraShake.amplitude * 0.7;
  return {
    x: state.camera.x + shakeX,
    y: state.camera.y + shakeY,
  };
}

function getCameraZoom() {
  if (state.debugMapActive) return state.debugMapCamera.zoom;
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
    } else if (effect.kind === "wireDust") {
      const alpha = (1 - progress) * (0.22 + effect.progress * 0.24);
      const lift = progress * (4 + effect.progress * 6);
      for (let puff = 0; puff < 4; puff += 1) {
        const angle = ((effect.seed + puff * 71) % 628) / 100;
        const drift = 1.5 + puff * 0.8 + effect.progress * 1.5;
        const px = cx + Math.cos(angle) * drift * progress * 4;
        const py = cy + Math.sin(angle) * drift * progress * 2 - lift;
        const size = 2 + ((effect.seed + puff * 19) % 2) + effect.progress * 1.2;
        ctx.globalAlpha = alpha * (0.85 - puff * 0.12);
        ctx.fillStyle = puff % 2 === 0 ? "#c6ab87" : "#8a6b4d";
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
      }
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
    } else if (effect.kind === "weakSpotHit") {
      const alpha = 1 - progress;
      const easeOut = 1 - Math.pow(1 - progress, 2);

      // Central flash
      ctx.globalAlpha = (1 - progress * 2) > 0 ? (1 - progress * 2) : 0;
      ctx.fillStyle = "#fff8c0";
      ctx.beginPath();
      ctx.arc(cx, cy, 8 + easeOut * 6, 0, Math.PI * 2);
      ctx.fill();

      // Gold glow ring
      ctx.globalAlpha = alpha * 0.55;
      ctx.strokeStyle = "#ffd700";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cx, cy, 4 + easeOut * 14, 0, Math.PI * 2);
      ctx.stroke();

      // Outer fading ring
      ctx.globalAlpha = alpha * 0.25;
      ctx.strokeStyle = "#ffe566";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, 8 + easeOut * 22, 0, Math.PI * 2);
      ctx.stroke();

      // Gold sparks flying outward
      ctx.lineWidth = 1.8;
      for (let spark = 0; spark < 8; spark++) {
        const angle = ((effect.seed + spark * 79) % 628) / 100;
        const speed = 8 + ((effect.seed + spark * 31) % 8);
        const reach = speed * easeOut * 1.6;
        const tailLen = speed * Math.max(0, easeOut - 0.15) * 1.6;
        ctx.globalAlpha = alpha * (0.9 - spark * 0.05);
        ctx.strokeStyle = spark % 2 === 0 ? "#ffe566" : "#ffd700";
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * Math.max(0, reach - tailLen),
                   cy + Math.sin(angle) * Math.max(0, reach - tailLen));
        ctx.lineTo(cx + Math.cos(angle) * reach, cy + Math.sin(angle) * reach);
        ctx.stroke();
      }

      // Gold shards (square fragments)
      for (let shard = 0; shard < 6; shard++) {
        const angle = ((effect.seed + shard * 53) % 628) / 100;
        const dist = (5 + ((effect.seed + shard * 17) % 6)) * easeOut * 1.8;
        const size = 2.5 - progress * 1.5;
        if (size <= 0) continue;
        ctx.globalAlpha = alpha * 0.85;
        ctx.fillStyle = shard % 3 === 0 ? "#fff4a0" : "#ffc700";
        ctx.fillRect(cx + Math.cos(angle) * dist - size * 0.5,
                     cy + Math.sin(angle) * dist - size * 0.5, size, size);
      }
    } else if (effect.kind === "rocket") {
      if (effect.phase === "flying") {
        const t = clamp(1 - effect.time / effect.travelDuration, 0, 1);
        const startX = effect.fromX * TILE_SIZE + TILE_SIZE * 0.5 - camera.x;
        const startY = effect.fromY * TILE_SIZE + TILE_SIZE * 0.5 - camera.y;
        const endX = effect.targetX * TILE_SIZE + TILE_SIZE * 0.5 - camera.x;
        const endY = effect.targetY * TILE_SIZE + TILE_SIZE * 0.5 - camera.y;
        const midX = startX + (endX - startX) * t;
        const midY = startY + (endY - startY) * t - Math.sin(t * Math.PI) * effect.arcHeight;
        const tailT = Math.max(0, t - 0.08);
        const tailX = startX + (endX - startX) * tailT;
        const tailY = startY + (endY - startY) * tailT - Math.sin(tailT * Math.PI) * effect.arcHeight;

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
      } else {
        // Armed phase: perk-zone style highlight
        const pulse = 0.5 + 0.5 * Math.sin((state.lastTs || 0) * 0.018);
        const radius = getScaledExplosionRadius(effect.payload?.radius ?? 1, effect.payload || {});
        const maxOffset = Math.ceil(radius);
        const zoneColor = "#ff5a14";
        const inBlast = (ox, oy) => Math.hypot(ox, oy) <= radius;

        ctx.save();
        ctx.shadowColor = zoneColor;
        ctx.shadowBlur = 8 + pulse * 8;

        for (let oy = -maxOffset; oy <= maxOffset; oy += 1) {
          for (let ox = -maxOffset; ox <= maxOffset; ox += 1) {
            if (!inBlast(ox, oy)) continue;
            const sx = (effect.targetX + ox) * TILE_SIZE - camera.x;
            const sy = (effect.targetY + oy) * TILE_SIZE - camera.y;

            // Fill
            ctx.fillStyle = `${zoneColor}${Math.round((0x18 + pulse * 0x28)).toString(16).padStart(2, "0")}`;
            ctx.fillRect(sx + 5, sy + 5, TILE_SIZE - 10, TILE_SIZE - 10);

            // Border only on outer edges
            ctx.strokeStyle = `${zoneColor}cc`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            if (!inBlast(ox, oy - 1)) { ctx.moveTo(sx + 4, sy + 4);           ctx.lineTo(sx + TILE_SIZE - 4, sy + 4); }
            if (!inBlast(ox + 1, oy)) { ctx.moveTo(sx + TILE_SIZE - 4, sy + 4); ctx.lineTo(sx + TILE_SIZE - 4, sy + TILE_SIZE - 4); }
            if (!inBlast(ox, oy + 1)) { ctx.moveTo(sx + 4, sy + TILE_SIZE - 4); ctx.lineTo(sx + TILE_SIZE - 4, sy + TILE_SIZE - 4); }
            if (!inBlast(ox - 1, oy)) { ctx.moveTo(sx + 4, sy + 4);           ctx.lineTo(sx + 4, sy + TILE_SIZE - 4); }
            ctx.stroke();
          }
        }

        // Pulsing center dot
        const cx = effect.targetX * TILE_SIZE + TILE_SIZE * 0.5 - camera.x;
        const cy = effect.targetY * TILE_SIZE + TILE_SIZE * 0.5 - camera.y;
        ctx.fillStyle = `rgba(255, 220, 80, ${0.8 + 0.2 * pulse})`;
        ctx.beginPath();
        ctx.arc(cx, cy, 3 + 1.5 * pulse, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
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
    } else if (effect.kind === "xpPickup") {
      const t = progress;
      const easeOut = 1 - (1 - t) * (1 - t);
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
      ctx.strokeStyle = "rgba(4, 16, 28, 0.95)";
      ctx.fillStyle = "#78d8ff";
      ctx.strokeText(`+${effect.value} ◆`, 0, 0);
      ctx.fillText(`+${effect.value} ◆`, 0, 0);
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
    } else if (effect.kind === "levelup") {
      const t = progress;
      const easeOut = 1 - (1 - t) * (1 - t);

      // 1. Central flash — bright cyan burst that fades in first 28%
      if (t < 0.28) {
        const ft = t / 0.28;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 6 + ft * 30);
        grad.addColorStop(0, `rgba(210, 248, 255, ${0.88 * (1 - ft)})`);
        grad.addColorStop(0.5, `rgba(80, 220, 255, ${0.45 * (1 - ft)})`);
        grad.addColorStop(1, "rgba(40, 180, 255, 0)");
        ctx.globalAlpha = 1;
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, 6 + ft * 30, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Primary expanding ring
      if (t < 0.72) {
        const rt = t / 0.72;
        ctx.globalAlpha = 0.9 * (1 - rt);
        ctx.strokeStyle = "#7de0ff";
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.arc(cx, cy, 4 + rt * 42, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 3. Slower outer ring
      if (t < 0.92) {
        const rt = t / 0.92;
        ctx.globalAlpha = 0.38 * (1 - rt);
        ctx.strokeStyle = "#aaf0ff";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, 10 + rt * 60, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 4. Radial burst lines (first 48%)
      if (t < 0.48) {
        const st = t / 0.48;
        ctx.globalAlpha = 1 - st;
        ctx.strokeStyle = "#c0f4ff";
        ctx.lineWidth = 1.6;
        ctx.lineCap = "round";
        for (let s = 0; s < 10; s += 1) {
          const angle = ((effect.seed * 37 + s * 63) % 628) / 100;
          const r1 = 7 + st * 3;
          const r2 = 17 + st * 22;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(angle) * r1, cy + Math.sin(angle) * r1);
          ctx.lineTo(cx + Math.cos(angle) * r2, cy + Math.sin(angle) * r2);
          ctx.stroke();
        }
      }

      // 5. Flying XP-colored dots
      for (let p = 0; p < 10; p += 1) {
        const pseed = effect.seed + p * 113;
        const angle = ((pseed * 79) % 628) / 100;
        const speed = 20 + (pseed % 18);
        const dpx = cx + Math.cos(angle) * speed * easeOut;
        const dpy = cy + Math.sin(angle) * speed * easeOut;
        const palpha = Math.max(0, 1 - t * 1.25);
        const size = 1.8 + (pseed % 3) * 0.5;
        ctx.globalAlpha = palpha;
        ctx.fillStyle = "#5ae0ff";
        ctx.beginPath();
        ctx.arc(dpx, dpy, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ddfbff";
        ctx.beginPath();
        ctx.arc(dpx, dpy, size * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    } else if (effect.kind === "microReveal") {
      const t = progress;
      const colors = { 1: "#f5c842", 2: "#54d4f0", 3: "#78d8ff" };
      const color = colors[effect.mType] || "#ffffff";
      const ey = cy - TILE_SIZE * 0.18; // slightly above icon

      // Flash core
      if (t < 0.45) {
        const ft = t / 0.45;
        const grad = ctx.createRadialGradient(cx, ey, 0, cx, ey, 2 + ft * 9);
        grad.addColorStop(0, `rgba(255,255,255,${0.9 * (1 - ft)})`);
        grad.addColorStop(0.4, `${color}${Math.round((0.6 * (1 - ft)) * 255).toString(16).padStart(2, "0")}`);
        grad.addColorStop(1, `${color}00`);
        ctx.globalAlpha = 1;
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, ey, 2 + ft * 9, 0, Math.PI * 2);
        ctx.fill();
      }

      // 4 short cross rays
      if (t < 0.35) {
        const st = t / 0.35;
        ctx.globalAlpha = 1 - st;
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.2;
        ctx.lineCap = "round";
        for (let s = 0; s < 4; s += 1) {
          const angle = (s * Math.PI) / 2 + ((effect.seed % 31) / 31) * 0.5;
          const r1 = 2 + st * 1.5;
          const r2 = 5 + st * 7;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(angle) * r1, ey + Math.sin(angle) * r1);
          ctx.lineTo(cx + Math.cos(angle) * r2, ey + Math.sin(angle) * r2);
          ctx.stroke();
        }
      }

      ctx.globalAlpha = 1;
    } else if (effect.kind === "crystalComplete") {
      // Three crystals fill up sequentially above the player
      const recipe = effect.recipe;
      const count = Math.min(recipe.length, 3);
      const spacing = 18;
      const totalW = (count - 1) * spacing;
      const baseX = cx - totalW * 0.5;
      // Float upward as animation progresses
      const lift = progress * 22;
      const baseY = cy - 24 - lift;
      const CR = 7; // crystal hexagon radius

      for (let i = 0; i < count; i += 1) {
        const crystalType = recipe[i];
        const crystal = CRYSTAL_TYPES[crystalType];
        if (!crystal) continue;

        // Each crystal fills during its 1/count window, staggered by 0.18s
        const fillStart = i * (0.28);
        const fillEnd = fillStart + 0.42;
        const fillT = Math.max(0, Math.min(1, (progress - fillStart) / (fillEnd - fillStart)));

        const px = baseX + i * spacing;
        const py = baseY;

        // Draw hexagon path helper
        const hexPath = () => {
          ctx.beginPath();
          for (let k = 0; k < 6; k += 1) {
            const a = (k * Math.PI) / 3 - Math.PI / 6;
            const hx = px + Math.cos(a) * CR;
            const hy = py + Math.sin(a) * CR;
            if (k === 0) ctx.moveTo(hx, hy); else ctx.lineTo(hx, hy);
          }
          ctx.closePath();
        };

        // Overall alpha — fade out near end
        const alpha = progress > 0.82 ? Math.max(0, 1 - (progress - 0.82) / 0.18) : 1;

        // Background (dark outline)
        ctx.globalAlpha = alpha * 0.7;
        ctx.strokeStyle = "rgba(0,0,0,0.55)";
        ctx.lineWidth = 3.5;
        hexPath();
        ctx.stroke();

        // Empty shell
        ctx.globalAlpha = alpha * 0.25;
        ctx.fillStyle = crystal.color;
        hexPath();
        ctx.fill();

        // Filled portion — clip vertically from bottom
        if (fillT > 0) {
          ctx.save();
          hexPath();
          ctx.clip();
          const fillH = CR * 2 * fillT;
          const fillY = py + CR - fillH;
          ctx.globalAlpha = alpha;
          ctx.fillStyle = crystal.color;
          ctx.fillRect(px - CR - 1, fillY, CR * 2 + 2, fillH + 1);
          ctx.restore();
        }

        // Outline
        ctx.globalAlpha = alpha * (0.5 + fillT * 0.5);
        ctx.strokeStyle = crystal.color;
        ctx.lineWidth = 1.5;
        hexPath();
        ctx.stroke();

        // Glow burst when crystal just completed filling
        if (fillT >= 1) {
          const burstAge = progress - fillEnd;
          const burstT = Math.min(1, burstAge / 0.22);
          if (burstT < 1) {
            ctx.globalAlpha = alpha * (1 - burstT) * 0.7;
            const grad = ctx.createRadialGradient(px, py, 0, px, py, CR + burstT * 14);
            grad.addColorStop(0, crystal.color);
            grad.addColorStop(1, "transparent");
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(px, py, CR + burstT * 14, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      ctx.globalAlpha = 1;
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
    ctx.fillStyle = particle.isGoldBonus ? "#ffe060" : particle.isGold ? "#c8920a" : "#7ee3ff";
    ctx.beginPath();
    ctx.arc(px, py, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = particle.isGoldBonus ? "#fff7c0" : particle.isGold ? "#ffe060" : "#dbfbff";
    ctx.beginPath();
    ctx.arc(px, py, size * 0.45, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function renderDrillSmokeParticles(camera) {
  if (state.drillSmokeParticles.length === 0) return;
  const ctx = state.ctx;
  ctx.save();
  for (let i = 0; i < state.drillSmokeParticles.length; i += 1) {
    const p = state.drillSmokeParticles[i];
    const lifeT = Math.max(0, Math.min(1, p.life / p.maxLife));
    const alpha = lifeT * 0.3;
    const radius = p.size * (1 + (1 - lifeT) * 0.8);
    const x = p.x - camera.x;
    const y = p.y - camera.y;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "#bcb6ad";
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
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
  gradient.addColorStop(0, "#1a1613");
  gradient.addColorStop(0.45, "#100d0b");
  gradient.addColorStop(1, "#050403");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, state.width, state.height);

  ctx.fillStyle = "rgba(255, 236, 204, 0.02)";
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

      if (!state.tunnelMask[index] && state.beaconWireBreaks.length > 0) {
        for (const pending of state.beaconWireBreaks) {
          if (pending.index !== index) continue;
          if (pending.startDelay > 0) break;
          const progress = 1 - clamp(pending.delay / (BEACON_WIRE_BREAK_TELEGRAPH_MS / 1000), 0, 1);
          const intensity = 0.12 + progress * progress * 0.95;
          const t = state.lastTs * 0.05 + x * 19 + y * 23;
          sx += Math.sin(t) * intensity;
          sy += Math.cos(t * 1.3) * intensity;
          break;
        }
      }

      if (visibleAlpha <= 0.001) {
        ctx.globalAlpha = 0.16;
        if (state.tunnelMask[index] || state.beaconMask[index] === 1) {
          drawTileSprite(state.sprites.tunnel, sx, sy);
        } else if (state.beaconMask[index] === 3) {
          const hiddenBeaconCoverTier = clamp(Math.round(state.hardness[index] || 1), 1, BLOCK_TYPES.length - 1);
          drawTileSprite(state.sprites.blocks[hiddenBeaconCoverTier]?.[(x * 7 + y * 13) % BLOCK_VARIANTS], sx, sy);
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
        } else if (state.beaconMask[index] === 3) {
          const hiddenBeaconCoverTier = clamp(Math.round(state.hardness[index] || 1), 1, BLOCK_TYPES.length - 1);
          drawTileSprite(state.sprites.blocks[hiddenBeaconCoverTier]?.[(x * 7 + y * 13) % BLOCK_VARIANTS], sx, sy);
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
          const jSeedX = (index * 1234567) >>> 0;
          const jSeedY = (index * 7654321) >>> 0;
          const jx = (((jSeedX & 0xff) / 255) * 2 - 1) * TILE_SIZE * 0.25;
          const jy = (((jSeedY & 0xff) / 255) * 2 - 1) * TILE_SIZE * 0.25;
          const cx = sx + TILE_SIZE * 0.5 + jx;
          const cy = sy + TILE_SIZE * 0.5 + jy;
          const pulse = Math.sin((state.lastTs || 0) * 0.006 + x * 0.8 + y * 1.2) * 0.5 + 0.5;
          const amount = state.xpPickupMask[index];
          ctx.save();
          ctx.globalAlpha = visibleAlpha * (0.72 + pulse * 0.24);
          ctx.fillStyle = "#78d8ff";
          ctx.beginPath();
          ctx.arc(cx, cy, 3.2 + pulse * 0.55, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#bff4ff";
          ctx.beginPath();
          ctx.moveTo(cx, cy - 4.4);
          ctx.lineTo(cx + 4.4, cy);
          ctx.lineTo(cx, cy + 4.4);
          ctx.lineTo(cx - 4.4, cy);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
          ctx.globalAlpha = visibleAlpha;
        }
        if (state.xpBonusPickupMask[index] > 0) {
          const jSeedX = (index * 4567891) >>> 0;
          const jSeedY = (index * 1987654) >>> 0;
          const jx = (((jSeedX & 0xff) / 255) * 2 - 1) * TILE_SIZE * 0.25;
          const jy = (((jSeedY & 0xff) / 255) * 2 - 1) * TILE_SIZE * 0.25;
          const cx = sx + TILE_SIZE * 0.5 + jx;
          const cy = sy + TILE_SIZE * 0.5 + jy;
          const pulse = Math.sin((state.lastTs || 0) * 0.007 + x * 1.1 + y * 0.9) * 0.5 + 0.5;
          ctx.save();
          ctx.globalAlpha = visibleAlpha * (0.72 + pulse * 0.24);
          ctx.fillStyle = "#78d8ff";
          ctx.beginPath();
          ctx.arc(cx, cy, 3.2 + pulse * 0.55, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#bff4ff";
          ctx.beginPath();
          ctx.moveTo(cx, cy - 4.4);
          ctx.lineTo(cx + 4.4, cy);
          ctx.lineTo(cx, cy + 4.4);
          ctx.lineTo(cx - 4.4, cy);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
          ctx.globalAlpha = visibleAlpha;
        }
        if (state.goldPickupMask[index] > 0) {
          const jSeedX = (index * 2345678) >>> 0;
          const jSeedY = (index * 8765432) >>> 0;
          const jx = (((jSeedX & 0xff) / 255) * 2 - 1) * TILE_SIZE * 0.25;
          const jy = (((jSeedY & 0xff) / 255) * 2 - 1) * TILE_SIZE * 0.25;
          const cx = sx + TILE_SIZE * 0.5 + jx;
          const cy = sy + TILE_SIZE * 0.5 + jy;
          const pulse = Math.sin((state.lastTs || 0) * 0.006 + x * 1.3 + y * 0.7) * 0.5 + 0.5;
          const amount = Math.round(state.goldPickupMask[index]);
          ctx.save();
          ctx.globalAlpha = visibleAlpha * (0.72 + pulse * 0.24);
          ctx.fillStyle = "#c8920a";
          ctx.beginPath();
          ctx.arc(cx, cy, 3.2 + pulse * 0.55, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#ffe060";
          ctx.beginPath();
          ctx.arc(cx, cy, 1.6 + pulse * 0.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          ctx.globalAlpha = visibleAlpha;
        }
        if (state.goldBonusPickupMask[index] > 0) {
          const jSeedX = (index * 3456789) >>> 0;
          const jSeedY = (index * 9876543) >>> 0;
          const jx = (((jSeedX & 0xff) / 255) * 2 - 1) * TILE_SIZE * 0.25;
          const jy = (((jSeedY & 0xff) / 255) * 2 - 1) * TILE_SIZE * 0.25;
          const cx = sx + TILE_SIZE * 0.5 + jx;
          const cy = sy + TILE_SIZE * 0.5 + jy;
          const pulse = Math.sin((state.lastTs || 0) * 0.008 + x * 0.9 + y * 1.4) * 0.5 + 0.5;
          const amount = Math.round(state.goldBonusPickupMask[index]);
          ctx.save();
          ctx.globalAlpha = visibleAlpha * (0.78 + pulse * 0.22);
          ctx.fillStyle = "#ffe060";
          ctx.beginPath();
          ctx.arc(cx, cy, 3.2 + pulse * 0.55, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#fff7c0";
          ctx.beginPath();
          ctx.arc(cx, cy, 1.6 + pulse * 0.3, 0, Math.PI * 2);
          ctx.fill();
          // small star marker
          ctx.fillStyle = "#c86400";
          ctx.font = `600 5px ${HUD_FONT}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("★", cx + 3.5, cy - 3.5);
          ctx.restore();
          ctx.globalAlpha = visibleAlpha;
        }
      } else if (state.beaconMask[index] === 1) {
        drawTileSprite(state.sprites.tunnel, sx, sy);
      } else if (state.beaconMask[index] === 3) {
        const hiddenBeaconCoverTier = clamp(Math.round(state.hardness[index] || 1), 1, BLOCK_TYPES.length - 1);
        drawTileSprite(state.sprites.blocks[hiddenBeaconCoverTier]?.[(x * 7 + y * 13) % BLOCK_VARIANTS], sx, sy);
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
        if (state.microResourceRevealedMask[index] && state.microResourceMask[index] > 0) {
          const mType = state.microResourceMask[index];
          const pulse = Math.sin((state.lastTs || 0) * 0.005 + x * 1.1 + y * 0.9) * 0.5 + 0.5;
          const jSeed = (index * 2654435761) >>> 0;
          const jx = (((jSeed & 0xff) / 255) * 2 - 1) * TILE_SIZE * 0.1;
          const jy = ((((jSeed >> 8) & 0xff) / 255) * 2 - 1) * TILE_SIZE * 0.1;
          const cx2 = sx + TILE_SIZE / 2 + jx;
          const cy2 = sy + TILE_SIZE / 2 + jy;
          ctx.save();
          ctx.globalAlpha = visibleAlpha * (0.7 + pulse * 0.25);
          if (mType === 1) {
            // gold — small yellow circle
            ctx.fillStyle = "#f5c842";
            ctx.beginPath();
            ctx.arc(cx2, cy2, 3.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#fff7c0";
            ctx.beginPath();
            ctx.arc(cx2 - 0.8, cy2 - 0.8, 1.2, 0, Math.PI * 2);
            ctx.fill();
          } else if (mType === 2) {
            // fuel — small black drop
            ctx.fillStyle = "#1a1a1a";
            ctx.beginPath();
            ctx.arc(cx2, cy2 + 1, 2.8, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#444444";
            ctx.beginPath();
            ctx.moveTo(cx2, cy2 - 3.2);
            ctx.lineTo(cx2 + 2, cy2 + 0.5);
            ctx.lineTo(cx2 - 2, cy2 + 0.5);
            ctx.closePath();
            ctx.fill();
          } else if (mType === 3) {
            // xp — small cyan diamond
            ctx.fillStyle = "#78d8ff";
            ctx.beginPath();
            ctx.moveTo(cx2, cy2 - 3.5);
            ctx.lineTo(cx2 + 3.5, cy2);
            ctx.lineTo(cx2, cy2 + 3.5);
            ctx.lineTo(cx2 - 3.5, cy2);
            ctx.closePath();
            ctx.fill();
          }
          ctx.restore();
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
          if (hazardType === HAZARD_TYPES.SPIKE && state.hazardTriggeredMask[index]) {
            ctx.save();
            ctx.globalAlpha *= 0.28;
            drawTileSprite(state.sprites.hazards[hazardType], sx, sy);
            ctx.restore();
          } else {
            drawTileSprite(state.sprites.hazards[hazardType], sx, sy);
            if (hazardType === HAZARD_TYPES.VOLATILE) {
              const pulse = Math.sin((state.lastTs || 0) * 0.012 + x * 0.85 + y * 1.11) * 0.5 + 0.5;
              const cx = sx + TILE_SIZE * 0.5;
              const cy = sy + TILE_SIZE * 0.5;
              const warnAlpha = 0.22 + pulse * 0.22;
              const ringRadius = 8 + pulse * 2.4;
              const halo = ctx.createRadialGradient(cx, cy, 2, cx, cy, ringRadius + 5);
              halo.addColorStop(0, `rgba(255, 88, 56, ${0.28 + pulse * 0.22})`);
              halo.addColorStop(1, "rgba(255, 88, 56, 0)");
              ctx.save();
              ctx.globalAlpha = visibleAlpha;
              ctx.fillStyle = halo;
              ctx.beginPath();
              ctx.arc(cx, cy, ringRadius + 5, 0, Math.PI * 2);
              ctx.fill();
              ctx.strokeStyle = `rgba(255, 214, 132, ${warnAlpha})`;
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
              ctx.stroke();
              ctx.fillStyle = `rgba(255, 238, 182, ${0.58 + pulse * 0.28})`;
              ctx.beginPath();
              ctx.arc(cx, cy, 2.1 + pulse * 0.8, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            }
          }
        }
      }

      if (!state.tunnelMask[index] && !state.metalMask[index] && state.health[index] < BLOCK_TYPES[state.hardness[index]].hp) {
        const ratio = clamp(state.health[index] / BLOCK_TYPES[state.hardness[index]].hp, 0, 1);
        const now = state.lastTs || 0;
        const elapsedSinceHit = now - (state.blockHpBarLastHitTs[index] || 0);
        const isBarHighlighted = elapsedSinceHit <= BLOCK_HP_BAR_HIGHLIGHT_MS;
        const crackStage = clamp(Math.ceil((1 - ratio) * 3), 0, 3);
        const crackVisible = state.visibleMask[index] === 1;
        if (crackStage > 0 && crackVisible) {
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
        const barX = sx + 6;
        const barY = sy + TILE_SIZE - 9;
        const barW = TILE_SIZE - 12;
        const barH = 4;
        ctx.fillStyle = isBarHighlighted ? "rgba(18, 11, 8, 0.7)" : "rgba(18, 11, 8, 0.35)";
        ctx.fillRect(barX, barY, barW, barH);
        ctx.strokeStyle = isBarHighlighted ? "rgba(255, 236, 206, 0.45)" : "rgba(255, 236, 206, 0.2)";
        ctx.lineWidth = 1;
        ctx.strokeRect(barX - 0.5, barY - 0.5, barW + 1, barH + 1);
        ctx.fillStyle = isBarHighlighted ? "rgba(255, 238, 210, 0.78)" : "rgba(255, 238, 210, 0.38)";
        ctx.fillRect(barX, barY, barW * ratio, barH);
      }

      if (state.weakSpotMask[index]) {
        const spawnTs = state.weakSpotMask[index];
        const now = state.lastTs || 0;
        const age = now - spawnTs;
        const APPEAR_MS = 180;
        const appearT = Math.max(0, Math.min(1, age / APPEAR_MS));
        const appearEase = 1 - Math.pow(1 - appearT, 3);

        const pulse = Math.sin(now * 0.007) * 0.5 + 0.5;
        const wcx = sx + TILE_SIZE * 0.5;
        const wcy = sy + TILE_SIZE * 0.5;

        // Shockwave ring on spawn
        if (appearT < 1) {
          const ringR = 6 + (1 - appearEase) * 10;
          ctx.globalAlpha = visibleAlpha * (1 - appearT) * 0.6;
          ctx.strokeStyle = "#ffe066";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(wcx, wcy, ringR, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Glow halo
        const glowR = (10 + pulse * 3) * appearEase;
        ctx.globalAlpha = visibleAlpha * 0.18 * appearEase;
        ctx.fillStyle = "#ffd700";
        ctx.beginPath();
        ctx.arc(wcx, wcy, glowR, 0, Math.PI * 2);
        ctx.fill();

        // Diamond shape (rotated square)
        const ds = (5 + pulse * 1.5) * appearEase;
        ctx.globalAlpha = visibleAlpha * (0.7 + pulse * 0.3) * appearEase;
        ctx.strokeStyle = "#ffe566";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(wcx,      wcy - ds);
        ctx.lineTo(wcx + ds, wcy);
        ctx.lineTo(wcx,      wcy + ds);
        ctx.lineTo(wcx - ds, wcy);
        ctx.closePath();
        ctx.stroke();

        // Inner bright core
        const cr = (2.2 + pulse * 0.8) * appearEase;
        ctx.globalAlpha = visibleAlpha * appearEase;
        ctx.fillStyle = "#fff4a0";
        ctx.beginPath();
        ctx.arc(wcx, wcy, cr, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 1;
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

  renderHiddenBeaconReveal(camera);
  renderBeaconWires(camera, startX, endX, startY, endY);

  // Blueprint, key & worm nest overlay pass — drawn after all tiles so waves aren't clipped
  for (let y = startY; y < endY; y += 1) {
    for (let x = startX; x < endX; x += 1) {
      const idx = cellIndex(x, y);
      const hasBlueprint = state.blueprintMask[idx] > 0;
      const hasKey = state.keyMask[idx] > 0;
      let isNest = false;
      for (const n of state.wormNests) {
        if (!n.destroyed && n.x === x && n.y === y) { isNest = true; break; }
      }
      if (!hasBlueprint && !hasKey && !isNest) continue;
      const alpha = state.visibleAlpha[idx];
      if (alpha < 0.01) continue;
      const sx = x * TILE_SIZE - camera.x;
      const sy = y * TILE_SIZE - camera.y;
      if (alpha < 0.999) ctx.globalAlpha = alpha;
      if (hasBlueprint) renderArtifactTile(x, y, sx, sy);
      if (hasKey) renderKeyTile(x, y, sx, sy);
      if (isNest) renderWormNestTile(x, y, sx, sy);
      if (alpha < 0.999) ctx.globalAlpha = 1;
    }
  }

  renderPath(camera);
  renderMovingTiles(camera);
  renderSteamJets(camera);
  renderEffects(camera);
  renderDrillSmokeParticles(camera);
  renderBeacon(camera);
  renderGoldParticles(camera);
  renderExperienceParticles(camera);
  renderDepositArrivals(camera);
  renderBase(camera);
  renderBoulders(camera);
  renderWorms(camera);
  renderContourEnemy(camera);
  renderDrill(camera);
  if (state.cutsceneModeActive) {
    renderCutsceneWorldOverlay(camera);
  }
  renderWormTelegraph(camera);
  renderCollapseWarnings(camera);
  renderBaseProximityDot(camera);
  renderActiveToast(camera);
  if (!state.debugMapActive) {
    renderSignalStatus(camera);
    renderBeaconRadar(camera);
    renderPickupRadar(camera);
    renderContourBlastPressureStatus(camera);
    renderLoopPressureStatus(camera);
    renderOverdriveStatus(camera);
    renderStunStatus(camera);
    renderHeatWarningStatus(camera);
    renderLowFuelStatus(camera);
    renderVisionMask(camera);
  }
  ctx.restore();
  if (!state.debugMapActive) renderHud();
  if (state.menuOpen) {
    state.syncMenuSummary?.();
  }
  renderDepthTitle();

  if (state.damageFlash > 0) {
    ctx.fillStyle = `rgba(255, 64, 64, ${0.16 * state.damageFlash})`;
    ctx.fillRect(0, 0, state.width, state.height);
  }
  if (state.levelUpFlash > 0) {
    ctx.fillStyle = `rgba(80, 210, 255, ${0.10 * state.levelUpFlash})`;
    ctx.fillRect(0, 0, state.width, state.height);
  }

  if (state.cutsceneModeActive) {
    renderCutsceneScreenFx(camera);
  }

  if (state.baseFound && !state.cutsceneModeActive) {
    showBaseFoundOverlay(true, state.baseFoundRunTimeSec || state.runTimeSec);
  } else if (state.dead && !state.cutsceneModeActive) {
    showDeadOverlay(true);
  } else {
    showBaseFoundOverlay(false);
  }

  if (state.cutsceneModeActive) {
    renderCutsceneDialogBubbles(camera, zoom);
    renderCutsceneFindHerOverlay();
  }
}

function renderBoulders(camera) {
  const ctx = state.ctx;
  const time = (state.lastTs || 0) * 0.02;
  ctx.save();
  for (let i = 0; i < state.boulders.length; i += 1) {
    const boulder = state.boulders[i];

    // Interpolate position
    const animT = boulder.animTimer > 0 ? 1 - boulder.animTimer / BOULDER_MOVE_INTERVAL : 1;
    const eased = easeOutCubic(animT);
    let rx = (boulder.prevX + (boulder.x - boulder.prevX) * eased) * TILE_SIZE - camera.x + TILE_SIZE * 0.5;
    let ry = (boulder.prevY + (boulder.y - boulder.prevY) * eased) * TILE_SIZE - camera.y + TILE_SIZE * 0.54;

    if (boulder.delay > 0) {
      const telegraphPulse = Math.sin(time + i * 0.7) * 0.5 + 0.5;
      const shakeX = (Math.sin(time * 7 + i * 1.9) * 0.5) * telegraphPulse;
      const shakeY = (Math.cos(time * 8 + i * 1.3) * 0.5) * telegraphPulse;
      rx += shakeX;
      ry += shakeY;

      const path = [{ x: boulder.x, y: boulder.y }];
      const occupiedByOtherBoulders = new Set();
      for (let j = 0; j < state.boulders.length; j += 1) {
        if (j === i) continue;
        occupiedByOtherBoulders.add(`${state.boulders[j].x},${state.boulders[j].y}`);
      }
      let simX = boulder.x;
      let simY = boulder.y;
      let simBrokenBlocks = boulder.brokenBlocks || 0;
      const maxSteps = GRID_W + GRID_H;
      for (let step = 0; step < maxSteps; step += 1) {
        const nextX = simX + boulder.dirX;
        const nextY = simY + boulder.dirY;
        if (nextX < 1 || nextY < 1 || nextX >= GRID_W - 1 || nextY >= GRID_H - 1) break;

        const nextIndex = cellIndex(nextX, nextY);
        if (occupiedByOtherBoulders.has(`${nextX},${nextY}`) || state.boulderPocketMask[nextIndex] || state.metalMask[nextIndex]) break;

        path.push({ x: nextX, y: nextY });
        simX = nextX;
        simY = nextY;

        if (!state.tunnelMask[nextIndex]) {
          simBrokenBlocks += 1;
          if (simBrokenBlocks >= BOULDER_BREAK_LIMIT) break;
        }
      }

      const alpha = 0.28 + telegraphPulse * 0.36;
      ctx.save();
      ctx.strokeStyle = `rgba(255, 140, 140, ${alpha})`;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      for (let p = 0; p < path.length; p += 1) {
        const px = path[p].x * TILE_SIZE - camera.x + TILE_SIZE * 0.5;
        const py = path[p].y * TILE_SIZE - camera.y + TILE_SIZE * 0.5;
        if (p === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

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
  const hasContourOverloadDrill = getEquipmentTiers("contour_overload_drill").length > 0;
  const contourMaxForOverload = Math.max(9, Math.round(state.maxContour || 0));
  const contourAtMaxLength = hasContourOverloadDrill && state.pathTiles.length >= contourMaxForOverload;
  const contourResonanceActive = (state.contourResonanceFlashTimer || 0) > 0;
  const pathOuterColor = contourAtMaxLength ? "rgba(155, 30, 30, 0.82)" : "rgba(108, 62, 31, 0.65)";
  const pathInnerColor = contourAtMaxLength ? "rgba(255, 120, 120, 0.72)" : "rgba(219, 171, 99, 0.52)";
  const activeOuterColor = contourResonanceActive ? "rgba(189, 42, 42, 0.88)" : pathOuterColor;
  const activeInnerColor = contourResonanceActive ? "rgba(255, 146, 146, 0.82)" : pathInnerColor;
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

  // Ghost tail: the ejected tile fading out
  const ghost = state.pathTailGhost;
  const tailFade = state.pathTailFade;
  if (ghost && tailFade > 0 && renderPathLength >= 1) {
    const t1 = state.pathTiles[0];
    const p0x = ghost.x * TILE_SIZE + TILE_SIZE * 0.5 - camera.x;
    const p0y = ghost.y * TILE_SIZE + TILE_SIZE * 0.5 - camera.y;
    const p1x = t1.x * TILE_SIZE + TILE_SIZE * 0.5 - camera.x;
    const p1y = t1.y * TILE_SIZE + TILE_SIZE * 0.5 - camera.y;
    ctx.strokeStyle = `rgba(108, 62, 31, ${0.65 * tailFade})`;
    ctx.beginPath();
    ctx.moveTo(p0x, p0y);
    ctx.lineTo(p1x, p1y);
    ctx.stroke();
    ctx.lineWidth = 3;
    ctx.strokeStyle = `rgba(219, 171, 99, ${0.52 * tailFade})`;
    ctx.stroke();
    ctx.lineWidth = 8;
  }

  // Main path
  ctx.strokeStyle = activeOuterColor;
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
  ctx.strokeStyle = activeInnerColor;
  ctx.stroke();

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
    const _previewDistance = preview.distance ?? null;
    if (_previewDistance === null) return;
    const _previewTotalDelay = Math.max(IDLE_AUTO_CLOSE_MIN_DELAY, _previewDistance * AUTO_CLOSE_SEC_PER_BLOCK / (1 + state.speedOfAutoClose / 100));
    const duration = Math.max(0.01, _previewTotalDelay - IDLE_AUTO_CLOSE_PREVIEW_DELAY);
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
  if (elapsed < BEACON_ACTIVATION_MS + 500) return; // animation + short pause
  // Animation done — execute pending action
  state.beaconActivationAnim = null;
  const pa = anim.pendingAction;
  if (pa.type === "blueprintChoice") {
    state.blueprintChoiceRemaining = pa.remaining;
    state.blueprintChoicePendingBeacon = pa.beacon;
    openNextArtifactChoice();
  } else {
    state.shopModalOpen = true;
    syncTouchZonesInteractivity();
    playSound("shop_open");
    openShop(state.gold, pa.depthLevel ?? state.currentDepthLevel, state.luck, getShopStatsSnapshot(), getShopDefaultStatsSnapshot());
  }
}

function forEachBeaconWireCoveredCell(beacon, visit) {
  const beaconIndex = state.beacons.indexOf(beacon);
  if (beaconIndex < 0) return;
  const wireHitRadiusTiles = 0.38;

  for (const wire of state.beaconWires) {
    if (wire.beaconIndex !== beaconIndex) continue;
    const pts = wire.points;
    if (pts.length === 0) continue;

    let segStartX = beacon.x + 1;
    let segStartY = beacon.y + 1;
    let prevSampleX = segStartX;
    let prevSampleY = segStartY;
    let traveledTiles = 0;

    for (let i = 0; i < pts.length; i++) {
      const cur = pts[i];
      const next = i + 1 < pts.length ? pts[i + 1] : null;
      const segEndX = next ? (cur.x + next.x) / 2 : cur.x;
      const segEndY = next ? (cur.y + next.y) / 2 : cur.y;
      const segLengthTiles = Math.hypot(segEndX - segStartX, segEndY - segStartY);
      const subdivisions = Math.max(4, Math.ceil(segLengthTiles * 6));

      for (let step = 1; step <= subdivisions; step++) {
        const t = step / subdivisions;
        const invT = 1 - t;
        const sampleX = invT * invT * segStartX + 2 * invT * t * cur.x + t * t * segEndX;
        const sampleY = invT * invT * segStartY + 2 * invT * t * cur.y + t * t * segEndY;
        const linkDist = Math.hypot(sampleX - prevSampleX, sampleY - prevSampleY);
        const linkSamples = Math.max(1, Math.ceil(linkDist * 3));

        for (let linkStep = 1; linkStep <= linkSamples; linkStep++) {
          const lt = linkStep / linkSamples;
          const worldX = prevSampleX + (sampleX - prevSampleX) * lt;
          const worldY = prevSampleY + (sampleY - prevSampleY) * lt;
          const distAlong = traveledTiles + linkDist * lt;
          const startDelay = distAlong * (BEACON_WIRE_BREAK_WAVE_DELAY_MS / 1000);
          const minX = Math.floor(worldX);
          const maxX = Math.ceil(worldX);
          const minY = Math.floor(worldY);
          const maxY = Math.ceil(worldY);
          for (let ty = minY; ty <= maxY; ty += 1) {
            for (let tx = minX; tx <= maxX; tx += 1) {
              if (tx < 0 || ty < 0 || tx >= GRID_W || ty >= GRID_H) continue;
              const dx = (tx + 0.5) - worldX;
              const dy = (ty + 0.5) - worldY;
              if (Math.hypot(dx, dy) > wireHitRadiusTiles) continue;
              if (visit(tx, ty, startDelay) === false) return;
            }
          }
        }

        traveledTiles += linkDist;
        prevSampleX = sampleX;
        prevSampleY = sampleY;
      }

      segStartX = segEndX;
      segStartY = segEndY;
    }
  }
}

function areBeaconWiresFreed(beacon) {
  if (!Array.isArray(beacon.wireTrackedCells) || beacon.wireTrackedCells.length === 0) {
    return beacon.wireDamageTriggered === true;
  }
  for (const index of beacon.wireTrackedCells) {
    if (state.hardness[index] > 0) {
      return false;
    }
  }
  return true;
}

function activateBeaconWires(beacon) {
  const seen = new Set();
  const tracked = new Set();
  forEachBeaconWireCoveredCell(beacon, (x, y, startDelay) => {
    const index = cellIndex(x, y);
    if (seen.has(index)) return;
    seen.add(index);
    if (state.hardness[index] > 0 && !state.metalMask[index] && !state.beaconMask[index] && state.safeDoorMask[index] <= 0) {
      tracked.add(index);
    }
    scheduleBeaconWireBreak(x, y, startDelay);
  });
  beacon.wireTrackedCells = [...tracked];
}

function renderBeaconWires(camera, startX, endX, startY, endY) {
  if (state.beaconWires.length === 0) return;
  const ctx = state.ctx;
  const lerp = (a, b, t) => a + (b - a) * t;
  const mixRgba = (from, to, t) => `rgba(${lerp(from[0], to[0], t)}, ${lerp(from[1], to[1], t)}, ${lerp(from[2], to[2], t)}, ${lerp(from[3], to[3], t)})`;
  const getWireColors = (beacon) => {
    const inactiveOuter = [60, 42, 22, 0.32];
    const inactiveCore = [219, 171, 99, 0.28];
    const calmOuter = [50, 110, 170, 0.40];
    const calmCore = [120, 190, 230, 0.65];
    const flareOuter = [105, 220, 255, 0.82];
    const flareCore = [215, 247, 255, 0.96];
    let outerColor = mixRgba(inactiveOuter, inactiveOuter, 0);
    let coreColor = mixRgba(inactiveCore, inactiveCore, 0);
    if (beacon.active && beacon.wireActivationStart) {
      const elapsed = (state.lastTs || 0) - beacon.wireActivationStart;
      if (elapsed < BEACON_WIRE_FLARE_MS) {
        const flareT = clamp(elapsed / BEACON_WIRE_FLARE_MS, 0, 1);
        const flareEase = 1 - Math.pow(1 - flareT, 3);
        outerColor = mixRgba(inactiveOuter, flareOuter, flareEase);
        coreColor = mixRgba(inactiveCore, flareCore, flareEase);
      } else {
        const recoverT = clamp((elapsed - BEACON_WIRE_FLARE_MS) / BEACON_WIRE_RECOVER_MS, 0, 1);
        const recoverEase = recoverT * recoverT * (3 - 2 * recoverT);
        outerColor = mixRgba(flareOuter, calmOuter, recoverEase);
        coreColor = mixRgba(flareCore, calmCore, recoverEase);
      }
    } else if (beacon.active) {
      outerColor = mixRgba(inactiveOuter, inactiveOuter, 0);
      coreColor = mixRgba(inactiveCore, inactiveCore, 0);
    }
    return { outerColor, coreColor };
  };
  const getWireVisibility = (beacon) => {
    if (!beacon.rewardClaimed || beacon.rewardRevealStart <= 0) {
      return 1;
    }
    const elapsed = (state.lastTs || 0) - beacon.rewardRevealStart;
    const hideT = clamp(elapsed / FULL_FREEDOM_WIRE_HIDE_MS, 0, 1);
    return 1 - hideT * hideT * (3 - 2 * hideT);
  };
  const wireIntersectsViewport = (beacon, pts) => {
    let minX = beacon.x + 1;
    let maxX = beacon.x + 1;
    let minY = beacon.y + 1;
    let maxY = beacon.y + 1;
    for (let i = 0; i < pts.length; i += 1) {
      minX = Math.min(minX, pts[i].x);
      maxX = Math.max(maxX, pts[i].x);
      minY = Math.min(minY, pts[i].y);
      maxY = Math.max(maxY, pts[i].y);
    }
    return !(maxX < startX - 1 || minX > endX + 1 || maxY < startY - 1 || minY > endY + 1);
  };
  const traceWirePath = (beacon, pts) => {
    const startPx = (beacon.x + 1) * TILE_SIZE - camera.x;
    const startPy = (beacon.y + 1) * TILE_SIZE - camera.y;
    ctx.beginPath();
    ctx.moveTo(startPx, startPy);
    for (let i = 0; i < pts.length; i += 1) {
      const cur = pts[i];
      const next = i + 1 < pts.length ? pts[i + 1] : null;
      const controlX = cur.x * TILE_SIZE - camera.x;
      const controlY = cur.y * TILE_SIZE - camera.y;
      const endX = next ? ((cur.x + next.x) * 0.5) * TILE_SIZE - camera.x : controlX;
      const endY = next ? ((cur.y + next.y) * 0.5) * TILE_SIZE - camera.y : controlY;
      ctx.quadraticCurveTo(controlX, controlY, endX, endY);
    }
  };
  if (state.debugMapActive) {
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (const wire of state.beaconWires) {
      const beacon = state.beacons[wire.beaconIndex];
      if (!beacon) continue;
      const pts = wire.points;
      if (pts.length === 0 || !wireIntersectsViewport(beacon, pts)) continue;
      const { outerColor, coreColor } = getWireColors(beacon);
      const wireAlpha = getWireVisibility(beacon);
      if (wireAlpha <= 0.01) continue;
      ctx.globalAlpha = wireAlpha;
      ctx.strokeStyle = outerColor;
      ctx.lineWidth = 6;
      traceWirePath(beacon, pts);
      ctx.stroke();
      ctx.strokeStyle = coreColor;
      ctx.lineWidth = 2;
      traceWirePath(beacon, pts);
      ctx.stroke();
    }
    ctx.restore();
    return;
  }
  const sampleVisibilityAlpha = (worldX, worldY) => {
    const baseX = Math.floor(worldX);
    const baseY = Math.floor(worldY);
    const fracX = worldX - baseX;
    const fracY = worldY - baseY;
    let total = 0;

    for (let oy = 0; oy <= 1; oy += 1) {
      const ty = clamp(baseY + oy, 0, GRID_H - 1);
      const wy = oy === 0 ? 1 - fracY : fracY;
      for (let ox = 0; ox <= 1; ox += 1) {
        const tx = clamp(baseX + ox, 0, GRID_W - 1);
        const wx = ox === 0 ? 1 - fracX : fracX;
        total += state.visibleAlpha[cellIndex(tx, ty)] * wx * wy;
      }
    }

    return clamp(total, 0, 1);
  };

  // Build clip from visible tunnel tiles so wires can't bleed over blocks
  ctx.save();
  ctx.beginPath();
  for (let ty = startY; ty < endY; ty++) {
    for (let tx = startX; tx < endX; tx++) {
      const idx = cellIndex(tx, ty);
      if (state.hardness[idx] === 0 && state.visibleAlpha[idx] > 0.001) {
        ctx.rect(tx * TILE_SIZE - camera.x, ty * TILE_SIZE - camera.y, TILE_SIZE, TILE_SIZE);
      }
    }
  }
  ctx.clip();
  ctx.lineCap = "butt";
  ctx.lineJoin = "round";

  const tailFadeTiles = 3;

  for (const wire of state.beaconWires) {
    const beacon = state.beacons[wire.beaconIndex];
    if (!beacon) continue;
    const pts = wire.points;
    if (pts.length === 0) continue;
    const { x: bx, y: by } = beacon;
    const { outerColor, coreColor } = getWireColors(beacon);
    const wireVisibility = getWireVisibility(beacon);
    if (wireVisibility <= 0.01) continue;

    const sPx = (bx + 1) * TILE_SIZE - camera.x;
    const sPy = (by + 1) * TILE_SIZE - camera.y;
    const n = pts.length;
    const hiddenStartTiles = 0;
    const revealTiles = 5;

    // Pre-compute segment midpoints for clean bezier chaining
    // segs[i] = { ax, ay (start), cpx, cpy (control), ex, ey (end), alpha, startDistance, endDistance }
    const segs = [];
    let prevX = sPx, prevY = sPy;
    let prevWorldX = bx + 1;
    let prevWorldY = by + 1;
    let traveledTiles = 0;
    for (let i = 0; i < n; i++) {
      const cur = pts[i];
      const cpx = cur.x * TILE_SIZE - camera.x;
      const cpy = cur.y * TILE_SIZE - camera.y;
      const curWorldX = cur.x;
      const curWorldY = cur.y;
      const next = i + 1 < n ? pts[i + 1] : null;
      const endWorldX = next ? (cur.x + next.x) / 2 : cur.x;
      const endWorldY = next ? (cur.y + next.y) / 2 : cur.y;
      const ex = next ? ((cur.x + next.x) / 2) * TILE_SIZE - camera.x : cpx;
      const ey = next ? ((cur.y + next.y) / 2) * TILE_SIZE - camera.y : cpy;
      const localAlpha = (
        sampleVisibilityAlpha(prevWorldX, prevWorldY) +
        sampleVisibilityAlpha(curWorldX, curWorldY) +
        sampleVisibilityAlpha(endWorldX, endWorldY)
      ) / 3;
      const segmentLengthTiles = Math.hypot(endWorldX - prevWorldX, endWorldY - prevWorldY);
      const startDistance = traveledTiles;
      const endDistance = traveledTiles + segmentLengthTiles;
      segs.push({ ax: prevX, ay: prevY, cpx, cpy, ex, ey, alpha: localAlpha, startDistance, endDistance });
      prevX = ex; prevY = ey;
      prevWorldX = endWorldX;
      prevWorldY = endWorldY;
      traveledTiles = endDistance;
    }

    for (let pass = 0; pass < 2; pass++) {
      const strokeColor = pass === 0 ? outerColor : coreColor;
      ctx.lineWidth = pass === 0 ? 6 : 2;
      ctx.strokeStyle = strokeColor;

      for (let i = 0; i < n; i++) {
        const s = segs[i];
        const segmentLengthTiles = s.endDistance - s.startDistance;
        const subdivisions = Math.max(3, Math.ceil(segmentLengthTiles * 4));
        let prevPointX = s.ax;
        let prevPointY = s.ay;

        for (let step = 1; step <= subdivisions; step++) {
          const t = step / subdivisions;
          const invT = 1 - t;
          const pointX = invT * invT * s.ax + 2 * invT * t * s.cpx + t * t * s.ex;
          const pointY = invT * invT * s.ay + 2 * invT * t * s.cpy + t * t * s.ey;
          const pieceStartDistance = s.startDistance + segmentLengthTiles * ((step - 1) / subdivisions);
          const pieceEndDistance = s.startDistance + segmentLengthTiles * t;
          const pieceMidDistance = (pieceStartDistance + pieceEndDistance) * 0.5;
          const revealT = clamp((pieceMidDistance - hiddenStartTiles) / revealTiles, 0, 1);
          const reveal = revealT * revealT * (3 - 2 * revealT);
          const tailDistance = traveledTiles - pieceMidDistance;
          const tailT = clamp(tailDistance / tailFadeTiles, 0, 1);
          const tailAlpha = tailT * tailT * (3 - 2 * tailT);
          const pieceAlpha = tailAlpha * s.alpha * reveal * wireVisibility;
          if (pieceAlpha > 0.01) {
            ctx.globalAlpha = pieceAlpha;
            ctx.beginPath();
            ctx.moveTo(prevPointX, prevPointY);
            ctx.lineTo(pointX, pointY);
            ctx.stroke();
          }
          prevPointX = pointX;
          prevPointY = pointY;
        }
      }
    }
  }

  ctx.restore();
}

function renderBeacon(camera) {
  for (const beacon of state.beacons) {
    if (beacon.hidden && !beacon.active) continue;
    renderOneBeacon(camera, beacon);
  }
}

function renderOneBeacon(camera, beacon, options = {}) {
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
  ctx.moveTo(midX,      midY - 22);
  ctx.lineTo(midX + 10, midY - 8);
  ctx.lineTo(midX + 10, midY + 6);
  ctx.lineTo(midX,      midY + 18);
  ctx.lineTo(midX - 10, midY + 6);
  ctx.lineTo(midX - 10, midY - 8);
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

  // Contour hint for initial activation only.
  if (!active && !options.suppressContourHint) {
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

function buildGoldClusters() {
  const visited = new Uint8Array(GRID_W * GRID_H);
  const clusters = [];
  const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
  for (let sy = 0; sy < GRID_H; sy++) {
    for (let sx = 0; sx < GRID_W; sx++) {
      const si = sy * GRID_W + sx;
      if (!state.goldOreMask[si] || visited[si]) continue;
      // BFS
      const queue = [[sx, sy]];
      visited[si] = 1;
      let sumX = 0, sumY = 0, count = 0;
      let head = 0;
      while (head < queue.length) {
        const [cx, cy] = queue[head++];
        sumX += cx; sumY += cy; count++;
        for (const [dx, dy] of dirs) {
          const nx = cx + dx, ny = cy + dy;
          if (nx < 0 || ny < 0 || nx >= GRID_W || ny >= GRID_H) continue;
          const ni = ny * GRID_W + nx;
          if (!state.goldOreMask[ni] || visited[ni]) continue;
          visited[ni] = 1;
          queue.push([nx, ny]);
        }
      }
      if (count >= 5) clusters.push({ x: sumX / count, y: sumY / count, size: count });
    }
  }
  return clusters;
}

function renderOneBeaconRadar(camera, beacon) {
  const visAlpha = Math.max(
    state.visibleAlpha[cellIndex(beacon.x, beacon.y)],
    state.visibleAlpha[cellIndex(beacon.x + 1, beacon.y)],
    state.visibleAlpha[cellIndex(beacon.x, beacon.y + 1)],
    state.visibleAlpha[cellIndex(beacon.x + 1, beacon.y + 1)],
  );
  if (visAlpha <= 0.001) return;
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

  // Helper: find which depth level index a y coordinate belongs to
  const beaconLevelIdx = DEPTH_LEVELS.findIndex(l => beacon.y >= l.startY && beacon.y <= l.endY);
  const nextLevel = beaconLevelIdx >= 0 ? DEPTH_LEVELS[beaconLevelIdx + 1] : null;
  const sameLevel = beaconLevelIdx >= 0 ? DEPTH_LEVELS[beaconLevelIdx] : null;

  // Primary indicator: nearest inactive beacon in the NEXT depth level (blue), or base (red)
  let nearestAngle = null;
  let nearestDotX = 0, nearestDotY = 0;
  if (nextLevel) {
    let bestDist = Infinity;
    for (const b of state.beacons) {
      if (b === beacon || b.active) continue;
      if (b.y < nextLevel.startY || b.y > nextLevel.endY) continue;
      const dx = (b.x + 0.5) - (beacon.x + 0.5);
      const dy = (b.y + 0.5) - (beacon.y + 0.5);
      const d = Math.hypot(dx, dy);
      if (d < bestDist) {
        bestDist = d;
        nearestAngle = Math.atan2(dy / (d || 1), dx / (d || 1));
      }
    }
    if (nearestAngle !== null) {
      nearestDotX = midX + Math.cos(nearestAngle) * radius;
      nearestDotY = midY + Math.sin(nearestAngle) * radius;
    }
  }

  // Blueprint compass indicator: nearest blueprint on the map
  let artAngle = null;
  let artDotX = 0, artDotY = 0;
  if (state.blueprintRadarMode) {
    let bestDist = Infinity;
    for (let y = 0; y < GRID_H; y++) {
      for (let x = 0; x < GRID_W; x++) {
        if (!state.blueprintMask[y * GRID_W + x]) continue;
        const dx = (x + 0.5) - (beacon.x + 0.5);
        const dy = (y + 0.5) - (beacon.y + 0.5);
        const d = Math.hypot(dx, dy);
        if (d < bestDist) {
          bestDist = d;
          artAngle = Math.atan2(dy / (d || 1), dx / (d || 1));
        }
      }
    }
    if (artAngle !== null) {
      artDotX = midX + Math.cos(artAngle) * radius;
      artDotY = midY + Math.sin(artAngle) * radius;
    }
  }

  // Gold probe indicator: nearest gold cluster (5+ blocks)
  let goldAngle = null;
  let goldDotX = 0, goldDotY = 0;
  if (state.goldRadarMode) {
    if (!state.goldClustersCache) state.goldClustersCache = buildGoldClusters();
    let bestDist = Infinity;
    for (const c of state.goldClustersCache) {
      const dx = c.x - (beacon.x + 0.5);
      const dy = c.y - (beacon.y + 0.5);
      const d = Math.hypot(dx, dy);
      if (d < bestDist) {
        bestDist = d;
        goldAngle = Math.atan2(dy / (d || 1), dx / (d || 1));
      }
    }
    if (goldAngle !== null) {
      goldDotX = midX + Math.cos(goldAngle) * radius;
      goldDotY = midY + Math.sin(goldAngle) * radius;
    }
  }

  // Navigator bonus indicator: nearest inactive beacon in the SAME depth level (white)
  let navAngle = null;
  let navDotX = 0, navDotY = 0;
  if (state.navigatorMode && sameLevel) {
    let bestDist = Infinity;
    for (const b of state.beacons) {
      if (b === beacon || b.active) continue;
      if (b.y < sameLevel.startY || b.y > sameLevel.endY) continue;
      const dx = (b.x + 0.5) - (beacon.x + 0.5);
      const dy = (b.y + 0.5) - (beacon.y + 0.5);
      const d = Math.hypot(dx, dy);
      if (d < bestDist) {
        bestDist = d;
        navAngle = Math.atan2(dy / (d || 1), dx / (d || 1));
      }
    }
    if (navAngle !== null) {
      navDotX = midX + Math.cos(navAngle) * radius;
      navDotY = midY + Math.sin(navAngle) * radius;
    }
  }
  const pulse = 0.55 + (Math.sin((state.lastTs || 0) * 0.008) * 0.5 + 0.5) * 0.45;

  // Activation animation progress (0..1 over BEACON_ACTIVATION_MS)
  // Phases: ring 0-40%, line 40-70%, dot 70-100%
  let animT = 1;
  if (beacon.activationAnimStart) {
    const elapsed = (state.lastTs || 0) - beacon.activationAnimStart;
    if (elapsed < BEACON_ACTIVATION_MS) {
      animT = elapsed / BEACON_ACTIVATION_MS;
    } else {
      beacon.activationAnimStart = null;
    }
  }

  ctx.save();
  ctx.globalAlpha = visAlpha;

  // Blueprint transfer flight during beacon activation.
  const activationAnim = state.beaconActivationAnim;
  const canRenderArtifactFlight =
    activationAnim &&
    activationAnim.beacon === beacon &&
    (activationAnim.blueprintFlightCount || 0) > 0 &&
    animT < 1;
  if (canRenderArtifactFlight) {
    const fromX = (activationAnim.blueprintFlightFromX + 0.5) * TILE_SIZE - camera.x;
    const fromY = (activationAnim.blueprintFlightFromY + 0.5) * TILE_SIZE - camera.y;
    const flightT = clamp(animT / 0.55, 0, 1);
    const flightEase = 1 - Math.pow(1 - flightT, 3);
    const prevEase = 1 - Math.pow(1 - Math.max(0, flightT - 0.07), 3);
    const lift = Math.sin(flightT * Math.PI) * 18;
    const prevLift = Math.sin(Math.max(0, flightT - 0.07) * Math.PI) * 18;
    const prevX = fromX + (midX - fromX) * prevEase;
    const prevY = fromY + (midY - fromY) * prevEase - prevLift;
    const artX = fromX + (midX - fromX) * flightEase;
    const artY = fromY + (midY - fromY) * flightEase - lift;
    const shimmer = 0.6 + (Math.sin((state.lastTs || 0) * 0.02) * 0.5 + 0.5) * 0.4;

    ctx.strokeStyle = `rgba(212, 156, 255, ${0.35 * (0.35 + flightT * 0.65)})`;
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(artX, artY);
    ctx.stroke();

    ctx.fillStyle = `rgba(230, 190, 255, ${0.8 * shimmer})`;
    ctx.beginPath();
    ctx.moveTo(artX, artY - 7);
    ctx.lineTo(artX + 5, artY);
    ctx.lineTo(artX, artY + 7);
    ctx.lineTo(artX - 5, artY);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = `rgba(255, 235, 255, ${0.65 * shimmer})`;
    ctx.beginPath();
    ctx.arc(artX, artY, 2.4, 0, Math.PI * 2);
    ctx.fill();
  }

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

  // --- Phase 2 & 3: Single direction indicator ---
  // Orange → nearest inactive beacon; Red → base (no beacons left)
  const hasNextBeacon = nearestAngle !== null;
  const tgtAngle = hasNextBeacon ? nearestAngle : angle;
  const tgtDotX  = hasNextBeacon ? nearestDotX  : dotX;
  const tgtDotY  = hasNextBeacon ? nearestDotY  : dotY;
  const clrLine  = hasNextBeacon ? 'rgba(160, 220, 255,' : 'rgba(255, 80,  80,';
  const clrGlow  = hasNextBeacon ? 'rgba(180, 230, 255,' : 'rgba(255, 90,  90,';
  const clrCore  = hasNextBeacon ? 'rgba(200, 240, 255,' : 'rgba(255, 130, 130,';
  const clrFlash = hasNextBeacon ? 'rgba(200, 240, 255,' : 'rgba(255, 140, 140,';

  const lineT = animT < 0.4 ? 0 : Math.min(1, (animT - 0.4) / 0.3);
  const lineEase = 1 - Math.pow(1 - lineT, 3);

  if (lineEase > 0) {
    const lineDotX = midX + Math.cos(tgtAngle) * radius * lineEase;
    const lineDotY = midY + Math.sin(tgtAngle) * radius * lineEase;
    ctx.strokeStyle = `${clrLine} ${0.22 * lineEase})`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(midX, midY);
    ctx.lineTo(lineDotX, lineDotY);
    ctx.stroke();
  }

  const dotT = animT < 0.7 ? 0 : Math.min(1, (animT - 0.7) / 0.3);
  const dotEase = 1 - Math.pow(1 - dotT, 3);

  if (dotEase > 0) {
    if (dotT < 0.8) {
      const flashAlpha = 0.6 * (1 - dotT / 0.8);
      ctx.fillStyle = `${clrFlash} ${flashAlpha})`;
      ctx.beginPath();
      ctx.arc(tgtDotX, tgtDotY, 14 * dotEase, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = `${clrGlow} ${(0.18 + pulse * 0.18) * dotEase})`;
    ctx.beginPath();
    ctx.arc(tgtDotX, tgtDotY, (5.8 + pulse * 2.6) * dotEase, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `${clrCore} ${dotEase})`;
    ctx.beginPath();
    ctx.arc(tgtDotX, tgtDotY, (3.2 + pulse * 1.2) * dotEase, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- Gold probe indicator (yellow) ---
  if (goldAngle !== null) {
    if (lineEase > 0) {
      const gLineDotX = midX + Math.cos(goldAngle) * radius * lineEase;
      const gLineDotY = midY + Math.sin(goldAngle) * radius * lineEase;
      ctx.strokeStyle = `rgba(255, 210, 50, ${0.22 * lineEase})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(midX, midY);
      ctx.lineTo(gLineDotX, gLineDotY);
      ctx.stroke();
    }
    if (dotEase > 0) {
      if (dotT < 0.8) {
        ctx.fillStyle = `rgba(255, 230, 80, ${0.5 * (1 - dotT / 0.8)})`;
        ctx.beginPath();
        ctx.arc(goldDotX, goldDotY, 14 * dotEase, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = `rgba(255, 210, 50, ${(0.18 + pulse * 0.18) * dotEase})`;
      ctx.beginPath();
      ctx.arc(goldDotX, goldDotY, (5.8 + pulse * 2.6) * dotEase, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(255, 240, 120, ${dotEase})`;
      ctx.beginPath();
      ctx.arc(goldDotX, goldDotY, (3.2 + pulse * 1.2) * dotEase, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // --- Blueprint compass indicator (purple) ---
  if (artAngle !== null) {
    if (lineEase > 0) {
      const aLineDotX = midX + Math.cos(artAngle) * radius * lineEase;
      const aLineDotY = midY + Math.sin(artAngle) * radius * lineEase;
      ctx.strokeStyle = `rgba(170, 80, 255, ${0.22 * lineEase})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(midX, midY);
      ctx.lineTo(aLineDotX, aLineDotY);
      ctx.stroke();
    }
    if (dotEase > 0) {
      if (dotT < 0.8) {
        ctx.fillStyle = `rgba(190, 100, 255, ${0.5 * (1 - dotT / 0.8)})`;
        ctx.beginPath();
        ctx.arc(artDotX, artDotY, 14 * dotEase, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = `rgba(170, 80, 255, ${(0.18 + pulse * 0.18) * dotEase})`;
      ctx.beginPath();
      ctx.arc(artDotX, artDotY, (5.8 + pulse * 2.6) * dotEase, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(210, 150, 255, ${dotEase})`;
      ctx.beginPath();
      ctx.arc(artDotX, artDotY, (3.2 + pulse * 1.2) * dotEase, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // --- Navigator bonus: same-depth beacon indicator (orange) ---
  if (navAngle !== null) {
    if (lineEase > 0) {
      const nLineDotX = midX + Math.cos(navAngle) * radius * lineEase;
      const nLineDotY = midY + Math.sin(navAngle) * radius * lineEase;
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.22 * lineEase})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(midX, midY);
      ctx.lineTo(nLineDotX, nLineDotY);
      ctx.stroke();
    }

    if (dotEase > 0) {
      if (dotT < 0.8) {
        ctx.fillStyle = `rgba(255, 255, 255, ${0.5 * (1 - dotT / 0.8)})`;
        ctx.beginPath();
        ctx.arc(navDotX, navDotY, 14 * dotEase, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = `rgba(255, 255, 255, ${(0.18 + pulse * 0.18) * dotEase})`;
      ctx.beginPath();
      ctx.arc(navDotX, navDotY, (5.8 + pulse * 2.6) * dotEase, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(255, 255, 255, ${dotEase})`;
      ctx.beginPath();
      ctx.arc(navDotX, navDotY, (3.2 + pulse * 1.2) * dotEase, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

function triggerPickupRadar(kind, fromX, fromY) {
  let bestDist = Infinity;
  let bestX = 0, bestY = 0;
  if (kind === "blueprint") {
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
  playSound("radar_pickup");
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
  if (state.cutsceneModeActive) return;
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
  if (!state.baseFound && !state.cutsceneModeActive) {
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
  if (!state.blueprintMask[index]) return;

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

  const ctx = state.ctx;
  const isZoneCell = (tx, ty) => {
    if (tx < 0 || ty < 0 || tx >= GRID_W || ty >= GRID_H) {
      return false;
    }
    return state.perkZoneMask[cellIndex(tx, ty)] === zoneId;
  };

  if (zone.kind === "dual_stat") {
    const hit = getDualPerkZoneCellData(zone, x, y);
    if (!hit) {
      return;
    }
    const sideMeta = getDualPerkZoneSideMeta(hit.sideKey);
    const rarityColor = RARITY_COLORS[zone.rarity || RARITY.COMMON] || sideMeta.color;
    const chargeRatio = zone.arming ? 1 - zone.armingTimer / PERK_ZONE_CHARGE_DELAY : 0;
    const pulse = zone.arming
      ? (0.45 + (Math.sin((state.lastTs || 0) * 0.018) * 0.5 + 0.5) * 0.55)
      : 1;
    ctx.save();
    const fillAlpha = zone.arming
      ? Math.round((0x20 + chargeRatio * 80 * pulse))
      : 0x2a;
    ctx.fillStyle = `${sideMeta.color}${fillAlpha.toString(16).padStart(2, "0")}`;
    ctx.fillRect(sx + 3, sy + 3, TILE_SIZE - 6, TILE_SIZE - 6);
    ctx.strokeStyle = `${zone.arming ? rarityColor : sideMeta.color}cc`;
    ctx.lineWidth = zone.arming ? 2.4 : 2;
    if (zone.arming) {
      ctx.shadowColor = rarityColor;
      ctx.shadowBlur = 7 + pulse * 7;
    }
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
    if (x === hit.side.iconX && y === hit.side.iconY) {
      ctx.fillStyle = sideMeta.color;
      ctx.font = `700 14px ${HUD_FONT}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(sideMeta.icon, sx + TILE_SIZE * 0.5, sy + TILE_SIZE * 0.5 + 1);
    }
    ctx.restore();
    return;
  }

  const perk = TILE_PERK_TYPES[zone.perkType];
  const chargeRatio = zone.arming ? 1 - zone.armingTimer / PERK_ZONE_CHARGE_DELAY : 0;
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

function renderSteamStack() {}

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

function renderWormTelegraph(camera) {
  if (state.activeWorms.length === 0) return;
  const ctx = state.ctx;
  ctx.save();
  for (const worm of state.activeWorms) {
    if (worm.telegraphTimer <= 0 || worm.path.length < 2) continue;
    const alpha = worm.telegraphTimer; // 1.0 → 0.0 over 1 second
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = "#ff3333";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.setLineDash([6, 5]);
    ctx.beginPath();
    for (let i = 0; i < worm.path.length; i++) {
      const pt = worm.path[i];
      const px = pt.x * TILE_SIZE + TILE_SIZE / 2 - camera.x;
      const py = pt.y * TILE_SIZE + TILE_SIZE / 2 - camera.y;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

function renderCollapseWarnings(camera) {
  if (state.collapseWarnings.length === 0) {
    return;
  }
  const ctx = state.ctx;
  ctx.save();
  for (const warning of state.collapseWarnings) {
    const ratio = clamp(warning.timer / Math.max(0.1, warning.duration || COLLAPSE_WARNING_DURATION), 0, 1);
    const pulse = Math.sin((state.lastTs || 0) * 0.02) * 0.5 + 0.5;
    const startIndex = warning.timer > 0 ? 0 : (warning.resolveIndex || 0);
    for (let i = startIndex; i < warning.cells.length; i += 1) {
      const cell = warning.cells[i];
      const index = cellIndex(cell.x, cell.y);
      const visibleAlpha = clamp(state.visibleAlpha[index], 0, 1);
      if (visibleAlpha <= 0.05) {
        continue;
      }
      const sx = cell.x * TILE_SIZE - camera.x;
      const sy = cell.y * TILE_SIZE - camera.y;
      ctx.globalAlpha = visibleAlpha * (0.22 + pulse * 0.16);
      ctx.fillStyle = "#b62020";
      ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);
      ctx.globalAlpha = visibleAlpha * (0.45 + (1 - ratio) * 0.25);
      ctx.strokeStyle = "#ff5a5a";
      ctx.lineWidth = 2;
      ctx.strokeRect(sx + 1, sy + 1, TILE_SIZE - 2, TILE_SIZE - 2);
      ctx.globalAlpha = visibleAlpha * (0.16 + pulse * 0.12);
      ctx.strokeStyle = "#ffd0d0";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(sx + 6, sy + 6);
      ctx.lineTo(sx + TILE_SIZE - 6, sy + TILE_SIZE - 6);
      ctx.moveTo(sx + TILE_SIZE - 6, sy + 6);
      ctx.lineTo(sx + 6, sy + TILE_SIZE - 6);
      ctx.stroke();
    }
  }
  ctx.restore();
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

function renderContourEnemy(camera) {
  const enemy = state.contourEnemy;
  if (!enemy) return;
  const ctx = state.ctx;
  const tileIdx = cellIndex(enemy.x, enemy.y);
  const vis = clamp(state.visibleAlpha[tileIdx], 0, 1);
  if (vis < 0.05) return;

  // Telegraph warning on target cell
  if (enemy.attackPhase === 'telegraph') {
    const ratio = 1 - enemy.attackTelegraphTimer / CONTOUR_ENEMY_ATTACK_TELEGRAPH;
    const pulse = Math.sin(ratio * Math.PI * 5) * 0.5 + 0.5;
    const tx = enemy.attackTargetX * TILE_SIZE - camera.x;
    const ty = enemy.attackTargetY * TILE_SIZE - camera.y;
    ctx.save();
    ctx.globalAlpha = vis * (0.35 + pulse * 0.45);
    ctx.fillStyle = "#ff2222";
    ctx.fillRect(tx + 2, ty + 2, TILE_SIZE - 4, TILE_SIZE - 4);
    ctx.globalAlpha = vis * (0.7 + pulse * 0.3);
    ctx.strokeStyle = "#ff6666";
    ctx.lineWidth = 2;
    ctx.strokeRect(tx + 1, ty + 1, TILE_SIZE - 2, TILE_SIZE - 2);
    ctx.restore();
  }

  const px = enemy.renderX * TILE_SIZE + TILE_SIZE * 0.5 - camera.x;
  const py = enemy.renderY * TILE_SIZE + TILE_SIZE * 0.5 - camera.y;

  // Scale grows with tilesEaten: 1x at 0 tiles, up to ~2.2x at 20 tiles
  const sc = 1 + Math.min(enemy.tilesEaten, 20) * 0.06;

  const wingFlap = Math.sin(enemy.bobPhase);
  const bob = Math.sin(enemy.bobPhase * 0.7) * 2.5 * sc;

  ctx.save();
  ctx.globalAlpha = vis;

  // Drop shadow
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath();
  ctx.ellipse(px, py + 8 * sc, 8 * sc, 3 * sc, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wings
  ctx.fillStyle = "#2a1540";
  ctx.beginPath();
  ctx.moveTo(px - 2 * sc, py + bob);
  ctx.quadraticCurveTo(px - 14 * sc, py + bob - 8 * sc + wingFlap * 10 * sc, px - 11 * sc, py + bob + 6 * sc);
  ctx.quadraticCurveTo(px - 6 * sc, py + bob + 3 * sc, px - 2 * sc, py + bob + 2 * sc);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(px + 2 * sc, py + bob);
  ctx.quadraticCurveTo(px + 14 * sc, py + bob - 8 * sc + wingFlap * 10 * sc, px + 11 * sc, py + bob + 6 * sc);
  ctx.quadraticCurveTo(px + 6 * sc, py + bob + 3 * sc, px + 2 * sc, py + bob + 2 * sc);
  ctx.fill();

  // Body (flash white when stunned)
  ctx.fillStyle = enemy.stunTimer > 0 && Math.floor(enemy.stunTimer * 10) % 2 === 0 ? "#ffffff" : "#5a2a7a";
  ctx.beginPath();
  ctx.ellipse(px, py + bob, 6 * sc, 7 * sc, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = "#ffdd44";
  ctx.beginPath();
  ctx.arc(px - 2.5 * sc, py + bob - 2 * sc, 1.8 * sc, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(px + 2.5 * sc, py + bob - 2 * sc, 1.8 * sc, 0, Math.PI * 2);
  ctx.fill();

  // HP bar (only shown after first hit)
  if (enemy.hp < enemy.maxHp) {
    const barW = Math.round(22 * sc), barH = 3;
    const barX = px - barW / 2;
    const barY = py + bob - 16 * sc;
    const ratio = Math.max(0, enemy.hp / enemy.maxHp);
    ctx.fillStyle = "#1a0a0a";
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = ratio > 0.5 ? "#55cc33" : ratio > 0.25 ? "#ffaa00" : "#cc2222";
    ctx.fillRect(barX, barY, barW * ratio, barH);
  }

  ctx.globalAlpha = 1;
  ctx.restore();
}

function renderDrill(camera) {
  const ctx = state.ctx;
  const strikeWave = Math.max(0, Math.sin(state.drill.strikePhase));
  const thrust = strikeWave * state.drill.strikeEnergy;
  const heatRatio = clamp(state.heat / Math.max(1, state.maxHeat), 0, 1);
  const idleCharge = clamp(state.idleTime / IDLE_AUTO_CLOSE_DELAY, 0, 1);
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

  ctx.rotate(angle);
  ctx.drawImage(state.sprites.drillFrames[frame], -TILE_SIZE * 0.5, -TILE_SIZE * 0.5, TILE_SIZE, TILE_SIZE);
  ctx.restore();

  if (state.heldKeyForSafe < 0) {
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

  // Key carried indicator — floating key above drill
  if (state.heldKeyForSafe >= 0) {
    const t = state.lastTs || 0;
    const floatY = Math.sin(t * 0.005) * 3;
    const kcx = px + TILE_SIZE * 0.5;
    const kcy = py - 6 + floatY;
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

  if (state.breachChainEmpoweredHits > 0) {
    const count = Math.max(0, Math.floor(state.breachChainEmpoweredHits));
    const badgeX = px + TILE_SIZE * 0.5;
    const badgeY = py + (state.heldKeyForSafe >= 0 ? -26 : -12);
    const pulse = Math.sin((state.lastTs || 0) * 0.01) * 0.5 + 0.5;
    const text = `x${count}`;
    ctx.save();
    ctx.font = "bold 10px monospace";
    const textWidth = Math.ceil(ctx.measureText(text).width);
    const width = Math.max(26, textWidth + 16);
    const height = 14;
    const x = badgeX - width * 0.5;
    const y = badgeY - height * 0.5;
    const radius = 7;
    drawRoundedRectPath(ctx, x, y, width, height, radius);
    ctx.fillStyle = `rgba(15, 22, 30, ${0.68 + pulse * 0.2})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(255, 210, 120, ${0.65 + pulse * 0.3})`;
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.fillStyle = "#ffd68a";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, badgeX, badgeY + 0.5);
    ctx.restore();
  }
}

function renderSignalStatus(camera) {
  const hasSignal = state.signalMovesLeft > 0;
  const hasCrystalRadar = state.radarCrystalModule || state.crystalLightRadarTimer > 0;
  if (!hasSignal && !hasCrystalRadar) {
    return;
  }

  const ctx = state.ctx;
  const x = state.drill.renderX * TILE_SIZE + TILE_SIZE * 0.5 - camera.x;
  const y = state.drill.renderY * TILE_SIZE + TILE_SIZE * 0.5 - camera.y;
  const radius = 48;
  const barWidth = 44;
  const angle = hasSignal ? Math.atan2(state.signalDirY, state.signalDirX) : 0;
  const dotX = x + Math.cos(angle) * radius;
  const dotY = y + Math.sin(angle) * radius;
  const pulse = 0.55 + (Math.sin((state.lastTs || 0) * 0.012) * 0.5 + 0.5) * 0.45;

  ctx.save();
  const barRatio = hasSignal && state.signalMovesMax > 0
    ? clamp(state.signalMovesLeft / state.signalMovesMax, 0, 1)
    : 0;
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

  if (hasSignal) {
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
  }

  if (hasCrystalRadar) {
    const recipeOnly = state.crystalLightRadarTimer > 0 && !state.radarCrystalModule;
    const crystalTargets = getNearestRadarCrystals(recipeOnly);
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

  if (hasSignal) {
    ctx.fillStyle = "rgba(255, 244, 220, 0.12)";
    buildRoundedRectPath(ctx, x - barWidth * 0.5, y + radius + 12, barWidth, 4, 3);
    ctx.fill();
    if (barRatio > 0) {
      ctx.fillStyle = "#f2ede2";
      buildRoundedRectPath(ctx, x - barWidth * 0.5, y + radius + 12, barWidth * barRatio, 4, 3);
      ctx.fill();
    }
  }
  ctx.restore();
}

function getNeededRecipeCrystalTypes() {
  if (!Array.isArray(state.crystalRecipe) || state.crystalRecipe.length === 0) {
    return new Set();
  }
  const required = new Map();
  for (let i = 0; i < state.crystalRecipe.length; i += 1) {
    const type = state.crystalRecipe[i];
    required.set(type, (required.get(type) || 0) + 1);
  }
  const needed = new Set();
  for (const [type, count] of required.entries()) {
    if ((state.crystalCollected[type] || 0) < count) {
      needed.add(type);
    }
  }
  return needed;
}

function getNearestRadarCrystals(recipeOnly = false) {
  const nearest = [];
  const neededRecipeTypes = recipeOnly ? getNeededRecipeCrystalTypes() : null;
  if (recipeOnly && neededRecipeTypes.size === 0) {
    return nearest;
  }
  for (let crystalType = 1; crystalType < CRYSTAL_TYPES.length; crystalType += 1) {
    if (neededRecipeTypes && !neededRecipeTypes.has(crystalType)) {
      continue;
    }
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

function renderContourBlastPressureStatus(camera) {
  if (state.contourBlastPressureTimer <= 0) {
    return;
  }

  const ctx = state.ctx;
  const x = state.drill.renderX * TILE_SIZE + TILE_SIZE * 0.5 - camera.x;
  const y = state.drill.renderY * TILE_SIZE - camera.y - 36;
  const width = 64;
  const ratio = clamp(
    state.contourBlastPressureTimer / Math.max(0.1, state.contourBlastPressureDisplayDuration || 0.1),
    0,
    1,
  );

  ctx.save();
  ctx.fillStyle = "rgba(23, 14, 9, 0.76)";
  ctx.strokeStyle = "rgba(255, 184, 118, 0.42)";
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

function renderLoopPressureStatus(camera) {
  if (state.loopPressureTimer <= 0) {
    return;
  }

  const ctx = state.ctx;
  const x = state.drill.renderX * TILE_SIZE + TILE_SIZE * 0.5 - camera.x;
  const y = state.drill.renderY * TILE_SIZE - camera.y - 24;
  const width = 64;
  const ratio = clamp(state.loopPressureTimer / Math.max(0.1, state.loopPressureDisplayDuration || 0.1), 0, 1);

  ctx.save();
  ctx.fillStyle = "rgba(23, 14, 9, 0.76)";
  ctx.strokeStyle = "rgba(122, 198, 255, 0.42)";
  ctx.lineWidth = 1.2;
  buildRoundedRectPath(ctx, x - width * 0.5, y - 4, width, 8, 4);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "rgba(255, 244, 220, 0.12)";
  buildRoundedRectPath(ctx, x - width * 0.5 + 2, y - 2, width - 4, 4, 3);
  ctx.fill();
  ctx.fillStyle = "#4eb5ff";
  buildRoundedRectPath(ctx, x - width * 0.5 + 2, y - 2, (width - 4) * ratio, 4, 3);
  ctx.fill();
  ctx.restore();
}

function renderOverdriveStatus(camera) {
  if (state.overhealDrillTimer <= 0) {
    return;
  }

  const ctx = state.ctx;
  const x = state.drill.renderX * TILE_SIZE + TILE_SIZE * 0.5 - camera.x;
  const y = state.drill.renderY * TILE_SIZE - camera.y - 12;
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

function renderLowFuelStatus(camera) {
  const threshold = state.maxFuel * 0.3;
  if (state.maxFuel <= 0 || state.fuel > threshold) {
    return;
  }

  const ctx = state.ctx;
  const x = state.drill.renderX * TILE_SIZE + TILE_SIZE * 0.5 - camera.x;
  const y = state.drill.renderY * TILE_SIZE - camera.y + 66;
  const width = 64;
  const ratio = clamp(state.fuel / Math.max(1, state.maxFuel), 0, 1);
  const pulse = Math.sin((state.lastTs || 0) * 0.01) * 0.5 + 0.5;

  ctx.save();
  ctx.fillStyle = "rgba(23, 14, 9, 0.82)";
  ctx.strokeStyle = `rgba(255, 112, 112, ${0.3 + pulse * 0.2})`;
  ctx.lineWidth = 1.2;
  buildRoundedRectPath(ctx, x - width * 0.5, y - 4, width, 8, 4);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "rgba(255, 244, 220, 0.12)";
  buildRoundedRectPath(ctx, x - width * 0.5 + 2, y - 2, width - 4, 4, 3);
  ctx.fill();
  ctx.fillStyle = pulse > 0.5 ? "#ff6b57" : "#ff934f";
  buildRoundedRectPath(ctx, x - width * 0.5 + 2, y - 2, (width - 4) * ratio, 4, 3);
  ctx.fill();
  ctx.restore();
}


function renderActiveToast(camera) {
  if (state.activeToasts.length === 0) return;
  const ctx = state.ctx;
  ctx.save();
  ctx.font = `700 14px ${HUD_FONT}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineWidth = 3.5;
  for (let i = 0; i < state.activeToasts.length; i++) {
    const toast = state.activeToasts[i];
    const duration = Math.max(0.1, toast.duration || TOAST_DURATION_LEVEL_1);
    const t = 1 - toast.time / duration;
    const alpha = t < 0.08 ? t / 0.08 : Math.max(0, 1 - (t - 0.25) / 0.75);
    const lift = (1 - (1 - t) * (1 - t)) * 28;
    const x = toast.wx - camera.x;
    const y = toast.wy - camera.y - lift - (toast.stackOffset || 0);
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = "rgba(8, 4, 2, 0.95)";
    ctx.fillStyle = toast.color;
    if (toast.text.endsWith(" ◆")) {
      const prefix = toast.text.slice(0, -1); // "+N "
      ctx.font = `700 14px ${HUD_FONT}`;
      const prefixW = ctx.measureText(prefix).width;
      ctx.font = `700 10px ${HUD_FONT}`;
      const iconW = ctx.measureText("◆").width;
      const totalW = prefixW + iconW;
      const sx = x - totalW / 2;
      ctx.textAlign = "left";
      ctx.font = `700 14px ${HUD_FONT}`;
      ctx.strokeText(prefix, sx, y);
      ctx.fillText(prefix, sx, y);
      ctx.font = `700 10px ${HUD_FONT}`;
      ctx.strokeText("◆", sx + prefixW, y);
      ctx.fillText("◆", sx + prefixW, y);
      ctx.textAlign = "center";
      ctx.font = `700 14px ${HUD_FONT}`;
    } else {
      ctx.strokeText(toast.text, x, y);
      ctx.fillText(toast.text, x, y);
    }
  }
  ctx.restore();
}

function renderDepthTitle() {
  if (state.depthTitle.time <= 0 || !state.depthTitle.text || state.debugMapActive) {
    return;
  }

  const ctx = state.ctx;
  const duration = 1.8;
  const progress = 1 - clamp(state.depthTitle.time / duration, 0, 1);
  const fadeIn = clamp(progress / 0.18, 0, 1);
  const fadeOut = clamp(state.depthTitle.time / 0.45, 0, 1);
  const alpha = Math.min(fadeIn, fadeOut);
  const x = state.width * 0.5;
  // Place depth announce below HUD, closer to screen center.
  const baseY = Math.min(state.height * 0.48, 230);
  const y = baseY - (1 - alpha) * 10;
  const text = state.depthTitle.text;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `700 28px ${HUD_FONT}`;
  const width = Math.max(180, ctx.measureText(text).width + 40);
  drawRoundedRectPath(x - width * 0.5, y - 24, width, 48, 18);
  ctx.fillStyle = "rgba(19, 12, 8, 0.82)";
  ctx.strokeStyle = "rgba(255, 207, 122, 0.32)";
  ctx.lineWidth = 1.5;
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#ffdf9b";
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
  const left = Math.round((state.width - totalWidth) * 0.5);
  const sideInset = Math.max(0, Math.round((state.width - totalWidth) * 0.5));
  const secondRowTop = top + panelHeight + 8;
  state.hudInspectableRects = [];

  const hpLabel = `${Math.ceil(state.hp)}/${state.maxHp}`;
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
      if (!crystal) {
        continue;
      }
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

  const xpRatio = clamp(state.xp / Math.max(1, state.xpToNext), 0, 1);
  const xpBarWidth = (totalWidth - gap) / 2;
  drawHudXpBar(left, secondRowTop, xpBarWidth, panelHeight, `LVL ${state.level}`, `${state.xp}/${state.xpToNext}`, xpRatio);

  // Depth + beacons info panel
  const infoX = left + xpBarWidth + gap;
  const infoW = totalWidth - xpBarWidth - gap;
  const curDepth = DEPTH_LEVELS.find(l => l.level === state.currentDepthLevel);
  const levelBeacons = curDepth
    ? state.beacons.filter(b => b.y >= curDepth.startY && b.y <= curDepth.endY)
    : [];
  const beaconsTotal = levelBeacons.length;
  const beaconsActive = levelBeacons.filter(b => b.active).length;
  drawHudPanel(infoX, secondRowTop, infoW, panelHeight);
  {
    const ctx = state.ctx;
    ctx.save();
    ctx.textBaseline = "middle";
    const midY = secondRowTop + panelHeight * 0.5;
    ctx.font = `700 10px ${HUD_FONT}`;
    ctx.fillStyle = "#c8a96e";
    ctx.textAlign = "left";
    ctx.fillText(t("ui.depth_hud", { level: state.currentDepthLevel }), infoX + 12, midY);
    ctx.textAlign = "right";
    const beaconDone = beaconsTotal > 0 && beaconsActive === beaconsTotal;
    ctx.fillStyle = beaconDone ? "#7de87d" : "#e5f8ff";
    ctx.fillText(`${beaconsActive}/${beaconsTotal} 📡`, infoX + infoW - 10, midY);
    ctx.restore();
  }

  const thirdRowTop = secondRowTop + panelHeight + 8;
  drawHudBar(left, thirdRowTop, panelWidth, panelHeight, "FUEL", `${Math.floor(state.fuel)}/${state.maxFuel}`, fuelRatio, ["#ffbf62", "#ff8c3b"]);
  drawHudBar(
    left + panelWidth + gap,
    thirdRowTop,
    panelWidth,
    panelHeight,
    "HEAT",
    `${Math.floor(state.heat)}/${state.maxHeat}`,
    heatRatio,
    ["#ffb36d", "#ff4c3f"],
  );
  const detailTop = thirdRowTop + panelHeight + 8;

  const topActions = document.querySelector(".top-actions");
  if (topActions) {
    topActions.style.top = `${detailTop - 1}px`;
    topActions.style.left = "auto";
    topActions.style.right = `${sideInset}px`;
  }

  // Key indicator
  if (state.heldKeyForSafe >= 0) {
    const keyX = left + panelWidth + gap;
    const keyY = thirdRowTop - 30;
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
    ctx.fillText(t("ui.key_hud"), keyX + 26, keyY + 12);
    ctx.restore();
  }

  renderHudCoreStats(left, detailTop, panelWidth, t("ui.stats_hud"));
  renderHudPerkColumn(14, state.height - 14, state.width - 28, t("ui.perks_hud"));

  ctx.save();
  ctx.fillStyle = "rgba(198, 171, 132, 0.68)";
  ctx.font = `700 10px ${HUD_FONT}`;
  ctx.textAlign = "right";
  ctx.textBaseline = "top";
  const fpsText = `FPS ${Math.round(state.fps || 0)}`;
  const collapseText = `COL ${Math.round(state.collapseBudget || 0)}`;
  const enemyText = `ENM ${Math.round(state.contourEnemyBudget || 0)}`;
  const comboText = t("ui.combo_hud", { count: Math.max(0, Math.round(state.comboCount || 0)) });
  const fpsX = state.width - 14;
  const fpsY = detailTop + 52;
  ctx.fillText(fpsText, fpsX, fpsY);
  ctx.fillText(collapseText, fpsX, fpsY + 12);
  ctx.fillText(enemyText, fpsX, fpsY + 24);
  ctx.fillText(comboText, fpsX, fpsY + 36);
  state.syncSoundToggleButton?.();

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
  const trackWidth = Math.max(44, width - 82);
  const trackHeight = 10;
  const fx = getHudBarFx(label.toLowerCase(), ratio);
  const ghostRatio = fx ? clamp(fx.ghostRatio, 0, 1) : ratio;
  const pulse = fx ? fx.pulse : 0;
  const deltaDir = fx ? fx.deltaDir : 0;
  const intensity = fx ? fx.intensity : 0;

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

  const ghostStart = Math.min(ratio, ghostRatio);
  const ghostWidth = Math.abs(ghostRatio - ratio) * trackWidth;
  if (ghostWidth > 0.8) {
    ctx.fillStyle = deltaDir < 0
      ? `rgba(255, 104, 104, ${0.18 + intensity * 0.12 + pulse * (0.16 + intensity * 0.18)})`
      : `rgba(122, 255, 176, ${0.16 + intensity * 0.1 + pulse * (0.14 + intensity * 0.16)})`;
    drawRoundedRectPath(trackX + ghostStart * trackWidth, trackY, ghostWidth, trackHeight, 999);
    ctx.fill();
  }

  if (ratio > 0) {
    const gradient = ctx.createLinearGradient(trackX, trackY, trackX + trackWidth, trackY);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, colors[1]);
    ctx.fillStyle = gradient;
    drawRoundedRectPath(trackX, trackY, trackWidth * ratio, trackHeight, 999);
    ctx.fill();
  }

  if (label === "HP" && state.armor > 0) {
    const armorRatio = clamp(state.armor / Math.max(1, state.maxHp), 0, 1);
    const armorWidth = trackWidth * armorRatio;
    if (armorWidth > 0) {
      const armorGradient = ctx.createLinearGradient(trackX, trackY, trackX + trackWidth, trackY);
      armorGradient.addColorStop(0, "rgba(220, 228, 236, 0.45)");
      armorGradient.addColorStop(1, "rgba(156, 170, 186, 0.45)");
      ctx.fillStyle = armorGradient;
      drawRoundedRectPath(trackX, trackY, armorWidth, trackHeight, 999);
      ctx.fill();
    }
  }

  if (pulse > 0 && ratio > 0) {
    const pulseWidth = Math.max(12, trackWidth * (0.08 + intensity * 0.12));
    const slide = ((state.lastTs || 0) * (0.0016 + intensity * 0.0032)) % 1;
    const travelWidth = Math.max(0, trackWidth * ratio - pulseWidth);
    const pulseX = label === "FUEL" || label === "HP"
      ? trackX + travelWidth * (1 - slide)
      : trackX + travelWidth * slide;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const flashGradient = ctx.createLinearGradient(pulseX, trackY, pulseX + pulseWidth, trackY);
    if (deltaDir < 0) {
      flashGradient.addColorStop(0, "rgba(255, 255, 255, 0)");
      flashGradient.addColorStop(0.5, `rgba(255, 214, 170, ${0.08 + intensity * 0.08 + pulse * (0.14 + intensity * 0.24)})`);
      flashGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
    } else {
      flashGradient.addColorStop(0, "rgba(255, 255, 255, 0)");
      flashGradient.addColorStop(0.5, `rgba(220, 255, 230, ${0.08 + intensity * 0.08 + pulse * (0.12 + intensity * 0.22)})`);
      flashGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
    }
    ctx.fillStyle = flashGradient;
    drawRoundedRectPath(trackX, trackY, trackWidth * ratio, trackHeight, 999);
    ctx.fill();
    ctx.restore();
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
  const trackX = x + 72;
  const trackY = y + 12;
  const trackWidth = Math.max(44, width - 82);
  const trackHeight = 10;
  const fx = getHudBarFx("xp", ratio);
  const ghostRatio = fx ? clamp(fx.ghostRatio, 0, 1) : ratio;
  const barPulse = fx ? fx.pulse : 0;
  const deltaDir = fx ? fx.deltaDir : 0;
  const intensity = fx ? fx.intensity : 0;

  drawHudPanel(x, y, width, height);

  ctx.save();
  ctx.textBaseline = "alphabetic";
  const pulse = state.levelUpPulse || 0;
  if (pulse > 0) {
    const glowAlpha = pulse * 0.9;
    ctx.shadowColor = `rgba(125, 224, 255, ${glowAlpha})`;
    ctx.shadowBlur = 8 + pulse * 6;
    ctx.fillStyle = `rgba(${Math.round(143 + 112 * pulse)}, ${Math.round(223 + 32 * pulse)}, 255, 1)`;
  } else {
    ctx.fillStyle = "#8fdfff";
  }
  ctx.font = `700 ${pulse > 0 ? Math.round(10 + pulse * 2) : 10}px ${HUD_FONT}`;
  ctx.textAlign = "left";
  ctx.fillText(label, x + 10, y + 13);
  ctx.shadowBlur = 0;

  ctx.fillStyle = "#e5f8ff";
  ctx.font = `700 11px ${HUD_FONT}`;
  ctx.fillText(value, x + 10, y + 27);

  ctx.fillStyle = "rgba(180, 238, 255, 0.1)";
  drawRoundedRectPath(trackX, trackY, trackWidth, trackHeight, trackHeight * 0.5);
  ctx.fill();

  const ghostStart = Math.min(ratio, ghostRatio);
  const ghostWidth = Math.abs(ghostRatio - ratio) * trackWidth;
  if (ghostWidth > 0.8) {
    ctx.fillStyle = deltaDir < 0
      ? `rgba(255, 128, 128, ${0.16 + intensity * 0.08 + barPulse * (0.12 + intensity * 0.14)})`
      : `rgba(186, 244, 255, ${0.14 + intensity * 0.08 + barPulse * (0.14 + intensity * 0.16)})`;
    drawRoundedRectPath(trackX + ghostStart * trackWidth, trackY, ghostWidth, trackHeight, trackHeight * 0.5);
    ctx.fill();
  }

  const fillWidth = Math.max(0, trackWidth * ratio);
  if (fillWidth > 0) {
    const glow = 0.8 + Math.sin((state.lastTs || 0) * 0.004) * 0.1;
    ctx.fillStyle = `rgba(125, 224, 255, ${glow})`;
    drawRoundedRectPath(trackX, trackY, fillWidth, trackHeight, trackHeight * 0.5);
    ctx.fill();
  }

  if (barPulse > 0 && fillWidth > 0) {
    const pulseWidth = Math.max(12, trackWidth * (0.1 + intensity * 0.12));
    const slide = ((state.lastTs || 0) * (0.0014 + intensity * 0.0028)) % 1;
    const pulseX = trackX + Math.max(0, fillWidth - pulseWidth) * slide;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const flashGradient = ctx.createLinearGradient(pulseX, trackY, pulseX + pulseWidth, trackY);
    flashGradient.addColorStop(0, "rgba(255, 255, 255, 0)");
    flashGradient.addColorStop(0.5, `rgba(232, 252, 255, ${0.08 + intensity * 0.08 + barPulse * (0.14 + intensity * 0.22)})`);
    flashGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = flashGradient;
    drawRoundedRectPath(trackX, trackY, fillWidth, trackHeight, trackHeight * 0.5);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

function getHudBarFx(key, ratio) {
  if (!state.hudBarFx[key]) {
    state.hudBarFx[key] = { ratio, ghostRatio: ratio, pulse: 0, deltaDir: 0, intensity: 0 };
  }
  return state.hudBarFx[key];
}

function updateHudBarFx(dt) {
  const ratios = {
    hp: clamp(state.hp / Math.max(1, state.maxHp), 0, 1),
    fuel: clamp(state.fuel / Math.max(1, state.maxFuel), 0, 1),
    heat: clamp(state.heat / Math.max(1, state.maxHeat), 0, 1),
    xp: clamp(state.xp / Math.max(1, state.xpToNext), 0, 1),
  };
  const harmfulDirection = {
    hp: -1,
    fuel: -1,
    heat: 1,
    xp: 0,
  };

  for (const [key, ratio] of Object.entries(ratios)) {
    const fx = getHudBarFx(key, ratio);
    const delta = ratio - fx.ratio;
    if (Math.abs(delta) > 0.0005) {
      const dir = Math.sign(delta);
      const isHarmful = dir !== 0
        && dir === harmfulDirection[key]
        && (key !== "fuel" || state.lastFuelHudChangeKind !== "idle");
      const rawIntensity = clamp(Math.abs(delta) / Math.max(dt, 0.0001) * 0.12, 0, 1);
      const speedIntensity = rawIntensity * rawIntensity;
      fx.deltaDir = isHarmful ? dir : 0;
      fx.pulse = isHarmful ? 1 : 0;
      fx.intensity = isHarmful ? Math.max(fx.intensity * 0.55, speedIntensity) : 0;
      fx.ratio = ratio;
      if (!isHarmful) {
        fx.ghostRatio = ratio;
      }
    }
    if (Math.abs(fx.ghostRatio - ratio) > 0.0005) {
      const speed = fx.ghostRatio > ratio ? 4.6 : 6.8;
      const follow = Math.min(1, dt * speed);
      fx.ghostRatio += (ratio - fx.ghostRatio) * follow;
    } else {
      fx.ghostRatio = ratio;
    }
    fx.pulse = Math.max(0, fx.pulse - dt * 2.2);
    fx.intensity = Math.max(0, fx.intensity - dt * 1.6);
    if (fx.pulse === 0 && Math.abs(fx.ghostRatio - ratio) <= 0.0005) {
      fx.deltaDir = 0;
    }
  }
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
    { perkType: 5, value: formatPerkNumber(state.drillPower) },
    { perkType: 3, value: formatPerkNumber(state.explosionPower) },
  ];
  const rowHeight = 22;

  ctx.save();
  ctx.textBaseline = "middle";

  // Gold row — first
  const goldRowY = y + 8;
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

  // Blueprint row — below gold, same style
  const blueprintRowY = goldRowY + rowHeight;
  ctx.save();
  ctx.translate(x + 20, blueprintRowY);
  ctx.strokeStyle = "#b078e0";
  ctx.lineWidth = 1.5;
  ctx.fillStyle = "#7a40b0";
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = Math.PI / 6 + (Math.PI * 2 * i) / 6;
    const r = 18 * 0.38;
    if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  ctx.font = `700 11px ${HUD_FONT}`;
  ctx.textAlign = "left";
  const blueprintText = `${state.blueprintCount}`;
  ctx.strokeStyle = "rgba(24, 12, 8, 0.82)";
  ctx.lineWidth = 3;
  ctx.strokeText(blueprintText, x + 36, blueprintRowY);
  ctx.fillStyle = "#e8d0ff";
  ctx.fillText(blueprintText, x + 36, blueprintRowY);

  for (let i = 0; i < rows.length; i += 1) {
    const rowY = blueprintRowY + (i + 1) * rowHeight;
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
  const current = getShopStatsSnapshot();
  const defaults = getShopDefaultStatsSnapshot();
  const statDefs = [
    { key: "drillPower", format: "fixed1" },
    { key: "drillPiercingCount", format: null },
    { key: "drillPiercingDamage", format: "rawpercent" },
    { key: "drillDiagonalCount", format: null },
    { key: "drillDiagonalDamage", format: "rawpercent" },
    { key: "damageBonus", format: "rawpercent" },
    { key: "strikeSpeed", format: "rawpercent" },
    { key: "maxHp", format: null },
    { key: "maxFuel", format: null },
    { key: "maxHeat", format: null },
    { key: "heatRate", format: "multiplier" },
    { key: "effectDurationRate", format: "multiplier" },
    { key: "concentration", format: "multiplier" },
    { key: "fuelDrainRate", format: "multiplier" },
    { key: "visionRadius", format: null },
    { key: "luck", format: null },
    { key: "weakSpotChance", format: "percent" },
    { key: "weakSpotMult", format: "percent" },
    { key: "fuelStarvationResistance", format: "rawpercent" },
    { key: "goldBonus", format: "percent" },
    { key: "fuelBonus", format: "percent" },
    { key: "explosionPower", format: "fixed1" },
    { key: "explosionBonus", format: "rawpercent" },
    { key: "explosionRadiusBonus", format: "fixed1" },
    { key: "lowFuelDamageBonus", format: "percent" },
    { key: "goldBonusPerLevel", format: "percent" },
    { key: "miningGoldBonusMultiplier", format: "percent" },
    { key: "speedOfAutoClose", format: "rawpercent" },
  ];

  const formatStat = (value, mode = "number") => {
    if (!Number.isFinite(value)) return "0";
    if (mode === "percent") {
      const rounded = Math.round(value * 100);
      return `${rounded > 0 ? "+" : ""}${rounded}%`;
    }
    if (mode === "rawpercent") {
      const rounded = Math.round(value);
      return `${rounded > 0 ? "+" : ""}${rounded}%`;
    }
    if (mode === "multiplier") {
      return `x${value.toFixed(2)}`;
    }
    if (mode === "fixed1") {
      return value % 1 === 0 ? String(Math.round(value)) : value.toFixed(1);
    }
    return String(Math.round(value));
  };

  const changedRows = statDefs
    .map((def) => {
      const currentValue = Number.isFinite(current[def.key]) ? current[def.key] : 0;
      const baselineValue = Number.isFinite(defaults[def.key]) ? defaults[def.key] : 0;
      if (Math.abs(currentValue - baselineValue) <= 1e-6) return null;
      return {
        key: def.key,
        label: t(`shop.stat.${def.key}.short`),
        value: formatStat(currentValue, def.format),
        delta: currentValue - baselineValue,
      };
    })
    .filter(Boolean);

  const chipWidth = 88;
  const chipHeight = 16;
  const chipGapX = 4;
  const chipGapY = 4;
  const chipsPerRow = Math.max(1, Math.floor((width + chipGapX) / (chipWidth + chipGapX)));

  if (changedRows.length === 0) {
    return;
  }

  ctx.save();
  ctx.textBaseline = "middle";
  for (let i = 0; i < changedRows.length; i += 1) {
    const rowIndex = Math.floor(i / chipsPerRow);
    const colIndex = i % chipsPerRow;
    const chipX = x + colIndex * (chipWidth + chipGapX);
    const chipY = y - chipHeight - rowIndex * (chipHeight + chipGapY);
    const row = changedRows[i];
    drawHudPanel(chipX, chipY, chipWidth, chipHeight);
    ctx.font = `700 8px ${HUD_FONT}`;
    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(198, 171, 132, 0.9)";
    ctx.fillText(row.label, chipX + 8, chipY + chipHeight * 0.5);
    ctx.font = `700 9px ${HUD_FONT}`;
    ctx.textAlign = "right";
    ctx.fillStyle = row.delta >= 0 ? "#8fe28f" : "#ff9b7d";
    ctx.fillText(row.value, chipX + chipWidth - 8, chipY + chipHeight * 0.5);
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

const CUTSCENE_PHASES = [
  { key: "intro", from: 0, to: 4, label: "Intro: сближение" },
  { key: "rumble", from: 4, to: 6.5, label: "Rumble: тревога" },
  { key: "collapse", from: 6.5, to: 10.5, label: "Collapse: обвал" },
  { key: "crush", from: 10.5, to: 11.5, label: "Crush: базу завалило" },
  { key: "findher", from: 11.5, to: 14, label: "Find Her: тьма" },
];

const CUTSCENE_TOTAL_TIME = CUTSCENE_PHASES[CUTSCENE_PHASES.length - 1].to;
const CUTSCENE_FIELD_SIZE = 15;

function getCutscenePhase(time) {
  for (const phase of CUTSCENE_PHASES) {
    if (time >= phase.from && time < phase.to) return phase;
  }
  return CUTSCENE_PHASES[CUTSCENE_PHASES.length - 1];
}

function getCutscenePhaseProgress(time, key) {
  const phase = CUTSCENE_PHASES.find((entry) => entry.key === key);
  if (!phase) return 0;
  return clamp((time - phase.from) / (phase.to - phase.from), 0, 1);
}

function setCutsceneCellOpen(x, y) {
  if (x < 1 || y < 1 || x >= GRID_W - 1 || y >= GRID_H - 1) return;
  const index = cellIndex(x, y);
  state.tunnelMask[index] = 1;
  state.hardness[index] = 0;
  state.health[index] = 0;
  state.metalMask[index] = 0;
  state.goldOreMask[index] = 0;
  state.perkMask[index] = 0;
  state.crystalMask[index] = 0;
  state.perkZoneMask[index] = -1;
  state.hazardMask[index] = 0;
  state.gasPocketMask[index] = 0;
  state.steamPocketMask[index] = 0;
  state.boulderPocketMask[index] = 0;
  state.microResourceMask[index] = 0;
  state.microResourceRevealedMask[index] = 0;
  state.visibleMask[index] = 1;
  state.visibleAlpha[index] = 1;
  state.visibleTargetAlpha[index] = 1;
}

function setCutsceneCellSolid(x, y, hardness = 4) {
  if (x < 1 || y < 1 || x >= GRID_W - 1 || y >= GRID_H - 1) return;
  const index = cellIndex(x, y);
  state.tunnelMask[index] = 0;
  state.hardness[index] = clamp(Math.round(hardness), 1, BLOCK_TYPES.length - 1);
  state.health[index] = BLOCK_TYPES[state.hardness[index]].hp;
  state.metalMask[index] = 0;
  state.goldOreMask[index] = 0;
  state.perkMask[index] = 0;
  state.crystalMask[index] = 0;
  state.perkZoneMask[index] = -1;
  state.hazardMask[index] = 0;
  state.hazardTriggeredMask[index] = 0;
  state.gasPocketMask[index] = 0;
  state.steamPocketMask[index] = 0;
  state.boulderPocketMask[index] = 0;
  state.microResourceMask[index] = 0;
  state.microResourceRevealedMask[index] = 0;
  state.visibleMask[index] = 1;
  state.visibleAlpha[index] = 1;
  state.visibleTargetAlpha[index] = 1;
}

function prepareCutsceneField() {
  state.tunnelMask.fill(1);
  state.hardness.fill(0);
  state.health.fill(0);
  state.visibleMask.fill(1);
  state.visibleAlpha.fill(1);
  state.visibleTargetAlpha.fill(1);
  state.perkMask.fill(0);
  state.crystalMask.fill(0);
  state.perkZoneMask.fill(-1);
  state.gasMask.fill(0);
  state.steamMask.fill(0);
  state.loopGoldMask.fill(0);
  state.droppedGoldMask.fill(0);
  state.xpPickupMask.fill(0);
  state.xpBonusPickupMask.fill(0);
  state.goldPickupMask.fill(0);
  state.goldBonusPickupMask.fill(0);
  state.hazardMask.fill(0);
  state.hazardTriggeredMask.fill(0);
  state.metalMask.fill(0);
  state.goldOreMask.fill(0);
  state.microResourceMask.fill(0);
  state.microResourceRevealedMask.fill(0);
  state.gasPocketMask.fill(0);
  state.steamPocketMask.fill(0);
  state.boulderPocketMask.fill(0);
  state.beaconMask.fill(0);
  state.blueprintMask.fill(0);
  state.safeDoorMask.fill(0);
  state.keyMask.fill(0);
  state.safeInteriorMask.fill(0);
  state.weakSpotMask.fill(0);
  state.pathTiles.length = 0;
  rebuildPathIndex();

  const half = Math.floor(CUTSCENE_FIELD_SIZE / 2);
  const centerX = clamp(START_X + 8, 1 + half, GRID_W - 2 - half);
  const centerY = clamp(START_Y + 6, 1 + half, GRID_H - 2 - half);
  for (let y = centerY - half; y <= centerY + half; y += 1) {
    for (let x = centerX - half; x <= centerX + half; x += 1) {
      setCutsceneCellOpen(x, y);
    }
  }

  state.base.x = centerX + 1;
  state.base.y = centerY;
  state.base.renderX = state.base.x;
  state.base.renderY = state.base.y;

  state.drill.x = centerX - 3;
  state.drill.y = centerY;
  state.drill.renderX = state.drill.x;
  state.drill.renderY = state.drill.y;
  state.drill.facingX = 1;
  state.drill.facingY = 0;
  state.drill.strikeEnergy = 0.15;
  state.drill.strikePhase = 0;

  state.beacons.length = 0;
  state.beaconWires.length = 0;
  state.beaconWireBreaks.length = 0;
  state.collapseWarnings.length = 0;
  state.pendingCollapseCount = 0;
  state.safes.length = 0;
  state.wormNests.length = 0;
  state.activeWorms.length = 0;
  state.boulders.length = 0;
  state.effects.length = 0;
  state.tileAnimations.length = 0;
  state.tileAnimDest.clear();

  state.baseFound = false;
  state.runTimeSec = 0;
  state.baseFoundRunTimeSec = 0;
  state.dead = false;
  state.outOfFuel = false;
  state.damageFlash = 0;
  state.levelUpFlash = 0;
  state.menuOpen = false;

  state.debugMapActive = true;
  state.debugMapGenerationPanelCollapsed = true;
  state.debugMapCamera.zoom = 1;
  state.cutscene = {
    time: 0,
    playing: true,
    heroStartX: state.drill.x,
    heroNearX: centerX - 0.8,
    heroFinalX: centerX - 1.6,
    heroY: centerY,
    baseX: state.base.x,
    baseY: state.base.y,
    baseBuried: false,
    fieldMinX: centerX - half,
    fieldMaxX: centerX + half,
    fieldMinY: centerY - half,
    fieldMaxY: centerY + half,
    cameraBaseX: centerX * TILE_SIZE - state.width * 0.5 + TILE_SIZE * 0.5,
    cameraBaseY: centerY * TILE_SIZE - state.height * 0.5 + TILE_SIZE * 0.4,
    blocks: [],
    sparks: [],
    warningSpawnAcc: 0,
  };
  state.debugMapCamera.x = state.cutscene.cameraBaseX;
  state.debugMapCamera.y = state.cutscene.cameraBaseY;
}

function addCutsceneFallingBlock(targetX = null, targetY = null) {
  const cut = state.cutscene;
  if (!cut) return;
  let fromX;
  let fromY;
  if (Number.isFinite(targetX) && Number.isFinite(targetY)) {
    fromX = targetX + (Math.random() - 0.5) * 0.35;
    fromY = targetY - (4.8 + Math.random() * 2.2);
  } else {
    const side = Math.random() < 0.5 ? -1 : 1;
    fromX = cut.baseX + side * (4.2 + Math.random() * 2.8);
    fromY = cut.baseY - 5.5 - Math.random() * 3;
  }
  cut.blocks.push({
    x: fromX,
    y: fromY,
    vx: (Math.random() - 0.5) * 2.2,
    vy: 2.4 + Math.random() * 2.6,
    rot: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 2.8,
    tier: clamp(2 + Math.floor(Math.random() * 3), 1, BLOCK_TYPES.length - 1),
    variant: Math.floor(Math.random() * BLOCK_VARIANTS),
  });
}

function pickCutsceneCollapseTarget() {
  const cut = state.cutscene;
  if (!cut) return null;
  const taken = new Set();
  for (const warning of state.collapseWarnings) {
    if (!warning?.__cutscene || !Array.isArray(warning.cells)) continue;
    for (const cell of warning.cells) {
      taken.add(`${cell.x},${cell.y}`);
    }
  }
  const forbidden = new Set([
    `${Math.round(state.drill.renderX)},${Math.round(state.drill.renderY)}`,
    `${cut.baseX},${cut.baseY}`,
  ]);
  const anchorX = Math.round((state.drill.renderX + cut.baseX) * 0.5);
  const anchorY = Math.round((state.drill.renderY + cut.baseY) * 0.5);
  const offsets = [
    { x: 0, y: -1 }, { x: -1, y: -1 }, { x: 1, y: -1 },
    { x: -2, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 1 },
    { x: -3, y: 1 }, { x: 3, y: 1 }, { x: -2, y: -2 },
    { x: 2, y: -2 }, { x: 0, y: 2 }, { x: -1, y: 2 }, { x: 1, y: 2 },
  ];
  for (let i = offsets.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [offsets[i], offsets[j]] = [offsets[j], offsets[i]];
  }
  for (const offset of offsets) {
    const x = anchorX + offset.x;
    const y = anchorY + offset.y;
    if (x < 1 || y < 1 || x >= GRID_W - 1 || y >= GRID_H - 1) continue;
    const key = `${x},${y}`;
    if (taken.has(key) || forbidden.has(key)) continue;
    const index = cellIndex(x, y);
    if (!state.tunnelMask[index]) continue;
    return { x, y };
  }
  return null;
}

function spawnCutsceneCollapseWarning() {
  const target = pickCutsceneCollapseTarget();
  if (!target) return;
  state.collapseWarnings.push({
    __cutscene: true,
    cells: [target],
    timer: COLLAPSE_WARNING_DURATION,
    duration: COLLAPSE_WARNING_DURATION,
    hardness: 4,
    resolveIndex: 0,
    landDelay: 0,
    heroDamaged: false,
    clearPath: false,
  });
  state.cameraShake.amplitude = Math.max(state.cameraShake.amplitude, 0.8);
}

function updateCutsceneCollapseWarnings(dt) {
  for (let i = state.collapseWarnings.length - 1; i >= 0; i -= 1) {
    const warning = state.collapseWarnings[i];
    if (!warning?.__cutscene) continue;
    warning.timer -= dt;
    if (warning.timer > 0) continue;
    const cell = warning.cells?.[0];
    if (cell) {
      setCutsceneCellSolid(cell.x, cell.y, warning.hardness || 4);
      spawnBreakEffect(cell.x, cell.y, warning.hardness || 4, "collapse");
      addCutsceneFallingBlock(cell.x, cell.y);
      state.cameraShake.amplitude = Math.max(state.cameraShake.amplitude, 1.2);
      state.visibilityDirty = true;
    }
    state.collapseWarnings.splice(i, 1);
  }
}

function updateCutsceneMode(dt) {
  const cut = state.cutscene;
  if (!cut) return;

  if (cut.playing) {
    cut.time += dt;
    if (cut.time >= CUTSCENE_TOTAL_TIME) {
      cut.time = CUTSCENE_TOTAL_TIME;
      cut.playing = false;
    }
  }

  const phase = getCutscenePhase(cut.time);
  const introP = getCutscenePhaseProgress(cut.time, "intro");
  const rumbleP = getCutscenePhaseProgress(cut.time, "rumble");
  const collapseP = getCutscenePhaseProgress(cut.time, "collapse");
  const crushP = getCutscenePhaseProgress(cut.time, "crush");

  const heroMidX = cut.heroStartX + (cut.heroNearX - cut.heroStartX) * introP;
  const heroX = heroMidX;
  const heroY = cut.heroY;
  state.drill.renderX = heroX;
  state.drill.renderY = heroY;
  state.drill.x = Math.round(heroX);
  state.drill.y = Math.round(heroY);
  state.drill.facingX = Math.sign(cut.baseX - heroX) || 1;
  state.drill.facingY = 0;
  state.drill.strikePhase += dt * 9;
  state.drill.strikeEnergy = phase.key === "collapse" ? 0.5 : 0.2;

  state.base.renderX = cut.baseX;
  state.base.renderY = cut.baseY;
  cut.baseBuried = phase.key === "crush";

  const shake = rumbleP * 5 + collapseP * 12 + crushP * 20;
  state.debugMapCamera.x = cut.cameraBaseX + (Math.random() - 0.5) * shake;
  state.debugMapCamera.y = cut.cameraBaseY + (Math.random() - 0.5) * shake * 0.8;

  if (phase.key === "rumble" || phase.key === "collapse" || phase.key === "crush") {
    const warningRate = phase.key === "crush" ? 2.6 : phase.key === "collapse" ? 1.45 : 1.05;
    cut.warningSpawnAcc += dt * warningRate;
    while (cut.warningSpawnAcc >= 1) {
      cut.warningSpawnAcc -= 1;
      spawnCutsceneCollapseWarning();
    }
  }
  updateCutsceneCollapseWarnings(dt);

  for (const block of cut.blocks) {
    block.x += block.vx * dt;
    block.y += block.vy * dt;
    block.vy += 7.2 * dt;
    block.rot += block.vr * dt;
  }
  cut.blocks = cut.blocks.filter((block) => block.y < cut.baseY + 8);

  for (const spark of cut.sparks) {
    spark.age += dt;
    spark.x += spark.vx * dt;
    spark.y += spark.vy * dt;
    spark.vy += 8.6 * dt;
  }
  cut.sparks = cut.sparks.filter((spark) => spark.age < spark.life);
}

function renderCutsceneBubble(camera, tileX, tileY, emoji, scale = 1, zoom = 1) {
  if (!emoji) return;
  const ctx = state.ctx;
  const px = (tileX * TILE_SIZE + TILE_SIZE * 0.5 - camera.x) * zoom;
  const py = (tileY * TILE_SIZE - camera.y - 34) * zoom;
  const w = 50 * scale * zoom;
  const h = 38 * scale * zoom;
  ctx.save();
  ctx.fillStyle = "rgba(255, 248, 233, 0.94)";
  ctx.strokeStyle = "rgba(41, 25, 14, 0.82)";
  ctx.lineWidth = 2 * zoom;
  buildRoundedRectPath(ctx, px - w * 0.5, py - h * 0.5, w, h, 9 * scale);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(px - 7 * scale * zoom, py + h * 0.5 - zoom);
  ctx.lineTo(px - scale * zoom, py + h * 0.5 + 10 * scale * zoom);
  ctx.lineTo(px + 7 * scale * zoom, py + h * 0.5 - zoom);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#21130b";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `${Math.floor(22 * scale * zoom)}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
  ctx.fillText(emoji, px, py);
  ctx.restore();
}

function renderCutsceneWorldOverlay(camera) {
  const cut = state.cutscene;
  if (!state.cutsceneModeActive || !cut) return;
  const ctx = state.ctx;
  const phase = getCutscenePhase(cut.time);

  for (const block of cut.blocks) {
    const sprite = state.sprites.blocks[block.tier]?.[block.variant];
    if (!sprite) continue;
    const sx = block.x * TILE_SIZE - camera.x;
    const sy = block.y * TILE_SIZE - camera.y;
    ctx.save();
    ctx.translate(sx + TILE_SIZE * 0.5, sy + TILE_SIZE * 0.5);
    ctx.rotate(block.rot);
    ctx.drawImage(sprite, -TILE_SIZE * 0.5, -TILE_SIZE * 0.5, TILE_SIZE, TILE_SIZE);
    ctx.restore();
  }

  if (cut.baseBuried) {
    const burySprite = state.sprites.blocks[4]?.[2] || state.sprites.blocks[3]?.[1];
    if (burySprite) {
      const sx = cut.baseX * TILE_SIZE - camera.x - TILE_SIZE * 0.62;
      const sy = cut.baseY * TILE_SIZE - camera.y - TILE_SIZE * 0.52;
      ctx.globalAlpha = phase.key === "spark" ? 0.88 : 1;
      ctx.drawImage(burySprite, sx, sy, TILE_SIZE * 2.2, TILE_SIZE * 1.8);
      ctx.globalAlpha = 1;
    }
  }

  for (const spark of cut.sparks) {
    const t = 1 - spark.age / spark.life;
    const px = spark.x * TILE_SIZE - camera.x;
    const py = spark.y * TILE_SIZE - camera.y;
    ctx.fillStyle = `rgba(255, ${Math.floor(172 + 83 * t)}, 88, ${t})`;
    ctx.beginPath();
    ctx.arc(px, py, 1.6 + t * 1.8, 0, Math.PI * 2);
    ctx.fill();
  }
}

function renderCutsceneDialogBubbles(camera, zoom = 1) {
  const cut = state.cutscene;
  if (!state.cutsceneModeActive || !cut) return;
  const phase = getCutscenePhase(cut.time);
  let heroEmoji = "🙂";
  let baseEmoji = "🙂";
  if (phase.key === "intro") {
    heroEmoji = getCutscenePhaseProgress(cut.time, "intro") < 0.6 ? "😍" : "💖";
    baseEmoji = getCutscenePhaseProgress(cut.time, "intro") < 0.6 ? "🥰" : "💖";
  } else if (phase.key === "rumble") {
    const rumbleP = getCutscenePhaseProgress(cut.time, "rumble");
    if (rumbleP < 0.38) {
      heroEmoji = "💖";
      baseEmoji = "💖";
    } else {
      heroEmoji = "😨";
      baseEmoji = "😰";
    }
  } else if (phase.key === "collapse") {
    heroEmoji = "😱";
    baseEmoji = "😱";
  } else if (phase.key === "crush") {
    heroEmoji = "😵";
    baseEmoji = "";
  } else if (phase.key === "findher") {
    heroEmoji = "😡";
    baseEmoji = "";
  }

  renderCutsceneBubble(camera, state.drill.renderX, state.drill.renderY, heroEmoji, 1, zoom);
  renderCutsceneBubble(camera, cut.baseX, cut.baseY, baseEmoji, 1.04, zoom);
}

function renderCutsceneFindHerOverlay() {
  const cut = state.cutscene;
  if (!state.cutsceneModeActive || !cut) return;
  const phase = getCutscenePhase(cut.time);
  if (phase.key !== "findher") return;
  const p = getCutscenePhaseProgress(cut.time, "findher");
  const ctx = state.ctx;
  ctx.save();
  ctx.fillStyle = `rgba(0,0,0,${0.9 + p * 0.1})`;
  ctx.fillRect(0, 0, state.width, state.height);
  ctx.restore();
}

function renderCutsceneScreenFx(camera) {
  const cut = state.cutscene;
  if (!state.cutsceneModeActive || !cut) return;
  const ctx = state.ctx;
  const phase = getCutscenePhase(cut.time);
  const fieldCenterX = ((cut.fieldMinX + cut.fieldMaxX + 1) * 0.5) * TILE_SIZE - camera.x;
  const fieldCenterY = ((cut.fieldMinY + cut.fieldMaxY + 1) * 0.5) * TILE_SIZE - camera.y;
  const innerRadius = CUTSCENE_FIELD_SIZE * TILE_SIZE * 0.36;
  const outerRadius = CUTSCENE_FIELD_SIZE * TILE_SIZE * 0.56;

  ctx.save();
  const arenaFade = ctx.createRadialGradient(
    fieldCenterX,
    fieldCenterY,
    innerRadius,
    fieldCenterX,
    fieldCenterY,
    outerRadius,
  );
  arenaFade.addColorStop(0, "rgba(0,0,0,0)");
  arenaFade.addColorStop(0.72, "rgba(0,0,0,0.18)");
  arenaFade.addColorStop(1, "rgba(0,0,0,0.92)");
  ctx.fillStyle = arenaFade;
  ctx.fillRect(0, 0, state.width, state.height);
  ctx.restore();

  if (phase.key === "collapse" || phase.key === "crush") {
    const t = phase.key === "collapse" ? getCutscenePhaseProgress(cut.time, "collapse") : 1;
    ctx.fillStyle = `rgba(180, 40, 24, ${0.12 + t * 0.28})`;
    ctx.fillRect(0, 0, state.width, state.height);
  }

  if (phase.key === "crush") {
    const t = getCutscenePhaseProgress(cut.time, "crush");
    ctx.fillStyle = `rgba(0, 0, 0, ${0.72 + t * 0.28})`;
    ctx.fillRect(0, 0, state.width, state.height);
  }

}

function updateCutsceneControlsUi() {
  const cut = state.cutscene;
  if (!cut) return;
  const phase = getCutscenePhase(cut.time);
  const status = document.getElementById("cutStatus");
  const pause = document.getElementById("cutPause");
  const timeline = document.getElementById("cutTimeline");
  const findHerButton = document.getElementById("cutFindHerButton");
  if (status) status.textContent = `Phase: ${phase.label} (${cut.time.toFixed(2)}s)`;
  if (pause) pause.textContent = cut.playing ? "⏸ Pause" : "▶ Play";
  if (timeline) timeline.value = String(cut.time);
  if (findHerButton) {
    findHerButton.textContent = t("ui.find_her");
    const show = cut.time >= CUTSCENE_TOTAL_TIME - 0.02;
    findHerButton.hidden = !show;
    findHerButton.style.display = show ? "inline-flex" : "none";
  }
}

function resetCutsceneTo(time = 0) {
  const cut = state.cutscene;
  if (!cut) return;
  state.tunnelMask.fill(1);
  state.hardness.fill(0);
  state.health.fill(0);
  state.visibleMask.fill(1);
  state.visibleAlpha.fill(1);
  state.visibleTargetAlpha.fill(1);
  state.perkMask.fill(0);
  state.crystalMask.fill(0);
  state.perkZoneMask.fill(-1);
  state.metalMask.fill(0);
  state.goldOreMask.fill(0);
  state.microResourceMask.fill(0);
  state.microResourceRevealedMask.fill(0);
  state.gasPocketMask.fill(0);
  state.steamPocketMask.fill(0);
  state.boulderPocketMask.fill(0);
  state.beaconMask.fill(0);
  state.blueprintMask.fill(0);
  state.safeDoorMask.fill(0);
  state.keyMask.fill(0);
  state.safeInteriorMask.fill(0);
  for (let y = cut.fieldMinY; y <= cut.fieldMaxY; y += 1) {
    for (let x = cut.fieldMinX; x <= cut.fieldMaxX; x += 1) {
      setCutsceneCellOpen(x, y);
    }
  }
  state.pathTiles.length = 0;
  rebuildPathIndex();
  state.collapseWarnings.length = 0;
  cut.time = clamp(time, 0, CUTSCENE_TOTAL_TIME);
  cut.blocks.length = 0;
  cut.sparks.length = 0;
  cut.warningSpawnAcc = 0;
  cut.baseBuried = false;
}

function bindCutsceneControls() {
  if (state.cutsceneControlsBound) return;
  state.cutsceneControlsBound = true;

  document.getElementById("cutFindHerButton")?.addEventListener("click", () => {
    if (!state.cutsceneModeActive || !state.cutscene) return;
    if (state.cutsceneLaunchesGame) {
      markIntroCutsceneSeen();
      startGameplayRun();
      return;
    }
    state.cutscene.playing = false;
    state.cameraShake.amplitude = Math.max(state.cameraShake.amplitude, 1.5);
    state.cameraShake.time = Math.max(state.cameraShake.time, 0.35);
  });

  document.getElementById("cutRestart")?.addEventListener("click", () => {
    if (!state.cutscene) return;
    state.cutscene.playing = true;
    resetCutsceneTo(0);
    updateCutsceneControlsUi();
  });

  document.getElementById("cutPause")?.addEventListener("click", () => {
    if (!state.cutscene) return;
    state.cutscene.playing = !state.cutscene.playing;
    updateCutsceneControlsUi();
  });

  document.getElementById("cutTimeline")?.addEventListener("input", (event) => {
    if (!state.cutscene) return;
    resetCutsceneTo(Number(event.target.value) || 0);
    state.cutscene.playing = false;
    updateCutsceneControlsUi();
  });

  for (const button of document.querySelectorAll("[data-cut-jump]")) {
    button.addEventListener("click", () => {
      if (!state.cutscene) return;
      state.cutscene.playing = false;
      resetCutsceneTo(Number(button.getAttribute("data-cut-jump") || 0));
      updateCutsceneControlsUi();
    });
  }

  window.addEventListener("keydown", (event) => {
    if (!state.cutsceneModeActive || !state.cutscene) return;
    if (event.code === "Space") {
      event.preventDefault();
      state.cutscene.playing = !state.cutscene.playing;
      updateCutsceneControlsUi();
      return;
    }
    const idx = Number(event.key) - 1;
    if (Number.isInteger(idx) && idx >= 0 && idx < CUTSCENE_PHASES.length) {
      const phase = CUTSCENE_PHASES[idx];
      if (!phase) return;
      state.cutscene.playing = false;
      resetCutsceneTo(phase.from);
      updateCutsceneControlsUi();
    }
  });
}

function cutsceneFrame(ts) {
  if (!state.cutsceneModeActive) {
    return;
  }
  if (state.fatalErrorText) {
    syncFatalErrorOverlay();
    return;
  }

  try {
    if (!state.lastTs) state.lastTs = ts;
    let delta = Math.min(ts - state.lastTs, MAX_FRAME_MS);
    state.lastTs = ts;
    if (state.cutscene?.playing === false) delta = 0;
    updateCutsceneMode(delta / 1000);
    render();
    updateCutsceneControlsUi();
    if (state.cutsceneModeActive) {
      requestAnimationFrame(cutsceneFrame);
    }
  } catch (error) {
    reportFatalError(error, "cutsceneFrame");
  }
}

function initCutsceneMode() {
  bindFatalErrorHandlers();
  try {
    ensureCoreReady();
    setupField();
    prepareCutsceneField();
    state.cutsceneModeActive = true;
    state.cutsceneLaunchesGame = false;
    document.querySelectorAll(".app-shell > *:not(#game):not(#cutControls):not(#fatalError)").forEach((node) => {
      node.hidden = true;
    });
    bindCutsceneControls();
    updateCutsceneControlsUi();
    requestAnimationFrame(cutsceneFrame);
  } catch (error) {
    reportFatalError(error, "initCutsceneMode");
  }
}

// ── Debug map mode (?debug-map query param) ──────────────────────────────────
function initDebugMapMode() {
  try {
    // Hide all HTML UI overlays except the generation editor and fatal error, keep canvas
    document.querySelectorAll(".app-shell > *:not(#game):not(#debugPerkMenu):not(#fatalError)").forEach((el) => { el.hidden = true; });
    state.canvas.style.cssText = "position:fixed;top:0;left:0;cursor:grab;touch-action:none;display:block;";

    // Init game subsystems (sprites + map) without starting the game loop
    loadStoredGenerationConfig();
    state.ctx = state.canvas.getContext("2d");
    state.sprites = createSpriteAtlas();
    resize();
    setupField(); // generates map using seed from URL (?seed=) or random
    showDebugMapGenerationPanel();

    // Enter debug map mode — getCamera() and getCameraZoom() will use debugMapCamera
    state.debugMapActive = true;
    revealFullMapInDebugMode();

    // Initial camera: fit whole map on screen, centered
    const mapW = GRID_W * TILE_SIZE;
    const mapH = GRID_H * TILE_SIZE;
    const fitZoom = Math.min(state.width / mapW, state.height / mapH) * 0.97;
    state.debugMapCamera.zoom = fitZoom;
    state.debugMapCamera.x = (mapW - state.width / fitZoom) / 2;
    state.debugMapCamera.y = (mapH - state.height / fitZoom) / 2;

    // Marker layers — drawn on top of real game tiles
    const MARKERS = [
      { id: "beacon",   label: t("map.beacon"),   color: "#ff8800", visible: true },
      { id: "blueprint", label: t("map.blueprint"), color: "#ffff50", visible: true },
      { id: "safe",     label: t("map.safe"),     color: "#8888ff", visible: true },
      { id: "worm",     label: t("map.worm"),     color: "#ff4444", visible: true },
      { id: "boulder",  label: t("map.boulder"),  color: "#c8a040", visible: true },
      { id: "base",     label: t("map.base"),     color: "#00ff88", visible: true },
      { id: "start",    label: t("map.start"),    color: "#ffffff", visible: true },
    ];
    function markerOn(id) { return MARKERS.find((m) => m.id === id)?.visible ?? true; }

  // Draw colored dot markers on top of the real tile render
  function drawMarkers() {
    const ctx = state.ctx;
    const zoom = state.debugMapCamera.zoom;
    const camX = state.debugMapCamera.x;
    const camY = state.debugMapCamera.y;
    const R = TILE_SIZE * 0.55;

    ctx.save();
    ctx.scale(zoom, zoom);

    function dot(tx, ty, fill, outline) {
      const sx = (tx + 0.5) * TILE_SIZE - camX;
      const sy = (ty + 0.5) * TILE_SIZE - camY;
      ctx.beginPath();
      ctx.arc(sx, sy, R, 0, Math.PI * 2);
      ctx.fillStyle = fill + "bb";
      ctx.fill();
      ctx.strokeStyle = outline;
      ctx.lineWidth = R * 0.4;
      ctx.stroke();
    }

    if (markerOn("beacon"))   state.beacons.forEach((b) => dot(b.x, b.y, "#ff8800", "#fff"));
    if (markerOn("blueprint")) {
      for (let y = 0; y < GRID_H; y++)
        for (let x = 0; x < GRID_W; x++)
          if (state.blueprintMask[cellIndex(x, y)]) dot(x, y, "#ffff50", "#000");
    }
    if (markerOn("safe"))  state.safes.forEach((s) => dot(s.x, s.y, "#8888ff", "#fff"));
    if (markerOn("worm"))  state.wormNests.forEach((n) => dot(n.x, n.y, "#ff4444", "#faa"));
    if (markerOn("boulder")) {
      for (let y = 0; y < GRID_H; y++)
        for (let x = 0; x < GRID_W; x++)
          if (state.boulderPocketMask[cellIndex(x, y)]) dot(x, y, "#c8a040", "#fff");
    }
    if (markerOn("base") && state.base) dot(state.base.x, state.base.y, "#00ff88", "#fff");
    if (markerOn("start")) dot(START_X, START_Y, "#ffffff", "#000");

    // Depth level bounds
    ctx.save();
    ctx.setLineDash([6, 4]);
    ctx.lineWidth = 1 / zoom;
    for (const lvl of DEPTH_LEVELS) {
      ctx.strokeStyle = "rgba(255,200,80,0.45)";
      ctx.strokeRect(
        lvl.xMin * TILE_SIZE - camX,
        lvl.startY * TILE_SIZE - camY,
        (lvl.xMax - lvl.xMin + 1) * TILE_SIZE,
        (lvl.endY - lvl.startY + 1) * TILE_SIZE,
      );
    }
    ctx.setLineDash([]);
    // Level labels (left edge) — constant 12px screen size
    const labelPx = 12 / zoom;
    ctx.font = `bold ${labelPx}px monospace`;
    ctx.textBaseline = "top";
    for (const lvl of DEPTH_LEVELS) {
      const labelY = lvl.startY * TILE_SIZE - camY + 2 / zoom;
      const labelX = lvl.xMin * TILE_SIZE - camX + 4 / zoom;
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillText(`L${lvl.level}  ${lvl.xMin}-${lvl.xMax}  y${lvl.startY}-${lvl.endY}`, labelX, labelY + 1 / zoom);
      ctx.fillStyle = "rgba(255,200,80,0.85)";
      ctx.fillText(`L${lvl.level}  ${lvl.xMin}-${lvl.xMax}  y${lvl.startY}-${lvl.endY}`, labelX, labelY);
    }
    ctx.restore();

    ctx.restore();
  }

    let debugMapRenderQueued = false;
    function scheduleDebugMapRender() {
      if (debugMapRenderQueued) {
        return;
      }
      debugMapRenderQueued = true;
      requestAnimationFrame(() => {
        debugMapRenderQueued = false;
        render();
        drawMarkers();
      });
    }
    state.debugMapRequestRender = scheduleDebugMapRender;
    scheduleDebugMapRender();

    // ── Pan ──
    let dragging = false, dragSX = 0, dragSY = 0, dragCX = 0, dragCY = 0;
    state.canvas.addEventListener("mousedown", (e) => {
    dragging = true; state.canvas.style.cursor = "grabbing";
    dragSX = e.clientX; dragSY = e.clientY;
    dragCX = state.debugMapCamera.x; dragCY = state.debugMapCamera.y;
  });
  window.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    const zoom = state.debugMapCamera.zoom;
    state.debugMapCamera.x = dragCX - (e.clientX - dragSX) / zoom;
    state.debugMapCamera.y = dragCY - (e.clientY - dragSY) / zoom;
    scheduleDebugMapRender();
  });
  window.addEventListener("mouseup", () => { dragging = false; state.canvas.style.cursor = "grab"; });

  // ── Scroll zoom ──
  state.canvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
    const oldZoom = state.debugMapCamera.zoom;
    const newZoom = Math.max(fitZoom * 0.4, Math.min(oldZoom * factor, fitZoom * 60));
    // Keep point under mouse stationary
    const worldX = state.debugMapCamera.x + e.clientX / oldZoom;
    const worldY = state.debugMapCamera.y + e.clientY / oldZoom;
    state.debugMapCamera.zoom = newZoom;
    state.debugMapCamera.x = worldX - e.clientX / newZoom;
    state.debugMapCamera.y = worldY - e.clientY / newZoom;
    scheduleDebugMapRender();
  }, { passive: false });

  // ── Touch pan + pinch zoom ──
  let lastDist = 0, lastMX = 0, lastMY = 0;
  state.canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    if (e.touches.length === 1) {
      dragging = true;
      dragSX = e.touches[0].clientX; dragSY = e.touches[0].clientY;
      dragCX = state.debugMapCamera.x; dragCY = state.debugMapCamera.y;
    } else if (e.touches.length === 2) {
      dragging = false;
      lastDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      lastMX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      lastMY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
    }
  }, { passive: false });
  state.canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    const zoom = state.debugMapCamera.zoom;
    if (e.touches.length === 1 && dragging) {
      state.debugMapCamera.x = dragCX - (e.touches[0].clientX - dragSX) / zoom;
      state.debugMapCamera.y = dragCY - (e.touches[0].clientY - dragSY) / zoom;
      scheduleDebugMapRender();
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      const mx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const my = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      const newZoom = Math.max(fitZoom * 0.4, Math.min(zoom * (dist / lastDist), fitZoom * 60));
      const worldX = state.debugMapCamera.x + lastMX / zoom;
      const worldY = state.debugMapCamera.y + lastMY / zoom;
      state.debugMapCamera.zoom = newZoom;
      state.debugMapCamera.x = worldX - mx / newZoom;
      state.debugMapCamera.y = worldY - my / newZoom;
      lastDist = dist; lastMX = mx; lastMY = my;
      scheduleDebugMapRender();
    }
  }, { passive: false });
  state.canvas.addEventListener("touchend", (e) => { if (e.touches.length < 2) dragging = false; });

  // ── Navigation helpers ──
  // Returns sorted list of {x,y} tile coords for a given marker id
  function getLocations(id) {
    switch (id) {
      case "beacon":   return state.beacons.map((b) => ({ x: b.x, y: b.y }));
      case "blueprint": {
        const locs = [];
        for (let y = 0; y < GRID_H; y++)
          for (let x = 0; x < GRID_W; x++)
            if (state.blueprintMask[cellIndex(x, y)]) locs.push({ x, y });
        return locs;
      }
      case "safe":    return state.safes.map((s) => ({ x: s.x, y: s.y }));
      case "worm":    return state.wormNests.map((n) => ({ x: n.x, y: n.y }));
      case "boulder": {
        const locs = [];
        for (let y = 0; y < GRID_H; y++)
          for (let x = 0; x < GRID_W; x++)
            if (state.boulderPocketMask[cellIndex(x, y)]) locs.push({ x, y });
        return locs;
      }
      case "base":  return state.base ? [{ x: state.base.x, y: state.base.y }] : [];
      case "start": return [{ x: START_X, y: START_Y }];
      default:      return [];
    }
  }

  // Navigate camera to tile (tx, ty), keeping current zoom or zooming in if too far out
  function goTo(tx, ty) {
    const targetZoom = Math.max(state.debugMapCamera.zoom, fitZoom * 4);
    state.debugMapCamera.zoom = targetZoom;
    state.debugMapCamera.x = (tx + 0.5) * TILE_SIZE - state.width  / (2 * targetZoom);
    state.debugMapCamera.y = (ty + 0.5) * TILE_SIZE - state.height / (2 * targetZoom);
    scheduleDebugMapRender();
  }

  // ── Legend overlay ──
  const legend = document.createElement("div");
  legend.style.cssText = [
    "position:fixed;top:12px;right:12px;z-index:100;",
    "background:rgba(15,11,9,0.92);border:1px solid #3a2e20;border-radius:8px;",
    "padding:10px 12px;color:#d79f49;font:12px/1.6 monospace;",
    "display:flex;flex-direction:column;gap:2px;min-width:160px;",
  ].join("");
  legend.innerHTML = `<div style="color:#f1dfb6;font-weight:bold;margin-bottom:4px">Seed: ${state.worldSeed}</div>`;

  const navIndex = {};
  for (const marker of MARKERS) {
    navIndex[marker.id] = 0;

    const row = document.createElement("div");
    row.style.cssText = "display:flex;align-items:center;gap:6px;";

    // Toggle button (swatch + label)
    const toggleBtn = document.createElement("button");
    toggleBtn.style.cssText = "display:flex;align-items:center;gap:7px;background:none;border:none;cursor:pointer;color:#d79f49;font:12px monospace;padding:2px 0;text-align:left;flex:1;min-width:0;";
    const swatch = document.createElement("span");
    swatch.style.cssText = `width:12px;height:12px;border-radius:50%;flex-shrink:0;background:${marker.color};`;
    const labelEl = document.createElement("span");
    labelEl.style.cssText = "overflow:hidden;text-overflow:ellipsis;white-space:nowrap;";
    labelEl.textContent = marker.label;
    toggleBtn.appendChild(swatch); toggleBtn.appendChild(labelEl);

    function updateToggle(m, s, b) {
      b.style.opacity = m.visible ? "1" : "0.35";
      s.style.background = m.visible ? m.color : "#2a2a2a";
    }
    updateToggle(marker, swatch, toggleBtn);
    toggleBtn.addEventListener("click", () => {
      marker.visible = !marker.visible;
      updateToggle(marker, swatch, toggleBtn);
      scheduleDebugMapRender();
    });

    // Go-to button
    const gotoBtn = document.createElement("button");
    gotoBtn.style.cssText = "background:none;border:1px solid #3a2e20;border-radius:3px;cursor:pointer;color:#a07840;font:10px monospace;padding:1px 5px;flex-shrink:0;white-space:nowrap;";
    gotoBtn.textContent = "→";
    gotoBtn.title = "Go to next";
    gotoBtn.addEventListener("click", () => {
      const locs = getLocations(marker.id);
      if (!locs.length) return;
      const idx = navIndex[marker.id] % locs.length;
      goTo(locs[idx].x, locs[idx].y);
      navIndex[marker.id] = (idx + 1) % locs.length;
      gotoBtn.textContent = `→ ${idx + 1}/${locs.length}`;
    });

    row.appendChild(toggleBtn);
    row.appendChild(gotoBtn);
    legend.appendChild(row);
  }
  document.body.appendChild(legend);

  // Handle window resize
  window.addEventListener("resize", () => {
    resize();
    // Recalculate camera to keep map centered
    const newFitZoom = Math.min(state.width / mapW, state.height / mapH) * 0.97;
    if (state.debugMapCamera.zoom <= fitZoom * 1.01) {
      state.debugMapCamera.zoom = newFitZoom;
      state.debugMapCamera.x = (mapW - state.width / newFitZoom) / 2;
      state.debugMapCamera.y = (mapH - state.height / newFitZoom) / 2;
    }
    scheduleDebugMapRender();
    });
  } catch (error) {
    reportFatalError(error, "initDebugMapMode");
  }
}

if (new URLSearchParams(location.search).has("debug-map")) {
  initDebugMapMode();
} else if (CUTSCENE_MODE) {
  initCutsceneMode();
} else {
  initMainMenuMode();
}
