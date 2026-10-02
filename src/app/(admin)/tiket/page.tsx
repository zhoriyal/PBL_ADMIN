"use client";

import { useState } from "react";

interface TicketCategory {
  id: string;
  badge: string;
  badgeBg: string;
  badgeColor: string;
  title: string;
  price: number;
  kuota: number;
  status: "Aktif" | "Nonaktif";
}

interface TicketBooking {
  id: string;
  name: string;
  kategori: "Reguler" | "Pelajar" | "Mancanegara";
  tickets: number;
  visitDate: string;
  total: number;
  status: "LUNAS" | "MENUNGGU" | "BATAL";
  checkedIn: boolean;
}

export default function ManajemenTiketPage() {
  // State Kategori Tiket
  const [categories, setCategories] = useState<TicketCategory[]>([
    {
      id: "1",
      badge: "UMUM / DEWASA",
      badgeBg: "#fef3c7",
      badgeColor: "#92400e",
      title: "Tiket Reguler",
      price: 10000,
      kuota: 500,
      status: "Aktif",
    },
    {
      id: "2",
      badge: "PELAJAR / MAHASISWA",
      badgeBg: "#dbeafe",
      badgeColor: "#1e40af",
      title: "Tiket Pelajar / Rombongan",
      price: 5000,
      kuota: 300,
      status: "Aktif",
    },
    {
      id: "3",
      badge: "MANCANEGARA",
      badgeBg: "#f3e8ff",
      badgeColor: "#6b21a8",
      title: "Tiket Wisatawan Asing",
      price: 25000,
      kuota: 100,
      status: "Aktif",
    },
  ]);

  // State List Pemesanan
  const [bookings, setBookings] = useState<TicketBooking[]>([
    {
      id: "#MB-20260929-01",
      name: "Pandu Aji",
      kategori: "Reguler",
      tickets: 2,
      visitDate: "29 Sep 2026",
      total: 20000,
      status: "LUNAS",
      checkedIn: true,
    },
    {
      id: "#MB-20260929-02",
      name: "Setiawan",
      kategori: "Pelajar",
      tickets: 1,
      visitDate: "29 Sep 2026",
      total: 5000,
      status: "LUNAS",
      checkedIn: true,
    },
    {
      id: "#MB-20260930-03",
      name: "Aji",
      kategori: "Mancanegara",
      tickets: 2,
      visitDate: "30 Sep 2026",
      total: 50000,
      status: "MENUNGGU",
      checkedIn: false,
    },
  ]);

  // State Filter & Modals
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedBooking, setSelectedBooking] = useState<TicketBooking | null>(null);
  const [scanModalBooking, setScanModalBooking] = useState<TicketBooking | null>(null);
  const [editCategory, setEditCategory] = useState<TicketCategory | null>(null);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);

  // Form New Category State
  const [newCatBadge, setNewCatBadge] = useState("");
  const [newCatTitle, setNewCatTitle] = useState("");
  const [newCatPrice, setNewCatPrice] = useState(0);
  const [newCatKuota, setNewCatKuota] = useState(100);

  // Perhitungan Ringkasan Real
  const totalTerjualBulanIni = bookings.reduce((acc, item) => acc + item.tickets, 0) + 1245;
  const sudahCheckInHariIni = bookings.filter((b) => b.checkedIn).reduce((acc, item) => acc + item.tickets, 0) + 115;
  const pendapatanBulanIni = bookings.reduce((acc, item) => acc + item.total, 0) + 12425000;

  // Filter Bookings
  const filteredBookings = bookings.filter((item) => {
    const matchesSearch =
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["ID Transaksi,Nama Pembeli,Kategori,Jumlah Tiket,Tgl Kunjungan,Total Biaya,Status\n"];
    const rows = bookings.map(
      (b) => `${b.id},${b.name},${b.kategori},${b.tickets},${b.visitDate},${b.total},${b.status}`
    );
    const blob = new Blob([headers + rows.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Laporan_Manajemen_Tiket_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  // Add Category Handler
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatTitle || !newCatBadge) return;
    const cat: TicketCategory = {
      id: Date.now().toString(),
      badge: newCatBadge.toUpperCase(),
      badgeBg: "#e0f2fe",
      badgeColor: "#0369a1",
      title: newCatTitle,
      price: newCatPrice,
      kuota: newCatKuota,
      status: "Aktif",
    };
    setCategories([...categories, cat]);
    setIsAddCategoryOpen(false);
    setNewCatBadge("");
    setNewCatTitle("");
    setNewCatPrice(0);
    setNewCatKuota(100);
  };

  // Save Edit Category
  const handleSaveEditCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCategory) return;
    setCategories(categories.map((c) => (c.id === editCategory.id ? editCategory : c)));
    setEditCategory(null);
  };

  // Scan Confirm Check-In
  const handleConfirmCheckIn = (id: string) => {
    setBookings(
      bookings.map((b) => (b.id === id ? { ...b, checkedIn: true, status: "LUNAS" } : b))
    );
    setScanModalBooking(null);
  };

  return (
    <div style={{ fontFamily: "Georgia, serif", color: "#2B2823", padding: "8px 4px", position: "relative" }}>
      {/* Header Halaman Utama */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: "28px", fontWeight: "normal", color: "#1C1917", margin: 0 }}>
          Manajemen Tiket
        </h1>
        <p style={{ fontFamily: "sans-serif", fontSize: "13px", color: "#78716C", margin: "6px 0 0 0" }}>
          Kelola kategori tiket, harga, kuota, serta pemesanan tiket pengunjung
        </p>
      </div>

      {/* Ringkasan Statistik Card */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {/* Card 1 */}
        <div style={{ backgroundColor: "#FFFFFF", padding: "18px 20px", borderRadius: "14px", border: "1px solid #E7E5E4", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "10px", backgroundColor: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>🎫</div>
          <div>
            <span style={{ fontFamily: "sans-serif", fontSize: "10px", fontWeight: "700", color: "#A8A29E", letterSpacing: "0.5px", textTransform: "uppercase" }}>TOTAL TIKET TERJUAL (BULAN INI)</span>
            <div style={{ marginTop: "2px", display: "flex", alignItems: "baseline", gap: "6px" }}>
              <span style={{ fontFamily: "sans-serif", fontSize: "22px", fontWeight: "800", color: "#1C1917" }}>{totalTerjualBulanIni.toLocaleString("id-ID")}</span>
              <span style={{ fontFamily: "sans-serif", fontSize: "12px", color: "#78716C" }}>Tiket</span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div style={{ backgroundColor: "#FFFFFF", padding: "18px 20px", borderRadius: "14px", border: "1px solid #E7E5E4", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "10px", backgroundColor: "#D1FAE5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>📲</div>
          <div>
            <span style={{ fontFamily: "sans-serif", fontSize: "10px", fontWeight: "700", color: "#A8A29E", letterSpacing: "0.5px", textTransform: "uppercase" }}>SUDAH CHECK-IN HARI INI</span>
            <div style={{ marginTop: "2px", display: "flex", alignItems: "baseline", gap: "6px" }}>
              <span style={{ fontFamily: "sans-serif", fontSize: "22px", fontWeight: "800", color: "#1C1917" }}>{sudahCheckInHariIni}</span>
              <span style={{ fontFamily: "sans-serif", fontSize: "12px", color: "#78716C" }}>Pengunjung</span>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div style={{ backgroundColor: "#FFFFFF", padding: "18px 20px", borderRadius: "14px", border: "1px solid #E7E5E4", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "10px", backgroundColor: "#DBEAFE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>👝</div>
          <div>
            <span style={{ fontFamily: "sans-serif", fontSize: "10px", fontWeight: "700", color: "#A8A29E", letterSpacing: "0.5px", textTransform: "uppercase" }}>PENDAPATAN TIKET (BULAN INI)</span>
            <div style={{ marginTop: "2px" }}>
              <span style={{ fontFamily: "sans-serif", fontSize: "22px", fontWeight: "800", color: "#1C1917" }}>Rp {pendapatanBulanIni.toLocaleString("id-ID")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section Kategori & Tarif Tiket */}
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "14px", border: "1px solid #E7E5E4", padding: "20px", marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
          <div>
            <h2 style={{ fontFamily: "sans-serif", fontSize: "12px", fontWeight: "800", margin: 0, color: "#1C1917", letterSpacing: "0.5px" }}>KATEGORI & TARIF TIKET MASUK</h2>
            <p style={{ fontFamily: "sans-serif", fontSize: "11px", color: "#78716C", margin: "4px 0 0 0" }}>Atur besaran harga tiket dan batas kuota harian pengunjung</p>
          </div>
          <button
            onClick={() => setIsAddCategoryOpen(true)}
            style={{
              backgroundColor: "#224229",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "8px",
              padding: "8px 16px",
              fontSize: "12px",
              fontWeight: "600",
              fontFamily: "sans-serif",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>+</span> Tambah Kategori Tiket
          </button>
        </div>

        {/* List Kartu Kategori */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
          {categories.map((cat) => (
            <div key={cat.id} style={{ backgroundColor: "#FAFAF9", borderRadius: "10px", border: "1px solid #F5F5F4", padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <span style={{ fontFamily: "sans-serif", backgroundColor: cat.badgeBg, color: cat.badgeColor, fontSize: "9px", fontWeight: "800", padding: "3px 8px", borderRadius: "4px", letterSpacing: "0.5px" }}>
                  {cat.badge}
                </span>
                <button
                  onClick={() => setEditCategory(cat)}
                  style={{ fontFamily: "sans-serif", background: "none", border: "none", color: "#78716C", fontSize: "11px", cursor: "pointer", fontWeight: "600" }}
                >
                  ✏️ Edit
                </button>
              </div>

              <h3 style={{ fontFamily: "sans-serif", fontSize: "14px", fontWeight: "700", color: "#1C1917", margin: "0 0 4px 0" }}>{cat.title}</h3>
              <div style={{ fontFamily: "sans-serif", display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "16px" }}>
                <span style={{ fontSize: "18px", fontWeight: "800", color: "#1C1917" }}>Rp {cat.price.toLocaleString("id-ID")}</span>
                <span style={{ fontSize: "11px", color: "#78716C" }}>/ orang</span>
              </div>

              <div style={{ fontFamily: "sans-serif", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px dashed #E7E5E4", paddingTop: "10px", fontSize: "11px" }}>
                <span style={{ color: "#78716C" }}>Kuota Harian: <strong style={{ color: "#1C1917" }}>{cat.kuota} Tiket</strong></span>
                <span style={{ color: "#78716C" }}>Status: <strong style={{ color: cat.status === "Aktif" ? "#059669" : "#DC2626" }}>{cat.status}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section Daftar Pemesanan */}
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "14px", border: "1px solid #E7E5E4", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #F5F5F4", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h2 style={{ fontFamily: "sans-serif", fontSize: "12px", fontWeight: "800", margin: 0, color: "#1C1917", letterSpacing: "0.5px" }}>DAFTAR PEMESANAN & RIWAYAT TIKET</h2>
            <p style={{ fontFamily: "sans-serif", fontSize: "11px", color: "#78716C", margin: "4px 0 0 0" }}>Data seluruh reservasi dan tiket yang telah dibeli pengunjung</p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", fontFamily: "sans-serif" }}>
            {/* Search Input */}
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Cari Kode / Nama..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: "6px 12px 6px 28px",
                  fontSize: "11px",
                  borderRadius: "8px",
                  border: "1px solid #E7E5E4",
                  backgroundColor: "#FAFAF9",
                  outline: "none",
                  width: "180px",
                  fontFamily: "sans-serif",
                }}
              />
              <span style={{ position: "absolute", left: "8px", top: "6px", fontSize: "11px", color: "#A8A29E" }}>🔍</span>
            </div>

            {/* Filter Status Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: "6px 12px",
                fontSize: "11px",
                borderRadius: "8px",
                border: "1px solid #E7E5E4",
                backgroundColor: "#FAFAF9",
                outline: "none",
                cursor: "pointer",
                fontFamily: "sans-serif",
              }}
            >
              <option value="ALL">Semua Status</option>
              <option value="LUNAS">LUNAS</option>
              <option value="MENUNGGU">MENUNGGU</option>
            </select>

            {/* Tombol Ekspor Data */}
            <button
              onClick={handleExportCSV}
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                border: "1px solid #FEF08A",
                backgroundColor: "#FEFCE8",
                color: "#854D0E",
                fontSize: "11px",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontFamily: "sans-serif",
              }}
            >
              📥 Ekspor Data
            </button>
          </div>
        </div>

        {/* Tabel Data Pemesanan */}
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "11px", fontFamily: "sans-serif" }}>
          <thead>
            <tr style={{ backgroundColor: "#FAFAF9", color: "#A8A29E", borderBottom: "1px solid #F5F5F4", fontSize: "10px", letterSpacing: "0.5px" }}>
              <th style={{ padding: "12px 20px" }}>ID TRANSAKSI</th>
              <th style={{ padding: "12px 20px" }}>NAMA PEMBELI</th>
              <th style={{ padding: "12px 20px" }}>KATEGORI</th>
              <th style={{ padding: "12px 20px" }}>JUMLAH TIKET</th>
              <th style={{ padding: "12px 20px" }}>TGL KUNJUNGAN</th>
              <th style={{ padding: "12px 20px" }}>TOTAL BIAYA</th>
              <th style={{ padding: "12px 20px" }}>STATUS</th>
              <th style={{ padding: "12px 20px", textAlign: "right" }}>AKSI</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((b) => (
              <tr key={b.id} style={{ borderBottom: "1px solid #FAFAF9" }}>
                <td style={{ padding: "14px 20px", fontWeight: "800", color: "#1C1917" }}>{b.id}</td>
                <td style={{ padding: "14px 20px", color: "#44403C" }}>{b.name}</td>
                <td style={{ padding: "14px 20px" }}>
                  <span style={{ backgroundColor: "#F5F5F4", color: "#57534E", padding: "3px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: "600" }}>
                    {b.kategori}
                  </span>
                </td>
                <td style={{ padding: "14px 20px", color: "#44403C" }}>{b.tickets} Tiket</td>
                <td style={{ padding: "14px 20px", color: "#44403C" }}>{b.visitDate}</td>
                <td style={{ padding: "14px 20px", fontWeight: "800", color: "#1C1917" }}>
                  Rp {b.total.toLocaleString("id-ID")}
                </td>
                <td style={{ padding: "14px 20px" }}>
                  <span
                    style={{
                      backgroundColor: b.status === "LUNAS" ? "#D1FAE5" : "#FEF3C7",
                      color: b.status === "LUNAS" ? "#047857" : "#B45309",
                      padding: "3px 8px",
                      borderRadius: "10px",
                      fontSize: "9px",
                      fontWeight: "800",
                    }}
                  >
                    {b.status}
                  </span>
                </td>
                <td style={{ padding: "14px 20px", textAlign: "right" }}>
                  <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "8px" }}>
                    <button
                      onClick={() => setScanModalBooking(b)}
                      style={{
                        backgroundColor: "#224229",
                        color: "#FFFFFF",
                        border: "none",
                        borderRadius: "6px",
                        padding: "4px 10px",
                        fontSize: "10px",
                        fontWeight: "700",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontFamily: "sans-serif",
                      }}
                    >
                      <span style={{ fontSize: "10px" }}>🔲</span> Scan
                    </button>
                    <button
                      onClick={() => setSelectedBooking(b)}
                      style={{ color: "#2563EB", fontWeight: "700", border: "none", background: "none", cursor: "pointer", fontSize: "11px", fontFamily: "sans-serif" }}
                    >
                      Detail
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer Navigasi / Pagination */}
        <div style={{ padding: "12px 20px", borderTop: "1px solid #F5F5F4", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", color: "#78716C", fontFamily: "sans-serif" }}>
          <span>Menampilkan 1 - {filteredBookings.length} dari {totalTerjualBulanIni} data</span>
          <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
            <button style={{ padding: "4px 10px", border: "1px solid #E7E5E4", borderRadius: "6px", backgroundColor: "#FFFFFF", cursor: "pointer", fontSize: "11px", fontFamily: "sans-serif" }}>Sebelumnya</button>
            <button style={{ padding: "4px 10px", border: "none", borderRadius: "6px", backgroundColor: "#224229", color: "#FFFFFF", fontWeight: "700", fontSize: "11px", fontFamily: "sans-serif" }}>1</button>
            <button style={{ padding: "4px 10px", border: "1px solid #E7E5E4", borderRadius: "6px", backgroundColor: "#FFFFFF", cursor: "pointer", fontSize: "11px", fontFamily: "sans-serif" }}>2</button>
            <button style={{ padding: "4px 10px", border: "1px solid #E7E5E4", borderRadius: "6px", backgroundColor: "#FFFFFF", cursor: "pointer", fontSize: "11px", fontFamily: "sans-serif" }}>Selanjutnya</button>
          </div>
        </div>
      </div>

      {/* Modal Detail Pemesanan */}
      {selectedBooking && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, fontFamily: "sans-serif" }}>
          <div style={{ backgroundColor: "#FFFFFF", padding: "20px", borderRadius: "12px", width: "340px", border: "1px solid #E7E5E4" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "800", margin: "0 0 12px 0", color: "#1C1917" }}>Rincian Tiket Pengunjung</h3>
            <div style={{ fontSize: "11px", display: "flex", flexDirection: "column", gap: "6px", color: "#44403C" }}>
              <p style={{ margin: 0 }}><strong>ID Transaksi:</strong> {selectedBooking.id}</p>
              <p style={{ margin: 0 }}><strong>Nama Pembeli:</strong> {selectedBooking.name}</p>
              <p style={{ margin: 0 }}><strong>Kategori Tiket:</strong> {selectedBooking.kategori}</p>
              <p style={{ margin: 0 }}><strong>Jumlah Tiket:</strong> {selectedBooking.tickets} Tiket</p>
              <p style={{ margin: 0 }}><strong>Tanggal Kunjungan:</strong> {selectedBooking.visitDate}</p>
              <p style={{ margin: 0 }}><strong>Total Biaya:</strong> Rp {selectedBooking.total.toLocaleString("id-ID")}</p>
              <p style={{ margin: 0 }}><strong>Status Pembayaran:</strong> {selectedBooking.status}</p>
              <p style={{ margin: 0 }}><strong>Status Check-In:</strong> {selectedBooking.checkedIn ? "Sudah Check-in" : "Belum Check-in"}</p>
            </div>
            <button
              onClick={() => setSelectedBooking(null)}
              style={{ marginTop: "16px", width: "100%", padding: "8px", backgroundColor: "#1C1917", color: "#FFFFFF", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: "700" }}
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Modal QR Scan */}
      {scanModalBooking && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, fontFamily: "sans-serif" }}>
          <div style={{ backgroundColor: "#FFFFFF", padding: "20px", borderRadius: "12px", width: "320px", textAlign: "center", border: "1px solid #E7E5E4" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "800", margin: "0 0 8px 0", color: "#1C1917" }}>Scan Check-In Tiket</h3>
            <p style={{ fontSize: "11px", color: "#78716C", margin: "0 0 16px 0" }}>Kode: {scanModalBooking.id}</p>
            
            <div style={{ width: "120px", height: "120px", backgroundColor: "#FAFAF9", border: "2px dashed #A8A29E", borderRadius: "8px", margin: "0 auto 16px auto", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "40px" }}>
              🔲
            </div>

            <p style={{ fontSize: "12px", fontWeight: "700", margin: "0 0 12px 0", color: "#1C1917" }}>{scanModalBooking.name} ({scanModalBooking.tickets} Tiket)</p>
            
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => handleConfirmCheckIn(scanModalBooking.id)}
                style={{ flex: 1, padding: "8px", backgroundColor: "#059669", color: "#FFFFFF", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: "700" }}
              >
                Konfirmasi Check-In
              </button>
              <button
                onClick={() => setScanModalBooking(null)}
                style={{ flex: 1, padding: "8px", backgroundColor: "#FAFAF9", color: "#44403C", border: "1px solid #E7E5E4", borderRadius: "6px", cursor: "pointer", fontSize: "11px" }}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah Kategori */}
      {isAddCategoryOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, fontFamily: "sans-serif" }}>
          <form onSubmit={handleAddCategory} style={{ backgroundColor: "#FFFFFF", padding: "20px", borderRadius: "12px", width: "320px", border: "1px solid #E7E5E4" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "800", margin: "0 0 12px 0", color: "#1C1917" }}>Tambah Kategori Tiket</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "11px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "4px", fontWeight: "700" }}>Label Badge (e.g. DEWASA)</label>
                <input type="text" required value={newCatBadge} onChange={(e) => setNewCatBadge(e.target.value)} style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #CCC" }} />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "4px", fontWeight: "700" }}>Nama Kategori Tiket</label>
                <input type="text" required value={newCatTitle} onChange={(e) => setNewCatTitle(e.target.value)} style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #CCC" }} />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "4px", fontWeight: "700" }}>Harga per Orang (Rp)</label>
                <input type="number" required value={newCatPrice} onChange={(e) => setNewCatPrice(Number(e.target.value))} style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #CCC" }} />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "4px", fontWeight: "700" }}>Kuota Harian</label>
                <input type="number" required value={newCatKuota} onChange={(e) => setNewCatKuota(Number(e.target.value))} style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #CCC" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
              <button type="submit" style={{ flex: 1, padding: "8px", backgroundColor: "#224229", color: "#FFFFFF", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: "700" }}>Simpan</button>
              <button type="button" onClick={() => setIsAddCategoryOpen(false)} style={{ flex: 1, padding: "8px", backgroundColor: "#FAFAF9", color: "#44403C", border: "1px solid #E7E5E4", borderRadius: "6px", cursor: "pointer", fontSize: "11px" }}>Batal</button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Edit Kategori */}
      {editCategory && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, fontFamily: "sans-serif" }}>
          <form onSubmit={handleSaveEditCategory} style={{ backgroundColor: "#FFFFFF", padding: "20px", borderRadius: "12px", width: "320px", border: "1px solid #E7E5E4" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "800", margin: "0 0 12px 0", color: "#1C1917" }}>Edit Kategori Tiket</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "11px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "4px", fontWeight: "700" }}>Nama Kategori</label>
                <input type="text" value={editCategory.title} onChange={(e) => setEditCategory({ ...editCategory, title: e.target.value })} style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #CCC" }} />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "4px", fontWeight: "700" }}>Harga per Orang (Rp)</label>
                <input type="number" value={editCategory.price} onChange={(e) => setEditCategory({ ...editCategory, price: Number(e.target.value) })} style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #CCC" }} />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "4px", fontWeight: "700" }}>Kuota Harian</label>
                <input type="number" value={editCategory.kuota} onChange={(e) => setEditCategory({ ...editCategory, kuota: Number(e.target.value) })} style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #CCC" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
              <button type="submit" style={{ flex: 1, padding: "8px", backgroundColor: "#224229", color: "#FFFFFF", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: "700" }}>Simpan</button>
              <button type="button" onClick={() => setEditCategory(null)} style={{ flex: 1, padding: "8px", backgroundColor: "#FAFAF9", color: "#44403C", border: "1px solid #E7E5E4", borderRadius: "6px", cursor: "pointer", fontSize: "11px" }}>Batal</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}