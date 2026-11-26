import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Monitor, Rocket, Smartphone, Undo2 } from "lucide-react";
import { toast } from "sonner";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { StorefrontView } from "@/components/storefront/storefront-view";
import { getTemplate, templates, type StoreTemplate, type TemplateSlug } from "@/data/catalog";
import { listMyStores } from "@/lib/api/catalog";
import {
  getAdminSettings,
  patchAdminSettings,
  settingsToMap,
  stringSetting,
} from "@/lib/api/settings";

export const Route = createFileRoute("/designer")({
  validateSearch: (search: Record<string, unknown>) => ({
    template: typeof search["template"] === "string" ? search["template"] : undefined,
  }),
  head: () => ({
    meta: [
      {
        title: "Store Designer — Sartorial",
        name: "description",
        content:
          "Design your Sartorial storefront live — pick a default design, swap colors, type and layout, then publish to your own domain.",
      },
      {
        property: "og:title",
        content: "Store Designer — Sartorial",
      },
      {
        property: "og:description",
        content:
          "Design your Sartorial storefront live — pick a default design, swap colors, type and layout, then publish.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DesignerPage,
});

const swatches = [
  { label: "Crimson", value: "oklch(0.535 0.205 27)", fg: "oklch(0.985 0.005 85)" },
  { label: "Gold", value: "oklch(0.75 0.13 85)", fg: "oklch(0.2 0.02 50)" },
  { label: "Leaf", value: "oklch(0.52 0.1 155)", fg: "oklch(0.98 0.01 85)" },
  { label: "Indigo", value: "oklch(0.42 0.1 265)", fg: "oklch(0.98 0.005 260)" },
  { label: "Terracotta", value: "oklch(0.62 0.16 45)", fg: "oklch(0.98 0.01 85)" },
  { label: "Ink", value: "oklch(0.21 0.018 45)", fg: "oklch(0.975 0.01 84)" },
];

const fonts = [
  { label: "Outfit", value: '"Outfit", sans-serif' },
  { label: "Syne", value: '"Syne", sans-serif' },
  { label: "Fraunces", value: '"Fraunces", serif' },
  { label: "Space Grotesk", value: '"Space Grotesk", sans-serif' },
];

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
        {title}
      </h3>
      <div className="mt-3 space-y-3">{children}</div>
    </div>
  );
}

function DesignerPage() {
  const search = Route.useSearch();
  const [slug, setSlug] = useState<TemplateSlug>(getTemplate(search["template"])?.slug ?? "loom");
  const template = getTemplate(slug) as StoreTemplate;
  const [storeName, setStoreName] = useState("");
  const [tagline, setTagline] = useState(template.tagline);
  const [accent, setAccent] = useState(swatches[0]!);
  const [font, setFont] = useState(fonts[0]!);
  const [heroLayout, setHeroLayout] = useState<"split" | "overlay">("split");
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [showMarquee, setShowMarquee] = useState(true);
  const [showTestimonial, setShowTestimonial] = useState(true);
  const [showCta, setShowCta] = useState(true);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [tenantSlug, setTenantSlug] = useState<string | null>(null);
  const [domain, setDomain] = useState("");
  const [publishing, setPublishing] = useState(false);

  // Load the live store identity + design from the settings API.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stores = await listMyStores();
        const storeSlug = stores[0]?.slug ?? null;
        if (cancelled) return;
        setTenantSlug(storeSlug);
        const resp = await getAdminSettings(storeSlug);
        if (cancelled) return;
        const map = settingsToMap(resp);
        const name = stringSetting(map, "store.name");
        if (name) setStoreName(name);
        const savedTagline = stringSetting(map, "store.tagline");
        if (savedTagline) setTagline(savedTagline);
        const savedTemplate = stringSetting(map, "storefront.template");
        const savedTemplateObj = getTemplate(savedTemplate);
        if (savedTemplateObj) setSlug(savedTemplateObj.slug);
        const savedAccent = swatches.find((s) => s.value === map["storefront.accent"]);
        if (savedAccent) setAccent(savedAccent);
        const savedFont = fonts.find((f) => f.value === map["storefront.font_display"]);
        if (savedFont) setFont(savedFont);
        const savedHero = stringSetting(map, "storefront.hero_layout");
        if (savedHero === "split" || savedHero === "overlay") setHeroLayout(savedHero);
        if (typeof map["storefront.show_announcement"] === "boolean")
          setShowAnnouncement(map["storefront.show_announcement"]);
        if (typeof map["storefront.show_marquee"] === "boolean")
          setShowMarquee(map["storefront.show_marquee"]);
        if (typeof map["storefront.show_testimonial"] === "boolean")
          setShowTestimonial(map["storefront.show_testimonial"]);
        if (typeof map["storefront.show_cta"] === "boolean") setShowCta(map["storefront.show_cta"]);
        setDomain(stringSetting(map, "store.domain"));
      } catch {
        // Not signed in or no store yet — the designer keeps its local draft.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const pickTemplate = (t: StoreTemplate) => {
    setSlug(t.slug);
    setTagline(t.tagline);
    setAccent(swatches[0]!);
    setFont(fonts.find((f) => t.theme.fontDisplay.startsWith(`"${f.label}`)) ?? fonts[0]!);
    setHeroLayout(t.slug === "lagos" ? "overlay" : "split");
  };

  const storefrontHost = `${domain || tenantSlug || "your-store"}.ecommerce.sartorialsmart.com`;

  const publish = async () => {
    if (publishing) return;
    setPublishing(true);
    try {
      const values: Record<string, unknown> = {
        "store.tagline": tagline,
        "storefront.template": slug,
        "storefront.accent": accent.value,
        "storefront.accent_fg": accent.fg,
        "storefront.font_display": font.value,
        "storefront.hero_layout": heroLayout,
        "storefront.show_announcement": showAnnouncement,
        "storefront.show_marquee": showMarquee,
        "storefront.show_testimonial": showTestimonial,
        "storefront.show_cta": showCta,
      };
      const name = storeName.trim();
      if (name) values["store.name"] = name;
      await patchAdminSettings(values, tenantSlug);
      toast.success(`${name || "Your store"} is live`, {
        description: `Published to ${storefrontHost} on the ${template.name} design.`,
      });
    } catch (e) {
      toast.error("Couldn't publish your design", {
        description: e instanceof Error ? e.message : "Please try again.",
      });
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b bg-ink text-ink-foreground">
        <div className="flex h-18 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Logo />
            <span className="hidden text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted sm:block">
              Store designer · {storeName}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-ink-line bg-transparent text-ink-foreground hover:bg-ink-line hover:text-ink-foreground"
              onClick={() => pickTemplate(template)}
            >
              <Undo2 className="h-4 w-4" /> Reset
            </Button>
            <Button size="sm" disabled={publishing} onClick={() => void publish()}>
              <Rocket className="h-4 w-4" /> {publishing ? "Publishing…" : "Publish"}
            </Button>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-[300px_1fr]">
        <aside className="space-y-8 border-b p-5 lg:sticky lg:top-14 lg:h-[calc(100vh-3.5rem)] lg:overflow-y-auto lg:border-b-0 lg:border-r no-scrollbar">
          <Panel title="Default design">
            {templates.map((t) => (
              <button
                key={t.slug}
                onClick={() => pickTemplate(t)}
                className={
                  "flex w-full items-center gap-3 rounded-lg border p-2.5 text-left transition-colors " +
                  (t.slug === slug
                    ? "border-primary bg-card ring-1 ring-primary"
                    : "border-transparent bg-secondary/60 hover:bg-secondary")
                }
              >
                <img
                  src={t.image}
                  alt={t.name}
                  width={1024}
                  height={1200}
                  loading="lazy"
                  className="h-11 w-11 rounded-md object-cover"
                />
                <span>
                  <span className="block text-sm font-semibold">{t.name}</span>
                  <span className="block text-xs text-muted-foreground">{t.mood}</span>
                </span>
              </button>
            ))}
          </Panel>

          <Panel title="Brand">
            <div className="space-y-1.5">
              <Label htmlFor="store-name">Store name</Label>
              <Input
                id="store-name"
                placeholder="Your store name"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                maxLength={24}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="store-tagline">Hero tagline</Label>
              <Input
                id="store-tagline"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                maxLength={60}
              />
            </div>
          </Panel>

          <Panel title="Accent color">
            <div className="flex flex-wrap gap-2.5">
              {swatches.map((s) => (
                <button
                  key={s.label}
                  title={s.label}
                  onClick={() => setAccent(s)}
                  className={
                    "h-8 w-8 rounded-full transition-transform hover:scale-110 " +
                    (accent.label === s.label ? "ring-2 ring-ring ring-offset-2" : "")
                  }
                  style={{ background: s.value }}
                />
              ))}
            </div>
          </Panel>

          <Panel title="Typography">
            {fonts.map((f) => (
              <button
                key={f.label}
                onClick={() => setFont(f)}
                className={
                  "flex w-full items-center justify-between rounded-md border px-3 py-2.5 text-sm transition-colors " +
                  (font.label === f.label
                    ? "border-primary bg-card"
                    : "border-input bg-background hover:bg-secondary")
                }
              >
                <span className="font-semibold">{f.label}</span>
                <span style={{ fontFamily: f.value }} className="text-muted-foreground">
                  Handwoven in Accra
                </span>
              </button>
            ))}
          </Panel>

          <Panel title="Hero layout">
            <div className="grid grid-cols-2 gap-2">
              {(["split", "overlay"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setHeroLayout(l)}
                  className={
                    "rounded-md border px-3 py-2 text-sm font-semibold capitalize transition-colors " +
                    (heroLayout === l
                      ? "border-primary bg-card"
                      : "border-input bg-background hover:bg-secondary")
                  }
                >
                  {l}
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="Sections">
            {(
              [
                ["Announcement bar", showAnnouncement, setShowAnnouncement],
                ["Textile marquee", showMarquee, setShowMarquee],
                ["Customer love note", showTestimonial, setShowTestimonial],
                ["Mailing-list banner", showCta, setShowCta],
              ] as const
            ).map(([label, value, set]) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-sm">{label}</span>
                <Switch checked={value} onCheckedChange={set} />
              </div>
            ))}
          </Panel>
        </aside>

        <main className="bg-secondary/50 p-4 lg:p-8">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <span className="rounded-md border bg-card px-3 py-1.5 text-xs text-muted-foreground">
              {storefrontHost}
            </span>
            <div className="flex items-center gap-3">
              <div className="inline-flex rounded-lg border bg-card p-1">
                <button
                  onClick={() => setDevice("desktop")}
                  aria-label="Desktop preview"
                  className={
                    "rounded-md px-3 py-1.5 " +
                    (device === "desktop"
                      ? "bg-ink text-ink-foreground"
                      : "text-muted-foreground hover:text-foreground")
                  }
                >
                  <Monitor className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDevice("mobile")}
                  aria-label="Mobile preview"
                  className={
                    "rounded-md px-3 py-1.5 " +
                    (device === "mobile"
                      ? "bg-ink text-ink-foreground"
                      : "text-muted-foreground hover:text-foreground")
                  }
                >
                  <Smartphone className="h-4 w-4" />
                </button>
              </div>
              <Button onClick={() => void publish()} className="lg:hidden" disabled={publishing}>
                <Rocket className="h-4 w-4" /> Publish
              </Button>
            </div>
          </div>
          <div
            className={
              device === "mobile"
                ? "mx-auto w-[390px] max-w-full transition-all"
                : "mx-auto w-full max-w-5xl transition-all"
            }
          >
            <div className="overflow-hidden rounded-xl border shadow-2xl">
              <StorefrontView
                template={template}
                overrides={{
                  storeName,
                  tagline,
                  accent: accent.value,
                  accentFg: accent.fg,
                  fontDisplay: font.value,
                  heroLayout,
                  showAnnouncement,
                  showMarquee,
                  showTestimonial,
                  showCta,
                }}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
