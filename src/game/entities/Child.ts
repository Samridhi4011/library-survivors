import Phaser from "phaser";
import type { BookCategory } from "../data/bookConfig";
import { getBookTextureKey } from "../data/bookConfig";
import { coreLoopConfig } from "../data/coreLoopConfig";
import { gameConfig } from "../data/gameConfig";
import type { Shelf } from "./Shelf";
import { chooseChildBookBehavior, isWithinRadius } from "../systems/childAi";

export type ChildState = "wander" | "choose-book" | "carry-book";

export interface ChildDropBookAction {
  type: "drop-book";
  category: BookCategory;
  x: number;
  y: number;
}

export type ChildAction = ChildDropBookAction;

export interface ChildUpdateContext {
  deltaSeconds: number;
  shelves: Shelf[];
  playerX: number;
  playerY: number;
}

// Milestone 3 child AI owns movement and book-carrying state, while the scene
// decides how emitted book-drop actions affect the wider run state.
export class Child {
  private readonly sprite: Phaser.Physics.Arcade.Sprite;
  private readonly carriedBookSprite: Phaser.GameObjects.Image;
  private state: ChildState = "wander";
  private target = new Phaser.Math.Vector2();
  private interactionShelf?: Shelf;
  private interactionSecondsRemaining = 0;
  private carriedCategory?: BookCategory;

  public constructor(scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.physics.add.sprite(x, y, "child");
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDepth(8);

    this.carriedBookSprite = scene.add.image(x, y - 26, getBookTextureKey("fiction"));
    this.carriedBookSprite.setScale(0.72);
    this.carriedBookSprite.setDepth(10);
    this.carriedBookSprite.setVisible(false);

    this.pickWanderTarget();
  }

  public update(context: ChildUpdateContext): ChildAction[] {
    const actions: ChildAction[] = [];
    const isAfraid = this.isAfraidOf(context.playerX, context.playerY);

    if (this.state === "choose-book") {
      this.updateChoosing(context.deltaSeconds, isAfraid);
    }

    if (this.state === "wander") {
      this.updateWandering(context.shelves, isAfraid);
    }

    if (this.state === "carry-book" && this.isAtTarget()) {
      const droppedBook = this.dropCarriedBook(this.sprite.x, this.sprite.y);
      if (droppedBook) {
        actions.push(droppedBook);
      }
    }

    this.move(context.deltaSeconds, context.playerX, context.playerY, isAfraid);
    this.updateCarriedBookSprite();

    if (this.state === "choose-book" && this.interactionSecondsRemaining <= 0) {
      actions.push(...this.finishShelfInteraction());
    }

    return actions;
  }

  public canBeInterceptedBy(playerX: number, playerY: number): boolean {
    return (
      this.carriedCategory !== undefined &&
      isWithinRadius(
        this.sprite.x,
        this.sprite.y,
        playerX,
        playerY,
        coreLoopConfig.children.interceptionRadius
      )
    );
  }

  public intercept(): BookCategory | undefined {
    const category = this.carriedCategory;

    if (!category) {
      return undefined;
    }

    this.carriedCategory = undefined;
    this.carriedBookSprite.setVisible(false);
    this.state = "wander";
    this.interactionShelf = undefined;
    this.pickWanderTarget();

    return category;
  }

  public get isCarryingBook(): boolean {
    return this.carriedCategory !== undefined;
  }

  public destroy(): void {
    this.sprite.destroy();
    this.carriedBookSprite.destroy();
  }

  private updateChoosing(deltaSeconds: number, isAfraid: boolean): void {
    if (isAfraid) {
      this.state = "wander";
      this.interactionShelf = undefined;
      this.interactionSecondsRemaining = 0;
      this.pickWanderTarget();
      return;
    }

    this.sprite.setVelocity(0, 0);
    this.interactionSecondsRemaining -= deltaSeconds;
  }

  private updateWandering(shelves: Shelf[], isAfraid: boolean): void {
    if (this.isAtTarget()) {
      this.pickWanderTarget();
    }

    if (isAfraid) {
      return;
    }

    const shelf = shelves.find((candidate) =>
      candidate.isWithinRange(
        this.sprite.x,
        this.sprite.y,
        coreLoopConfig.children.shelfDiscoveryRadius
      )
    );

    if (!shelf) {
      return;
    }

    this.state = "choose-book";
    this.interactionShelf = shelf;
    this.interactionSecondsRemaining = coreLoopConfig.children.shelfInteractionSeconds;
  }

  private finishShelfInteraction(): ChildAction[] {
    const shelf = this.interactionShelf;

    if (!shelf) {
      this.state = "wander";
      this.pickWanderTarget();
      return [];
    }

    const behavior = chooseChildBookBehavior(Math.random(), coreLoopConfig.children.theftChance);
    this.interactionShelf = undefined;

    if (behavior === "local-drop") {
      this.state = "wander";
      this.pickWanderTarget();
      return [
        {
          type: "drop-book",
          category: shelf.config.category,
          x: shelf.config.x + Phaser.Math.Between(-58, 58),
          y: shelf.config.y + Phaser.Math.Between(-62, 62)
        }
      ];
    }

    // Theft creates a moving objective: the child visibly carries the book until
    // either intercepted by the librarian or it reaches a far destination.
    this.carriedCategory = shelf.config.category;
    this.carriedBookSprite.setTexture(getBookTextureKey(shelf.config.category));
    this.carriedBookSprite.setVisible(true);
    this.state = "carry-book";
    this.pickTheftDestination(shelf);
    return [];
  }

  private move(
    deltaSeconds: number,
    playerX: number,
    playerY: number,
    isAfraid: boolean
  ): void {
    if (this.state === "choose-book") {
      return;
    }

    const movement = new Phaser.Math.Vector2();

    if (isAfraid) {
      movement.set(this.sprite.x - playerX, this.sprite.y - playerY);
    } else {
      movement.set(this.target.x - this.sprite.x, this.target.y - this.sprite.y);
    }

    if (movement.lengthSq() === 0) {
      this.sprite.setVelocity(0, 0);
      return;
    }

    const speed = isAfraid
      ? coreLoopConfig.children.fleeSpeed
      : this.carriedCategory
        ? coreLoopConfig.children.carryingSpeed
        : coreLoopConfig.children.speed;

    movement.normalize().scale(speed * deltaSeconds);
    this.sprite.setPosition(
      Phaser.Math.Clamp(this.sprite.x + movement.x, 24, gameConfig.world.width - 24),
      Phaser.Math.Clamp(this.sprite.y + movement.y, 24, gameConfig.world.height - 24)
    );
  }

  private dropCarriedBook(x: number, y: number): ChildDropBookAction | undefined {
    if (!this.carriedCategory) {
      return undefined;
    }

    const category = this.carriedCategory;
    this.carriedCategory = undefined;
    this.carriedBookSprite.setVisible(false);
    this.state = "wander";
    this.pickWanderTarget();

    return {
      type: "drop-book",
      category,
      x,
      y
    };
  }

  private isAfraidOf(playerX: number, playerY: number): boolean {
    return isWithinRadius(
      this.sprite.x,
      this.sprite.y,
      playerX,
      playerY,
      coreLoopConfig.children.fearRadius
    );
  }

  private isAtTarget(): boolean {
    return isWithinRadius(
      this.sprite.x,
      this.sprite.y,
      this.target.x,
      this.target.y,
      coreLoopConfig.children.destinationReachRadius
    );
  }

  private pickWanderTarget(): void {
    this.target.set(
      Phaser.Math.Between(80, gameConfig.world.width - 80),
      Phaser.Math.Between(90, gameConfig.world.height - 90)
    );
  }

  private pickTheftDestination(sourceShelf: Shelf): void {
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const x = Phaser.Math.Between(80, gameConfig.world.width - 80);
      const y = Phaser.Math.Between(90, gameConfig.world.height - 90);

      if (!sourceShelf.isWithinRange(x, y, 360)) {
        this.target.set(x, y);
        return;
      }
    }

    this.pickWanderTarget();
  }

  private updateCarriedBookSprite(): void {
    this.carriedBookSprite.setPosition(this.sprite.x, this.sprite.y - 28);
  }
}
