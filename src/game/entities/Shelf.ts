import type Phaser from "phaser";
import { bookCategoryConfig } from "../data/bookConfig";
import type { ShelfConfig } from "../data/libraryLayout";
import { distanceSquared } from "../utils/math";

export class Shelf {
  public readonly config: ShelfConfig;
  private readonly image: Phaser.GameObjects.Image;
  private readonly label: Phaser.GameObjects.Text;

  public constructor(scene: Phaser.Scene, config: ShelfConfig) {
    this.config = config;
    const category = bookCategoryConfig[config.category];

    this.image = scene.add.image(config.x, config.y, "shelf");
    this.image.setDepth(2);
    this.image.setTint(category.color);

    this.label = scene.add
      .text(config.x, config.y - 36, category.label, {
        color: category.textColor,
        fontFamily: "Inter, Arial, sans-serif",
        fontSize: "14px",
        fontStyle: "700"
      })
      .setOrigin(0.5)
      .setDepth(3);
  }

  public isWithinRange(x: number, y: number, range: number): boolean {
    return distanceSquared(x, y, this.config.x, this.config.y) <= range * range;
  }
}
