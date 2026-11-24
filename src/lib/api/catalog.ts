import { apiRequest } from "./client";
import type { Category, CreateSimpleProductInput, CreatedProduct, TenantStore } from "./types";

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

export async function listCategories(tenantSlug: string | null): Promise<Category[]> {
  const data = await apiRequest<Category[] | { results?: Category[] } | null>(
    "/catalog/categories/",
    { tenantSlug },
  );
  return unwrapResults(data);
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
