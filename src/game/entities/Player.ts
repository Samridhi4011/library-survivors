import Phaser from "phaser";
import { gameConfig } from "../data/gameConfig";
import { clamp } from "../utils/math";

export class Player {
  private readonly sprite: Phaser.Physics.Arcade.Sprite;
  private readonly cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private readonly wasd: Record<"up" | "down" | "left" | "right", Phaser.Input.Keyboard.Key>;

  public constructor(scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.physics.add.sprite(x, y, "librarian");
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDamping(true);
    this.sprite.setDrag(0.94);
    this.sprite.setMaxVelocity(gameConfig.player.speed);

    if (!scene.input.keyboard) {
      throw new Error("Keyboard input is required for Library Survivors.");
    }

    this.cursors = scene.input.keyboard.createCursorKeys();
    this.wasd = scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    }) as Record<"up" | "down" | "left" | "right", Phaser.Input.Keyboard.Key>;
  }

  public update(): void {
    const direction = new Phaser.Math.Vector2(
      this.axis(this.cursors.left, this.wasd.left, this.cursors.right, this.wasd.right),
      this.axis(this.cursors.up, this.wasd.up, this.cursors.down, this.wasd.down)
    );

    if (direction.lengthSq() > 0) {
      direction.normalize().scale(gameConfig.player.speed);
    }

    this.sprite.setVelocity(direction.x, direction.y);
    this.sprite.setPosition(
      clamp(this.sprite.x, 0, gameConfig.world.width),
      clamp(this.sprite.y, 0, gameConfig.world.height)
    );
  }

  public get gameObject(): Phaser.Physics.Arcade.Sprite {
    return this.sprite;
  }

  public get x(): number {
    return this.sprite.x;
  }

  public get y(): number {
    return this.sprite.y;
  }

  private axis(
    negativeA: Phaser.Input.Keyboard.Key,
    negativeB: Phaser.Input.Keyboard.Key,
    positiveA: Phaser.Input.Keyboard.Key,
    positiveB: Phaser.Input.Keyboard.Key
  ): number {
    const negative = negativeA.isDown || negativeB.isDown ? -1 : 0;
    const positive = positiveA.isDown || positiveB.isDown ? 1 : 0;

    return negative + positive;
  }
}
