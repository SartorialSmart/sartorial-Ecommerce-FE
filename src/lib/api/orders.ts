import { apiRequest } from "./client";

export interface AdminOrderLine {
  id: string;
  sku: string;
  title: string;
  quantity: number;
  unit_price_base: string;
  line_total_base: string;
  unit_price_charged: string;
  line_total_charged: string;
  fulfillment_type: string;
  image: string | null;
  variant_options: string;
  product_deleted: boolean;
}

export interface AdminOrder {
  id: string;
  number: string;
  status: string;
  currency: string;
  base_currency: string;
  total_base: string;
  total_charged: string;
  contact_email: string;
  contact_name: string;
  payer_email: string;
  payer_name: string;
  paid_by_label: string;
  paid_at: string | null;
  created_at: string;
  lines: AdminOrderLine[];
}

function unwrapResults<T>(data: T[] | { results?: T[] } | null): T[] {
  if (Array.isArray(data)) return data;
  return data?.results ?? [];
}

export async function listAdminOrders(
  tenantSlug: string | null,
  params: Record<string, string | number | undefined> = {},
): Promise<AdminOrder[]> {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") search.set(k, String(v));
  }
  const qs = search.toString();
  const data = await apiRequest<AdminOrder[] | { results?: AdminOrder[] }>(
    `/admin/orders/${qs ? `?${qs}` : ""}`,
    { tenantSlug },
  );
  return unwrapResults(data);
}
