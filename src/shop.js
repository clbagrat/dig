import {
  ALL_EQUIPMENT, ALL_GOODS,
  CATEGORIES, INITIAL_CATEGORIES,
  RARITY, RARITY_NAMES, RARITY_COLORS, RARITY_EFFECT_MULT,
  TAG_SYNERGIES, getGoodDescription,
} from "./items-catalog.js?v=1";
import { DEPTH_LEVELS } from "./worldgen.js?v=1";
import { t } from "./i18n.js";

// ── Constants ────────────────────────────────────────────────────────────────────

const GRID_H = 240;
const START_Y = 8;
const MAX_SLOTS = 6;
const INITIAL_SLOTS = 2;
const BASE_CATEGORY_ID = INITIAL_CATEGORIES[0] ?? "basic";
const BASE_CATEGORY_OFFERS = 2;
const SHOP_SELECTION_COST = 100;
const RARITY_UPGRADE_COST = 100;

// ── Module state ─────────────────────────────────────────────────────────────────

let unlockedCategories = new Set(INITIAL_CATEGORIES);
let maxSlots = INITIAL_SLOTS;
let equippedParts = getStarterEquipment();      // [{id, rarity}]
let purchasedItems = [];     // [{id, rarity}] — flat list, no limit
let currentOfferings = [];   // [{good, rarity}] dynamic by category layout
let shopLevel = 0;
let currentDepthLevel = 1;
let currentGoldCache = 0;
let currentLuckCache = 0;
let rarityBoostLevel = 0;
let rarityUpgradeUsed = false;
let currentStatsCache = null;
let defaultStatsCache = null;
let onCloseCallback = null;
let selectedOfferingIdx = -1;
let selectedSlotIdx = -1;    // slot selected for manual merge
let replaceMode = false;     // true when choosing slot to replace
let prevTagCounts = {};      // previous tag counts for synergy delta
let purchaseAnimating = false;
let previousRenderedStats = null;

function getStarterEquipment() {
  return [{ id: "basic_drill", rarity: RARITY.COMMON }];
}

// ── Public API ───────────────────────────────────────────────────────────────────

export function initShop(callbacks = {}) {
  onCloseCallback = callbacks.onClose ?? null;
  buildDOM();
  bindEvents();
}

export function openShop(currentGold, depthLevel, luck = 0, stats = null, defaultStats = null) {
  const overlay = document.getElementById("shopModal");
  if (!overlay) return;
  currentGoldCache = currentGold;
  currentLuckCache = luck;
  currentStatsCache = stats;
  if (defaultStats) defaultStatsCache = { ...defaultStats };
  currentDepthLevel = depthLevel ?? 1;
  shopLevel += 1;
  rarityBoostLevel = 0;
  rarityUpgradeUsed = false;
  previousRenderedStats = null;
  selectedOfferingIdx = -1;
  selectedSlotIdx = -1;
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
  hideShopItemTooltip();
  selectedOfferingIdx = -1;
  selectedSlotIdx = -1;
  replaceMode = false;
  overlay.hidden = true;
  overlay.style.cssText = "display:none;visibility:hidden;pointer-events:none;opacity:0;";
  onCloseCallback?.();
}

export function renderShop(currentGold, stats = null, defaultStats = null) {
  hideShopItemTooltip();
  currentGoldCache = currentGold;
  if (stats) {
    currentStatsCache = stats;
  }
  if (defaultStats) {
    defaultStatsCache = { ...defaultStats };
  }
  if (currentGoldCache < SHOP_SELECTION_COST) {
    closeShop();
    return;
  }
  const goldEl = document.getElementById("shopGoldValue");
  if (goldEl) goldEl.textContent = Math.floor(currentGold);
  const titleEl = document.getElementById("shopTitle");
  if (titleEl) titleEl.textContent = t("shop.title", { level: shopLevel, depth: currentDepthLevel });
  renderStats(true);
  renderOfferings();
  renderSlots();
  renderCurrentItems();
  renderRerollButton();
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
  rarityBoostLevel = 0;
  rarityUpgradeUsed = false;
  shopLevel = 0;
  currentDepthLevel = 1;
  currentStatsCache = null;
  defaultStatsCache = null;
  prevTagCounts = {};
  previousRenderedStats = null;
}

export function getEquippedParts() {
  return equippedParts.slice();
}

export function getPurchasedItems() {
  return purchasedItems.slice();
}

export function grantItem(good, rarity) {
  purchasedItems.push({ id: good.id, rarity });
  document.dispatchEvent(new CustomEvent("shop:purchase-item", {
    detail: {
      effect: good.effect,
      cost: 0,
      rarityMultiplier: RARITY_EFFECT_MULT[rarity],
      rarity,
    },
  }));
}

// ── Rarity rolling ───────────────────────────────────────────────────────────────

function lerp(a, b, t) { return a + (b - a) * t; }

function rollRarity(depthLevel, luck) {
  const t = Math.min((depthLevel - 1) / Math.max(1, DEPTH_LEVELS.length - 1), 1);
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

function clampRarityForGood(good, rarity) {
  const minRarity = good?.minRarity ?? RARITY.COMMON;
  const maxRarity = good?.maxRarity ?? RARITY.LEGENDARY;
  return Math.max(minRarity, Math.min(maxRarity, rarity));
}

function getOfferCategories() {
  const unlockedSpecial = CATEGORIES
    .filter((category) => category.id !== BASE_CATEGORY_ID && unlockedCategories.has(category.id))
    .map((category) => category.id);
  return [
    ...Array.from({ length: BASE_CATEGORY_OFFERS }, () => BASE_CATEGORY_ID),
    ...unlockedSpecial,
  ];
}

// ── Offering generation ──────────────────────────────────────────────────────────

function rollOfferings(luck) {
  const usedIds = new Set();
  const categories = getOfferCategories();
  const offerings = [];

  for (let i = 0; i < categories.length; i += 1) {
    const categoryId = categories[i];
    const rolled = Math.min(RARITY.LEGENDARY, rollRarity(currentDepthLevel, luck) + rarityBoostLevel);
    const categoryCandidates = ALL_GOODS.filter((good) =>
      good.category === categoryId &&
      !usedIds.has(good.id) &&
      !(good.unique && getItemStacks(good.id) > 0) &&
      (good.minRarity ?? RARITY.COMMON) <= rolled
    );

    let pick = null;
    if (categoryCandidates.length > 0) {
      pick = categoryCandidates[Math.floor(Math.random() * categoryCandidates.length)];
    } else {
      const categoryFallback = ALL_GOODS.filter((good) =>
        good.category === categoryId &&
        !usedIds.has(good.id) &&
        !(good.unique && getItemStacks(good.id) > 0)
      );
      if (categoryFallback.length > 0) {
        pick = categoryFallback[Math.floor(Math.random() * categoryFallback.length)];
      } else {
        const unlockedFallback = ALL_GOODS.filter((good) =>
          unlockedCategories.has(good.category) &&
          !usedIds.has(good.id) &&
          !(good.unique && getItemStacks(good.id) > 0)
        );
        if (unlockedFallback.length > 0) {
          pick = unlockedFallback[Math.floor(Math.random() * unlockedFallback.length)];
        }
      }
    }

    if (!pick) {
      offerings.push(null);
      continue;
    }

    usedIds.add(pick.id);
    offerings.push({ good: pick, rarity: clampRarityForGood(pick, rolled) });
  }

  currentOfferings = offerings;
}

// ── Cost calculation ─────────────────────────────────────────────────────────────

function getRarityUpgradeCost() {
  return RARITY_UPGRADE_COST;
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

function getOfferingCardRect(offeringIdx) {
  const card = document.querySelector(`.shop-card[data-offering-idx="${offeringIdx}"]`);
  return card ? card.getBoundingClientRect() : null;
}

function setOfferingCardFading(offeringIdx, isFading) {
  const card = document.querySelector(`.shop-card[data-offering-idx="${offeringIdx}"]`);
  if (!card) return;
  card.classList.toggle("shop-card--fading", !!isFading);
}

function getShopFallbackTarget() {
  const width = window.innerWidth || 0;
  const height = window.innerHeight || 0;
  return { x: width * 0.5, y: height * 0.5 };
}

function getRectCenter(rect) {
  return {
    x: rect.left + rect.width * 0.5,
    y: rect.top + rect.height * 0.5,
  };
}

function getShopEquipmentTargetPoint(slotIdx = null) {
  const targetEl = getShopEquipmentTargetElement(slotIdx);
  if (targetEl) return getRectCenter(targetEl.getBoundingClientRect());
  return getShopFallbackTarget();
}

function getShopEquipmentTargetElement(slotIdx = null) {
  if (Number.isInteger(slotIdx)) {
    const slotEl = document.querySelector(`.shop-slot[data-slot-idx="${slotIdx}"]`);
    if (slotEl) return slotEl;
  }
  return document.querySelector(".shop-slot--empty, .shop-slot--filled");
}

function getShopItemTargetPoint() {
  const targetEl = getShopItemTargetElement();
  if (targetEl) return getRectCenter(targetEl.getBoundingClientRect());
  return getShopFallbackTarget();
}

function getShopItemTargetElement(itemId = null, rarity = null) {
  const itemsRoot = document.getElementById("shopCurrentItems");
  if (itemsRoot && !itemsRoot.hidden) {
    if (itemId && Number.isFinite(rarity)) {
      const exact = itemsRoot.querySelector(`.shop-current-item[data-item-id="${itemId}"][data-item-rarity="${rarity}"]`);
      if (exact) return exact;
    }
    return itemsRoot.querySelector(".shop-current-items__grid, .shop-current-items__empty") || itemsRoot;
  }
  return null;
}

function animatePurchaseFlight(offering, sourceRect, targetPoint) {
  if (!offering || !sourceRect) return Promise.resolve();
  const target = targetPoint || getShopFallbackTarget();
  const startX = sourceRect.left + sourceRect.width * 0.5;
  const startY = sourceRect.top + sourceRect.height * 0.5;
  const dx = target.x - startX;
  const dy = target.y - startY;
  const node = document.createElement("div");
  node.className = "shop-flight";
  node.textContent = offering.good?.icon || "✦";
  node.style.left = `${startX - 16}px`;
  node.style.top = `${startY - 16}px`;
  document.body.appendChild(node);
  const animation = node.animate([
    { transform: "translate(0px, 0px) scale(1)", opacity: 0.95, offset: 0 },
    { transform: `translate(${dx * 0.35}px, ${dy * 0.35}px) scale(1.18)`, opacity: 1, offset: 0.32 },
    { transform: `translate(${dx}px, ${dy}px) scale(0.68)`, opacity: 0, offset: 1 },
  ], {
    duration: 430,
    easing: "cubic-bezier(0.22, 0.78, 0.2, 1)",
    fill: "forwards",
  });
  return animation.finished.catch(() => undefined).finally(() => {
    if (node.parentNode) node.parentNode.removeChild(node);
  });
}

function animatePurchaseFlipToElement(offering, sourceRect, targetEl, fallbackPoint = null) {
  if (!targetEl) {
    return animatePurchaseFlight(offering, sourceRect, fallbackPoint || getShopFallbackTarget());
  }
  const targetRect = targetEl.getBoundingClientRect();
  const sourceCenterX = sourceRect.left + sourceRect.width * 0.5;
  const sourceCenterY = sourceRect.top + sourceRect.height * 0.5;
  const targetCenterX = targetRect.left + targetRect.width * 0.5;
  const targetCenterY = targetRect.top + targetRect.height * 0.5;
  const dx = targetCenterX - sourceCenterX;
  const dy = targetCenterY - sourceCenterY;

  const ghost = document.createElement("div");
  ghost.className = "shop-flight";
  ghost.textContent = offering.good?.icon || "✦";
  ghost.style.left = `${sourceCenterX - 16}px`;
  ghost.style.top = `${sourceCenterY - 16}px`;
  document.body.appendChild(ghost);

  const ghostAnim = ghost.animate([
    { transform: "translate(0px, 0px) scale(1)", opacity: 0.96, offset: 0 },
    { transform: `translate(${dx}px, ${dy}px) scale(0.7)`, opacity: 0, offset: 1 },
  ], {
    duration: 430,
    easing: "cubic-bezier(0.22, 0.78, 0.2, 1)",
    fill: "forwards",
  });

  const invDx = sourceCenterX - targetCenterX;
  const invDy = sourceCenterY - targetCenterY;
  const targetAnim = targetEl.animate([
    { transform: `translate(${invDx}px, ${invDy}px) scale(0.36)`, opacity: 0.22 },
    { transform: "translate(0px, 0px) scale(1)", opacity: 1 },
  ], {
    duration: 430,
    easing: "cubic-bezier(0.22, 0.78, 0.2, 1)",
    fill: "both",
  });

  return Promise.all([
    ghostAnim.finished.catch(() => undefined),
    targetAnim.finished.catch(() => undefined),
  ]).finally(() => {
    if (ghost.parentNode) ghost.parentNode.removeChild(ghost);
  });
}

function animateTargetPulse(targetEl) {
  if (!targetEl) return Promise.resolve();
  const anim = targetEl.animate([
    { transform: "scale(1)", opacity: 1 },
    { transform: "scale(1.12)", opacity: 1, offset: 0.45 },
    { transform: "scale(1)", opacity: 1, offset: 1 },
  ], {
    duration: 260,
    easing: "cubic-bezier(0.2, 0.8, 0.25, 1)",
    fill: "both",
  });
  return anim.finished.catch(() => undefined);
}

async function animateEquipmentToSlot(offering, sourceRect, targetEl, fallbackPoint = null) {
  const point = fallbackPoint || getShopFallbackTarget();
  await animatePurchaseFlight(offering, sourceRect, point);
  await animateTargetPulse(targetEl);
}

async function tryPurchase(offeringIdx) {
  if (purchaseAnimating) return;
  const offering = currentOfferings[offeringIdx];
  if (!offering) return;
  const cost = SHOP_SELECTION_COST;
  const sourceRect = getOfferingCardRect(offeringIdx);

  if (offering.good.type === "item") {
    purchaseAnimating = true;
    setOfferingCardFading(offeringIdx, true);
    try {
      const hadStackBefore = purchasedItems.some((entry) =>
        entry.id === offering.good.id && (entry.rarity || RARITY.COMMON) === offering.rarity
      );
      purchasedItems.push({ id: offering.good.id, rarity: offering.rarity });
      renderCurrentItems();
      const itemTarget = getShopItemTargetElement(offering.good.id, offering.rarity);
      if (hadStackBefore) {
        await animatePurchaseFlight(offering, sourceRect, getShopItemTargetPoint());
        await animateTargetPulse(itemTarget);
      } else {
        await animatePurchaseFlipToElement(offering, sourceRect, itemTarget, getShopItemTargetPoint());
      }
      // Items: free pick, then paid transition to next set
      selectedOfferingIdx = -1;
      selectedSlotIdx = -1;
      replaceMode = false;
      rarityBoostLevel = 0;
      rollOfferings(currentLuckCache);

      document.dispatchEvent(new CustomEvent("shop:purchase-item", {
        detail: {
          effect: offering.good.effect,
          cost,
          rarityMultiplier: RARITY_EFFECT_MULT[offering.rarity],
          rarity: offering.rarity,
        },
      }));
    } finally {
      setOfferingCardFading(offeringIdx, false);
      purchaseAnimating = false;
    }
    return;
  }

  // Equipment
  if (hasFreeSlot()) {
    purchaseAnimating = true;
    setOfferingCardFading(offeringIdx, true);
    try {
      const equipTarget = getShopEquipmentTargetElement(equippedParts.length);
      await animateEquipmentToSlot(offering, sourceRect, equipTarget, getShopEquipmentTargetPoint(equippedParts.length));
      // Free slot available — always place there, never auto-merge
      equippedParts.push({ id: offering.good.id, rarity: offering.rarity });
      selectedOfferingIdx = -1;
      selectedSlotIdx = -1;
      replaceMode = false;
      rarityBoostLevel = 0;
      rollOfferings(currentLuckCache);

      document.dispatchEvent(new CustomEvent("shop:purchase-equipment", {
        detail: {
          effectId: offering.good.id,
          cost,
          rarity: offering.rarity,
          rarityMultiplier: RARITY_EFFECT_MULT[offering.rarity],
          isMerge: false,
          oldRarity: 0,
          oldRarityMultiplier: 0,
        },
      }));
      recalcTagSynergies();
    } finally {
      setOfferingCardFading(offeringIdx, false);
      purchaseAnimating = false;
    }
    return;
  }

  if (canMerge(offering)) {
    const existingIdx = equippedParts.findIndex(
      p => p.id === offering.good.id && p.rarity === offering.rarity
    );
    purchaseAnimating = true;
    setOfferingCardFading(offeringIdx, true);
    try {
      const mergeTarget = getShopEquipmentTargetElement(existingIdx);
      await animateEquipmentToSlot(offering, sourceRect, mergeTarget, getShopEquipmentTargetPoint(existingIdx));
      // No free slot — merge with existing same item+rarity
      const oldRarity = equippedParts[existingIdx].rarity;
      const newRarity = oldRarity + 1;
      equippedParts[existingIdx].rarity = newRarity;
      selectedOfferingIdx = -1;
      selectedSlotIdx = -1;
      replaceMode = false;
      rarityBoostLevel = 0;
      rollOfferings(currentLuckCache);

      document.dispatchEvent(new CustomEvent("shop:purchase-equipment", {
        detail: {
          effectId: offering.good.id,
          cost,
          rarity: newRarity,
          rarityMultiplier: RARITY_EFFECT_MULT[newRarity],
          isMerge: true,
          oldRarity,
          oldRarityMultiplier: RARITY_EFFECT_MULT[oldRarity],
        },
      }));
      recalcTagSynergies();
    } finally {
      setOfferingCardFading(offeringIdx, false);
      purchaseAnimating = false;
    }
    return;
  }

  // No free slot and no merge — enter replace mode
  replaceMode = true;
  renderShop(currentGoldCache);
}

async function doReplace(slotIdx) {
  if (purchaseAnimating) return;
  const offering = currentOfferings[selectedOfferingIdx];
  if (!offering || slotIdx < 0 || slotIdx >= equippedParts.length) return;
  const cost = SHOP_SELECTION_COST;
  const old = equippedParts[slotIdx];
  const sourceRect = getOfferingCardRect(selectedOfferingIdx);
  const purchaseIdx = selectedOfferingIdx;

  purchaseAnimating = true;
  setOfferingCardFading(purchaseIdx, true);
  try {
    const replaceTarget = getShopEquipmentTargetElement(slotIdx);
    await animateEquipmentToSlot(offering, sourceRect, replaceTarget, getShopEquipmentTargetPoint(slotIdx));
    selectedOfferingIdx = -1;
    selectedSlotIdx = -1;
    replaceMode = false;
    rarityBoostLevel = 0;
    rollOfferings(currentLuckCache);

    if (old) {
      document.dispatchEvent(new CustomEvent("shop:recycle", {
        detail: {
          effectId: old.id,
          rarity: old.rarity,
          rarityMultiplier: RARITY_EFFECT_MULT[old.rarity],
          refund: 0,
        },
      }));
    }

    // Place new equipment
    equippedParts[slotIdx] = { id: offering.good.id, rarity: offering.rarity };

    document.dispatchEvent(new CustomEvent("shop:purchase-equipment", {
      detail: {
        effectId: offering.good.id,
        cost,
        rarity: offering.rarity,
        rarityMultiplier: RARITY_EFFECT_MULT[offering.rarity],
        isMerge: false,
        oldRarity: 0,
        oldRarityMultiplier: 0,
      },
    }));

    recalcTagSynergies();
  } finally {
    setOfferingCardFading(purchaseIdx, false);
    purchaseAnimating = false;
  }
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
          <span class="shop-head__title" id="shopTitle">Shop</span>
          <span class="shop-head__gold">
            <span class="shop-head__gold-icon"></span>
            <span id="shopGoldValue">0</span>
          </span>
          <button id="shopReroll" class="shop-reroll" type="button"></button>
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
            </div>
          </div>
        </div>
        <div class="shop-slots" id="shopSlots"></div>
        <div class="shop-current-items" id="shopCurrentItems"></div>
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
}

function getDefaultStatValue(key) {
  const fallback = {
    drillPower: 20,
    damageBonus: 0,
    strikeSpeed: 0,
    maxHp: 100,
    maxFuel: 350,
    maxHeat: 100,
    heatRate: 1,
    effectDurationRate: 1,
    concentration: 0,
    fuelDrainRate: 1,
    visionRadius: 5,
    luck: 0,
    weakSpotChance: 0,
    weakSpotMult: 2,
    fuelToHpRate: 0,
    goldBonus: 0,
    shopPriceDiscount: 0,
    fuelBonus: 0,
    explosionDamage: 0,
    lowFuelDamageBonus: 0,
    goldBonusPerLevel: 0,
    miningGoldBonusMultiplier: 0,
    fuelPickupBonus: 0,
    speedOfAutoClose: 0,
  };
  if (defaultStatsCache && Number.isFinite(defaultStatsCache[key])) {
    return defaultStatsCache[key];
  }
  return fallback[key] ?? 0;
}

function isStatChanged(key, value) {
  const current = Number.isFinite(value) ? value : 0;
  const baseline = Number.isFinite(getDefaultStatValue(key)) ? getDefaultStatValue(key) : 0;
  return Math.abs(current - baseline) > 1e-6;
}

const STAT_DEFS = [
  { key: "drillPower",                get label() { return t("shop.stat.drillPower.label"); },                get shortLabel() { return t("shop.stat.drillPower.short"); },                format: "fixed1" },
  { key: "damageBonus",               get label() { return t("shop.stat.damageBonus.label"); },               get shortLabel() { return t("shop.stat.damageBonus.short"); },               format: "percent" },
  { key: "strikeSpeed",               get label() { return t("shop.stat.strikeSpeed.label"); },               get shortLabel() { return t("shop.stat.strikeSpeed.short"); },               format: "rawpercent" },
  { key: "maxHp",                     get label() { return t("shop.stat.maxHp.label"); },                     get shortLabel() { return t("shop.stat.maxHp.short"); },                     format: null },
  { key: "maxFuel",                   get label() { return t("shop.stat.maxFuel.label"); },                   get shortLabel() { return t("shop.stat.maxFuel.short"); },                   format: null },
  { key: "maxHeat",                   get label() { return t("shop.stat.maxHeat.label"); },                   get shortLabel() { return t("shop.stat.maxHeat.short"); },                   format: null },
  { key: "heatRate",                  get label() { return t("shop.stat.heatRate.label"); },                  get shortLabel() { return t("shop.stat.heatRate.short"); },                  format: "multiplier" },
  { key: "effectDurationRate",        get label() { return t("shop.stat.effectDurationRate.label"); },        get shortLabel() { return t("shop.stat.effectDurationRate.short"); },        format: "multiplier" },
  { key: "concentration",             get label() { return t("shop.stat.concentration.label"); },             get shortLabel() { return t("shop.stat.concentration.short"); },             format: "multiplier" },
  { key: "fuelDrainRate",             get label() { return t("shop.stat.fuelDrainRate.label"); },             get shortLabel() { return t("shop.stat.fuelDrainRate.short"); },             format: "multiplier" },
  { key: "visionRadius",              get label() { return t("shop.stat.visionRadius.label"); },              get shortLabel() { return t("shop.stat.visionRadius.short"); },              format: null },
  { key: "luck",                      get label() { return t("shop.stat.luck.label"); },                      get shortLabel() { return t("shop.stat.luck.short"); },                      format: null },
  { key: "weakSpotChance",            get label() { return t("shop.stat.weakSpotChance.label"); },            get shortLabel() { return t("shop.stat.weakSpotChance.short"); },            format: "percent" },
  { key: "weakSpotMult",              get label() { return t("shop.stat.weakSpotMult.label"); },              get shortLabel() { return t("shop.stat.weakSpotMult.short"); },              format: "multiplier" },
  { key: "fuelToHpRate",              get label() { return t("shop.stat.fuelToHpRate.label"); },               get shortLabel() { return t("shop.stat.fuelToHpRate.short"); },               format: "percent" },
  { key: "goldBonus",                 get label() { return t("shop.stat.goldBonus.label"); },                  get shortLabel() { return t("shop.stat.goldBonus.short"); },                  format: "percent" },
  { key: "shopPriceDiscount",         get label() { return t("shop.stat.shopPriceDiscount.label"); },          get shortLabel() { return t("shop.stat.shopPriceDiscount.short"); },          format: "percent" },
  { key: "fuelBonus",                 get label() { return t("shop.stat.fuelBonus.label"); },                  get shortLabel() { return t("shop.stat.fuelBonus.short"); },                  format: "percent" },
  { key: "explosionDamage",           get label() { return t("shop.stat.explosionDamage.label"); },            get shortLabel() { return t("shop.stat.explosionDamage.short"); },            format: "rawpercent" },
  { key: "lowFuelDamageBonus",        get label() { return t("shop.stat.lowFuelDamageBonus.label"); },         get shortLabel() { return t("shop.stat.lowFuelDamageBonus.short"); },         format: "percent" },
  { key: "goldBonusPerLevel",         get label() { return t("shop.stat.goldBonusPerLevel.label"); },          get shortLabel() { return t("shop.stat.goldBonusPerLevel.short"); },          format: "percent" },
  { key: "miningGoldBonusMultiplier", get label() { return t("shop.stat.miningGoldBonusMultiplier.label"); }, get shortLabel() { return t("shop.stat.miningGoldBonusMultiplier.short"); }, format: "percent" },
  { key: "fuelPickupBonus",           get label() { return t("shop.stat.fuelPickupBonus.label"); },           get shortLabel() { return t("shop.stat.fuelPickupBonus.short"); },           format: "percent" },
  { key: "speedOfAutoClose",          get label() { return t("shop.stat.speedOfAutoClose.label"); },          get shortLabel() { return t("shop.stat.speedOfAutoClose.short"); },          format: "rawpercent" },
];

function renderStats(short = false) {
  const container = document.getElementById("shopStats");
  if (!container) return;
  const stats = currentStatsCache;
  if (!stats) {
    container.innerHTML = "";
    container.hidden = true;
    return;
  }

  const visibleDefs = STAT_DEFS.filter((def) => isStatChanged(def.key, stats[def.key]));

  if (visibleDefs.length === 0) {
    container.innerHTML = "";
    container.hidden = true;
    previousRenderedStats = stats ? { ...stats } : null;
    return;
  }

  const canAnimateDiff = !!previousRenderedStats;
  container.hidden = false;
  container.innerHTML = visibleDefs.map((def) => `
    <div class="shop-stats__item${getStatBumpClass(def.key, stats[def.key], canAnimateDiff)}" data-full-label="${def.label}">
      <span class="shop-stats__label">${short ? def.shortLabel : def.label}</span>
      <span class="shop-stats__value">${formatStatValue(stats[def.key], def.format)}</span>
    </div>
  `).join("");

  container.querySelectorAll(".shop-stats__item").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      showStatTooltip(el, el.dataset.fullLabel);
    });
  });

  previousRenderedStats = { ...stats };
}

function getStatBumpClass(key, currentValue, canAnimateDiff) {
  if (!canAnimateDiff) return "";
  const prevValue = Number(previousRenderedStats?.[key]);
  const nextValue = Number(currentValue);
  if (!Number.isFinite(prevValue) || !Number.isFinite(nextValue)) return "";
  const delta = nextValue - prevValue;
  if (Math.abs(delta) <= 1e-6) return "";
  return delta > 0 ? " shop-stats__item--bump-pos" : " shop-stats__item--bump-neg";
}

let _statTooltipEl = null;
let _statTooltipHideHandler = null;
let _shopItemTooltipEl = null;
let _shopItemTooltipHideHandler = null;

function showStatTooltip(anchor, text) {
  if (!_statTooltipEl) {
    _statTooltipEl = document.createElement("div");
    _statTooltipEl.className = "stat-tooltip";
    document.body.appendChild(_statTooltipEl);
  }

  if (_statTooltipHideHandler) {
    document.removeEventListener("click", _statTooltipHideHandler);
    _statTooltipHideHandler = null;
  }

  _statTooltipEl.textContent = text;
  _statTooltipEl.hidden = false;

  const rect = anchor.getBoundingClientRect();
  const ttW = _statTooltipEl.offsetWidth;
  let left = rect.left + rect.width / 2 - ttW / 2;
  left = Math.max(4, Math.min(left, window.innerWidth - ttW - 4));
  _statTooltipEl.style.left = left + "px";
  _statTooltipEl.style.top = (rect.top - _statTooltipEl.offsetHeight - 6) + "px";

  _statTooltipHideHandler = () => {
    _statTooltipEl.hidden = true;
    _statTooltipHideHandler = null;
  };
  setTimeout(() => document.addEventListener("click", _statTooltipHideHandler, { once: true }), 0);
}

function buildShopTooltipEntry(target) {
  const card = target.closest(".shop-card[data-offering-idx]");
  if (card) {
    const idx = Number(card.dataset.offeringIdx);
    const offering = currentOfferings[idx];
    if (offering?.good) {
      return {
        anchor: card,
        good: offering.good,
        rarity: offering.rarity,
      };
    }
  }

  const slot = target.closest(".shop-slot--filled[data-slot-idx]");
  if (slot) {
    const slotIdx = Number(slot.dataset.slotIdx);
    const part = equippedParts[slotIdx];
    if (part) {
      const good = ALL_EQUIPMENT.find((entry) => entry.id === part.id);
      if (good) {
        return {
          anchor: slot,
          good,
          rarity: part.rarity || RARITY.COMMON,
        };
      }
    }
  }

  const currentItem = target.closest(".shop-current-item[data-item-id][data-item-rarity]");
  if (currentItem) {
    const itemId = currentItem.dataset.itemId;
    const rarity = Number(currentItem.dataset.itemRarity) || RARITY.COMMON;
    const good = ALL_GOODS.find((entry) => entry.id === itemId);
    if (good) {
      return {
        anchor: currentItem,
        good,
        rarity,
      };
    }
  }

  return null;
}

function hideShopItemTooltip() {
  if (_shopItemTooltipEl) _shopItemTooltipEl.hidden = true;
  if (_shopItemTooltipHideHandler) {
    document.removeEventListener("click", _shopItemTooltipHideHandler);
    _shopItemTooltipHideHandler = null;
  }
}

function showShopItemTooltip(entry) {
  if (!entry?.good || !entry.anchor) return;
  if (!_shopItemTooltipEl) {
    _shopItemTooltipEl = document.createElement("div");
    _shopItemTooltipEl.className = "shop-item-tooltip";
    document.body.appendChild(_shopItemTooltipEl);
  }

  const rarityName = RARITY_NAMES[entry.rarity] || "";
  const rarityColor = RARITY_COLORS[entry.rarity] || "#aaa";
  const category = CATEGORIES.find((cat) => cat.id === entry.good.category);
  const desc = getGoodDescription(entry.good, entry.rarity, currentStatsCache || undefined).replace(/\n/g, "<br>");

  _shopItemTooltipEl.innerHTML = `
    <div class="shop-item-tooltip__type">${entry.good.type === "equipment" ? "⛏" : "✧"}</div>
    <div class="shop-item-tooltip__top">
      <span class="shop-item-tooltip__icon">${entry.good.icon || "?"}</span>
      <span class="shop-item-tooltip__name">${entry.good.name}</span>
    </div>
    <div class="shop-item-tooltip__meta">
      ${category ? `<span class="shop-item-tooltip__category">${category.icon} ${category.name}</span>` : ""}
      <span class="shop-item-tooltip__rarity" style="color:${rarityColor}">${rarityName}</span>
    </div>
    <div class="shop-item-tooltip__desc">${desc}</div>
  `;
  _shopItemTooltipEl.hidden = false;

  const anchorRect = entry.anchor.getBoundingClientRect();
  const tooltipRect = _shopItemTooltipEl.getBoundingClientRect();
  let left = anchorRect.left + anchorRect.width / 2 - tooltipRect.width / 2;
  if (left < 8) left = 8;
  if (left + tooltipRect.width > window.innerWidth - 8) {
    left = window.innerWidth - tooltipRect.width - 8;
  }
  let top = anchorRect.top - tooltipRect.height - 6;
  if (top < 8) top = anchorRect.bottom + 6;
  if (top + tooltipRect.height > window.innerHeight - 8) {
    top = window.innerHeight - tooltipRect.height - 8;
  }
  if (top < 8) top = 8;
  _shopItemTooltipEl.style.left = `${left}px`;
  _shopItemTooltipEl.style.top = `${top}px`;

  if (_shopItemTooltipHideHandler) document.removeEventListener("click", _shopItemTooltipHideHandler);
  _shopItemTooltipHideHandler = (ev) => {
    if (_shopItemTooltipEl?.contains(ev.target)) return;
    hideShopItemTooltip();
  };
  setTimeout(() => document.addEventListener("click", _shopItemTooltipHideHandler, { once: true }), 0);
}

function renderOfferings() {
  const container = document.getElementById("shopOfferings");
  if (!container) return;
  container.innerHTML = "";

  if (!hasShopContent()) {
    const empty = document.createElement("div");
    empty.className = "shop-empty";
    empty.innerHTML = `
      <div class="shop-empty__title">${t("shop.empty.title")}</div>
      <div class="shop-empty__text">${t("shop.empty.text")}</div>
    `;
    container.appendChild(empty);
    return;
  }

  for (let i = 0; i < currentOfferings.length; i++) {
    const offering = currentOfferings[i];
    const card = document.createElement("div");

    if (!offering) {
      card.className = "shop-card shop-card--sold";
      card.innerHTML = `<div class="shop-card__sold">${t("shop.sold")}</div>`;
      container.appendChild(card);
      continue;
    }

    const isMerge = canMerge(offering);
    const isSelected = selectedOfferingIdx === i;
    const isEquip = offering.good.type === "equipment";

    let cls = "shop-card";
    cls += ` shop-card--rarity-${offering.rarity}`;
    if (isEquip) cls += " shop-card--equipment";
    else cls += " shop-card--item";
    if (isMerge) cls += " shop-card--merge";
    if (isSelected) cls += " shop-card--selected";

    card.className = cls;
    card.dataset.offeringIdx = i;

    const typeLabel = isEquip ? "⛏" : "✧";
    const mergeLabel = isMerge ? `<div class="shop-card__merge">${t("shop.merge_label")}</div>` : "";
    const catId = offering.good.category;
    const catDef = catId ? CATEGORIES.find(c => c.id === catId) : null;
    const catLabel = catDef ? `<div class="shop-card__category">${catDef.icon} ${catDef.name}</div>` : "";
    const desc = getGoodDescription(offering.good, offering.rarity, currentStatsCache);

    card.innerHTML = `
      <div class="shop-card__type">${typeLabel}</div>
      <div class="shop-card__icon">${offering.good.icon}</div>
      <div class="shop-card__name">${offering.good.name}</div>
      ${catLabel}
      <div class="shop-card__desc">${desc.replace(/\n/g, "<br>")}</div>
      ${mergeLabel}
      <div class="shop-card__cost">${RARITY_NAMES[offering.rarity]}</div>
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
      `;
    } else {
      slot.className = "shop-slot shop-slot--empty";
      slot.dataset.slotIdx = i;
      slot.innerHTML = `<span class="shop-slot__empty">+</span>`;
    }

    container.appendChild(slot);
  }
}

function renderCurrentItems() {
  const container = document.getElementById("shopCurrentItems");
  if (!container) return;
  if (!hasShopContent()) {
    container.hidden = true;
    container.innerHTML = "";
    return;
  }

  const stacks = new Map();
  for (const entry of purchasedItems) {
    const key = `${entry.id}:${entry.rarity || RARITY.COMMON}`;
    const next = stacks.get(key) || { id: entry.id, rarity: entry.rarity || RARITY.COMMON, count: 0 };
    next.count += 1;
    stacks.set(key, next);
  }
  const stackList = Array.from(stacks.values());

  if (stackList.length === 0) {
    container.hidden = false;
    container.innerHTML = `
      <div class="shop-current-items__empty">—</div>
    `;
    return;
  }

  container.hidden = false;
  container.innerHTML = `
    <div class="shop-current-items__grid">
      ${stackList.map((stack) => {
        const def = ALL_GOODS.find((good) => good.id === stack.id);
        const icon = def?.icon || "?";
        const rarityColor = RARITY_COLORS[stack.rarity] || "#aaa";
        return `
          <div class="shop-current-item shop-current-item--rarity-${stack.rarity}" data-item-id="${stack.id}" data-item-rarity="${stack.rarity}">
            <span class="shop-current-item__icon">${icon}</span>
            <span class="shop-current-item__rarity" style="color:${rarityColor}">★</span>
            <span class="shop-current-item__count">×${stack.count}</span>
          </div>
        `;
      }).join("")}
    </div>
  `;
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
  const cost = getRarityUpgradeCost();
  const canAfford = currentGoldCache >= cost;
  const hasUpgradeable = currentOfferings.some((offering) =>
    offering && offering.rarity < (offering.good.maxRarity ?? RARITY.LEGENDARY)
  );
  btn.textContent = t("shop.rarity_up_btn", { cost });
  btn.className = "shop-reroll" + (canAfford ? "" : " shop-reroll--poor");
  btn.disabled = !canAfford || !hasUpgradeable || rarityUpgradeUsed;
}

function renderDetail() {
  const detail = document.getElementById("shopDetail");
  if (detail) detail.hidden = true;
}

// ── Events ───────────────────────────────────────────────────────────────────────

function bindEvents() {
  const overlay = document.getElementById("shopModal");
  if (!overlay) return;

  overlay.addEventListener("click", e => {
    if (purchaseAnimating) return;
    // Rarity upgrade
    if (e.target.closest("#shopReroll")) {
      doRarityUpgrade();
      renderShop(currentGoldCache);
      return;
    }

    // Slot click (replace mode)
    const slotEl = e.target.closest(".shop-slot--replaceable");
    if (slotEl && replaceMode) {
      const slotIdx = Number(slotEl.dataset.slotIdx);
      doReplace(slotIdx);
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
          return;
        }
      }
      // Keep slot selection state for optional merge logic, but do not force re-render:
      // it would immediately rebuild DOM and break tooltip placement on mobile.
      selectedSlotIdx = slotIdx;
      selectedOfferingIdx = -1;
      replaceMode = false;
      const entry = buildShopTooltipEntry(anySlot);
      if (entry) {
        e.stopPropagation();
        showShopItemTooltip(entry);
      }
      return;
    }

    // Offering card click
    const card = e.target.closest(".shop-card[data-offering-idx]");
    if (card) {
      const idx = Number(card.dataset.offeringIdx);
      selectedOfferingIdx = idx;
      selectedSlotIdx = -1;
      tryPurchase(idx);
      return;
    }

    // Click outside
    if (
      !e.target.closest(".shop-detail") &&
      !e.target.closest(".shop-slot") &&
      !e.target.closest(".shop-current-item")
    ) {
      selectedOfferingIdx = -1;
      selectedSlotIdx = -1;
      replaceMode = false;
      renderShop(currentGoldCache);
    }
  });

  overlay.addEventListener("click", (e) => {
    const entry = buildShopTooltipEntry(e.target);
    if (!entry) return;
    if (e.target.closest(".shop-current-item")) {
      e.stopPropagation();
      showShopItemTooltip(entry);
    }
  });

}

function doRarityUpgrade() {
  const cost = getRarityUpgradeCost();
  if (currentGoldCache < cost || rarityUpgradeUsed) return;

  let changed = false;
  for (const offering of currentOfferings) {
    if (!offering) continue;
    const nextRarity = clampRarityForGood(offering.good, offering.rarity + 1);
    if (nextRarity !== offering.rarity) {
      offering.rarity = nextRarity;
      changed = true;
    }
  }
  if (!changed) return;
  rarityUpgradeUsed = true;

  document.dispatchEvent(new CustomEvent("shop:rarity-upgrade", {
    detail: { cost },
  }));
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
      rarity: newRarity,
      rarityMultiplier: RARITY_EFFECT_MULT[newRarity],
      isMerge: true,
      oldRarity,
      oldRarityMultiplier: RARITY_EFFECT_MULT[oldRarity],
    },
  }));

  recalcTagSynergies();
  selectedSlotIdx = -1;
}
