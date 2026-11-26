import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { deleteAdminProduct, listAdminProducts, updateAdminProduct } from "@/lib/api/catalog";
import { API_BASE_URL } from "@/lib/api/config";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("admin catalog product API", () => {
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

  it("lists products for the selected store with filters", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        count: 1,
        next: null,
        previous: null,
        results: [{ id: "product-1", title: "Ankara jacket" }],
      }),
    );

    const list = await listAdminProducts("sartorial-hq", {
      search: "ankara",
      active: "active",
      page: 2,
      pageSize: 25,
    });

    expect(list.results[0]?.title).toBe("Ankara jacket");
    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe(
      `${API_BASE_URL}/admin/catalog/products/?page_size=25&page=2&search=ankara&is_active=true`,
    );
    expect((init as RequestInit | undefined)?.headers).toMatchObject({
      "x-tenant-slug": "sartorial-hq",
    });
  });

  it("updates and deletes a product", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ id: "product-1", is_active: false }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));

    const updated = await updateAdminProduct("product-1", { is_active: false }, "sartorial-hq");
    expect(updated.is_active).toBe(false);

    await deleteAdminProduct("product-1", "sartorial-hq");

    const [, patchInit] = fetchMock.mock.calls[0] ?? [];
    const [deleteUrl, deleteInit] = fetchMock.mock.calls[1] ?? [];
    expect((patchInit as RequestInit | undefined)?.method).toBe("PATCH");
    expect(deleteUrl).toBe(`${API_BASE_URL}/admin/catalog/products/product-1/`);
    expect((deleteInit as RequestInit | undefined)?.method).toBe("DELETE");
  });
});
