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
        0,
        {
          looseBookPercentPerSecond: 1,
          carriedBookPercentPerSecond: 0.4,
          bookAgePercentPerSecond: 0.1,
          maxAgeContributionSeconds: 90
        }
      )
    ).toBe(5);
  });

  it("adds carried-book pressure", () => {
    expect(
      calculateChaosGrowthRate([], 3, {
        looseBookPercentPerSecond: 1,
        carriedBookPercentPerSecond: 0.4,
        bookAgePercentPerSecond: 0.1,
        maxAgeContributionSeconds: 90
      })
    ).toBeCloseTo(1.2);
  });

  it("caps age pressure", () => {
    expect(
      calculateChaosGrowthRate(
        [{ ageSeconds: 120 }],
        0,
        {
          looseBookPercentPerSecond: 1,
          carriedBookPercentPerSecond: 0.4,
          bookAgePercentPerSecond: 0.1,
          maxAgeContributionSeconds: 30
        }
      )
    ).toBe(4);
  });
});
