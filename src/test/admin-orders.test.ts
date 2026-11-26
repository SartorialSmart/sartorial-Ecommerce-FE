import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { API_BASE_URL } from "@/lib/api/config";
import {
  listAdminOrderInquiries,
  listAdminOrdersPage,
  markAdminOrderShipped,
  refundAdminOrder,
  transitionAdminOrder,
} from "@/lib/api/orders";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("admin order API", () => {
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

  it("lists an orders page with filters for the selected store", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        count: 1,
        next: null,
        previous: null,
        results: [{ id: "order-1", number: "ORD-1001" }],
      }),
    );

    const page = await listAdminOrdersPage("sartorial-hq", {
      page: 2,
      page_size: 50,
      search: "ORD-1001",
      status: "paid",
    });

    expect(page.results[0]?.number).toBe("ORD-1001");
    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe(
      `${API_BASE_URL}/admin/orders/?page=2&page_size=50&search=ORD-1001&status=paid`,
    );
    expect((init as RequestInit | undefined)?.headers).toMatchObject({
      "x-tenant-slug": "sartorial-hq",
    });
  });

  it("posts transitions, shipments and refunds", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ number: "ORD-1001", status: "routing" }))
      .mockResolvedValueOnce(jsonResponse({ number: "ORD-1001" }))
      .mockResolvedValueOnce(jsonResponse({ number: "ORD-1001", status: "refunded" }));

    await transitionAdminOrder("ORD-1001", "routing", "sartorial-hq");
    await markAdminOrderShipped(
      "ORD-1001",
      { carrier: "DHL", tracking_number: "TRACK-42" },
      "sartorial-hq",
    );
    await refundAdminOrder("ORD-1001", "sartorial-hq");

    const [transitionUrl, transitionInit] = fetchMock.mock.calls[0] ?? [];
    const [shipmentUrl, shipmentInit] = fetchMock.mock.calls[1] ?? [];
    const [refundUrl, refundInit] = fetchMock.mock.calls[2] ?? [];

    expect(transitionUrl).toBe(`${API_BASE_URL}/admin/orders/ORD-1001/transition/`);
    expect((transitionInit as RequestInit | undefined)?.method).toBe("POST");
    expect(JSON.parse(String((transitionInit as RequestInit | undefined)?.body))).toEqual({
      status: "routing",
    });

    expect(shipmentUrl).toBe(`${API_BASE_URL}/admin/orders/ORD-1001/mark-shipped/`);
    expect(JSON.parse(String((shipmentInit as RequestInit | undefined)?.body))).toEqual({
      carrier: "DHL",
      tracking_number: "TRACK-42",
    });

    expect(refundUrl).toBe(`${API_BASE_URL}/admin/orders/ORD-1001/refund/`);
    expect((refundInit as RequestInit | undefined)?.method).toBe("POST");
  });

  it("lists order inquiries for the selected store", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse([
        {
          id: "inquiry-1",
          channel: "whatsapp",
          context: "order_status",
          customer_name: "Ada",
          customer_phone: "+2348012345678",
          note: "Where is my order?",
          summary: "Order status request",
          delivered_to_ops: true,
          created_at: "2026-11-26T10:00:00Z",
        },
      ]),
    );

    const inquiries = await listAdminOrderInquiries("sartorial-hq");

    expect(inquiries[0]?.customer_name).toBe("Ada");
    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe(`${API_BASE_URL}/admin/order-inquiries/`);
    expect((init as RequestInit | undefined)?.headers).toMatchObject({
      "x-tenant-slug": "sartorial-hq",
    });
  });
});
