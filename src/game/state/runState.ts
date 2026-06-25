import { clamp } from "../utils/math";

export interface MilestoneOneRunState {
  elapsedSeconds: number;
  chaosPercent: number;
  xp: number;
  level: number;
  backpackCount: number;
  backpackCapacity: number;
  isPaused: boolean;
}

export const createInitialRunState = (): MilestoneOneRunState => ({
  elapsedSeconds: 0,
  chaosPercent: 0,
  xp: 0,
  level: 1,
  backpackCount: 0,
  backpackCapacity: 5,
  isPaused: false
});

export const setChaosPercent = (
  state: MilestoneOneRunState,
  chaosPercent: number
): MilestoneOneRunState => ({
  ...state,
  chaosPercent: clamp(chaosPercent, 0, 100)
});
