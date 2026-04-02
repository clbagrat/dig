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
];

export const INITIAL_CATEGORIES = ["basic", "economy"];
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
    category: "basic",
    tags: ["basic"],
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
];

export const ALL_ITEMS = [
  {
    id: "heavy_drill",
    type: "item",
    name: "Утяжелитель",
    icon: "⚒️",
    desc: "+3 drillPower. Скорость −10%.",
    category: "basic",
    tags: ["basic"],
    minRarity: 1,
    baseCost: 35,
    effect: [
      { stat: "drillPower",   effectByRarity: [null, 3, 5, 8, 12] },
      { stat: "strikeSpeed",  effectByRarity: [null, -10, -12, -15, -18] },
    ],
  },
  {
    id: "planning",
    type: "item",
    name: "Планирование",
    icon: "🗒️",
    desc: "+1% скорость замыкания контура.",
    category: "economy",
    tags: ["economy"],
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
    category: "basic",
    tags: ["basic"],
    minRarity: 1,
    baseCost: 50,
    effect: { stat: "maxHp", value: 1 },
  },
  {
    id: "afterburner",
    type: "item",
    name: "Форсажная камера",
    icon: "💨",
    desc: "+15% скорость бура. −1 макс. HP (не ниже 1).",
    category: "basic",
    tags: ["basic"],
    minRarity: 1,
    baseCost: 60,
    effect: [
      { stat: "strikeSpeed", effectByRarity: [null, 15, 22, 30, 40] },
      { stat: "maxHp",       effectByRarity: [null, -1, -1, -1, -1] },
    ],
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
];
export const ALL_GOODS = [...ALL_EQUIPMENT, ...ALL_ITEMS];
