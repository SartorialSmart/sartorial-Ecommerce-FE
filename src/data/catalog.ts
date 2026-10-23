import templateLoom from "@/assets/template-loom.jpg";
import templateAdire from "@/assets/template-adire.jpg";
import templateLagos from "@/assets/template-lagos.jpg";
import heroEditorial from "@/assets/hero-editorial.jpg";
import productAnkaraJacket from "@/assets/product-ankara-jacket.jpg";
import productBeadwork from "@/assets/product-beadwork.jpg";
import productKaftan from "@/assets/product-kaftan.jpg";
import productFabrics from "@/assets/product-fabrics.jpg";

export const heroImage = heroEditorial;

export type TemplateSlug = "loom" | "adire" | "lagos";

export interface StoreTheme {
  bg: string;
  surface: string;
  fg: string;
  mutedFg: string;
  accent: string;
  accentFg: string;
  border: string;
  fontDisplay: string;
  fontBody: string;
  fontLabel: string;
}

export interface StoreTemplate {
  slug: TemplateSlug;
  name: string;
  tagline: string;
  mood: string;
  image: string;
  theme: StoreTheme;
  highlights: string[];
}

export const templates: StoreTemplate[] = [
  {
    slug: "loom",
    name: "Atelier Loom",
    tagline: "Handwoven heritage, gallery-lit.",
    mood: "Warm · Editorial · Artisan",
    image: templateLoom,
    theme: {
      bg: "oklch(0.965 0.02 85)",
      surface: "oklch(0.915 0.035 85)",
      fg: "oklch(0.22 0.03 60)",
      mutedFg: "oklch(0.5 0.03 70)",
      accent: "oklch(0.5 0.1 145)",
      accentFg: "oklch(0.98 0.01 85)",
      border: "oklch(0.86 0.03 85)",
      fontDisplay: '"Fraunces", Georgia, serif',
      fontBody: '"Plus Jakarta Sans", sans-serif',
      fontLabel: "Fraunces",
    },
    highlights: ["Editorial lookbook hero", "Weave-story product pages", "Made-to-order waitlist"],
  },
  {
    slug: "adire",
    name: "Studio Adire",
    tagline: "Indigo-dyed calm, modern cut.",
    mood: "Cool · Minimal · Living dye",
    image: templateAdire,
    theme: {
      bg: "oklch(0.975 0.008 260)",
      surface: "oklch(0.93 0.015 260)",
      fg: "oklch(0.25 0.045 265)",
      mutedFg: "oklch(0.5 0.04 265)",
      accent: "oklch(0.42 0.1 265)",
      accentFg: "oklch(0.98 0.005 260)",
      border: "oklch(0.88 0.02 260)",
      fontDisplay: '"Space Grotesk", sans-serif',
      fontBody: '"Plus Jakarta Sans", sans-serif',
      fontLabel: "Space Grotesk",
    },
    highlights: ["Split lookbook hero", "Dye-batch storytelling", "Restock notifications"],
  },
  {
    slug: "lagos",
    name: "Lagos After Dark",
    tagline: "Night-market energy, couture edge.",
    mood: "Bold · Noir · Electric",
    image: templateLagos,
    theme: {
      bg: "oklch(0.16 0.012 45)",
      surface: "oklch(0.22 0.015 45)",
      fg: "oklch(0.965 0.01 84)",
      mutedFg: "oklch(0.72 0.02 70)",
      accent: "oklch(0.535 0.205 27)",
      accentFg: "oklch(0.985 0.005 85)",
      border: "oklch(0.3 0.02 45)",
      fontDisplay: '"Syne", sans-serif',
      fontBody: '"Plus Jakarta Sans", sans-serif',
      fontLabel: "Syne",
    },
    highlights: ["Cinematic full-bleed hero", "Runway drop countdowns", "VIP early-access list"],
  },
];

export function getTemplate(slug: string | undefined): StoreTemplate | undefined {
  return templates.find((t) => t.slug === slug);
}

export interface Product {
  id: string;
  name: string;
  designer: string;
  price: number;
  compareAt?: number;
  image: string;
  tag: string;
  store: TemplateSlug;
  stock: number;
}

export const products: Product[] = [
  {
    id: "p1",
    name: "Red Agbada Couture Gown",
    designer: "Ade Stitches",
    price: 847746,
    image: heroEditorial,
    tag: "Couture",
    store: "lagos",
    stock: 4,
  },
  {
    id: "p2",
    name: "Kente Mermaid Gown",
    designer: "Auntie Efua Weaves",
    price: 953714,
    compareAt: 1112667,
    image: templateLoom,
    tag: "Handwoven",
    store: "loom",
    stock: 2,
  },
  {
    id: "p3",
    name: "Adire Kimono Jacket",
    designer: "Studio Adire",
    price: 198690,
    image: templateAdire,
    tag: "Indigo dye",
    store: "adire",
    stock: 12,
  },
  {
    id: "p4",
    name: "Noir Satin Red-Sash Gown",
    designer: "Maison Kora",
    price: 768270,
    image: templateLagos,
    tag: "Evening",
    store: "lagos",
    stock: 6,
  },
  {
    id: "p5",
    name: "Sankofa Ankara Bomber",
    designer: "Ade Stitches",
    price: 245052,
    compareAt: 291413,
    image: productAnkaraJacket,
    tag: "Wax print",
    store: "lagos",
    stock: 9,
  },
  {
    id: "p6",
    name: "Ruby & Brass Couture Set",
    designer: "Kori Atelier",
    price: 158952,
    image: productBeadwork,
    tag: "Jewellery",
    store: "loom",
    stock: 15,
  },
  {
    id: "p7",
    name: "Embroidered Ilé Kaftan",
    designer: "Ilé Studio",
    price: 125837,
    image: productKaftan,
    tag: "Menswear",
    store: "adire",
    stock: 18,
  },
  {
    id: "p8",
    name: "Wax Print Bolt Bundle",
    designer: "Balogun Fabrics",
    price: 63581,
    image: productFabrics,
    tag: "Fabric",
    store: "adire",
    stock: 3,
  },
];

export function productsFor(store: TemplateSlug): Product[] {
  return products.filter((p) => p.store === store);
}

export interface Plan {
  id: string;
  name: string;
  tagline: string;
  monthly: number;
  annual: number;
  features: string[];
  cta: string;
  highlight?: boolean;
}

export const plans: Plan[] = [
  {
    id: "ankara",
    name: "Ankara",
    tagline: "Start threading your first sale.",
    monthly: 0,
    annual: 0,
    cta: "Start free",
    features: [
      "Free sartorial.store subdomain",
      "Up to 20 products",
      "Storefront designer basics",
      "Sell on the Sartorial marketplace",
      "Paystack, M-Pesa & card checkout",
      "2% platform fee",
    ],
  },
  {
    id: "asooke",
    name: "Aso-Òkè",
    tagline: "For labels ready to grow loud.",
    monthly: 38413,
    annual: 30466,
    cta: "Choose Aso-Òkè",
    highlight: true,
    features: [
      "Everything in Ankara",
      "Custom domain & branded email",
      "Full store designer + all themes",
      "Abandoned-cart recovery",
      "Sales & visitor analytics",
      "Pan-African shipping labels",
      "0.5% platform fee",
    ],
  },
  {
    id: "maison",
    name: "Maison",
    tagline: "For fashion houses with runway plans.",
    monthly: 104644,
    annual: 83450,
    cta: "Go Maison",
    features: [
      "Everything in Aso-Òkè",
      "Up to 5 storefronts",
      "Wholesale & B2B ordering portal",
      "Runway drop scheduling",
      "Fashion-week directory listing",
      "Concierge onboarding",
      "0% platform fee",
    ],
  },
];

export interface Order {
  id: string;
  customer: string;
  item: string;
  total: number;
  status: "Fulfilled" | "In production" | "Awaiting payment" | "Shipped";
  channel: "Storefront" | "Marketplace" | "Instagram" | "WhatsApp";
}

export const recentOrders: Order[] = [
  {
    id: "#10241",
    customer: "Zainab O.",
    item: "Red Agbada Couture Gown",
    total: 847746,
    status: "In production",
    channel: "Instagram",
  },
  {
    id: "#10240",
    customer: "Kwame A.",
    item: "Adire Kimono Jacket",
    total: 198690,
    status: "Fulfilled",
    channel: "Storefront",
  },
  {
    id: "#10239",
    customer: "Naledi M.",
    item: "Kente Mermaid Gown",
    total: 953714,
    status: "Shipped",
    channel: "Marketplace",
  },
  {
    id: "#10238",
    customer: "Tunde F.",
    item: "Embroidered Ilé Kaftan",
    total: 125837,
    status: "Fulfilled",
    channel: "Storefront",
  },
  {
    id: "#10237",
    customer: "Amara N.",
    item: "Sankofa Ankara Bomber",
    total: 245052,
    status: "Awaiting payment",
    channel: "WhatsApp",
  },
  {
    id: "#10236",
    customer: "Fatima S.",
    item: "Ruby & Brass Couture Set",
    total: 158952,
    status: "Fulfilled",
    channel: "Marketplace",
  },
];

export const revenueSeries = [
  { week: "W1", revenue: 2450516, orders: 52 },
  { week: "W2", revenue: 2927373, orders: 61 },
  { week: "W3", revenue: 2622714, orders: 57 },
  { week: "W4", revenue: 3629413, orders: 78 },
  { week: "W5", revenue: 4132762, orders: 89 },
  { week: "W6", revenue: 3907579, orders: 83 },
  { week: "W7", revenue: 4516897, orders: 94 },
  { week: "W8", revenue: 4318206, orders: 91 },
  { week: "W9", revenue: 5152706, orders: 106 },
  { week: "W10", revenue: 5497103, orders: 112 },
  { week: "W11", revenue: 5854746, orders: 118 },
  { week: "W12", revenue: 6477310, orders: 131 },
];

export const salesChannels = [
  { name: "Your storefront", share: 46 },
  { name: "Sartorial marketplace", share: 31 },
  { name: "Instagram shop", share: 15 },
  { name: "WhatsApp catalog", share: 8 },
];

export const lowStock = [
  { name: "Kente Mermaid Gown", left: 2 },
  { name: "Red Agbada Couture Gown", left: 4 },
  { name: "Wax Print Bolt Bundle", left: 3 },
];

export const testimonials = [
  {
    quote:
      "I moved my Instagram DM chaos to Sartorial in one weekend. My first month online outsold my best market day.",
    name: "Adeola Bankole",
    brand: "Ade Stitches, Lagos",
  },
  {
    quote:
      "The store designer made my label look like a Paris fashion house. Customers pay couture prices now — and they do.",
    name: "Kora Mensah",
    brand: "Maison Kora, Accra",
  },
  {
    quote:
      "Payments, delivery to Nairobi, and restock alerts in one dashboard. It feels like it was built for us, not translated for us.",
    name: "Wanjiru Kamau",
    brand: " Studio Adire, Nairobi",
  },
];

export const textileWords = [
  "ANKARA",
  "ADIRE",
  "KENTE",
  "BOGOLAN",
  "ASO-ÒKÈ",
  "GELE",
  "SHWESHWE",
  "BÀTÀRÍ",
  "KIKOY",
  "BARK CLOTH",
];
