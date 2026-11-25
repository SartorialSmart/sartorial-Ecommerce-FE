import { useEffect, useState } from "react";

import { StorefrontView, type StorefrontOverrides } from "@/components/storefront/storefront-view";
import { listPublicProducts } from "@/lib/api/catalog";
import { getPublicConfig } from "@/lib/api/settings";
import { lookupTenant, type PublicTenant } from "@/lib/api/tenants";
import {
  heroImage,
  getTemplate,
  templates,
  type Product,
  type StoreTemplate,
} from "@/data/catalog";

type State =
  | { kind: "loading" }
  | { kind: "not-found" }
  | { kind: "error"; message: string }
  | { kind: "ready"; template: StoreTemplate; overrides: StorefrontOverrides };

function overridesFrom(values: Record<string, unknown>, tenant: PublicTenant): StorefrontOverrides {
  const text = (key: string): string => {
    const value = values[key];
    return typeof value === "string" ? value : "";
  };
  const flag = (key: string): boolean | undefined => {
    const value = values[key];
    return typeof value === "boolean" ? value : undefined;
  };
  const heroLayout = text("storefront.hero_layout");

  return {
    storeName: text("store.name") || tenant.name,
    tagline: text("store.tagline"),
    accent: text("storefront.accent") || undefined,
    accentFg: text("storefront.accent_fg") || undefined,
    fontDisplay: text("storefront.font_display") || undefined,
    heroLayout: heroLayout === "overlay" || heroLayout === "split" ? heroLayout : undefined,
    showAnnouncement: flag("storefront.show_announcement"),
    showMarquee: flag("storefront.show_marquee"),
    showTestimonial: flag("storefront.show_testimonial"),
    showCta: flag("storefront.show_cta"),
  };
}

export function HostedStorefront({ slug }: { slug: string }) {
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ kind: "loading" });

    (async () => {
      try {
        const [tenant, config] = await Promise.all([lookupTenant(slug), getPublicConfig(slug)]);
        const products = await listPublicProducts(slug);
        if (cancelled) return;

        const mapped: Product[] = products.map((p) => ({
          id: p.id,
          name: p.title,
          designer: tenant.name,
          price: Number(p.price_from ?? 0),
          image: p.primary_image || heroImage,
          tag: "New",
          store: templates[0]!.slug,
          stock: p.stock_available,
        }));
        const templateSlug = config.settings["storefront.template"];
        const template =
          getTemplate(typeof templateSlug === "string" ? templateSlug : undefined) ?? templates[0]!;

        setState({
          kind: "ready",
          template,
          overrides: { ...overridesFrom(config.settings, tenant), products: mapped },
        });
      } catch (error) {
        if (cancelled) return;
        const status =
          error && typeof error === "object" && "status" in error ? error.status : null;
        setState(
          status === 404
            ? { kind: "not-found" }
            : {
                kind: "error",
                message: error instanceof Error ? error.message : "Could not load this store.",
              },
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (state.kind === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-deep text-sm text-ink-muted">
        Loading storefront…
      </div>
    );
  }

  if (state.kind === "not-found") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-ink-deep px-6 text-center text-ink-foreground">
        <h1 className="font-display text-2xl font-bold">Store not found</h1>
        <p className="text-sm text-ink-muted">There is no active store at this address.</p>
      </div>
    );
  }

  if (state.kind === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-ink-deep px-6 text-center text-ink-foreground">
        <h1 className="font-display text-2xl font-bold">Couldn’t load this store</h1>
        <p className="text-sm text-ink-muted">{state.message}</p>
      </div>
    );
  }

  return <StorefrontView template={state.template} overrides={state.overrides} />;
}
