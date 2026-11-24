import { apiRequest } from "./client";
import type { PricingTier, Plan } from "./types";

function unwrapResults<T>(data: T[] | { results?: T[] } | null): T[] {
  if (Array.isArray(data)) return data;
  return data?.results ?? [];
}

export async function listPricingTiers(tenantSlug: string | null = null): Promise<PricingTier[]> {
  const data = await apiRequest<PricingTier[] | { results?: PricingTier[] } | null>("/pricing/", {
    tenantSlug,
  });
  return unwrapResults(data);
}

export function pricingTierToPlan(tier: PricingTier): Plan {
  return {
    // Use the tier slug as the plan id: it matches the `store.plan` setting
    // ("ankara", "asooke", …) written by store setup and plan changes.
    id: tier.slug,
    name: tier.name,
    tagline: tier.tagline,
    monthly: tier.monthly_price,
    annual: tier.annual_price,
    features: tier.features,
    cta: tier.cta,
    highlight: tier.is_featured,
  };
}
