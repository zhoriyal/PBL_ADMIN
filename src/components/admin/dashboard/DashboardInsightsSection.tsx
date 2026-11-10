import Link from "next/link";
import type { Review, WeeklyData } from "./types";

interface DashboardInsightsSectionProps {
  weeklyData: WeeklyData[];
  reviews: Review[];
}

export default function DashboardInsightsSection({
  weeklyData,
  reviews,
}: DashboardInsightsSectionProps) {
  return (
    <section
      aria-label="Grafik penjualan dan ulasan terbaru"
      className="dashboard-insights-grid"
      style={{ width: "100%", minWidth: 0 }}
    >
      <div style={{ minWidth: 0, backgroundColor: "#fff", padding: "18px", borderRadius: "12px", border: "1px solid #f0f0f0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <span style={{ fontSize: "11px", fontWeight: "bold", color: "#444" }}>GRAFIK PENJUALAN TIKET MINGGUAN</span>
          <span style={{ fontSize: "10px", backgroundColor: "#f3f4f6", color: "#666", padding: "3px 10px", borderRadius: "12px" }}>7 Hari Terakhir</span>
        </div>
        <div style={{ height: "160px", backgroundColor: "#fafafa", borderRadius: "8px", padding: "16px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "12px", border: "1px solid #f0f0f0" }}>
          {weeklyData.map((item, index) => (
            <div key={item.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "9px", color: "#666", fontWeight: "bold" }}>{item.val}</span>
              <div
                style={{
                  width: "100%",
                  backgroundColor: index === weeklyData.length - 1 ? "#2563eb" : "#cbd5e1",
                  height: `${Math.min(120, Math.max(6, (item.val / 100) * 100))}px`,
                  borderRadius: "4px",
                  transition: "height 0.3s",
                }}
              />
              <span style={{ fontSize: "10px", color: "#888" }}>{item.day}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ minWidth: 0, backgroundColor: "#fff", padding: "18px", borderRadius: "12px", border: "1px solid #f0f0f0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <span style={{ fontSize: "11px", fontWeight: "bold", color: "#444" }}>ULASAN TERBARU</span>
          <Link href="/ulasan" style={{ fontSize: "11px", color: "#b45309", fontWeight: "bold", textDecoration: "none" }}>Lihat Semua</Link>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {reviews.map((review) => (
            <div key={review.id} style={{ backgroundColor: "#f9fafb", padding: "10px 12px", borderRadius: "8px", border: "1px solid #f3f4f6" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: "bold", color: "#333" }}>
                <span>{review.user}</span>
                <span style={{ color: "#d97706" }}>★ {review.rating.toFixed(1)}</span>
              </div>
              <p style={{ fontSize: "10px", color: "#666", margin: "4px 0 0 0", fontStyle: "italic" }}>&ldquo;{review.comment}&rdquo;</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
