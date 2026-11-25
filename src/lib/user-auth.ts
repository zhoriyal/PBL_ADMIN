"use client";

import { useEffect, useState } from "react";
import { User } from "./types";
import { authApi, getAuthToken, OFFLINE_MOCK_TOKEN, removeAuthToken, setAuthToken } from "./api";

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
    let currentUser = getStoredUser();
    const token = getAuthToken();

    if (!currentUser && token && token !== OFFLINE_MOCK_TOKEN) {
      try {
        const parts = token.split(".");
        if (parts.length === 3) {
          const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
          const payload = JSON.parse(atob(base64));
          currentUser = {
            id: payload.id ?? payload.username ?? "admin",
            nama: payload.nama || "Administrator",
            email: payload.email || payload.username || "admin@museum.com",
            username: payload.username,
            role: payload.role || "ADMIN",
          };
          setStoredUser(currentUser);
        }
      } catch {
        // Abaikan parse error
      }
    }

    if (currentUser) {
      setUser(currentUser);
    }

    if (token) {
      if (token === OFFLINE_MOCK_TOKEN) {
        const mockUser: User = currentUser || {
          id: "admin",
          nama: "Administrator Museum",
          email: "admin@museum.com",
          username: "admin",
          role: "ADMIN",
        };
        setUser(mockUser);
        setStoredUser(mockUser);
        queueMicrotask(() => {
          setLoading(false);
        });
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
        .catch((err) => {
          const msg = String(err?.message || "").toLowerCase();
          // Hanya bersihkan user jika backend secara spesifik menolak token (unauthorized/forbidden)
          if (msg.includes("401") || msg.includes("403") || msg.includes("tidak valid") || msg.includes("kedaluwarsa") || msg.includes("ditolak")) {
            clearStoredUser();
            setUser(null);
          } else if (currentUser) {
            setUser(currentUser);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      queueMicrotask(() => {
        setLoading(false);
      });
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
