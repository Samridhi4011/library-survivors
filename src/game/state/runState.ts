import { bookCategories, type BookCategory } from "../data/bookConfig";
import { gameConfig } from "../data/gameConfig";
import { getXpRequiredForLevel } from "../systems/progression";
import { clamp } from "../utils/math";

export type RunStatus = "running" | "won" | "lost";

export type BackpackInventory = Record<BookCategory, number>;

export interface RunState {
  elapsedSeconds: number;
  targetSeconds: number;
  chaosPercent: number;
  chaosGrowthRate: number;
  xp: number;
  totalXp: number;
  level: number;
  xpToNextLevel: number;
  totalShelvedBooks: number;
  backpack: BackpackInventory;
  backpackCount: number;
  backpackCapacity: number;
  looseBookCount: number;
  carriedBookCount: number;
  isPaused: boolean;
  status: RunStatus;
  perfectVictory: boolean;
}

export const createEmptyBackpack = (): BackpackInventory => {
  return bookCategories.reduce((inventory, category) => {
    inventory[category] = 0;
    return inventory;
  }, {} as BackpackInventory);
};

export const getBackpackCount = (backpack: BackpackInventory): number => {
  return bookCategories.reduce((total, category) => total + backpack[category], 0);
};

export const createInitialRunState = (
  targetSeconds = gameConfig.run.productionSeconds
): RunState => ({
  elapsedSeconds: 0,
  targetSeconds,
  chaosPercent: 0,
  chaosGrowthRate: 0,
  xp: 0,
  totalXp: 0,
  level: 1,
  xpToNextLevel: getXpRequiredForLevel(1),
  totalShelvedBooks: 0,
  backpack: createEmptyBackpack(),
  backpackCount: 0,
  backpackCapacity: 5,
  looseBookCount: 0,
  carriedBookCount: 0,
  isPaused: false,
  status: "running",
  perfectVictory: false
});

export const setChaosPercent = (
  state: RunState,
  chaosPercent: number
): RunState => ({
  ...state,
  chaosPercent: clamp(chaosPercent, 0, 100)
});

export const addBookToBackpack = (state: RunState, category: BookCategory): RunState => {
  if (state.backpackCount >= state.backpackCapacity) {
    return state;
  }

  const backpack = {
    ...state.backpack,
    [category]: state.backpack[category] + 1
  };

  return {
    ...state,
    backpack,
    backpackCount: getBackpackCount(backpack)
  };
};

export const shelveBackpackCategory = (
  state: RunState,
  category: BookCategory,
  xpPerBook: number
): { state: RunState; shelvedCount: number } => {
  const shelvedCount = state.backpack[category];

  if (shelvedCount === 0) {
    return { state, shelvedCount: 0 };
  }

  const backpack = {
    ...state.backpack,
    [category]: 0
  };

  return {
    state: addXp(
      {
        ...state,
        backpack,
        backpackCount: getBackpackCount(backpack),
        totalShelvedBooks: state.totalShelvedBooks + shelvedCount
      },
      shelvedCount * xpPerBook
    ),
    shelvedCount
  };
};

export const addXp = (state: RunState, xpAmount: number): RunState => {
  let xp = state.xp + Math.max(0, xpAmount);
  let level = state.level;
  let xpToNextLevel = getXpRequiredForLevel(level);

  while (xp >= xpToNextLevel) {
    xp -= xpToNextLevel;
    level += 1;
    xpToNextLevel = getXpRequiredForLevel(level);
  }

  return {
    ...state,
    xp,
    level,
    xpToNextLevel,
    totalXp: state.totalXp + Math.max(0, xpAmount)
  };
};

export const setLooseBookPressure = (
  state: RunState,
  looseBookCount: number,
  carriedBookCount: number,
  chaosGrowthRate: number
): RunState => ({
  ...state,
  looseBookCount,
  carriedBookCount,
  chaosGrowthRate
});

export const endRun = (state: RunState, status: Exclude<RunStatus, "running">): RunState => ({
  ...state,
  status,
  perfectVictory: status === "won" && state.chaosPercent < 10,
  isPaused: false
});
