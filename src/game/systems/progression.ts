import { coreLoopConfig } from "../data/coreLoopConfig";

const progressionConfig = coreLoopConfig.progression;

export const xpRequirements = progressionConfig.xpRequirements;

const getLevelsAboveOne = (level: number): number => Math.max(0, Math.floor(level) - 1);

export const getXpRequiredForLevel = (level: number): number => {
  const normalizedLevel = Math.max(1, Math.floor(level));

  if (normalizedLevel <= xpRequirements.length) {
    return xpRequirements[normalizedLevel - 1];
  }

  const levelsPastTable = normalizedLevel - xpRequirements.length;
  const lastRequirement = xpRequirements[xpRequirements.length - 1];

  return (
    lastRequirement + levelsPastTable * progressionConfig.xpRequirementIncreaseAfterTable
  );
};

export const getChildSpawnIntervalSeconds = (level: number): number =>
  Math.max(
    progressionConfig.minimumChildSpawnIntervalSeconds,
    coreLoopConfig.children.spawnIntervalSeconds *
      progressionConfig.childSpawnIntervalMultiplierPerLevel ** getLevelsAboveOne(level)
  );

export const getMaximumChildCount = (level: number): number =>
  Math.min(
    progressionConfig.maximumChildren,
    coreLoopConfig.children.maxCount +
      getLevelsAboveOne(level) * progressionConfig.maxChildrenIncreasePerLevel
  );

export const getChildSpeedMultiplier = (level: number): number =>
  Math.min(
    progressionConfig.maximumChildSpeedMultiplier,
    progressionConfig.childSpeedMultiplierPerLevel ** getLevelsAboveOne(level)
  );

export const getChaosDifficultyMultiplier = (level: number): number =>
  Math.min(
    progressionConfig.maximumChaosMultiplier,
    1 + getLevelsAboveOne(level) * progressionConfig.chaosMultiplierPerLevel
  );

export const getMultipleBookTheftChance = (level: number): number =>
  Math.min(
    progressionConfig.maximumMultipleBookTheftChance,
    progressionConfig.multipleBookTheftChance +
      getLevelsAboveOne(level) * progressionConfig.multipleBookTheftChanceIncreasePerLevel
  );
