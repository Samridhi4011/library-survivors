import { describe, expect, it } from "vitest";
import { formatRunTime } from "./format";

describe("formatRunTime", () => {
  it("formats elapsed seconds as mm:ss", () => {
    expect(formatRunTime(0)).toBe("00:00");
    expect(formatRunTime(9.8)).toBe("00:09");
    expect(formatRunTime(65)).toBe("01:05");
    expect(formatRunTime(30 * 60)).toBe("30:00");
  });

  it("clamps negative time display to zero", () => {
    expect(formatRunTime(-12)).toBe("00:00");
  });
});
