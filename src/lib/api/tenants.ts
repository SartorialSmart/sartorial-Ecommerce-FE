import { apiRequest } from "./client";
import type { TenantStore } from "./types";

export type MembershipRole = "owner" | "manager" | "staff";

export interface TenantMembership {
  id: string;
  tenant: string;
  user: string;
  user_email: string;
  user_name: string;
  role: MembershipRole;
  created_at: string;
}

function unwrapResults<T>(data: T[] | { results?: T[] } | null): T[] {
  if (Array.isArray(data)) return data;
  return data?.results ?? [];
}

export async function listTenantMemberships(
  tenantSlug: string | null,
): Promise<TenantMembership[]> {
  const qs = tenantSlug ? `?tenant=${encodeURIComponent(tenantSlug)}` : "";
  const data = await apiRequest<TenantMembership[] | { results?: TenantMembership[] } | null>(
    `/admin/tenant-memberships/${qs}`,
    { tenantSlug },
  );
  return unwrapResults(data);
}

export async function inviteTenantMember(
  tenantSlug: string,
  email: string,
  role: MembershipRole,
): Promise<TenantMembership> {
  return apiRequest<TenantMembership>(`/admin/tenants/${encodeURIComponent(tenantSlug)}/members/`, {
    method: "POST",
    tenantSlug,
    body: { email, role },
  });
}

export interface StoreSetupInput {
  name: string;
  slug?: string | undefined;
  tagline?: string | undefined;
  city?: string | undefined;
  currency?: string | undefined;
  category?: string | undefined;
  plan?: string | undefined;
  template?: string | undefined;
  accent?: string | undefined;
  accent_fg?: string | undefined;
  font_display?: string | undefined;
}

export async function setupStore(input: StoreSetupInput): Promise<TenantStore> {
  return apiRequest<TenantStore>("/admin/stores/setup/", {
    method: "POST",
    tenantSlug: null,
    body: input,
  });
}
