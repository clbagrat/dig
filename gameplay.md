# Gameplay

## Premise

Mobile top-down drilling game on a `canvas`.

The player starts in the center of a rock field and searches for a hidden base.
The player sees only within a small radius around the driller.

The run is about:
- managing fuel,
- collecting experience from destroyed blocks,
- choosing digging routes through mixed rock difficulty,
- picking up tile perks,
- drawing contours around beacons to unlock the shop,
- spending gold on upgrades.

## Goal And Failure

Win condition:
- the run is won only when the driller stands on the exact base tile.

Loss condition:
- if fuel reaches `0`, the run ends.

## Map

Current map size:
- `150 x 150` tiles

Depth layout (current default):
- Level 1: `24 x 17`
- Level 2: `26 x 26`
- Level 3: `28 x 40`
- Level 4: `32 x 52`

Start:
- the driller starts at the center of the map
- the start tile is opened immediately

Base:
- the base initially spawns at exact distance `50` tiles from the start
- base host level is Level 4 by default
- the base can become visible when inside vision radius
- visibility alone does not count as success

## Visibility

Current vision radius:
- `5`

The player only sees nearby cells around the driller.
Everything outside the radius is hidden by fog of war.

## Start Zones

Two concentric zones are guaranteed around the player start:

**Easy zone** (radius `5`):
- all rock is forced to tier 1
- no hazards, metal, gas, steam, or boulders spawn here

**Near zone** (radius `7`, ring between 5 and 7):
- guaranteed `4` scrap ore tiles

## Terrain Generation

Rock is generated from a layered field rather than from independent random cells.

Current model:
- base danger increases with distance from the start
- large soft/hard regions are added as blobs
- extra variety is added with vein-like chains
- final danger is quantized into `7` rock tiers

Design intent:
- farther from the center is usually harder
- local routes still contain surprises
- the field should look geological rather than like pure noise

## Scrap Ore

Scrap ore tiles are scattered across the map in vein groups.

Current generation:
- `50` vein groups, each `4–10` tiles
- scrap ore does not spawn inside the easy zone (radius `5`)
- `4` scrap ore tiles are guaranteed inside the near zone (radius `5–7`)

Effect:
- picking up a scrap ore tile gives a gold bonus

## Rock Tiers

There are `7` rock tiers plus tunnel.

Current durability / gold:
- Tier 1: `60 hp`, `2 gold`
- Tier 2: `90 hp`, `4 gold`
- Tier 3: `120 hp`, `6 gold`
- Tier 4: `180 hp`, `8 gold`
- Tier 5: `300 hp`, `11 gold`
- Tier 6: `420 hp`, `14 gold`
- Tier 7: `600 hp`, `18 gold`

Current baseline:
- base drill hit damage: `10`
- `damage` stat starts at `10`
- the `damage` stat does not increase the base hit by itself
- `damage` matters only for equipment or effects that explicitly scale from `dmg`

## Movement And Drilling

Movement and drilling are both discrete and share the same strike rhythm.

Rules:
- the driller only deals damage on hit moments
- the driller only steps on rhythm peaks
- moving through tunnels uses the same cadence as drilling
- drilling has strike animation and camera shake

This creates a deliberate `chunk-chunk-chunk` feel instead of smooth sliding.

## Fuel

Current baseline:
- starting HP: `4`
- starting fuel: `350`
- max fuel: `350` by default
- passive drain: `0.8 / sec`
- drilling drain: `8 / sec` while the action cooldown is active

Fuel can be modified by perks and upgrades.

Important note:
- `Перегрузка` reduces max fuel by `150`

## Collapses

There is a periodic collapse hazard tied to a collapse budget.

Rules:
- the run starts with `600` collapse points
- every destroyed block subtracts its rock tier from that pool
- every explosion additionally subtracts `10 * cellCountInExplosionRadius`
- when the pool reaches `0`, one collapse is queued and the pool is refilled by `600`
- the collapse telegraphs as a red danger zone above and around the driller on nearby empty tiles
- after about `2.4` seconds, new rock blocks fall into those tiles
- if the driller is still inside the collapse zone when it lands, the driller takes `25` damage

Current block spawn:
- collapse rock uses hardness based on current run depth
- only nearby walkable tiles are selected
- collapse tiles are never selected inside the beacon activation area (`2×2` core + `1` tile ring)
- the collapse can seal recently opened tunnels and break an active contour path

## Gold

Gold is earned from destroyed rock and scrap ore.

Gold is spent in the beacon shop:
- each beacon opens a shop when activated
- in each shop cycle the player picks one free offer, then pays `100 gold` for the next cycle
- if gold is below `100`, the shop closes automatically
- the driller starts the run with one equipped `common` copy of `Просто дрель`

## Experience And Levels

Every destroyed block drops `10 XP` on the tile where that block stood.

Pickup rules:
- experience stays on the map until collected
- the driller picks it up automatically when within radius `1`
- multiple drops on one tile stack together

Current level flow:
- the run starts at level `1`
- level requirement grows non-linearly: `round(400 * 1.3^(level-1))`
- each level up opens a reward choice modal when a reward tier is assigned
- reward tiers currently work like this:
  - first reward: `+5% gold from mined blocks` or `+0.35 damage` or `+10% speed`
  - second reward: `+5% gold from mined blocks` or `+100 fuel`
  - third reward: `+0.35 damage` or `+100 fuel` or `+1 max HP`
  - fourth reward: `carried artifact to deliver to a beacon` or `full heal + full fuel`
  - fifth reward: `+10% speed` or `+100 fuel` or `+1 HP`
  - sixth reward: `+5% gold from mined blocks` or `+100 fuel` or `+1 HP`
  - after that, rewards repeat in the cycle: `third → fifth → sixth`

## Radar

Radar is a tile perk.

Current behavior:
- on pickup, radar immediately points toward the base
- while radar time remains, a circular marker appears around the driller
- a bright point on that ring shows the direction to the base

Duration:
- base radar gives `10` seconds
- `Радарный модуль` marks the nearest crystal of each color on the radar ring

UI:
- the direction ring is shown above the driller
- remaining time is shown as a small progress bar under the ring

## Tile Perks

Tile perks are pickups placed directly on the map.

Current tile perk pool and weights:
- `Бак`: `7`
- `Бомба`: `4`
- `HP+`: `2`
- `Броня`: `2`

Note: `Радар`, `Бур`, `Скорость` have weight `0` and do not spawn as tile perks on the map.

Current spatial rules:
- tile perks are denser near the center of the map
- near the center, `Бак` gets extra weight
- tile perks respect minimum local spacing

### Tile Perk Effects

`Бак`
- gives fuel immediately
- current raw amount before other fuel systems: `60`

`Бомба`
- fires a rocket immediately in the current drilling direction
- current damage: `drillPower * 10`
- current radius: `2`

`HP+`
- `+1` to current HP (up to max)

`Броня`
- `+1` armor against external hazard damage

## Perk Zones

There are hidden `3x3` perk zones under rock.

Rules:
- each zone is assigned one tile perk type
- the symbol becomes visible on opened zone floor tiles
- reward triggers only when all `9` cells are opened

Reward:
- the player gets `3` copies of that tile perk

Special bomb zone:
- instead of three ordinary bomb pickups, it triggers one larger explosion
- current large bomb radius: `3`

Zones are generated from density rules and scale with map area.

## Beacons

Beacons are fixed landmarks placed on the map during generation.

Structure:
- each beacon occupies a `2×2` core (hardness `0`, always open)
- surrounded by a 1-tile ring (also open, becomes tunnel)

Count and placement:
- `25` regular beacons placed randomly at distance `9–60` from start
- `4` compass beacons guaranteed at distance `11` in N/S/E/W directions from start
- minimum distance between any two beacons: `9` tiles
- beacons never overlap with metal, hazards, gas, steam, or boulders

Activation:
- a beacon is activated by closing a contour around its `2×2` core inside the beacon ring
- on activation: full fuel restore triggers during the animation
- a `2000 ms` radar animation plays (ring → line → dot), followed by a `500 ms` pause
- after the animation the shop (or artifact choice) opens
- some beacons can generate as hidden: their `2×2` core is buried under ordinary breakable blocks until activation
- hidden beacons do not get the normal 1-tile open ring; that area is filled with ordinary excavatable blocks as well
- the beacon is rendered under those blocks and gets revealed as the core is excavated; on activation it becomes a normal beacon core
- once a hidden core is fully excavated, it immediately solidifies into a normal non-walkable beacon core; if the player stands on it, the drill is pushed to the nearest free tile and the current contour is cleared
- when all beacon wires are fully freed, `Full Freedom` triggers automatically: beacon wires fully fade out, then the beacon grants a bonus item reward
- if beacon wires were already fully freed before the first activation, the beacon still opens the normal shop first; `Full Freedom` triggers automatically after the shop flow is closed
- active beacons still accept contour-gold deposits

Gameplay role:
- once activated, a beacon shows the direction to the base (similar to radar)

## Shop

The shop opens after each beacon activation.
Each cycle offers:
- `2` goods from the baseline `Базовое` category
- `1` good from each additional category unlocked through artifacts

Current available categories:
- `Базовое`
- `Экономика`

Cycle rules:
- offered goods are free to take
- the first taken offer in a visit is always free
- after taking any offer, reroll cost is charged only if there is enough gold for a new set; then the shop immediately generates a fresh set
- reroll cost formula: `30 + 10 * (N - 1)`, where `N = current shop level + rerolls already made in this shop visit`
- skipping is not allowed while enough gold remains for another cycle
- the shop closes itself when gold drops below the current reroll cost
- once per offered set, a paid action can increase rarity of the currently shown offers
- rarity upgrade cost is `50%` of the current reroll cost

Artifact-to-shop progression:
- activations `1-2`: unlock a new category and add `+1` slot (category can be chosen if multiple are locked)
- activation `3`: unlock a new category and replace one baseline offer slot with category offers (no extra slot)
- activation `4`: no category choice; `1` offer is guaranteed at least `Uncommon`
- activation `5`: no category choice; `2` offers are guaranteed at least `Uncommon`
- activation `6`: no category choice; `1` offer is guaranteed at least `Uncommon` and `1` at least `Rare`
- activation `7+`: no category choice; artifact converts into `500 gold`

Current available shop content includes:
- baseline stat items for core build directions such as HP, fuel, heat, contour size, weak spots, explosion scaling, and per-level growth
- tradeoff items where one stat rises while another falls, mostly concentrated in `Базовое`
- equipment such as `Просто дрель`, `Разменный бур`, `Осколочный бур`, and `Кирка счастливчика`, which remain part of the early shop pool
- alchemy equipment `Маячный реторт-бур`: `12` base damage; when mining toward a beacon and moving closer to it within radius `10`, adds `20 + 15/20/25/30% drillPower`
- a new low-fuel damage stat that can appear on shop items and scales drill damage as the tank empties

## Overflow / Remote Bomb Rules

There are multiple remote bomb style systems.

`Перегрузка` overflow:
- triggered when a fuel gain overflows max fuel
- gives a short forced charge (overdrive), then causes explosion and stun
- overflow can trigger only once per fuel event
- while resolving, fuel rewards from the explosion chain cannot retrigger another overflow

`Саперный заряд`:
- separate remote bomb system
- triggers every `15` destroyed blocks (decreases by 5 per upgrade level, minimum 15)

## Fuel Event Rules

Fuel gains can come from several stacked sources:
- direct tile perk (Бак)
- chained perk rewards

To prevent abuse and recursion:
- one fuel event can cause at most one overflow trigger
- zone rewards and perk rewards are grouped into single fuel events

## Crystals

Crystals are rare pickups scattered across the map.

Types: Красный, Желтый, Светлый, Зеленый, Синий.

Each crystal collected contributes to a recipe.
When a recipe of `3` crystals of the correct types is completed, a tile perk reward is given:
- Красный → Бур (+0.35 drill power)
- Желтый → Бак (+60 fuel)
- Светлый → Радар (+10 sec)
- Зеленый → HP+
- Синий → Скорость (+10% speed)

The recipe is generated from crystals that exist on the current depth level.
Picking up a wrong crystal no longer resets the recipe; instead, the drill is stunned for `1` second.

`Радарный модуль` marks the nearest crystal of each color on the radar ring.

`Alchemy & Navigation` now also includes crystal-color trigger items:
- red crystal pickup: `+1 drillPower`
- yellow crystal pickup: `+1 explosionPower`
- green crystal pickup: heal `+5 HP`
- light crystal pickup: hero radar for `1 sec`
- blue crystal pickup: `+1% strikeSpeed`

## Block Visuals

Block appearance scales with tier to communicate hardness at a glance.

Visual cues that increase with tier:
- gradient contrast (tier 1 is nearly flat, tier 7 is sharp light→dark)
- grain/noise density (scales from ~12 at tier 1 to ~35 at tier 7)
- edge vignette depth

Color:
- tier 1 is light warm brown; tier 7 is dark brown with a slight cool shift
- all tiers share one unified palette — no abrupt hue jumps

Sprite variants:
- each tier has `4` randomly assigned sprite variants to break visual repetition
- variant is chosen per-block from a position hash

Crack animation:
- each damage stage has `4` random crack patterns
- crack sprite is rotated to match the direction the player hit from

## UI / Feedback

Current visible feedback:
- fuel bar on top of the screen
- gold counter in HUD
- seed displayed in HUD
- radar direction ring above the driller
- radar charge bar under the radar direction ring
- floating text for picked perks
- floating fuel gain text
- floating gold gain text
- victory / out-of-fuel overlays
- health bar (appears after first hit)

## Debugging

There is a separate debug renderer for full-map inspection:
- [render-map-debug.js](/Users/bagrat/dev/dig/scripts/render-map-debug.js)

Example command:

```bash
node scripts/render-map-debug.js --seed 1 --output debug/map-seed-1.svg
```

It renders:
- full terrain with hardness tiers
- hazards, metal veins, gas/steam/boulder pockets
- scrap ore tiles
- beacons (teal diamond)
- perk zones and tile perks
- crystals
- player start (gold circle) and base (blue circle)

Debug teleport buttons are available in-game for jumping to the nearest perk zone of each type.

## Current Design Intent

The current prototype is centered on:
- uncertain search,
- constrained fuel routing,
- local tactical perk spikes,
- contour drawing to activate beacons,
- long-form gold collection without shop upgrades,
- and a target that stays hidden until found.
