import { describe, expect, it } from "vitest";
import { createInitialRunState, setChaosPercent } from "./runState";

describe("runState", () => {
  it("creates the Milestone 1 baseline state", () => {
    expect(createInitialRunState()).toEqual({
      elapsedSeconds: 0,
      chaosPercent: 0,
      xp: 0,
      level: 1,
      backpackCount: 0,
      backpackCapacity: 5,
      isPaused: false
    });
  });

  it("keeps chaos inside display bounds", () => {
    const state = createInitialRunState();

    expect(setChaosPercent(state, -20).chaosPercent).toBe(0);
    expect(setChaosPercent(state, 140).chaosPercent).toBe(100);
  });
});
