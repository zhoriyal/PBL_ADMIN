"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Info,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
  Ticket,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tiket", label: "Manajemen Tiket", icon: Ticket },
  { href: "/koleksi", label: "Katalog Koleksi", icon: BookOpen },
  { href: "/informasi", label: "Pusat Informasi", icon: Info },
  { href: "/ulasan", label: "Ulasan / Feedback", icon: MessageSquare },
  { href: "/pengaturan", label: "Pengaturan", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect x="6" y="52" width="52" height="5" rx="2" />
            <rect x="10" y="30" width="6" height="22" rx="1" />
            <rect x="22" y="30" width="6" height="22" rx="1" />
            <rect x="36" y="30" width="6" height="22" rx="1" />
            <rect x="48" y="30" width="6" height="22" rx="1" />
            <polygon points="4,30 32,10 60,30" />
          </svg>
        </div>
        <div className="sidebar-logo-text">
          <span className="sidebar-logo-museum">Museum</span>
          <span className="sidebar-logo-brawijaya">Brawijaya</span>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Navigasi admin">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={`sidebar-nav-item${isActive ? " active" : ""}`}
            >
              <span className="sidebar-nav-icon"><Icon size={18} /></span>
              <span className="sidebar-nav-label">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <Link href="/login" className="sidebar-logout">
          <LogOut size={18} />
          <span>Log Out</span>
        </Link>
      </div>
    </aside>
  );
}