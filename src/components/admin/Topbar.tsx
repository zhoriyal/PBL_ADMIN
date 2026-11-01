"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, ChevronDown, LogOut, RefreshCw, User, UserCheck } from "lucide-react";
import { dashboardApi } from "@/lib/api";

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": {
    title: "DASHBOARD RINGKASAN",
    subtitle: "Selamat datang kembali di panel administrasi Museum Brawijaya",
  },
  "/tiket": {
    title: "MANAJEMEN TIKET",
    subtitle: "Kelola kuota, harga kategori, data pemesan, dan verifikasi check-in loket",
  },
  "/koleksi": {
    title: "KATALOG KOLEKSI",
    subtitle: "Inventarisasi koleksi artefak senjata, kendaraan tempur, dan arsip bersejarah",
  },
  "/informasi": {
    title: "PUSAT INFORMASI",
    subtitle: "Atur jam operasional, agenda pameran, pengumuman, dan tanya jawab (FAQ)",
  },
  "/ulasan": {
    title: "ULASAN & FEEDBACK",
    subtitle: "Pantau respon, rating bintang pengunjung museum, dan kirim balasan resmi",
  },
  "/pengaturan": {
    title: "PENGATURAN ADMIN",
    subtitle: "Perbarui profil akun pengelola, keamanan sandi, dan preferensi sistem",
  },
};

interface TopbarProps {
  onOpenLogout: () => void;
}

export default function Topbar({ onOpenLogout }: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [notifItems, setNotifItems] = useState<{ id: string; nama: string; total_tiket: number }[]>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const currentMeta = pageTitles[pathname] || {
    title: "PANEL ADMINISTRATOR",
    subtitle: "Museum Brawijaya Malang",
  };

  useEffect(() => {
    async function loadNotifs() {
      try {
        const res = await dashboardApi.getSummary();
        if (res.success && res.data?.notifications?.pendingBookings) {
          setNotifItems(res.data.notifications.pendingBookings);
          setHasUnread(res.data.notifications.pendingBookings.length > 0);
        }
      } catch (_) {}
    }
    loadNotifs();
  }, []);

  // Tutup dropdown jika klik di luar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex min-h-[64px] items-center justify-between border-b border-[#E2DDD5] bg-[#FFFFFF]/90 px-5 backdrop-blur-md transition-all duration-200 md:px-8">
      {/* Title & Subtitle Seragam */}
      <div className="flex flex-col justify-center py-2">
        <h1 className="text-base font-extrabold uppercase tracking-wider text-[#1E2922] font-sans md:text-lg">
          {currentMeta.title}
        </h1>
        <p className="hidden text-xs text-[#727A71] md:block">
          {currentMeta.subtitle}
        </p>
      </div>

      {/* Right Controls: Refresh, Notifications, Profile Dropdown */}
      <div className="flex items-center gap-3">
        {/* Tombol Refresh Halaman */}
        <button
          type="button"
          onClick={() => window.location.reload()}
          title="Segarkan Data"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E2DDD5] bg-[#FAF8F5] text-[#556052] transition hover:bg-[#EFECE6] hover:text-[#1E2922]"
        >
          <RefreshCw size={15} />
        </button>

        {/* Notifikasi */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            aria-label="Notifikasi"
            onClick={() => {
              setNotifOpen(!notifOpen);
              setHasUnread(false);
            }}
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[#E2DDD5] bg-[#FAF8F5] text-[#C9A84C] transition hover:bg-[#EFECE6]"
          >
            <Bell size={16} fill="currentColor" />
            {hasUnread && (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl border border-[#E2DDD5] bg-white p-3 shadow-xl z-50">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Notifikasi Pembayaran</span>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                  {notifItems.length} Menunggu
                </span>
              </div>
              <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 pt-2">
                {notifItems.length > 0 ? (
                  notifItems.map((n, idx) => (
                    <div key={idx} className="py-2 text-xs text-slate-600">
                      <p className="font-semibold text-slate-800">{n.nama}</p>
                      <p className="text-[11px] text-slate-500">{n.total_tiket} Tiket — <Link href="/tiket" className="text-blue-600 hover:underline">Verifikasi di Loket</Link></p>
                    </div>
                  ))
                ) : (
                  <p className="py-4 text-center text-xs text-slate-400">Tidak ada pesanan menunggu verifikasi</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 rounded-full border border-[#E2DDD5] bg-[#FAF8F5] p-1.5 pr-3 transition hover:border-[#C9A84C] hover:bg-white"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2C4A2C] text-[#C9A84C] shadow-sm">
              <User size={15} />
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-xs font-bold leading-none text-[#1E2922]">ADMIN</p>
              <p className="text-[10px] leading-none text-[#858781]">Pengelola</p>
            </div>
            <ChevronDown size={14} className="text-[#727A71]" />
          </button>

          {/* Menu Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-[#E2DDD5] bg-white py-1.5 shadow-xl z-50 animate-in fade-in slide-in-from-top-2">
              <div className="border-b border-slate-100 px-3 py-2 text-xs">
                <p className="font-bold text-slate-800">Administrator</p>
                <p className="text-[10px] text-slate-400">admin@museumbrawijaya.id</p>
              </div>

              <Link
                href="/pengaturan"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium text-slate-700 transition hover:bg-[#FAF8F5] hover:text-[#2C4A2C]"
              >
                <UserCheck size={15} className="text-[#C9A84C]" />
                <span>Edit Profile</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(false);
                  onOpenLogout();
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
              >
                <LogOut size={15} />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
