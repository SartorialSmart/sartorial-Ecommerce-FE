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

export interface AdminShipment {
  kind: string;
  status: string;
  tracking_number: string;
  carrier: string;
}

export interface AdminOrder {
  id: string;
  number: string;
  status: string;
  currency: string;
  base_currency: string;
  fx_rate_locked: string;
  subtotal_base: string;
  discount_base: string;
  total_base: string;
  subtotal_charged: string;
  discount_charged: string;
  total_charged: string;
  contact_email: string;
  contact_name: string;
  payer_email: string;
  payer_name: string;
  paid_by_label: string;
  ship_name: string;
  ship_line1: string;
  ship_line2: string;
  ship_city: string;
  ship_region: string;
  ship_postal_code: string;
  ship_country: string;
  coupon_codes: string[];
  paid_at: string | null;
  created_at: string;
  lines: AdminOrderLine[];
  shipments: AdminShipment[];
}

export interface AdminOrderInquiry {
  id: string;
  channel: string;
  context: string;
  customer_name: string;
  customer_phone: string;
  note: string;
  summary: string;
  delivered_to_ops: boolean;
  created_at: string;
}

export interface AdminOrderPage {
  count: number;
  next: string | null;
  results: AdminOrder[];
}

type OrderParams = Record<string, string | number | undefined>;

function querySuffix(params: OrderParams): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

function unwrapResults<T>(data: T[] | { results?: T[] } | null): T[] {
  if (Array.isArray(data)) return data;
  return data?.results ?? [];
}

export async function listAdminOrders(
  tenantSlug: string | null,
  params: OrderParams = {},
): Promise<AdminOrder[]> {
  const data = await apiRequest<AdminOrder[] | { results?: AdminOrder[] }>(
    `/admin/orders/${querySuffix(params)}`,
    { tenantSlug },
  );
  return unwrapResults(data);
}

export async function listAdminOrdersPage(
  tenantSlug: string | null,
  params: OrderParams = {},
): Promise<AdminOrderPage> {
  const data = await apiRequest<AdminOrderPage | AdminOrder[]>(
    `/admin/orders/${querySuffix(params)}`,
    {
      tenantSlug,
    },
  );
  if (Array.isArray(data)) return { count: data.length, next: null, results: data };
  return { count: data.count ?? 0, next: data.next ?? null, results: data.results ?? [] };
}

export async function getAdminOrder(
  number: string,
  tenantSlug: string | null,
): Promise<AdminOrder> {
  return apiRequest<AdminOrder>(`/admin/orders/${encodeURIComponent(number)}/`, { tenantSlug });
}

export async function transitionAdminOrder(
  number: string,
  status: string,
  tenantSlug: string | null,
): Promise<AdminOrder> {
  return apiRequest<AdminOrder>(`/admin/orders/${encodeURIComponent(number)}/transition/`, {
    method: "POST",
    tenantSlug,
    body: { status },
  });
}

export async function markAdminOrderShipped(
  number: string,
  shipment: { tracking_number: string; carrier: string },
  tenantSlug: string | null,
): Promise<AdminOrder> {
  return apiRequest<AdminOrder>(`/admin/orders/${encodeURIComponent(number)}/mark-shipped/`, {
    method: "POST",
    tenantSlug,
    body: shipment,
  });
}

export async function refundAdminOrder(
  number: string,
  tenantSlug: string | null,
): Promise<AdminOrder> {
  return apiRequest<AdminOrder>(`/admin/orders/${encodeURIComponent(number)}/refund/`, {
    method: "POST",
    tenantSlug,
  });
}

export async function listAdminOrderInquiries(
  tenantSlug: string | null,
  params: OrderParams = {},
): Promise<AdminOrderInquiry[]> {
  const data = await apiRequest<AdminOrderInquiry[] | { results?: AdminOrderInquiry[] }>(
    `/admin/order-inquiries/${querySuffix(params)}`,
    { tenantSlug },
  );
  return unwrapResults(data);
}
