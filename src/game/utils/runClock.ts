import { gameConfig } from "../data/gameConfig";

export const getRunTargetSeconds = (search = globalThis.location?.search ?? ""): number => {
  const params = new URLSearchParams(search);
  const explicitSeconds = Number(params.get("runSeconds"));

  if (Number.isFinite(explicitSeconds) && explicitSeconds > 0) {
    return explicitSeconds;
  }

  if (params.get("shortRun") === "1") {
    return gameConfig.debug.shortRunSeconds;
  }

  return gameConfig.run.productionSeconds;
};
