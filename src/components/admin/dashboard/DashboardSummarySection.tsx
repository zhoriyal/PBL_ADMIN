interface DashboardSummarySectionProps {
  ticketsSold: number;
  revenue: number;
  collectionCount: number;
}

const cards = [
  { label: "TIKET TERJUAL HARI INI", unit: "Tiket", icon: "🎫", backgroundColor: "#fef3c7" },
  { label: "PENDAPATAN HARI INI", icon: "💵", backgroundColor: "#d1fae5" },
  { label: "TOTAL KATALOG KOLEKSI", unit: "Item", icon: "🏛️", backgroundColor: "#dbeafe" },
];

export default function DashboardSummarySection({
  ticketsSold,
  revenue,
  collectionCount,
}: DashboardSummarySectionProps) {
  const values = [
    ticketsSold.toLocaleString("id-ID"),
    `Rp ${revenue.toLocaleString("id-ID")}`,
    collectionCount.toLocaleString("id-ID"),
  ];

  return (
    <section
      aria-label="Ringkasan dashboard"
      className="dashboard-summary-grid"
      style={{ width: "100%", minWidth: 0 }}
    >
      {cards.map((card, index) => (
        <div
          key={card.label}
          style={{ minWidth: 0, backgroundColor: "#fff", padding: "16px 20px", borderRadius: "12px", border: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}
        >
          <div>
            <span style={{ fontSize: "10px", fontWeight: "600", color: "#888", display: "block" }}>{card.label}</span>
            <div style={{ marginTop: "4px", display: "flex", alignItems: "baseline", gap: "4px" }}>
              <span style={{ fontSize: "22px", fontWeight: "bold", color: "#111" }}>{values[index]}</span>
              {card.unit && <span style={{ fontSize: "12px", color: "#888" }}>{card.unit}</span>}
            </div>
          </div>
          <div style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: card.backgroundColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>
            {card.icon}
          </div>
        </div>
      ))}
    </section>
  );
}
