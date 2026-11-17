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
  const token = (await cookies()).get(AUTH_TOKEN_COOKIE)?.value.trim();
  if (!token) {
    return false;
  }

  const apiBaseUrl = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "").trim();
  if (!apiBaseUrl) {
    throw new Error("API_URL atau NEXT_PUBLIC_API_URL belum dikonfigurasi");
  }
  const response = await fetch(`${apiBaseUrl.replace(/\/+$/, "")}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (response.status === 401 || response.status === 403) {
    return false;
  }
  if (!response.ok) {
    throw new Error(`Gagal memverifikasi sesi admin (HTTP ${response.status})`);
  }

  const auth = await response.json() as AuthResponse;
  const role = auth.data?.role?.toUpperCase();
  return auth.success === true && !!role && ADMIN_ROLES.has(role);
}
