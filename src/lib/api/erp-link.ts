import { apiRequest } from "./client";

export interface ErpLinkStatus {
  tenant: string;
  linked: boolean;
  erp_business_id: string;
  tenant_type: "erp_subscriber" | "independent";
  api_key_prefix: string;
  api_key_created_at: string | null;
  api_key_last_used_at: string | null;
  sync_endpoints: { catalog: string; inventory: string };
  api_key?: string;
}

export interface LinkErpInput {
  erp_business_id?: string;
  erp_seller_id?: string;
}

export async function getErpLinkStatus(tenantSlug: string | null): Promise<ErpLinkStatus> {
  return apiRequest<ErpLinkStatus>("/admin/erp-link/", { tenantSlug });
}

export async function linkErpAccount(
  input: LinkErpInput,
  tenantSlug: string | null,
): Promise<ErpLinkStatus> {
  return apiRequest<ErpLinkStatus>("/admin/erp-link/", {
    method: "POST",
    tenantSlug,
    body: input,
  });
}

export async function regenerateErpKey(tenantSlug: string | null): Promise<ErpLinkStatus> {
  return apiRequest<ErpLinkStatus>("/admin/erp-link/key/", {
    method: "POST",
    tenantSlug,
    body: {},
  });
}

export async function unlinkErpAccount(tenantSlug: string | null): Promise<ErpLinkStatus> {
  return apiRequest<ErpLinkStatus>("/admin/erp-link/", {
    method: "DELETE",
    tenantSlug,
  });
}
