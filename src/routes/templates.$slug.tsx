import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Rocket } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { StorefrontView } from "@/components/storefront/storefront-view";
import { getTemplate } from "@/data/catalog";

export const Route = createFileRoute("/templates/$slug")({
  loader: ({ params }) => {
    const template = getTemplate(params.slug);
    if (!template) throw notFound();
    return { template };
  },
  head: ({ loaderData }) => {
    const t = loaderData?.template;
    const title = t ? `${t.name} — Sartorial default design` : "Storefront design — Sartorial";
    const description = t ? `${t.tagline} ${t.mood}.` : "A Sartorial storefront design.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: TemplatePreviewPage,
});

function TemplatePreviewPage() {
  const { template } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-ink-deep text-ink-foreground">
      <div className="sticky top-0 z-50 border-b border-ink-line bg-ink">
        <div className="mx-auto flex h-18 max-w-7xl flex-wrap items-center justify-between gap-2 px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Logo />
            <span className="hidden text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted sm:block">
              Default design preview · {template.name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-ink-line bg-transparent text-ink-foreground hover:bg-ink-line hover:text-ink-foreground"
            >
              <Link to="/templates">
                <ArrowLeft className="h-4 w-4" /> All designs
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/designer" search={{ template: template.slug }}>
                <Rocket className="h-4 w-4" /> Use this design
              </Link>
            </Button>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-2 py-6 sm:px-4 sm:py-10">
        <div className="overflow-hidden rounded-xl border border-ink-line shadow-2xl">
          <StorefrontView template={template} />
        </div>
      </div>
    </div>
  );
}
