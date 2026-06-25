import Phaser from "phaser";
import { gameConfig } from "../data/gameConfig";

export class PreloadScene extends Phaser.Scene {
  public constructor() {
    super("PreloadScene");
  }

  public preload(): void {
    this.createGeneratedTextures();
  }

  public create(): void {
    this.scene.start("GameScene");
    this.scene.launch("HudScene");
    this.scene.launch("OverlayScene");
  }

  private createGeneratedTextures(): void {
    this.createCircleTexture("librarian", gameConfig.colors.player, 34, 0x0f172a);
    this.createShelfTexture();
  }

  private createCircleTexture(
    key: string,
    fillColor: number,
    size: number,
    strokeColor: number
  ): void {
    const graphics = this.make.graphics({ x: 0, y: 0 });
    const radius = size / 2;

    graphics.fillStyle(fillColor, 1);
    graphics.fillCircle(radius, radius, radius - 2);
    graphics.lineStyle(3, strokeColor, 1);
    graphics.strokeCircle(radius, radius, radius - 3);
    graphics.fillStyle(gameConfig.colors.playerAccent, 1);
    graphics.fillRect(radius - 5, radius - 12, 10, 24);
    graphics.generateTexture(key, size, size);
    graphics.destroy();
  }

  private createShelfTexture(): void {
    const graphics = this.make.graphics({ x: 0, y: 0 });

    graphics.fillStyle(gameConfig.colors.shelf, 1);
    graphics.fillRoundedRect(0, 0, 156, 44, 4);
    graphics.lineStyle(3, gameConfig.colors.shelfTrim, 1);
    graphics.strokeRoundedRect(2, 2, 152, 40, 4);

    for (let x = 14; x < 144; x += 18) {
      graphics.fillStyle(0x6ee7b7, 1);
      graphics.fillRect(x, 9, 8, 26);
      graphics.fillStyle(0xfca5a5, 1);
      graphics.fillRect(x + 8, 12, 7, 23);
    }

    graphics.generateTexture("shelf", 156, 44);
    graphics.destroy();
  }
}
