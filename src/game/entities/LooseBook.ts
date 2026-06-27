import Phaser from "phaser";
import type { BookCategory } from "../data/bookConfig";
import { getBookTextureKey } from "../data/bookConfig";

export class LooseBook {
  public readonly id: number;
  public readonly category: BookCategory;
  public readonly spawnedAtSeconds: number;
  public readonly chaosMultiplier: number;
  private readonly sprite: Phaser.GameObjects.Image;

  public constructor(
    scene: Phaser.Scene,
    id: number,
    category: BookCategory,
    x: number,
    y: number,
    spawnedAtSeconds: number,
    chaosMultiplier = 1
  ) {
    this.id = id;
    this.category = category;
    this.spawnedAtSeconds = spawnedAtSeconds;
    this.chaosMultiplier = chaosMultiplier;
    this.sprite = scene.add.image(x, y, getBookTextureKey(category));
    this.sprite.setDepth(4);
    this.sprite.setAngle(Phaser.Math.Between(-18, 18));
  }

  public get x(): number {
    return this.sprite.x;
  }

  public get y(): number {
    return this.sprite.y;
  }

  public get ageSeconds(): number {
    return this.sceneTimeSeconds - this.spawnedAtSeconds;
  }

  public ageAt(elapsedSeconds: number): number {
    return Math.max(0, elapsedSeconds - this.spawnedAtSeconds);
  }

  public destroy(): void {
    this.sprite.destroy();
  }

  private get sceneTimeSeconds(): number {
    return this.sprite.scene.time.now / 1000;
  }
}
