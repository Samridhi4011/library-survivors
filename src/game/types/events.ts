import type { MilestoneOneRunState } from "../state/runState";

export const GameEvents = {
  HudReady: "hud-ready",
  RunStateUpdated: "run-state-updated",
  PauseChanged: "pause-changed",
  LevelUpPreview: "level-up-preview"
} as const;

export type GameEventName = (typeof GameEvents)[keyof typeof GameEvents];

export interface RunStateUpdatedPayload {
  state: MilestoneOneRunState;
}

export interface PauseChangedPayload {
  isPaused: boolean;
}
