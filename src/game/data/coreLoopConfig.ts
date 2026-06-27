export const coreLoopConfig = {
  pickupRadius: 44,
  shelvingRadius: 92,
  returnXpPerBook: 20,
  looseBooks: {
    initialCount: 10,
    maxCount: 36,
    spawnIntervalSeconds: 2.35,
    minSpawnDistanceFromShelf: 180,
    localChaosMultiplier: 1,
    relocatedChaosMultiplier: 1.85
  },
  children: {
    initialCount: 2,
    maxCount: 6,
    spawnIntervalSeconds: 5.5,
    baseSpeedRange: [72, 124],
    carryingSpeedMultiplier: 0.88,
    fleeSpeedMultiplier: 1.42,
    fearRadius: 118,
    interceptionRadius: 38,
    shelfSelectionRadius: 360,
    shelfApproachRadius: 34,
    wanderDurationSecondsRange: [2.2, 5.2],
    interactionSecondsRange: [0.65, 1.45],
    messinessRange: [0.8, 1.45],
    theftChance: 0.48,
    interceptionBonusXp: 15,
    localDropChance: 0.7,
    localDropBookCountRange: [1, 3],
    theftBookCountRange: [1, 2],
    destinationReachRadius: 36,
    stuckDistanceThreshold: 5,
    stuckSecondsBeforeRetarget: 0.85
  },
  chaos: {
    looseBookPercentPerSecond: 0.026,
    carriedBookPercentPerSecond: 0.018,
    bookAgePercentPerSecond: 0.0018,
    maxAgeContributionSeconds: 90
  },
  progression: {
    xpRequirements: [100, 180, 300, 460, 680, 950],
    xpRequirementIncreaseAfterTable: 320,
    childSpawnIntervalMultiplierPerLevel: 0.94,
    minimumChildSpawnIntervalSeconds: 2.4,
    maxChildrenIncreasePerLevel: 1,
    maximumChildren: 12,
    childSpeedMultiplierPerLevel: 1.04,
    maximumChildSpeedMultiplier: 1.5,
    chaosMultiplierPerLevel: 0.06,
    maximumChaosMultiplier: 1.6,
    multipleBookTheftChance: 0.28,
    multipleBookTheftChanceIncreasePerLevel: 0.05,
    maximumMultipleBookTheftChance: 0.75
  }
} as const;
