import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ulasan / Feedback — Admin Museum Brawijaya",
};

export default function UlasanFeedbackPage() {
  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Ulasan / Feedback</h1>
        <p className="admin-page-subtitle">Halaman Ulasan / Feedback sedang dalam pengembangan.</p>
      </div>
      <div className="admin-page-placeholder">
        <span className="placeholder-icon">💬</span>
        <p>Konten Ulasan / Feedback akan ditampilkan di sini.</p>
      </div>
    </div>
  );
}
