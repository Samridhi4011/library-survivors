import type { RunState } from "../state/runState";

export const GameEvents = {
  HudReady: "hud-ready",
  RunStateUpdated: "run-state-updated",
  PauseChanged: "pause-changed",
  LevelUpPreview: "level-up-preview",
  RunEnded: "run-ended"
} as const;

export type GameEventName = (typeof GameEvents)[keyof typeof GameEvents];

export interface RunStateUpdatedPayload {
  state: RunState;
}

export interface PauseChangedPayload {
  isPaused: boolean;
}

export interface RunEndedPayload {
  state: RunState;
}
