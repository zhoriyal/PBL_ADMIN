"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  CheckCheck,
  ChevronDown,
  LogOut,
  Menu,
  MessageSquare,
  RefreshCw,
  Ticket,
  User,
  UserCheck,
  X,
} from "lucide-react";
import { notifikasiApi, type NotifikasiItem } from "@/lib/api";

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
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

export default function Topbar({
  onOpenLogout,
  onToggleSidebar,
  sidebarOpen,
}: TopbarProps) {
  const pathname = usePathname();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifItems, setNotifItems] = useState<NotifikasiItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const currentMeta = pageTitles[pathname] || {
    title: "PANEL ADMINISTRATOR",
    subtitle: "Museum Brawijaya Malang",
  };

  const loadNotifs = useCallback(async () => {
    try {
      const res = await notifikasiApi.getAll(30);
      if (res.success && Array.isArray(res.data)) {
        setNotifItems(res.data);
        setUnreadCount(Number(res.unread) || res.data.filter((n) => !n.is_read).length);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const first = setTimeout(() => void loadNotifs(), 0);
    // Polling agar notifikasi pemesanan & ulasan baru muncul otomatis
    const interval = setInterval(() => void loadNotifs(), 20_000);
    return () => {
      clearTimeout(first);
      clearInterval(interval);
    };
  }, [loadNotifs]);

  const handleMarkAllRead = async () => {
    try {
      await notifikasiApi.markAllRead();
      setNotifItems((items) => items.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {}
  };

  const handleOpenItem = async (item: NotifikasiItem) => {
    setNotifOpen(false);
    if (!item.is_read) {
      setNotifItems((items) => items.map((n) => (n.id === item.id ? { ...n, is_read: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
      try {
        await notifikasiApi.markRead(item.id);
      } catch {}
    }
  };

  const formatTime = (value: string) => {
    const date = new Date(value.includes("T") ? value : `${value.replace(" ", "T")}Z`);
    if (Number.isNaN(date.getTime())) return value;
    const diffMin = Math.floor((Date.now() - date.getTime()) / 60000);
    if (diffMin < 1) return "Baru saja";
    if (diffMin < 60) return `${diffMin} menit lalu`;
    if (diffMin < 1440) return `${Math.floor(diffMin / 60)} jam lalu`;
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  };

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
    <header className="sticky top-0 z-30 flex min-h-[64px] items-center justify-between gap-2 border-b border-[#E2DDD5] bg-[#FFFFFF]/90 px-3 backdrop-blur-md transition-all duration-200 sm:px-5 md:px-8">
      <button
        type="button"
        className="mobile-menu-button"
        aria-label={sidebarOpen ? "Tutup navigasi" : "Buka navigasi"}
        aria-expanded={sidebarOpen}
        aria-controls="admin-sidebar"
        onClick={onToggleSidebar}
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Title & Subtitle Seragam */}
      <div className="flex min-w-0 flex-1 flex-col justify-center py-2">
        <h1 className="truncate font-sans text-xs font-extrabold uppercase tracking-wider text-[#1E2922] sm:text-base md:text-lg">
          {currentMeta.title}
        </h1>
        <p className="hidden truncate text-xs text-[#727A71] md:block">
          {currentMeta.subtitle}
        </p>
      </div>

      {/* Right Controls: Refresh, Notifications, Profile Dropdown */}
      <div className="flex shrink-0 items-center gap-1 sm:gap-3">
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
              const next = !notifOpen;
              setNotifOpen(next);
              if (next) void loadNotifs();
            }}
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[#E2DDD5] bg-[#FAF8F5] text-[#C9A84C] transition hover:bg-[#EFECE6]"
          >
            <Bell size={16} fill="currentColor" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white ring-2 ring-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-[#E2DDD5] bg-white p-3 shadow-xl z-50">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Notifikasi</span>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                    {unreadCount} Baru
                  </span>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 hover:underline"
                    >
                      <CheckCheck size={12} /> Tandai dibaca
                    </button>
                  )}
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 pt-1">
                {notifItems.length > 0 ? (
                  notifItems.map((n) => {
                    const isBooking = n.type === "BOOKING";
                    return (
                      <Link
                        key={n.id}
                        href={n.link || (isBooking ? "/tiket" : "/ulasan")}
                        onClick={() => void handleOpenItem(n)}
                        className={`flex gap-2.5 rounded-lg px-2 py-2.5 text-xs transition hover:bg-[#FAF8F5] ${n.is_read ? "" : "bg-amber-50/60"}`}
                      >
                        <span
                          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${isBooking ? "bg-emerald-100 text-emerald-700" : "bg-indigo-100 text-indigo-700"}`}
                        >
                          {isBooking ? <Ticket size={14} /> : <MessageSquare size={14} />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center justify-between gap-2">
                            <span className="truncate font-semibold text-slate-800">{n.title}</span>
                            {!n.is_read && <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" />}
                          </span>
                          <span className="mt-0.5 block text-[11px] leading-snug text-slate-500">{n.message}</span>
                          <span className="mt-1 block text-[10px] text-slate-400">{formatTime(n.created_at)}</span>
                        </span>
                      </Link>
                    );
                  })
                ) : (
                  <p className="py-4 text-center text-xs text-slate-400">Belum ada notifikasi</p>
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
