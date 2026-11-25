export const STOREFRONT_BASE_DOMAIN = "ecommerce.sartorialsmart.com";

export function storefrontUrl(slug: string): string {
  return `https://${slug}.${STOREFRONT_BASE_DOMAIN}`;
}

export function storeSlugFromHost(hostname: string): string | null {
  const host = hostname.toLowerCase().split(":")[0] ?? "";
  const suffix = `.${STOREFRONT_BASE_DOMAIN}`;
  if (!host.endsWith(suffix)) return null;
  const label = host.slice(0, -suffix.length);
  if (!label || label.includes(".")) return null;
  return /^[a-z0-9-]+$/.test(label) ? label : null;
}

export function currentStoreSlug(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const override = params.get("store")?.trim().toLowerCase();
  if (override && /^[a-z0-9-]+$/.test(override)) return override;
  return storeSlugFromHost(window.location.hostname);
}
