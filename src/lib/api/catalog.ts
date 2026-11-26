import { apiRequest } from "./client";
import type { AdminVariant } from "./inventory";
import type {
  AdminProduct,
  AdminProductList,
  AdminProductPatch,
  Category,
  CreateSimpleProductInput,
  CreatedProduct,
  TenantStore,
} from "./types";

function unwrapResults<T>(data: T[] | { results?: T[] } | null): T[] {
  if (Array.isArray(data)) return data;
  return data?.results ?? [];
}

export async function listMyStores(): Promise<TenantStore[]> {
  const data = await apiRequest<TenantStore[] | { results?: TenantStore[] }>("/admin/my-stores/", {
    tenantSlug: null,
  });
  return unwrapResults(data);
}

export interface PublicProduct {
  id: string;
  title: string;
  price_from: string | null;
  primary_image: string | null;
  stock_available: number;
}

export async function listPublicProducts(tenantSlug: string): Promise<PublicProduct[]> {
  const data = await apiRequest<PublicProduct[] | { results?: PublicProduct[] } | null>(
    "/catalog/products/",
    { tenantSlug, auth: false },
  );
  return unwrapResults(data);
}

export async function listCategories(tenantSlug: string | null): Promise<Category[]> {
  const data = await apiRequest<Category[] | { results?: Category[] } | null>(
    "/catalog/categories/",
    { tenantSlug },
  );
  return unwrapResults(data);
}

export interface AdminProductQuery {
  search?: string;
  active?: "all" | "active" | "inactive";
  page?: number;
  pageSize?: number;
}

export async function listAdminProducts(
  tenantSlug: string | null,
  query: AdminProductQuery = {},
): Promise<AdminProductList> {
  const params = new URLSearchParams({ page_size: String(query.pageSize ?? 50) });
  if (query.page && query.page > 1) params.set("page", String(query.page));
  if (query.search?.trim()) params.set("search", query.search.trim());
  if (query.active && query.active !== "all") {
    params.set("is_active", query.active === "active" ? "true" : "false");
  }
  const data = await apiRequest<AdminProductList | AdminProduct[] | null>(
    `/admin/catalog/products/?${params.toString()}`,
    { tenantSlug },
  );
  if (Array.isArray(data)) {
    return { count: data.length, next: null, previous: null, results: data };
  }
  return {
    count: data?.count ?? data?.results?.length ?? 0,
    next: data?.next ?? null,
    previous: data?.previous ?? null,
    results: data?.results ?? [],
  };
}

export async function updateAdminProduct(
  productId: string,
  patch: AdminProductPatch,
  tenantSlug: string | null,
): Promise<AdminProduct> {
  return apiRequest<AdminProduct>(`/admin/catalog/products/${productId}/`, {
    method: "PATCH",
    tenantSlug,
    body: patch,
  });
}

export async function deleteAdminProduct(
  productId: string,
  tenantSlug: string | null,
): Promise<void> {
  await apiRequest<void>(`/admin/catalog/products/${productId}/`, {
    method: "DELETE",
    tenantSlug,
  });
}

export interface AdminProductImage {
  id: string;
  alt_text: string;
  position: number;
  is_primary: boolean;
  variant: string | null;
  urls: Record<string, string>;
}

export interface AdminOptionType {
  id: string;
  product: string;
  name: string;
  position: number;
}

export interface AdminOptionValue {
  id: string;
  option_type: string;
  value: string;
  position: number;
}

export interface AdminUploadSignature {
  signature: string;
  timestamp: number;
  api_key: string;
  cloud_name: string;
  folder: string;
}

export type AdminVariantPatch = Partial<
  Pick<
    AdminVariant,
    "sku" | "price" | "cost_price" | "moq" | "is_active" | "weight_grams" | "barcode"
  >
>;

function querySuffix(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

export async function updateAdminVariant(
  variantId: string,
  patch: AdminVariantPatch,
  tenantSlug: string | null,
): Promise<AdminVariant> {
  return apiRequest<AdminVariant>(`/admin/catalog/variants/${variantId}/`, {
    method: "PATCH",
    tenantSlug,
    body: patch,
  });
}

export async function listAdminProductImages(
  tenantSlug: string | null,
  productId: string,
): Promise<AdminProductImage[]> {
  const data = await apiRequest<AdminProductImage[] | { results?: AdminProductImage[] } | null>(
    `/admin/catalog/images/${querySuffix({ product: productId })}`,
    { tenantSlug },
  );
  return unwrapResults(data);
}

export async function createAdminProductImage(
  productId: string,
  input: {
    public_id: string;
    variant?: string | null;
    alt_text?: string;
    position?: number;
    is_primary?: boolean;
  },
  tenantSlug: string | null,
): Promise<AdminProductImage> {
  return apiRequest<AdminProductImage>(`/admin/catalog/products/${productId}/images/`, {
    method: "POST",
    tenantSlug,
    body: input,
  });
}

export async function makeAdminProductImagePrimary(
  imageId: string,
  tenantSlug: string | null,
): Promise<AdminProductImage> {
  return apiRequest<AdminProductImage>(`/admin/catalog/images/${imageId}/make-primary/`, {
    method: "POST",
    tenantSlug,
  });
}

export async function deleteAdminProductImage(
  imageId: string,
  tenantSlug: string | null,
): Promise<void> {
  await apiRequest<void>(`/admin/catalog/images/${imageId}/`, {
    method: "DELETE",
    tenantSlug,
  });
}

export async function getAdminUploadSignature(
  tenantSlug: string | null,
): Promise<AdminUploadSignature> {
  return apiRequest<AdminUploadSignature>("/admin/catalog/products/upload-signature/", {
    method: "POST",
    tenantSlug,
  });
}

export async function listAdminOptionTypes(
  tenantSlug: string | null,
  productId: string,
): Promise<AdminOptionType[]> {
  const data = await apiRequest<AdminOptionType[] | { results?: AdminOptionType[] } | null>(
    `/admin/catalog/option-types/${querySuffix({ product: productId })}`,
    { tenantSlug },
  );
  return unwrapResults(data);
}

export async function createAdminOptionType(
  input: { product: string; name: string; position: number },
  tenantSlug: string | null,
): Promise<AdminOptionType> {
  return apiRequest<AdminOptionType>("/admin/catalog/option-types/", {
    method: "POST",
    tenantSlug,
    body: input,
  });
}

export async function listAdminOptionValues(
  tenantSlug: string | null,
  optionTypeId: string,
): Promise<AdminOptionValue[]> {
  const data = await apiRequest<AdminOptionValue[] | { results?: AdminOptionValue[] } | null>(
    `/admin/catalog/option-values/${querySuffix({ option_type: optionTypeId })}`,
    { tenantSlug },
  );
  return unwrapResults(data);
}

export async function createAdminOptionValue(
  input: { option_type: string; value: string; position: number },
  tenantSlug: string | null,
): Promise<AdminOptionValue> {
  return apiRequest<AdminOptionValue>("/admin/catalog/option-values/", {
    method: "POST",
    tenantSlug,
    body: input,
  });
}

export async function generateAdminVariants(
  productId: string,
  input: { default_price: string; sku_prefix?: string | undefined },
  tenantSlug: string | null,
): Promise<AdminVariant[]> {
  return apiRequest<AdminVariant[]>(`/admin/catalog/products/${productId}/generate-variants/`, {
    method: "POST",
    tenantSlug,
    body: input,
  });
}

export async function createSimpleProduct(
  input: CreateSimpleProductInput,
  tenantSlug: string | null,
): Promise<CreatedProduct> {
  return apiRequest<CreatedProduct>("/admin/catalog/products/create-full/", {
    method: "POST",
    tenantSlug,
    body: {
      kind: "simple",
      title: input.title.trim(),
      description: input.description?.trim() ?? "",
      category: input.categoryId ?? null,
      new_category: input.newCategory?.trim() ?? "",
      fulfillment_type: "internal",
      is_active: true,
      sku: input.sku.trim(),
      price: input.price,
      stock: input.stock,
    },
  });
}
