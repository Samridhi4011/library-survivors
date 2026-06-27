import Phaser from "phaser";
import { coreLoopConfig } from "../data/coreLoopConfig";
import { gameConfig } from "../data/gameConfig";
import { shelfConfigs } from "../data/libraryLayout";
import { Child, type ChildStats } from "../entities/Child";
import { LooseBook } from "../entities/LooseBook";
import { Player } from "../entities/Player";
import { Shelf } from "../entities/Shelf";
import {
  addXp,
  addBookToBackpack,
  createInitialRunState,
  endRun,
  setChaosPercent,
  setLooseBookPressure,
  shelveBackpackCategory,
  type RunState
} from "../state/runState";
import { calculateChaosGrowthRate } from "../systems/chaos";
import { GameEvents } from "../types/events";
import { distanceSquared } from "../utils/math";
import { getRunTargetSeconds } from "../utils/runClock";

export class GameScene extends Phaser.Scene {
  private player?: Player;
  private runState: RunState = createInitialRunState();
  private shelves: Shelf[] = [];
  private libraryChildren: Child[] = [];
  private looseBooks: LooseBook[] = [];
  private nextBookId = 1;
  private runEndEmitted = false;
  private pauseKey?: Phaser.Input.Keyboard.Key;
  private levelPreviewKey?: Phaser.Input.Keyboard.Key;
  private childSpawnSecondsRemaining = coreLoopConfig.children.spawnIntervalSeconds;
  private readonly childEntrances = [
    new Phaser.Math.Vector2(48, 100),
    new Phaser.Math.Vector2(1552, 100),
    new Phaser.Math.Vector2(48, 500),
    new Phaser.Math.Vector2(1552, 500),
    new Phaser.Math.Vector2(400, 952),
    new Phaser.Math.Vector2(1200, 952)
  ];
  private readonly childWaypoints = [
    new Phaser.Math.Vector2(150, 270),
    new Phaser.Math.Vector2(400, 270),
    new Phaser.Math.Vector2(650, 270),
    new Phaser.Math.Vector2(900, 270),
    new Phaser.Math.Vector2(1150, 270),
    new Phaser.Math.Vector2(1450, 270),
    new Phaser.Math.Vector2(150, 500),
    new Phaser.Math.Vector2(400, 500),
    new Phaser.Math.Vector2(650, 500),
    new Phaser.Math.Vector2(900, 500),
    new Phaser.Math.Vector2(1150, 500),
    new Phaser.Math.Vector2(1450, 500),
    new Phaser.Math.Vector2(150, 730),
    new Phaser.Math.Vector2(400, 730),
    new Phaser.Math.Vector2(650, 730),
    new Phaser.Math.Vector2(900, 730),
    new Phaser.Math.Vector2(1150, 730),
    new Phaser.Math.Vector2(1450, 730),
    new Phaser.Math.Vector2(260, 940),
    new Phaser.Math.Vector2(1340, 940)
  ];

  public constructor() {
    super("GameScene");
  }

  public create(): void {
    this.runState = createInitialRunState(getRunTargetSeconds());
    this.physics.world.setBounds(0, 0, gameConfig.world.width, gameConfig.world.height);
    this.cameras.main.setBounds(0, 0, gameConfig.world.width, gameConfig.world.height);

    this.drawLibraryFoundation();
    this.shelves = shelfConfigs.map((shelfConfig) => new Shelf(this, shelfConfig));
    this.libraryChildren = this.createChildren();
    this.player = new Player(this, gameConfig.player.startX, gameConfig.player.startY);
    this.physics.add.collider(
      this.player.gameObject,
      this.shelves.map((shelf) => shelf.collider)
    );
    this.cameras.main.startFollow(this.player.gameObject, true, 0.08, 0.08);

    if (!this.input.keyboard) {
      throw new Error("Keyboard input is required for Library Survivors.");
    }

    this.pauseKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    this.levelPreviewKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L);

    for (let i = 0; i < coreLoopConfig.looseBooks.initialCount; i += 1) {
      this.spawnLooseBook();
    }

    this.refreshLooseBookPressure();
    this.events.emit(GameEvents.RunStateUpdated, { state: this.runState });
  }

  public update(_time: number, delta: number): void {
    this.handleSceneKeys();

    if (this.runState.isPaused || this.runState.status !== "running") {
      return;
    }

    const deltaSeconds = delta / 1000;
    this.runState = {
      ...this.runState,
      elapsedSeconds: this.runState.elapsedSeconds + deltaSeconds
    };

    this.player?.update();
    this.handleChildInterceptions();
    this.updateChildren(deltaSeconds);
    this.updateChildSpawning(deltaSeconds);
    this.handleAutomaticPickup();
    this.handleAutomaticShelving();
    this.updateChaos(deltaSeconds);
    this.evaluateRunStatus();
    this.events.emit(GameEvents.RunStateUpdated, { state: this.runState });
  }

  private handleSceneKeys(): void {
    if (
      this.pauseKey &&
      Phaser.Input.Keyboard.JustDown(this.pauseKey) &&
      this.runState.status === "running"
    ) {
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

  private handleAutomaticPickup(): void {
    if (!this.player || this.runState.backpackCount >= this.runState.backpackCapacity) {
      return;
    }

    for (let index = this.looseBooks.length - 1; index >= 0; index -= 1) {
      const book = this.looseBooks[index];
      const withinPickupRange =
        distanceSquared(this.player.x, this.player.y, book.x, book.y) <=
        coreLoopConfig.pickupRadius * coreLoopConfig.pickupRadius;

      if (!withinPickupRange) {
        continue;
      }

      this.runState = addBookToBackpack(this.runState, book.category);
      book.destroy();
      this.looseBooks.splice(index, 1);

      if (this.runState.backpackCount >= this.runState.backpackCapacity) {
        break;
      }
    }
  }

  private handleChildInterceptions(): void {
    if (!this.player || this.runState.backpackCount >= this.runState.backpackCapacity) {
      return;
    }

    for (const child of this.libraryChildren) {
      if (!child.canBeInterceptedBy(this.player.x, this.player.y)) {
        continue;
      }

      const availableCapacity = this.runState.backpackCapacity - this.runState.backpackCount;
      const categories = child.intercept(
        Phaser.Utils.Array.GetRandom(this.childEntrances),
        availableCapacity
      );

      if (categories.length === 0) {
        continue;
      }

      for (const category of categories) {
        this.runState = addBookToBackpack(this.runState, category);
      }
      this.runState = addXp(this.runState, coreLoopConfig.children.interceptionBonusXp);
      this.createFloatingText(
        `+${coreLoopConfig.children.interceptionBonusXp} XP`,
        this.player.x,
        this.player.y - 42,
        gameConfig.colors.hudText
      );

      if (this.runState.backpackCount >= this.runState.backpackCapacity) {
        break;
      }
    }
  }

  private updateChildren(deltaSeconds: number): void {
    if (!this.player) {
      return;
    }

    for (let index = this.libraryChildren.length - 1; index >= 0; index -= 1) {
      const child = this.libraryChildren[index];
      const actions = child.update({
        deltaSeconds,
        shelves: this.shelves,
        waypoints: this.childWaypoints,
        exits: this.childEntrances,
        playerX: this.player.x,
        playerY: this.player.y
      });

      for (const action of actions) {
        if (action.type === "drop-book") {
          // Children are the ongoing source of new disorder after Milestone 3.
          this.createLooseBook(
            action.category,
            action.x,
            action.y,
            action.chaosMultiplier
          );
        }
      }

      if (child.shouldDespawn) {
        child.destroy();
        this.libraryChildren.splice(index, 1);
      }
    }
  }

  private updateChildSpawning(deltaSeconds: number): void {
    if (this.libraryChildren.length >= coreLoopConfig.children.maxCount) {
      return;
    }

    this.childSpawnSecondsRemaining -= deltaSeconds;

    if (this.childSpawnSecondsRemaining > 0) {
      return;
    }

    this.childSpawnSecondsRemaining = coreLoopConfig.children.spawnIntervalSeconds;
    this.libraryChildren.push(this.createChild());
  }

  private handleAutomaticShelving(): void {
    if (!this.player || this.runState.backpackCount === 0) {
      return;
    }

    for (const shelf of this.shelves) {
      if (!shelf.isWithinRange(this.player.x, this.player.y, coreLoopConfig.shelvingRadius)) {
        continue;
      }

      const { state, shelvedCount } = shelveBackpackCategory(
        this.runState,
        shelf.config.category,
        coreLoopConfig.returnXpPerBook
      );

      if (shelvedCount > 0) {
        this.runState = state;
        this.createFloatingText(
          `+${shelvedCount * coreLoopConfig.returnXpPerBook} XP`,
          shelf.config.x,
          shelf.config.y - 62,
          gameConfig.colors.hudText
        );
      }
    }
  }

  private updateChaos(deltaSeconds: number): void {
    const chaosGrowthRate = calculateChaosGrowthRate(
      this.looseBooks.map((book) => ({
        ageSeconds: book.ageAt(this.runState.elapsedSeconds),
        chaosMultiplier: book.chaosMultiplier
      })),
      this.getCarriedBookCount()
    );

    this.runState = setLooseBookPressure(
      this.runState,
      this.looseBooks.length,
      this.getCarriedBookCount(),
      chaosGrowthRate
    );
    this.runState = setChaosPercent(
      this.runState,
      this.runState.chaosPercent + chaosGrowthRate * deltaSeconds
    );
  }

  private evaluateRunStatus(): void {
    if (this.runState.status !== "running") {
      return;
    }

    if (this.runState.chaosPercent >= 100) {
      this.runState = endRun(this.runState, "lost");
      this.emitRunEnded();
      return;
    }

    if (this.runState.elapsedSeconds >= this.runState.targetSeconds) {
      this.runState = endRun(this.runState, "won");
      this.emitRunEnded();
    }
  }

  private emitRunEnded(): void {
    if (this.runEndEmitted) {
      return;
    }

    this.runEndEmitted = true;
    this.events.emit(GameEvents.RunEnded, { state: this.runState });
  }

  private refreshLooseBookPressure(): void {
    this.runState = setLooseBookPressure(
      this.runState,
      this.looseBooks.length,
      this.getCarriedBookCount(),
      calculateChaosGrowthRate(
        this.looseBooks.map((book) => ({
          ageSeconds: book.ageAt(this.runState.elapsedSeconds),
          chaosMultiplier: book.chaosMultiplier
        })),
        this.getCarriedBookCount()
      )
    );
  }

  private spawnLooseBook(): void {
    const sourceShelf = Phaser.Utils.Array.GetRandom(this.shelves);
    const spawnPoint = this.pickLooseBookSpawnPoint(sourceShelf);

    this.createLooseBook(sourceShelf.config.category, spawnPoint.x, spawnPoint.y);
  }

  private createLooseBook(
    category: Shelf["config"]["category"],
    x: number,
    y: number,
    chaosMultiplier: number = coreLoopConfig.looseBooks.localChaosMultiplier
  ): void {
    if (this.looseBooks.length >= coreLoopConfig.looseBooks.maxCount) {
      return;
    }

    this.looseBooks.push(
      new LooseBook(
        this,
        this.nextBookId,
        category,
        Phaser.Math.Clamp(x, 36, gameConfig.world.width - 36),
        Phaser.Math.Clamp(y, 46, gameConfig.world.height - 46),
        this.runState.elapsedSeconds,
        chaosMultiplier
      )
    );
    this.nextBookId += 1;
  }

  private getCarriedBookCount(): number {
    return this.libraryChildren.reduce((total, child) => total + child.carriedBookCount, 0);
  }

  private createChildren(): Child[] {
    return this.childEntrances
      .slice(0, coreLoopConfig.children.initialCount)
      .map((entrance) => this.createChild(entrance));
  }

  private createChild(
    entrance = Phaser.Utils.Array.GetRandom(this.childEntrances)
  ): Child {
    const child = new Child(
      this,
      entrance.x,
      entrance.y,
      this.createChildStats(),
      Phaser.Utils.Array.GetRandom(this.childWaypoints)
    );

    this.physics.add.collider(
      child.gameObject,
      this.shelves.map((shelf) => shelf.collider)
    );

    return child;
  }

  private createChildStats(): ChildStats {
    const [minSpeed, maxSpeed] = coreLoopConfig.children.baseSpeedRange;
    const [minInteractionSeconds, maxInteractionSeconds] =
      coreLoopConfig.children.interactionSecondsRange;
    const [minMessiness, maxMessiness] = coreLoopConfig.children.messinessRange;

    return {
      movementSpeed: Phaser.Math.FloatBetween(minSpeed, maxSpeed),
      interactionSeconds: Phaser.Math.FloatBetween(
        minInteractionSeconds,
        maxInteractionSeconds
      ),
      messiness: Phaser.Math.FloatBetween(minMessiness, maxMessiness)
    };
  }

  private pickLooseBookSpawnPoint(sourceShelf: Shelf): Phaser.Math.Vector2 {
    const margin = 90;
    let x = sourceShelf.config.x;
    let y = sourceShelf.config.y;

    for (let attempt = 0; attempt < 20; attempt += 1) {
      x = Phaser.Math.Between(margin, gameConfig.world.width - margin);
      y = Phaser.Math.Between(margin, gameConfig.world.height - margin);

      if (
        distanceSquared(x, y, sourceShelf.config.x, sourceShelf.config.y) >=
        coreLoopConfig.looseBooks.minSpawnDistanceFromShelf *
          coreLoopConfig.looseBooks.minSpawnDistanceFromShelf
      ) {
        break;
      }
    }

    return new Phaser.Math.Vector2(x, y);
  }

  private createFloatingText(xpText: string, x: number, y: number, color: string): void {
    const text = this.add
      .text(x, y, xpText, {
        color,
        fontFamily: "Inter, Arial, sans-serif",
        fontSize: "18px",
        fontStyle: "700"
      })
      .setOrigin(0.5)
      .setDepth(20);

    this.tweens.add({
      targets: text,
      y: y - 32,
      alpha: 0,
      duration: 850,
      ease: "Sine.easeOut",
      onComplete: () => text.destroy()
    });
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
  }
}
