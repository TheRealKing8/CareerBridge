import { describe, expect, it } from "vitest";
import { parseDashboardTheme } from "@/lib/theme";

describe("parseDashboardTheme", () => {
  it("accepts 'dark'", () => {
    expect(parseDashboardTheme("dark")).toBe("dark");
  });
  it("accepts 'light'", () => {
    expect(parseDashboardTheme("light")).toBe("light");
  });
  it("defaults to 'dark' for unknown values", () => {
    expect(parseDashboardTheme("purple")).toBe("dark");
    expect(parseDashboardTheme("")).toBe("dark");
    expect(parseDashboardTheme(null)).toBe("dark");
    expect(parseDashboardTheme(undefined)).toBe("dark");
    expect(parseDashboardTheme(42)).toBe("dark");
    expect(parseDashboardTheme({})).toBe("dark");
  });
});
