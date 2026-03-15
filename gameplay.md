# Gameplay

## Core Loop

The player controls a top-down driller on a tile-based map.

Main goal:
- Find the hidden base.
- The base counts as found only when the driller reaches its exact tile.

Main moment-to-moment loop:
- Move through already opened tunnels.
- Break rock tiles to create new tunnels.
- Manage fuel.
- Collect tile perks.
- Earn scrap from broken blocks.
- Choose stronger upgrades when enough scrap is collected.

## Map And Visibility

- The map is a grid.
- The player starts near the center of the map.
- The hidden base is placed randomly, but not too close to the start.
- The player sees only in a limited radius around the driller.
- The base can become visible inside the vision radius, but visibility alone does not win the run.

## Drilling And Movement

- Movement is discrete, on the same rhythm as drilling.
- The driller attacks in cycles rather than continuous DPS.
- Block HP decreases only at the hit moment.
- Moving through a tunnel also happens on the same strike rhythm.

Block durability currently corresponds to hits:
- Tier 1: 2 hits
- Tier 2: 3 hits
- Tier 3: 5 hits
- Tier 4: 7 hits

There is strike animation and camera shake during drilling.

## Fuel

Fuel is a hard resource.

Current fuel rules:
- Starting fuel: 300
- Fuel max is dynamic, default 300
- Passive drain: 1 fuel per second
- Movement cost: 2 fuel per step
- Drilling cost: 5 fuel per hit

Fuel can currently come from:
- Tile perk `Bak`
- Scrap perk `Recirculator`
- Scrap perk `Overload`, which adds extra fuel to every fuel gain

If fuel reaches zero:
- The run ends in out-of-fuel state.

## Scrap

Scrap is earned from breaking blocks.

Current base scrap rewards by block tier:
- Tier 1: 2
- Tier 2: 4
- Tier 3: 7
- Tier 4: 11

Scrap is used to unlock a choice of 3 random scrap upgrades.

Scrap upgrade cost grows over time:
- 1st: 30
- 2nd: 55
- 3rd: 80
- 4th: 105
- Then continues by +25 each time

The scrap choice menu appears with a 500 ms delay after the threshold is reached.

## Radar / Hotter-Colder

Radar gives limited hotter-colder guidance.

How it works:
- When radar is gained, it grants signal charges.
- It immediately evaluates the current position on pickup.
- Then each next move consumes one signal charge.
- The game says:
  - `Hotter`
  - `Colder`
  - `Same`

When no charges remain:
- Signal becomes empty.

## Tile Perks

Tile perks are found directly in the world.

Current tile perk pool:
- `Bak`
  - Gives +90 fuel before global fuel bonuses.
- `Radar`
  - Grants radar charges.
- `Bur`
  - Increases drill power by +0.5.
- `Bomba`
  - Triggers an explosion around the pickup point.
- `Skorost`
  - Increases strike cycle speed by +15%.

Current tile perk weights:
- Bak: 7
- Radar: 3
- Bur: 2
- Bomba: 4
- Skorost: 3

Notes:
- Tile perks are generated frequently.
- Tile perks can coexist spatially with perk zones.
- Picking up a perk shows its name as floating text near the driller.

## Bomb Tile Perk

The bomb tile perk:
- Deals damage based on drill power.
- Uses damage equal to `drillPower * 10`.
- Explodes in radius 2.

## Speed Tile Perk

The speed tile perk affects cadence, not per-hit damage.

It:
- Makes the next strike happen sooner.
- Speeds up both drilling cadence and tunnel movement cadence because both use the same strike cycle.

## Perk Zones

There are also special hidden perk zones under rock.

Zone rules:
- Each zone is a 3x3 square.
- A zone is assigned one tile perk type.
- The floor of the zone shows that perk symbol after tiles are opened.
- The zone reward triggers only when all 9 cells of the 3x3 area have been opened.

Reward:
- The player gets 3 copies of that tile perk at once.

Special bomb-zone behavior:
- If the zone is a bomb zone, instead of normal bomb reward it triggers a larger explosion.
- That larger explosion uses radius 3.

## Scrap Upgrades

Scrap upgrades are the stronger, long-term progression layer.

Current scrap upgrade pool:
- `Side Drills`
- `Jump Drive`
- `Long Drill`
- `Diagonal Drills`
- `Low Fuel Overdrive`
- `Sapper Charge`
- `Geo Lens`
- `Recirculator`
- `Overload`

When enough scrap is collected:
- The player gets 3 random upgrades from this pool.

### 1. Side Drills

- Hits left and right of the driller.
- They are relative to the driller position, not to the forward target tile.

### 2. Jump Drive

- Every 10 broken blocks grants 1 jump charge.
- A charged jump can move the driller forward to a distant tile even if it is still rock.
- The driller swaps with that tile.
- Repeated upgrade picks increase jump distance.

### 3. Long Drill

- Hits the next tile further in the forward direction.
- First pickup gives 20% extra forward damage.
- Each repeated upgrade adds +10%.

### 4. Diagonal Drills

- Hits the two forward diagonal tiles.
- First pickup gives 20% diagonal damage.
- Each repeated upgrade adds +5%.

### 5. Low Fuel Overdrive

- The less fuel the player has, the faster the strike cycle becomes.
- This scales dynamically with current fuel ratio.
- Repeated picks increase the size of the low-fuel speed bonus.

### 6. Sapper Charge

- Every 15 broken blocks throws a remote bomb.
- The bomb lands at distance 3 in a random direction.
- It explodes as a 2x2 square.
- Repeated picks increase the damage.

### 7. Geo Lens

- +2 vision radius
- +2 extra radar charges whenever radar is gained

### 8. Recirculator

- +2 scrap from every broken block
- +2 fuel from every broken block

### 9. Overload

This is now a scrap upgrade, not a tile perk.

Effects:
- Any fuel gain gets +50 extra fuel.
- If a fuel gain would overflow max fuel, it triggers a remote bomb.
- Max fuel is reduced by 50.

Overload bomb behavior:
- Triggered by fuel overflow.
- Lands in a random direction at distance 3 from the fuel source.
- Explodes as a 2x2 square.

## Remote / Overflow Bomb Logic

There are currently two remote bomb-style effects:

### Overload remote bomb

- Trigger: fuel overflow
- Range: distance 3
- Shape: 2x2 square

### Sapper Charge remote bomb

- Trigger: every 15 broken blocks
- Range: distance 3
- Shape: 2x2 square

## Floating Feedback

The game already shows floating text near the driller for:
- Picked perk names
- Gained scrap
- Gained fuel

## UI

Current UI is mostly canvas-rendered:
- Fuel bar on top
- Scrap progress bar on top
- Radar result appears above the driller only while active
- Floating pickup texts appear near the driller

The perk choice menu is still DOM-based overlay.

## Notable Generation Rules

### Ordinary tile perks

- Generated across the map using weighted random selection.
- They are frequent.

### Perk zones

- Target count currently: 4
- Can now generate together with ordinary tile perks
- Still cannot overlap other perk zones, the base, or the start

## Current Win / Lose

Win:
- Reach the exact base tile.

Lose:
- Run out of fuel.
