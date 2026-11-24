import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, Rocket } from "lucide-react";
import { toast } from "sonner";

import { Logo } from "@/components/brand/logo";
import { StorefrontView } from "@/components/storefront/storefront-view";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getPlans, loadPlans, templates, type Plan, type TemplateSlug } from "@/data/catalog";
import { currencies, DEFAULT_CURRENCY, formatCurrency, type CurrencyCode } from "@/lib/currency";

export const Route = createFileRoute("/setup")({
  head: () => ({
    meta: [
      {
        title: "Store setup — Sartorial",
        name: "description",
        content: "Set up your Sartorial storefront in four quick steps.",
      },
      { property: "og:title", content: "Store setup — Sartorial" },
      {
        property: "og:description",
        content: "Set up your Sartorial storefront in four quick steps.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SetupPage,
});

const STEPS = ["Store basics", "Default design", "Brand look", "Domain & plan"] as const;

const accents = [
  { label: "Crimson", value: "oklch(0.535 0.205 27)", fg: "oklch(0.985 0.005 85)" },
  { label: "Gold", value: "oklch(0.75 0.13 85)", fg: "oklch(0.2 0.02 50)" },
  { label: "Leaf", value: "oklch(0.52 0.1 155)", fg: "oklch(0.98 0.01 85)" },
  { label: "Indigo", value: "oklch(0.42 0.1 265)", fg: "oklch(0.98 0.005 260)" },
  { label: "Terracotta", value: "oklch(0.62 0.16 45)", fg: "oklch(0.98 0.01 85)" },
  { label: "Ink", value: "oklch(0.21 0.018 45)", fg: "oklch(0.975 0.01 84)" },
];

const fonts = [
  { label: "Outfit", value: '"Outfit", sans-serif' },
  { label: "Fraunces", value: '"Fraunces", serif' },
  { label: "Space Grotesk", value: '"Space Grotesk", sans-serif' },
  { label: "Syne", value: '"Syne", sans-serif' },
];

const cities = [
  "Lagos, Nigeria",
  "Accra, Ghana",
  "Nairobi, Kenya",
  "Kigali, Rwanda",
  "Dakar, Senegal",
  "Johannesburg, South Africa",
];

function PanelTitle({ title, note }: { title: string; note: string }) {
  return (
    <div className="mb-5">
      <h2 className="font-display text-xl font-bold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{note}</p>
    </div>
  );
}

function SetupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const [storeName, setStoreName] = useState("");
  const [tagline, setTagline] = useState("");
  const [city, setCity] = useState(cities[0]!);
  const [currency, setCurrency] = useState<CurrencyCode>(DEFAULT_CURRENCY);
  const [category, setCategory] = useState("Womenswear");

  const [slug, setSlug] = useState<TemplateSlug>("loom");
  const [accentIdx, setAccentIdx] = useState(0);
  const [fontIdx, setFontIdx] = useState(0);

  const [domain, setDomain] = useState("");
  const [planId, setPlanId] = useState("asooke");
  const [plansState, setPlansState] = useState<Plan[]>([]);

  useEffect(() => {
    const pending = window.sessionStorage.getItem("sartorial.pending_store_name");
    if (pending) {
      setStoreName(pending);
      setDomain(
        pending
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),
      );
    }
    loadPlans().then(setPlansState);
  }, []);

  const template = templates.find((t) => t.slug === slug) ?? templates[0]!;
  const accent = accents[accentIdx]!;
  const font = fonts[fontIdx]!;

  const launch = () => {
    const plan = plansState.find((p) => p.id === planId) ?? plansState[0]!;
    toast.success(`${storeName} is live!`, {
      description: `Launched on the ${template.name} design with the ${plan.name} plan.`,
    });
    void navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b bg-ink text-ink-foreground">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Logo compact />
            <span className="hidden text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted sm:block">
              Store setup
            </span>
          </div>
          <span className="text-xs text-ink-muted">
            Step {step + 1} of {STEPS.length}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <ol className="mb-10 flex items-center gap-2 sm:gap-4">
          {STEPS.map((label, i) => (
            <li key={label} className="flex flex-1 items-center gap-2 sm:gap-3">
              <span
                className={
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold " +
                  (i < step
                    ? "border-primary bg-primary text-primary-foreground"
                    : i === step
                      ? "border-primary bg-background text-primary"
                      : "border-border bg-secondary text-muted-foreground")
                }
              >
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <span
                className={
                  "hidden text-xs font-semibold sm:block " +
                  (i === step ? "text-foreground" : "text-muted-foreground")
                }
              >
                {label}
              </span>
              {i < STEPS.length - 1 && <span className="h-px flex-1 bg-border" />}
            </li>
          ))}
        </ol>

        <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
          {step === 0 && (
            <div>
              <PanelTitle
                title="Tell us about your label"
                note="This shapes your storefront, checkout currency and shipping defaults."
              />
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="setup-store">Store name</Label>
                  <Input
                    id="setup-store"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    maxLength={24}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="setup-tagline">Hero tagline</Label>
                  <Input
                    id="setup-tagline"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    maxLength={60}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>City &amp; country</Label>
                  <Select value={city} onValueChange={setCity}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Currency</Label>
                  <Select
                    value={currency}
                    onValueChange={(value) => setCurrency(value as CurrencyCode)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>What do you sell?</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Womenswear">Womenswear</SelectItem>
                      <SelectItem value="Menswear">Menswear</SelectItem>
                      <SelectItem value="Unisex">Unisex</SelectItem>
                      <SelectItem value="Accessories & jewellery">
                        Accessories &amp; jewellery
                      </SelectItem>
                      <SelectItem value="Fabrics & textiles">Fabrics &amp; textiles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <PanelTitle
                title="Pick a default design"
                note="Every design is fully editable later in the store designer — nothing is locked."
              />
              <div className="grid gap-4 sm:grid-cols-3">
                {templates.map((t) => (
                  <button
                    key={t.slug}
                    type="button"
                    onClick={() => setSlug(t.slug)}
                    className={
                      "rounded-xl border p-3 text-left transition-colors " +
                      (t.slug === slug
                        ? "border-primary ring-1 ring-primary"
                        : "hover:border-foreground/30")
                    }
                  >
                    <img
                      src={t.image}
                      alt={t.name}
                      width={1024}
                      height={1200}
                      loading="lazy"
                      className="aspect-[4/5] w-full rounded-lg object-cover"
                    />
                    <p className="mt-3 text-sm font-bold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.mood}</p>
                    <ul className="mt-3 space-y-1.5">
                      {t.highlights.map((h) => (
                        <li
                          key={h}
                          className="flex items-start gap-1.5 text-xs text-muted-foreground"
                        >
                          <Check className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <PanelTitle
                title="Make it yours"
                note="Choose an accent color and heading font — see it live on the right."
              />
              <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
                <div className="space-y-6">
                  <div>
                    <Label>Accent color</Label>
                    <div className="mt-3 flex flex-wrap gap-2.5">
                      {accents.map((s, i) => (
                        <button
                          key={s.label}
                          type="button"
                          title={s.label}
                          onClick={() => setAccentIdx(i)}
                          className={
                            "h-9 w-9 rounded-full transition-transform hover:scale-110 " +
                            (accentIdx === i ? "ring-2 ring-ring ring-offset-2" : "")
                          }
                          style={{ background: s.value }}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Heading font</Label>
                    <div className="mt-3 space-y-2">
                      {fonts.map((f, i) => (
                        <button
                          key={f.label}
                          type="button"
                          onClick={() => setFontIdx(i)}
                          className={
                            "flex w-full items-center justify-between rounded-md border px-3 py-2.5 text-sm transition-colors " +
                            (fontIdx === i
                              ? "border-primary bg-secondary/60"
                              : "hover:bg-secondary/60")
                          }
                        >
                          <span className="font-semibold">{f.label}</span>
                          <span style={{ fontFamily: f.value }} className="text-muted-foreground">
                            Handwoven in Accra
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="max-h-[460px] overflow-hidden rounded-xl border shadow-sm">
                  <StorefrontView
                    template={template}
                    overrides={{
                      storeName,
                      tagline,
                      accent: accent.value,
                      accentFg: accent.fg,
                      fontDisplay: font.value,
                      showTestimonial: false,
                      showCta: false,
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <PanelTitle
                title="Claim your address & plan"
                note="Start on a free Sartorial subdomain — connect a custom domain any time."
              />
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <Label htmlFor="domain">Your storefront address</Label>
                  <div className="flex items-center overflow-hidden rounded-md border">
                    <span className="border-r bg-secondary px-3 py-2.5 text-sm text-muted-foreground">
                      sartorialecommerce.com/
                    </span>
                    <Input
                      id="domain"
                      value={domain}
                      onChange={(e) =>
                        setDomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))
                      }
                      className="rounded-none border-0"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Custom domains (like yourdomain.com) connect in Dashboard → Store settings.
                  </p>
                </div>
                <div>
                  <Label>Choose a plan</Label>
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    {plansState.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPlanId(p.id)}
                        className={
                          "rounded-xl border p-4 text-left transition-colors " +
                          (p.id === planId
                            ? "border-primary ring-1 ring-primary"
                            : "hover:border-foreground/30")
                        }
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold">{p.name}</p>
                          {p.id === planId && <Check className="h-4 w-4 text-primary" />}
                        </div>
                        <p className="mt-1 font-display text-2xl font-bold">
                          {p.monthly === 0 ? "Free" : formatCurrency(p.monthly)}
                          {p.monthly > 0 && (
                            <span className="text-xs font-medium text-muted-foreground">/mo</span>
                          )}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">{p.tagline}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between border-t pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              className={step === 0 ? "invisible" : ""}
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button
                type="button"
                onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
              >
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button type="button" onClick={launch}>
                <Rocket className="h-4 w-4" /> Launch my store
              </Button>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Everything here can be changed later from your dashboard — nothing is final.
        </p>
      </main>
    </div>
  );
}
