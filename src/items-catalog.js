/**
 * Каталог товаров магазина.
 *
 * Два типа:
 *   equipment — части корпуса, занимают слоты, имеют теги для синергий
 *   item      — предметы, не занимают слоты, стат-бусты и пассивки
 *
 * Общие поля:
 *   id        — уникальный строковый идентификатор
 *   type      — "equipment" | "item"
 *   name      — отображаемое название
 *   icon      — символ/emoji
 *   desc      — описание базового эффекта
 *   category  — пул-категория (разблокируется артефактом)
 *   minRarity — минимальная редкость (1-4)
 *   baseCost  — цена на Common; масштабируется по редкости
 *
 * Только equipment:
 *   tags      — массив строк для синергий (НЕ тоже самое что category)
 *
 * Только item:
 *   effect    — { stat, value } — базовое значение × множитель редкости
 */

// ── Редкость ────────────────────────────────────────────────────────────────────

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

/** Множитель эффекта по редкости */
export const RARITY_EFFECT_MULT = {
  1: 1,
  2: 1.5,
  3: 2,
  4: 3,
};

/** Множитель стоимости по редкости */
export const RARITY_COST_MULT = {
  1: 1,
  2: 1.8,
  3: 3,
  4: 5,
};

// ── Категории (пулы) ────────────────────────────────────────────────────────────

export const CATEGORIES = [
  { id: "stats",       name: "Статы",      icon: "▲" },
  { id: "extra_drill", name: "Экстра бур", icon: "⛏" },
  { id: "fuel",        name: "Топливо",    icon: "⛽" },
  { id: "vision",      name: "Обзор",      icon: "◉" },
  { id: "contour",     name: "Контур",     icon: "◎" },
  { id: "heat",        name: "Нагрев",     icon: "☇" },
  { id: "survival",    name: "Выживание",  icon: "✚" },
  { id: "missiles",    name: "Ракеты",     icon: "🚀" },
];

export const INITIAL_CATEGORIES = ["stats"];

// ── Tag synergy бонусы ──────────────────────────────────────────────────────────

/**
 * Синергии за набор тегов.
 * Ключ — тег, значение — массив порогов { count, bonuses }.
 * bonuses — массив { stat, value } изменений к state.
 */
export const TAG_SYNERGIES = {
  drill: [
    { count: 2, bonuses: [{ stat: "strikeSpeed", value: 0.1 }] },
    { count: 3, bonuses: [{ stat: "strikeSpeed", value: 0.2 }] },
    { count: 4, bonuses: [{ stat: "strikeSpeed", value: 0.35 }] },
  ],
  heat: [
    { count: 2, bonuses: [{ stat: "maxHeat", value: 10 }] },
    { count: 3, bonuses: [{ stat: "maxHeat", value: 20 }] },
    { count: 4, bonuses: [{ stat: "heatDamageBonus", value: 0.15 }] },
  ],
  fuel: [
    { count: 2, bonuses: [{ stat: "maxFuel", value: 30 }] },
    { count: 3, bonuses: [{ stat: "fuelDrainRate", value: -0.05 }] },
    { count: 4, bonuses: [{ stat: "maxFuel", value: 50 }] },
  ],
  vision: [
    { count: 2, bonuses: [{ stat: "visionRadius", value: 1 }] },
    { count: 3, bonuses: [{ stat: "radarCrystalModule", value: 1 }] },
    { count: 4, bonuses: [{ stat: "visionRadius", value: 2 }] },
  ],
  contour: [
    { count: 2, bonuses: [{ stat: "loopChargeLevel", value: 1 }] },
    { count: 3, bonuses: [{ stat: "idleAutoCloseDelay", value: -0.5 }] },
    { count: 4, bonuses: [{ stat: "loopPerkLevel", value: 1 }] },
  ],
  explosive: [
    { count: 2, bonuses: [{ stat: "heatExplosionRadiusBonus", value: 0.5 }] },
    { count: 3, bonuses: [{ stat: "heatExplosionDamageBonus", value: 1 }] },
    { count: 4, bonuses: [{ stat: "heatExplosionRadiusBonus", value: 1 }] },
  ],
  defense: [
    { count: 2, bonuses: [{ stat: "maxHp", value: 1 }] },
    { count: 3, bonuses: [{ stat: "armor", value: 1 }] },
    { count: 4, bonuses: [{ stat: "maxHp", value: 2 }] },
  ],
  economy: [
    { count: 2, bonuses: [{ stat: "goldBonus", value: 2 }] },
    { count: 3, bonuses: [{ stat: "luck", value: 5 }] },
    { count: 4, bonuses: [{ stat: "goldBonus", value: 4 }] },
  ],
};

// ── Equipment (части корпуса) ───────────────────────────────────────────────────

export const ALL_EQUIPMENT = [
  // ── stats (начальная категория) ───────────────────────────────────────────
  {
    id: "drill_power",
    type: "equipment",
    name: "Мощность бура",
    icon: "D",
    desc: "+0.15 к силе удара",
    category: "stats",
    tags: ["drill"],
    minRarity: 1,
    baseCost: 40,
  },
  {
    id: "speed",
    type: "equipment",
    name: "Скорость бура",
    icon: "S",
    desc: "+0.2 к скорости бурения",
    category: "stats",
    tags: ["drill"],
    minRarity: 1,
    baseCost: 40,
  },
  {
    id: "reinforced_hull",
    type: "equipment",
    name: "Усиленный корпус",
    icon: "✚",
    desc: "+1 к макс. HP, лечит на 2",
    category: "stats",
    tags: ["defense"],
    minRarity: 1,
    baseCost: 60,
  },
  {
    id: "fuel_tank",
    type: "equipment",
    name: "Расширенный бак",
    icon: "◌",
    desc: "+60 к макс. топлива",
    category: "stats",
    tags: ["fuel"],
    minRarity: 1,
    baseCost: 35,
  },

  // ── extra_drill ───────────────────────────────────────────────────────────
  {
    id: "side_drills",
    type: "equipment",
    name: "Боковые буры",
    icon: "⫼",
    desc: "Каждый удар бьёт боковые клетки",
    category: "extra_drill",
    tags: ["drill", "aoe"],
    minRarity: 2,
    baseCost: 60,
  },
  {
    id: "long_drill",
    type: "equipment",
    name: "Длинный бур",
    icon: "⇢",
    desc: "+20% урон по следующему тайлу вперёд",
    category: "extra_drill",
    tags: ["drill"],
    minRarity: 2,
    baseCost: 60,
  },
  {
    id: "diagonal_drills",
    type: "equipment",
    name: "Диагональные буры",
    icon: "✣",
    desc: "+20% урон по диагоналям вперёд",
    category: "extra_drill",
    tags: ["drill", "aoe"],
    minRarity: 2,
    baseCost: 60,
  },
  {
    id: "spike_boost",
    type: "equipment",
    name: "Шиповой форсаж",
    icon: "✹",
    desc: "Разбитые шипы дают overdrive-баф",
    category: "extra_drill",
    tags: ["drill", "heat"],
    minRarity: 3,
    baseCost: 70,
  },

  // ── fuel ──────────────────────────────────────────────────────────────────
  {
    id: "fuel_circuit",
    type: "equipment",
    name: "Топливный контур",
    icon: "⛽",
    desc: "Тайловый перк даёт +50 топлива",
    category: "fuel",
    tags: ["fuel", "contour"],
    minRarity: 2,
    baseCost: 80,
  },
  {
    id: "recirculator",
    type: "equipment",
    name: "Рециркулятор",
    icon: "●",
    desc: "+2 золота и +2 топлива за блок",
    category: "fuel",
    tags: ["fuel", "economy"],
    minRarity: 1,
    baseCost: 80,
  },
  {
    id: "low_fuel_boost",
    type: "equipment",
    name: "Форсаж на нуле",
    icon: "⏚",
    desc: "Меньше топлива → быстрее удар",
    category: "fuel",
    tags: ["fuel", "drill"],
    minRarity: 2,
    baseCost: 70,
  },
  {
    id: "overload",
    type: "equipment",
    name: "Перегрузка",
    icon: "⚡",
    desc: "Переполнение топлива → форсаж + взрыв",
    category: "fuel",
    tags: ["fuel", "explosive"],
    minRarity: 4,
    baseCost: 120,
  },
  {
    id: "tank_boost",
    type: "equipment",
    name: "Усиленный бак",
    icon: "◌",
    desc: "Больше топлива, но растёт расход",
    category: "fuel",
    tags: ["fuel"],
    minRarity: 3,
    baseCost: 60,
  },
  {
    id: "contour_recovery",
    type: "equipment",
    name: "Рекуперация контура",
    icon: "↺",
    desc: "Возврат по контуру даёт топливо",
    category: "fuel",
    tags: ["fuel", "contour"],
    minRarity: 3,
    baseCost: 70,
  },

  // ── vision ────────────────────────────────────────────────────────────────
  {
    id: "geo_lens",
    type: "equipment",
    name: "Гео-линза",
    icon: "◉",
    desc: "+2 к радиусу обзора",
    category: "vision",
    tags: ["vision"],
    minRarity: 2,
    baseCost: 60,
  },
  {
    id: "radar_module",
    type: "equipment",
    name: "Радарный модуль",
    icon: "⌖",
    desc: "Радар показывает ближайшие кристаллы",
    category: "vision",
    tags: ["vision"],
    minRarity: 3,
    baseCost: 80,
  },
  {
    id: "radar_booster",
    type: "equipment",
    name: "Усилитель радара",
    icon: "R",
    desc: "+2 заряда радара",
    category: "vision",
    tags: ["vision"],
    minRarity: 3,
    baseCost: 50,
  },
  {
    id: "cooling_pulse",
    type: "equipment",
    name: "Импульс остывания",
    icon: "⌁",
    desc: "Полное остывание даёт 5 сек радара",
    category: "vision",
    tags: ["vision", "heat"],
    minRarity: 3,
    baseCost: 90,
  },

  // ── contour ───────────────────────────────────────────────────────────────
  {
    id: "contour_charge",
    type: "equipment",
    name: "Контурный заряд",
    icon: "⬡",
    desc: "Замыкание контура → бонус к урону",
    category: "contour",
    tags: ["contour", "drill"],
    minRarity: 2,
    baseCost: 70,
  },
  {
    id: "contour_trophy",
    type: "equipment",
    name: "Контурный трофей",
    icon: "◈",
    desc: "Большой контур создаёт перк внутри",
    category: "contour",
    tags: ["contour", "economy"],
    minRarity: 3,
    baseCost: 90,
  },
  {
    id: "auto_contour",
    type: "equipment",
    name: "Автоконтур",
    icon: "◎",
    desc: "-1 сек к задержке автозамыкания",
    category: "contour",
    tags: ["contour"],
    minRarity: 2,
    baseCost: 80,
  },
  {
    id: "contour_resonance",
    type: "equipment",
    name: "Контурный резонанс",
    icon: "⟲",
    desc: "+1% урона за единицу длины контура",
    category: "contour",
    tags: ["contour", "drill"],
    minRarity: 3,
    baseCost: 80,
  },

  // ── heat ──────────────────────────────────────────────────────────────────
  {
    id: "heat_sink",
    type: "equipment",
    name: "Теплоотвод",
    icon: "⬢",
    desc: "+20 к пределу нагрева",
    category: "heat",
    tags: ["heat"],
    minRarity: 1,
    baseCost: 60,
  },
  {
    id: "heat_drill",
    type: "equipment",
    name: "Накал бура",
    icon: "❉",
    desc: "+20% урона от нагрева",
    category: "heat",
    tags: ["heat", "drill"],
    minRarity: 3,
    baseCost: 70,
  },
  {
    id: "thermo_charge",
    type: "equipment",
    name: "Термозаряд",
    icon: "☇",
    desc: "+1 урон и +0.5 радиус взрыва перегрева",
    category: "heat",
    tags: ["heat", "explosive"],
    minRarity: 3,
    baseCost: 70,
  },
  {
    id: "accel_dampers",
    type: "equipment",
    name: "Разгонные демпферы",
    icon: "◍",
    desc: "Меньше оглушение, быстрее нагрев",
    category: "heat",
    tags: ["heat"],
    minRarity: 4,
    baseCost: 80,
  },

  // ── survival ──────────────────────────────────────────────────────────────
  {
    id: "adrenaline",
    type: "equipment",
    name: "Перелив адреналина",
    icon: "❤",
    desc: "Overheal даёт баф скорости",
    category: "survival",
    tags: ["defense"],
    minRarity: 3,
    baseCost: 90,
  },
  {
    id: "ore_collector",
    type: "equipment",
    name: "Ломосбор",
    icon: "●",
    desc: "+2 золота за разрушенный блок",
    category: "survival",
    tags: ["economy"],
    minRarity: 1,
    baseCost: 50,
  },
  {
    id: "crystal_catalyst",
    type: "equipment",
    name: "Кристальный катализатор",
    icon: "✧",
    desc: "Кристаллы дают золото, топливо, HP",
    category: "survival",
    tags: ["economy", "vision"],
    minRarity: 3,
    baseCost: 100,
  },

  // ── missiles ──────────────────────────────────────────────────────────────
  {
    id: "sapper_charge",
    type: "equipment",
    name: "Саперный заряд",
    icon: "✦",
    desc: "Каждые N блоков бросает ракету",
    category: "missiles",
    tags: ["explosive"],
    minRarity: 2,
    baseCost: 90,
  },
  {
    id: "thermo_rockets",
    type: "equipment",
    name: "Терморакеты",
    icon: "☄",
    desc: "Перегрев выпускает ракеты",
    category: "missiles",
    tags: ["explosive", "heat"],
    minRarity: 4,
    baseCost: 90,
  },
  {
    id: "cryo_rockets",
    type: "equipment",
    name: "Охлаждающие ракеты",
    icon: "❄",
    desc: "Остывание нагрева выпускает ракету",
    category: "missiles",
    tags: ["explosive", "heat"],
    minRarity: 4,
    baseCost: 90,
  },
];

// ── Items (предметы — стат-бусты) ───────────────────────────────────────────────

export const ALL_ITEMS = [
  // ── stats ─────────────────────────────────────────────────────────────────
  {
    id: "lucky_chip",
    type: "item",
    name: "Чип удачи",
    icon: "♣",
    desc: "+5 к удаче",
    category: "stats",
    minRarity: 1,
    baseCost: 30,
    effect: { stat: "luck", value: 5 },
  },
  {
    id: "targeting_module",
    type: "item",
    name: "Прицельный модуль",
    icon: "⊕",
    desc: "+5% шанс крита",
    category: "stats",
    minRarity: 1,
    baseCost: 35,
    effect: { stat: "critChance", value: 5 },
  },
  {
    id: "crit_amplifier",
    type: "item",
    name: "Усилитель крита",
    icon: "⚔",
    desc: "+0.25 к множителю крита",
    category: "stats",
    minRarity: 2,
    baseCost: 50,
    effect: { stat: "critMultiplier", value: 0.25 },
  },
  {
    id: "gold_magnet",
    type: "item",
    name: "Золотой магнит",
    icon: "◆",
    desc: "+3 золота за блок",
    category: "stats",
    minRarity: 1,
    baseCost: 40,
    effect: { stat: "goldBonus", value: 3 },
  },
  {
    id: "turbo_drill",
    type: "item",
    name: "Турбобур",
    icon: "⇡",
    desc: "+0.1 к скорости бурения",
    category: "stats",
    minRarity: 1,
    baseCost: 35,
    effect: { stat: "strikeSpeed", value: 0.1 },
  },
  {
    id: "power_core",
    type: "item",
    name: "Ядро мощности",
    icon: "✸",
    desc: "+0.1 к силе удара",
    category: "stats",
    minRarity: 1,
    baseCost: 35,
    effect: { stat: "drillPower", value: 0.1 },
  },

  // ── heat ──────────────────────────────────────────────────────────────────
  {
    id: "thermal_conductor",
    type: "item",
    name: "Теплопроводник",
    icon: "≈",
    desc: "-0.1 к скорости нагрева",
    category: "heat",
    minRarity: 1,
    baseCost: 30,
    effect: { stat: "heatRate", value: -0.1 },
  },
  {
    id: "heat_accelerator",
    type: "item",
    name: "Ускоритель нагрева",
    icon: "⇈",
    desc: "+0.15 к скорости нагрева",
    category: "heat",
    minRarity: 1,
    baseCost: 25,
    effect: { stat: "heatRate", value: 0.15 },
  },

  // ── fuel ──────────────────────────────────────────────────────────────────
  {
    id: "fuel_economizer",
    type: "item",
    name: "Экономайзер",
    icon: "⊘",
    desc: "-0.1 к расходу топлива",
    category: "fuel",
    minRarity: 1,
    baseCost: 30,
    effect: { stat: "fuelDrainRate", value: -0.1 },
  },
  {
    id: "fuel_filter",
    type: "item",
    name: "Топливный фильтр",
    icon: "⊟",
    desc: "+30 к макс. топлива",
    category: "fuel",
    minRarity: 1,
    baseCost: 30,
    effect: { stat: "maxFuel", value: 30 },
  },

  // ── survival ──────────────────────────────────────────────────────────────
  {
    id: "armor_plate",
    type: "item",
    name: "Бронепластина",
    icon: "⬣",
    desc: "+1 к броне",
    category: "survival",
    minRarity: 2,
    baseCost: 50,
    effect: { stat: "armor", value: 1 },
  },
  {
    id: "nano_repair",
    type: "item",
    name: "Наноремонт",
    icon: "✤",
    desc: "+1 к макс. HP",
    category: "survival",
    minRarity: 2,
    baseCost: 55,
    effect: { stat: "maxHp", value: 1 },
  },

  // ── vision ────────────────────────────────────────────────────────────────
  {
    id: "scope_lens",
    type: "item",
    name: "Линза дальнозоркости",
    icon: "⊙",
    desc: "+1 к радиусу обзора",
    category: "vision",
    minRarity: 2,
    baseCost: 45,
    effect: { stat: "visionRadius", value: 1 },
  },
];

// ── Объединённый массив ─────────────────────────────────────────────────────────

export const ALL_GOODS = [...ALL_EQUIPMENT, ...ALL_ITEMS];
