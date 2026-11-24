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
