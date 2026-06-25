import { coreLoopConfig } from "../data/coreLoopConfig";

export interface LooseBookChaosSample {
  ageSeconds: number;
}

export interface ChaosGrowthConfig {
  looseBookPercentPerSecond: number;
  bookAgePercentPerSecond: number;
  maxAgeContributionSeconds: number;
}

export const calculateChaosGrowthRate = (
  looseBooks: LooseBookChaosSample[],
  config: ChaosGrowthConfig = coreLoopConfig.chaos
): number => {
  return looseBooks.reduce((total, book) => {
    const cappedAgeSeconds = Math.min(
      Math.max(book.ageSeconds, 0),
      config.maxAgeContributionSeconds
    );

    return (
      total +
      config.looseBookPercentPerSecond +
      cappedAgeSeconds * config.bookAgePercentPerSecond
    );
  }, 0);
};
