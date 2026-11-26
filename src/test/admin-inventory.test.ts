import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { API_BASE_URL } from "@/lib/api/config";
import { listAdminStock, listAdminVariants, setAdminStock } from "@/lib/api/inventory";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("admin inventory API", () => {
  const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) =>
    jsonResponse({}),
  );

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockClear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("lists variants and stock for the selected store", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse([{ id: "variant-1", sku: "SKU-1" }]))
      .mockResolvedValueOnce(jsonResponse([{ id: 1, variant: "variant-1", on_hand: 3 }]));

    const variants = await listAdminVariants("sartorial-hq");
    const stock = await listAdminStock("sartorial-hq", { search: "SKU-1" });

    expect(variants[0]?.sku).toBe("SKU-1");
    expect(stock[0]?.on_hand).toBe(3);

    const [variantUrl, variantInit] = fetchMock.mock.calls[0] ?? [];
    const [stockUrl, stockInit] = fetchMock.mock.calls[1] ?? [];
    expect(variantUrl).toBe(`${API_BASE_URL}/admin/catalog/variants/?page_size=100`);
    expect(stockUrl).toBe(`${API_BASE_URL}/admin/inventory/stock/?search=SKU-1`);
    expect((variantInit as RequestInit | undefined)?.headers).toMatchObject({
      "x-tenant-slug": "sartorial-hq",
    });
    expect((stockInit as RequestInit | undefined)?.headers).toMatchObject({
      "x-tenant-slug": "sartorial-hq",
    });
  });

  it("sets stock with the tenant header", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ id: 1, variant: "variant-1", on_hand: 12, available: 12 }),
    );

    const item = await setAdminStock(
      { variant: "variant-1", quantity: 12, warehouse_code: "main" },
      "sartorial-hq",
    );

    expect(item.available).toBe(12);
    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe(`${API_BASE_URL}/admin/inventory/stock/`);
    expect((init as RequestInit | undefined)?.method).toBe("POST");
    expect((init as RequestInit | undefined)?.headers).toMatchObject({
      "x-tenant-slug": "sartorial-hq",
    });
    expect(JSON.parse(String((init as RequestInit | undefined)?.body))).toEqual({
      variant: "variant-1",
      quantity: 12,
      warehouse_code: "main",
    });
  });
});
