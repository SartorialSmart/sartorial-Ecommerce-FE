import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { API_BASE_URL } from "@/lib/api/config";
import {
  createAdminCoupon,
  deleteAdminCoupon,
  listAdminCoupons,
  updateAdminCoupon,
} from "@/lib/api/promotions";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(status === 204 ? null : JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("admin coupon API", () => {
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

  it("lists coupons with filters", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ count: 1, next: null, previous: null, results: [{ id: "coupon-1" }] }),
    );

    const list = await listAdminCoupons("sartorial-hq", {
      search: "welcome",
      active: "active",
      discountType: "percentage",
    });

    expect(list.results[0]?.id).toBe("coupon-1");
    const [url] = fetchMock.mock.calls[0] ?? [];
    expect(String(url)).toContain(`${API_BASE_URL}/admin/promotions/coupons/?`);
    expect(String(url)).toContain("search=welcome");
    expect(String(url)).toContain("is_active=true");
    expect(String(url)).toContain("discount_type=percentage");
  });

  it("creates, updates and deletes coupons", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ id: "coupon-1", code: "WELCOME10" }, 201))
      .mockResolvedValueOnce(jsonResponse({ id: "coupon-1", code: "WELCOME15" }))
      .mockResolvedValueOnce(jsonResponse(null, 204));

    const input = {
      code: "WELCOME10",
      discount_type: "percentage" as const,
      value: "10.00",
      min_spend: "0",
      category: null,
      is_active: true,
      valid_from: null,
      valid_until: null,
      first_order_only: false,
      stackable: true,
      max_uses: null,
    };
    await createAdminCoupon(input, "sartorial-hq");
    await updateAdminCoupon("coupon-1", { is_active: false }, "sartorial-hq");
    await deleteAdminCoupon("coupon-1", "sartorial-hq");

    const [createUrl, createInit] = fetchMock.mock.calls[0] ?? [];
    const [updateUrl, updateInit] = fetchMock.mock.calls[1] ?? [];
    const [deleteUrl, deleteInit] = fetchMock.mock.calls[2] ?? [];
    expect(createUrl).toBe(`${API_BASE_URL}/admin/promotions/coupons/`);
    expect((createInit as RequestInit | undefined)?.method).toBe("POST");
    expect(JSON.parse(String((createInit as RequestInit | undefined)?.body))).toEqual(input);
    expect(updateUrl).toBe(`${API_BASE_URL}/admin/promotions/coupons/coupon-1/`);
    expect((updateInit as RequestInit | undefined)?.method).toBe("PATCH");
    expect(JSON.parse(String((updateInit as RequestInit | undefined)?.body))).toEqual({
      is_active: false,
    });
    expect(deleteUrl).toBe(`${API_BASE_URL}/admin/promotions/coupons/coupon-1/`);
    expect((deleteInit as RequestInit | undefined)?.method).toBe("DELETE");
  });
});
