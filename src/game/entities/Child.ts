import Phaser from "phaser";
import type { BookCategory } from "../data/bookConfig";
import { getBookTextureKey } from "../data/bookConfig";
import { coreLoopConfig } from "../data/coreLoopConfig";
import { gameConfig } from "../data/gameConfig";
import { chooseChildBookBehavior, isWithinRadius } from "../systems/childAi";
import type { Shelf } from "./Shelf";

export type ChildState =
  | "entering"
  | "wandering"
  | "choosing-shelf"
  | "interacting"
  | "leaving"
  | "despawn";

export interface ChildStats {
  movementSpeed: number;
  interactionSeconds: number;
  messiness: number;
  multipleBookTheftChance: number;
}

export interface ChildDropBookAction {
  type: "drop-book";
  category: BookCategory;
  x: number;
  y: number;
  chaosMultiplier: number;
}

export type ChildAction = ChildDropBookAction;

export interface ChildUpdateContext {
  deltaSeconds: number;
  shelves: Shelf[];
  waypoints: Phaser.Math.Vector2[];
  exits: Phaser.Math.Vector2[];
  playerX: number;
  playerY: number;
}

type LeavingObjective = "deliver-books" | "exit-library";

// Smart Kid AI stays self-contained: the scene owns spawning/despawning, while
// each child owns its state, steering target, carried books, and emitted mess.
export class Child {
  private readonly sprite: Phaser.Physics.Arcade.Sprite;
  private readonly carriedBookSprites: Phaser.GameObjects.Image[] = [];
  private readonly stats: ChildStats;
  private state: ChildState = "entering";
  private target = new Phaser.Math.Vector2();
  private detourReturnTarget?: Phaser.Math.Vector2;
  private interactionShelf?: Shelf;
  private deliveryShelf?: Shelf;
  private interactionSecondsRemaining = 0;
  private wanderSecondsRemaining = 0;
  private carriedCategories: BookCategory[] = [];
  private leavingObjective: LeavingObjective = "exit-library";
  private previousPosition = new Phaser.Math.Vector2();
  private previousWaypoint?: Phaser.Math.Vector2;
  private stuckSeconds = 0;

  public constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    stats: ChildStats,
    firstWaypoint: Phaser.Math.Vector2
  ) {
    this.stats = stats;
    this.sprite = scene.physics.add.sprite(x, y, "child");
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDepth(8);
    this.sprite.setCircle(12, 2, 2);
    this.sprite.setMaxVelocity(
      stats.movementSpeed * coreLoopConfig.children.fleeSpeedMultiplier
    );

    for (let index = 0; index < coreLoopConfig.children.theftBookCountRange[1]; index += 1) {
      const carriedBookSprite = scene.add.image(x, y - 28 - index * 9, getBookTextureKey("fiction"));
      carriedBookSprite.setScale(0.62);
      carriedBookSprite.setDepth(10 + index);
      carriedBookSprite.setVisible(false);
      this.carriedBookSprites.push(carriedBookSprite);
    }

    this.previousPosition.set(x, y);
    this.setDestination(firstWaypoint);
  }

  public update(context: ChildUpdateContext): ChildAction[] {
    if (this.state === "despawn") {
      return [];
    }

    const actions: ChildAction[] = [];
    const isAfraid = this.isAfraidOf(context.playerX, context.playerY);

    switch (this.state) {
      case "entering":
        this.updateEntering(context);
        break;
      case "wandering":
        this.updateWandering(context, isAfraid);
        break;
      case "choosing-shelf":
        this.updateChoosingShelf(context, isAfraid);
        break;
      case "interacting":
        actions.push(...this.updateInteracting(context, isAfraid));
        break;
      case "leaving":
        actions.push(...this.updateLeaving(context));
        break;
    }

    this.move(context.playerX, context.playerY, isAfraid);
    this.updateCarriedBookSprites();
    this.updateStuckRecovery(context);

    return actions;
  }

  public canBeInterceptedBy(playerX: number, playerY: number): boolean {
    return (
      this.carriedCategories.length > 0 &&
      isWithinRadius(
        this.sprite.x,
        this.sprite.y,
        playerX,
        playerY,
        coreLoopConfig.children.interceptionRadius
      )
    );
  }

  public intercept(exit: Phaser.Math.Vector2, maxBookCount = Number.POSITIVE_INFINITY): BookCategory[] {
    const categories = this.carriedCategories.splice(0, Math.max(0, maxBookCount));

    if (categories.length === 0) {
      return [];
    }

    if (this.carriedCategories.length === 0) {
      this.deliveryShelf = undefined;
      this.hideCarriedBooks();
      this.beginLeavingForExit(exit);
    } else {
      this.showCarriedBooks();
    }

    return categories;
  }

  public get carriedBookCount(): number {
    return this.carriedCategories.length;
  }

  public get isCarryingBook(): boolean {
    return this.carriedBookCount > 0;
  }

  public get shouldDespawn(): boolean {
    return this.state === "despawn";
  }

  public get gameObject(): Phaser.Physics.Arcade.Sprite {
    return this.sprite;
  }

  public destroy(): void {
    this.sprite.destroy();

    for (const carriedBookSprite of this.carriedBookSprites) {
      carriedBookSprite.destroy();
    }
  }

  private updateEntering(context: ChildUpdateContext): void {
    if (this.consumeDetourIfReached()) {
      return;
    }

    if (!this.isAtTarget()) {
      return;
    }

    this.beginWandering(context.waypoints);
  }

  private updateWandering(context: ChildUpdateContext, isAfraid: boolean): void {
    if (this.consumeDetourIfReached()) {
      return;
    }

    this.wanderSecondsRemaining -= context.deltaSeconds;

    if (this.isAtTarget()) {
      this.setDestination(this.chooseWaypoint(context.waypoints));
    }

    if (isAfraid) {
      return;
    }

    if (this.wanderSecondsRemaining > 0) {
      return;
    }

    const shelf = this.selectNearbyShelf(context.shelves);

    if (!shelf) {
      this.resetWanderTimer();
      this.setDestination(this.chooseWaypoint(context.waypoints));
      return;
    }

    this.interactionShelf = shelf;
    this.state = "choosing-shelf";
    this.setDestinationViaAisle(this.getShelfInteractionPoint(shelf), context.waypoints);
  }

  private updateChoosingShelf(context: ChildUpdateContext, isAfraid: boolean): void {
    if (isAfraid) {
      this.interactionShelf = undefined;
      this.beginWandering(context.waypoints);
      return;
    }

    if (this.consumeDetourIfReached()) {
      return;
    }

    if (!this.isAtTarget()) {
      return;
    }

    this.state = "interacting";
    this.interactionSecondsRemaining = this.stats.interactionSeconds;
    this.sprite.setVelocity(0, 0);
  }

  private updateInteracting(context: ChildUpdateContext, isAfraid: boolean): ChildAction[] {
    if (isAfraid) {
      this.interactionShelf = undefined;
      this.beginWandering(context.waypoints);
      return [];
    }

    this.sprite.setVelocity(0, 0);
    this.interactionSecondsRemaining -= context.deltaSeconds;

    if (this.interactionSecondsRemaining > 0) {
      return [];
    }

    return this.finishShelfInteraction(context);
  }

  private updateLeaving(context: ChildUpdateContext): ChildAction[] {
    if (this.consumeDetourIfReached()) {
      return [];
    }

    if (!this.isAtTarget()) {
      return [];
    }

    if (this.leavingObjective === "deliver-books" && this.deliveryShelf) {
      const actions = this.dropCarriedBooksNear(this.deliveryShelf);
      this.beginLeavingForExit(Phaser.Utils.Array.GetRandom(context.exits));
      return actions;
    }

    this.state = "despawn";
    this.sprite.setVelocity(0, 0);
    this.hideCarriedBooks();
    return [];
  }

  private finishShelfInteraction(context: ChildUpdateContext): ChildAction[] {
    const shelf = this.interactionShelf;
    this.interactionShelf = undefined;

    if (!shelf) {
      this.beginLeavingForExit(Phaser.Utils.Array.GetRandom(context.exits));
      return [];
    }

    const behavior = chooseChildBookBehavior(
      Math.random(),
      1 - coreLoopConfig.children.localDropChance
    );

    if (behavior === "local-drop") {
      const actions = this.createDropActionsNearShelf(
        shelf,
        this.chooseMessyBookCount(
          coreLoopConfig.children.localDropBookCountRange[0],
          coreLoopConfig.children.localDropBookCountRange[1]
        ),
        coreLoopConfig.looseBooks.localChaosMultiplier
      );
      this.beginLeavingForExit(Phaser.Utils.Array.GetRandom(context.exits));
      return actions;
    }

    this.carriedCategories = Array.from(
      {
        length: this.chooseMessyBookCount(
          coreLoopConfig.children.theftBookCountRange[0],
          coreLoopConfig.children.theftBookCountRange[0]
        )
      },
      () => shelf.config.category
    );
    if (
      coreLoopConfig.children.theftBookCountRange[1] >
        coreLoopConfig.children.theftBookCountRange[0] &&
      Math.random() < this.stats.multipleBookTheftChance
    ) {
      this.carriedCategories.push(shelf.config.category);
    }
    this.deliveryShelf = this.selectDeliveryShelf(context.shelves, shelf);
    this.showCarriedBooks();
    this.state = "leaving";
    this.leavingObjective = "deliver-books";
    this.setDestinationViaAisle(
      this.getShelfInteractionPoint(this.deliveryShelf),
      context.waypoints
    );

    return [];
  }

  private beginWandering(waypoints: Phaser.Math.Vector2[]): void {
    this.state = "wandering";
    this.interactionShelf = undefined;
    this.deliveryShelf = undefined;
    this.detourReturnTarget = undefined;
    this.resetWanderTimer();
    this.setDestination(this.chooseWaypoint(waypoints));
  }

  private beginLeavingForExit(exit = this.target): void {
    this.state = "leaving";
    this.leavingObjective = "exit-library";
    this.deliveryShelf = undefined;
    this.detourReturnTarget = undefined;
    this.setDestination(exit);
  }

  private move(playerX: number, playerY: number, isAfraid: boolean): void {
    if (this.state === "interacting" || this.state === "despawn") {
      return;
    }

    const movement = new Phaser.Math.Vector2(this.target.x - this.sprite.x, this.target.y - this.sprite.y);

    if (isAfraid && this.state !== "entering" && this.state !== "leaving") {
      const flee = new Phaser.Math.Vector2(this.sprite.x - playerX, this.sprite.y - playerY);
      if (flee.lengthSq() > 0) {
        movement.add(flee.normalize().scale(coreLoopConfig.children.fearRadius));
      }
    }

    if (movement.lengthSq() === 0) {
      this.sprite.setVelocity(0, 0);
      return;
    }

    const speed = this.carriedCategories.length > 0
      ? this.stats.movementSpeed * coreLoopConfig.children.carryingSpeedMultiplier
      : isAfraid
        ? this.stats.movementSpeed * coreLoopConfig.children.fleeSpeedMultiplier
        : this.stats.movementSpeed;

    movement.normalize().scale(speed);
    this.sprite.setVelocity(movement.x, movement.y);
    this.sprite.setPosition(
      Phaser.Math.Clamp(this.sprite.x, 24, gameConfig.world.width - 24),
      Phaser.Math.Clamp(this.sprite.y, 24, gameConfig.world.height - 24)
    );
  }

  private updateStuckRecovery(context: ChildUpdateContext): void {
    if (this.state === "interacting" || this.state === "despawn" || this.isAtTarget()) {
      this.previousPosition.set(this.sprite.x, this.sprite.y);
      this.stuckSeconds = 0;
      return;
    }

    this.stuckSeconds += context.deltaSeconds;

    if (this.stuckSeconds < coreLoopConfig.children.stuckSecondsBeforeRetarget) {
      return;
    }

    const movedDistance = Phaser.Math.Distance.Between(
      this.previousPosition.x,
      this.previousPosition.y,
      this.sprite.x,
      this.sprite.y
    );

    this.previousPosition.set(this.sprite.x, this.sprite.y);
    this.stuckSeconds = 0;

    if (movedDistance >= coreLoopConfig.children.stuckDistanceThreshold) {
      return;
    }

    if (this.state === "choosing-shelf") {
      this.interactionShelf = undefined;
      this.beginWandering(context.waypoints);
      return;
    }

    this.detourTowardWaypoint(context.waypoints);
  }

  private selectNearbyShelf(shelves: Shelf[]): Shelf | undefined {
    if (shelves.length === 0) {
      return undefined;
    }

    return Phaser.Utils.Array.GetRandom(shelves);
  }

  private selectDeliveryShelf(shelves: Shelf[], sourceShelf: Shelf): Shelf {
    const candidates = shelves.filter((shelf) => shelf.config.id !== sourceShelf.config.id);
    return Phaser.Utils.Array.GetRandom(candidates);
  }

  private createDropActionsNearShelf(
    shelf: Shelf,
    count: number,
    chaosMultiplier: number
  ): ChildDropBookAction[] {
    return Array.from({ length: count }, () => {
      const point = this.getShelfDropPoint(shelf);

      return {
        type: "drop-book",
        category: shelf.config.category,
        x: point.x,
        y: point.y,
        chaosMultiplier
      };
    });
  }

  private dropCarriedBooksNear(shelf: Shelf): ChildDropBookAction[] {
    const actions = this.carriedCategories.map((category) => {
      const point = this.getShelfDropPoint(shelf);

      return {
        type: "drop-book" as const,
        category,
        x: point.x,
        y: point.y,
        chaosMultiplier: coreLoopConfig.looseBooks.relocatedChaosMultiplier
      };
    });

    this.carriedCategories = [];
    this.hideCarriedBooks();

    return actions;
  }

  private getShelfInteractionPoint(shelf: Shelf): Phaser.Math.Vector2 {
    const points = [
      new Phaser.Math.Vector2(shelf.config.x, shelf.config.y - 72),
      new Phaser.Math.Vector2(shelf.config.x, shelf.config.y + 72),
      new Phaser.Math.Vector2(shelf.config.x - 104, shelf.config.y),
      new Phaser.Math.Vector2(shelf.config.x + 104, shelf.config.y)
    ];

    points.sort(
      (a, b) =>
        Phaser.Math.Distance.Squared(this.sprite.x, this.sprite.y, a.x, a.y) -
        Phaser.Math.Distance.Squared(this.sprite.x, this.sprite.y, b.x, b.y)
    );

    return this.clampWorldPoint(points[0]);
  }

  private getShelfDropPoint(shelf: Shelf): Phaser.Math.Vector2 {
    const side = Phaser.Utils.Array.GetRandom([
      new Phaser.Math.Vector2(0, -68),
      new Phaser.Math.Vector2(0, 68),
      new Phaser.Math.Vector2(-96, 0),
      new Phaser.Math.Vector2(96, 0)
    ]);

    return this.clampWorldPoint(
      new Phaser.Math.Vector2(
        shelf.config.x + side.x + Phaser.Math.Between(-22, 22),
        shelf.config.y + side.y + Phaser.Math.Between(-18, 18)
      )
    );
  }

  private chooseMessyBookCount(min: number, max: number): number {
    if (min === max) {
      return min;
    }

    const upperBias = this.stats.messiness > 1.15 ? 0.62 : 0.28;
    return Math.random() < upperBias ? max : Phaser.Math.Between(min, max);
  }

  private resetWanderTimer(): void {
    const [minSeconds, maxSeconds] = coreLoopConfig.children.wanderDurationSecondsRange;
    this.wanderSecondsRemaining = Phaser.Math.FloatBetween(minSeconds, maxSeconds);
  }

  private setDestination(point: Phaser.Math.Vector2): void {
    this.target.set(point.x, point.y);
  }

  private setDestinationViaAisle(
    destination: Phaser.Math.Vector2,
    waypoints: Phaser.Math.Vector2[]
  ): void {
    const closestAisleDistance = Math.min(
      ...waypoints.map((waypoint) => Math.abs(waypoint.y - destination.y))
    );
    const aisleWaypoints = waypoints.filter(
      (waypoint) => Math.abs(waypoint.y - destination.y) <= closestAisleDistance + 1
    );

    this.detourReturnTarget = destination.clone();
    this.setDestination(this.chooseWaypoint(aisleWaypoints));
  }

  private chooseWaypoint(waypoints: Phaser.Math.Vector2[]): Phaser.Math.Vector2 {
    const previousWaypoint = this.previousWaypoint;
    const candidates = previousWaypoint
      ? waypoints.filter((waypoint) => !waypoint.equals(previousWaypoint))
      : waypoints;
    const waypoint = Phaser.Utils.Array.GetRandom(candidates.length > 0 ? candidates : waypoints);

    this.previousWaypoint = waypoint;
    return waypoint;
  }

  private detourTowardWaypoint(waypoints: Phaser.Math.Vector2[]): void {
    if (!this.detourReturnTarget) {
      this.detourReturnTarget = this.target.clone();
    }

    this.setDestination(this.chooseWaypoint(waypoints));
  }

  private consumeDetourIfReached(): boolean {
    if (!this.detourReturnTarget || !this.isAtTarget()) {
      return false;
    }

    this.setDestination(this.detourReturnTarget);
    this.detourReturnTarget = undefined;
    return true;
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

  private showCarriedBooks(): void {
    this.carriedBookSprites.forEach((sprite, index) => {
      const category = this.carriedCategories[index];
      sprite.setVisible(category !== undefined);

      if (category) {
        sprite.setTexture(getBookTextureKey(category));
      }
    });
  }

  private hideCarriedBooks(): void {
    for (const carriedBookSprite of this.carriedBookSprites) {
      carriedBookSprite.setVisible(false);
    }
  }

  private updateCarriedBookSprites(): void {
    this.carriedBookSprites.forEach((sprite, index) => {
      sprite.setPosition(this.sprite.x + (index - 0.5) * 12, this.sprite.y - 28 - index * 7);
    });
  }

  private clampWorldPoint(point: Phaser.Math.Vector2): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(
      Phaser.Math.Clamp(point.x, 32, gameConfig.world.width - 32),
      Phaser.Math.Clamp(point.y, 42, gameConfig.world.height - 42)
    );
  }
}
