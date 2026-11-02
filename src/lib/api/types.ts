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
