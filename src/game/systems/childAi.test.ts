import { describe, expect, it } from "vitest";
import { chooseChildBookBehavior, isWithinRadius } from "./childAi";

describe("childAi", () => {
  it("chooses theft below the configured chance", () => {
    expect(chooseChildBookBehavior(0.2, 0.5)).toBe("theft");
  });

  it("chooses a local drop at or above the configured chance", () => {
    expect(chooseChildBookBehavior(0.5, 0.5)).toBe("local-drop");
    expect(chooseChildBookBehavior(0.8, 0.5)).toBe("local-drop");
  });

  it("detects radius checks using squared distance", () => {
    expect(isWithinRadius(0, 0, 3, 4, 5)).toBe(true);
    expect(isWithinRadius(0, 0, 6, 0, 5)).toBe(false);
  });
});
