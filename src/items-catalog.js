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
];

export const INITIAL_CATEGORIES = ["basic", "economy"];
export const TAG_SYNERGIES = {};

export const ALL_EQUIPMENT = [
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

export const ALL_ITEMS = [];
export const ALL_GOODS = [...ALL_EQUIPMENT, ...ALL_ITEMS];
