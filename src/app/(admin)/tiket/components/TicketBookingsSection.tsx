import type { TicketBooking } from "./types";

interface TicketBookingsSectionProps {
  loading: boolean;
  bookings: TicketBooking[];
  filteredCount: number;
  searchQuery: string;
  statusFilter: string;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onExport: () => void;
  onShowDetail: (booking: TicketBooking) => void;
  onScan: (booking: TicketBooking) => void;
}

export default function TicketBookingsSection({
  loading,
  bookings,
  filteredCount,
  searchQuery,
  statusFilter,
  currentPage,
  totalPages,
  itemsPerPage,
  onSearchChange,
  onStatusChange,
  onPageChange,
  onExport,
  onShowDetail,
  onScan,
}: TicketBookingsSectionProps) {
  return (
    <section style={{ backgroundColor: "#FFFFFF", borderRadius: "14px", border: "1px solid #E7E5E4", overflow: "hidden" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #F5F5F4", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontFamily: "sans-serif", fontSize: "12px", fontWeight: "800", margin: 0, color: "#1C1917", letterSpacing: "0.5px" }}>DAFTAR PEMESANAN & RIWAYAT TIKET</h2>
          <p style={{ fontFamily: "sans-serif", fontSize: "11px", color: "#78716C", margin: "4px 0 0 0" }}>Data seluruh reservasi dan tiket yang telah dibeli pengunjung</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", fontFamily: "sans-serif" }}>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Cari Kode / Nama..."
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              style={{ padding: "6px 12px 6px 28px", fontSize: "11px", borderRadius: "8px", border: "1px solid #E7E5E4", backgroundColor: "#FAFAF9", outline: "none", width: "180px", fontFamily: "sans-serif" }}
            />
            <span style={{ position: "absolute", left: "8px", top: "6px", fontSize: "11px", color: "#A8A29E" }}>🔍</span>
          </div>
          <select
            value={statusFilter}
            onChange={(event) => onStatusChange(event.target.value)}
            style={{ padding: "6px 12px", fontSize: "11px", borderRadius: "8px", border: "1px solid #E7E5E4", backgroundColor: "#FAFAF9", outline: "none", cursor: "pointer", fontFamily: "sans-serif" }}
          >
            <option value="ALL">Semua Status</option>
            <option value="LUNAS">LUNAS</option>
            <option value="MENUNGGU">MENUNGGU</option>
            <option value="BATAL">BATAL</option>
          </select>
          <button
            onClick={onExport}
            style={{ padding: "6px 14px", borderRadius: "8px", border: "1px solid #FEF08A", backgroundColor: "#FEFCE8", color: "#854D0E", fontSize: "11px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontFamily: "sans-serif" }}
          >
            📥 Ekspor Data
          </button>
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "11px", fontFamily: "sans-serif" }}>
          <thead>
            <tr style={{ backgroundColor: "#FAFAF9", color: "#A8A29E", borderBottom: "1px solid #F5F5F4", fontSize: "10px", letterSpacing: "0.5px" }}>
              <th style={{ padding: "12px 20px" }}>ID TRANSAKSI</th>
              <th style={{ padding: "12px 20px" }}>NAMA PEMBELI</th>
              <th style={{ padding: "12px 20px" }}>TOTAL TIKET</th>
              <th style={{ padding: "12px 20px" }}>TGL KUNJUNGAN</th>
              <th style={{ padding: "12px 20px" }}>TOTAL BIAYA</th>
              <th style={{ padding: "12px 20px" }}>STATUS</th>
              <th style={{ padding: "12px 20px", textAlign: "right" }}>AKSI</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: "24px", textAlign: "center", color: "#78716C", fontFamily: "sans-serif" }}>Memuat data...</td></tr>
            ) : bookings.map((booking) => (
              <tr key={booking.id} style={{ borderBottom: "1px solid #FAFAF9" }}>
                <td style={{ padding: "14px 20px", fontWeight: "800", color: "#1C1917" }}>{booking.id}</td>
                <td style={{ padding: "14px 20px", color: "#44403C" }}>{booking.nama}</td>
                <td style={{ padding: "14px 20px", color: "#44403C" }}>{booking.total_tiket} Tiket</td>
                <td style={{ padding: "14px 20px", color: "#44403C" }}>{booking.visit_date}</td>
                <td style={{ padding: "14px 20px", fontWeight: "800", color: "#1C1917" }}>Rp {booking.total_biaya.toLocaleString("id-ID")}</td>
                <td style={{ padding: "14px 20px" }}>
                  <span style={{ backgroundColor: booking.status === "LUNAS" ? "#D1FAE5" : booking.status === "BATAL" ? "#FEE2E2" : "#FEF3C7", color: booking.status === "LUNAS" ? "#047857" : booking.status === "BATAL" ? "#DC2626" : "#B45309", padding: "3px 8px", borderRadius: "10px", fontSize: "9px", fontWeight: "800" }}>{booking.status}</span>
                </td>
                <td style={{ padding: "14px 20px", textAlign: "right" }}>
                  <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "8px" }}>
                    <button onClick={() => onScan(booking)} style={{ backgroundColor: "#224229", color: "#FFFFFF", border: "none", borderRadius: "6px", padding: "4px 10px", fontSize: "10px", fontWeight: "700", cursor: "pointer", fontFamily: "sans-serif" }}>🔲 Scan</button>
                    <button onClick={() => onShowDetail(booking)} style={{ color: "#2563EB", fontWeight: "700", border: "none", background: "none", cursor: "pointer", fontSize: "11px", fontFamily: "sans-serif" }}>Detail</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ padding: "12px 20px", borderTop: "1px solid #F5F5F4", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", color: "#78716C", fontFamily: "sans-serif" }}>
        <span>
          Menampilkan {filteredCount ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, filteredCount)} dari {filteredCount} data
        </span>
        <div style={{ display: "flex", gap: "4px" }}>
          <button disabled={currentPage === 1} onClick={() => onPageChange(Math.max(1, currentPage - 1))} style={{ padding: "4px 10px", border: "1px solid #E7E5E4", borderRadius: "6px", backgroundColor: "#FFFFFF", cursor: currentPage === 1 ? "not-allowed" : "pointer", opacity: currentPage === 1 ? 0.5 : 1 }}>Sebelumnya</button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
            <button key={page} onClick={() => onPageChange(page)} style={{ padding: "4px 10px", border: currentPage === page ? "none" : "1px solid #E7E5E4", borderRadius: "6px", backgroundColor: currentPage === page ? "#224229" : "#FFFFFF", color: currentPage === page ? "#FFFFFF" : undefined, fontWeight: currentPage === page ? "700" : undefined, cursor: "pointer" }}>{page}</button>
          ))}
          <button disabled={currentPage === totalPages} onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} style={{ padding: "4px 10px", border: "1px solid #E7E5E4", borderRadius: "6px", backgroundColor: "#FFFFFF", cursor: currentPage === totalPages ? "not-allowed" : "pointer", opacity: currentPage === totalPages ? 0.5 : 1 }}>Selanjutnya</button>
        </div>
      </div>
    </section>
  );
}
