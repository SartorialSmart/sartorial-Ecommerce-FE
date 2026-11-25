export const STOREFRONT_BASE_DOMAIN = "ecommerce.sartorialsmart.com";

export const RESERVED_STORE_SLUGS: readonly string[] = [
  "www",
  "api",
  "apis",
  "app",
  "apps",
  "mail",
  "email",
  "webmail",
  "smtp",
  "pop",
  "imap",
  "mx",
  "dns",
  "ns",
  "ns1",
  "ns2",
  "cdn",
  "static",
  "assets",
  "media",
  "images",
  "img",
  "files",
  "uploads",
  "admin",
  "administrator",
  "root",
  "system",
  "sys",
  "billing",
  "invoice",
  "invoices",
  "payment",
  "payments",
  "checkout",
  "cart",
  "order",
  "orders",
  "refund",
  "returns",
  "support",
  "help",
  "contact",
  "about",
  "faq",
  "privacy",
  "terms",
  "legal",
  "status",
  "health",
  "login",
  "logout",
  "signin",
  "sign-in",
  "signup",
  "sign-up",
  "auth",
  "oauth",
  "account",
  "accounts",
  "profile",
  "user",
  "users",
  "team",
  "teams",
  "dashboard",
  "settings",
  "store",
  "stores",
  "shop",
  "catalog",
  "search",
  "blog",
  "news",
  "docs",
  "documentation",
  "developer",
  "developers",
  "sitemap",
  "robots",
  "favicon",
  "test",
  "testing",
  "dev",
  "development",
  "staging",
  "stage",
  "prod",
  "production",
  "demo",
  "sandbox",
  "localhost",
  "example",
  "sartorial",
  "sartorialsmart",
  "ecommerce",
  "default",
  "public",
  "internal",
  "security",
  "ssl",
  "ftp",
  "sftp",
  "ssh",
];

export function normalizeStoreSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function validateStoreSlug(value: string): string | null {
  const slug = normalizeStoreSlug(value);
  if (!slug) return "Choose a storefront address.";
  if (slug.length > 80) return "Use 80 characters or fewer.";
  if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(slug)) {
    return "Use letters, numbers and hyphens only.";
  }
  const base = slug.replace(/-\d+$/, "");
  if (RESERVED_STORE_SLUGS.includes(base)) {
    return `"${slug}" is reserved. Choose another address.`;
  }
  return null;
}

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
