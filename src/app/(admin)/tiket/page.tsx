"use client";

import { useState, useEffect, useCallback } from "react";
import { tiketApi } from "@/lib/api";

interface TicketCategory {
  id: number;
  badge: string;
  badge_bg: string;
  badge_color: string;
  title: string;
  price: number;
  kuota: number;
  status: "Aktif" | "Nonaktif";
}

interface TicketBooking {
  id: string;
  nama: string;
  email: string;
  phone?: string;
  kategori_dewasa: number;
  kategori_pelajar: number;
  kategori_wna: number;
  total_tiket: number;
  total_biaya: number;
  sesi: string;
  visit_date: string;
  payment_method: string;
  status: "LUNAS" | "MENUNGGU" | "BATAL";
  checked_in: number;
}

export default function ManajemenTiketPage() {
  const [categories, setCategories] = useState<TicketCategory[]>([]);
  const [bookings, setBookings] = useState<TicketBooking[]>([]);
  const [stats, setStats] = useState({ terjualHariIni: 0, sudahCheckIn: 0, pendapatanHariIni: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState<TicketBooking | null>(null);
  const [scanModalBooking, setScanModalBooking] = useState<TicketBooking | null>(null);
  const [editCategory, setEditCategory] = useState<TicketCategory | null>(null);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const bookingsPerPage = 5;

  const [newCat, setNewCat] = useState({ badge: "", title: "", price: 0, kuota: 100 });

  // ─── Fetch data dari backend ─────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [catRes, bookRes, statsRes] = await Promise.all([
        tiketApi.getCategories(),
        tiketApi.getBookings({ limit: 100 }),
        tiketApi.getStats(),
      ]);
      setCategories(catRes.data);
      setBookings(bookRes.data);
      setStats({
        terjualHariIni: statsRes.data.terjualHariIni,
        sudahCheckIn: statsRes.data.sudahCheckIn,
        pendapatanHariIni: statsRes.data.pendapatanHariIni,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Filter bookings
  const filteredBookings = bookings.filter((b) => {
    const matchSearch = b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.nama.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === "ALL" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });
  const totalBookingPages = Math.max(1, Math.ceil(filteredBookings.length / bookingsPerPage));
  const paginatedBookings = filteredBookings.slice((currentPage - 1) * bookingsPerPage, currentPage * bookingsPerPage);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["ID Transaksi,Nama,Email,Total Tiket,Tgl Kunjungan,Total Biaya,Status,Check-In\n"];
    const rows = bookings.map(b =>
      `${b.id},${b.nama},${b.email},${b.total_tiket},${b.visit_date},${b.total_biaya},${b.status},${b.checked_in ? "Ya" : "Tidak"}`
    );
    const blob = new Blob([headers + rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Laporan_Tiket_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  // Tambah kategori
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCat.title || !newCat.badge) return;
    setSaving(true);
    try {
      await tiketApi.addCategory({
        badge: newCat.badge.toUpperCase(),
        badge_bg: "#e0f2fe",
        badge_color: "#0369a1",
        title: newCat.title,
        price: newCat.price,
        kuota: newCat.kuota,
        status: "Aktif",
      });
      await fetchData();
      setIsAddCategoryOpen(false);
      setNewCat({ badge: "", title: "", price: 0, kuota: 100 });
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally { setSaving(false); }
  };

  // Edit kategori
  const handleSaveEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCategory) return;
    setSaving(true);
    try {
      await tiketApi.updateCategory(String(editCategory.id), {
        title: editCategory.title,
        price: editCategory.price,
        kuota: editCategory.kuota,
        status: editCategory.status,
      });
      await fetchData();
      setEditCategory(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal menyimpan perubahan");
    } finally { setSaving(false); }
  };

  // Check-in
  const handleConfirmCheckIn = async (id: string) => {
    try {
      // Pastikan status LUNAS dulu
      await tiketApi.updateBookingStatus(id, "LUNAS");
      await tiketApi.checkIn(id);
      await fetchData();
      setScanModalBooking(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal check-in");
    }
  };

  return (
    <div style={{ fontFamily: "Georgia, serif", color: "#2B2823", padding: "8px 4px", position: "relative" }}>

      {/* Error Banner */}
      {error && (
        <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fca5a5", color: "#dc2626", padding: "10px 16px", borderRadius: "8px", marginBottom: "16px", fontSize: "12px", display: "flex", justifyContent: "space-between" }}>
          <span>⚠️ {error} — Pastikan backend berjalan di <code>http://localhost:3001</code></span>
          <button onClick={fetchData} style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer", fontWeight: "700" }}>Coba Lagi</button>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: "28px", fontWeight: "normal", color: "#1C1917", margin: 0 }}>Manajemen Tiket</h1>
        <p style={{ fontFamily: "sans-serif", fontSize: "13px", color: "#78716C", margin: "6px 0 0 0" }}>Kelola kategori tiket, harga, kuota, serta pemesanan tiket pengunjung</p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "TOTAL TIKET TERJUAL HARI INI", value: loading ? "..." : `${stats.terjualHariIni}`, unit: "Tiket", icon: "🎫", bg: "#FEF3C7" },
          { label: "SUDAH CHECK-IN HARI INI", value: loading ? "..." : `${stats.sudahCheckIn}`, unit: "Pengunjung", icon: "📲", bg: "#D1FAE5" },
          { label: "PENDAPATAN HARI INI", value: loading ? "..." : `Rp ${stats.pendapatanHariIni.toLocaleString("id-ID")}`, unit: "", icon: "👝", bg: "#DBEAFE" },
        ].map((card, i) => (
          <div key={i} style={{ backgroundColor: "#FFFFFF", padding: "18px 20px", borderRadius: "14px", border: "1px solid #E7E5E4", display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "10px", backgroundColor: card.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>{card.icon}</div>
            <div>
              <span style={{ fontFamily: "sans-serif", fontSize: "10px", fontWeight: "700", color: "#A8A29E", letterSpacing: "0.5px", textTransform: "uppercase" }}>{card.label}</span>
              <div style={{ marginTop: "2px", display: "flex", alignItems: "baseline", gap: "6px" }}>
                <span style={{ fontFamily: "sans-serif", fontSize: "20px", fontWeight: "800", color: "#1C1917" }}>{card.value}</span>
                {card.unit && <span style={{ fontFamily: "sans-serif", fontSize: "12px", color: "#78716C" }}>{card.unit}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Kategori Tiket */}
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "14px", border: "1px solid #E7E5E4", padding: "20px", marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
          <div>
            <h2 style={{ fontFamily: "sans-serif", fontSize: "12px", fontWeight: "800", margin: 0, color: "#1C1917", letterSpacing: "0.5px" }}>KATEGORI & TARIF TIKET MASUK</h2>
            <p style={{ fontFamily: "sans-serif", fontSize: "11px", color: "#78716C", margin: "4px 0 0 0" }}>Atur besaran harga tiket dan batas kuota harian pengunjung</p>
          </div>
          <button onClick={() => setIsAddCategoryOpen(true)}
            style={{ backgroundColor: "#224229", color: "#FFFFFF", border: "none", borderRadius: "8px", padding: "8px 16px", fontSize: "12px", fontWeight: "600", fontFamily: "sans-serif", cursor: "pointer" }}>
            + Tambah Kategori Tiket
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          {loading ? <p style={{ fontFamily: "sans-serif", fontSize: "12px", color: "#78716C" }}>Memuat kategori...</p> :
            categories.map((cat) => (
              <div key={cat.id} style={{ backgroundColor: "#FAFAF9", borderRadius: "10px", border: "1px solid #F5F5F4", padding: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <span style={{ fontFamily: "sans-serif", backgroundColor: cat.badge_bg, color: cat.badge_color, fontSize: "9px", fontWeight: "800", padding: "3px 8px", borderRadius: "4px", letterSpacing: "0.5px" }}>{cat.badge}</span>
                  <button onClick={() => setEditCategory({ ...cat })} style={{ fontFamily: "sans-serif", background: "none", border: "none", color: "#78716C", fontSize: "11px", cursor: "pointer", fontWeight: "600" }}>✏️ Edit</button>
                </div>
                <h3 style={{ fontFamily: "sans-serif", fontSize: "14px", fontWeight: "700", color: "#1C1917", margin: "0 0 4px 0" }}>{cat.title}</h3>
                <div style={{ fontFamily: "sans-serif", display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "16px" }}>
                  <span style={{ fontSize: "18px", fontWeight: "800", color: "#1C1917" }}>Rp {cat.price.toLocaleString("id-ID")}</span>
                  <span style={{ fontSize: "11px", color: "#78716C" }}>/ orang</span>
                </div>
                <div style={{ fontFamily: "sans-serif", display: "flex", justifyContent: "space-between", borderTop: "1px dashed #E7E5E4", paddingTop: "10px", fontSize: "11px" }}>
                  <span style={{ color: "#78716C" }}>Kuota: <strong style={{ color: "#1C1917" }}>{cat.kuota}</strong></span>
                  <span style={{ color: cat.status === "Aktif" ? "#059669" : "#DC2626", fontWeight: "700" }}>{cat.status}</span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Daftar Pemesanan */}
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "14px", border: "1px solid #E7E5E4", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #F5F5F4", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h2 style={{ fontFamily: "sans-serif", fontSize: "12px", fontWeight: "800", margin: 0, color: "#1C1917", letterSpacing: "0.5px" }}>DAFTAR PEMESANAN & RIWAYAT TIKET</h2>
            <p style={{ fontFamily: "sans-serif", fontSize: "11px", color: "#78716C", margin: "4px 0 0 0" }}>Data seluruh reservasi dan tiket yang telah dibeli pengunjung</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", fontFamily: "sans-serif" }}>
            <div style={{ position: "relative" }}>
              <input type="text" placeholder="Cari Kode / Nama..." value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                style={{ padding: "6px 12px 6px 28px", fontSize: "11px", borderRadius: "8px", border: "1px solid #E7E5E4", backgroundColor: "#FAFAF9", outline: "none", width: "180px", fontFamily: "sans-serif" }} />
              <span style={{ position: "absolute", left: "8px", top: "6px", fontSize: "11px", color: "#A8A29E" }}>🔍</span>
            </div>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              style={{ padding: "6px 12px", fontSize: "11px", borderRadius: "8px", border: "1px solid #E7E5E4", backgroundColor: "#FAFAF9", outline: "none", cursor: "pointer", fontFamily: "sans-serif" }}>
              <option value="ALL">Semua Status</option>
              <option value="LUNAS">LUNAS</option>
              <option value="MENUNGGU">MENUNGGU</option>
              <option value="BATAL">BATAL</option>
            </select>
            <button onClick={handleExportCSV}
              style={{ padding: "6px 14px", borderRadius: "8px", border: "1px solid #FEF08A", backgroundColor: "#FEFCE8", color: "#854D0E", fontSize: "11px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontFamily: "sans-serif" }}>
              📥 Ekspor Data
            </button>
          </div>
        </div>

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
            ) : paginatedBookings.map((b) => (
              <tr key={b.id} style={{ borderBottom: "1px solid #FAFAF9" }}>
                <td style={{ padding: "14px 20px", fontWeight: "800", color: "#1C1917" }}>{b.id}</td>
                <td style={{ padding: "14px 20px", color: "#44403C" }}>{b.nama}</td>
                <td style={{ padding: "14px 20px", color: "#44403C" }}>{b.total_tiket} Tiket</td>
                <td style={{ padding: "14px 20px", color: "#44403C" }}>{b.visit_date}</td>
                <td style={{ padding: "14px 20px", fontWeight: "800", color: "#1C1917" }}>Rp {b.total_biaya.toLocaleString("id-ID")}</td>
                <td style={{ padding: "14px 20px" }}>
                  <span style={{ backgroundColor: b.status === "LUNAS" ? "#D1FAE5" : b.status === "BATAL" ? "#FEE2E2" : "#FEF3C7", color: b.status === "LUNAS" ? "#047857" : b.status === "BATAL" ? "#DC2626" : "#B45309", padding: "3px 8px", borderRadius: "10px", fontSize: "9px", fontWeight: "800" }}>{b.status}</span>
                </td>
                <td style={{ padding: "14px 20px", textAlign: "right" }}>
                  <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "8px" }}>
                    <button onClick={() => setScanModalBooking(b)} style={{ backgroundColor: "#224229", color: "#FFFFFF", border: "none", borderRadius: "6px", padding: "4px 10px", fontSize: "10px", fontWeight: "700", cursor: "pointer", fontFamily: "sans-serif" }}>🔲 Scan</button>
                    <button onClick={() => setSelectedBooking(b)} style={{ color: "#2563EB", fontWeight: "700", border: "none", background: "none", cursor: "pointer", fontSize: "11px", fontFamily: "sans-serif" }}>Detail</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div style={{ padding: "12px 20px", borderTop: "1px solid #F5F5F4", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", color: "#78716C", fontFamily: "sans-serif" }}>
          <span>Menampilkan {filteredBookings.length ? (currentPage - 1) * bookingsPerPage + 1 : 0} - {Math.min(currentPage * bookingsPerPage, filteredBookings.length)} dari {filteredBookings.length} data</span>
          <div style={{ display: "flex", gap: "4px" }}>
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} style={{ padding: "4px 10px", border: "1px solid #E7E5E4", borderRadius: "6px", backgroundColor: "#FFFFFF", cursor: currentPage === 1 ? "not-allowed" : "pointer", opacity: currentPage === 1 ? 0.5 : 1 }}>Sebelumnya</button>
            {Array.from({ length: totalBookingPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setCurrentPage(p)} style={{ padding: "4px 10px", border: currentPage === p ? "none" : "1px solid #E7E5E4", borderRadius: "6px", backgroundColor: currentPage === p ? "#224229" : "#FFFFFF", color: currentPage === p ? "#FFFFFF" : undefined, fontWeight: currentPage === p ? "700" : undefined, cursor: "pointer" }}>{p}</button>
            ))}
            <button disabled={currentPage === totalBookingPages} onClick={() => setCurrentPage(p => Math.min(totalBookingPages, p + 1))} style={{ padding: "4px 10px", border: "1px solid #E7E5E4", borderRadius: "6px", backgroundColor: "#FFFFFF", cursor: currentPage === totalBookingPages ? "not-allowed" : "pointer", opacity: currentPage === totalBookingPages ? 0.5 : 1 }}>Selanjutnya</button>
          </div>
        </div>
      </div>

      {/* Modal Detail Pemesanan */}
      {selectedBooking && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ backgroundColor: "#FFFFFF", padding: "20px", borderRadius: "12px", width: "360px", border: "1px solid #E7E5E4", fontFamily: "sans-serif" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "800", margin: "0 0 12px 0", color: "#1C1917" }}>Rincian Tiket Pengunjung</h3>
            <div style={{ fontSize: "11px", display: "flex", flexDirection: "column", gap: "6px", color: "#44403C" }}>
              {[
                ["ID Transaksi", selectedBooking.id],
                ["Nama Pembeli", selectedBooking.nama],
                ["Email", selectedBooking.email],
                ["No. WhatsApp", selectedBooking.phone || "-"],
                ["Dewasa", `${selectedBooking.kategori_dewasa} tiket`],
                ["Pelajar", `${selectedBooking.kategori_pelajar} tiket`],
                ["WNA", `${selectedBooking.kategori_wna} tiket`],
                ["Total Tiket", `${selectedBooking.total_tiket} tiket`],
                ["Tanggal Kunjungan", selectedBooking.visit_date],
                ["Sesi", selectedBooking.sesi],
                ["Metode Bayar", selectedBooking.payment_method],
                ["Total Biaya", `Rp ${selectedBooking.total_biaya.toLocaleString("id-ID")}`],
                ["Status", selectedBooking.status],
                ["Check-In", selectedBooking.checked_in ? "✅ Sudah" : "⏳ Belum"],
              ].map(([label, value]) => (
                <p key={label} style={{ margin: 0 }}><strong>{label}:</strong> {value}</p>
              ))}
            </div>
            <button onClick={() => setSelectedBooking(null)} style={{ marginTop: "16px", width: "100%", padding: "8px", backgroundColor: "#1C1917", color: "#FFFFFF", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: "700" }}>Tutup</button>
          </div>
        </div>
      )}

      {/* Modal Scan Check-In */}
      {scanModalBooking && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ backgroundColor: "#FFFFFF", padding: "20px", borderRadius: "12px", width: "320px", textAlign: "center", border: "1px solid #E7E5E4", fontFamily: "sans-serif" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "800", margin: "0 0 8px 0", color: "#1C1917" }}>Scan Check-In Tiket</h3>
            <p style={{ fontSize: "11px", color: "#78716C", margin: "0 0 16px 0" }}>Kode: {scanModalBooking.id}</p>
            <div style={{ width: "120px", height: "120px", backgroundColor: "#FAFAF9", border: "2px dashed #A8A29E", borderRadius: "8px", margin: "0 auto 16px auto", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "40px" }}>🔲</div>
            <p style={{ fontSize: "12px", fontWeight: "700", margin: "0 0 4px 0", color: "#1C1917" }}>{scanModalBooking.nama}</p>
            <p style={{ fontSize: "11px", color: "#78716C", margin: "0 0 12px 0" }}>{scanModalBooking.total_tiket} Tiket • {scanModalBooking.visit_date}</p>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => handleConfirmCheckIn(scanModalBooking.id)} style={{ flex: 1, padding: "8px", backgroundColor: "#059669", color: "#FFFFFF", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: "700" }}>✅ Konfirmasi Check-In</button>
              <button onClick={() => setScanModalBooking(null)} style={{ flex: 1, padding: "8px", backgroundColor: "#FAFAF9", color: "#44403C", border: "1px solid #E7E5E4", borderRadius: "6px", cursor: "pointer", fontSize: "11px" }}>Batal</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah Kategori */}
      {isAddCategoryOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <form onSubmit={handleAddCategory} style={{ backgroundColor: "#FFFFFF", padding: "20px", borderRadius: "12px", width: "320px", border: "1px solid #E7E5E4", fontFamily: "sans-serif" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "800", margin: "0 0 12px 0", color: "#1C1917" }}>Tambah Kategori Tiket</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "11px" }}>
              <label><span style={{ display: "block", marginBottom: "4px", fontWeight: "700" }}>Label Badge (e.g. DEWASA)</span>
                <input required value={newCat.badge} onChange={e => setNewCat({ ...newCat, badge: e.target.value })} style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #CCC", boxSizing: "border-box" }} /></label>
              <label><span style={{ display: "block", marginBottom: "4px", fontWeight: "700" }}>Nama Kategori Tiket</span>
                <input required value={newCat.title} onChange={e => setNewCat({ ...newCat, title: e.target.value })} style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #CCC", boxSizing: "border-box" }} /></label>
              <label><span style={{ display: "block", marginBottom: "4px", fontWeight: "700" }}>Harga (Rp)</span>
                <input type="number" required value={newCat.price} onChange={e => setNewCat({ ...newCat, price: Number(e.target.value) })} style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #CCC", boxSizing: "border-box" }} /></label>
              <label><span style={{ display: "block", marginBottom: "4px", fontWeight: "700" }}>Kuota Harian</span>
                <input type="number" required value={newCat.kuota} onChange={e => setNewCat({ ...newCat, kuota: Number(e.target.value) })} style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #CCC", boxSizing: "border-box" }} /></label>
            </div>
            <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
              <button type="submit" disabled={saving} style={{ flex: 1, padding: "8px", backgroundColor: "#224229", color: "#FFFFFF", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: "700", opacity: saving ? 0.6 : 1 }}>{saving ? "Menyimpan..." : "Simpan"}</button>
              <button type="button" onClick={() => setIsAddCategoryOpen(false)} style={{ flex: 1, padding: "8px", backgroundColor: "#FAFAF9", color: "#44403C", border: "1px solid #E7E5E4", borderRadius: "6px", cursor: "pointer", fontSize: "11px" }}>Batal</button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Edit Kategori */}
      {editCategory && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <form onSubmit={handleSaveEditCategory} style={{ backgroundColor: "#FFFFFF", padding: "20px", borderRadius: "12px", width: "320px", border: "1px solid #E7E5E4", fontFamily: "sans-serif" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "800", margin: "0 0 12px 0", color: "#1C1917" }}>Edit Kategori Tiket</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "11px" }}>
              <label><span style={{ display: "block", marginBottom: "4px", fontWeight: "700" }}>Nama Kategori</span>
                <input value={editCategory.title} onChange={e => setEditCategory({ ...editCategory, title: e.target.value })} style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #CCC", boxSizing: "border-box" }} /></label>
              <label><span style={{ display: "block", marginBottom: "4px", fontWeight: "700" }}>Harga per Orang (Rp)</span>
                <input type="number" value={editCategory.price} onChange={e => setEditCategory({ ...editCategory, price: Number(e.target.value) })} style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #CCC", boxSizing: "border-box" }} /></label>
              <label><span style={{ display: "block", marginBottom: "4px", fontWeight: "700" }}>Kuota Harian</span>
                <input type="number" value={editCategory.kuota} onChange={e => setEditCategory({ ...editCategory, kuota: Number(e.target.value) })} style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #CCC", boxSizing: "border-box" }} /></label>
            </div>
            <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
              <button type="submit" disabled={saving} style={{ flex: 1, padding: "8px", backgroundColor: "#224229", color: "#FFFFFF", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: "700", opacity: saving ? 0.6 : 1 }}>{saving ? "Menyimpan..." : "Simpan"}</button>
              <button type="button" onClick={() => setEditCategory(null)} style={{ flex: 1, padding: "8px", backgroundColor: "#FAFAF9", color: "#44403C", border: "1px solid #E7E5E4", borderRadius: "6px", cursor: "pointer", fontSize: "11px" }}>Batal</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}