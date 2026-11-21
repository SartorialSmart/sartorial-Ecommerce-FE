import { API_BASE_URL, TENANT_SLUG } from "./config";

const ACCESS_TOKEN_KEY = "sartorial.access_token";
const REFRESH_TOKEN_KEY = "sartorial.refresh_token";

export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: unknown;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: unknown;

  constructor(status: number, payload: ApiErrorPayload) {
    super(payload.message);
    this.name = "ApiError";
    this.status = status;
    this.code = payload.code;
    this.details = payload.details;
  }
}

function hasStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getAccessToken(): string | null {
  return hasStorage() ? window.localStorage.getItem(ACCESS_TOKEN_KEY) : null;
}

export function getRefreshToken(): string | null {
  return hasStorage() ? window.localStorage.getItem(REFRESH_TOKEN_KEY) : null;
}

export function setTokens(tokens: { access: string; refresh?: string | null }): void {
  if (!hasStorage()) return;
  window.localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access);
  if (tokens.refresh) {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh);
  }
}

export function clearTokens(): void {
  if (!hasStorage()) return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
}

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  auth?: boolean;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  retryOnUnauthorized?: boolean;
  // Defaults to the build-time VITE_TENANT_SLUG. Pass a slug to override it, or
  // null to send no X-Tenant-Slug header at all (e.g. store-agnostic reads).
  tenantSlug?: string | null;
}

async function parseResponse(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(text) as unknown;
    } catch {
      return text;
    }
  }
  return text;
}

function extractError(status: number, data: unknown): ApiError {
  if (data && typeof data === "object" && "error" in data) {
    const error = (data as { error?: unknown }).error;
    if (error && typeof error === "object") {
      const envelope = error as { code?: unknown; message?: unknown; details?: unknown };
      return new ApiError(status, {
        code: typeof envelope.code === "string" ? envelope.code : "error",
        message: typeof envelope.message === "string" ? envelope.message : "The request failed.",
        details: envelope.details,
      });
    }
  }

  if (data && typeof data === "object" && "detail" in data) {
    const detail = (data as { detail?: unknown }).detail;
    if (typeof detail === "string") {
      return new ApiError(status, { code: "error", message: detail });
    }
  }

  return new ApiError(status, {
    code: "error",
    message: `The request failed (${status}).`,
    details: data,
  });
}

let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  const refresh = getRefreshToken();
  if (!refresh) return false;

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh/`, {
          method: "POST",
          headers: { "content-type": "application/json", accept: "application/json" },
          body: JSON.stringify({ refresh }),
        });
        if (!response.ok) {
          clearTokens();
          return false;
        }
        const data = (await response.json()) as { access?: unknown; refresh?: unknown };
        if (typeof data.access !== "string") {
          clearTokens();
          return false;
        }
        setTokens({
          access: data.access,
          refresh: typeof data.refresh === "string" ? data.refresh : refresh,
        });
        return true;
      } catch {
        clearTokens();
        return false;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const {
    method = "GET",
    body,
    auth = true,
    headers = {},
    signal,
    retryOnUnauthorized = true,
    tenantSlug,
  } = options;

  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const requestHeaders: Record<string, string> = {
    accept: "application/json",
    ...headers,
  };

  if (body !== undefined) {
    requestHeaders["content-type"] = "application/json";
  }
  const slug = tenantSlug === undefined ? TENANT_SLUG : tenantSlug;
  if (slug) {
    requestHeaders["x-tenant-slug"] = slug;
  }
  const accessToken = getAccessToken();
  if (auth && accessToken) {
    requestHeaders["authorization"] = `Bearer ${accessToken}`;
  }

  const init: RequestInit = { method, headers: requestHeaders };
  if (body !== undefined) init.body = JSON.stringify(body);
  if (signal) init.signal = signal;

  let response: Response;
  try {
    response = await fetch(url, init);
  } catch {
    throw new ApiError(0, {
      code: "network_error",
      message: "Could not reach the Sartorial API. Check that the backend is running.",
    });
  }

  if (response.status === 401 && auth) {
    if (retryOnUnauthorized && getRefreshToken()) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return apiRequest<T>(path, { ...options, retryOnUnauthorized: false });
      }
    } else {
      clearTokens();
    }
  }

  const data = await parseResponse(response);
  if (!response.ok) {
    throw extractError(response.status, data);
  }
  return data as T;
}
