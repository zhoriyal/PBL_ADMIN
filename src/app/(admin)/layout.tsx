"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/admin/Sidebar";
import Topbar from "../../components/admin/Topbar";
import LogoutModal from "../../components/admin/LogoutModal";
import AdminPageTransitionLoader from "../../components/admin/AdminPageTransitionLoader";
import { clearStoredUser, useUserAuth } from "@/lib/user-auth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, loading } = useUserAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

<<<<<<< HEAD
  // Proteksi rute frontend: Jika tidak ada sesi/token, arahkan ke /login
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
=======
  // Keep the client-side session check in sync with the request-level proxy guard.
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login");
>>>>>>> bcf79bfe6fe60e77957d0e2ccf2734df9699f6e6
    }
  }, [isAuthenticated, loading, router]);

  const handleConfirmLogout = async () => {
    try {
      clearStoredUser();
    } catch (_) {}
    setLogoutModalOpen(false);
    router.push("/login");
  };

  if (loading) {
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

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="admin-layout min-h-screen">
      {/* Loading Screen Perpindahan Halaman Admin */}
      <AdminPageTransitionLoader />

      {/* Pop Up Konfirmasi Log Out */}
      <LogoutModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
      />

      {/* Overlay untuk tampilan mobile */}
      {sidebarOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          aria-label="Tutup navigasi"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigasi Admin */}
      <Sidebar
        onNavigate={() => setSidebarOpen(false)}
        onOpenLogout={() => setLogoutModalOpen(true)}
      />

      {/* Konten Utama Admin */}
      <div className="admin-main">
        <Topbar
          onOpenLogout={() => setLogoutModalOpen(true)}
        />

        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}
