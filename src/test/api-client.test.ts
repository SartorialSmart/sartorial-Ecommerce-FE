import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { apiRequest } from "@/lib/api/client";
import { TENANT_SLUG } from "@/lib/api/config";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("apiRequest tenant slug header", () => {
  const fetchMock = vi.fn(async () => jsonResponse({ ok: true }));

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockClear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends the build-time slug by default", async () => {
    await apiRequest("/ping/", { auth: false });
    const headers = fetchMock.mock.calls[0]?.[1]?.headers as Record<string, string>;
    if (TENANT_SLUG) {
      expect(headers["x-tenant-slug"]).toBe(TENANT_SLUG);
    } else {
      expect(headers["x-tenant-slug"]).toBeUndefined();
    }
  });

  it("omits the header entirely when tenantSlug is null", async () => {
    await apiRequest("/ping/", { auth: false, tenantSlug: null });
    const headers = fetchMock.mock.calls[0]?.[1]?.headers as Record<string, string>;
    expect(headers["x-tenant-slug"]).toBeUndefined();
  });

  it("overrides the slug when tenantSlug is provided", async () => {
    await apiRequest("/ping/", { auth: false, tenantSlug: "adaeze-fabrics" });
    const headers = fetchMock.mock.calls[0]?.[1]?.headers as Record<string, string>;
    expect(headers["x-tenant-slug"]).toBe("adaeze-fabrics");
  });
});
