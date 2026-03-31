import {
  ALL_EQUIPMENT, ALL_ITEMS, ALL_GOODS,
  CATEGORIES, INITIAL_CATEGORIES,
  RARITY, RARITY_NAMES, RARITY_COLORS, RARITY_EFFECT_MULT, RARITY_COST_MULT,
  TAG_SYNERGIES,
} from "./items-catalog.js?v=1";

// ── Constants ────────────────────────────────────────────────────────────────────

const GRID_H = 240;
const START_Y = 8;
const MAX_SLOTS = 6;
const INITIAL_SLOTS = 2;
const OFFERINGS_COUNT = 4;
const EQUIPMENT_CHANCE = 0.35; // 35% equipment, 65% items
const RECYCLE_RETURN = 0.25;   // 25% gold back on recycle

// ── Module state ─────────────────────────────────────────────────────────────────

let unlockedCategories = new Set(INITIAL_CATEGORIES);
let maxSlots = INITIAL_SLOTS;
let equippedParts = getStarterEquipment();      // [{id, rarity}]
let purchasedItems = [];     // [{id, rarity}] — flat list, no limit
let currentOfferings = [];   // [{good, rarity}] × OFFERINGS_COUNT
let rerollCount = 0;
let shopLevel = 0;
let currentGoldCache = 0;
let currentLuckCache = 0;
let currentStatsCache = null;
let onCloseCallback = null;
let selectedOfferingIdx = -1;
let selectedSlotIdx = -1;    // slot selected for manual merge
let replaceMode = false;     // true when choosing slot to replace
let lockedSlots = new Set(); // offering slot indices that are locked
let prevTagCounts = {};      // previous tag counts for synergy delta

function getStarterEquipment() {
  return [{ id: "basic_drill", rarity: RARITY.COMMON }];
}

// ── Public API ───────────────────────────────────────────────────────────────────

export function initShop(callbacks = {}) {
  onCloseCallback = callbacks.onClose ?? null;
  buildDOM();
  bindEvents();
}

export function openShop(currentGold, beaconY, luck = 0, stats = null) {
  const overlay = document.getElementById("shopModal");
  if (!overlay) return;
  currentGoldCache = currentGold;
  currentLuckCache = luck;
  currentStatsCache = stats;
  shopLevel = beaconY != null ? getShopLevelFromY(beaconY) : 5;
  rerollCount = 0;
  selectedOfferingIdx = -1;
  replaceMode = false;
  rollOfferings(luck);
  overlay.hidden = false;
  overlay.style.cssText =
    "position:absolute;inset:0;z-index:9998;display:flex;visibility:visible;pointer-events:auto;opacity:1;align-items:center;justify-content:center;";
  renderShop(currentGold, stats);
}

export function closeShop() {
  const overlay = document.getElementById("shopModal");
  if (!overlay) return;
  selectedOfferingIdx = -1;
  selectedSlotIdx = -1;
  replaceMode = false;
  overlay.hidden = true;
  overlay.style.cssText = "display:none;visibility:hidden;pointer-events:none;opacity:0;";
  onCloseCallback?.();
}

export function renderShop(currentGold, stats = null) {
  currentGoldCache = currentGold;
  if (stats) {
    currentStatsCache = stats;
  }
  const goldEl = document.getElementById("shopGoldValue");
  if (goldEl) goldEl.textContent = Math.floor(currentGold);
  renderStats();
  renderOfferings();
  renderSlots();
  renderRerollButton();
  renderDetail();
}

export function getEquipmentLevel(effectId) {
  const part = equippedParts.find(p => p.id === effectId);
  return part ? RARITY_EFFECT_MULT[part.rarity] : 0;
}

export function getEquipmentLevels(effectId) {
  return equippedParts
    .filter((part) => part.id === effectId)
    .map((part) => RARITY_EFFECT_MULT[part.rarity]);
}

export function getItemStacks(effectId) {
  return purchasedItems.filter(p => p.id === effectId).length;
}

export function getTagCounts() {
  const counts = {};
  for (const part of equippedParts) {
    const def = ALL_EQUIPMENT.find(e => e.id === part.id);
    if (!def) continue;
    for (const tag of def.tags) {
      counts[tag] = (counts[tag] || 0) + 1;
    }
  }
  return counts;
}

export function addSlot() {
  if (maxSlots < MAX_SLOTS) maxSlots++;
}

export function unlockCategory(categoryId) {
  unlockedCategories.add(categoryId);
}

export function getLockedCategories() {
  return CATEGORIES.filter(c => !unlockedCategories.has(c.id));
}

export function resetShopState() {
  unlockedCategories = new Set(INITIAL_CATEGORIES);
  maxSlots = INITIAL_SLOTS;
  equippedParts = getStarterEquipment();
  purchasedItems = [];
  currentOfferings = [];
  rerollCount = 0;
  shopLevel = 0;
  currentStatsCache = null;
  lockedSlots = new Set();
  prevTagCounts = {};
}

export function getEquippedParts() {
  return equippedParts.slice();
}

// ── Depth → shop level ───────────────────────────────────────────────────────────

function getShopLevelFromY(beaconY) {
  const ratio = (beaconY - START_Y) / (GRID_H - START_Y - 15);
  return Math.min(11, Math.max(0, Math.floor(ratio * 12)));
}

// ── Rarity rolling ───────────────────────────────────────────────────────────────

function lerp(a, b, t) { return a + (b - a) * t; }

function rollRarity(level, luck) {
  const t = Math.min(level / 9, 1);
  const luckBonus = 1 + (luck || 0) * 0.01;
  const legendary = Math.min(0.08, lerp(0, 0.08, t) * luckBonus);
  const rare =      Math.min(0.25, lerp(0, 0.25, t) * luckBonus);
  const uncommon =  Math.min(0.45, lerp(0.10, 0.45, t) * luckBonus);
  const roll = Math.random();
  if (roll < legendary) return RARITY.LEGENDARY;
  if (roll < legendary + rare) return RARITY.RARE;
  if (roll < legendary + rare + uncommon) return RARITY.UNCOMMON;
  return RARITY.COMMON;
}

// ── Offering generation ──────────────────────────────────────────────────────────

function rollOfferings(luck) {
  const usedIds = new Set();

  // Preserve locked offerings
  const next = new Array(OFFERINGS_COUNT).fill(null);
  for (let i = 0; i < OFFERINGS_COUNT; i++) {
    if (lockedSlots.has(i) && currentOfferings[i]) {
      next[i] = currentOfferings[i];
      usedIds.add(currentOfferings[i].good.id);
    }
  }
  currentOfferings = next;

  for (let i = 0; i < OFFERINGS_COUNT; i++) {
    if (currentOfferings[i]) continue; // locked slot, skip
    const isEquipment = Math.random() < EQUIPMENT_CHANCE;
    const rarity = rollRarity(shopLevel, luck);
    const pool = isEquipment ? ALL_EQUIPMENT : ALL_ITEMS;

    const candidates = pool.filter(g =>
      g.minRarity <= rarity &&
      unlockedCategories.has(g.category) &&
      !usedIds.has(g.id)
    );

    if (candidates.length === 0) {
      // Fallback: try any rarity from same type
      const fallback = pool.filter(g =>
        unlockedCategories.has(g.category) && !usedIds.has(g.id)
      );
      if (fallback.length > 0) {
        const pick = fallback[Math.floor(Math.random() * fallback.length)];
        const clampedRarity = Math.max(pick.minRarity, RARITY.COMMON);
        usedIds.add(pick.id);
        currentOfferings[i] = { good: pick, rarity: clampedRarity };
        continue;
      }
      // Still nothing — try opposite type
      const otherPool = isEquipment ? ALL_ITEMS : ALL_EQUIPMENT;
      const otherCandidates = otherPool.filter(g =>
        g.minRarity <= rarity &&
        unlockedCategories.has(g.category) &&
        !usedIds.has(g.id)
      );
      if (otherCandidates.length > 0) {
        const pick = otherCandidates[Math.floor(Math.random() * otherCandidates.length)];
        usedIds.add(pick.id);
        currentOfferings[i] = { good: pick, rarity };
      }
      continue;
    }

    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    usedIds.add(pick.id);
    currentOfferings[i] = { good: pick, rarity };
  }
}

// ── Cost calculation ─────────────────────────────────────────────────────────────

function getOfferingCost(offering) {
  return Math.max(1, Math.round(offering.good.baseCost * RARITY_COST_MULT[offering.rarity]));
}

function getRerollCost() {
  if (ALL_GOODS.length === 0) {
    return 0;
  }
  const base = Math.max(3, Math.floor(shopLevel * 0.75)) + 1;
  const increment = Math.max(1, Math.floor(shopLevel * 0.4));
  return base + increment * rerollCount;
}

// ── Purchase logic ───────────────────────────────────────────────────────────────

function canMerge(offering) {
  if (offering.good.type !== "equipment") return false;
  if (offering.rarity >= RARITY.LEGENDARY) return false;
  if (hasFreeSlot()) return false; // free slot available — no merge needed
  return equippedParts.some(p => p.id === offering.good.id && p.rarity === offering.rarity);
}

function hasFreeSlot() {
  return equippedParts.length < maxSlots;
}

function tryPurchase(offeringIdx) {
  const offering = currentOfferings[offeringIdx];
  if (!offering) return;

  const cost = getOfferingCost(offering);
  if (currentGoldCache < cost) return;

  if (offering.good.type === "item") {
    // Items: just buy, no slot needed
    purchasedItems.push({ id: offering.good.id, rarity: offering.rarity });
    document.dispatchEvent(new CustomEvent("shop:purchase-item", {
      detail: {
        effect: offering.good.effect,
        cost,
        rarityMultiplier: RARITY_EFFECT_MULT[offering.rarity],
        rarity: offering.rarity,
      },
    }));
    currentOfferings[offeringIdx] = null;
    lockedSlots.delete(offeringIdx);
    selectedOfferingIdx = -1;
    return;
  }

  // Equipment
  if (hasFreeSlot()) {
    // Free slot available — always place there, never auto-merge
    equippedParts.push({ id: offering.good.id, rarity: offering.rarity });
    document.dispatchEvent(new CustomEvent("shop:purchase-equipment", {
      detail: {
        effectId: offering.good.id,
        cost,
        rarityMultiplier: RARITY_EFFECT_MULT[offering.rarity],
        isMerge: false,
        oldRarityMultiplier: 0,
      },
    }));
    recalcTagSynergies();
    currentOfferings[offeringIdx] = null;
    lockedSlots.delete(offeringIdx);
    selectedOfferingIdx = -1;
    return;
  }

  if (canMerge(offering)) {
    // No free slot — merge with existing same item+rarity
    const existingIdx = equippedParts.findIndex(
      p => p.id === offering.good.id && p.rarity === offering.rarity
    );
    const oldRarity = equippedParts[existingIdx].rarity;
    const newRarity = oldRarity + 1;
    equippedParts[existingIdx].rarity = newRarity;

    document.dispatchEvent(new CustomEvent("shop:purchase-equipment", {
      detail: {
        effectId: offering.good.id,
        cost,
        rarityMultiplier: RARITY_EFFECT_MULT[newRarity],
        isMerge: true,
        oldRarityMultiplier: RARITY_EFFECT_MULT[oldRarity],
      },
    }));
    recalcTagSynergies();
    currentOfferings[offeringIdx] = null;
    lockedSlots.delete(offeringIdx);
    selectedOfferingIdx = -1;
    return;
  }

  // No free slot and no merge — enter replace mode
  replaceMode = true;
  renderShop(currentGoldCache);
}

function doReplace(slotIdx) {
  const offering = currentOfferings[selectedOfferingIdx];
  if (!offering || slotIdx < 0 || slotIdx >= equippedParts.length) return;

  const cost = getOfferingCost(offering);
  if (currentGoldCache < cost) return;

  // Recycle old equipment
  const old = equippedParts[slotIdx];
  const oldDef = ALL_EQUIPMENT.find(e => e.id === old.id);
  const refund = Math.floor(getRecycleCost(old) * RECYCLE_RETURN);

  document.dispatchEvent(new CustomEvent("shop:recycle", {
    detail: {
      effectId: old.id,
      rarityMultiplier: RARITY_EFFECT_MULT[old.rarity],
      refund,
    },
  }));

  // Place new equipment
  equippedParts[slotIdx] = { id: offering.good.id, rarity: offering.rarity };

  document.dispatchEvent(new CustomEvent("shop:purchase-equipment", {
    detail: {
      effectId: offering.good.id,
      cost,
      rarityMultiplier: RARITY_EFFECT_MULT[offering.rarity],
      isMerge: false,
      oldRarityMultiplier: 0,
    },
  }));

  recalcTagSynergies();
  lockedSlots.delete(selectedOfferingIdx);
  currentOfferings[selectedOfferingIdx] = null;
  selectedOfferingIdx = -1;
  replaceMode = false;
}

function getRecycleCost(part) {
  const def = ALL_EQUIPMENT.find(e => e.id === part.id);
  if (!def) return 0;
  return Math.round(def.baseCost * RARITY_COST_MULT[part.rarity]);
}

// ── Tag synergies ────────────────────────────────────────────────────────────────

function recalcTagSynergies() {
  const newCounts = getTagCounts();
  const allTags = new Set([...Object.keys(prevTagCounts), ...Object.keys(newCounts)]);

  const removed = [];
  const added = [];

  for (const tag of allTags) {
    const oldCount = prevTagCounts[tag] || 0;
    const newCount = newCounts[tag] || 0;
    if (oldCount === newCount) continue;

    const synergy = TAG_SYNERGIES[tag];
    if (!synergy) continue;

    // Find which thresholds were active before and now
    for (const tier of synergy) {
      const wasActive = oldCount >= tier.count;
      const isActive = newCount >= tier.count;
      if (wasActive && !isActive) {
        removed.push({ tag, count: tier.count, bonuses: tier.bonuses });
      } else if (!wasActive && isActive) {
        added.push({ tag, count: tier.count, bonuses: tier.bonuses });
      }
    }
  }

  prevTagCounts = newCounts;

  if (removed.length > 0 || added.length > 0) {
    document.dispatchEvent(new CustomEvent("shop:synergies-changed", {
      detail: { removed, added },
    }));
  }
}

// ── DOM ──────────────────────────────────────────────────────────────────────────

function buildDOM() {
  const overlay = document.getElementById("shopModal");
  if (!overlay) return;

  overlay.innerHTML = `
    <div class="shop-stack">
      <div class="shop-panel">
        <div class="shop-head">
          <span class="shop-head__title">Магазин</span>
          <span class="shop-head__gold">
            <span class="shop-head__gold-icon"></span>
            <span id="shopGoldValue">0</span>
          </span>
          <button id="shopReroll" class="shop-reroll" type="button">Перебросить</button>
          <button id="shopClose" class="shop-close" type="button">✕</button>
        </div>
        <div class="shop-offerings" id="shopOfferings"></div>
        <div class="shop-detail" id="shopDetail" hidden>
          <div class="shop-detail__row">
            <div class="shop-detail__icon" id="shopDetailIcon"></div>
            <div class="shop-detail__info">
              <div class="shop-detail__name" id="shopDetailName"></div>
              <div class="shop-detail__desc" id="shopDetailDesc"></div>
              <div class="shop-detail__tags" id="shopDetailTags"></div>
            </div>
          </div>
          <div class="shop-detail__footer">
            <div class="shop-detail__rarity" id="shopDetailRarity"></div>
            <div class="shop-detail__actions">
              <button class="shop-detail__buy" id="shopDetailBuy" type="button"></button>
              <button class="shop-detail__lock" id="shopDetailLock" type="button" hidden></button>
              <button class="shop-detail__sell" id="shopDetailSell" type="button" hidden></button>
            </div>
          </div>
        </div>
        <div class="shop-slots" id="shopSlots"></div>
      </div>
      <div class="shop-stats" id="shopStats"></div>
    </div>
  `;
}

function hasShopContent() {
  return ALL_GOODS.length > 0;
}

function formatStatValue(value, mode = "number") {
  if (!Number.isFinite(value)) return "0";
  if (mode === "percent") {
    const rounded = Math.round(value * 100);
    return `${rounded > 0 ? "+" : ""}${rounded}%`;
  }
  if (mode === "multiplier") {
    return `x${value.toFixed(2)}`;
  }
  if (mode === "fixed1") {
    return value % 1 === 0 ? String(Math.round(value)) : value.toFixed(1);
  }
  return String(Math.round(value));
}

function getRarityTierValue(values, rarity) {
  return values[Math.max(0, Math.min(values.length - 1, rarity))] || 0;
}

function getGoodDescription(good, rarity = RARITY.COMMON) {
  if (!good) {
    return "";
  }
  if (good.id === "thermo_drill") {
    const flat = getRarityTierValue([0, 0, 20, 25, 30], rarity);
    const drillScale = getRarityTierValue([0, 0, 15, 20, 25], rarity);
    const heatBonus = getRarityTierValue([0, 0, 1, 2, 3], rarity);
    return `Урон ${flat} (+${drillScale}% dmg). +${heatBonus} урона за каждые 10 heat.`;
  }
  if (good.id === "basic_drill") {
    const flatDamage = getRarityTierValue([0, 10, 15, 20, 25], rarity);
    const damageScale = getRarityTierValue([0, 10, 15, 20, 25], rarity);
    return `Урон ${flatDamage} (${damageScale}% dmg).`;
  }
  if (good.id === "lucky_pickaxe") {
    const flatDamage = getRarityTierValue([0, 10, 15, 20, 25], rarity);
    const damageScale = getRarityTierValue([0, 10, 20, 30, 40], rarity);
    const luckScale = getRarityTierValue([0, 10, 15, 20, 25], rarity);
    const oreGain = getRarityTierValue([0, 1, 2, 3, 4], rarity);
    return `Урон ${flatDamage} (${damageScale}% dmg, ${luckScale}% luck). При ударе по золотой жиле увеличит ее ценность на ${oreGain}.`;
  }
  if (good.effect?.effectByRarity) {
    const value = good.effect.effectByRarity[rarity] ?? good.effect.effectByRarity[1] ?? 0;
    if (good.effect.stat === "strikeSpeed") {
      return `+${Math.round(value * 100)}% скорость бура.`;
    }
    if (good.effect.stat === "speedOfAutoClose") {
      return `+${value} к скорости замыкания контура.`;
    }
  }
  return good.desc || "";
}

function renderStats() {
  const container = document.getElementById("shopStats");
  if (!container) return;
  const stats = currentStatsCache;
  if (!stats) {
    container.innerHTML = "";
    container.hidden = true;
    return;
  }

  const items = [
    { label: "DMG", value: formatStatValue(stats.drillPower, "fixed1") },
    { label: "SPD", value: formatStatValue(stats.strikeSpeed - 1, "percent") },
    { label: "HP", value: formatStatValue(stats.maxHp) },
    { label: "FUEL", value: formatStatValue(stats.maxFuel) },
    { label: "HEAT", value: formatStatValue(stats.maxHeat) },
    { label: "H+", value: formatStatValue(stats.heatRate, "multiplier") },
    { label: "DUR", value: formatStatValue(stats.effectDurationRate, "multiplier") },
    { label: "CON", value: formatStatValue(stats.concentration, "multiplier") },
    { label: "CONS", value: formatStatValue(stats.fuelDrainRate, "multiplier") },
    { label: "VIS", value: formatStatValue(stats.visionRadius) },
    { label: "LUCK", value: formatStatValue(stats.luck) },
    { label: "CRIT", value: formatStatValue(stats.critChance, "percent") },
    { label: "xCRIT", value: formatStatValue(stats.critMultiplier, "multiplier") },
    { label: "GOLD", value: formatStatValue(stats.miningGoldBonusMultiplier, "percent") },
    { label: "PICK", value: formatStatValue(stats.fuelPickupBonus) },
  ];

  container.hidden = false;
  container.innerHTML = items.map((item) => `
    <div class="shop-stats__item">
      <span class="shop-stats__label">${item.label}</span>
      <span class="shop-stats__value">${item.value}</span>
    </div>
  `).join("");
}

function renderOfferings() {
  const container = document.getElementById("shopOfferings");
  if (!container) return;
  container.innerHTML = "";

  if (!hasShopContent()) {
    const empty = document.createElement("div");
    empty.className = "shop-empty";
    empty.innerHTML = `
      <div class="shop-empty__title">Магазин пуст</div>
      <div class="shop-empty__text">Все предметы и экипировка удалены из игры.</div>
    `;
    container.appendChild(empty);
    return;
  }

  for (let i = 0; i < OFFERINGS_COUNT; i++) {
    const offering = currentOfferings[i];
    const card = document.createElement("div");

    if (!offering) {
      card.className = "shop-card shop-card--sold";
      card.innerHTML = `<div class="shop-card__sold">Продано</div>`;
      container.appendChild(card);
      continue;
    }

    const cost = getOfferingCost(offering);
    const canAfford = currentGoldCache >= cost;
    const isMerge = canMerge(offering);
    const isSelected = selectedOfferingIdx === i;
    const isEquip = offering.good.type === "equipment";

    const isLocked = lockedSlots.has(i);

    let cls = "shop-card";
    cls += ` shop-card--rarity-${offering.rarity}`;
    if (isEquip) cls += " shop-card--equipment";
    else cls += " shop-card--item";
    if (!canAfford) cls += " shop-card--poor";
    if (isMerge) cls += " shop-card--merge";
    if (isSelected) cls += " shop-card--selected";
    if (isLocked) cls += " shop-card--locked";

    card.className = cls;
    card.dataset.offeringIdx = i;

    const typeLabel = isEquip ? "⛏" : "✧";
    const mergeLabel = isMerge ? `<div class="shop-card__merge">⬆ Объединить</div>` : "";

    card.innerHTML = `
      <div class="shop-card__type">${typeLabel}</div>
      <div class="shop-card__icon">${offering.good.icon}</div>
      <div class="shop-card__name">${offering.good.name}</div>
      ${mergeLabel}
      <div class="shop-card__cost${canAfford ? "" : " shop-card__cost--poor"}">${cost} ●</div>
    `;
    container.appendChild(card);
  }
}

function renderSlots() {
  const container = document.getElementById("shopSlots");
  if (!container) return;
  container.hidden = !hasShopContent();
  if (!hasShopContent()) {
    container.innerHTML = "";
    return;
  }
  container.innerHTML = "";

  for (let i = 0; i < maxSlots; i++) {
    const slot = document.createElement("div");
    const part = equippedParts[i];

    if (part) {
      const def = ALL_EQUIPMENT.find(e => e.id === part.id);
      const isMergeTarget = selectedSlotIdx >= 0 && selectedSlotIdx !== i &&
        equippedParts[selectedSlotIdx] &&
        equippedParts[selectedSlotIdx].id === part.id &&
        equippedParts[selectedSlotIdx].rarity === part.rarity &&
        part.rarity < RARITY.LEGENDARY;
      slot.className = `shop-slot shop-slot--filled shop-slot--rarity-${part.rarity}`;
      if (replaceMode) slot.className += " shop-slot--replaceable";
      if (selectedSlotIdx === i) slot.className += " shop-slot--selected";
      if (isMergeTarget) slot.className += " shop-slot--merge-target";
      slot.dataset.slotIdx = i;
      slot.innerHTML = `
        <span class="shop-slot__icon">${def ? def.icon : "?"}</span>
        <span class="shop-slot__rarity" style="color:${RARITY_COLORS[part.rarity]}">★</span>
      `;
    } else {
      slot.className = "shop-slot shop-slot--empty";
      slot.innerHTML = `<span class="shop-slot__empty">+</span>`;
    }

    container.appendChild(slot);
  }
}

function renderRerollButton() {
  const btn = document.getElementById("shopReroll");
  if (!btn) return;
  if (!hasShopContent()) {
    btn.hidden = true;
    btn.disabled = true;
    return;
  }
  btn.hidden = false;
  const cost = getRerollCost();
  const canAfford = currentGoldCache >= cost;
  btn.textContent = `Перебросить — ${cost} ●`;
  btn.className = "shop-reroll" + (canAfford ? "" : " shop-reroll--poor");
  btn.disabled = !canAfford;
}

function renderDetail() {
  const detail = document.getElementById("shopDetail");
  if (!detail) return;
  if (!hasShopContent()) {
    detail.hidden = true;
    return;
  }

  // Slot selected for manual merge
  if (selectedSlotIdx >= 0 && selectedOfferingIdx < 0) {
    const part = equippedParts[selectedSlotIdx];
    if (!part) { detail.hidden = true; return; }
    const def = ALL_EQUIPMENT.find(e => e.id === part.id);
    if (!def) { detail.hidden = true; return; }

    const hasMergeTarget = equippedParts.some((p, i) =>
      i !== selectedSlotIdx && p.id === part.id && p.rarity === part.rarity && part.rarity < RARITY.LEGENDARY
    );
    const mult = RARITY_EFFECT_MULT[part.rarity];

    detail.hidden = false;
    document.getElementById("shopDetailIcon").textContent = def.icon;
    document.getElementById("shopDetailName").textContent = def.name;
    const desc = getGoodDescription(def, part.rarity);
    document.getElementById("shopDetailDesc").textContent = desc;

    const tagsEl = document.getElementById("shopDetailTags");
    tagsEl.innerHTML = "";
    for (const tag of def.tags) {
      const span = document.createElement("span");
      span.className = "shop-tag";
      span.textContent = tag;
      tagsEl.appendChild(span);
    }

    const rarityEl = document.getElementById("shopDetailRarity");
    rarityEl.textContent = RARITY_NAMES[part.rarity];
    rarityEl.style.color = RARITY_COLORS[part.rarity];

    const buyBtn = document.getElementById("shopDetailBuy");
    if (hasMergeTarget) {
      buyBtn.textContent = "⬆ Выбери второй слот для объединения ↓";
      buyBtn.className = "shop-detail__buy shop-detail__buy--merge";
      buyBtn.disabled = true;
    } else if (part.rarity >= RARITY.LEGENDARY) {
      buyBtn.textContent = "Максимальная редкость";
      buyBtn.className = "shop-detail__buy shop-detail__buy--poor";
      buyBtn.disabled = true;
    } else {
      buyBtn.textContent = "Нет второго такого предмета";
      buyBtn.className = "shop-detail__buy shop-detail__buy--poor";
      buyBtn.disabled = true;
    }

    const sellValue = Math.floor(Math.round(def.baseCost * RARITY_COST_MULT[part.rarity]) * 0.5);
    const sellBtn = document.getElementById("shopDetailSell");
    sellBtn.hidden = false;
    sellBtn.textContent = `Продать — +${sellValue} ●`;
    sellBtn.dataset.slotIdx = selectedSlotIdx;
    document.getElementById("shopDetailLock").hidden = true;
    return;
  }

  if (selectedOfferingIdx < 0 || !currentOfferings[selectedOfferingIdx]) {
    detail.hidden = true;
    return;
  }

  detail.hidden = false;
  const sellBtn = document.getElementById("shopDetailSell");
  if (sellBtn) sellBtn.hidden = true;
  const isLocked = lockedSlots.has(selectedOfferingIdx);
  const lockBtn = document.getElementById("shopDetailLock");
  if (lockBtn) {
    lockBtn.hidden = false;
    lockBtn.textContent = isLocked ? "Открепить" : "Закрепить";
    lockBtn.className = "shop-detail__lock" + (isLocked ? " shop-detail__lock--active" : "");
    lockBtn.dataset.lockIdx = selectedOfferingIdx;
  }
  const offering = currentOfferings[selectedOfferingIdx];
  const cost = getOfferingCost(offering);
  const canAfford = currentGoldCache >= cost;
  const isMerge = canMerge(offering);
  const isEquip = offering.good.type === "equipment";
  const mult = RARITY_EFFECT_MULT[offering.rarity];

  document.getElementById("shopDetailIcon").textContent = offering.good.icon;
  document.getElementById("shopDetailName").textContent = offering.good.name;

  // Description with rarity multiplier
  const desc = getGoodDescription(offering.good, offering.rarity);
  document.getElementById("shopDetailDesc").textContent = desc;

  // Tags for equipment
  const tagsEl = document.getElementById("shopDetailTags");
  tagsEl.innerHTML = "";
  if (isEquip && offering.good.tags) {
    for (const tag of offering.good.tags) {
      const span = document.createElement("span");
      span.className = "shop-tag";
      span.textContent = tag;
      tagsEl.appendChild(span);
    }
  }

  // Rarity label
  const rarityEl = document.getElementById("shopDetailRarity");
  rarityEl.textContent = RARITY_NAMES[offering.rarity];
  rarityEl.style.color = RARITY_COLORS[offering.rarity];

  // Buy button
  const buyBtn = document.getElementById("shopDetailBuy");
  if (replaceMode) {
    buyBtn.textContent = "Выбери слот для замены ↓";
    buyBtn.className = "shop-detail__buy shop-detail__buy--replace";
    buyBtn.disabled = true;
  } else if (isMerge) {
    if (canAfford) {
      buyBtn.textContent = `⬆ Объединить — ${cost} ●`;
      buyBtn.className = "shop-detail__buy shop-detail__buy--merge";
      buyBtn.disabled = false;
    } else {
      buyBtn.textContent = `Нужно ${cost} ●`;
      buyBtn.className = "shop-detail__buy shop-detail__buy--poor";
      buyBtn.disabled = true;
    }
  } else if (canAfford) {
    buyBtn.textContent = `Купить — ${cost} ●`;
    buyBtn.className = "shop-detail__buy shop-detail__buy--ok";
    buyBtn.disabled = false;
  } else {
    buyBtn.textContent = `Нужно ${cost} ●`;
    buyBtn.className = "shop-detail__buy shop-detail__buy--poor";
    buyBtn.disabled = true;
  }
}

// ── Events ───────────────────────────────────────────────────────────────────────

function bindEvents() {
  const overlay = document.getElementById("shopModal");
  if (!overlay) return;

  overlay.addEventListener("click", e => {
    if (e.target === overlay) { closeShop(); return; }
    if (e.target.closest("#shopClose")) { closeShop(); return; }

    // Reroll
    if (e.target.closest("#shopReroll")) {
      doReroll();
      return;
    }

    // Lock button
    const lockBtn = e.target.closest("#shopDetailLock[data-lock-idx]");
    if (lockBtn) {
      const idx = Number(lockBtn.dataset.lockIdx);
      if (lockedSlots.has(idx)) lockedSlots.delete(idx);
      else lockedSlots.add(idx);
      renderShop(currentGoldCache);
      return;
    }

    // Sell button
    if (e.target.closest("#shopDetailSell")) {
      const btn = e.target.closest("#shopDetailSell");
      const slotIdx = Number(btn.dataset.slotIdx);
      doSellSlot(slotIdx);
      renderShop(currentGoldCache);
      return;
    }

    // Buy button
    if (e.target.closest("#shopDetailBuy")) {
      if (selectedOfferingIdx >= 0 && !replaceMode) {
        tryPurchase(selectedOfferingIdx);
        renderShop(currentGoldCache);
      }
      return;
    }

    // Slot click (replace mode)
    const slotEl = e.target.closest(".shop-slot--replaceable");
    if (slotEl && replaceMode) {
      const slotIdx = Number(slotEl.dataset.slotIdx);
      doReplace(slotIdx);
      renderShop(currentGoldCache);
      return;
    }

    // Slot click (manual merge mode)
    const anySlot = e.target.closest(".shop-slot--filled[data-slot-idx]");
    if (anySlot && !replaceMode) {
      const slotIdx = Number(anySlot.dataset.slotIdx);
      if (selectedSlotIdx >= 0 && selectedSlotIdx !== slotIdx) {
        // Check if this is a valid merge target
        const a = equippedParts[selectedSlotIdx];
        const b = equippedParts[slotIdx];
        if (a && b && a.id === b.id && a.rarity === b.rarity && a.rarity < RARITY.LEGENDARY) {
          doSlotMerge(selectedSlotIdx, slotIdx);
          renderShop(currentGoldCache);
          return;
        }
      }
      // Select this slot (deselect offering)
      selectedSlotIdx = selectedSlotIdx === slotIdx ? -1 : slotIdx;
      selectedOfferingIdx = -1;
      replaceMode = false;
      renderShop(currentGoldCache);
      return;
    }

    // Offering card click
    const card = e.target.closest(".shop-card[data-offering-idx]");
    if (card) {
      const idx = Number(card.dataset.offeringIdx);
      if (selectedOfferingIdx === idx) {
        // Double-click = quick buy
        if (!replaceMode) {
          tryPurchase(idx);
          renderShop(currentGoldCache);
        }
      } else {
        selectedOfferingIdx = idx;
        selectedSlotIdx = -1;
        replaceMode = false;
        renderShop(currentGoldCache);
      }
      return;
    }

    // Click outside
    if (!e.target.closest(".shop-detail") && !e.target.closest(".shop-slot")) {
      selectedOfferingIdx = -1;
      selectedSlotIdx = -1;
      replaceMode = false;
      renderShop(currentGoldCache);
    }
  });
}

function doReroll() {
  const cost = getRerollCost();
  if (currentGoldCache < cost) return;

  rerollCount++;
  selectedOfferingIdx = -1;
  replaceMode = false;
  rollOfferings(currentLuckCache);

  document.dispatchEvent(new CustomEvent("shop:reroll", {
    detail: { cost },
  }));
  // game.js handler deducts gold and calls renderShop, which will show the new offerings
}

function doSellSlot(slotIdx) {
  const part = equippedParts[slotIdx];
  if (!part) return;
  const def = ALL_EQUIPMENT.find(e => e.id === part.id);
  if (!def) return;

  const refund = Math.floor(Math.round(def.baseCost * RARITY_COST_MULT[part.rarity]) * 0.5);

  document.dispatchEvent(new CustomEvent("shop:recycle", {
    detail: {
      effectId: part.id,
      rarityMultiplier: RARITY_EFFECT_MULT[part.rarity],
      refund,
    },
  }));

  equippedParts.splice(slotIdx, 1);
  recalcTagSynergies();
  selectedSlotIdx = -1;
}

function doSlotMerge(slotIdxA, slotIdxB) {
  const a = equippedParts[slotIdxA];
  const b = equippedParts[slotIdxB];
  if (!a || !b || a.id !== b.id || a.rarity !== b.rarity || a.rarity >= RARITY.LEGENDARY) return;

  const oldRarity = a.rarity;
  const newRarity = oldRarity + 1;

  // Upgrade slot A, remove slot B
  equippedParts[slotIdxA] = { id: a.id, rarity: newRarity };
  equippedParts.splice(slotIdxB, 1);

  document.dispatchEvent(new CustomEvent("shop:purchase-equipment", {
    detail: {
      effectId: a.id,
      cost: 0,
      rarityMultiplier: RARITY_EFFECT_MULT[newRarity],
      isMerge: true,
      oldRarityMultiplier: RARITY_EFFECT_MULT[oldRarity],
    },
  }));

  recalcTagSynergies();
  selectedSlotIdx = -1;
}
