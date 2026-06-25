import Phaser from "phaser";
import { gameConfig } from "../data/gameConfig";
import { GameEvents, type PauseChangedPayload } from "../types/events";

export class OverlayScene extends Phaser.Scene {
  private pauseGroup?: Phaser.GameObjects.Container;
  private levelPreviewGroup?: Phaser.GameObjects.Container;

  public constructor() {
    super("OverlayScene");
  }

  public create(): void {
    this.pauseGroup = this.createMessagePanel("Paused", "Run state suspended");
    this.pauseGroup.setVisible(false);

    this.levelPreviewGroup = this.createMessagePanel("Level Up", "");
    this.levelPreviewGroup.setVisible(false);

    const gameScene = this.scene.get("GameScene");
    gameScene.events.on(GameEvents.PauseChanged, ({ isPaused }: PauseChangedPayload) => {
      this.pauseGroup?.setVisible(isPaused);
    });
    gameScene.events.on(GameEvents.LevelUpPreview, () => {
      this.levelPreviewGroup?.setVisible(true);
      this.time.delayedCall(1400, () => this.levelPreviewGroup?.setVisible(false));
    });
  }

  private createMessagePanel(title: string, body: string): Phaser.GameObjects.Container {
    const panel = this.add.container(640, 360);
    const backdrop = this.add
      .rectangle(0, 0, 440, 168, gameConfig.colors.overlay, 0.92)
      .setStrokeStyle(2, 0x7dd3fc);
    const titleText = this.add
      .text(0, -34, title, {
        color: gameConfig.colors.hudText,
        fontFamily: "Inter, Arial, sans-serif",
        fontSize: "30px",
        fontStyle: "700"
      })
      .setOrigin(0.5);
    const bodyText = this.add
      .text(0, 28, body, {
        color: gameConfig.colors.hudMuted,
        fontFamily: "Inter, Arial, sans-serif",
        fontSize: "18px"
      })
      .setOrigin(0.5);

    panel.add([backdrop, titleText, bodyText]);
    return panel;
  }
}
