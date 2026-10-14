
"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Sidebar from "../../components/admin/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-layout">
      {/* Overlay untuk tampilan mobile */}
      {sidebarOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          aria-label="Tutup navigasi"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar desktop dan mobile */}
      <aside
        className={`admin-sidebar-shell ${
          sidebarOpen ? "sidebar-open" : ""
        }`}
      >
        <Sidebar onNavigate={() => setSidebarOpen(false)} />
      </aside>

      {/* Konten utama */}
      <div className="admin-content">
        {/* Header mobile */}
        <header className="mobile-header">
          <button
            type="button"
            className="mobile-menu-button"
            aria-label={sidebarOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={sidebarOpen}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <div className="mobile-brand">
            <span>MUSEUM</span>
            <strong>BRAWIJAYA</strong>
          </div>
        </header>

        <main className="admin-main">
          {children}
        </main>
      </div>
    </div>
  );
}
