import { API_BASE_URL } from "./config";
import { apiRequest, getAccessToken } from "./client";

export interface AdminInvoice {
  id: string;
  number: string;
  order: string;
  order_number: string;
  status: "draft" | "sent" | "paid";
  customer_name: string;
  customer_email: string;
  customer_logo_url: string;
  seller_name: string;
  seller_email: string;
  seller_logo_url: string;
  currency: string;
  subtotal: string;
  discount: string;
  vat: string;
  total: string;
  issue_date: string;
  due_date: string | null;
  notes: string;
  last_sent_at: string | null;
  pdf_url: string;
}

export interface CreateInvoiceInput {
  order: string;
  customer_name?: string;
  customer_email?: string;
  customer_logo_url?: string;
  notes?: string;
  due_date?: string;
}

export interface SendInvoiceInput {
  to?: string;
  subject?: string;
  message?: string;
}

function querySuffix(params: Record<string, string | number | undefined>): string {
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

export async function listAdminInvoices(
  tenantSlug: string | null,
  params: Record<string, string | number | undefined> = {},
): Promise<AdminInvoice[]> {
  const data = await apiRequest<AdminInvoice[] | { results?: AdminInvoice[] } | null>(
    `/admin/invoices/${querySuffix(params)}`,
    { tenantSlug },
  );
  return unwrapResults(data);
}

export async function createAdminInvoice(
  input: CreateInvoiceInput,
  tenantSlug: string | null,
): Promise<AdminInvoice> {
  return apiRequest<AdminInvoice>("/admin/invoices/", {
    method: "POST",
    tenantSlug,
    body: input,
  });
}

export async function updateAdminInvoice(
  id: string,
  patch: Partial<AdminInvoice>,
  tenantSlug: string | null,
): Promise<AdminInvoice> {
  return apiRequest<AdminInvoice>(`/admin/invoices/${encodeURIComponent(id)}/`, {
    method: "PATCH",
    tenantSlug,
    body: patch,
  });
}

export async function sendAdminInvoice(
  id: string,
  input: SendInvoiceInput,
  tenantSlug: string | null,
): Promise<{ delivered: boolean; to: string }> {
  return apiRequest<{ delivered: boolean; to: string }>(
    `/admin/invoices/${encodeURIComponent(id)}/send/`,
    { method: "POST", tenantSlug, body: input },
  );
}

export async function downloadAdminInvoicePdf(
  id: string,
  tenantSlug: string | null,
): Promise<void> {
  const headers: Record<string, string> = { accept: "application/pdf" };
  const token = getAccessToken();
  if (token) headers["authorization"] = `Bearer ${token}`;
  if (tenantSlug) headers["x-tenant-slug"] = tenantSlug;
  const response = await fetch(`${API_BASE_URL}/admin/invoices/${encodeURIComponent(id)}/pdf/`, {
    headers,
  });
  if (!response.ok) {
    throw new Error(`The PDF could not be downloaded (${response.status}).`);
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `invoice-${id}.pdf`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
