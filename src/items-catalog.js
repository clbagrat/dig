export const RARITY = {
  COMMON: 1,
  UNCOMMON: 2,
  RARE: 3,
  LEGENDARY: 4,
};

export const RARITY_NAMES = {
  1: "Обычный",
  2: "Необычный",
  3: "Редкий",
  4: "Легендарный",
};

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

export const RARITY_COST_MULT = {
  1: 1,
  2: 1.8,
  3: 3,
  4: 5,
};

export const CATEGORIES = [
  { id: "basic", name: "Базовое", icon: "D" },
  { id: "economy", name: "Экономика", icon: "●" },
  { id: "maintenance", name: "Обслуживание", icon: "💧" },
  { id: "heat", name: "Нагрев", icon: "🔥" },
  { id: "выживание", name: "Выживание", icon: "❤️" },
  { id: "поиск_бреши", name: "Поиск бреши", icon: "🎯" },
  { id: "ракеты", name: "Ракеты", icon: "🚀" },
  { id: "контур", name: "Контур", icon: "⚡" },
  { id: "навигация", name: "Навигация", icon: "🔭" },
  { id: "алхимия", name: "Алхимия", icon: "⚗️" },
];

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
    baseCost: 40,
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
    baseCost: 30,
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
    baseCost: 35,
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
    baseCost: 30,
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
    baseCost: 50,
    effect: { stat: "fuelConverterLevel", effectByRarity: [null, null, 1, 2, 3] },
  },
  {
    id: "adrenaline",
    type: "equipment",
    name: "Адреналин",
    icon: "💉",
    desc: "+30% скорость бура при HP ≤ 1.",
    category: "выживание",
    tags: ["выживание"],
    minRarity: 2,
    baseCost: 45,
    effect: { stat: "adrenalineLevel", effectByRarity: [null, null, 1, 1, 2] },
  },
  {
    id: "ore_injector",
    type: "equipment",
    name: "Рудный инжектор",
    icon: "⚗️",
    desc: "Удар по бреши восстанавливает +15 топлива. −5% скорость бура.",
    category: "поиск_бреши",
    tags: ["поиск_бреши"],
    minRarity: 2,
    baseCost: 45,
    effect: [
      { stat: "weakSpotFuelGain", effectByRarity: [null, null, 15, 25, 40] },
      { stat: "strikeSpeed",      effectByRarity: [null, null, -5, -5, -5] },
    ],
  },

  // ── Контур ────────────────────────────────────────────────────────────────────
  {
    id: "contour_charge",
    type: "equipment",
    name: "Контурный заряд",
    icon: "🔋",
    desc: "+1 уровень контурного заряда. +10% длительность эффектов.",
    category: "контур",
    tags: ["контур"],
    minRarity: 2,
    baseCost: 50,
    effect: [
      { stat: "loopChargeLevel",    effectByRarity: [null, null, 1, 1, 2] },
      { stat: "effectDurationRate", effectByRarity: [null, null, 0.10, 0.18, 0.28] },
    ],
  },
  {
    id: "loop_pressure",
    type: "equipment",
    name: "Контурное давление",
    icon: "🔩",
    desc: "Каждая клетка контура даёт +1% к урону бурения.",
    category: "контур",
    tags: ["контур", "урон"],
    minRarity: 2,
    baseCost: 55,
    effect: [
      { stat: "loopLengthDamageBonus", effectByRarity: [null, null, 1, 2, 3] },
    ],
  },
  {
    id: "loop_conduit",
    type: "equipment",
    name: "Топливный контур",
    icon: "🌊",
    desc: "Каждая клетка контура даёт +0.5 топлива при поднятии.",
    category: "контур",
    tags: ["контур", "топливо"],
    minRarity: 1,
    baseCost: 40,
    effect: [
      { stat: "loopLengthFuelBonus", effectByRarity: [null, 0.5, 0.8, 1.2, 2.0] },
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
    baseCost: 50,
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
    desc: "При попадании в брешь запускает ракету. +5% шанс бреши.",
    category: "ракеты",
    tags: ["ракеты"],
    minRarity: 2,
    baseCost: 50,
    effect: [
      { stat: "breachMissileLevel", effectByRarity: [null, null, 1, 1, 1] },
      { stat: "weakSpotChance",     effectByRarity: [null, null, 0.05, 0.08, 0.12] },
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
    baseCost: 50,
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
    baseCost: 50,
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
    baseCost: 35,
    effect: [
      { stat: "drillPower",   effectByRarity: [null, 8, 10, 12, 15] },
      { stat: "strikeSpeed",  effectByRarity: [null, -10, -10, -10, -10] },
    ],
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
    baseCost: 30,
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
    baseCost: 50,
    effect: { stat: "maxHp", value: 25 },
  },
  {
    id: "afterburner",
    type: "item",
    name: "Форсажная камера",
    icon: "💨",
    desc: "+15% скорость бура. −1 макс. HP (не ниже 1).",
    descParts: [
      { type: "effect", index: 0 },
      "−1 к макс. HP (не ниже 1)",
    ],
    category: "maintenance",
    tags: ["maintenance"],
    minRarity: 1,
    baseCost: 60,
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
    category: "навигация",
    tags: ["навигация"],
    minRarity: 3,
    maxRarity: 3,
    baseCost: 54,
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
    baseCost: 35,
    effect: { stat: "miningGoldBonusMultiplier", effectByRarity: [null, 0.1, 0.15, 0.2, 0.3] },
  },
  {
    id: "gold_probe",
    type: "item",
    name: "Золотой щуп",
    icon: "✨",
    desc: "Радары маяков показывают жёлтый указатель на ближайшее золотое скопление (5+ блоков).",
    category: "навигация",
    tags: ["навигация"],
    minRarity: 2,
    maxRarity: 2,
    baseCost: 45,
    unique: true,
    effect: { stat: "goldRadarMode", value: 1 },
  },
  {
    id: "navigator",
    type: "item",
    name: "Навигатор",
    icon: "📡",
    desc: "Радары маяков показывают белый указатель на ближайший неактивированный маяк на той же глубине.",
    category: "навигация",
    tags: ["навигация"],
    minRarity: 1,
    baseCost: 50,
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
    baseCost: 30,
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
    baseCost: 35,
    effect: {
      stat: "weakSpotChance",
      effectByRarity: [null, 0.03, 0.05, 0.08, 0.10],
    },
  },
  // ─── Level-up bonus items ──────────────────────────────────────────────────
  // Each of these grants a bonus every time the player gains a level.
  {
    id: "learning_algorithm",
    type: "item",
    name: "Учебный алгоритм",
    icon: "🧠",
    desc: "При каждом уровне: +0.35 к силе удара бура.",
    category: "basic",
    tags: ["basic"],
    minRarity: 1,
    baseCost: 40,
    effect: {
      stat: "drillPowerPerLevel",
      effectByRarity: [null, 0.35, 0.5, 0.7, 1.0],
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
    baseCost: 35,
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
    baseCost: 35,
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
    baseCost: 50,
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
    baseCost: 35,
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
    baseCost: 35,
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
    baseCost: 40,
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
    baseCost: 35,
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
    baseCost: 45,
    effect: [
      { stat: "healPerLevel", effectByRarity: [null, null, 25, 50, 75] },
      { stat: "maxHp",        effectByRarity: [null, null, -25, -25, -25] },
    ],
  },
  {
    id: "reinforced_frame",
    type: "item",
    name: "Усиленная рама",
    icon: "🦺",
    desc: "+1 броня. −8% скорость бура.",
    category: "выживание",
    tags: ["выживание"],
    minRarity: 1,
    baseCost: 40,
    effect: [
      { stat: "armor",       effectByRarity: [null, 25, 50, 75, 125] },
      { stat: "strikeSpeed", effectByRarity: [null, -8, -10, -12, -15] },
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
    baseCost: 35,
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
    desc: "+0.4 урон по бреши. +1 обзор. −2 удача.",
    category: "поиск_бреши",
    tags: ["поиск_бреши"],
    minRarity: 2,
    baseCost: 45,
    effect: [
      { stat: "weakSpotMult", effectByRarity: [null, null, 0.4, 0.7, 1.0] },
      { stat: "visionRadius", effectByRarity: [null, null, 1,   1,   2  ] },
      { stat: "luck",         effectByRarity: [null, null, -2,  -3,  -4 ] },
    ],
  },

  // ── Навигация ─────────────────────────────────────────────────────────────────
  {
    id: "crystal_detector",
    type: "item",
    name: "Детектор кристаллов",
    icon: "💎",
    desc: "Кольцевые подсказки на ближайшие кристаллы. +1 обзор. −2 удача.",
    category: "навигация",
    tags: ["навигация"],
    minRarity: 1,
    baseCost: 40,
    unique: true,
    maxRarity: 2,
    effect: [
      { stat: "radarCrystalModule", value: 1 },
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
    category: "навигация",
    tags: ["навигация"],
    minRarity: 1,
    baseCost: 40,
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
    baseCost: 35,
    effect: [
      { stat: "xpBonusMultiplier",         effectByRarity: [null, 0.08, 0.12, 0.18, 0.28] },
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
    baseCost: 40,
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
    baseCost: 35,
    effect: [
      { stat: "xpBonusMultiplier",        effectByRarity: [null, 0.10, 0.15, 0.22, 0.32] },
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
    baseCost: 45,
    effect: [
      { stat: "explosionDamageMultiplier", effectByRarity: [null, null, 0.30, 0.50, 0.80] },
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
    baseCost: 50,
    effect: [
      { stat: "heatExplosionRadiusBonus",  effectByRarity: [null, null, 1.0, 1.5, 2.0] },
      { stat: "explosionDamageMultiplier", effectByRarity: [null, null, 0.20, 0.35, 0.50] },
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
    baseCost: 45,
    effect: [
      { stat: "damageBonus",               effectByRarity: [null, null, 15,   22,   30  ] },
      { stat: "heatExplosionRadiusBonus",  effectByRarity: [null, null, -0.5, -0.8, -1.0] },
      { stat: "fuelDrainRate",             effectByRarity: [null, null, 0.10, 0.15, 0.20] },
    ],
  },

  {
    id: "explosive_condenser",
    type: "item",
    name: "Взрывной конденсор",
    icon: "💥",
    desc: "При перегреве взрыв сильнее и шире. −10% концентрация.",
    category: "heat",
    tags: ["heat"],
    minRarity: 1,
    baseCost: 40,
    effect: [
      { stat: "heatExplosionDamageBonus", effectByRarity: [null, 0.25, 0.50, 0.75, 1.00] },
      { stat: "heatExplosionRadiusBonus", effectByRarity: [null, 0.5,  1.0,  1.5,  2.0 ] },
      { stat: "concentration",            effectByRarity: [null, -0.10, -0.15, -0.20, -0.30] },
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
    baseCost: 35,
    effect: [
      { stat: "heatRate",      effectByRarity: [null, -0.15, -0.20, -0.30, -0.40] },
      { stat: "concentration", effectByRarity: [null, -0.10, -0.15, -0.20, -0.30] },
    ],
  },
  {
    id: "first_strike",
    type: "item",
    name: "Инициатор",
    icon: "⚔️",
    desc: "+40% урон бура 6 сек после активации маяка.",
    category: "maintenance",
    tags: ["maintenance"],
    minRarity: 2,
    baseCost: 45,
    effect: { stat: "firstStrikeLevel", effectByRarity: [null, null, 1, 1, 2] },
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
    baseCost: 35,
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
    baseCost: 35,
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
    baseCost: 35,
    effect: [
      { stat: "luck",             effectByRarity: [null, 2,     3,     5,     8    ] },
      { stat: "xpBonusMultiplier",effectByRarity: [null, -0.03, -0.05, -0.07, -0.10] },
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
    baseCost: 50,
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
    baseCost: 40,
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
    baseCost: 35,
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
    baseCost: 45,
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
    desc: "+5% шанс бреши. +0.3 урон по бреши.",
    category: "поиск_бреши",
    tags: ["поиск_бреши"],
    minRarity: 1,
    baseCost: 35,
    effect: [
      { stat: "weakSpotChance", effectByRarity: [null, 0.05, 0.08, 0.12, 0.18] },
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
    minRarity: 2,
    baseCost: 50,
    unique: true,
    effect: [
      { stat: "weakSpotChance",  effectByRarity: [null, null, 0.04, 0.07, 0.12] },
      { stat: "weakSpotMult",    effectByRarity: [null, null, 0.5,  0.8,  1.2 ] },
      { stat: "weakSpotPierce",  effectByRarity: [null, null, 1,    1,    1   ] },
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
    baseCost: 30,
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
    baseCost: 35,
    effect: { stat: "maxLoopLength", effectByRarity: [null, 3, 5, 8, 12] },
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
    baseCost: 50,
    effect: [
      { stat: "loopSpawnBonusChance", effectByRarity: [null, null, 0.30, 0.50, 0.75] },
      { stat: "maxLoopLength",        effectByRarity: [null, null, -3,   -3,   -3   ] },
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
    baseCost: 60,
    unique: true,
    effect: { stat: "beaconCatalystLevel", value: 1 },
  },
  {
    id: "recipe_reroller",
    type: "item",
    name: "Реролл рецепта",
    icon: "🎲",
    desc: "+1 попытка при выборе награды за рецепт. −5% опыт.",
    category: "алхимия",
    tags: ["алхимия"],
    minRarity: 2,
    baseCost: 45,
    effect: [
      { stat: "crystalRewardRerolls", effectByRarity: [null, null, 1, 2, 3] },
      { stat: "xpBonusMultiplier",    effectByRarity: [null, null, -0.05, -0.08, -0.12] },
    ],
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
    baseCost: 40,
    effect: [
      { stat: "crystalGoldGain",          effectByRarity: [null, 15, 25, 40, 60] },
      { stat: "xpBonusMultiplier",        effectByRarity: [null, -0.08, -0.10, -0.14, -0.20] },
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
    baseCost: 35,
    effect: [
      { stat: "crystalXpGain", effectByRarity: [null, 50, 80, 120, 180] },
      { stat: "luck",          effectByRarity: [null, -2, -3, -4, -6] },
    ],
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
    baseCost: 60,
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
    baseCost: 45,
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
    baseCost: 50,
    effect: { stat: "stunAfterburnerLevel", effectByRarity: [null, null, 1, 1, 2] },
  },

  {
    id: "black_market",
    type: "item",
    name: "Чёрный рынок",
    icon: "🏴",
    desc: "−10% к стоимости предметов в магазине.",
    category: "economy",
    tags: ["economy"],
    minRarity: 1,
    baseCost: 45,
    effect: {
      stat: "shopPriceDiscount",
      effectByRarity: [null, 0.10, 0.15, 0.20, 0.30],
    },
  },
];

export const ALL_GOODS = [...ALL_EQUIPMENT, ...ALL_ITEMS];

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
  drillPower: value => `${formatSignedDescriptionNumber(value)} к силе бура`,
  strikeSpeed: value => `${formatSignedPercent(value)} к скорости бура`,
  maxHp: value => `${formatSignedDescriptionNumber(value)} к макс. HP`,
  maxFuel: value => `${formatSignedDescriptionNumber(value)} к макс. топливу`,
  maxHeat: value => `${formatSignedDescriptionNumber(value)} к макс. нагреву`,
  visionRadius: value => `${formatSignedDescriptionNumber(value)} к радиусу обзора`,
  luck: value => `${formatSignedDescriptionNumber(value)} к удаче`,
  armor: value => `${formatSignedDescriptionNumber(value)} к броне`,
  weakSpotChance: value => `${formatSignedPercent(value, 100)} к шансу бреши`,
  weakSpotMult: value => `${formatSignedDescriptionNumber(value)} к урону по бреши`,
  damageBonus: value => `${formatSignedPercent(value)} к общему урону`,
  heatRate: value => `${formatSignedPercent(value, 100)} к скорости нагрева`,
  effectDurationRate: value => `${formatSignedPercent(value, 100)} к длительности эффектов`,
  concentration: value => `${formatSignedPercent(value, 100)} к концентрации`,
  fuelDrainRate: value => `${formatSignedPercent(value, 100)} к расходу топлива`,
  miningGoldBonusMultiplier: value => `${formatSignedPercent(value, 100)} к золоту с жил`,
  xpBonusMultiplier: value => `${formatSignedPercent(value, 100)} к опыту`,
  bonusFindChance: value => `${formatSignedPercent(value, 100)} к шансу находки`,
  speedOfAutoClose: value => `${formatSignedPercent(value)} к скорости автозамыкания`,
  explosionDamageMultiplier: value => `${formatSignedPercent(value, 100)} к урону взрывов`,
  heatExplosionRadiusBonus: value => `${formatSignedDescriptionNumber(value)} к радиусу взрыва перегрева`,
  shopPriceDiscount: value => `${formatSignedPercent(value, 100)} к скидке в магазине`,
  weakSpotFuelGain: value => `При ударе по бреши: ${formatSignedDescriptionNumber(value)} топлива`,
  drillPowerPerLevel: value => `При каждом уровне: ${formatSignedDescriptionNumber(value)} к силе бура`,
  fuelPerLevel: value => `При каждом уровне: ${formatSignedDescriptionNumber(value)} топлива`,
  strikeSpeedPerLevel: value => `При каждом уровне: ${formatSignedPercent(value)} к скорости бура`,
  healPerLevel: value => `При каждом уровне: лечение ${formatSignedDescriptionNumber(value)} HP`,
  goldBonusPerLevel: value => `При каждом уровне: ${formatSignedPercent(value, 100)} к золоту с жил`,
  loopLengthDamageBonus: value => `Каждая клетка контура даёт ${formatSignedPercent(value)} к урону бурения`,
  loopLengthFuelBonus: value => `Каждая клетка контура даёт ${formatSignedDescriptionNumber(value)} топлива при подъёме`,
  maxLoopLength: value => `${formatSignedDescriptionNumber(value)} к максимальной длине контура`,
  loopSpawnBonusChance: value => `Замкнутый контур с шансом ${formatUnsignedPercent(value, 100)} создаёт бонус внутри`,
  heatExplosionDamageBonus: value => `${formatSignedPercent(value, 100)} к урону взрыва от перегрева`,
  crystalRewardRerolls: value => `${formatSignedDescriptionNumber(value)} попытка к выбору награды за рецепт`,
  crystalGoldGain: value => `Подбор кристалла даёт ${formatSignedDescriptionNumber(value)} золота`,
  crystalXpGain: value => `Подбор кристалла даёт ${formatSignedDescriptionNumber(value)} XP`,
  adrenalineLevel: value => `При HP ≤ 1: +${value * 30}% к скорости бура`,
  firstStrikeLevel: value => `После активации маяка: +${value * 40}% к урону бура на ${value * 6} сек`,
  insuranceLevel: value => `При уроне сохраняет ${[0, 30, 50, 70, 90][Math.min(4, Math.max(0, value))] || 0}% небезопасного золота`,
  fuelConverterLevel: value => `Пополнение сверх макс. топлива даёт форсаж на ${2 + value} сек`,
  loopChargeLevel: value => `${formatSignedDescriptionNumber(value)} уровень контурного заряда`,
  stunDetonatorLevel: value => `При оглушении: взрыв вокруг бура${value > 1 ? ` x${value}` : ""}`,
  breachMissileLevel: value => `При попадании в брешь запускает ${formatDescriptionNumber(value)} ракет${value >= 5 ? "" : value >= 2 ? "ы" : "у"}`,
  cryoRocketCount: value => `За каждое сильное остывание выпускает ${formatDescriptionNumber(value)} крио-ракет${value >= 5 ? "" : value >= 2 ? "ы" : "у"}`,
  fuelRocketLevel: value => `Пополнение топлива выпускает ${formatDescriptionNumber(value)} ракет${value >= 5 ? "" : value >= 2 ? "ы" : "у"}`,
  radarCrystalModule: () => "Кольцевые подсказки на ближайшие кристаллы",
  artifactRadarMode: () => "Радары маяков показывают фиолетовый указатель на ближайший артефакт",
  goldRadarMode: () => "Радары маяков показывают жёлтый указатель на ближайшее золотое скопление (5+ блоков)",
  navigatorMode: () => "Радары маяков показывают белый указатель на ближайший неактивированный маяк на той же глубине",
  beaconCatalystLevel: () => "Активация маяка мгновенно завершает текущий рецепт",
  levelCatalystLevel: () => "Повышение уровня мгновенно завершает текущий рецепт",
  stunReservoirLevel: value => `При оглушении: ${formatSignedDescriptionNumber(value * 40)} топлива`,
  stunAfterburnerLevel: value => `После оглушения включается форсаж; длительность = x${value * 2} от времени стана`,
  weakSpotPierce: () => "Пробитие бреши насквозь",
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
      const total = flat
        + stats.drillPower * (drillScale / 100)
        + Math.floor(stats.heat / 10) * heatBonus;
      totalText = ` [${formatDescriptionNumber(total)}]`;
    }
    return `Урон ${flat} + ${formatDescriptionNumber(drillScale)}% от силы бура + ${heatBonus} за каждые 10 нагрева${totalText}.`;
  },
  basic_drill(rarity, stats = null) {
    const flatDamage = getEffectValue({ effectByRarity: [0, 10, 15, 20, 25] }, rarity);
    const damageScale = getEffectValue({ effectByRarity: [0, 10, 15, 20, 25] }, rarity);
    const hasDrillPower = Number.isFinite(stats?.drillPower);
    const totalText = hasDrillPower
      ? ` [${formatDescriptionNumber(flatDamage + stats.drillPower * (damageScale / 100))}]`
      : "";
    return `Урон ${flatDamage} + ${formatDescriptionNumber(damageScale)}% от силы бура${totalText}.`;
  },
  fragile_drill(rarity, stats = null) {
    const flatDamage = getEffectValue({ effectByRarity: [0, 10, 15, 20, 25] }, rarity);
    const damageScale = getEffectValue({ effectByRarity: [0, 10, 15, 20, 25] }, rarity);
    const speedBonus = getEffectValue({ effectByRarity: [0, 10, 15, 20, 30] }, rarity);
    const hasDrillPower = Number.isFinite(stats?.drillPower);
    const totalText = hasDrillPower
      ? ` [${formatDescriptionNumber(flatDamage + stats.drillPower * (damageScale / 100))}]`
      : "";
    return `Урон ${flatDamage} + ${formatDescriptionNumber(damageScale)}% от силы бура${totalText}.\n${formatSignedPercent(speedBonus)} к скорости бура, пока есть броня.`;
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
    return `Урон ${flatDamage} + ${formatDescriptionNumber(damageScale)}% от силы бура + ${formatDescriptionNumber(luckScale)}% от удачи${totalText}.\nПри ударе по золотой жиле её ценность растёт на ${oreGain}.`;
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
