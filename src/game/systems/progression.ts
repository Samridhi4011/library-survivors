export const xpRequirements = [100, 180, 300, 460, 680, 950] as const;

export const getXpRequiredForLevel = (level: number): number => {
  if (level <= xpRequirements.length) {
    return xpRequirements[level - 1];
  }

  const levelsPastTable = level - xpRequirements.length;
  const lastRequirement = xpRequirements[xpRequirements.length - 1];

  return lastRequirement + levelsPastTable * 320;
};
