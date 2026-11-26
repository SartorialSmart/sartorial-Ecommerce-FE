import { ArrowRight, Menu, ShoppingBag, Star } from "lucide-react";

import { productsFor, textileWords, type Product, type StoreTemplate } from "@/data/catalog";
import { formatCurrency } from "@/lib/currency";

export interface StorefrontOverrides {
  storeName?: string | undefined;
  tagline?: string | undefined;
  logoUrl?: string | undefined;
  accent?: string | undefined;
  accentFg?: string | undefined;
  fontDisplay?: string | undefined;
  heroLayout?: "split" | "overlay" | undefined;
  showAnnouncement?: boolean | undefined;
  showMarquee?: boolean | undefined;
  showTestimonial?: boolean | undefined;
  showCta?: boolean | undefined;
  products?: Product[] | undefined;
}

const DEFAULTS = {
  showAnnouncement: true,
  showMarquee: true,
  showTestimonial: true,
  showCta: true,
  heroLayout: "split" as const,
};

export function StorefrontView({
  template,
  overrides = {},
}: {
  template: StoreTemplate;
  overrides?: StorefrontOverrides;
}) {
  const o = { ...DEFAULTS, ...overrides };
  const t = template.theme;
  const accent = o.accent ?? t.accent;
  const accentFg = o.accentFg ?? t.accentFg;
  const fontDisplay = o.fontDisplay ?? t.fontDisplay;
  const name = o.storeName ?? template.name;
  const tagline = o.tagline ?? template.tagline;
  const items = o.products ?? productsFor(template.slug);

  return (
    <div
      className="w-full overflow-hidden"
      style={{ background: t.bg, color: t.fg, fontFamily: t.fontBody }}
    >
      {o.showAnnouncement && (
        <div
          className="px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.18em]"
          style={{ background: accent, color: accentFg }}
        >
          Free delivery over {formatCurrency(198690)} · Ships worldwide · Made to order
        </div>
      )}

      <header
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: `1px solid ${t.border}` }}
      >
        <div className="flex items-center gap-2">
          {o.logoUrl ? (
            <img
              src={o.logoUrl}
              alt={name}
              className="max-h-9 w-auto max-w-[120px] object-contain"
            />
          ) : (
            <span
              className="flex h-8 w-8 items-center justify-center rounded-md font-display text-sm font-bold"
              style={{ background: accent, color: accentFg }}
            >
              {name.charAt(0)}
            </span>
          )}
          <span style={{ fontFamily: fontDisplay }} className="text-lg font-bold tracking-tight">
            {name}
          </span>
        </div>
        <nav className="hidden gap-6 text-sm font-medium opacity-80 sm:flex">
          <span>Shop</span>
          <span>Lookbook</span>
          <span>Our craft</span>
        </nav>
        <div className="flex items-center gap-4">
          <Menu className="h-5 w-5 sm:hidden" />
          <span className="relative">
            <ShoppingBag className="h-5 w-5" />
            <span
              className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold"
              style={{ background: accent, color: accentFg }}
            >
              2
            </span>
          </span>
        </div>
      </header>

      {o.heroLayout === "overlay" ? (
        <section className="relative">
          <img
            src={template.image}
            alt={name}
            width={1024}
            height={1200}
            className="h-[380px] w-full object-cover sm:h-[460px]"
            loading="lazy"
          />
          <div
            className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
            style={{
              background: "linear-gradient(to top, rgba(10,8,6,0.72), rgba(10,8,6,0.28))",
              color: "#fff",
            }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] opacity-90">
              {template.mood}
            </p>
            <h1
              style={{ fontFamily: fontDisplay }}
              className="mt-3 max-w-xl text-4xl font-bold leading-tight sm:text-5xl"
            >
              {tagline}
            </h1>
            <button
              className="mt-6 inline-flex items-center gap-2 rounded-md px-6 py-3 text-sm font-semibold"
              style={{ background: accent, color: accentFg }}
            >
              Shop the collection <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      ) : (
        <section className="grid items-center gap-8 px-6 py-10 sm:grid-cols-2 sm:py-14">
          <div>
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.25em]"
              style={{ color: accent }}
            >
              {template.mood}
            </p>
            <h1
              style={{ fontFamily: fontDisplay }}
              className="mt-3 text-4xl font-bold leading-[1.05] sm:text-5xl"
            >
              {tagline}
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed opacity-70">
              Every piece is cut, dyed and finished in the {name} atelier — made to order, made to
              last, made to be remembered.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                className="inline-flex items-center gap-2 rounded-md px-6 py-3 text-sm font-semibold"
                style={{ background: accent, color: accentFg }}
              >
                Shop new arrivals <ArrowRight className="h-4 w-4" />
              </button>
              <button
                className="rounded-md px-6 py-3 text-sm font-semibold"
                style={{ border: `1px solid ${t.border}` }}
              >
                Book a fitting
              </button>
            </div>
          </div>
          <img
            src={template.image}
            alt={name}
            width={1024}
            height={1200}
            className="h-[340px] w-full rounded-lg object-cover sm:h-[440px]"
            loading="lazy"
          />
        </section>
      )}

      {o.showMarquee && (
        <div className="overflow-hidden py-2.5" style={{ background: accent, color: accentFg }}>
          <div className="marquee-track gap-10 text-xs font-bold uppercase tracking-[0.3em]">
            {[...textileWords, ...textileWords].map((w, i) => (
              <span key={i} className="flex items-center gap-10">
                {w} <span className="opacity-60">✦</span>
              </span>
            ))}
          </div>
        </div>
      )}

      <section className="px-6 py-10">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 style={{ fontFamily: fontDisplay }} className="text-2xl font-bold sm:text-3xl">
              Featured pieces
            </h2>
            <p className="mt-1 text-sm opacity-60">
              Small batches — when they're gone, they're gone.
            </p>
          </div>
          <span
            className="hidden text-sm font-semibold underline underline-offset-4 sm:block"
            style={{ color: accent }}
          >
            View all
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {items.map((p) => (
            <article
              key={p.id}
              className="overflow-hidden rounded-lg"
              style={{ background: t.surface, border: `1px solid ${t.border}` }}
            >
              <img
                src={p.image}
                alt={p.name}
                width={1024}
                height={1024}
                loading="lazy"
                className="aspect-square w-full object-cover"
              />
              <div className="p-3 sm:p-4">
                <p
                  className="text-[10px] font-semibold uppercase tracking-widest"
                  style={{ color: accent }}
                >
                  {p.tag}
                </p>
                <h3 className="mt-1 text-sm font-semibold leading-snug">{p.name}</h3>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-bold">{formatCurrency(p.price)}</span>
                  <button
                    className="rounded px-2.5 py-1.5 text-[11px] font-semibold"
                    style={{ background: accent, color: accentFg }}
                  >
                    Add
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {o.showTestimonial && (
        <section className="px-6 pb-10">
          <div
            className="mx-auto max-w-2xl rounded-lg p-8 text-center"
            style={{ background: t.surface, border: `1px solid ${t.border}` }}
          >
            <div className="flex justify-center gap-1" style={{ color: accent }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <p
              style={{ fontFamily: fontDisplay }}
              className="mt-4 text-xl font-medium leading-relaxed"
            >
              "The fitting was perfect and delivery took three days. I've ordered twice more since."
            </p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-widest opacity-60">
              — Ifeoma A., Abuja
            </p>
          </div>
        </section>
      )}

      {o.showCta && (
        <section className="px-6 py-12 text-center" style={{ background: accent, color: accentFg }}>
          <h2 style={{ fontFamily: fontDisplay }} className="mx-auto max-w-xl text-3xl font-bold">
            Join the list — first look at every drop
          </h2>
          <div className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row">
            <input
              placeholder="you@email.com"
              className="flex-1 rounded-md border px-4 py-3 text-sm outline-none placeholder:opacity-60"
              style={{
                borderColor: "rgba(255,255,255,0.4)",
                background: "rgba(255,255,255,0.12)",
                color: accentFg,
              }}
            />
            <button
              className="rounded-md px-6 py-3 text-sm font-bold"
              style={{ background: accentFg, color: accent }}
            >
              Subscribe
            </button>
          </div>
        </section>
      )}

      <footer
        className="flex flex-col items-center justify-between gap-3 px-6 py-6 text-xs opacity-60 sm:flex-row"
        style={{ borderTop: `1px solid ${t.border}` }}
      >
        <span>© 2026 {name} · Lagos · Accra · Nairobi</span>
        <span>
          Powered by <strong>Sartorial</strong>
        </span>
      </footer>
    </div>
  );
}
