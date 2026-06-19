import { describe, expect, it } from "vitest";
import { consume, clientKey } from "@/lib/rate-limit";

describe("rate-limit consume", () => {
  it("allows up to capacity within the window", () => {
    const opts = { capacity: 3, refillPerWindow: 3, windowMs: 1000 };
    const key = `test:${Math.random()}`;
    expect(consume(key, opts).ok).toBe(true);
    expect(consume(key, opts).ok).toBe(true);
    expect(consume(key, opts).ok).toBe(true);
    const r = consume(key, opts);
    expect(r.ok).toBe(false);
    expect(r.remaining).toBe(0);
  });

  it("refills over time", async () => {
    const opts = { capacity: 1, refillPerWindow: 1, windowMs: 50 };
    const key = `test:${Math.random()}`;
    expect(consume(key, opts).ok).toBe(true);
    expect(consume(key, opts).ok).toBe(false);
    await new Promise((r) => setTimeout(r, 70));
    expect(consume(key, opts).ok).toBe(true);
  });

  it("isolates buckets by key", () => {
    const opts = { capacity: 1, refillPerWindow: 1, windowMs: 1000 };
    const a = `test:${Math.random()}`;
    const b = `test:${Math.random()}`;
    expect(consume(a, opts).ok).toBe(true);
    expect(consume(b, opts).ok).toBe(true);
  });
});

describe("clientKey", () => {
  it("extracts the first x-forwarded-for entry", () => {
    const req = new Request("http://x", {
      headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
    });
    expect(clientKey(req)).toBe("1.2.3.4");
  });

  it("falls back to x-real-ip", () => {
    const req = new Request("http://x", { headers: { "x-real-ip": "9.9.9.9" } });
    expect(clientKey(req)).toBe("9.9.9.9");
  });

  it("returns 'unknown' if neither is set", () => {
    const req = new Request("http://x");
    expect(clientKey(req)).toBe("unknown");
  });
});