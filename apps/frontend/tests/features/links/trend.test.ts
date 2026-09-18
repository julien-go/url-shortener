import { describe, expect, it } from "vitest";
import {
  computeTrend,
  formatBucketLabel,
  formatTrend,
} from "../../../src/features/links/components/stats/trend";

describe("computeTrend", () => {
  it("reports a rise and a drop as a rounded percentage", () => {
    expect(computeTrend(120, 100)).toEqual({ kind: "up", percent: 20 });
    expect(computeTrend(75, 100)).toEqual({ kind: "down", percent: 25 });
  });

  it("reports no change as flat", () => {
    expect(computeTrend(42, 42)).toEqual({ kind: "flat" });
  });

  it("refuses to divide by a previous window with no clicks", () => {
    expect(computeTrend(10, 0)).toEqual({ kind: "unavailable" });
    expect(computeTrend(0, 0)).toEqual({ kind: "unavailable" });
  });

  it("keeps the percentage positive and carries direction in the kind", () => {
    const trend = computeTrend(1, 100);
    expect(trend).toEqual({ kind: "down", percent: 99 });
  });
});

describe("formatTrend", () => {
  it("prefixes with a sign and uses a real minus sign", () => {
    expect(formatTrend({ kind: "up", percent: 20 })).toBe("+20%");
    expect(formatTrend({ kind: "down", percent: 25 })).toBe("−25%");
    expect(formatTrend({ kind: "flat" })).toBe("0%");
    expect(formatTrend({ kind: "unavailable" })).toBe("—");
  });
});

describe("formatBucketLabel", () => {
  it("shows day and month for daily and weekly buckets", () => {
    expect(formatBucketLabel("2026-09-18", "DAY")).toBe("18/09");
    expect(formatBucketLabel("2026-09-14", "WEEK")).toBe("14/09");
  });

  it("shows month and year for monthly buckets", () => {
    expect(formatBucketLabel("2026-09-01", "MONTH")).toBe("09/26");
  });

  it("returns the raw value when it is not a date", () => {
    expect(formatBucketLabel("nope", "DAY")).toBe("nope");
  });
});
