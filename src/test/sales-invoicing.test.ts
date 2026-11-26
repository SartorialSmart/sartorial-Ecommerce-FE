import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { API_BASE_URL } from "@/lib/api/config";
import { clearTokens, setTokens } from "@/lib/api/client";
import { getErpLinkStatus, linkErpAccount, regenerateErpKey } from "@/lib/api/erp-link";
import {
  createAdminInvoice,
  downloadAdminInvoicePdf,
  listAdminInvoices,
  sendAdminInvoice,
} from "@/lib/api/invoices";
import { uploadStoreLogo } from "@/lib/api/logos";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("sales, invoicing and ERP link APIs", () => {
  const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) =>
    jsonResponse({}),
  );

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    window.localStorage.clear();
  });

  it("creates and sends invoices for the selected store", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse([{ id: "inv-1", number: "INV-1" }]))
      .mockResolvedValueOnce(jsonResponse({ id: "inv-2", number: "INV-2" }))
      .mockResolvedValueOnce(jsonResponse({ delivered: true, to: "buyer@example.com" }));

    const listed = await listAdminInvoices("sartorial-hq");
    const created = await createAdminInvoice(
      { order: "order-1", customer_logo_url: "https://cdn.example/logo.png" },
      "sartorial-hq",
    );
    const sent = await sendAdminInvoice("inv-2", { to: "buyer@example.com" }, "sartorial-hq");

    expect(listed[0]?.number).toBe("INV-1");
    expect(created.number).toBe("INV-2");
    expect(sent.delivered).toBe(true);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(`${API_BASE_URL}/admin/invoices/`);
    expect((fetchMock.mock.calls[1]?.[1] as RequestInit | undefined)?.method).toBe("POST");
    expect(fetchMock.mock.calls[2]?.[0]).toBe(`${API_BASE_URL}/admin/invoices/inv-2/send/`);
    expect((fetchMock.mock.calls[0]?.[1] as RequestInit | undefined)?.headers).toMatchObject({
      "x-tenant-slug": "sartorial-hq",
    });
  });

  it("downloads the invoice PDF with the access token", async () => {
    setTokens({ access: "access-token" });
    const createObjectURL = vi.fn(() => "blob:invoice");
    const revokeObjectURL = vi.fn();
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    vi.stubGlobal("URL", { ...URL, createObjectURL, revokeObjectURL });
    fetchMock.mockResolvedValueOnce(new Response(new Blob(["%PDF"]), { status: 200 }));

    await downloadAdminInvoicePdf("inv-1", "sartorial-hq");

    expect(fetchMock.mock.calls[0]?.[0]).toBe(`${API_BASE_URL}/admin/invoices/inv-1/pdf/`);
    expect((fetchMock.mock.calls[0]?.[1] as RequestInit | undefined)?.headers).toMatchObject({
      authorization: "Bearer access-token",
      "x-tenant-slug": "sartorial-hq",
    });
    expect(createObjectURL).toHaveBeenCalledOnce();
    expect(click).toHaveBeenCalledOnce();
    expect(revokeObjectURL).toHaveBeenCalledOnce();
    click.mockRestore();
    clearTokens();
  });

  it("links an ERP account and regenerates the sync key", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ linked: false }))
      .mockResolvedValueOnce(jsonResponse({ linked: true, api_key: "sk_new" }))
      .mockResolvedValueOnce(jsonResponse({ linked: true, api_key: "sk_rotated" }));

    const before = await getErpLinkStatus("sartorial-hq");
    const linked = await linkErpAccount({ erp_business_id: "ERP-42" }, "sartorial-hq");
    const rotated = await regenerateErpKey("sartorial-hq");

    expect(before.linked).toBe(false);
    expect(linked.api_key).toBe("sk_new");
    expect(rotated.api_key).toBe("sk_rotated");
    expect(fetchMock.mock.calls[1]?.[0]).toBe(`${API_BASE_URL}/admin/erp-link/`);
    expect(fetchMock.mock.calls[2]?.[0]).toBe(`${API_BASE_URL}/admin/erp-link/key/`);
  });

  it("uploads a store logo through Cloudinary", async () => {
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({
          signature: "sig",
          timestamp: 123,
          api_key: "key",
          cloud_name: "cloud",
          folder: "sartorial/logos",
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          public_id: "sartorial/logos/store",
          secure_url: "https://cdn.example/store.png",
        }),
      );

    const uploaded = await uploadStoreLogo(new File(["logo"], "logo.png", { type: "image/png" }));

    expect(uploaded).toEqual({
      publicId: "sartorial/logos/store",
      url: "https://cdn.example/store.png",
    });
    expect(fetchMock.mock.calls[0]?.[0]).toBe(`${API_BASE_URL}/logos/upload-signature/`);
    expect(String(fetchMock.mock.calls[1]?.[0])).toContain(
      "https://api.cloudinary.com/v1_1/cloud/image/upload",
    );
  });
});
