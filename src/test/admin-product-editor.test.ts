import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { API_BASE_URL } from "@/lib/api/config";
import {
  createAdminOptionType,
  createAdminProductImage,
  generateAdminVariants,
  listAdminOptionValues,
  listAdminProductImages,
  updateAdminVariant,
} from "@/lib/api/catalog";
import { listAdminVariants } from "@/lib/api/inventory";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("admin product editor API", () => {
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

  it("loads variants and images for one product", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse([{ id: "variant-1", sku: "SKU-1" }]))
      .mockResolvedValueOnce(jsonResponse([{ id: "image-1", is_primary: true }]));

    const variants = await listAdminVariants("sartorial-hq", "product-1");
    const images = await listAdminProductImages("sartorial-hq", "product-1");

    expect(variants[0]?.sku).toBe("SKU-1");
    expect(images[0]?.is_primary).toBe(true);
    const [variantUrl] = fetchMock.mock.calls[0] ?? [];
    const [imageUrl] = fetchMock.mock.calls[1] ?? [];
    expect(variantUrl).toBe(
      `${API_BASE_URL}/admin/catalog/variants/?page_size=100&product=product-1`,
    );
    expect(imageUrl).toBe(`${API_BASE_URL}/admin/catalog/images/?product=product-1`);
  });

  it("updates variants and generates new ones", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ id: "variant-1", price: "150.00" }))
      .mockResolvedValueOnce(jsonResponse([{ id: "variant-2", sku: "SKU-002" }]));

    await updateAdminVariant("variant-1", { price: "150.00", is_active: true }, "sartorial-hq");
    await generateAdminVariants(
      "product-1",
      { default_price: "150.00", sku_prefix: "SKU" },
      "sartorial-hq",
    );

    const [patchUrl, patchInit] = fetchMock.mock.calls[0] ?? [];
    const [generateUrl, generateInit] = fetchMock.mock.calls[1] ?? [];
    expect(patchUrl).toBe(`${API_BASE_URL}/admin/catalog/variants/variant-1/`);
    expect((patchInit as RequestInit | undefined)?.method).toBe("PATCH");
    expect(JSON.parse(String((patchInit as RequestInit | undefined)?.body))).toEqual({
      price: "150.00",
      is_active: true,
    });
    expect(generateUrl).toBe(`${API_BASE_URL}/admin/catalog/products/product-1/generate-variants/`);
    expect(JSON.parse(String((generateInit as RequestInit | undefined)?.body))).toEqual({
      default_price: "150.00",
      sku_prefix: "SKU",
    });
  });

  it("creates option and image records under the right product", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ id: "option-type-1", name: "Size" }))
      .mockResolvedValueOnce(jsonResponse([{ id: "option-value-1", value: "M" }]))
      .mockResolvedValueOnce(jsonResponse({ id: "image-1", is_primary: true }));

    await createAdminOptionType(
      { product: "product-1", name: "Size", position: 0 },
      "sartorial-hq",
    );
    await listAdminOptionValues("sartorial-hq", "option-type-1");
    await createAdminProductImage(
      "product-1",
      { public_id: "catalog/example", is_primary: true },
      "sartorial-hq",
    );

    const [typeUrl, typeInit] = fetchMock.mock.calls[0] ?? [];
    const [valueUrl] = fetchMock.mock.calls[1] ?? [];
    const [imageUrl, imageInit] = fetchMock.mock.calls[2] ?? [];
    expect(typeUrl).toBe(`${API_BASE_URL}/admin/catalog/option-types/`);
    expect((typeInit as RequestInit | undefined)?.method).toBe("POST");
    expect(valueUrl).toBe(`${API_BASE_URL}/admin/catalog/option-values/?option_type=option-type-1`);
    expect(imageUrl).toBe(`${API_BASE_URL}/admin/catalog/products/product-1/images/`);
    expect((imageInit as RequestInit | undefined)?.method).toBe("POST");
    expect(JSON.parse(String((imageInit as RequestInit | undefined)?.body))).toEqual({
      public_id: "catalog/example",
      is_primary: true,
    });
  });
});
