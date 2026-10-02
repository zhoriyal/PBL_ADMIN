import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — Admin Museum Brawijaya",
};

export default function DashboardPage() {
  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Dashboard</h1>
        <p className="admin-page-subtitle">Halaman Dashboard sedang dalam pengembangan.</p>
      </div>
      <div className="admin-page-placeholder">
        <span className="placeholder-icon">📊</span>
        <p>Konten Dashboard akan ditampilkan di sini.</p>
      </div>
    </div>
  );
}
