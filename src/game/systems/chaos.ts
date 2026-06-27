import { coreLoopConfig } from "../data/coreLoopConfig";

export interface LooseBookChaosSample {
  ageSeconds: number;
  chaosMultiplier?: number;
}

export interface ChaosGrowthConfig {
  looseBookPercentPerSecond: number;
  carriedBookPercentPerSecond: number;
  bookAgePercentPerSecond: number;
  maxAgeContributionSeconds: number;
}

export const calculateChaosGrowthRate = (
  looseBooks: LooseBookChaosSample[],
  carriedBookCount = 0,
  config: ChaosGrowthConfig = coreLoopConfig.chaos
): number => {
  const looseBookPressure = looseBooks.reduce((total, book) => {
    const cappedAgeSeconds = Math.min(
      Math.max(book.ageSeconds, 0),
      config.maxAgeContributionSeconds
    );

    const chaosMultiplier = Math.max(0, book.chaosMultiplier ?? 1);

    return (
      total +
      (config.looseBookPercentPerSecond +
        cappedAgeSeconds * config.bookAgePercentPerSecond) *
        chaosMultiplier
    );
  }, 0);

  return looseBookPressure + Math.max(0, carriedBookCount) * config.carriedBookPercentPerSecond;
};
