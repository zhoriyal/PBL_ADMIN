import { cookies } from "next/headers";
import { AUTH_TOKEN_COOKIE } from "./auth-constants";

interface AuthResponse {
  success?: boolean;
  data?: {
    role?: string;
  };
}

const ADMIN_ROLES = new Set(["ADMIN", "SUPERADMIN", "STAFF"]);

function decodeJwtPayload(token: string): { role?: string; exp?: number } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = Buffer.from(base64, "base64").toString("utf-8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export async function isAuthenticatedAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_TOKEN_COOKIE)?.value.trim();
  if (!token) {
    return false;
  }

  // 1. Dukungan token offline mock
  if (token === "offline-mock-token") {
    return true;
  }

  // 2. Verifikasi kedaluwarsa token dari payload
  const payload = decodeJwtPayload(token);
  if (payload?.exp && payload.exp * 1000 < Date.now()) {
    return false; // Token sudah kedaluwarsa
  }

  // 3. Verifikasi ke backend jika server aktif
  const apiBaseUrl = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").trim();
  let base = apiBaseUrl.replace(/\/+$/, "");
  if (!base.endsWith("/api")) {
    base = `${base}/api`;
  }

  try {
    const response = await fetch(`${base}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (response.ok) {
      const auth = (await response.json()) as AuthResponse;
      const role = auth.data?.role?.toUpperCase();
      return auth.success === true && !!role && ADMIN_ROLES.has(role);
    }

    if (response.status === 401 || response.status === 403) {
      return false;
    }
  } catch {
    // Backend sedang down / restart
  }

  // 4. Fallback jika backend mengembalikan 404 (misal backend belum di-restart) atau offline
  if (payload) {
    const role = payload.role?.toUpperCase();
    return !!role && ADMIN_ROLES.has(role);
  }

  return false;
}
