# Library Survivors Playable Vertical Slice Plan

## Summary

Build a browser-based 2D top-down game using TypeScript, Vite, and Phaser `4.2.0`.

The first milestone is a playable vertical slice: the full core loop works end-to-end, but content is intentionally limited. The player can move, collect books, return them to shelves, earn XP, level up, choose upgrades, intercept children, manage chaos, and win or lose a timed run.

## Source Documents

- `library_survivors_design.md` is the source of truth for gameplay mechanics and game design.
- `development_plan.md` is the engineering roadmap and implementation guide.

## Key Changes

- Scaffold a Phaser web app with a single main game scene, preload scene, HUD layer, pause/level-up overlay, and simple local asset pipeline.
- Implement core entities: librarian, children, shelves, loose books, carried books, hazards, XP pickups/awards, and run state.
- Use simple generated or placeholder art first: readable top-down sprites, color-coded shelves/book categories, visible carried-book icons, clear chaos/XP/backpack HUD.
- Model the library as a tile/grid-influenced open floor plan with shelves, aisles, zones, and spawn points; avoid full procedural layout in the first slice.
- Implement Chaos as a continuously increasing meter driven by loose books, carried books, book age, clusters, and temporary event modifiers. Returning books reduces future chaos growth, not the current meter.
- Implement child AI with states: wander, shelf interaction, local drop, book theft, flee/avoid librarian, and interrupted/reset.
- Implement backpack behavior: automatic pickup near loose books, automatic shelving near correct shelf, starting capacity of 5, full-backpack blocking pickup.
- Implement XP and level-ups using the brief's curve, with a level-up pause and 3 upgrade choices.
- Include a small upgrade set: movement speed, backpack capacity, pickup radius, shelving speed, bonus XP, and one automation upgrade such as an assistant librarian.
- Include 3 child archetypes for the slice: Toddler, Curious Kid, and Hyperactive Kid.
- Include 2 random events: School Excursion and Story Time.
- Include 2 hazards: sticky spill and blocked aisle.
- Support a 30-minute production run length plus a developer tuning flag for shorter test runs.

## Interfaces And Data

- Create data-driven config objects for shelves, child archetypes, upgrades, events, hazards, XP curve, chaos weights, and run timing.
- Centralize mutable run state: elapsed time, chaos percent, XP, level, backpack contents, active upgrades, active events, unlocked shelves, and win/loss status.
- Use typed entity components or classes with clear update methods for movement, AI, book handling, collision/proximity checks, and HUD sync.
- Keep save/meta progression out of the vertical slice, but reserve a simple local-storage profile shape for later librarians, layouts, cosmetics, and permanent upgrades.

## Milestones

### 1. Project Foundation

Set up Phaser, TypeScript, Vite, lint/test scripts, scene structure, scaling, keyboard controls, and basic HUD.

### 2. Core Loop Prototype

Add player movement, shelves, loose books, backpack capacity, automatic pickup, automatic shelving, XP, chaos growth, and win/lose timer.

### 3. Child AI And Interception

Add wandering children, shelf interactions, local drops, theft destinations, visible carried books, librarian fear radius, fleeing, and interception bonus XP.

### 4. Progression And Difficulty

Add XP curve, level-up overlay, upgrade choices, increasing child count/speed, longer theft paths, higher theft probability, and shelf unlocks over time.

### 5. Slice Content

Add selected child archetypes, two events, two hazards, combo multipliers, assistant automation, audio placeholders, and clearer visual feedback.

### 6. Polish And Balance Pass

Tune chaos weights, spawn rates, XP values, movement speeds, backpack pressure, event timing, and 30-minute survival pacing.

## Test Plan

- Verify player can complete the loop: collect wrong-placed books, return them to matching shelves, gain XP, level up, select upgrades, and continue.
- Verify game over triggers exactly when Chaos reaches 100%.
- Verify victory triggers when the run timer reaches 30 minutes.
- Verify perfect victory is detected when final Chaos is below 10%.
- Verify a full backpack prevents pickup and resumes pickup after shelving.
- Verify children can local-drop, steal, flee, be intercepted, and reset cleanly.
- Verify upgrades affect gameplay immediately and stack according to config.
- Verify events and hazards start, apply effects, expire, and clean up.
- Add deterministic unit tests for XP curve, chaos-rate calculation, backpack capacity, upgrade application, and child state transitions.
- Run browser smoke tests at desktop and mobile-ish viewports to confirm controls, HUD readability, no overlapping UI, and stable frame rate with late-game entity counts.

## Assumptions

- Initial target is Browser Web.
- First deliverable is a playable vertical slice, not the full V1 roadmap.
- Phaser `4.2.0` is the chosen engine version for a greenfield 2D web build.
- Art, animation, and sound should be functional placeholders until the loop feels good.
- Meta progression, multiple librarians, multiple layouts, cosmetics, and the full event/upgrade roster are deferred until after the vertical slice proves the core game.
