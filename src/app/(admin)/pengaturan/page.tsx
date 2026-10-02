import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pengaturan — Admin Museum Brawijaya",
};

export default function PengaturanPage() {
  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Pengaturan</h1>
        <p className="admin-page-subtitle">Halaman Pengaturan sedang dalam pengembangan.</p>
      </div>
      <div className="admin-page-placeholder">
        <span className="placeholder-icon">⚙️</span>
        <p>Konten Pengaturan akan ditampilkan di sini.</p>
      </div>
    </div>
  );
}
