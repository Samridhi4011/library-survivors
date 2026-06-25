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
  children: {
    initialCount: 6,
    speed: 92,
    carryingSpeed: 82,
    fleeSpeed: 145,
    fearRadius: 118,
    interceptionRadius: 38,
    shelfDiscoveryRadius: 86,
    shelfInteractionSeconds: 0.7,
    theftChance: 0.48,
    interceptionBonusXp: 15,
    destinationReachRadius: 36
  },
  chaos: {
    looseBookPercentPerSecond: 0.026,
    carriedBookPercentPerSecond: 0.018,
    bookAgePercentPerSecond: 0.0018,
    maxAgeContributionSeconds: 90
  }
} as const;
