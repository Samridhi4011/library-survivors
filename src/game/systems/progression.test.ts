import { describe, expect, it } from "vitest";
import { coreLoopConfig } from "../data/coreLoopConfig";
import {
  getChaosDifficultyMultiplier,
  getChildSpawnIntervalSeconds,
  getChildSpeedMultiplier,
  getMaximumChildCount,
  getMultipleBookTheftChance,
  getXpRequiredForLevel
} from "./progression";

describe("progression", () => {
  it("uses configured and increasing XP requirements", () => {
    expect(getXpRequiredForLevel(1)).toBe(100);
    expect(getXpRequiredForLevel(6)).toBe(950);
    expect(getXpRequiredForLevel(7)).toBe(1270);
    expect(getXpRequiredForLevel(8)).toBeGreaterThan(getXpRequiredForLevel(7));
  });

  it("smoothly increases level-based difficulty within configured caps", () => {
    expect(getChildSpawnIntervalSeconds(2)).toBeLessThan(getChildSpawnIntervalSeconds(1));
    expect(getMaximumChildCount(2)).toBeGreaterThan(getMaximumChildCount(1));
    expect(getChildSpeedMultiplier(2)).toBeGreaterThan(getChildSpeedMultiplier(1));
    expect(getChaosDifficultyMultiplier(2)).toBeGreaterThan(
      getChaosDifficultyMultiplier(1)
    );
    expect(getMultipleBookTheftChance(2)).toBeGreaterThan(
      getMultipleBookTheftChance(1)
    );

    expect(getChildSpawnIntervalSeconds(100)).toBe(
      coreLoopConfig.progression.minimumChildSpawnIntervalSeconds
    );
    expect(getMaximumChildCount(100)).toBe(coreLoopConfig.progression.maximumChildren);
    expect(getChildSpeedMultiplier(100)).toBe(
      coreLoopConfig.progression.maximumChildSpeedMultiplier
    );
    expect(getChaosDifficultyMultiplier(100)).toBe(
      coreLoopConfig.progression.maximumChaosMultiplier
    );
    expect(getMultipleBookTheftChance(100)).toBe(
      coreLoopConfig.progression.maximumMultipleBookTheftChance
    );
  });
});
