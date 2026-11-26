import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getSalesReport } from "@/lib/api/analytics";
import { API_BASE_URL } from "@/lib/api/config";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("getSalesReport", () => {
  const report = {
    summary: {
      currency: "NGN",
      from: "2026-10-28",
      to: "2026-11-26",
      orders: 2,
      paid_orders: 1,
      gross: "1000.00",
      discounts: "100.00",
      vat: "90.00",
      net: "990.00",
      revenue: "990.00",
      refunds: "0.00",
      avg_order_value: "990.00",
    },
    by_day: [],
    by_status: [],
    top_products: [],
    invoices: [],
  };
  const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) =>
    jsonResponse(report),
  );

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockClear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("passes date filters and tenant slug", async () => {
    const data = await getSalesReport("sartorial-hq", {
      from: "2026-10-28",
      to: "2026-11-26",
      status: "paid",
    });
    expect(data.summary.vat).toBe("90.00");
    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe(
      `${API_BASE_URL}/admin/sales-report/?from=2026-10-28&to=2026-11-26&status=paid`,
    );
    expect(init?.headers).toMatchObject({ "x-tenant-slug": "sartorial-hq" });
  });

  it("omits empty filters", async () => {
    await getSalesReport("sartorial-hq");
    const [url] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe(`${API_BASE_URL}/admin/sales-report/`);
  });
});
