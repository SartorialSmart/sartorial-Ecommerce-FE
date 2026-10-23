import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";

import { SiteNav } from "@/components/site/nav";
import { SiteFooter } from "@/components/site/footer";
import { Button } from "@/components/ui/button";
import { templates } from "@/data/catalog";

export const Route = createFileRoute("/templates")({
  head: () => ({
    meta: [
      {
        title: "Default Storefront Designs — Sartorial",
        name: "description",
        content:
          "Three finished storefront designs for African fashion labels — Atelier Loom, Studio Adire and Lagos After Dark. Preview each, then make it yours in the store designer.",
      },
      {
        property: "og:title",
        content: "Default Storefront Designs — Sartorial",
      },
      {
        property: "og:description",
        content:
          "Three finished storefront designs for African fashion labels. Preview each, then make it yours in the store designer.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TemplatesPage,
});

function TemplatesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
            Default storefront designs
          </p>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
            Never start from a blank page.
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Each design ships finished — typography, colors, hero, product grid and copy rhythm
            already styled. Preview one live, then tailor it in the store designer.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {templates.map((t) => (
            <div
              key={t.slug}
              className="group flex flex-col overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-xl"
            >
              <div className="relative overflow-hidden">
                <img
                  src={t.image}
                  alt={t.name}
                  width={1024}
                  height={1200}
                  loading="lazy"
                  className="h-72 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute left-4 top-4 rounded-full bg-ink/80 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-ink-foreground backdrop-blur">
                  {t.mood}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h2 className="font-display text-xl font-bold">{t.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{t.tagline}</p>
                <ul className="mt-4 flex-1 space-y-2">
                  {t.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-leaf" />
                      {h}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex gap-3">
                  <Button asChild variant="outline" className="flex-1">
                    <Link to="/templates/$slug" params={{ slug: t.slug }}>
                      Preview
                    </Link>
                  </Button>
                  <Button asChild className="flex-1">
                    <Link to="/designer" search={{ template: t.slug }}>
                      Use design <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 rounded-xl border bg-card p-6 text-center text-sm text-muted-foreground">
          Every design is a starting point — change the colors, type, layout and sections in the{" "}
          <Link
            to="/designer"
            search={{ template: undefined }}
            className="font-semibold text-primary underline underline-offset-4"
          >
            store designer
          </Link>
          .
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
