import { describe, expect, it } from "vitest";

import { normalizeStoreSlug, validateStoreSlug } from "@/lib/storefront-host";

describe("storefront slug validation", () => {
  it("normalizes slugs", () => {
    expect(normalizeStoreSlug("  Jummy Stitches!! ")).toBe("jummy-stitches");
  });

  it.each(["mail", "api", "billing", "support", "contact"])("rejects %s", (slug) => {
    expect(validateStoreSlug(slug)).toContain("reserved");
  });

  it("rejects numbered reserved variants", () => {
    expect(validateStoreSlug("mail-2")).toContain("reserved");
  });

  it("allows ordinary store names", () => {
    expect(validateStoreSlug("jummy-stitches")).toBeNull();
  });
});
