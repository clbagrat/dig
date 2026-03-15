# Gameplay

## Premise

Mobile top-down drilling game on a `canvas`.

The player starts in the center of a rock field and searches for a hidden moving base.
The player sees only within a small radius around the driller.

The run is about:
- managing fuel,
- choosing digging routes through mixed rock difficulty,
- picking up tile perks,
- buying stronger scrap upgrades,
- tracking the base before it slips away.

## Goal And Failure

Win condition:
- the run is won only when the driller stands on the exact base tile.

Loss condition:
- if fuel reaches `0`, the run ends.

## Map

Current map size:
- `150 x 220` tiles

Start:
- the driller starts at the center of the map
- the start tile is opened immediately

Base:
- the base initially spawns at exact distance `50` tiles from the start
- the base can become visible when inside vision radius
- visibility alone does not count as success

Base movement:
- the base moves after enough player movement progress is accumulated
- tunnel movement gives `1` progress
- drilling into a new tile gives `2` progress
- jump movement gives `2` progress
- at `10` progress the base attempts to move by `1` tile
- with `50%` probability it prefers a direction that increases distance from the player
- otherwise it picks a random valid direction
- when moving, it swaps places with the target tile contents
- it does not move onto the player
- it does not enter `3x3` perk zones
- once found, it stops moving

## Visibility

Current base vision radius:
- `5`

The player only sees nearby cells around the driller.
Everything outside the radius is hidden by fog of war.

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

## Rock Tiers

There are `7` rock tiers plus tunnel.

Current durability / scrap:
- Tier 1: `6 hp`, `2 scrap`
- Tier 2: `9 hp`, `4 scrap`
- Tier 3: `12 hp`, `6 scrap`
- Tier 4: `15 hp`, `8 scrap`
- Tier 5: `18 hp`, `11 scrap`
- Tier 6: `21 hp`, `14 scrap`
- Tier 7: `27 hp`, `18 scrap`

The current drill power starts at `1`.
Since damage is discrete, real hit counts depend on current drill power and upgrades.

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
- starting fuel: `420`
- max fuel: `420` by default
- passive drain: `0.8 / sec`
- tunnel move cost: `1.8`
- drilling hit cost: `4.5`

Fuel can be modified by perks and upgrades.

Important note:
- max fuel can become lower than the current default because of `Overload`

## Scrap

Scrap is earned from destroyed rock.

Scrap is spent indirectly:
- each threshold opens a choice of `3` random scrap upgrades

Current timing:
- the perk choice popup appears `500 ms` after the threshold is reached

Current cost model:
- base cost: `30`
- geometric multiplier: `1.35`
- current formula: `round(30 * 1.35^level)`

So the sequence is roughly:
- `30`
- `41`
- `55`
- `74`
- `100`
- ...

## Radar

Radar is a tile perk.

Current behavior:
- on pickup, radar immediately compares the previous player tile and the current tile
- after that, each next movement compares the previous tile and the new tile
- it always returns one of two states:
  - `Горячее`
  - `Холоднее`

There is no `Ровно`.

Charges:
- base radar gives `5` charges
- `Geo Lens` adds extra charges when radar is gained

UI:
- the radar message is shown above the driller
- remaining charges are shown as a small progress bar under that text
- charges are no longer shown as numbers in the text itself

## Tile Perks

Tile perks are pickups placed directly on the map.

Current tile perk pool:
- `Бак`
- `Радар`
- `Бур`
- `Бомба`
- `Скорость`

Current weighted spawn chances:
- `Бак`: `7`
- `Радар`: `3`
- `Бур`: `2`
- `Бомба`: `4`
- `Скорость`: `3`

Current spatial rules:
- tile perks are denser near the center of the map
- near the center, `Бак` and `Радар` get extra weight
- tile perks respect minimum local spacing

### Tile Perk Effects

`Бак`
- gives fuel immediately
- current raw amount before other fuel systems: `90`

`Радар`
- grants radar charges
- immediately evaluates hotter/colder on pickup

`Бур`
- `+0.5` drill power

`Бомба`
- explodes immediately on pickup
- current damage: `drillPower * 10`
- current radius: `2`

`Скорость`
- `+15%` strike speed

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

## Scrap Upgrades

Scrap upgrades are the stronger progression layer.

Current upgrade pool:
- `Боковые буры`
- `Прыжковый привод`
- `Длинный бур`
- `Диагональные буры`
- `Форсаж на нуле`
- `Саперный заряд`
- `Топливный контур`
- `Гео-линза`
- `Рециркулятор`
- `Перегрузка`

### Upgrade Effects

`Боковые буры`
- each strike also hits the cells left and right of the driller

`Прыжковый привод`
- every `10` destroyed blocks gives `1` jump charge
- jump can move into rock
- the driller swaps with the destination tile
- repeated upgrade picks increase jump range

`Длинный бур`
- strikes the next forward tile as well
- first pickup gives `20%` extra forward damage
- each repeat adds `+10%`

`Диагональные буры`
- strike the two forward diagonal tiles
- first pickup gives `20%` diagonal damage
- each repeat adds `+5%`

`Форсаж на нуле`
- lower fuel increases strike speed
- repeated picks increase the low-fuel speed bonus

`Саперный заряд`
- every `15` destroyed blocks launches a remote `2x2` bomb at distance `3`
- repeated picks increase damage

`Топливный контур`
- any perk gives `+50` fuel
- `Бак` becomes weaker instead of also getting that full bonus

`Гео-линза`
- `+2` vision radius
- `+2` extra radar charges whenever radar is gained

`Рециркулятор`
- `+2` scrap per destroyed block
- `+2` fuel per destroyed block

`Перегрузка`
- fuel gains get `+50` fuel
- max fuel is reduced by `50`
- if a fuel gain overflows max fuel, a remote overflow bomb is launched

## Overflow / Remote Bomb Rules

There are multiple remote bomb style systems.

`Перегрузка` overflow bomb:
- triggered by fuel overflow
- lands at distance `3`
- affects a `2x2` square

Safety rules:
- overflow can trigger only once per fuel event
- while the overflow bomb itself is resolving, fuel rewards from its own destruction chain cannot retrigger another overflow bomb

`Саперный заряд`:
- separate remote bomb system
- triggers every `15` destroyed blocks

## Fuel Event Rules

Fuel gains can come from several stacked sources:
- direct fuel perk
- `Топливный контур`
- `Рециркулятор`
- future chained perk rewards

To prevent abuse and recursion:
- one fuel event can cause at most one overflow trigger
- zone rewards and perk rewards are grouped into single fuel events

## UI / Feedback

Current visible feedback:
- fuel bar on top of the screen
- scrap bar on top of the screen
- seed displayed in HUD
- radar text above the driller
- radar charge bar under the radar text
- floating text for picked perks
- floating fuel gain text
- floating scrap gain text
- victory / out-of-fuel overlays

## Debugging

There is a separate debug renderer for full-map inspection:
- [render-map-debug.js](/Users/bagrat/dev/dig/scripts/render-map-debug.js)

Example command:

```bash
node scripts/render-map-debug.js --seed 1 --output debug/map-seed-1.svg
```

It renders:
- full terrain
- start
- base
- tile perks
- perk zones

## Current Design Intent

The current prototype is centered on:
- uncertain search,
- constrained fuel routing,
- local tactical perk spikes,
- long-form scrap progression,
- and a target that can move away from the player if the route is inefficient.
