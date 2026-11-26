import { apiRequest } from "./client";

export interface DashboardKpis {
  currency: string;
  revenue: string;
  orders: number;
  paid_orders: number;
  avg_order_value: string;
  products: number;
  customers: number;
  low_stock: number;
}

export interface RevenueByDay {
  date: string;
  revenue: string;
  orders: number;
}

export interface TopProduct {
  title: string;
  quantity: number;
  revenue: string;
}

export interface FulfillmentSplit {
  type: string;
  quantity: number;
}

export interface OrdersByStatus {
  status: string;
  label: string;
  count: number;
}

export interface AnalyticsSummary {
  kpis: DashboardKpis;
  orders_by_status: OrdersByStatus[];
  revenue_by_day: RevenueByDay[];
  top_products: TopProduct[];
  fulfillment_split: FulfillmentSplit[];
}

export async function getAnalyticsSummary(tenantSlug: string | null): Promise<AnalyticsSummary> {
  return apiRequest<AnalyticsSummary>("/admin/analytics/", { tenantSlug });
}

export interface SalesReportSummary {
  currency: string;
  from: string;
  to: string;
  orders: number;
  paid_orders: number;
  gross: string;
  discounts: string;
  vat: string;
  net: string;
  revenue: string;
  refunds: string;
  avg_order_value: string;
}

export interface SalesReportDay {
  date: string;
  orders: number;
  gross: string;
  discounts: string;
  vat: string;
  net: string;
}

export interface SalesReportStatus extends OrdersByStatus {
  total: string;
}

export interface SalesReportInvoiceStatus {
  status: string;
  label: string;
  count: number;
  total: string;
}

export interface SalesReport {
  summary: SalesReportSummary;
  by_day: SalesReportDay[];
  by_status: SalesReportStatus[];
  top_products: TopProduct[];
  invoices: SalesReportInvoiceStatus[];
}

export interface SalesReportParams {
  from?: string;
  to?: string;
  status?: string;
}

export async function getSalesReport(
  tenantSlug: string | null,
  params: SalesReportParams = {},
): Promise<SalesReport> {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const query = search.toString();
  return apiRequest<SalesReport>(`/admin/sales-report/${query ? `?${query}` : ""}`, {
    tenantSlug,
  });
}
