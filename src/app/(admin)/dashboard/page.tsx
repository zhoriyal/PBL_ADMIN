"use client";

import { useState } from "react";

// Types
interface Transaction {
  id: string;
  name: string;
  tickets: number;
  total: number;
  status: "LUNAS" | "PENDING" | "BATAL";
  date: string;
}

interface Review {
  id: string;
  user: string;
  rating: number;
  comment: string;
  date: string;
}

export default function DashboardPage() {
  // State Data Real (Dynamic)
  const [transactions] = useState<Transaction[]>([
    { id: "#MB-20261002-01", name: "Pandu Aji", tickets: 2, total: 20000, status: "LUNAS", date: "2026-10-02" },
    { id: "#MB-20261002-02", name: "Setiawan", tickets: 1, total: 10000, status: "LUNAS", date: "2026-10-02" },
    { id: "#MB-20261001-03", name: "Rayhan", tickets: 3, total: 30000, status: "LUNAS", date: "2026-10-01" },
    { id: "#MB-20261001-04", name: "Jordan", tickets: 2, total: 20000, status: "PENDING", date: "2026-10-01" },
  ]);

  const [reviews] = useState<Review[]>([
    { id: "1", user: "Pengunjung #12", rating: 5.0, comment: "Koleksi sejarahnya sangat lengkap dan informatif!", date: "2 Okt 2026" },
    { id: "2", user: "Pengunjung #09", rating: 4.5, comment: "Pemesanan tiket online via web mobile sangat praktis.", date: "1 Okt 2026" },
  ]);

  const [katalogCount] = useState<number>(48);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  
  // State Notifikasi
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true); // Indikator merah aktif di awal
  
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  // Dynamic Calculations
  const todayStr = "2026-10-02";
  const todayTransactions = transactions.filter((t) => t.date === todayStr && t.status === "LUNAS");
  const tiketTerjualHariIni = todayTransactions.reduce((acc, t) => acc + t.tickets, 0);
  const pendapatanHariIni = todayTransactions.reduce((acc, t) => acc + t.total, 0);

  // Toggle & Read Notifikasi Handler
  const handleToggleNotifications = () => {
    setNotificationsOpen((prev) => !prev);
    if (hasUnread) {
      setHasUnread(false); // Hilangkan indikator merah saat pertama kali diklik
    }
  };

  // Fitur Filter Transaksi
  const filteredTransactions = transactions.filter((t) => {
    if (filterStatus === "ALL") return true;
    return t.status === filterStatus;
  });

  // Fitur Ekspor Data ke CSV
  const exportToCSV = () => {
    const headers = ["ID Transaksi,Nama Pembeli,Jumlah Tiket,Total Biaya,Status,Tanggal\n"];
    const rows = transactions.map(
      (t) => `${t.id},${t.name},${t.tickets},${t.total},${t.status},${t.date}`
    );
    const blob = new Blob([headers + rows.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Laporan_Transaksi_Museum_${todayStr}.csv`;
    a.click();
  };

  return (
    <div style={{ fontFamily: "sans-serif", color: "#333", padding: "8px", position: "relative" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontSize: "18px", fontWeight: "700", margin: 0, color: "#1a1a1a" }}>DASHBOARD RINGKASAN</h1>
          <p style={{ fontSize: "12px", color: "#777", margin: "4px 0 0 0" }}>Selamat datang kembali, Pengelola Museum</p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", position: "relative" }}>
          {/* Tombol Notifikasi Active */}
          <button
            onClick={handleToggleNotifications}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              border: "1px solid #e2e8f0",
              backgroundColor: "#fff",
              cursor: "pointer",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            🔔
            {/* Titik merah hanya dirender jika hasUnread === true */}
            {hasUnread && (
              <span
                style={{
                  position: "absolute",
                  top: "2px",
                  right: "2px",
                  width: "8px",
                  height: "8px",
                  backgroundColor: "#ef4444",
                  borderRadius: "50%",
                }}
              />
            )}
          </button>

          {/* Popup Notifikasi */}
          {notificationsOpen && (
            <div
              style={{
                position: "absolute",
                top: "45px",
                right: "120px",
                width: "240px",
                backgroundColor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                padding: "12px",
                zIndex: 50,
              }}
            >
              <span style={{ fontSize: "11px", fontWeight: "bold", color: "#444" }}>Notifikasi Terbaru</span>
              <div style={{ fontSize: "10px", color: "#666", marginTop: "8px", paddingBottom: "6px", borderBottom: "1px solid #f0f0f0" }}>
                📌 2 Tiket baru berhasil dipesan oleh Pandu Aji.
              </div>
              <div style={{ fontSize: "10px", color: "#666", marginTop: "6px" }}>
                ⚠️ 1 Pembayaran pending membutuhkan konfirmasi.
              </div>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#fff", padding: "4px 12px 4px 6px", borderRadius: "20px", border: "1px solid #e2e8f0" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "#000", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px" }}>👤</div>
            <span style={{ fontSize: "12px", fontWeight: "bold", color: "#1a1a1a" }}>ADMIN</span>
          </div>
        </div>
      </div>

      {/* Dynamic Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "20px" }}>
        <div style={{ backgroundColor: "#fff", padding: "16px 20px", borderRadius: "12px", border: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ fontSize: "10px", fontWeight: "600", color: "#888", display: "block" }}>TIKET TERJUAL HARI INI</span>
            <div style={{ marginTop: "4px", display: "flex", alignItems: "baseline", gap: "4px" }}>
              <span style={{ fontSize: "22px", fontWeight: "bold", color: "#111" }}>{tiketTerjualHariIni}</span>
              <span style={{ fontSize: "12px", color: "#888" }}>Tiket</span>
            </div>
          </div>
          <div style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>🎫</div>
        </div>

        <div style={{ backgroundColor: "#fff", padding: "16px 20px", borderRadius: "12px", border: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ fontSize: "10px", fontWeight: "600", color: "#888", display: "block" }}>PENDAPATAN HARI INI</span>
            <div style={{ marginTop: "4px" }}>
              <span style={{ fontSize: "22px", fontWeight: "bold", color: "#111" }}>Rp {pendapatanHariIni.toLocaleString("id-ID")}</span>
            </div>
          </div>
          <div style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>💵</div>
        </div>

        <div style={{ backgroundColor: "#fff", padding: "16px 20px", borderRadius: "12px", border: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ fontSize: "10px", fontWeight: "600", color: "#888", display: "block" }}>TOTAL KATALOG KOLEKSI</span>
            <div style={{ marginTop: "4px", display: "flex", alignItems: "baseline", gap: "4px" }}>
              <span style={{ fontSize: "22px", fontWeight: "bold", color: "#111" }}>{katalogCount}</span>
              <span style={{ fontSize: "12px", color: "#888" }}>Item</span>
            </div>
          </div>
          <div style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>🏛️</div>
        </div>
      </div>

      {/* Middle Grid: Dynamic Chart & Reviews */}
      <div style={{ display: "grid", gridTemplateColumns: "2.2fr 1fr", gap: "16px", marginBottom: "20px" }}>
        <div style={{ backgroundColor: "#fff", padding: "18px", borderRadius: "12px", border: "1px solid #f0f0f0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <span style={{ fontSize: "11px", fontWeight: "bold", color: "#444" }}>GRAFIK PENJUALAN TIKET MINGGUAN</span>
            <span style={{ fontSize: "10px", backgroundColor: "#f3f4f6", color: "#666", padding: "3px 10px", borderRadius: "12px" }}>7 Hari Terakhir</span>
          </div>

          <div style={{ height: "160px", backgroundColor: "#fafafa", borderRadius: "8px", padding: "16px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "12px", border: "1px solid #f0f0f0" }}>
            {[
              { day: "Sen", val: 40 },
              { day: "Sel", val: 65 },
              { day: "Rab", val: 30 },
              { day: "Kam", val: 85 },
              { day: "Jum", val: 120 },
              { day: "Sab", val: 142 },
              { day: "Ming", val: 95 },
            ].map((item, idx) => (
              <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "9px", color: "#666", fontWeight: "bold" }}>{item.val}</span>
                <div style={{ width: "100%", backgroundColor: idx === 5 ? "#2563eb" : "#cbd5e1", height: `${(item.val / 150) * 100}px`, borderRadius: "4px", transition: "height 0.3s" }} />
                <span style={{ fontSize: "10px", color: "#888" }}>{item.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ulasan */}
        <div style={{ backgroundColor: "#fff", padding: "18px", borderRadius: "12px", border: "1px solid #f0f0f0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <span style={{ fontSize: "11px", fontWeight: "bold", color: "#444" }}>ULASAN TERBARU</span>
            <a href="#" style={{ fontSize: "11px", color: "#b45309", fontWeight: "bold", textDecoration: "none" }}>Lihat Semua</a>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {reviews.map((rev) => (
              <div key={rev.id} style={{ backgroundColor: "#f9fafb", padding: "10px 12px", borderRadius: "8px", border: "1px solid #f3f4f6" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: "bold", color: "#333" }}>
                  <span>{rev.user}</span>
                  <span style={{ color: "#d97706" }}>★ {rev.rating.toFixed(1)}</span>
                </div>
                <p style={{ fontSize: "10px", color: "#666", margin: "4px 0 0 0", fontStyle: "italic" }}>&ldquo;{rev.comment}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table & Actions */}
      <div style={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #f0f0f0", overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "11px", fontWeight: "bold", color: "#444" }}>TRANSAKSI TIKET TERBARU</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "4px", border: "1px solid #ccc" }}
            >
              <option value="ALL">Semua Status</option>
              <option value="LUNAS">LUNAS</option>
              <option value="PENDING">PENDING</option>
            </select>
          </div>

          <button
            onClick={exportToCSV}
            style={{
              padding: "5px 12px",
              borderRadius: "6px",
              border: "1px solid #fef3c7",
              backgroundColor: "#fffbeb",
              color: "#92400e",
              fontSize: "11px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            📥 Ekspor Data (CSV)
          </button>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "11px" }}>
          <thead>
            <tr style={{ backgroundColor: "#f9fafb", color: "#9ca3af", borderBottom: "1px solid #f0f0f0", fontSize: "10px" }}>
              <th style={{ padding: "10px 18px" }}>ID TRANSAKSI</th>
              <th style={{ padding: "10px 18px" }}>NAMA PEMBELI</th>
              <th style={{ padding: "10px 18px" }}>JUMLAH TIKET</th>
              <th style={{ padding: "10px 18px" }}>TOTAL BIAYA</th>
              <th style={{ padding: "10px 18px" }}>STATUS</th>
              <th style={{ padding: "10px 18px", textAlign: "right" }}>AKSI</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((tx) => (
              <tr key={tx.id} style={{ borderBottom: "1px solid #f9fafb" }}>
                <td style={{ padding: "12px 18px", fontWeight: "bold", color: "#111" }}>{tx.id}</td>
                <td style={{ padding: "12px 18px", color: "#4b5563" }}>{tx.name}</td>
                <td style={{ padding: "12px 18px", color: "#4b5563" }}>{tx.tickets} Tiket</td>
                <td style={{ padding: "12px 18px", fontWeight: "bold", color: "#111" }}>Rp {tx.total.toLocaleString("id-ID")}</td>
                <td style={{ padding: "12px 18px" }}>
                  <span
                    style={{
                      backgroundColor: tx.status === "LUNAS" ? "#d1fae5" : "#fef3c7",
                      color: tx.status === "LUNAS" ? "#047857" : "#b45309",
                      padding: "2px 8px",
                      borderRadius: "10px",
                      fontSize: "9px",
                      fontWeight: "bold",
                    }}
                  >
                    {tx.status}
                  </span>
                </td>
                <td style={{ padding: "12px 18px", textAlign: "right" }}>
                  <button
                    onClick={() => setSelectedTx(tx)}
                    style={{ color: "#2563eb", fontWeight: "600", border: "none", background: "none", cursor: "pointer", fontSize: "11px" }}
                  >
                    Detail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Detail Transaksi */}
      {selectedTx && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
        >
          <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "12px", width: "320px", border: "1px solid #e2e8f0" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "bold", margin: "0 0 12px 0" }}>Detail Transaksi</h3>
            <p style={{ fontSize: "11px", margin: "4px 0" }}><strong>ID:</strong> {selectedTx.id}</p>
            <p style={{ fontSize: "11px", margin: "4px 0" }}><strong>Nama:</strong> {selectedTx.name}</p>
            <p style={{ fontSize: "11px", margin: "4px 0" }}><strong>Jumlah Tiket:</strong> {selectedTx.tickets}</p>
            <p style={{ fontSize: "11px", margin: "4px 0" }}><strong>Total:</strong> Rp {selectedTx.total.toLocaleString("id-ID")}</p>
            <p style={{ fontSize: "11px", margin: "4px 0" }}><strong>Tanggal:</strong> {selectedTx.date}</p>
            <p style={{ fontSize: "11px", margin: "4px 0" }}><strong>Status:</strong> {selectedTx.status}</p>

            <button
              onClick={() => setSelectedTx(null)}
              style={{
                marginTop: "16px",
                width: "100%",
                padding: "8px",
                backgroundColor: "#111",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "11px",
              }}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}