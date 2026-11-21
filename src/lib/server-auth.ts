import { cookies } from "next/headers";
import { AUTH_TOKEN_COOKIE } from "./auth-constants";

interface AuthResponse {
  success?: boolean;
  data?: {
    role?: string;
  };
}

const ADMIN_ROLES = new Set(["ADMIN", "SUPERADMIN", "STAFF"]);

export async function isAuthenticatedAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_TOKEN_COOKIE)?.value.trim();
  if (!token) {
    return false;
  }

  const apiBaseUrl = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").trim();
  let base = apiBaseUrl.replace(/\/+$/, "");
  if (!base.endsWith("/api")) {
    base = `${base}/api`;
  }

  let response: Response;
  try {
    response = await fetch(`${base}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  } catch {
    // Jika backend sedang down atau restart, redirect ke login tanpa membuat Next.js crash
    return false;
  }

  if (!response.ok) {
    return false;
  }

  try {
    const auth = (await response.json()) as AuthResponse;
    const role = auth.data?.role?.toUpperCase();
    return auth.success === true && !!role && ADMIN_ROLES.has(role);
  } catch {
    return false;
  }
}
