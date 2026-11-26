import { apiRequest } from "./client";
import type { Category } from "./types";

export type AdminCouponDiscountType = "percentage" | "fixed";

export interface AdminCoupon {
  id: string;
  code: string;
  description: string;
  discount_type: AdminCouponDiscountType;
  value: string;
  is_active: boolean;
  valid_from: string | null;
  valid_until: string | null;
  min_spend: string;
  category: string | null;
  first_order_only: boolean;
  stackable: boolean;
  max_uses: number | null;
  used_count: number;
}

export interface AdminCouponList {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminCoupon[];
}

export interface AdminCouponInput {
  code: string;
  description?: string;
  discount_type: AdminCouponDiscountType;
  value: string;
  is_active?: boolean;
  valid_from?: string | null;
  valid_until?: string | null;
  min_spend?: string;
  category?: string | null;
  first_order_only?: boolean;
  stackable?: boolean;
  max_uses?: number | null;
}

export interface AdminCouponQuery {
  search?: string;
  active?: "all" | "active" | "inactive";
  discountType?: "all" | AdminCouponDiscountType;
  page?: number;
  pageSize?: number;
}

function unwrapResults<T>(data: T[] | { results?: T[] } | null): T[] {
  if (Array.isArray(data)) return data;
  return data?.results ?? [];
}

export async function listAdminCoupons(
  tenantSlug: string | null,
  query: AdminCouponQuery = {},
): Promise<AdminCouponList> {
  const params = new URLSearchParams({ page_size: String(query.pageSize ?? 100) });
  if (query.page && query.page > 1) params.set("page", String(query.page));
  if (query.search?.trim()) params.set("search", query.search.trim());
  if (query.active && query.active !== "all") {
    params.set("is_active", query.active === "active" ? "true" : "false");
  }
  if (query.discountType && query.discountType !== "all") {
    params.set("discount_type", query.discountType);
  }
  const data = await apiRequest<AdminCouponList | AdminCoupon[] | null>(
    `/admin/promotions/coupons/?${params.toString()}`,
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

export async function createAdminCoupon(
  input: AdminCouponInput,
  tenantSlug: string | null,
): Promise<AdminCoupon> {
  return apiRequest<AdminCoupon>("/admin/promotions/coupons/", {
    method: "POST",
    tenantSlug,
    body: input,
  });
}

export async function updateAdminCoupon(
  couponId: string,
  patch: Partial<AdminCouponInput>,
  tenantSlug: string | null,
): Promise<AdminCoupon> {
  return apiRequest<AdminCoupon>(`/admin/promotions/coupons/${couponId}/`, {
    method: "PATCH",
    tenantSlug,
    body: patch,
  });
}

export async function deleteAdminCoupon(
  couponId: string,
  tenantSlug: string | null,
): Promise<void> {
  await apiRequest<void>(`/admin/promotions/coupons/${couponId}/`, {
    method: "DELETE",
    tenantSlug,
  });
}

export async function listCouponCategories(tenantSlug: string | null): Promise<Category[]> {
  const data = await apiRequest<Category[] | { results?: Category[] } | null>(
    "/catalog/categories/",
    { tenantSlug },
  );
  return unwrapResults(data);
}
