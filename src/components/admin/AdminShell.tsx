"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import LogoutModal from "./LogoutModal";
import AdminPageTransitionLoader from "./AdminPageTransitionLoader";
import { clearStoredUser, useUserAuth } from "@/lib/user-auth";

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, loading } = useUserAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, loading, router]);

  const handleConfirmLogout = async () => {
    clearStoredUser();
    setLogoutModalOpen(false);
    router.replace("/login");
  };

  if (loading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F3EA]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-900 border-t-transparent" />
          <p className="text-xs font-semibold tracking-wider text-emerald-950 uppercase">
            Memuat Sistem Admin...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout min-h-screen">
      <AdminPageTransitionLoader />
      <LogoutModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
      />

      {sidebarOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          aria-label="Tutup navigasi"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        onNavigate={() => setSidebarOpen(false)}
        onOpenLogout={() => setLogoutModalOpen(true)}
      />
      <div className="admin-main">
        <Topbar onOpenLogout={() => setLogoutModalOpen(true)} />
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
