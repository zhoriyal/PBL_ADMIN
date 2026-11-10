interface TicketStatsSectionProps {
  loading: boolean;
  stats: {
    terjualHariIni: number;
    sudahCheckIn: number;
    pendapatanHariIni: number;
  };
}

export default function TicketStatsSection({ loading, stats }: TicketStatsSectionProps) {
  const cards = [
    { label: "TOTAL TIKET TERJUAL HARI INI", value: `${stats.terjualHariIni}`, unit: "Tiket", icon: "🎫", backgroundColor: "#FEF3C7" },
    { label: "SUDAH CHECK-IN HARI INI", value: `${stats.sudahCheckIn}`, unit: "Pengunjung", icon: "📲", backgroundColor: "#D1FAE5" },
    { label: "PENDAPATAN HARI INI", value: `Rp ${stats.pendapatanHariIni.toLocaleString("id-ID")}`, unit: "", icon: "👝", backgroundColor: "#DBEAFE" },
  ];

  return (
    <section
      aria-label="Statistik tiket"
      style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}
    >
      {cards.map((card) => (
        <div key={card.label} style={{ backgroundColor: "#FFFFFF", padding: "18px 20px", borderRadius: "14px", border: "1px solid #E7E5E4", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "10px", backgroundColor: card.backgroundColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>{card.icon}</div>
          <div>
            <span style={{ fontFamily: "sans-serif", fontSize: "10px", fontWeight: "700", color: "#A8A29E", letterSpacing: "0.5px", textTransform: "uppercase" }}>{card.label}</span>
            <div style={{ marginTop: "2px", display: "flex", alignItems: "baseline", gap: "6px" }}>
              <span style={{ fontFamily: "sans-serif", fontSize: "20px", fontWeight: "800", color: "#1C1917" }}>{loading ? "..." : card.value}</span>
              {card.unit && <span style={{ fontFamily: "sans-serif", fontSize: "12px", color: "#78716C" }}>{card.unit}</span>}
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
