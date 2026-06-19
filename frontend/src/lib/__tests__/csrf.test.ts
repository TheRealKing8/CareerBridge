import { describe, expect, it } from "vitest";
import { csrfOk } from "@/lib/csrf";

describe("csrfOk", () => {
  const ORIGIN_URL = "http://localhost:3000";

  it("allows GET regardless of origin", () => {
    process.env.NEXTAUTH_URL = ORIGIN_URL;
    const req = new Request("http://x", { method: "GET" });
    expect(csrfOk(req)).toBe(true);
  });

  it("allows POST from matching origin", () => {
    process.env.NEXTAUTH_URL = ORIGIN_URL;
    const req = new Request("http://x", {
      method: "POST",
      headers: { origin: ORIGIN_URL },
    });
    expect(csrfOk(req)).toBe(true);
  });

  it("blocks POST from a different origin", () => {
    process.env.NEXTAUTH_URL = ORIGIN_URL;
    const req = new Request("http://x", {
      method: "POST",
      headers: { origin: "http://evil.example" },
    });
    expect(csrfOk(req)).toBe(false);
  });

  it("fails closed if NEXTAUTH_URL is unset", () => {
    const prev = process.env.NEXTAUTH_URL;
    delete process.env.NEXTAUTH_URL;
    try {
      const req = new Request("http://x", {
        method: "POST",
        headers: { origin: ORIGIN_URL },
      });
      expect(csrfOk(req)).toBe(false);
    } finally {
      process.env.NEXTAUTH_URL = prev;
    }
  });

  it("allows POST with no origin (server-side fetch)", () => {
    process.env.NEXTAUTH_URL = ORIGIN_URL;
    const req = new Request("http://x", { method: "POST" });
    expect(csrfOk(req)).toBe(true);
  });
});