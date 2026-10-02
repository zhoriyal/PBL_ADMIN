import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pusat Informasi — Admin Museum Brawijaya",
};

export default function PusatInformasiPage() {
  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Pusat Informasi</h1>
        <p className="admin-page-subtitle">Halaman Pusat Informasi sedang dalam pengembangan.</p>
      </div>
      <div className="admin-page-placeholder">
        <span className="placeholder-icon">ℹ️</span>
        <p>Konten Pusat Informasi akan ditampilkan di sini.</p>
      </div>
    </div>
  );
}
