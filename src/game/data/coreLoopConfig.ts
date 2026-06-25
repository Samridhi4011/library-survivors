export const coreLoopConfig = {
  pickupRadius: 44,
  shelvingRadius: 92,
  returnXpPerBook: 20,
  looseBooks: {
    initialCount: 10,
    maxCount: 36,
    spawnIntervalSeconds: 2.35,
    minSpawnDistanceFromShelf: 180
  },
  chaos: {
    looseBookPercentPerSecond: 0.026,
    bookAgePercentPerSecond: 0.0018,
    maxAgeContributionSeconds: 90
  }
} as const;
