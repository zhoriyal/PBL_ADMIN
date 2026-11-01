"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import { useUserAuth } from "@/lib/user-auth";

interface AuthGateProps {
  children: ReactNode;
  fallback?: ReactNode;
  title?: string;
  description?: string;
}

export function AuthGate({
  children,
  fallback,
  title = "Akses Terbatas",
  description = "Silakan masuk dengan akun pengelola museum untuk mengakses fitur ini.",
}: AuthGateProps) {
  const { isAuthenticated, loading } = useUserAuth();

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-700" />
      </div>
    );
  }

  if (!isAuthenticated) {
    if (fallback) return <>{fallback}</>;

    return (
      <div className="mx-auto my-8 max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-700">
          <Lock className="h-7 w-7" />
        </div>
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
        <p className="mt-2 text-xs text-slate-500 leading-relaxed">{description}</p>
        <div className="mt-6 flex flex-col gap-2">
          <Link
            href="/login"
            className="w-full rounded-xl bg-[#1C2D24] py-2.5 text-xs font-semibold text-white transition hover:bg-[#253d30]"
          >
            Masuk ke Akun
          </Link>
          <Link
            href="/register"
            className="w-full rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Daftar Akun Baru
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

