"use client";

import { useState, useEffect, useCallback } from "react";
import { tiketApi } from "@/lib/api";
import TicketStatsSection from "./components/TicketStatsSection";
import TicketCategoriesSection from "./components/TicketCategoriesSection";
import TicketBookingsSection from "./components/TicketBookingsSection";
import type { TicketBooking, TicketCategory } from "./components/types";

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



      <TicketStatsSection loading={loading} stats={stats} />

      <TicketCategoriesSection
        loading={loading}
        categories={categories}
        onAdd={() => setIsAddCategoryOpen(true)}
        onEdit={(category) => setEditCategory({ ...category })}
      />

      <TicketBookingsSection
        loading={loading}
        bookings={paginatedBookings}
        filteredCount={filteredBookings.length}
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        currentPage={currentPage}
        totalPages={totalBookingPages}
        itemsPerPage={bookingsPerPage}
        onSearchChange={(value) => { setSearchQuery(value); setCurrentPage(1); }}
        onStatusChange={(value) => { setStatusFilter(value); setCurrentPage(1); }}
        onPageChange={setCurrentPage}
        onExport={handleExportCSV}
        onShowDetail={setSelectedBooking}
        onScan={setScanModalBooking}
      />

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