import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  LineChart,
  Palette,
  Scissors,
  ShoppingBag,
  Sparkles,
  Store,
  Truck,
  Users,
  Wallet,
} from "lucide-react";

import { SiteNav } from "@/components/site/nav";
import { SiteFooter } from "@/components/site/footer";
import { Button } from "@/components/ui/button";
import { heroImage, plans, templates, testimonials, textileWords } from "@/data/catalog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "Sartorial — eCommerce for African Fashion Designers",
        name: "description",
        content:
          "Open a designer-grade fashion storefront in minutes. Default designs, a visual store designer, Pan-African payments and logistics, and plans that grow with your label.",
      },
      {
        property: "og:title",
        content: "Sartorial — eCommerce for African Fashion Designers",
      },
      {
        property: "og:description",
        content:
          "Open a designer-grade fashion storefront in minutes — default designs, visual store designer, Pan-African payments and logistics.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

const features = [
  {
    icon: Store,
    title: "A storefront in an afternoon",
    body: "Pick a default design, pour in your brand, and publish to your own domain. No code, no agency, no waiting.",
  },
  {
    icon: Wallet,
    title: "Payments made for home",
    body: "Paystack, M-Pesa, Flutterwave, cards and pay-on-delivery — settled to your bank in a tap.",
  },
  {
    icon: Truck,
    title: "Pan-African logistics",
    body: "Discounted shipping labels, courier pickup and tracking across 38 countries, from Lagos to London.",
  },
  {
    icon: LineChart,
    title: "Numbers that speak",
    body: "Revenue, best sellers, visitor trends and restock alerts in one clean dashboard.",
  },
  {
    icon: Users,
    title: "A marketplace that shows up",
    body: "List once and get found by continental and diaspora buyers hunting real African fashion.",
  },
  {
    icon: Sparkles,
    title: "Copy that sells",
    body: "AI writes product stories in your brand voice — English, Yoruba, Swahili, French and Twi.",
  },
];

function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <Hero />
      <TextileMarquee />
      <Features />
      <DesignsShowcase />
      <DesignerTeaser />
      <Plans />
      <Testimonials />
      <FinalCta />
      <SiteFooter />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-ink-deep text-ink-foreground">
      <div className="pointer-events-none absolute -right-40 top-0 h-[540px] w-[540px] rounded-full bg-primary/25 blur-3xl" />
      <div className="pointer-events-none absolute -left-52 bottom-0 h-[420px] w-[420px] rounded-full bg-gold/10 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-ink-line px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted">
            <Scissors className="h-3.5 w-3.5 text-primary" />
            Built for African fashion designers
          </span>
          <h1 className="mt-6 font-display text-5xl font-extrabold leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl">
            Own the storefront
            <span className="text-primary"> your craft</span> deserves.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-muted">
            Sartorial gives designers a couture-grade online store, payments and delivery that work
            across the continent, and a marketplace of customers who came for the craft.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button asChild size="lg" className="h-12 px-7 text-base">
              <Link to="/signup">
                Open your store — free <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 border-ink-line bg-transparent px-7 text-base text-ink-foreground hover:bg-ink-line hover:text-ink-foreground"
            >
              <Link to="/templates">Browse storefront designs</Link>
            </Button>
          </div>
          <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-ink-line pt-8">
            {[
              ["12,400+", "designers selling"],
              ["38", "countries served"],
              ["₦1.9B", "designer earnings in 2026"],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="font-display text-2xl font-bold sm:text-3xl">{value}</dt>
                <dd className="mt-1 text-xs uppercase tracking-wider text-ink-muted">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="relative">
          <div className="absolute -bottom-4 -right-4 h-full w-full rounded-xl border-2 border-primary" />
          <img
            src={heroImage}
            alt="Designer in a crimson and black agbada couture gown"
            width={1024}
            height={1280}
            className="relative h-[460px] w-full rounded-xl object-cover lg:h-[560px]"
          />
          <div className="absolute -left-4 top-8 flex items-center gap-3 rounded-lg bg-background px-4 py-3 text-foreground shadow-xl sm:-left-8">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-leaf opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-leaf" />
            </span>
            <div className="text-xs">
              <p className="font-bold">New order · $640</p>
              <p className="text-muted-foreground">Red Agbada Gown → Lagos</p>
            </div>
          </div>
          <div className="absolute -right-2 bottom-10 rounded-lg bg-ink px-4 py-3 text-ink-foreground shadow-xl sm:-right-6">
            <p className="text-[10px] uppercase tracking-widest text-ink-muted">
              Storefront published
            </p>
            <p className="mt-0.5 text-xs font-bold">sartorial.store/ade-stitches</p>
          </div>
        </div>
      </div>
      <div className="h-1.5 kente-strip" />
    </section>
  );
}

function TextileMarquee() {
  return (
    <div className="overflow-hidden bg-primary py-3.5 text-primary-foreground">
      <div className="marquee-track gap-10 font-display text-sm font-bold uppercase tracking-[0.3em]">
        {[...textileWords, ...textileWords].map((w, i) => (
          <span key={i} className="flex items-center gap-10">
            {w} <span className="opacity-60">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">{eyebrow}</p>
      <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {body && <p className="mt-4 text-base leading-relaxed text-muted-foreground">{body}</p>}
    </div>
  );
}

function Features() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
      <SectionHeading
        eyebrow="Why Sartorial"
        title="Everything an atelier needs to sell"
        body="Not a generic shop builder reskinned — a commerce platform cut to the measure of African fashion."
      />
      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div
            key={f.title}
            className="group rounded-xl border bg-card p-6 transition-shadow hover:shadow-lg"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <f.icon className="h-5 w-5" />
            </span>
            <h3 className="mt-5 font-display text-lg font-bold">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function DesignsShowcase() {
  return (
    <section className="bg-secondary/60 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Default storefront designs"
          title="Three doors into Sartorial"
          body="Every store starts from a finished, styled design — never a blank page. Preview one, make it yours."
        />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {templates.map((t) => (
            <Link
              key={t.slug}
              to="/templates/$slug"
              params={{ slug: t.slug }}
              className="group overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-xl"
            >
              <div className="relative overflow-hidden">
                <img
                  src={t.image}
                  alt={t.name}
                  width={1024}
                  height={1200}
                  loading="lazy"
                  className="h-80 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute left-4 top-4 rounded-full bg-ink/80 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-ink-foreground backdrop-blur">
                  {t.mood}
                </span>
              </div>
              <div className="p-6">
                <h3 className="font-display text-xl font-bold">{t.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t.tagline}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                  Preview design{" "}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

const designerBullets = [
  "Start from Loom, Studio Adire or Lagos After Dark",
  "Swap colors, type and hero layout — live while you edit",
  "Turn sections on and off like a fitting room mirror",
  "Publish to sartorial.store or your own domain",
];

function DesignerTeaser() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
      <div className="grid items-center gap-14 lg:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
            The store designer
          </p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            Design your store like you cut a garment. Fitted, not templated.
          </h2>
          <ul className="mt-8 space-y-4">
            {designerBullets.map((b) => (
              <li key={b} className="flex items-start gap-3 text-sm sm:text-base">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-leaf" />
                <span className="text-muted-foreground">{b}</span>
              </li>
            ))}
          </ul>
          <Button asChild size="lg" className="mt-10 h-12 px-7 text-base">
            <Link to="/designer" search={{ template: undefined }}>
              Open the store designer <Palette className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <DesignerMock />
      </div>
    </section>
  );
}

function DesignerMock() {
  return (
    <div className="relative">
      <div className="absolute -bottom-3 -left-3 h-full w-full rounded-xl bg-primary/15" />
      <div className="relative overflow-hidden rounded-xl border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b bg-ink px-4 py-3 text-ink-foreground">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            <span className="h-2.5 w-2.5 rounded-full bg-gold" />
            <span className="h-2.5 w-2.5 rounded-full bg-leaf" />
          </div>
          <span className="text-[10px] uppercase tracking-widest text-ink-muted">
            Sartorial store designer
          </span>
          <ShoppingBag className="h-4 w-4" />
        </div>
        <div className="grid grid-cols-[112px_1fr]">
          <div className="space-y-2.5 border-r bg-muted/70 p-3">
            {["Brand", "Colors", "Type", "Sections", "Publish"].map((s, i) => (
              <div
                key={s}
                className={
                  i === 1
                    ? "rounded-md border border-primary/50 bg-card px-2.5 py-2 text-[10px] font-bold"
                    : "rounded-md border border-transparent px-2.5 py-2 text-[10px] font-semibold text-muted-foreground"
                }
              >
                {s}
              </div>
            ))}
          </div>
          <div className="space-y-3 bg-background p-4">
            <div className="h-6 rounded bg-primary" />
            <div className="flex items-center justify-between rounded-md border bg-card px-3 py-2">
              <span className="font-display text-xs font-bold">Ade Stitches</span>
              <span className="h-2 w-10 rounded bg-muted" />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {[0, 1].map((i) => (
                <div key={i} className="overflow-hidden rounded-md border bg-card">
                  <div className={i === 0 ? "h-20 bg-terracotta/30" : "h-20 bg-adire/25"} />
                  <div className="space-y-1.5 p-2">
                    <div className="h-2 w-3/4 rounded bg-muted" />
                    <div className="h-2 w-1/3 rounded bg-primary/40" />
                  </div>
                </div>
              ))}
            </div>
            <div className="h-16 rounded bg-gold/30" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Plans() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

  return (
    <section id="plans" className="bg-ink py-20 text-ink-foreground lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold">Plans</p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            Pricing that fits your label's measurements
          </h2>
          <p className="mt-4 text-base text-ink-muted">
            Start free forever. Upgrade when the orders do — every plan includes payments, logistics
            and the marketplace.
          </p>
          <div className="mt-8 inline-flex rounded-lg border border-ink-line p-1">
            {(["monthly", "annual"] as const).map((b) => (
              <button
                key={b}
                onClick={() => setBilling(b)}
                className={
                  "rounded-md px-5 py-2 text-sm font-semibold capitalize transition-colors " +
                  (billing === b
                    ? "bg-primary text-primary-foreground"
                    : "text-ink-muted hover:text-ink-foreground")
                }
              >
                {b === "annual" ? "Annual · save 20%" : "Monthly"}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-14 grid items-stretch gap-6 lg:grid-cols-3">
          {plans.map((p) => {
            const price = billing === "annual" ? p.annual : p.monthly;
            return (
              <div
                key={p.id}
                className={
                  "relative flex flex-col rounded-xl p-7 " +
                  (p.highlight
                    ? "border-2 border-primary bg-ink-deep shadow-[0_0_60px_-15px] shadow-primary/40 lg:-translate-y-3"
                    : "border border-ink-line bg-ink")
                }
              >
                {p.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-foreground">
                    Most chosen
                  </span>
                )}
                <h3 className="font-display text-xl font-bold">{p.name}</h3>
                <p className="mt-1 text-sm text-ink-muted">{p.tagline}</p>
                <div className="mt-6 flex items-baseline gap-1.5">
                  <span className="font-display text-5xl font-extrabold">${price}</span>
                  <span className="text-sm text-ink-muted">
                    /month{billing === "annual" && price > 0 ? ", billed annually" : ""}
                  </span>
                </div>
                <ul className="mt-7 flex-1 space-y-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                      <span className="text-ink-foreground/85">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  size="lg"
                  variant={p.highlight ? "default" : "outline"}
                  className={
                    "mt-8 h-11 " +
                    (p.highlight
                      ? ""
                      : "border-ink-line bg-transparent text-ink-foreground hover:bg-ink-line hover:text-ink-foreground")
                  }
                >
                  <Link to="/signup">{p.cta}</Link>
                </Button>
              </div>
            );
          })}
        </div>
        <p className="mt-10 text-center text-xs text-ink-muted">
          All plans: unlimited orders · secure checkout · seller protection · cancel anytime.
          Marketplace fees apply only when we bring you the buyer.
        </p>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
      <SectionHeading eyebrow="Designer voices" title="Tailored feedback" />
      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {testimonials.map((t) => (
          <figure key={t.name} className="flex flex-col rounded-xl border bg-card p-7">
            <span className="font-display text-4xl font-extrabold leading-none text-primary">
              "
            </span>
            <blockquote className="mt-2 flex-1 text-sm leading-relaxed text-foreground/85">
              {t.quote}
            </blockquote>
            <figcaption className="mt-6 border-t pt-4">
              <p className="text-sm font-bold">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.brand}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="bg-primary px-4 py-16 text-center text-primary-foreground sm:px-6 lg:py-20">
      <div className="mx-auto max-w-2xl">
        <Scissors className="mx-auto h-8 w-8 opacity-80" />
        <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight sm:text-5xl">
          Thread your first sale today.
        </h2>
        <p className="mt-4 text-base opacity-90">
          Free forever plan · Your store live in 2 minutes · No card needed.
        </p>
        <Button
          asChild
          size="lg"
          className="mt-8 h-12 bg-ink px-8 text-base text-ink-foreground hover:bg-ink-deep"
        >
          <Link to="/signup">
            Open your store <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
