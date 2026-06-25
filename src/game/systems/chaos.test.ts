import { describe, expect, it } from "vitest";
import { calculateChaosGrowthRate } from "./chaos";

describe("calculateChaosGrowthRate", () => {
  it("returns zero when the library has no loose books", () => {
    expect(calculateChaosGrowthRate([])).toBe(0);
  });

  it("adds loose-book and age pressure for each misplaced book", () => {
    expect(
      calculateChaosGrowthRate(
        [{ ageSeconds: 10 }, { ageSeconds: 20 }],
        {
          looseBookPercentPerSecond: 1,
          bookAgePercentPerSecond: 0.1,
          maxAgeContributionSeconds: 90
        }
      )
    ).toBe(5);
  });

  it("caps age pressure", () => {
    expect(
      calculateChaosGrowthRate(
        [{ ageSeconds: 120 }],
        {
          looseBookPercentPerSecond: 1,
          bookAgePercentPerSecond: 0.1,
          maxAgeContributionSeconds: 30
        }
      )
    ).toBe(4);
  });
});
