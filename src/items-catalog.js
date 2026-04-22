import { t } from "./i18n.js";

export const RARITY = {
  COMMON: 1,
  UNCOMMON: 2,
  RARE: 3,
  LEGENDARY: 4,
};

export const RARITY_NAMES = new Proxy({}, {
  get(_, key) { return t(`rarity.${key}`); },
});

export const RARITY_COLORS = {
  1: "#aaa",
  2: "#4488ff",
  3: "#aa44ff",
  4: "#ff4444",
};

export const RARITY_EFFECT_MULT = {
  1: 1,
  2: 1.5,
  3: 2,
  4: 3,
};

const CATEGORY_DEFS = [
  { id: "basic",        icon: "D",  inDevelopment: false },
  { id: "economy",      icon: "●",  inDevelopment: true },
  { id: "maintenance",  icon: "💧", inDevelopment: true },
  { id: "heat",         icon: "🔥", inDevelopment: true },
  { id: "выживание",    icon: "❤️", inDevelopment: true },
  { id: "поиск_бреши",  icon: "🎯", inDevelopment: false },
  { id: "ракеты",       icon: "🚀", inDevelopment: true },
  { id: "контур",       icon: "⚡", inDevelopment: true },
  { id: "алхимия",      icon: "⚗️", inDevelopment: false },
];

export const CATEGORIES = CATEGORY_DEFS.map(c => ({
  ...c,
  get name() { return t(`category.${c.id}`); },
}));

export const INITIAL_CATEGORIES = ["basic"];
export const TAG_SYNERGIES = {};

export const ALL_EQUIPMENT = [
  {
    id: "thermo_drill",
    type: "equipment",
    name: "Термобур",
    icon: "🔥",
    desc: "Урон 20 (+15% dmg). +1 урона за каждые 10 heat.",
    category: "heat",
    tags: ["heat"],
    minRarity: 2,
  },
  {
    id: "basic_drill",
    type: "equipment",
    name: "Просто дрель",
    icon: "D",
    desc: "Урон 10 (10% dmg).",
    category: "basic",
    tags: ["basic"],
    minRarity: 1,
  },
  {
    id: "blast_drill",
    type: "equipment",
    name: "Взрывобур",
    icon: "💣",
    desc: "Урон 6 (+30% от explosionPower).",
    category: "basic",
    tags: ["basic"],
    minRarity: 1,
  },
  {
    id: "tradeoff_drill",
    type: "equipment",
    name: "Разменный бур",
    icon: "⚔️",
    desc: "Урон 16 (+10% от drillPower). −30% урона по бреши.",
    category: "basic",
    tags: ["basic"],
    minRarity: 1,
    effect: [
      { stat: "weakSpotMult", effectByRarity: [null, -0.3, -0.3, -0.3, -0.3] },
    ],
  },
  {
    id: "fragile_drill",
    type: "equipment",
    name: "Хрупкий бур",
    icon: "🪟",
    desc: "Урон 10 (10% dmg). +10% скорость пока есть броня.",
    category: "выживание",
    tags: ["выживание"],
    minRarity: 1,
  },
  {
    id: "lucky_pickaxe",
    type: "equipment",
    name: "Кирка счастливчика",
    icon: "⛏️",
    desc: "Урон 10 (10% dmg, 10% luck). При ударе по золотой жиле увеличит ее ценность на 1.",
    category: "economy",
    tags: ["economy"],
    minRarity: 1,
  },
  {
    id: "shard_drill",
    type: "equipment",
    name: "Осколочный бур",
    icon: "💥",
    desc: "Урон 8. +4% шанс бреши. Попадание в брешь вызывает взрыв.",
    category: "basic",
    tags: ["basic"],
    minRarity: 1,
    effect: [
      { stat: "shardDrillLevel", effectByRarity: [null, 1, 2, 3, 4] },
      { stat: "weakSpotChance", effectByRarity: [null, 0.04, 0.06, 0.08, 0.10] },
    ],
  },

  // ── Переработчик топлива / Адреналин / Рудный инжектор ─────────────────────
  {
    id: "fuel_converter",
    type: "equipment",
    name: "Переработчик топлива",
    icon: "♻️",
    desc: "Пополнение сверх макс. топлива → форсаж 3 сек.",
    category: "выживание",
    tags: ["выживание"],
    minRarity: 2,
    effect: { stat: "fuelConverterLevel", effectByRarity: [null, null, 1, 2, 3] },
  },
  {
    id: "adrenaline",
    type: "equipment",
    name: "Адреналин",
    icon: "💉",
    desc: "+10/20/30/40% скорость бура при HP < 50.",
    category: "выживание",
    tags: ["выживание"],
    minRarity: 1,
    effect: { stat: "adrenalineLevel", effectByRarity: [null, 10, 20, 30, 40] },
  },
  {
    id: "ore_injector",
    type: "equipment",
    name: "Рудный инжектор",
    icon: "⚗️",
    desc: "Удар по бреши восстанавливает +15 топлива. −5% скорость бура.",
    category: "выживание",
    tags: ["выживание"],
    minRarity: 2,
    effect: [
      { stat: "weakSpotFuelGain", effectByRarity: [null, null, 15, 25, 40] },
      { stat: "strikeSpeed",      effectByRarity: [null, null, -5, -5, -5] },
    ],
  },
  {
    id: "breach_afterburner",
    type: "equipment",
    name: "Разрядный форсаж",
    icon: "⚡",
    desc: "При попадании в брешь включает форсаж. Урон зависит от drillPower и weakSpotMult.",
    category: "поиск_бреши",
    tags: ["поиск_бреши"],
    minRarity: 1,
    effect: [
      { stat: "breachAfterburnerSeconds", effectByRarity: [null, 1, 1, 2, 2] },
    ],
  },
  {
    id: "breach_chain_drill",
    type: "equipment",
    name: "Цепной брешь-бур",
    icon: "🧷",
    desc: "После попадания в брешь усиливает следующие удары и запрещает им создавать брешь.",
    category: "поиск_бреши",
    tags: ["поиск_бреши"],
    minRarity: 1,
    effect: [
      { stat: "breachChainHitsOnTrigger", effectByRarity: [null, 1, 2, 3, 4] },
    ],
  },
  {
    id: "beacon_alchemy_drill",
    type: "equipment",
    name: "Маячный реторт-бур",
    icon: "⚗️",
    desc: "Урон 12. При копке в сторону маяка в радиусе 10: дополнительно 20 + 15/20/25/30% от drillPower.",
    category: "алхимия",
    tags: ["алхимия"],
    minRarity: 1,
  },
  {
    id: "recipe_alchemy_drill",
    type: "equipment",
    name: "Рецептурный реторт-бур",
    icon: "🧪",
    desc: "Урон 5 + 5/7/9/11 за каждый собранный рецепт в этом ранe.",
    category: "алхимия",
    tags: ["алхимия"],
    minRarity: 1,
  },

  // ── Контур ────────────────────────────────────────────────────────────────────
  {
    id: "loop_pressure",
    type: "equipment",
    name: "Контурное давление",
    icon: "🔩",
    desc: "Каждая клетка контура даёт +1% к урону бурения.",
    category: "контур",
    tags: ["контур", "урон"],
    minRarity: 2,
    effect: [
      { stat: "loopLengthDamageBonus", effectByRarity: [null, null, 1, 2, 3] },
    ],
  },

  // ── Оглушение ─────────────────────────────────────────────────────────────────
  {
    id: "stun_detonator",
    type: "equipment",
    name: "Детонатор оглушения",
    icon: "💢",
    desc: "При оглушении — взрыв вокруг бура. −1 броня.",
    category: "выживание",
    tags: ["выживание"],
    minRarity: 2,
    effect: [
      { stat: "stunDetonatorLevel", effectByRarity: [null, null, 1, 1, 2] },
      { stat: "armor",              effectByRarity: [null, null, -25, -50, -50] },
    ],
  },

  // ── Ракеты (триггерные) ───────────────────────────────────────────────────────
  {
    id: "breach_missile",
    type: "equipment",
    name: "Бреш-ракета",
    icon: "🎯",
    desc: "Даёт +10 урона и +10/15/20/25% от drillPower (по редкости). +5% шанс бреши. При попадании в брешь запускает ракету: 20 + 30/40/50/60% от explosionPower (по редкости), радиус 1.5.",
    category: "ракеты",
    tags: ["ракеты"],
    minRarity: 2,
    effect: [
      { stat: "breachMissileLevel", effectByRarity: [null, null, 1, 1, 1] },
      { stat: "weakSpotChance",     effectByRarity: [null, null, 0.05, 0.05, 0.05] },
    ],
  },
  {
    id: "cryo_rocket",
    type: "equipment",
    name: "Крио-ракета",
    icon: "❄️",
    desc: "При остывании на 20 единиц — ракета. −15% скорость нагрева.",
    category: "ракеты",
    tags: ["ракеты"],
    minRarity: 2,
    effect: [
      { stat: "cryoRocketCount", effectByRarity: [null, null, 1, 1, 1] },
      { stat: "heatRate",        effectByRarity: [null, null, -0.15, -0.20, -0.28] },
    ],
  },
  {
    id: "fuel_rocket",
    type: "equipment",
    name: "Топливная ракета",
    icon: "⛽",
    desc: "При пополнении топлива запускает ракету. +10% расход.",
    category: "ракеты",
    tags: ["ракеты"],
    minRarity: 2,
    effect: [
      { stat: "fuelRocketLevel", effectByRarity: [null, null, 1, 1, 1] },
      { stat: "fuelDrainRate",   effectByRarity: [null, null, 0.10, 0.15, 0.20] },
    ],
  },
];

export const ALL_ITEMS = [
  {
    id: "heavy_drill",
    type: "item",
    name: "Утяжелитель",
    icon: "⚒️",
    desc: "+8/10/12/15 drillPower. Скорость −10%.",
    category: "basic",
    tags: ["basic"],
    minRarity: 1,
    effect: [
      { stat: "drillPower",   effectByRarity: [null, 8, 10, 12, 15] },
      { stat: "strikeSpeed",  effectByRarity: [null, -10, -10, -10, -10] },
    ],
  },
  {
    id: "cushioned_housing",
    type: "item",
    name: "Амортизирующий кожух",
    icon: "🦴",
    category: "basic",
    tags: ["basic"],
    minRarity: 1,
    effect: [
      { stat: "maxHp", effectByRarity: [null, 25, 40, 60, 90] },
      { stat: "speedOfAutoClose", effectByRarity: [null, -10, -10, -10, -10] },
    ],
  },
  {
    id: "aux_tank",
    type: "item",
    name: "Дополнительный бак",
    icon: "🛢️",
    category: "basic",
    tags: ["basic"],
    minRarity: 1,
    effect: [
      { stat: "maxFuel", effectByRarity: [null, 60, 90, 130, 180] },
      { stat: "fuelDrainRate", effectByRarity: [null, 0.10, 0.10, 0.10, 0.10] },
    ],
  },
  {
    id: "economy_filter",
    type: "item",
    name: "Экономный фильтр",
    icon: "🧪",
    category: "basic",
    tags: ["basic"],
    minRarity: 1,
    effect: [
      { stat: "fuelDrainRate", effectByRarity: [null, -0.05, -0.10, -0.15, -0.20] },
      { stat: "strikeSpeed", effectByRarity: [null, -10, -10, -10, -10] },
    ],
  },
  {
    id: "emergency_heat_exchanger",
    type: "item",
    name: "Аварийный теплообменник",
    icon: "🫀",
    category: "basic",
    tags: ["basic"],
    minRarity: 1,
    effect: [
      { stat: "fuelStarvationResistance", effectByRarity: [null, 15, 25, 40, 60] },
      { stat: "lowFuelDamageBonus", effectByRarity: [null, 0.10, 0.15, 0.22, 0.30] },
      { stat: "maxFuel", effectByRarity: [null, -10, -10, -10, -10] },
    ],
  },
  {
    id: "contour_grease",
    type: "item",
    name: "Контурная смазка",
    icon: "🧴",
    category: "basic",
    tags: ["basic"],
    minRarity: 1,
    effect: [
      { stat: "contourResMultiplier", effectByRarity: [null, 0.10, 0.15, 0.20, 0.28] },
      { stat: "heatRate", effectByRarity: [null, 0.10, 0.10, 0.10, 0.10] },
    ],
  },
  {
    id: "thermal_gasket",
    type: "item",
    name: "Термопрокладка",
    icon: "🧱",
    category: "basic",
    tags: ["basic"],
    minRarity: 1,
    effect: [
      { stat: "maxHeat", effectByRarity: [null, 10, 15, 25, 40] },
      { stat: "concentration", effectByRarity: [null, -10, -10, -10, -10] },
    ],
  },
  {
    id: "cooling_jacket",
    type: "item",
    name: "Охлаждающая рубашка",
    icon: "🧊",
    category: "basic",
    tags: ["basic"],
    minRarity: 1,
    effect: [
      { stat: "heatRate", effectByRarity: [null, -0.10, -0.15, -0.22, -0.30] },
      { stat: "explosionPower", effectByRarity: [null, -10, -10, -10, -10] },
    ],
  },
  {
    id: "volatile_focus",
    type: "item",
    name: "Фокусатор взрыва",
    icon: "🧨",
    category: "basic",
    tags: ["basic"],
    minRarity: 1,
    effect: [
      { stat: "explosionPower", effectByRarity: [null, 10, 15, 22, 30] },
      { stat: "concentration", effectByRarity: [null, 10, 15, 20, 30] },
      { stat: "weakSpotChance", effectByRarity: [null, -0.02, -0.03, -0.04, -0.05] },
    ],
  },
  {
    id: "light_rotor",
    type: "item",
    name: "Лёгкий ротор",
    icon: "🌀",
    category: "basic",
    tags: ["basic"],
    minRarity: 1,
    effect: [
      { stat: "strikeSpeed", effectByRarity: [null, 8, 12, 18, 26] },
      { stat: "maxHeat", effectByRarity: [null, -10, -10, -10, -10] },
    ],
  },
  {
    id: "reinforced_crown",
    type: "item",
    name: "Усиленная коронка",
    icon: "🪛",
    category: "basic",
    tags: ["basic"],
    minRarity: 1,
    effect: [
      { stat: "drillPower", effectByRarity: [null, 2, 3, 5, 8] },
      { stat: "fuelDrainRate", effectByRarity: [null, 0.10, 0.10, 0.10, 0.10] },
    ],
  },
  {
    id: "notches",
    type: "item",
    name: "Насечка",
    icon: "📍",
    category: "basic",
    tags: ["basic"],
    minRarity: 1,
    effect: [
      { stat: "weakSpotChance", effectByRarity: [null, 0.03, 0.05, 0.07, 0.10] },
      { stat: "strikeSpeed", effectByRarity: [null, -5, -5, -5, -5] },
    ],
  },
  {
    id: "heavy_notches",
    type: "item",
    name: "Тяжёлая насечка",
    icon: "🪓",
    category: "basic",
    tags: ["basic"],
    minRarity: 1,
    effect: [
      { stat: "weakSpotMult", effectByRarity: [null, 0.3, 0.45, 0.65, 0.9] },
      { stat: "drillPower", effectByRarity: [null, -1, -1, -2, -3] },
    ],
  },
  {
    id: "prospector_charm",
    type: "item",
    name: "Подвеска старателя",
    icon: "🍀",
    category: "basic",
    tags: ["basic"],
    minRarity: 1,
    effect: { stat: "luck", effectByRarity: [null, 2, 3, 5, 8] },
  },
  {
    id: "balancer",
    type: "item",
    name: "Балансир",
    icon: "⚖️",
    category: "basic",
    tags: ["basic"],
    minRarity: 1,
    effect: [
      { stat: "concentration", effectByRarity: [null, 10, 15, 20, 30] },
      { stat: "maxHeat", effectByRarity: [null, -10, -10, -10, -10] },
    ],
  },
  {
    id: "mixture_stabilizer",
    type: "item",
    name: "Стабилизатор смеси",
    icon: "⚗️",
    category: "basic",
    tags: ["basic"],
    minRarity: 1,
    effect: [
      { stat: "effectDurationRate", effectByRarity: [null, 0.10, 0.15, 0.22, 0.30] },
      { stat: "concentration", effectByRarity: [null, -10, -10, -10, -10] },
    ],
  },
  {
    id: "gold_magnet",
    type: "item",
    name: "Золотой магнит",
    icon: "🪙",
    category: "basic",
    tags: ["basic"],
    minRarity: 1,
    effect: [
      { stat: "goldBonus", effectByRarity: [null, 0.05, 0.08, 0.12, 0.18] },
      { stat: "contourResMultiplier", effectByRarity: [null, -0.10, -0.10, -0.10, -0.10] },
    ],
  },
  {
    id: "miner_journal",
    type: "item",
    name: "Журнал проходчика",
    icon: "📘",
    category: "basic",
    tags: ["basic"],
    minRarity: 1,
    effect: [
      { stat: "xpBonus", effectByRarity: [null, 0.08, 0.12, 0.18, 0.26] },
      { stat: "luck", effectByRarity: [null, -2, -2, -2, -2] },
    ],
  },
  {
    id: "check_valve",
    type: "item",
    name: "Обратный клапан",
    icon: "🔁",
    category: "basic",
    tags: ["basic"],
    minRarity: 2,
    effect: [
      { stat: "fuelBonus", effectByRarity: [null, null, 0.05, 0.10, 0.15] },
      { stat: "maxFuel", effectByRarity: [null, null, -10, -10, -10] },
    ],
  },
  {
    id: "contour_template",
    type: "item",
    name: "Шаблон контура",
    icon: "📐",
    category: "basic",
    tags: ["basic"],
    minRarity: 1,
    effect: [
      { stat: "speedOfAutoClose", effectByRarity: [null, 5, 8, 12, 18] },
      { stat: "concentration", effectByRarity: [null, -10, -10, -10, -10] },
    ],
  },
  {
    id: "segment_frame",
    type: "item",
    name: "Сегментная рамка",
    icon: "🧩",
    category: "basic",
    tags: ["basic"],
    minRarity: 1,
    effect: [
      { stat: "maxContour", effectByRarity: [null, 1, 2, 3, 4] },
      { stat: "speedOfAutoClose", effectByRarity: [null, -5, -5, -5, -5] },
    ],
  },
  {
    id: "angry_edge",
    type: "item",
    name: "Злая заточка",
    icon: "🪚",
    category: "basic",
    tags: ["basic"],
    minRarity: 1,
    effect: [
      { stat: "damageBonus", effectByRarity: [null, 8, 12, 18, 25] },
      { stat: "explosionPower", effectByRarity: [null, -10, -10, -10, -10] },
    ],
  },
  {
    id: "dense_explosive",
    type: "item",
    name: "Плотная взрывчатка",
    icon: "🧨",
    category: "basic",
    tags: ["basic"],
    minRarity: 1,
    effect: [
      { stat: "explosionPower", effectByRarity: [null, 10, 15, 22, 30] },
      { stat: "drillPower", effectByRarity: [null, -1, -1, -2, -3] },
    ],
  },
  {
    id: "diffusion_cap",
    type: "item",
    name: "Рассеивающий колпак",
    icon: "🎆",
    category: "basic",
    tags: ["basic"],
    minRarity: 3,
    effect: [
      { stat: "explosionRadiusBonus", effectByRarity: [null, null, null, 0.5, 1.0] },
      { stat: "goldBonus", effectByRarity: [null, null, null, -0.07, -0.07] },
      { stat: "xpBonus", effectByRarity: [null, null, null, -0.07, -0.07] },
      { stat: "fuelBonus", effectByRarity: [null, null, null, -0.07, -0.07] },
    ],
  },
  {
    id: "piercing_drill",
    type: "item",
    name: "Прошивной бур",
    icon: "🪡",
    category: "maintenance",
    tags: ["maintenance"],
    minRarity: 1,
    effect: [
      { stat: "weakSpotPierce", effectByRarity: [null, 1, 1, 2, 3] },
      { stat: "weakSpotMult", effectByRarity: [null, -0.30, -0.20, -0.20, -0.10] },
    ],
  },
  {
    id: "fuel_shunt",
    type: "item",
    name: "Топливный шунт",
    icon: "🔋",
    category: "basic",
    tags: ["basic"],
    minRarity: 2,
    effect: [
      { stat: "weakSpotFuelGain", effectByRarity: [null, null, 8, 12, 18] },
      { stat: "weakSpotChance", effectByRarity: [null, null, -0.02, -0.02, -0.02] },
    ],
  },
  {
    id: "emergency_drive",
    type: "item",
    name: "Аварийный привод",
    icon: "🚨",
    category: "basic",
    tags: ["basic"],
    minRarity: 1,
    effect: [
      { stat: "lowFuelSpeedBonus", effectByRarity: [null, 0.10, 0.15, 0.22, 0.30] },
      { stat: "fuelDrainRate", effectByRarity: [null, 0.10, 0.10, 0.10, 0.10] },
    ],
  },
  {
    id: "long_loop",
    type: "item",
    name: "Длинный контур",
    icon: "➰",
    category: "basic",
    tags: ["basic"],
    minRarity: 2,
    effect: [
      { stat: "loopLengthDamageBonus", effectByRarity: [null, null, 1, 2, 3] },
      { stat: "drillPower", effectByRarity: [null, null, -1, -1, -1] },
    ],
  },
  {
    id: "study_crown",
    type: "item",
    name: "Учебная коронка",
    icon: "🎓",
    category: "maintenance",
    tags: ["maintenance"],
    minRarity: 1,
    effect: { stat: "drillPowerPerLevel", effectByRarity: [null, 5, 7, 10, 12] },
  },
  {
    id: "acceleration_template",
    type: "item",
    name: "Разгонный шаблон",
    icon: "📈",
    category: "basic",
    tags: ["basic"],
    minRarity: 1,
    effect: { stat: "strikeSpeedPerLevel", effectByRarity: [null, 3, 5, 7, 10] },
  },
  {
    id: "field_textbook",
    type: "item",
    name: "Полевой учебник",
    icon: "🩹",
    category: "выживание",
    tags: ["выживание"],
    minRarity: 1,
    maxRarity: 1,
    effect: { stat: "healPerLevel", effectByRarity: [null, 50] },
  },
  {
    id: "vein_book",
    type: "item",
    name: "Книга жил",
    icon: "📒",
    category: "economy",
    tags: ["economy"],
    minRarity: 1,
    effect: { stat: "goldBonusPerLevel", effectByRarity: [null, 0.03, 0.05, 0.07, 0.10] },
  },
  {
    id: "planning",
    type: "item",
    name: "Планирование",
    icon: "🗒️",
    desc: "+1% скорость замыкания контура.",
    category: "контур",
    tags: ["контур"],
    minRarity: 1,
    effect: {
      stat: "speedOfAutoClose",
      effectByRarity: [null, 3, 5, 8, 10],
    },
  },
  {
    id: "steel_hull",
    type: "item",
    name: "Стальной корпус",
    icon: "🛡️",
    desc: "+1 макс. ЖЗН.",
    category: "выживание",
    tags: ["выживание"],
    minRarity: 1,
    effect: { stat: "maxHp", value: 25 },
  },
  {
    id: "afterburner",
    type: "item",
    name: "Форсажная камера",
    icon: "💨",
    desc: "+15% скорость бура. −1 макс. HP (не ниже 1).",
    get descParts() {
      return [
        { type: "effect", index: 0 },
        t("item.afterburner.hp_penalty"),
      ];
    },
    category: "maintenance",
    tags: ["maintenance"],
    minRarity: 1,
    effect: [
      { stat: "strikeSpeed", effectByRarity: [null, 15, 22, 30, 40] },
      { stat: "maxHp",       effectByRarity: [null, -25, -25, -25, -25] },
    ],
  },
  {
    id: "artifact_compass",
    type: "item",
    name: "Компас артефакта",
    icon: "🔮",
    desc: "Радары маяков показывают фиолетовый указатель на ближайший артефакт.",
    category: "алхимия",
    tags: ["алхимия"],
    minRarity: 3,
    maxRarity: 3,
    unique: true,
    effect: { stat: "artifactRadarMode", value: 1 },
  },
  {
    id: "gold_fever",
    type: "item",
    name: "Золотая лихорадка",
    icon: "🤑",
    desc: "+10% к золоту с жил.",
    category: "economy",
    tags: ["economy"],
    minRarity: 1,
    effect: { stat: "miningGoldBonusMultiplier", effectByRarity: [null, 0.1, 0.15, 0.2, 0.3] },
  },
  {
    id: "gold_probe",
    type: "item",
    name: "Золотой щуп",
    icon: "✨",
    desc: "Радары маяков показывают жёлтый указатель на ближайшее золотое скопление (5+ блоков).",
    category: "алхимия",
    tags: ["алхимия"],
    minRarity: 2,
    maxRarity: 2,
    unique: true,
    effect: { stat: "goldRadarMode", value: 1 },
  },
  {
    id: "navigator",
    type: "item",
    name: "Навигатор",
    icon: "📡",
    desc: "Радары маяков показывают белый указатель на ближайший неактивированный маяк на той же глубине.",
    category: "алхимия",
    tags: ["алхимия"],
    minRarity: 1,
    unique: true,
    maxRarity: 1,
    effect: { stat: "navigatorMode", value: 1 },
  },
  {
    id: "machine_oil",
    type: "item",
    name: "Машинное масло",
    icon: "💧",
    desc: "+5% скорость бура.",
    category: "maintenance",
    tags: ["maintenance"],
    minRarity: 1,
    effect: {
      stat: "strikeSpeed",
      effectByRarity: [null, 5, 8, 10, 13],
    },
  },
  {
    id: "geo_sight",
    type: "item",
    name: "Геологический прицел",
    icon: "🔭",
    desc: "+3% шанс бреши в породе.",
    category: "поиск_бреши",
    tags: ["поиск_бреши"],
    minRarity: 1,
    effect: {
      stat: "weakSpotChance",
      effectByRarity: [null, 0.03, 0.05, 0.08, 0.10],
    },
  },
  {
    id: "breach_thermostat",
    type: "item",
    name: "Поиск бреши",
    icon: "🌡️",
    category: "поиск_бреши",
    tags: ["поиск_бреши"],
    minRarity: 1,
    unique: true,
    effect: [
      { stat: "breachThermostatLevel", effectByRarity: [null, 1, 1, 1, 1] },
      { stat: "heatRate", effectByRarity: [null, 0.15, 0.15, 0.15, 0.15] },
    ],
  },
  {
    id: "breach_presence",
    type: "item",
    name: "Давление бреши",
    icon: "👁️",
    category: "поиск_бреши",
    tags: ["поиск_бреши"],
    minRarity: 1,
    effect: { stat: "breachPresenceChance", effectByRarity: [null, 0.04, 0.06, 0.08, 0.12] },
  },
  {
    id: "overdrive_hunter",
    type: "item",
    name: "Форсажный охотник",
    icon: "💨",
    category: "поиск_бреши",
    tags: ["поиск_бреши"],
    minRarity: 1,
    effect: { stat: "overdriveBreachChance", effectByRarity: [null, 0.03, 0.05, 0.07, 0.09] },
  },
  {
    id: "raw_power",
    type: "item",
    name: "Raw Power",
    icon: "🧨",
    category: "поиск_бреши",
    tags: ["поиск_бреши"],
    minRarity: 1,
    effect: [
      { stat: "weakSpotChance", effectByRarity: [null, -0.08, -0.12, -0.16, -0.20] },
      { stat: "damageBonus", effectByRarity: [null, 8, 12, 16, 20] },
    ],
  },
  {
    id: "breach_scope",
    type: "item",
    name: "Бреш-оптика",
    icon: "🎯",
    category: "поиск_бреши",
    tags: ["поиск_бреши"],
    minRarity: 1,
    effect: [
      { stat: "weakSpotMult", effectByRarity: [null, 0.20, 0.30, 0.45, 0.60] },
      { stat: "visionRadius", effectByRarity: [null, -1, -1, -1, -1] },
    ],
  },
  {
    id: "cooling_on_miss",
    type: "item",
    name: "Охлаждение при промахе",
    icon: "🧊",
    category: "поиск_бреши",
    tags: ["поиск_бреши"],
    minRarity: 1,
    effect: { stat: "breachMissCool", effectByRarity: [null, 5, 7, 9, 11] },
  },
  {
    id: "low_fuel_hunter",
    type: "item",
    name: "Охотник пустого бака",
    icon: "🛢️",
    category: "поиск_бреши",
    tags: ["поиск_бреши"],
    minRarity: 1,
    effect: [
      { stat: "lowFuelWeakSpotChance", effectByRarity: [null, 0.04, 0.06, 0.09, 0.12] },
      { stat: "fuelDrainRate", effectByRarity: [null, 0.10, 0.10, 0.10, 0.10] },
    ],
  },
  {
    id: "breach_study",
    type: "item",
    name: "Исследование бреши",
    icon: "📐",
    category: "поиск_бреши",
    tags: ["поиск_бреши"],
    minRarity: 1,
    effect: { stat: "weakSpotChancePerLevel", effectByRarity: [null, 0.03, 0.05, 0.07, 0.09] },
  },
  {
    id: "lucky_criticality",
    type: "item",
    name: "Счастливая критичность",
    icon: "🍀",
    category: "поиск_бреши",
    tags: ["поиск_бреши"],
    minRarity: 1,
    unique: true,
    effect: { stat: "luckAsWeakSpotChance", effectByRarity: [null, 1, 1, 1, 1] },
  },
  // ─── Level-up bonus items ──────────────────────────────────────────────────
  // Each of these grants a bonus every time the player gains a level.
  {
    id: "learning_algorithm",
    type: "item",
    name: "Учебный алгоритм",
    icon: "🧠",
    desc: "При каждом уровне: +2 к силе удара бура.",
    category: "basic",
    tags: ["basic"],
    minRarity: 1,
    effect: {
      stat: "drillPowerPerLevel",
      effectByRarity: [null, 2, 4, 6, 8],
    },
  },
  {
    id: "blast_learning_algorithm",
    type: "item",
    name: "Взрывной алгоритм",
    icon: "💣",
    desc: "При каждом уровне: +2 к силе взрыва.",
    category: "basic",
    tags: ["basic"],
    minRarity: 1,
    effect: {
      stat: "explosionPowerPerLevel",
      effectByRarity: [null, 2, 4, 6, 8],
    },
  },
  {
    id: "fuel_impulse",
    type: "item",
    name: "Топливный импульс",
    icon: "⚗️",
    desc: "При каждом уровне: +50 топлива.",
    category: "maintenance",
    tags: ["maintenance"],
    minRarity: 1,
    effect: {
      stat: "fuelPerLevel",
      effectByRarity: [null, 50, 75, 100, 150],
    },
  },
  {
    id: "rapid_adaptation",
    type: "item",
    name: "Ускоренная адаптация",
    icon: "🔩",
    desc: "При каждом уровне: +2% скорости бура.",
    category: "maintenance",
    tags: ["maintenance"],
    minRarity: 1,
    effect: {
      stat: "strikeSpeedPerLevel",
      effectByRarity: [null, 2, 3, 4, 6],
    },
  },
  {
    id: "experience_regen",
    type: "item",
    name: "Регенерация через опыт",
    icon: "💉",
    desc: "При каждом уровне: лечит +1 HP.",
    category: "выживание",
    tags: ["выживание"],
    minRarity: 1,
    effect: {
      stat: "healPerLevel",
      effectByRarity: [null, 25, 25, 50, 75],
    },
  },
  {
    id: "golden_wisdom",
    type: "item",
    name: "Золотая мудрость",
    icon: "💡",
    desc: "При каждом уровне: +2% к золоту с жил.",
    category: "economy",
    tags: ["economy"],
    minRarity: 1,
    effect: {
      stat: "goldBonusPerLevel",
      effectByRarity: [null, 0.02, 0.03, 0.04, 0.06],
    },
  },
  // ── Heat ─────────────────────────────────────────────────────────────────────
  {
    id: "pressure_valve",
    name: "Предохранительный клапан",
    type: "item",
    icon: "🎚️",
    desc: "−20% скорость нагрева. −10 макс. нагрев.",
    category: "heat",
    tags: ["heat"],
    minRarity: 1,
    effect: [
      { stat: "heatRate", effectByRarity: [null, -0.20, -0.28, -0.38, -0.50] },
      { stat: "maxHeat",  effectByRarity: [null, -10,   -15,   -20,   -30  ] },
    ],
  },

  // ── Maintenance ───────────────────────────────────────────────────────────────
  {
    id: "fuel_injector",
    type: "item",
    name: "Топливный инжектор",
    icon: "⚙️",
    desc: "+2 сила бура. +15% расход топлива.",
    category: "maintenance",
    tags: ["maintenance"],
    minRarity: 1,
    effect: [
      { stat: "drillPower",   effectByRarity: [null, 2,    3,    5,    8   ] },
      { stat: "fuelDrainRate",effectByRarity: [null, 0.15, 0.20, 0.28, 0.38] },
    ],
  },
  {
    id: "wear_sensor",
    type: "item",
    name: "Датчик износа",
    icon: "📟",
    desc: "−15% расход топлива. −8% скорость бура.",
    category: "maintenance",
    tags: ["maintenance"],
    minRarity: 1,
    effect: [
      { stat: "fuelDrainRate",effectByRarity: [null, -0.15, -0.22, -0.30, -0.40] },
      { stat: "strikeSpeed",  effectByRarity: [null, -8,    -10,   -12,   -15   ] },
    ],
  },

  // ── Выживание ─────────────────────────────────────────────────────────────────
  {
    id: "emergency_kit",
    type: "item",
    name: "Аварийный комплект",
    icon: "🩹",
    desc: "+1 лечение за уровень. −1 макс. HP.",
    category: "выживание",
    tags: ["выживание"],
    minRarity: 2,
    effect: [
      { stat: "healPerLevel", effectByRarity: [null, null, 25, 50, 75] },
      { stat: "maxHp",        effectByRarity: [null, null, -25, -25, -25] },
    ],
  },
  // ── Поиск бреши ───────────────────────────────────────────────────────────────
  {
    id: "resonance_tip",
    type: "item",
    name: "Резонансный наконечник",
    icon: "〰️",
    desc: "+5% шанс бреши. −1 сила бура.",
    category: "поиск_бреши",
    tags: ["поиск_бреши"],
    minRarity: 1,
    effect: [
      { stat: "weakSpotChance", effectByRarity: [null, 0.05, 0.08, 0.12, 0.18] },
      { stat: "drillPower",     effectByRarity: [null, -1,   -1.5, -2,   -3  ] },
    ],
  },
  {
    id: "fracture_lens",
    type: "item",
    name: "Линза трещин",
    icon: "🔬",
    desc: "+0.4 урон по бреши. −2 удача.",
    category: "поиск_бреши",
    tags: ["поиск_бреши"],
    minRarity: 2,
    effect: [
      { stat: "weakSpotMult", effectByRarity: [null, null, 0.4, 0.7, 1.0] },
      { stat: "luck",         effectByRarity: [null, null, -2,  -3,  -4 ] },
    ],
  },

  // ── Алхимия и навигация ──────────────────────────────────────────────────────
  {
    id: "crystal_detector",
    type: "item",
    name: "Кристальный компас",
    icon: "💎",
    desc: "+1/+2/+3/+4 обзора. −2/−3/−4/−6 удачи.",
    category: "алхимия",
    tags: ["алхимия"],
    minRarity: 1,
    unique: true,
    maxRarity: 2,
    effect: [
      { stat: "visionRadius",       effectByRarity: [null, 1, 2, 3, 4] },
      { stat: "luck",               effectByRarity: [null, -2, -3, -4, -6] },
    ],
  },
  {
    id: "deep_scanner",
    type: "item",
    name: "Глубинный сканер",
    icon: "📡",
    desc: "+2 радиус обзора. −8% скорость бура.",
    category: "алхимия",
    tags: ["алхимия"],
    minRarity: 1,
    effect: [
      { stat: "visionRadius", effectByRarity: [null, 2, 3, 4, 5] },
      { stat: "strikeSpeed",  effectByRarity: [null, -8, -10, -12, -15] },
    ],
  },

  // ── Экономика ─────────────────────────────────────────────────────────────────
  {
    id: "tax_evasion",
    type: "item",
    name: "Уклонение от налогов",
    icon: "🧾",
    desc: "+8% опыт. −8% золото с жил.",
    category: "economy",
    tags: ["economy"],
    minRarity: 1,
    effect: [
      { stat: "xpBonus",         effectByRarity: [null, 0.08, 0.12, 0.18, 0.28] },
      { stat: "miningGoldBonusMultiplier",  effectByRarity: [null, -0.08, -0.10, -0.14, -0.20] },
    ],
  },
  {
    id: "risk_premium",
    type: "item",
    name: "Рисковая надбавка",
    icon: "🎰",
    desc: "+15% шанс находки. −1 броня.",
    category: "economy",
    tags: ["economy"],
    minRarity: 1,
    effect: [
      { stat: "bonusFindChance", effectByRarity: [null, 0.15, 0.22, 0.32, 0.45] },
      { stat: "armor",           effectByRarity: [null, -25,  -25,  -50,  -50  ] },
    ],
  },
  {
    id: "xp_amplifier",
    type: "item",
    name: "Усилитель опыта",
    icon: "🔮",
    desc: "+10% опыт. −8% золото с жил.",
    category: "алхимия",
    tags: ["алхимия"],
    minRarity: 1,
    effect: [
      { stat: "xpBonus",        effectByRarity: [null, 0.10, 0.15, 0.22, 0.32] },
      { stat: "miningGoldBonusMultiplier", effectByRarity: [null, -0.08, -0.10, -0.14, -0.20] },
    ],
  },

  // ── Ракеты ────────────────────────────────────────────────────────────────────
  {
    id: "rocket_booster",
    type: "item",
    name: "Ракетный ускоритель",
    icon: "🚀",
    desc: "+30% урон взрывов. +10% скорость нагрева.",
    category: "ракеты",
    tags: ["ракеты"],
    minRarity: 2,
    effect: [
      { stat: "explosionBonus", effectByRarity: [null, null, 0.30, 0.50, 0.80] },
      { stat: "heatRate",                  effectByRarity: [null, null, 0.10, 0.15, 0.20] },
    ],
  },
  {
    id: "cluster_warhead",
    type: "item",
    name: "Кассетная боеголовка",
    icon: "💣",
    desc: "+1 радиус взрыва перегрева. +20% урон взрывов. −10% общий урон.",
    category: "ракеты",
    tags: ["ракеты"],
    minRarity: 2,
    effect: [
      { stat: "explosionRadiusBonus",  effectByRarity: [null, null, 1.0, 1.5, 2.0] },
      { stat: "explosionBonus", effectByRarity: [null, null, 0.20, 0.35, 0.50] },
      { stat: "damageBonus",               effectByRarity: [null, null, -10, -12, -15] },
    ],
  },
  {
    id: "shaped_charge",
    type: "item",
    name: "Кумулятивный заряд",
    icon: "🔫",
    desc: "+15% общий урон. −0.5 радиус взрыва перегрева. +10% расход топлива.",
    category: "ракеты",
    tags: ["ракеты"],
    minRarity: 2,
    effect: [
      { stat: "damageBonus",               effectByRarity: [null, null, 15,   22,   30  ] },
      { stat: "explosionRadiusBonus",  effectByRarity: [null, null, -0.5, -0.5, -0.5] },
      { stat: "fuelDrainRate",             effectByRarity: [null, null, 0.10, 0.15, 0.20] },
    ],
  },

  {
    id: "explosive_condenser",
    type: "item",
    name: "Взрывной конденсор",
    icon: "💥",
    desc: "При перегреве взрыв сильнее. −10% концентрация.",
    category: "heat",
    tags: ["heat"],
    minRarity: 1,
    effect: [
      { stat: "explosionBonus", effectByRarity: [null, 25, 50, 75, 100] },
      { stat: "concentration",            effectByRarity: [null, -10, -15, -20, -30] },
    ],
  },
  {
    id: "cooling_circuit",
    type: "item",
    name: "Охлаждающий контур",
    icon: "❄️",
    desc: "−15% скорость нагрева. −10% концентрация.",
    category: "heat",
    tags: ["heat"],
    minRarity: 1,
    effect: [
      { stat: "heatRate",      effectByRarity: [null, -0.15, -0.20, -0.30, -0.40] },
      { stat: "concentration", effectByRarity: [null, -10, -15, -20, -30] },
    ],
  },
  {
    id: "boosted_feed",
    type: "item",
    name: "Форсированная подача",
    icon: "🚀",
    desc: "+20% скорость бура. +15% расход топлива.",
    category: "maintenance",
    tags: ["maintenance"],
    minRarity: 1,
    effect: [
      { stat: "strikeSpeed",  effectByRarity: [null, 20, 28, 38, 50] },
      { stat: "fuelDrainRate",effectByRarity: [null, 0.15, 0.20, 0.25, 0.30] },
    ],
  },
  {
    id: "scanner_lens",
    type: "item",
    name: "Линза сканера",
    icon: "🔭",
    desc: "+1 радиус обзора.",
    category: "basic",
    tags: ["basic"],
    minRarity: 1,
    effect: { stat: "visionRadius", effectByRarity: [null, 1, 2, 3, 4] },
  },
  {
    id: "insider",
    type: "item",
    name: "Инсайдер",
    icon: "🎲",
    desc: "+2 удача. −3% опыт.",
    category: "economy",
    tags: ["economy"],
    minRarity: 1,
    effect: [
      { stat: "luck",             effectByRarity: [null, 2,     3,     5,     8    ] },
      { stat: "xpBonus",effectByRarity: [null, -0.03, -0.05, -0.07, -0.10] },
    ],
  },
  {
    id: "gold_gambler",
    type: "item",
    name: "Золотой игрок",
    icon: "🎰",
    desc: "+2/3/5/8 удачи. −5/8/12/18% к бонусу золота.",
    category: "алхимия",
    tags: ["алхимия"],
    minRarity: 1,
    effect: [
      { stat: "luck", effectByRarity: [null, 2, 3, 5, 8] },
      { stat: "goldBonus", effectByRarity: [null, -0.05, -0.08, -0.12, -0.18] },
    ],
  },
  {
    id: "unstable_reagent",
    type: "item",
    name: "Нестабильный реагент",
    icon: "🧪",
    desc: "Концентрация, расход топлива и максимум очков обвала зависят от редкости.",
    get descParts() {
      return [
        { type: "effect", index: 0 },
        { type: "effect", index: 1 },
        { type: "effect", index: 2 },
      ];
    },
    category: "алхимия",
    tags: ["алхимия"],
    minRarity: 1,
    effect: [
      { stat: "concentration", effectByRarity: [null, 5, 7, 10, 13] },
      { stat: "fuelDrainRate", effectByRarity: [null, -0.05, -0.08, -0.12, -0.16] },
      { stat: "collapseBudgetMaxScale", effectByRarity: [null, -0.05, -0.07, -0.10, -0.13] },
    ],
  },
  {
    id: "recipe_stabilizer",
    type: "item",
    name: "Рецептурный стабилизатор",
    icon: "⚗️",
    desc: "Сбор рецепта отдаляет обвал. Но максимум очков обвала снижается.",
    get descParts() {
      return [
        { type: "effect", index: 0 },
        { type: "effect", index: 1 },
      ];
    },
    category: "алхимия",
    tags: ["алхимия"],
    minRarity: 1,
    effect: [
      { stat: "recipeCollapseDelayPercent", effectByRarity: [null, 10, 20, 30, 40] },
      { stat: "collapseBudgetMaxScale", effectByRarity: [null, -0.05, -0.05, -0.05, -0.05] },
    ],
  },
  {
    id: "insurance",
    type: "item",
    name: "Страховка",
    icon: "📋",
    desc: "При уроне сохраняет 30% небезопасного золота.",
    category: "выживание",
    tags: ["выживание"],
    minRarity: 2,
    effect: { stat: "insuranceLevel", effectByRarity: [null, null, 1, 2, 3] },
  },
  {
    id: "expanded_tank",
    type: "item",
    name: "Расширенный бак",
    icon: "⛽",
    desc: "+80 макс. топливо. +10% расход.",
    category: "выживание",
    tags: ["выживание"],
    minRarity: 1,
    effect: [
      { stat: "maxFuel",      effectByRarity: [null,  80,  120,  180,  250] },
      { stat: "fuelDrainRate",effectByRarity: [null, 0.10, 0.15, 0.20, 0.30] },
    ],
  },
  {
    id: "heat_accumulator",
    type: "item",
    name: "Термоаккумулятор",
    icon: "🌡️",
    desc: "+15 макс. нагрев.",
    category: "heat",
    tags: ["heat"],
    minRarity: 1,
    effect: { stat: "maxHeat", effectByRarity: [null, 15, 25, 40, 60] },
  },
  {
    id: "perfectionist",
    type: "item",
    name: "Перфекционист",
    icon: "🏅",
    desc: "+10% золото с жил. −10% шанс находки.",
    category: "economy",
    tags: ["economy"],
    minRarity: 2,
    effect: [
      { stat: "miningGoldBonusMultiplier", effectByRarity: [null, null, 0.10, 0.18, 0.28] },
      { stat: "bonusFindChance",           effectByRarity: [null, null, -0.10, -0.15, -0.20] },
    ],
  },
  {
    id: "sharp_tip",
    type: "item",
    name: "Заточенный наконечник",
    icon: "🗡️",
    desc: "+0.3 урон по бреши.",
    category: "поиск_бреши",
    tags: ["поиск_бреши"],
    minRarity: 1,
    effect: [
      { stat: "weakSpotMult",   effectByRarity: [null, 0.3,  0.5,  0.8,  1.2 ] },
    ],
  },
  {
    id: "sniper_scope",
    type: "item",
    name: "Снайперский прицел",
    icon: "🎯",
    desc: "+4% шанс бреши. +0.5 урон по бреши. Пробитие.",
    category: "поиск_бреши",
    tags: ["поиск_бреши"],
    minRarity: 3,
    effect: [
      { stat: "weakSpotChance",  effectByRarity: [null, null, null, 0.04, 0.07] },
      { stat: "weakSpotMult",    effectByRarity: [null, null, null, 0.5,  0.8 ] },
      { stat: "weakSpotPierce",  effectByRarity: [null, null, null, 1,    1   ] },
    ],
  },
  {
    id: "loop_booster",
    type: "item",
    name: "Ускоритель замыкания",
    icon: "⚡",
    desc: "+5% скорость автозамыкания.",
    category: "контур",
    tags: ["контур"],
    minRarity: 1,
    effect: { stat: "speedOfAutoClose", effectByRarity: [null, 5, 8, 12, 18] },
  },
  {
    id: "loop_extender",
    type: "item",
    name: "Удлинитель контура",
    icon: "📏",
    desc: "Увеличивает максимальную длину контура.",
    category: "контур",
    tags: ["контур"],
    minRarity: 1,
    effect: { stat: "maxContour", effectByRarity: [null, 3, 5, 8, 12] },
  },
  {
    id: "loop_spawner",
    type: "item",
    name: "Контурный трюфель",
    icon: "🍄",
    desc: "Замкнутый контур с шансом спавнит бонус внутри. Максимальная длина контура −3.",
    category: "контур",
    tags: ["контур"],
    minRarity: 2,
    effect: [
      { stat: "loopSpawnBonusChance", effectByRarity: [null, null, 0.30, 0.50, 0.75] },
      { stat: "maxContour",           effectByRarity: [null, null, -3,   -3,   -3   ] },
    ],
  },
  // ── Алхимия ───────────────────────────────────────────────────────────────────
  {
    id: "beacon_catalyst",
    type: "item",
    name: "Маяковый катализатор",
    icon: "🗼",
    desc: "Активация маяка мгновенно завершает текущий рецепт.",
    category: "алхимия",
    tags: ["алхимия"],
    minRarity: 3,
    maxRarity: 3,
    unique: true,
    effect: { stat: "beaconCatalystLevel", value: 1 },
  },
  {
    id: "crystal_gold",
    type: "item",
    name: "Золотой кристалл",
    icon: "💎",
    desc: "Подбор кристалла даёт +15 золота. −8% опыт.",
    category: "алхимия",
    tags: ["алхимия"],
    minRarity: 1,
    effect: [
      { stat: "crystalGoldGain",          effectByRarity: [null, 15, 25, 40, 60] },
      { stat: "xpBonus",        effectByRarity: [null, -0.08, -0.10, -0.14, -0.20] },
    ],
  },
  {
    id: "crystal_xp",
    type: "item",
    name: "Кристальный опыт",
    icon: "✨",
    desc: "Подбор кристалла даёт +50 XP. −2 удача.",
    category: "алхимия",
    tags: ["алхимия"],
    minRarity: 1,
    effect: [
      { stat: "crystalXpGain", effectByRarity: [null, 50, 80, 120, 180] },
      { stat: "luck",          effectByRarity: [null, -2, -3, -4, -6] },
    ],
  },
  {
    id: "crystal_red_core",
    type: "item",
    name: "Красное ядро",
    icon: "🔴",
    desc: "При подборе красного кристалла: +1/2/3/4 силы бура (по редкости).",
    category: "алхимия",
    tags: ["алхимия"],
    minRarity: 1,
    effect: { stat: "crystalRedDrillGain", effectByRarity: [null, 1, 2, 3, 4] },
  },
  {
    id: "crystal_yellow_charge",
    type: "item",
    name: "Жёлтый заряд",
    icon: "🟡",
    desc: "При подборе жёлтого кристалла: +1/2/3/4 силы взрыва (по редкости).",
    category: "алхимия",
    tags: ["алхимия"],
    minRarity: 1,
    effect: { stat: "crystalYellowExplosionGain", effectByRarity: [null, 1, 2, 3, 4] },
  },
  {
    id: "crystal_light_radar",
    type: "item",
    name: "Световой радар",
    icon: "⚪",
    desc: "При подборе светлого кристалла: радар кристаллов на 1/2/3/4 сек (по редкости).",
    category: "алхимия",
    tags: ["алхимия"],
    minRarity: 1,
    effect: { stat: "crystalLightRadarSeconds", effectByRarity: [null, 1, 2, 3, 4] },
  },
  {
    id: "crystal_green_mender",
    type: "item",
    name: "Зелёный регенератор",
    icon: "🟢",
    desc: "При подборе зелёного кристалла: лечит на 10/15/20/25 HP (по редкости).",
    category: "алхимия",
    tags: ["алхимия"],
    minRarity: 1,
    effect: { stat: "crystalGreenHealGain", effectByRarity: [null, 10, 15, 20, 25] },
  },
  {
    id: "crystal_blue_rotor",
    type: "item",
    name: "Синий ротор",
    icon: "🔵",
    desc: "При подборе синего кристалла: +1/2/3/4% скорости бура (по редкости).",
    category: "алхимия",
    tags: ["алхимия"],
    minRarity: 1,
    effect: { stat: "crystalBlueSpeedGain", effectByRarity: [null, 1, 2, 3, 4] },
  },
  {
    id: "level_catalyst",
    type: "item",
    name: "Катализатор уровня",
    icon: "⬆️",
    desc: "Повышение уровня мгновенно завершает текущий рецепт.",
    category: "алхимия",
    tags: ["алхимия"],
    minRarity: 3,
    maxRarity: 3,
    unique: true,
    effect: { stat: "levelCatalystLevel", value: 1 },
  },

  // ── Оглушение ─────────────────────────────────────────────────────────────────
  {
    id: "stun_reservoir",
    type: "item",
    name: "Резервуар оглушения",
    icon: "🫙",
    desc: "При оглушении +40 топлива. −50 макс. топливо.",
    category: "выживание",
    tags: ["выживание"],
    minRarity: 2,
    effect: [
      { stat: "stunReservoirLevel", effectByRarity: [null, null, 1, 2, 3] },
      { stat: "maxFuel",            effectByRarity: [null, null, -50, -60, -80] },
    ],
  },
  {
    id: "stun_afterburner",
    type: "item",
    name: "Форсаж после стана",
    icon: "⚡",
    desc: "После оглушения — форсаж. Дольше стан → длиннее разгон.",
    category: "выживание",
    tags: ["выживание"],
    minRarity: 2,
    effect: { stat: "stunAfterburnerLevel", effectByRarity: [null, null, 1, 1, 2] },
  },
];

export const ALL_GOODS = [...ALL_EQUIPMENT, ...ALL_ITEMS];

// Apply i18n name getters to every item/equipment object.
// Falls back to the original Russian name if no translation key exists.
for (const item of ALL_GOODS) {
  const fallback = item.name;
  const key = `item.${item.id}.name`;
  Object.defineProperty(item, "name", {
    get() { const v = t(key); return v !== key ? v : fallback; },
    configurable: true,
    enumerable: true,
  });
}

function clampRarity(rarity) {
  return Math.max(RARITY.COMMON, Math.min(RARITY.LEGENDARY, rarity || RARITY.COMMON));
}

function getEffectValue(effect, rarity) {
  if (!effect) return 0;
  if (Array.isArray(effect.effectByRarity)) {
    const tier = clampRarity(rarity);
    return effect.effectByRarity[tier] ?? effect.effectByRarity[RARITY.COMMON] ?? 0;
  }
  if (typeof effect.value === "number") {
    return effect.value;
  }
  return 0;
}

function formatDescriptionNumber(value) {
  if (!Number.isFinite(value)) return "0";
  const rounded = Math.round(value * 100) / 100;
  if (Number.isInteger(rounded)) return String(rounded);
  if (Number.isInteger(rounded * 10)) return rounded.toFixed(1);
  return rounded.toFixed(2);
}

function formatSignedDescriptionNumber(value) {
  const sign = value >= 0 ? "+" : "−";
  return `${sign}${formatDescriptionNumber(Math.abs(value))}`;
}

function formatSignedPercent(value, scale = 1) {
  return `${formatSignedDescriptionNumber(value * scale)}%`;
}

function formatUnsignedPercent(value, scale = 1) {
  return `${formatDescriptionNumber(Math.abs(value * scale))}%`;
}

const SIMPLE_STAT_DESCRIPTORS = {
  drillPower: value => t("desc.drillPower", { val: formatSignedDescriptionNumber(value) }),
  strikeSpeed: value => t("desc.strikeSpeed", { val: formatSignedPercent(value) }),
  maxHp: value => t("desc.maxHp", { val: formatSignedDescriptionNumber(value) }),
  maxFuel: value => t("desc.maxFuel", { val: formatSignedDescriptionNumber(value) }),
  maxHeat: value => t("desc.maxHeat", { val: formatSignedDescriptionNumber(value) }),
  visionRadius: value => t("desc.visionRadius", { val: formatSignedDescriptionNumber(value) }),
  luck: value => t("desc.luck", { val: formatSignedDescriptionNumber(value) }),
  armor: value => t("desc.armor", { val: formatSignedDescriptionNumber(value) }),
  weakSpotChance: value => t("desc.weakSpotChance", { val: formatSignedPercent(value, 100) }),
  weakSpotMult: value => t("desc.weakSpotMult", { val: formatSignedPercent(value, 100) }),
  damageBonus: value => t("desc.damageBonus", { val: formatSignedPercent(value) }),
  heatRate: value => t("desc.heatRate", { val: formatSignedPercent(value, 100) }),
  effectDurationRate: value => t("desc.effectDurationRate", { val: formatSignedPercent(value, 100) }),
  concentration: value => t("desc.concentration", { val: formatSignedPercent(value, 1) }),
  fuelDrainRate: value => t("desc.fuelDrainRate", { val: formatSignedPercent(value, 100) }),
  collapseBudgetMaxScale: value => t("desc.collapseBudgetMaxScale", { val: formatSignedPercent(value, 100) }),
  recipeCollapseDelayPercent: value => t("desc.recipeCollapseDelayPercent", { val: formatSignedPercent(value, 1) }),
  fuelStarvationResistance: value => t("desc.fuelStarvationResistance", { val: formatSignedPercent(value) }),
  contourResMultiplier: value => t("desc.contourResMultiplier", { val: formatSignedPercent(value, 100) }),
  goldBonus: value => t("desc.goldBonus", { val: formatSignedPercent(value, 100) }),
  miningGoldBonusMultiplier: value => t("desc.miningGoldBonusMultiplier", { val: formatSignedPercent(value, 100) }),
  xpBonus: value => t("desc.xpBonus", { val: formatSignedPercent(value, 100) }),
  fuelBonus: value => t("desc.fuelBonus", { val: formatSignedPercent(value, 100) }),
  bonusFindChance: value => t("desc.bonusFindChance", { val: formatSignedPercent(value, 100) }),
  speedOfAutoClose: value => t("desc.speedOfAutoClose", { val: formatSignedPercent(value) }),
  maxContour: value => t("desc.maxContour", { val: formatSignedDescriptionNumber(value) }),
  explosionBonus: value => t("desc.explosionBonus", { val: formatSignedPercent(value) }),
  explosionRadiusBonus: value => t("desc.explosionRadiusBonus", { val: formatSignedDescriptionNumber(value) }),
  explosionPower: value => t("desc.explosionPower", { val: formatSignedDescriptionNumber(value) }),
  weakSpotFuelGain: value => t("desc.weakSpotFuelGain", { val: formatSignedDescriptionNumber(value) }),
  lowFuelSpeedBonus: value => t("desc.lowFuelSpeedBonus", { val: formatSignedPercent(value, 100) }),
  lowFuelDamageBonus: value => t("desc.lowFuelDamageBonus", { val: formatSignedPercent(value, 100) }),
  drillPowerPerLevel: value => t("desc.drillPowerPerLevel", { val: formatSignedDescriptionNumber(value) }),
  explosionPowerPerLevel: value => t("desc.explosionPowerPerLevel", { val: formatSignedDescriptionNumber(value) }),
  fuelPerLevel: value => t("desc.fuelPerLevel", { val: formatSignedDescriptionNumber(value) }),
  strikeSpeedPerLevel: value => t("desc.strikeSpeedPerLevel", { val: formatSignedPercent(value) }),
  healPerLevel: value => t("desc.healPerLevel", { val: formatSignedDescriptionNumber(value) }),
  goldBonusPerLevel: value => t("desc.goldBonusPerLevel", { val: formatSignedPercent(value, 100) }),
  loopLengthDamageBonus: value => t("desc.loopLengthDamageBonus", { val: formatSignedPercent(value) }),
  loopSpawnBonusChance: value => t("desc.loopSpawnBonusChance", { val: formatUnsignedPercent(value, 100) }),
  crystalGoldGain: value => t("desc.crystalGoldGain", { val: formatSignedDescriptionNumber(value) }),
  crystalRedDrillGain: value => t("desc.crystalRedDrillGain", { val: formatSignedDescriptionNumber(value) }),
  crystalYellowExplosionGain: value => t("desc.crystalYellowExplosionGain", { val: formatSignedDescriptionNumber(value) }),
  crystalLightRadarSeconds: value => t("desc.crystalLightRadarSeconds", { val: formatDescriptionNumber(value) }),
  crystalGreenHealGain: value => t("desc.crystalGreenHealGain", { val: formatSignedDescriptionNumber(value) }),
  crystalBlueSpeedGain: value => t("desc.crystalBlueSpeedGain", { val: formatSignedPercent(value) }),
  crystalXpGain: value => t("desc.crystalXpGain", { val: formatSignedDescriptionNumber(value) }),
  adrenalineLevel: value => t("desc.adrenalineLevel", { val: value }),
  insuranceLevel: value => t("desc.insuranceLevel", { pct: [0, 30, 50, 70, 90][Math.min(4, Math.max(0, value))] || 0 }),
  fuelConverterLevel: value => t("desc.fuelConverterLevel", { sec: 2 + value }),
  stunDetonatorLevel: value => t("desc.stunDetonatorLevel", { val: value }),
  breachMissileLevel: value => t("desc.breachMissileLevel", { val: formatDescriptionNumber(value) }),
  cryoRocketCount: value => t("desc.cryoRocketCount", { val: formatDescriptionNumber(value) }),
  fuelRocketLevel: value => t("desc.fuelRocketLevel", { val: formatDescriptionNumber(value) }),
  radarCrystalModule: () => t("desc.radarCrystalModule"),
  artifactRadarMode: () => t("desc.artifactRadarMode"),
  goldRadarMode: () => t("desc.goldRadarMode"),
  navigatorMode: () => t("desc.navigatorMode"),
  beaconCatalystLevel: () => t("desc.beaconCatalystLevel"),
  levelCatalystLevel: () => t("desc.levelCatalystLevel"),
  stunReservoirLevel: value => t("desc.stunReservoirLevel", { val: formatSignedDescriptionNumber(value * 40) }),
  stunAfterburnerLevel: value => t("desc.stunAfterburnerLevel", { val: value * 2 }),
  weakSpotPierce: value => t("desc.weakSpotPierce", { val: formatDescriptionNumber(value) }),
  breachAfterburnerSeconds: value => t("desc.breachAfterburnerSeconds", { val: formatDescriptionNumber(value) }),
  breachChainHitsOnTrigger: value => t("desc.breachChainHitsOnTrigger", { val: formatDescriptionNumber(value) }),
  breachThermostatLevel: () => t("desc.breachThermostatLevel"),
  breachPresenceChance: value => t("desc.breachPresenceChance", { val: formatSignedPercent(value, 100) }),
  overdriveBreachChance: value => t("desc.overdriveBreachChance", { val: formatSignedPercent(value, 100) }),
  breachMissCool: value => t("desc.breachMissCool", { val: formatDescriptionNumber(value) }),
  lowFuelWeakSpotChance: value => t("desc.lowFuelWeakSpotChance", { val: formatSignedPercent(value, 100) }),
  weakSpotChancePerLevel: value => t("desc.weakSpotChancePerLevel", { val: formatSignedPercent(value, 100) }),
  luckAsWeakSpotChance: value => t("desc.luckAsWeakSpotChance", { val: formatDescriptionNumber(value) }),
};

const SPECIAL_DESCRIPTION_BUILDERS = {
  thermo_drill(rarity, stats = null) {
    const flat = getEffectValue({ effectByRarity: [0, 0, 20, 25, 30] }, rarity);
    const drillScale = getEffectValue({ effectByRarity: [0, 0, 15, 20, 25] }, rarity);
    const heatBonus = getEffectValue({ effectByRarity: [0, 0, 1, 2, 3] }, rarity);
    const hasDrillPower = Number.isFinite(stats?.drillPower);
    const hasHeat = Number.isFinite(stats?.heat);
    let totalText = "";
    if (hasDrillPower && hasHeat) {
      const total = flat + stats.drillPower * (drillScale / 100) + Math.floor(stats.heat / 10) * heatBonus;
      totalText = ` [${formatDescriptionNumber(total)}]`;
    }
    return t("desc.special.thermo_drill", { flat, scale: formatDescriptionNumber(drillScale), heat: heatBonus, total: totalText });
  },
  basic_drill(rarity, stats = null) {
    const flatDamage = getEffectValue({ effectByRarity: [0, 10, 15, 20, 25] }, rarity);
    const damageScale = getEffectValue({ effectByRarity: [0, 10, 15, 20, 25] }, rarity);
    const hasDrillPower = Number.isFinite(stats?.drillPower);
    const totalText = hasDrillPower
      ? ` [${formatDescriptionNumber(flatDamage + stats.drillPower * (damageScale / 100))}]`
      : "";
    return t("desc.special.basic_drill", { flat: flatDamage, scale: formatDescriptionNumber(damageScale), total: totalText });
  },
  blast_drill(rarity, stats = null) {
    const flatDamage = getEffectValue({ effectByRarity: [0, 6, 10, 14, 18] }, rarity);
    const explosionScale = getEffectValue({ effectByRarity: [0, 30, 40, 50, 60] }, rarity);
    const hasExplosionPower = Number.isFinite(stats?.explosionPower);
    const totalText = hasExplosionPower
      ? ` [${formatDescriptionNumber(flatDamage + stats.explosionPower * (explosionScale / 100))}]`
      : "";
    return t("desc.special.blast_drill", { flat: flatDamage, scale: formatDescriptionNumber(explosionScale), total: totalText });
  },
  tradeoff_drill(rarity, stats = null) {
    const flatDamage = getEffectValue({ effectByRarity: [0, 16, 22, 30, 40] }, rarity);
    const drillScale = 10;
    const penalty = getEffectValue({ effectByRarity: [0, -0.3, -0.3, -0.3, -0.3] }, rarity);
    const totalText = Number.isFinite(stats?.drillPower)
      ? ` [${formatDescriptionNumber(flatDamage + stats.drillPower * (drillScale / 100))}]`
      : "";
    return t("desc.special.tradeoff_drill", {
      flat: flatDamage,
      scale: formatDescriptionNumber(drillScale),
      total: totalText,
      penalty: formatSignedPercent(penalty, 100),
    });
  },
  fragile_drill(rarity, stats = null) {
    const flatDamage = getEffectValue({ effectByRarity: [0, 10, 15, 20, 25] }, rarity);
    const damageScale = getEffectValue({ effectByRarity: [0, 10, 15, 20, 25] }, rarity);
    const speedBonus = getEffectValue({ effectByRarity: [0, 10, 15, 20, 30] }, rarity);
    const hasDrillPower = Number.isFinite(stats?.drillPower);
    const totalText = hasDrillPower
      ? ` [${formatDescriptionNumber(flatDamage + stats.drillPower * (damageScale / 100))}]`
      : "";
    return t("desc.special.fragile_drill", { flat: flatDamage, scale: formatDescriptionNumber(damageScale), total: totalText, speed: formatSignedPercent(speedBonus) });
  },
  lucky_pickaxe(rarity, stats = null) {
    const flatDamage = getEffectValue({ effectByRarity: [0, 10, 15, 20, 25] }, rarity);
    const damageScale = getEffectValue({ effectByRarity: [0, 10, 20, 30, 40] }, rarity);
    const luckScale = getEffectValue({ effectByRarity: [0, 10, 15, 20, 25] }, rarity);
    const oreGain = getEffectValue({ effectByRarity: [0, 1, 2, 3, 4] }, rarity);
    const hasDrillPower = Number.isFinite(stats?.drillPower);
    const hasLuck = Number.isFinite(stats?.luck);
    const totalText = hasDrillPower && hasLuck
      ? ` [${formatDescriptionNumber(flatDamage + stats.drillPower * (damageScale / 100) + stats.luck * (luckScale / 100))}]`
      : "";
    return t("desc.special.lucky_pickaxe", { flat: flatDamage, scale: formatDescriptionNumber(damageScale), luck: formatDescriptionNumber(luckScale), total: totalText, ore: oreGain });
  },
  shard_drill(rarity, stats = null) {
    const flatDamage = getEffectValue({ effectByRarity: [0, 8, 12, 16, 20] }, rarity);
    const weakSpotChance = getEffectValue({ effectByRarity: [0, 0.04, 0.06, 0.08, 0.10] }, rarity);
    const explosionDamage = getEffectValue({ effectByRarity: [0, 20, 30, 45, 60] }, rarity);
    const explosionScale = 10;
    const hasExplosionPower = Number.isFinite(stats?.explosionPower);
    const totalText = Number.isFinite(stats?.drillPower) ? ` [${formatDescriptionNumber(flatDamage)}]` : "";
    const explosionTotal = hasExplosionPower
      ? ` [${formatDescriptionNumber(explosionDamage + stats.explosionPower * (explosionScale / 100))}]`
      : "";
    return t("desc.special.shard_drill", { flat: flatDamage, total: totalText, chance: formatDescriptionNumber(weakSpotChance * 100), explosion: formatDescriptionNumber(explosionDamage), expScale: explosionScale, explosionTotal });
  },
  breach_missile(rarity, stats = null) {
    const flatDamage = getEffectValue({ effectByRarity: [0, 10, 10, 10, 10] }, rarity);
    const drillScale = getEffectValue({ effectByRarity: [0, 10, 15, 20, 25] }, rarity);
    const weakSpotChance = getEffectValue({ effectByRarity: [0, 0, 0.05, 0.05, 0.05] }, rarity);
    const rocketDamage = 20;
    const rocketExplosionScale = getEffectValue({ effectByRarity: [0, 30, 40, 50, 60] }, rarity);
    const hasDrillPower = Number.isFinite(stats?.drillPower);
    const hasExplosionPower = Number.isFinite(stats?.explosionPower);
    const totalDamage = hasDrillPower
      ? ` [${formatDescriptionNumber(flatDamage + stats.drillPower * (drillScale / 100))}]`
      : "";
    const rocketTotal = hasExplosionPower
      ? ` [${formatDescriptionNumber(rocketDamage + stats.explosionPower * (rocketExplosionScale / 100))}]`
      : "";
    return t("desc.special.breach_missile", {
      flat: formatDescriptionNumber(flatDamage),
      drillScale: formatDescriptionNumber(drillScale),
      totalDamage,
      chance: formatDescriptionNumber(weakSpotChance * 100),
      rocket: formatDescriptionNumber(rocketDamage),
      expScale: formatDescriptionNumber(rocketExplosionScale),
      rocketTotal,
      radius: "1.5",
    });
  },
  breach_afterburner(rarity, stats = null) {
    const flatDamage = 12;
    const drillScale = getEffectValue({ effectByRarity: [0, 10, 12, 15, 20] }, rarity);
    const weakSpotScale = getEffectValue({ effectByRarity: [0, 2, 4, 6, 10] }, rarity);
    const seconds = getEffectValue({ effectByRarity: [0, 1, 1, 2, 2] }, rarity);
    const hasDrillPower = Number.isFinite(stats?.drillPower);
    const hasWeakSpotMult = Number.isFinite(stats?.weakSpotMult);
    const totalText = hasDrillPower && hasWeakSpotMult
      ? ` [${formatDescriptionNumber(flatDamage + stats.drillPower * (drillScale / 100) + (stats.weakSpotMult * 100) * (weakSpotScale / 100))}]`
      : "";
    return t("desc.special.breach_afterburner", {
      flat: formatDescriptionNumber(flatDamage),
      drillScale: formatDescriptionNumber(drillScale),
      weakSpotScale: formatDescriptionNumber(weakSpotScale),
      total: totalText,
      sec: formatDescriptionNumber(seconds),
    });
  },
  breach_chain_drill(rarity, stats = null) {
    const flatDamage = 15;
    const explosionScale = getEffectValue({ effectByRarity: [0, 10, 12, 15, 20] }, rarity);
    const weakSpotChanceScale = getEffectValue({ effectByRarity: [0, 2, 4, 6, 10] }, rarity);
    const charges = getEffectValue({ effectByRarity: [0, 1, 2, 3, 4] }, rarity);
    const hasExplosionPower = Number.isFinite(stats?.explosionPower);
    const hasWeakSpotChance = Number.isFinite(stats?.weakSpotChance);
    const totalText = hasExplosionPower && hasWeakSpotChance
      ? ` [${formatDescriptionNumber(flatDamage + stats.explosionPower * (explosionScale / 100) + (stats.weakSpotChance * 100) * (weakSpotChanceScale / 100))}]`
      : "";
    return t("desc.special.breach_chain_drill", {
      flat: formatDescriptionNumber(flatDamage),
      explosionScale: formatDescriptionNumber(explosionScale),
      weakSpotChanceScale: formatDescriptionNumber(weakSpotChanceScale),
      total: totalText,
      hits: formatDescriptionNumber(charges),
    });
  },
  beacon_alchemy_drill(rarity, stats = null) {
    const baseFlat = 12;
    const beaconFlat = 20;
    const beaconScale = getEffectValue({ effectByRarity: [0, 15, 20, 25, 30] }, rarity);
    const hasDrillPower = Number.isFinite(stats?.drillPower);
    const baseTotal = ` [${formatDescriptionNumber(baseFlat)}]`;
    const beaconTotal = hasDrillPower
      ? ` [${formatDescriptionNumber(beaconFlat + stats.drillPower * (beaconScale / 100))}]`
      : "";
    return t("desc.special.beacon_alchemy_drill", {
      baseFlat: formatDescriptionNumber(baseFlat),
      baseTotal,
      beaconFlat: formatDescriptionNumber(beaconFlat),
      beaconScale: formatDescriptionNumber(beaconScale),
      beaconTotal,
      radius: "10",
    });
  },
  recipe_alchemy_drill(rarity, stats = null) {
    const baseFlat = 5;
    const perRecipe = getEffectValue({ effectByRarity: [0, 5, 7, 9, 11] }, rarity);
    const recipeCount = Math.max(0, Math.round(stats?.recipesCompletedThisRun || 0));
    const total = ` [${formatDescriptionNumber(baseFlat + perRecipe * recipeCount)}]`;
    return t("desc.special.recipe_alchemy_drill", {
      baseFlat: formatDescriptionNumber(baseFlat),
      perRecipe: formatDescriptionNumber(perRecipe),
      recipes: formatDescriptionNumber(recipeCount),
      total,
    });
  },
};

function buildEffectDescription(effect, rarity) {
  if (!effect?.stat) return "";
  const value = getEffectValue(effect, rarity);
  const formatter = SIMPLE_STAT_DESCRIPTORS[effect.stat];
  return formatter ? formatter(value) : "";
}

export function getGoodDescription(good, rarity = RARITY.COMMON, stats = null) {
  if (!good) return "";

  const specialBuilder = SPECIAL_DESCRIPTION_BUILDERS[good.id];
  if (specialBuilder) {
    return specialBuilder(rarity, stats);
  }

  if (Array.isArray(good.descParts) && good.descParts.length > 0) {
    const effects = Array.isArray(good.effect)
      ? good.effect
      : (good.effect ? [good.effect] : []);
    return good.descParts
      .map((part) => {
        if (typeof part === "string") return part.trim();
        if (part?.type === "effect") {
          const effect = part.effect ?? effects[part.index ?? 0];
          return buildEffectDescription(effect, rarity);
        }
        return "";
      })
      .filter(Boolean)
      .join(".\n");
  }

  const effects = Array.isArray(good.effect)
    ? good.effect
    : (good.effect ? [good.effect] : []);
  const autoLines = effects
    .map(effect => buildEffectDescription(effect, rarity))
    .filter(Boolean);

  if (autoLines.length > 0) {
    return `${autoLines.join(".\n")}.`;
  }

  return good.desc || "";
}
