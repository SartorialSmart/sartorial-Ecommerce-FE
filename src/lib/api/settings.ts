import { apiRequest } from "./client";

export type SettingType = "string" | "text" | "integer" | "decimal" | "boolean" | "json";

export interface SettingSpec {
  key: string;
  section: string;
  type: SettingType;
  description: string;
  default: unknown;
  value: unknown;
  secret?: boolean;
  is_set?: boolean;
}

export interface AdminSettingsResponse {
  settings: SettingSpec[];
  tenant: string | null;
}

export interface PublicConfigResponse {
  settings: Record<string, unknown>;
  tenant: string | null;
}

export async function getPublicConfig(tenantSlug: string | null): Promise<PublicConfigResponse> {
  return apiRequest<PublicConfigResponse>("/storeconfig/", { tenantSlug, auth: false });
}

export async function getAdminSettings(tenantSlug: string | null): Promise<AdminSettingsResponse> {
  return apiRequest<AdminSettingsResponse>("/admin/storeconfig/settings/", { tenantSlug });
}

export async function patchAdminSettings(
  values: Record<string, unknown>,
  tenantSlug: string | null,
): Promise<AdminSettingsResponse> {
  return apiRequest<AdminSettingsResponse>("/admin/storeconfig/settings/", {
    method: "PATCH",
    tenantSlug,
    body: { values },
  });
}

export function settingsToMap(response: AdminSettingsResponse): Record<string, unknown> {
  const map: Record<string, unknown> = {};
  for (const spec of response.settings) {
    map[spec.key] = spec.value;
  }
  return map;
}

export function stringSetting(map: Record<string, unknown>, key: string, fallback = ""): string {
  const value = map[key];
  return typeof value === "string" ? value : fallback;
}
