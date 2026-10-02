import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Katalog Koleksi — Admin Museum Brawijaya",
};

export default function KatalogKoleksiPage() {
  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Katalog Koleksi</h1>
        <p className="admin-page-subtitle">Halaman Katalog Koleksi sedang dalam pengembangan.</p>
      </div>
      <div className="admin-page-placeholder">
        <span className="placeholder-icon">📚</span>
        <p>Konten Katalog Koleksi akan ditampilkan di sini.</p>
      </div>
    </div>
  );
}
