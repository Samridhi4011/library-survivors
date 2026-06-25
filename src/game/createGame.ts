import Phaser from "phaser";
import { gameConfig } from "./data/gameConfig";
import { GameScene } from "./scenes/GameScene";
import { HudScene } from "./scenes/HudScene";
import { OverlayScene } from "./scenes/OverlayScene";
import { PreloadScene } from "./scenes/PreloadScene";

export const createGame = (): Phaser.Game => {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent: "app",
    backgroundColor: gameConfig.colors.background,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: gameConfig.viewport.width,
      height: gameConfig.viewport.height
    },
    physics: {
      default: "arcade",
      arcade: {
        debug: gameConfig.debug.physics
      }
    },
    scene: [PreloadScene, GameScene, HudScene, OverlayScene]
  });
};
