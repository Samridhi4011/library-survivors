import Phaser from "phaser";
import { gameConfig } from "../data/gameConfig";
import type { RunState } from "../state/runState";
import { GameEvents, type RunStateUpdatedPayload } from "../types/events";
import { formatRunTime } from "../utils/format";

export class HudScene extends Phaser.Scene {
  private timeText?: Phaser.GameObjects.Text;
  private chaosText?: Phaser.GameObjects.Text;
  private xpText?: Phaser.GameObjects.Text;
  private backpackText?: Phaser.GameObjects.Text;
  private looseBookText?: Phaser.GameObjects.Text;
  private chaosBar?: Phaser.GameObjects.Rectangle;
  private xpBar?: Phaser.GameObjects.Rectangle;

  public constructor() {
    super("HudScene");
  }

  public create(): void {
    this.createHudChrome();

    const gameScene = this.scene.get("GameScene");
    gameScene.events.on(
      GameEvents.RunStateUpdated,
      ({ state }: RunStateUpdatedPayload) => this.updateHud(state)
    );
  }

  private createHudChrome(): void {
    this.add.rectangle(640, 34, 1220, 52, 0x0f172a, 0.78).setStrokeStyle(1, 0x314534);
    this.timeText = this.add.text(52, 18, "00:00", this.textStyle(22));
    this.chaosText = this.add.text(190, 18, "Chaos 0%", this.textStyle(18));
    this.xpText = this.add.text(480, 18, "Level 1  XP 0/100", this.textStyle(18));
    this.backpackText = this.add.text(790, 18, "Backpack 0/5", this.textStyle(18));
    this.looseBookText = this.add.text(1010, 18, "Loose 0  Carried 0", this.textStyle(18));

    this.add.rectangle(345, 44, 180, 8, 0x334155, 1);
    this.chaosBar = this.add.rectangle(255, 44, 0, 8, gameConfig.colors.chaos, 1);
    this.chaosBar.setOrigin(0, 0.5);

    this.add.rectangle(648, 44, 180, 8, 0x334155, 1);
    this.xpBar = this.add.rectangle(558, 44, 0, 8, gameConfig.colors.xp, 1);
    this.xpBar.setOrigin(0, 0.5);
  }

  private updateHud(state: RunState): void {
    this.timeText?.setText(formatRunTime(state.elapsedSeconds));
    this.chaosText?.setText(`Chaos ${Math.round(state.chaosPercent)}%`);
    this.xpText?.setText(`Level ${state.level}  XP ${state.xp}/${state.xpToNextLevel}`);
    this.backpackText?.setText(`Backpack ${state.backpackCount}/${state.backpackCapacity}`);
    this.looseBookText?.setText(`Loose ${state.looseBookCount}  Carried ${state.carriedBookCount}`);
    this.chaosBar?.setSize(180 * (state.chaosPercent / 100), 8);
    this.xpBar?.setSize(180 * (state.xp / state.xpToNextLevel), 8);
  }

  private textStyle(
    size: number,
    color: string = gameConfig.colors.hudText
  ): Phaser.Types.GameObjects.Text.TextStyle {
    return {
      color,
      fontFamily: "Inter, Arial, sans-serif",
      fontSize: `${size}px`,
      fontStyle: "700"
    };
  }
}
