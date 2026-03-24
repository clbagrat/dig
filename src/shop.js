import { SHOP_TREES as ALL_SHOP_TREES } from "./shop-config.js?v=37";
const SHOP_TREES = ALL_SHOP_TREES.slice(0, 1);

const levels = {};
const unlockedTreeIds = new Set(SHOP_TREES.map(t => t.id));
let onCloseCallback = null;
let selectedNodeId = null;
let selectedTreeId = null;
let currentGoldCache = 0;

// ─── Public ───────────────────────────────────────────────────────────────────

export function initShop(callbacks = {}) {
  onCloseCallback = callbacks.onClose ?? null;
  for (const tree of SHOP_TREES)
    for (const node of tree.nodes)
      levels[node.id] = 0;
  buildDOM();
  bindEvents();
}

export function openShop(currentGold) {
  const overlay = document.getElementById("shopModal");
  if (!overlay) return;
  currentGoldCache = currentGold;
  overlay.hidden = false;
  overlay.style.cssText =
    "position:absolute;inset:0;z-index:9998;display:flex;visibility:visible;pointer-events:auto;opacity:1;align-items:center;justify-content:center;";
  renderShop(currentGold);
  requestAnimationFrame(() => {
    drawAllLines();
    syncTabFromScroll();
  });
}

export function closeShop() {
  const overlay = document.getElementById("shopModal");
  if (!overlay) return;
  deselectNode();
  overlay.hidden = true;
  overlay.style.cssText = "display:none;visibility:hidden;pointer-events:none;opacity:0;";
  onCloseCallback?.();
}

export function getShopLevel(id) {
  return levels[id] ?? 0;
}

export function getLockedTrees() {
  return ALL_SHOP_TREES.filter(t => !unlockedTreeIds.has(t.id));
}

export function unlockTreeById(treeId) {
  const tree = ALL_SHOP_TREES.find(t => t.id === treeId);
  if (!tree || unlockedTreeIds.has(tree.id)) return null;
  unlockedTreeIds.add(tree.id);
  SHOP_TREES.push(tree);
  for (const node of tree.nodes) levels[node.id] = 0;

  // Append tab
  const tabsEl = document.getElementById("shopTabs");
  if (tabsEl) {
    const btn = document.createElement("button");
    btn.className = "shop-tab";
    btn.dataset.treeIdx = SHOP_TREES.length - 1;
    btn.textContent = `${tree.icon} ${tree.name}`;
    tabsEl.appendChild(btn);
  }

  // Append tree section
  const bodyEl = document.getElementById("shopBody");
  if (bodyEl) {
    const section = document.createElement("div");
    section.className = "shop-tree";
    section.id = `shopTree_${SHOP_TREES.length - 1}`;
    section.dataset.treeIdx = SHOP_TREES.length - 1;
    section.appendChild(buildTreeGrid(tree));
    bodyEl.appendChild(section);
  }

  return tree;
}

export function unlockRandomTree() {
  const locked = getLockedTrees();
  if (locked.length === 0) return null;
  const tree = locked[Math.floor(Math.random() * locked.length)];
  return unlockTreeById(tree.id);
}

export function renderShop(currentGold) {
  currentGoldCache = currentGold;
  const goldEl = document.getElementById("shopGoldValue");
  if (goldEl) goldEl.textContent = Math.floor(currentGold);
  for (const tree of SHOP_TREES)
    for (const node of tree.nodes)
      updateNodeDisplay(node, tree, currentGold);
  if (selectedNodeId) refreshDetailPanel();
}

// ─── DOM ──────────────────────────────────────────────────────────────────────

function buildDOM() {
  const overlay = document.getElementById("shopModal");
  if (!overlay) return;

  overlay.innerHTML = `
    <div class="shop-panel">
      <div class="shop-head">
        <span class="shop-head__title">Инструменты</span>
        <span class="shop-head__gold">
          <span class="shop-head__gold-icon"></span>
          <span id="shopGoldValue">0</span>
        </span>
        <button id="shopClose" class="shop-close" type="button">✕</button>
      </div>
      <div class="shop-tabs" id="shopTabs"></div>
      <div class="shop-body" id="shopBody"></div>
      <div class="shop-detail" id="shopDetail" hidden>
        <div class="shop-detail__row">
          <div class="shop-detail__icon" id="shopDetailIcon"></div>
          <div class="shop-detail__info">
            <div class="shop-detail__name" id="shopDetailName"></div>
            <div class="shop-detail__desc" id="shopDetailDesc"></div>
          </div>
        </div>
        <div class="shop-detail__footer">
          <div class="shop-detail__levels" id="shopDetailLevels"></div>
          <button class="shop-detail__buy" id="shopDetailBuy" type="button"></button>
        </div>
      </div>
    </div>
  `;

  const tabsEl = document.getElementById("shopTabs");
  SHOP_TREES.forEach((tree, idx) => {
    const btn = document.createElement("button");
    btn.className = "shop-tab" + (idx === 0 ? " shop-tab--active" : "");
    btn.dataset.treeIdx = idx;
    btn.textContent = `${tree.icon} ${tree.name}`;
    tabsEl.appendChild(btn);
  });

  const bodyEl = document.getElementById("shopBody");
  SHOP_TREES.forEach((tree, idx) => {
    const section = document.createElement("div");
    section.className = "shop-tree";
    section.id = `shopTree_${idx}`;
    section.dataset.treeIdx = idx;
    section.appendChild(buildTreeGrid(tree));
    bodyEl.appendChild(section);
  });

  // Обновляем активный таб при скролле
  bodyEl.addEventListener("scroll", () => {
    syncTabFromScroll();
    // перерисовываем линии только когда скролл остановился
    clearTimeout(bodyEl._linesTimer);
    bodyEl._linesTimer = setTimeout(() => drawAllLines(), 80);
  }, { passive: true });
}

function buildTreeGrid(tree) {
  const maxRow = Math.max(...tree.nodes.map(n => n.row));
  const maxCol = Math.max(...tree.nodes.map(n => n.col));

  const grid = document.createElement("div");
  grid.className = "shop-grid";
  grid.style.setProperty("--shop-cols", maxCol + 1);
  grid.dataset.treeId = tree.id;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.classList.add("shop-lines");
  svg.setAttribute("fill", "none");
  grid.appendChild(svg);

  for (const node of tree.nodes) {
    const cell = document.createElement("div");
    cell.className = "shop-cell";
    cell.style.gridColumn = node.col + 1;
    cell.style.gridRow = node.row + 1;
    cell.appendChild(buildNode(node, tree));
    grid.appendChild(cell);
  }

  return grid;
}

function buildNode(node, tree) {
  const el = document.createElement("div");
  el.className = "shop-node";
  el.id = `shopNode_${node.id}`;
  el.dataset.nodeId = node.id;
  el.dataset.treeId = tree.id;
  el.innerHTML = `
    <div class="shop-node__icon">${node.icon}</div>
    <div class="shop-node__name">${node.name}</div>
    <div class="shop-node__pips" id="shopPips_${node.id}"></div>
    <div class="shop-node__cost" id="shopCost_${node.id}"></div>
  `;
  return el;
}

// ─── SVG lines ────────────────────────────────────────────────────────────────

function drawAllLines() {
  document.querySelectorAll(".shop-grid").forEach(grid => {
    const tree = SHOP_TREES.find(t => t.id === grid.dataset.treeId);
    if (tree) drawLinesForGrid(grid, tree);
  });
}

function drawLinesForGrid(grid, tree) {
  const svg = grid.querySelector(".shop-lines");
  if (!svg) return;

  const gridRect = grid.getBoundingClientRect();
  svg.style.width = gridRect.width + "px";
  svg.style.height = gridRect.height + "px";
  svg.setAttribute("viewBox", `0 0 ${gridRect.width} ${gridRect.height}`);
  svg.innerHTML = "";

  for (const node of tree.nodes) {
    if (!node.requires) continue;
    const childEl = document.getElementById(`shopNode_${node.id}`);
    const parentEl = document.getElementById(`shopNode_${node.requires}`);
    if (!childEl || !parentEl) continue;

    const cr = childEl.getBoundingClientRect();
    const pr = parentEl.getBoundingClientRect();
    const x1 = pr.left + pr.width / 2 - gridRect.left;
    const y1 = pr.bottom - gridRect.top;
    const x2 = cr.left + cr.width / 2 - gridRect.left;
    const y2 = cr.top - gridRect.top;
    const my = (y1 + y2) / 2;

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", `M ${x1} ${y1} C ${x1} ${my}, ${x2} ${my}, ${x2} ${y2}`);
    path.setAttribute("stroke", "rgba(215,159,73,0.28)");
    path.setAttribute("stroke-width", "2");
    path.setAttribute("stroke-linecap", "round");
    svg.appendChild(path);
  }
}

// ─── Events ───────────────────────────────────────────────────────────────────

function bindEvents() {
  const overlay = document.getElementById("shopModal");
  if (!overlay) return;

  overlay.addEventListener("click", e => {
    if (e.target === overlay) { closeShop(); return; }
    if (e.target.closest("#shopClose")) { closeShop(); return; }

    const tab = e.target.closest(".shop-tab");
    if (tab) { selectTab(Number(tab.dataset.treeIdx)); return; }

    // Кнопка покупки в панели деталей
    if (e.target.closest("#shopDetailBuy")) {
      if (selectedNodeId && selectedTreeId) doPurchase(selectedNodeId, selectedTreeId);
      return;
    }

    // Клик на ноду — выбор/снятие выбора
    const nodeEl = e.target.closest(".shop-node");
    if (nodeEl) {
      const nid = nodeEl.dataset.nodeId;
      if (selectedNodeId === nid) {
        deselectNode();
      } else {
        selectNode(nid, nodeEl.dataset.treeId);
      }
      return;
    }

    // Клик мимо — снятие выбора
    if (!e.target.closest(".shop-detail")) {
      deselectNode();
    }
  });
}

function selectTab(idx) {
  deselectNode();
  const section = document.getElementById(`shopTree_${idx}`);
  section?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
}

function syncTabFromScroll() {
  const body = document.getElementById("shopBody");
  if (!body) return;
  const scrollLeft = body.scrollLeft;
  const width = body.clientWidth;
  const idx = Math.round(scrollLeft / width);
  document.querySelectorAll(".shop-tab").forEach((t, i) =>
    t.classList.toggle("shop-tab--active", i === idx));
}

// ─── Selection & detail panel ─────────────────────────────────────────────────

function selectNode(nodeId, treeId) {
  // Снять предыдущий выбор
  if (selectedNodeId) {
    document.getElementById(`shopNode_${selectedNodeId}`)?.classList.remove("shop-node--selected");
  }

  selectedNodeId = nodeId;
  selectedTreeId = treeId;
  document.getElementById(`shopNode_${nodeId}`)?.classList.add("shop-node--selected");

  const detail = document.getElementById("shopDetail");
  if (detail) detail.hidden = false;

  refreshDetailPanel();
}

function deselectNode() {
  if (selectedNodeId) {
    document.getElementById(`shopNode_${selectedNodeId}`)?.classList.remove("shop-node--selected");
  }
  selectedNodeId = null;
  selectedTreeId = null;
  const detail = document.getElementById("shopDetail");
  if (detail) detail.hidden = true;
}

function refreshDetailPanel() {
  if (!selectedNodeId || !selectedTreeId) return;

  const tree = SHOP_TREES.find(t => t.id === selectedTreeId);
  if (!tree) return;
  const node = tree.nodes.find(n => n.id === selectedNodeId);
  if (!node) return;

  const cur = levels[node.id] ?? 0;
  const maxed = cur >= node.maxLevel;
  const unlocked = isUnlocked(node);
  const cost = maxed ? 0 : node.costs[cur];
  const canAfford = !maxed && currentGoldCache >= cost;

  document.getElementById("shopDetailIcon").textContent = node.icon;
  document.getElementById("shopDetailName").textContent = node.name;
  document.getElementById("shopDetailDesc").textContent = node.desc;

  // Пипсы с подписью уровня
  const levelsEl = document.getElementById("shopDetailLevels");
  levelsEl.innerHTML = "";
  const pipsWrap = document.createElement("div");
  pipsWrap.className = "shop-detail__pips";
  for (let i = 0; i < node.maxLevel; i++) {
    const pip = document.createElement("span");
    pip.className = "shop-node__pip" + (i < cur ? " shop-node__pip--on" : "");
    pipsWrap.appendChild(pip);
  }
  const levelLabel = document.createElement("span");
  levelLabel.className = "shop-detail__level-label";
  levelLabel.textContent = maxed ? "Максимум" : `${cur} / ${node.maxLevel}`;
  levelsEl.appendChild(pipsWrap);
  levelsEl.appendChild(levelLabel);

  // Кнопка покупки
  const buyBtn = document.getElementById("shopDetailBuy");
  if (!unlocked) {
    buyBtn.textContent = "Заблокировано";
    buyBtn.className = "shop-detail__buy shop-detail__buy--locked";
    buyBtn.disabled = true;
  } else if (maxed) {
    buyBtn.textContent = "✓ Куплено";
    buyBtn.className = "shop-detail__buy shop-detail__buy--maxed";
    buyBtn.disabled = true;
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

// ─── Purchase ─────────────────────────────────────────────────────────────────

function doPurchase(nodeId, treeId) {
  const tree = SHOP_TREES.find(t => t.id === treeId);
  if (!tree) return;
  const node = tree.nodes.find(n => n.id === nodeId);
  if (!node) return;

  const cur = levels[nodeId] ?? 0;
  if (cur >= node.maxLevel || !isUnlocked(node)) return;

  const cost = node.costs[cur];
  if (currentGoldCache < cost) return;

  levels[nodeId] = cur + 1;
  document.dispatchEvent(new CustomEvent("shop:purchase", { detail: { nodeId, cost, level: levels[nodeId] } }));
  requestAnimationFrame(() => drawAllLines());
}

function isUnlocked(node) {
  if (!node.requires) return true;
  return (levels[node.requires] ?? 0) >= 1;
}

// ─── Node display ─────────────────────────────────────────────────────────────

function updateNodeDisplay(node, tree, currentGold) {
  const el = document.getElementById(`shopNode_${node.id}`);
  if (!el) return;

  const cur = levels[node.id] ?? 0;
  const maxed = cur >= node.maxLevel;
  const unlocked = isUnlocked(node);
  const cost = maxed ? 0 : node.costs[cur];
  const canAfford = !maxed && currentGold >= cost;

  el.classList.remove("shop-node--locked", "shop-node--maxed", "shop-node--can-buy");
  if (!unlocked)      el.classList.add("shop-node--locked");
  else if (maxed)     el.classList.add("shop-node--maxed");
  else if (canAfford) el.classList.add("shop-node--can-buy");

  const pipsEl = document.getElementById(`shopPips_${node.id}`);
  if (pipsEl) {
    pipsEl.innerHTML = "";
    for (let i = 0; i < node.maxLevel; i++) {
      const pip = document.createElement("span");
      pip.className = "shop-node__pip" + (i < cur ? " shop-node__pip--on" : "");
      pipsEl.appendChild(pip);
    }
  }

  const costEl = document.getElementById(`shopCost_${node.id}`);
  if (costEl) {
    if (maxed) {
      costEl.textContent = "✓";
      costEl.dataset.state = "maxed";
    } else {
      costEl.textContent = `${cost} ●`;
      costEl.dataset.state = canAfford ? "ok" : "dim";
    }
  }
}
