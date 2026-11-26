export type UserRole = "customer" | "admin" | "supplier" | "seller";

export interface UserProfile {
  phone: string;
  marketing_opt_in: boolean;
  preferred_currency: string;
  email_verified: boolean;
  notify_email: boolean;
  notify_telegram: boolean;
  telegram_chat_id: string;
  telegram_connected: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  date_joined: string;
  profile: UserProfile | null;
}

export interface TokenPair {
  access: string;
  refresh: string;
}

export interface LoginResponse extends TokenPair {
  user: AuthUser;
}

export interface RegisterPayload {
  email: string;
  password: string;
  full_name?: string;
  marketing_opt_in?: boolean;
}

export interface PasswordResetConfirmPayload {
  uid: string;
  token: string;
  new_password: string;
}

export interface TenantStore {
  id: string;
  name: string;
  slug: string;
  type: "erp_subscriber" | "independent";
  status: string;
  logo_url: string | null;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface CreateSimpleProductInput {
  title: string;
  description?: string;
  categoryId?: number | null;
  newCategory?: string;
  sku: string;
  price: string;
  stock: number;
}

export interface CreatedProduct {
  id: string;
  title: string;
  slug: string;
}

export interface AdminProduct {
  id: string;
  title: string;
  slug: string;
  short_id: string;
  description: string;
  category: number | null;
  brand: number | null;
  fulfillment_type: string;
  supplier: string | null;
  is_active: boolean;
  is_flash_sale: boolean;
  discount_percent: string | null;
  features: unknown;
  primary_image: string | null;
  variant_count: number;
  price_from: string | null;
  rating_avg: string | null;
  rating_count: number;
}

export interface AdminProductPatch {
  title?: string;
  description?: string;
  category?: number | null;
  is_active?: boolean;
  is_flash_sale?: boolean;
  discount_percent?: string;
}

export interface AdminProductList {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminProduct[];
}

export interface PricingTier {
  id: string;
  name: string;
  slug: string;
  description: string;
  monthly_price: number;
  annual_price: number;
  platform_fee_percent: string;
  features: string[];
  cta: string;
  tagline: string;
  is_featured: boolean;
  sort_order: number;
  is_active: boolean;
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
