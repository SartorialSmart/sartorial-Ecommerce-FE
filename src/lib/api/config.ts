const rawBaseUrl = import.meta.env["VITE_API_BASE_URL"] as string | undefined;

export const API_BASE_URL = (
  rawBaseUrl && rawBaseUrl.trim() ? rawBaseUrl.trim() : "http://localhost:8000/api/v1"
).replace(/\/+$/, "");

const rawTenantSlug = import.meta.env["VITE_TENANT_SLUG"] as string | undefined;

export const TENANT_SLUG = rawTenantSlug ? rawTenantSlug.trim() : "";
