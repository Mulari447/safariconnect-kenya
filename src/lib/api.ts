// src/lib/api.ts
const API_URL = "http://localhost:4000";

const TOKEN_KEY = "sck_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  const token =
    localStorage.getItem(TOKEN_KEY) ||
    localStorage.getItem("token") ||
    localStorage.getItem("auth_token");
  return token;
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    console.log("[Auth] Token saved to localStorage:", token.slice(0, 15) + "...");
  } else {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("token");
    localStorage.removeItem("auth_token");
    console.log("[Auth] Token removed from localStorage");
  }
}

type ApiError = { error: string; details?: unknown };

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  console.log(`[API] Making ${options.method || "GET"} request to ${path} | Has Token: ${!!token}`);

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 204) return undefined as T;

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    console.error(`[API Error] ${path}:`, body);
    const err = body as ApiError;
    throw new Error(err.error || `Request failed (${res.status})`);
  }

  return body as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: "POST", body: data ? JSON.stringify(data) : undefined }),
  put: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: "PUT", body: data ? JSON.stringify(data) : undefined }),
  patch: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: "PATCH", body: data ? JSON.stringify(data) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};