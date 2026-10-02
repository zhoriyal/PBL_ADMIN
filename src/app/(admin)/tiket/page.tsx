import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manajemen Tiket — Admin Museum Brawijaya",
};

export default function ManajemenTiketPage() {
  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Manajemen Tiket</h1>
        <p className="admin-page-subtitle">Halaman Manajemen Tiket sedang dalam pengembangan.</p>
      </div>
      <div className="admin-page-placeholder">
        <span className="placeholder-icon">🎫</span>
        <p>Konten Manajemen Tiket akan ditampilkan di sini.</p>
      </div>
    </div>
  );
}
