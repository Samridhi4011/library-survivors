export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

export const distanceSquared = (
  ax: number,
  ay: number,
  bx: number,
  by: number
): number => {
  const dx = ax - bx;
  const dy = ay - by;

  return dx * dx + dy * dy;
};
