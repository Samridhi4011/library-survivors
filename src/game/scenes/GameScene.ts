import Phaser from "phaser";
import { gameConfig } from "../data/gameConfig";
import { Player } from "../entities/Player";
import { createInitialRunState, type MilestoneOneRunState } from "../state/runState";
import { GameEvents } from "../types/events";

export class GameScene extends Phaser.Scene {
  private player?: Player;
  private runState: MilestoneOneRunState = createInitialRunState();
  private pauseKey?: Phaser.Input.Keyboard.Key;
  private levelPreviewKey?: Phaser.Input.Keyboard.Key;

  public constructor() {
    super("GameScene");
  }

  public create(): void {
    this.physics.world.setBounds(0, 0, gameConfig.world.width, gameConfig.world.height);
    this.cameras.main.setBounds(0, 0, gameConfig.world.width, gameConfig.world.height);

    this.drawLibraryFoundation();
    this.player = new Player(this, gameConfig.player.startX, gameConfig.player.startY);
    this.cameras.main.startFollow(this.player.gameObject, true, 0.08, 0.08);

    if (!this.input.keyboard) {
      throw new Error("Keyboard input is required for Library Survivors.");
    }

    this.pauseKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    this.levelPreviewKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L);

    this.events.emit(GameEvents.RunStateUpdated, { state: this.runState });
  }

  public update(_time: number, delta: number): void {
    this.handleSceneKeys();

    if (this.runState.isPaused) {
      return;
    }

    this.runState.elapsedSeconds += delta / 1000;
    this.player?.update();
    this.events.emit(GameEvents.RunStateUpdated, { state: this.runState });
  }

  private handleSceneKeys(): void {
    if (this.pauseKey && Phaser.Input.Keyboard.JustDown(this.pauseKey)) {
      this.runState = {
        ...this.runState,
        isPaused: !this.runState.isPaused
      };
      this.events.emit(GameEvents.PauseChanged, { isPaused: this.runState.isPaused });
      this.events.emit(GameEvents.RunStateUpdated, { state: this.runState });
    }

    if (this.levelPreviewKey && Phaser.Input.Keyboard.JustDown(this.levelPreviewKey)) {
      this.events.emit(GameEvents.LevelUpPreview);
    }
  }

  private drawLibraryFoundation(): void {
    this.add.rectangle(
      gameConfig.world.width / 2,
      gameConfig.world.height / 2,
      gameConfig.world.width,
      gameConfig.world.height,
      gameConfig.colors.floor
    );

    for (let y = 120; y <= 840; y += 180) {
      this.add.rectangle(
        gameConfig.world.width / 2,
        y,
        gameConfig.world.width - 160,
        88,
        gameConfig.colors.aisle,
        0.45
      );
    }

    const shelfPositions = [
      [270, 160],
      [520, 160],
      [770, 160],
      [1030, 160],
      [1290, 160],
      [270, 380],
      [520, 380],
      [770, 380],
      [1030, 380],
      [1290, 380],
      [270, 620],
      [520, 620],
      [770, 620],
      [1030, 620],
      [1290, 620],
      [520, 840],
      [770, 840],
      [1030, 840]
    ] as const;

    for (const [x, y] of shelfPositions) {
      this.add.image(x, y, "shelf");
    }

    this.add
      .text(56, 48, "Library Survivors", {
        color: gameConfig.colors.hudText,
        fontFamily: "Inter, Arial, sans-serif",
        fontSize: "28px",
        fontStyle: "700"
      })
      .setScrollFactor(0);
  }
}
