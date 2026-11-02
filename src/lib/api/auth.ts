import { apiRequest, clearTokens, getRefreshToken, setTokens } from "./client";
import type {
  AuthUser,
  LoginResponse,
  PasswordResetConfirmPayload,
  RegisterPayload,
} from "./types";

export async function login(email: string, password: string): Promise<LoginResponse> {
  const data = await apiRequest<LoginResponse>("/auth/login/", {
    method: "POST",
    body: { email, password },
    auth: false,
  });
  setTokens({ access: data.access, refresh: data.refresh });
  return data;
}

export async function register(payload: RegisterPayload): Promise<AuthUser> {
  return apiRequest<AuthUser>("/auth/register/", {
    method: "POST",
    body: payload,
    auth: false,
  });
}

export async function fetchMe(): Promise<AuthUser> {
  return apiRequest<AuthUser>("/auth/me/");
}

export async function logout(): Promise<void> {
  const refresh = getRefreshToken();
  try {
    if (refresh) {
      await apiRequest<null>("/auth/logout/", { method: "POST", body: { refresh } });
    }
  } catch {
    // Logging out locally must succeed even if the server rejects the token.
  } finally {
    clearTokens();
  }
}

export async function requestPasswordReset(email: string): Promise<void> {
  await apiRequest<null>("/auth/password-reset/", {
    method: "POST",
    body: { email },
    auth: false,
  });
}

export async function confirmPasswordReset(payload: PasswordResetConfirmPayload): Promise<void> {
  await apiRequest<null>("/auth/password-reset/confirm/", {
    method: "POST",
    body: payload,
    auth: false,
  });
}
