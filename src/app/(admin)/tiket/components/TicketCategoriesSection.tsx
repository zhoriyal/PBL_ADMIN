import type { TicketCategory } from "./types";

interface TicketCategoriesSectionProps {
  loading: boolean;
  categories: TicketCategory[];
  onAdd: () => void;
  onEdit: (category: TicketCategory) => void;
}

export default function TicketCategoriesSection({
  loading,
  categories,
  onAdd,
  onEdit,
}: TicketCategoriesSectionProps) {
  return (
    <section style={{ backgroundColor: "#FFFFFF", borderRadius: "14px", border: "1px solid #E7E5E4", padding: "20px", marginBottom: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
        <div>
          <h2 style={{ fontFamily: "sans-serif", fontSize: "12px", fontWeight: "800", margin: 0, color: "#1C1917", letterSpacing: "0.5px" }}>KATEGORI & TARIF TIKET MASUK</h2>
          <p style={{ fontFamily: "sans-serif", fontSize: "11px", color: "#78716C", margin: "4px 0 0 0" }}>Atur besaran harga tiket dan batas kuota harian pengunjung</p>
        </div>
        <button onClick={onAdd} style={{ backgroundColor: "#224229", color: "#FFFFFF", border: "none", borderRadius: "8px", padding: "8px 16px", fontSize: "12px", fontWeight: "600", fontFamily: "sans-serif", cursor: "pointer" }}>
          + Tambah Kategori Tiket
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
        {loading ? <p style={{ fontFamily: "sans-serif", fontSize: "12px", color: "#78716C" }}>Memuat kategori...</p> :
          categories.map((category) => (
            <div key={category.id} style={{ backgroundColor: "#FAFAF9", borderRadius: "10px", border: "1px solid #F5F5F4", padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <span style={{ fontFamily: "sans-serif", backgroundColor: category.badge_bg, color: category.badge_color, fontSize: "9px", fontWeight: "800", padding: "3px 8px", borderRadius: "4px", letterSpacing: "0.5px" }}>{category.badge}</span>
                <button onClick={() => onEdit(category)} style={{ fontFamily: "sans-serif", background: "none", border: "none", color: "#78716C", fontSize: "11px", cursor: "pointer", fontWeight: "600" }}>✏️ Edit</button>
              </div>
              <h3 style={{ fontFamily: "sans-serif", fontSize: "14px", fontWeight: "700", color: "#1C1917", margin: "0 0 4px 0" }}>{category.title}</h3>
              <div style={{ fontFamily: "sans-serif", display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "16px" }}>
                <span style={{ fontSize: "18px", fontWeight: "800", color: "#1C1917" }}>Rp {category.price.toLocaleString("id-ID")}</span>
                <span style={{ fontSize: "11px", color: "#78716C" }}>/ orang</span>
              </div>
              <div style={{ fontFamily: "sans-serif", display: "flex", justifyContent: "space-between", borderTop: "1px dashed #E7E5E4", paddingTop: "10px", fontSize: "11px" }}>
                <span style={{ color: "#78716C" }}>Kuota: <strong style={{ color: "#1C1917" }}>{category.kuota}</strong></span>
                <span style={{ color: category.status === "Aktif" ? "#059669" : "#DC2626", fontWeight: "700" }}>{category.status}</span>
              </div>
            </div>
          ))}
      </div>
    </section>
  );
}
