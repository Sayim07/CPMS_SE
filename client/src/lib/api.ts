/**
 * CPMS API Client Helper
 * Provides seamless connection between React Frontend and Express Backend (/api/v1).
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

export function getStoredToken(): string | null {
  return localStorage.getItem("cpms_token");
}

export function setStoredToken(token: string | null): void {
  if (token) {
    localStorage.setItem("cpms_token", token);
  } else {
    localStorage.removeItem("cpms_token");
  }
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ ok: boolean; data?: T; error?: any; status: number }> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const json = await res.json().catch(() => null);

    return {
      ok: res.ok,
      status: res.status,
      data: json?.data ?? json,
      error: !res.ok ? json?.error || json : undefined,
    };
  } catch (err: any) {
    return {
      ok: false,
      status: 0,
      error: {
        code: "NETWORK_ERROR",
        message: err.message || "Failed to connect to backend API server.",
      },
    };
  }
}

