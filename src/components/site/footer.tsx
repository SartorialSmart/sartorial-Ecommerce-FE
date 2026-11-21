import { Link } from "@tanstack/react-router";
import { Instagram, Twitter, Youtube } from "lucide-react";
import { useEffect, useState } from "react";

import { Logo } from "@/components/brand/logo";
import { getPlans, loadPlans, type Plan } from "@/data/catalog";
import { formatCurrency } from "@/lib/currency";

const columns = [
  {
    title: "Platform",
    links: [
      { label: "Store designer", to: "/designer" },
      { label: "Dashboard", to: "/dashboard" },
      { label: "Plans", to: "/" },
    ],
  },
  {
    title: "Default designs",
    links: [
      { label: "Atelier Loom", to: "/templates/loom" },
      { label: "Studio Adire", to: "/templates/adire" },
      { label: "Lagos After Dark", to: "/templates/lagos" },
    ],
  },
];

export function SiteFooter() {
  const [plansState, setPlansState] = useState<Plan[]>([]);

  useEffect(() => {
    loadPlans().then(setPlansState);
  }, []);

  return (
    <footer className="bg-ink-deep text-ink-foreground">
      <div className="h-1.5 kente-strip" />
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-muted">
              The commerce home for African fashion designers — storefronts, payments, logistics and
              a marketplace that celebrates the craft.
            </p>
            <div className="mt-5 flex gap-3">
              {[Instagram, Twitter, Youtube].map((Icon, i) => (
                <span
                  key={i}
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-ink-line text-ink-muted transition-colors hover:text-ink-foreground"
                >
                  <Icon className="h-4 w-4" />
                </span>
              ))}
            </div>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-ink-muted">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="text-ink-foreground/80 transition-colors hover:text-primary"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-ink-muted">Plans</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-foreground/80">
              {plansState.map((p) => (
                <li key={p.id}>
                  {p.name} — {p.monthly === 0 ? "free forever" : `${formatCurrency(p.monthly)}/mo`}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-ink-line pt-6 text-xs text-ink-muted sm:flex-row">
          <span>© 2026 Sartorial eCommerce. Cut, stitched & shipped from Lagos.</span>
          <span>Terms · Privacy · Seller handbook</span>
        </div>
      </div>
    </footer>
  );
}
