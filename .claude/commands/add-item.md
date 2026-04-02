---
name: add-item
description: Create a new shop item or equipment piece for the Dig project. Use when the user wants to design, balance, or implement a new item/equipment entry. Asks clarifying questions, then adds the content to the game, wires any new runtime effect, and syncs docs.
---

# Add Item

Create new item or equipment content for Dig through a short interview, then implement it in code.

## Workflow

1. Read the current project state before making assumptions:
   - `/root/dev/dig/src/items-catalog.js`
   - `/root/dev/dig/src/shop.js`
   - `/root/dev/dig/src/game.js` (applyShopPerk, removeShopPerk, state definition, reset)
2. Ask concise clarifying questions for any missing fields — prefer one compact batch.
3. Summarize the final item spec in 5–10 short lines and wait for confirmation.
4. Implement the item in code.
5. Sync docs if the mechanic is player-facing or changes gameplay rules.
6. Run validation.

## Question Order

Ask only for missing fields.

Required fields:
- `type`: `item` or `equipment`
- `name`
- `category` (must match an existing category in `CATEGORIES`)
- `icon`
- `initial rarity`
- `base cost`
- `description`
- exact effect numbers by rarity

Implementation questions (ask if not obvious):
- Is the effect passive, on-hit, on-pickup, timed, or triggered?
- Does it stack / merge with rarity?
- Does it need a new state stat or runtime hook in `game.js`?
- Does it need UI text in the shop compare/details?

Balance questions (ask if not specified):
- What should happen at `common`, `uncommon`, `rare`, `legendary`?
- Is the scaling additive, multiplicative, capped, or both?
- Does it interact with `damage`, `luck`, `heat`, `fuel`, `crit`, `gold`, `contours`, or `beacons`?

If the user gives a full spec, skip straight to confirmation summary and implementation.

## Implementation Rules

Treat `item` and `equipment` differently:
- `item`: add a catalog entry with `effect: { stat, value }` if the effect is a flat stat change.
- `equipment`: add a catalog entry and wire behavior through `applyShopPerk`, `removeShopPerk`, and any runtime hooks.

If the effect is not representable as a flat stat:
- add a new state field in `game.js`
- initialize it in the state object
- reset it in the reset function
- apply/remove it in `applyShopPerk` / `removeShopPerk`
- connect it to the correct runtime hook

## Description Rule

Write shop descriptions from actual numbers, not vague summaries.

Prefer:
- `Урон 5 (10% dmg, 10% luck).`
- `При ударе по золотой жиле увеличит ее ценность на 1.`

Avoid:
- `Бонусный урон по золотой жиле`

If the item scales by rarity, write the common-tier description only, or generate it dynamically if the UI supports it.

## File Targets

Most additions touch:
- `/root/dev/dig/src/items-catalog.js`
- `/root/dev/dig/src/game.js`

Sometimes also:
- `/root/dev/dig/src/shop.js`

## Balance Validation

Before confirming the spec, compare the new item's numbers against existing items with the same or similar stats.

**Steps:**

1. For each stat the new item affects, collect all existing items/equipment that affect the same stat.
2. Build a comparison table per rarity tier (common → legendary):

   | Предмет | C1 | C2 | C3 | C4 |
   |---------|----|----|----|----|
   | Существующий A | … | … | … | … |
   | Существующий B | … | … | … | … |
   | **Новый предмет** | … | … | … | … |

3. Check the following rules. Flag any violation with `⚠️` and explain the issue:
   - **Scaling consistency**: each rarity tier should be strictly stronger than the previous (no flat lines unless intentional).
   - **Range fit**: new values should not exceed legendary-tier values of existing items for the same stat unless the item has a meaningful drawback.
   - **Cost fit**: `baseCost` should be proportional to effect power relative to comparable items. A stronger item at the same rarity should cost more.
   - **Drawback balance**: if the item has a negative effect, check that the positive effect is proportionally stronger than a pure-buff item of the same cost.
   - **Legendary ceiling**: legendary-tier value should not be more than ~2–2.5× common-tier value for additive stats (multiplicative stats may scale differently, note it explicitly).

4. After the table, write a short verdict:
   - `✅ Баланс ок` — if all rules pass.
   - `⚠️ Требует корректировки` — list each issue and suggest adjusted numbers.

Present this balance report as part of the spec summary (step 3 of the Workflow). Wait for user confirmation before implementing.

## Syntax Validation

Always run after making changes:

```bash
node --check /root/dev/dig/src/items-catalog.js
node --check /root/dev/dig/src/game.js
node --check /root/dev/dig/src/shop.js
```
