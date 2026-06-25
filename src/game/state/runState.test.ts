import { describe, expect, it } from "vitest";
import {
  addBookToBackpack,
  createInitialRunState,
  setChaosPercent,
  shelveBackpackCategory
} from "./runState";

describe("runState", () => {
  it("creates the Milestone 2 baseline state", () => {
    expect(createInitialRunState(30)).toEqual({
      elapsedSeconds: 0,
      targetSeconds: 30,
      chaosPercent: 0,
      chaosGrowthRate: 0,
      xp: 0,
      totalXp: 0,
      level: 1,
      xpToNextLevel: 100,
      totalShelvedBooks: 0,
      backpack: {
        fiction: 0,
        science: 0,
        history: 0,
        kids: 0
      },
      backpackCount: 0,
      backpackCapacity: 5,
      looseBookCount: 0,
      isPaused: false,
      status: "running",
      perfectVictory: false
    });
  });

  it("keeps chaos inside display bounds", () => {
    const state = createInitialRunState();

    expect(setChaosPercent(state, -20).chaosPercent).toBe(0);
    expect(setChaosPercent(state, 140).chaosPercent).toBe(100);
  });

  it("prevents pickups beyond backpack capacity", () => {
    let state = createInitialRunState();

    for (let index = 0; index < 8; index += 1) {
      state = addBookToBackpack(state, "fiction");
    }

    expect(state.backpackCount).toBe(5);
    expect(state.backpack.fiction).toBe(5);
  });

  it("shelves matching books, awards XP, and can level up", () => {
    let state = createInitialRunState();

    for (let index = 0; index < 5; index += 1) {
      state = addBookToBackpack(state, "science");
    }

    const result = shelveBackpackCategory(state, "science", 20);

    expect(result.shelvedCount).toBe(5);
    expect(result.state.backpackCount).toBe(0);
    expect(result.state.totalShelvedBooks).toBe(5);
    expect(result.state.totalXp).toBe(100);
    expect(result.state.level).toBe(2);
    expect(result.state.xp).toBe(0);
    expect(result.state.xpToNextLevel).toBe(180);
  });
});
