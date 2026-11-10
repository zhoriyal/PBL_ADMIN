"use client";

import { useEffect, useState } from "react";
import { User } from "./types";
import { authApi, getAuthToken, removeAuthToken, setAuthToken } from "./api";

const USER_STORAGE_KEY = "museum-admin-user";

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function setStoredUser(user: User): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export function clearStoredUser(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(USER_STORAGE_KEY);
  removeAuthToken();
}

/**
 * Hook atau helper untuk mengelola sesi user di frontend
 */
export function useUserAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const cached = getStoredUser();
    if (cached) {
      setUser(cached);
    }

    const token = getAuthToken();
    if (token) {
      if (token === "offline-mock-token") {
        setLoading(false);
        return;
      }

      authApi.me()
        .then((res) => {
          if (res.success && res.data) {
            const verifiedUser: User = {
              id: res.data.id,
              nama: res.data.nama || "Admin",
              email: res.data.email || res.data.username || "",
              username: res.data.username,
              role: res.data.role || "ADMIN",
            };
            setUser(verifiedUser);
            setStoredUser(verifiedUser);
          }
        })
        .catch(() => {
          // Jika token tidak valid / server belum running, jangan paksa buang user jika cached ada
          if (!cached) {
            clearStoredUser();
            setUser(null);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token: string, userData: User) => {
    setAuthToken(token);
    setStoredUser(userData);
    setUser(userData);
  };

  const logout = () => {
    clearStoredUser();
    setUser(null);
  };

  return {
    user,
    isAuthenticated: !!user || !!getAuthToken(),
    loading,
    login,
    logout,
  };
}

