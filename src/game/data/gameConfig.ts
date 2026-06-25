export const gameConfig = {
  viewport: {
    width: 1280,
    height: 720
  },
  world: {
    width: 1600,
    height: 1000
  },
  debug: {
    physics: false,
    shortRunSeconds: 180
  },
  run: {
    productionSeconds: 30 * 60
  },
  player: {
    startX: 800,
    startY: 500,
    speed: 260
  },
  colors: {
    background: "#172017",
    floor: 0x27352a,
    aisle: 0x314534,
    shelf: 0x8b5e34,
    shelfTrim: 0xd7a85f,
    player: 0x3fb7ff,
    playerAccent: 0xf8fafc,
    hudText: "#f8fafc",
    hudMuted: "#a7b7aa",
    chaos: 0xef4444,
    xp: 0x7dd3fc,
    backpack: 0xfacc15,
    overlay: 0x0f172a
  }
} as const;

export type GameConfig = typeof gameConfig;
