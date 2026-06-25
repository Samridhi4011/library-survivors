export type ChildBookBehavior = "local-drop" | "theft";

export const chooseChildBookBehavior = (
  roll: number,
  theftChance: number
): ChildBookBehavior => {
  return roll < theftChance ? "theft" : "local-drop";
};

export const isWithinRadius = (
  ax: number,
  ay: number,
  bx: number,
  by: number,
  radius: number
): boolean => {
  const dx = ax - bx;
  const dy = ay - by;

  return dx * dx + dy * dy <= radius * radius;
};
