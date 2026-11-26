import { apiRequest } from "./client";

export interface AdminVariantOption {
  type: string;
  value: string;
}

export interface AdminVariant {
  id: string;
  product: string;
  sku: string;
  price: string;
  cost_price: string | null;
  moq: number;
  price_tiers: unknown;
  is_active: boolean;
  is_default: boolean;
  weight_grams: number | null;
  barcode: string;
  fulfillment_type: string;
  options_key: string;
  options: AdminVariantOption[];
}

export interface AdminStockItem {
  id: number;
  variant: string;
  sku: string;
  warehouse: number;
  warehouse_code: string;
  on_hand: number;
  reserved: number;
  available: number;
}

export interface SetAdminStockInput {
  variant: string;
  quantity: number;
  warehouse_code?: string;
}

function unwrapResults<T>(data: T[] | { results?: T[] } | null): T[] {
  if (Array.isArray(data)) return data;
  return data?.results ?? [];
}

export async function listAdminVariants(
  tenantSlug: string | null,
  productId?: string | undefined,
): Promise<AdminVariant[]> {
  const params = new URLSearchParams({ page_size: "100" });
  if (productId) params.set("product", productId);
  const data = await apiRequest<AdminVariant[] | { results?: AdminVariant[] } | null>(
    `/admin/catalog/variants/?${params.toString()}`,
    { tenantSlug },
  );
  return unwrapResults(data);
}

export async function listAdminStock(
  tenantSlug: string | null,
  options: { search?: string | undefined; lowStock?: boolean | undefined } = {},
): Promise<AdminStockItem[]> {
  const params = new URLSearchParams();
  if (options.search?.trim()) params.set("search", options.search.trim());
  if (options.lowStock) params.set("low_stock", "true");
  const query = params.toString();
  const suffix = query ? `?${query}` : "";
  const data = await apiRequest<AdminStockItem[] | { results?: AdminStockItem[] } | null>(
    `/admin/inventory/stock/${suffix}`,
    { tenantSlug },
  );
  return unwrapResults(data);
}

export async function setAdminStock(
  input: SetAdminStockInput,
  tenantSlug: string | null,
): Promise<AdminStockItem> {
  return apiRequest<AdminStockItem>("/admin/inventory/stock/", {
    method: "POST",
    tenantSlug,
    body: input,
  });
}
