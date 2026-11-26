"use client";

import { useState, useEffect, useCallback, type FormEvent } from "react";
import { QRCodeSVG } from "qrcode.react";
import { tiketApi } from "@/lib/api";
import TicketStatsSection from "./components/TicketStatsSection";
import TicketCategoriesSection from "./components/TicketCategoriesSection";
import TicketBookingsSection from "./components/TicketBookingsSection";
import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal";
import type { TicketBooking, TicketCategory } from "./components/types";

const CATEGORY_RENAME_MAP: Record<string, string> = {
  // Isi jika ada nama kategori lama -> nama kategori baru sesuai catatan dosen, contoh:
  // "Tiket Dewasa": "Pengunjung Umum",
};

const normalizeCategoryTitle = (title?: string): string => {
  const trimmed = (title || "").trim();
  if (!trimmed) return "";
  return CATEGORY_RENAME_MAP[trimmed] ?? trimmed;
};

const LETTERS_ONLY_REGEX = /^[A-Za-z\s]+$/;

const validateCategoryPayload = (input: {
  badge: string;
  title: string;
  price: number;
  kuota: number;
  requireBadge?: boolean;
}): string => {
  const trimmedTitle = input.title.trim();
  const trimmedBadge = input.badge.trim();

  if (input.requireBadge && !trimmedBadge) {
    return "Label badge kategori wajib diisi.";
  }
  if (input.requireBadge && trimmedBadge && !LETTERS_ONLY_REGEX.test(trimmedBadge)) {
    return "Label badge kategori hanya boleh menggunakan huruf saja.";
  }
  if (!trimmedTitle) {
    return "Nama kategori tiket wajib diisi.";
  }
  if (!LETTERS_ONLY_REGEX.test(trimmedTitle)) {
    return "Nama kategori tiket hanya boleh menggunakan huruf saja.";
  }
  if (trimmedTitle.length < 2) {
    return "Nama kategori tiket minimal 2 karakter.";
  }
  if (!Number.isFinite(input.price) || input.price < 0) {
    return "Harga tiket harus berupa angka valid (minimal Rp 0).";
  }
  if (!Number.isInteger(input.kuota) || input.kuota < 1) {
    return "Kuota harian harus berupa bilangan bulat minimal 1.";
  }
  return "";
};

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
  const [editFormError, setEditFormError] = useState("");
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [addFormError, setAddFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TicketCategory | null>(null);
  const [checkInSaving, setCheckInSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
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
      const normalizedCategories: TicketCategory[] = Array.isArray(catRes?.data)
        ? catRes.data.map((item: TicketCategory) => ({
            ...item,
            title: normalizeCategoryTitle(item.title),
          }))
        : [];

      setCategories(normalizedCategories);
      setBookings(Array.isArray(bookRes?.data) ? bookRes.data : []);
      setStats({
        terjualHariIni: Number(statsRes?.data?.terjualHariIni) || 0,
        sudahCheckIn: Number(statsRes?.data?.sudahCheckIn) || 0,
        pendapatanHariIni: Number(statsRes?.data?.pendapatanHariIni) || 0,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchData();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchData]);

  // Filter bookings
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredBookings = bookings.filter((b) => {
    const matchSearch =
      !normalizedSearch ||
      b.id.toLowerCase().includes(normalizedSearch) ||
      b.nama.toLowerCase().includes(normalizedSearch);
    const matchStatus = statusFilter === "ALL" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });
  const totalBookingPages = Math.max(1, Math.ceil(filteredBookings.length / bookingsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalBookingPages);
  const paginatedBookings = filteredBookings.slice(
    (safeCurrentPage - 1) * bookingsPerPage,
    safeCurrentPage * bookingsPerPage
  );

  // Export CSV
  const escapeCsvCell = (value: unknown) => {
    const str = String(value ?? "");
    return `"${str.replace(/"/g, '""')}"`;
  };

  const handleExportCSV = () => {
    const headers = ["ID Transaksi,Nama,Email,Total Tiket,Tgl Kunjungan,Total Biaya,Status,Check-In"];
    const rows = filteredBookings.map((b) =>
      [
        escapeCsvCell(b.id),
        escapeCsvCell(b.nama),
        escapeCsvCell(b.email),
        escapeCsvCell(b.total_tiket),
        escapeCsvCell(b.visit_date),
        escapeCsvCell(b.total_biaya),
        escapeCsvCell(b.status),
        escapeCsvCell(b.checked_in ? "Ya" : "Tidak"),
      ].join(",")
    );
    const blob = new Blob([[...headers, ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Laporan_Tiket_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Tambah kategori
  const handleAddCategory = async (e: FormEvent) => {
    e.preventDefault();
    setAddFormError("");
    setSuccessMessage("");

    const trimmedBadge = newCat.badge.trim().toUpperCase();
    const trimmedTitle = normalizeCategoryTitle(newCat.title);
    const numPrice = Number(newCat.price);
    const numKuota = Number(newCat.kuota);

    const validationMsg = validateCategoryPayload({
      badge: trimmedBadge,
      title: trimmedTitle,
      price: numPrice,
      kuota: numKuota,
      requireBadge: true,
    });

    if (validationMsg) {
      setAddFormError(validationMsg);
      return;
    }

    setSaving(true);
    try {
      await tiketApi.addCategory({
        badge: trimmedBadge,
        badge_bg: "#e0f2fe",
        badge_color: "#0369a1",
        title: trimmedTitle,
        price: numPrice,
        kuota: numKuota,
        status: "Aktif",
      });
      await fetchData();
      setIsAddCategoryOpen(false);
      setAddFormError("");
      setNewCat({ badge: "", title: "", price: 0, kuota: 100 });
      setSuccessMessage("Kategori tiket baru berhasil ditambahkan.");
    } catch (err: unknown) {
      setAddFormError(err instanceof Error ? err.message : "Gagal menyimpan kategori tiket.");
    } finally {
      setSaving(false);
    }
  };

  // Edit kategori
  const handleSaveEditCategory = async (e: FormEvent) => {
    e.preventDefault();
    if (!editCategory) return;

    setEditFormError("");
    setSuccessMessage("");

    const trimmedTitle = normalizeCategoryTitle(editCategory.title);
    const numPrice = Number(editCategory.price);
    const numKuota = Number(editCategory.kuota);

    const validationMsg = validateCategoryPayload({
      badge: editCategory.badge || "",
      title: trimmedTitle,
      price: numPrice,
      kuota: numKuota,
      requireBadge: false,
    });

    if (validationMsg) {
      setEditFormError(validationMsg);
      return;
    }

    setSaving(true);
    try {
      await tiketApi.updateCategory(String(editCategory.id), {
        title: trimmedTitle,
        price: numPrice,
        kuota: numKuota,
        status: editCategory.status,
      });
      await fetchData();
      setEditCategory(null);
      setEditFormError("");
      setSuccessMessage("Perubahan kategori tiket berhasil disimpan.");
    } catch (err: unknown) {
      setEditFormError(err instanceof Error ? err.message : "Gagal menyimpan perubahan.");
    } finally {
      setSaving(false);
    }
  };

  // Hapus kategori
  const handleDeleteCategory = (category: TicketCategory) => {
    setDeleteTarget(category);
  };

  const confirmDeleteCategory = async () => {
    if (!deleteTarget) return;
    const label = deleteTarget.title || deleteTarget.badge || "kategori ini";

    setError("");
    setSuccessMessage("");
    setSaving(true);
    try {
      await tiketApi.deleteCategory(String(deleteTarget.id));
      await fetchData();
      setSuccessMessage(`Kategori tiket "${label}" berhasil dihapus.`);
      setDeleteTarget(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal menghapus kategori tiket.");
      setDeleteTarget(null);
    } finally {
      setSaving(false);
    }
  };

  // Check-in
  const handleConfirmCheckIn = async (booking: TicketBooking) => {
    if (booking.status !== "LUNAS" || booking.checked_in || checkInSaving) return;

    setCheckInSaving(true);
    setSuccessMessage("");
    try {
      const response = await tiketApi.checkIn(booking.id);
      setBookings((current) =>
        current.map((item) => (item.id === booking.id ? { ...item, ...response.data } : item))
      );
      await fetchData();
      setScanModalBooking(null);
      setSuccessMessage(`Check-in tiket ${booking.id} berhasil dikonfirmasi.`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal check-in");
    } finally {
      setCheckInSaving(false);
    }
  };

  return (
    <div style={{ fontFamily: "Georgia, serif", color: "#2B2823", padding: "8px 4px", position: "relative" }}>
      {/* Error Banner */}
      {error && (
        <div
          style={{
            backgroundColor: "#fef2f2",
            border: "1px solid #fca5a5",
            color: "#dc2626",
            padding: "10px 16px",
            borderRadius: "8px",
            marginBottom: "16px",
            fontSize: "12px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>⚠️ {error}</span>
          <button
            type="button"
            onClick={fetchData}
            style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer", fontWeight: "700" }}
          >
            Coba Lagi
          </button>
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          style={{
            backgroundColor: "#ECFDF5",
            border: "1px solid #A7F3D0",
            color: "#047857",
            padding: "10px 16px",
            borderRadius: "8px",
            marginBottom: "16px",
            fontSize: "12px",
            fontWeight: "700",
          }}
        >
          {successMessage}
        </div>
      )}

      <TicketStatsSection loading={loading} stats={stats} />

      <TicketCategoriesSection
        loading={loading}
        categories={categories}
        onAdd={() => {
          setAddFormError("");
          setIsAddCategoryOpen(true);
        }}
        onEdit={(category) => {
          setEditFormError("");
          setEditCategory({ ...category, title: normalizeCategoryTitle(category.title) });
        }}
        onDelete={handleDeleteCategory}
      />

      <TicketBookingsSection
        loading={loading}
        bookings={paginatedBookings}
        filteredCount={filteredBookings.length}
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        currentPage={safeCurrentPage}
        totalPages={totalBookingPages}
        itemsPerPage={bookingsPerPage}
        onSearchChange={(value) => {
          setSearchQuery(value);
          setCurrentPage(1);
        }}
        onStatusChange={(value) => {
          setStatusFilter(value);
          setCurrentPage(1);
        }}
        onPageChange={setCurrentPage}
        onExport={handleExportCSV}
        onShowDetail={setSelectedBooking}
        onScan={setScanModalBooking}
      />

      {/* Modal Detail Pemesanan */}
      {selectedBooking && (
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
          <div
            style={{
              backgroundColor: "#FFFFFF",
              padding: "20px",
              borderRadius: "12px",
              width: "360px",
              border: "1px solid #E7E5E4",
              fontFamily: "sans-serif",
            }}
          >
            <h3 style={{ fontSize: "14px", fontWeight: "800", margin: "0 0 12px 0", color: "#1C1917" }}>
              Rincian Tiket Pengunjung
            </h3>
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
                ["Total Biaya", `Rp ${(Number(selectedBooking.total_biaya) || 0).toLocaleString("id-ID")}`],
                ["Status", selectedBooking.status],
                ["Check-In", selectedBooking.checked_in ? "✅ Sudah" : "⏳ Belum"],
                ...(selectedBooking.checked_in_at
                  ? [["Waktu Check-In", new Date(selectedBooking.checked_in_at).toLocaleString("id-ID")]]
                  : []),
              ].map(([label, value]) => (
                <p key={label} style={{ margin: 0 }}>
                  <strong>{label}:</strong> {value}
                </p>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setSelectedBooking(null)}
              style={{
                marginTop: "16px",
                width: "100%",
                padding: "8px",
                backgroundColor: "#1C1917",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "11px",
                fontWeight: "700",
              }}
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Modal Scan Check-In */}
      {scanModalBooking && (
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
          <div
            style={{
              backgroundColor: "#FFFFFF",
              padding: "20px",
              borderRadius: "12px",
              width: "320px",
              textAlign: "center",
              border: "1px solid #E7E5E4",
              fontFamily: "sans-serif",
            }}
          >
            <h3 style={{ fontSize: "14px", fontWeight: "800", margin: "0 0 8px 0", color: "#1C1917" }}>
              Scan Check-In Tiket
            </h3>
            <p style={{ fontSize: "11px", color: "#78716C", margin: "0 0 16px 0" }}>
              Kode: {scanModalBooking.id}
            </p>
            <div
              style={{
                width: "184px",
                height: "184px",
                backgroundColor: "#FFFFFF",
                border: "1px solid #E7E5E4",
                borderRadius: "8px",
                margin: "0 auto 16px auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <QRCodeSVG
                value={scanModalBooking.id}
                size={168}
                level="H"
                marginSize={2}
                title={`QR Tiket ${scanModalBooking.id}`}
              />
            </div>
            <p style={{ fontSize: "12px", fontWeight: "700", margin: "0 0 4px 0", color: "#1C1917" }}>
              {scanModalBooking.nama}
            </p>
            <p style={{ fontSize: "11px", color: "#78716C", margin: "0 0 12px 0" }}>
              {scanModalBooking.total_tiket} Tiket • {scanModalBooking.visit_date}
            </p>
            {scanModalBooking.checked_in ? (
              <p style={{ fontSize: "11px", color: "#B45309", margin: "0 0 12px 0" }}>
                Tiket ini sudah digunakan untuk check-in.
              </p>
            ) : scanModalBooking.status !== "LUNAS" ? (
              <p style={{ fontSize: "11px", color: "#B45309", margin: "0 0 12px 0" }}>
                Pembayaran belum lunas. Check-in tidak dapat dilakukan.
              </p>
            ) : null}
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                onClick={() => handleConfirmCheckIn(scanModalBooking)}
                disabled={
                  checkInSaving ||
                  scanModalBooking.status !== "LUNAS" ||
                  Boolean(scanModalBooking.checked_in)
                }
                style={{
                  flex: 1,
                  padding: "8px",
                  backgroundColor: "#059669",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "6px",
                  cursor:
                    checkInSaving ||
                    scanModalBooking.status !== "LUNAS" ||
                    Boolean(scanModalBooking.checked_in)
                      ? "not-allowed"
                      : "pointer",
                  fontSize: "11px",
                  fontWeight: "700",
                  opacity:
                    checkInSaving ||
                    scanModalBooking.status !== "LUNAS" ||
                    Boolean(scanModalBooking.checked_in)
                      ? 0.6
                      : 1,
                }}
              >
                {checkInSaving
                  ? "Menyimpan..."
                  : scanModalBooking.checked_in
                    ? "Sudah Check-In"
                    : "✅ Konfirmasi Check-In"}
              </button>
              <button
                type="button"
                onClick={() => setScanModalBooking(null)}
                disabled={checkInSaving}
                style={{
                  flex: 1,
                  padding: "8px",
                  backgroundColor: "#FAFAF9",
                  color: "#44403C",
                  border: "1px solid #E7E5E4",
                  borderRadius: "6px",
                  cursor: checkInSaving ? "not-allowed" : "pointer",
                  fontSize: "11px",
                }}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah Kategori */}
      {isAddCategoryOpen && (
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
          <form
            onSubmit={handleAddCategory}
            noValidate
            style={{
              backgroundColor: "#FFFFFF",
              padding: "20px",
              borderRadius: "12px",
              width: "340px",
              border: "1px solid #E7E5E4",
              fontFamily: "sans-serif",
            }}
          >
            <h3 style={{ fontSize: "14px", fontWeight: "800", margin: "0 0 12px 0", color: "#1C1917" }}>
              Tambah Kategori Tiket
            </h3>

            {addFormError && (
              <div
                role="alert"
                style={{
                  backgroundColor: "#FEF2F2",
                  border: "1px solid #FCA5A5",
                  color: "#B91C1C",
                  padding: "8px 10px",
                  borderRadius: "6px",
                  fontSize: "11px",
                  marginBottom: "10px",
                }}
              >
                {addFormError}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "11px" }}>
              <label>
                <span style={{ display: "block", marginBottom: "4px", fontWeight: "700" }}>
                  Label Badge (e.g. DEWASA)
                </span>
                <input
                  value={newCat.badge}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const sanitized = raw.replace(/[^A-Za-z\s]/g, "");
                    setNewCat({ ...newCat, badge: sanitized });
                    if (raw !== sanitized) {
                      setAddFormError("Label badge kategori hanya boleh menggunakan huruf saja.");
                    } else if (addFormError) {
                      setAddFormError("");
                    }
                  }}
                  style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #CCC", boxSizing: "border-box" }}
                />
              </label>
              <label>
                <span style={{ display: "block", marginBottom: "4px", fontWeight: "700" }}>
                  Nama Kategori Tiket
                </span>
                <input
                  value={newCat.title}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const sanitized = raw.replace(/[^A-Za-z\s]/g, "");
                    setNewCat({ ...newCat, title: sanitized });
                    if (raw !== sanitized) {
                      setAddFormError("Nama kategori tiket hanya boleh menggunakan huruf saja.");
                    } else if (addFormError) {
                      setAddFormError("");
                    }
                  }}
                  style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #CCC", boxSizing: "border-box" }}
                />
              </label>
              <label>
                <span style={{ display: "block", marginBottom: "4px", fontWeight: "700" }}>
                  Harga (Rp)
                </span>
                <input
                  type="number"
                  min={0}
                  value={Number.isFinite(newCat.price) ? newCat.price : ""}
                  onChange={(e) => {
                    setNewCat({ ...newCat, price: e.target.value === "" ? NaN : Number(e.target.value) });
                    if (addFormError) setAddFormError("");
                  }}
                  style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #CCC", boxSizing: "border-box" }}
                />
              </label>
              <label>
                <span style={{ display: "block", marginBottom: "4px", fontWeight: "700" }}>
                  Kuota Harian
                </span>
                <input
                  type="number"
                  min={1}
                  value={Number.isFinite(newCat.kuota) ? newCat.kuota : ""}
                  onChange={(e) => {
                    setNewCat({ ...newCat, kuota: e.target.value === "" ? NaN : Number(e.target.value) });
                    if (addFormError) setAddFormError("");
                  }}
                  style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #CCC", boxSizing: "border-box" }}
                />
              </label>
            </div>

            <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  flex: 1,
                  padding: "8px",
                  backgroundColor: "#224229",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "6px",
                  cursor: saving ? "not-allowed" : "pointer",
                  fontSize: "11px",
                  fontWeight: "700",
                  opacity: saving ? 0.6 : 1,
                }}
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddCategoryOpen(false);
                  setAddFormError("");
                }}
                style={{
                  flex: 1,
                  padding: "8px",
                  backgroundColor: "#FAFAF9",
                  color: "#44403C",
                  border: "1px solid #E7E5E4",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "11px",
                }}
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Edit Kategori */}
      {editCategory && (
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
          <form
            onSubmit={handleSaveEditCategory}
            noValidate
            style={{
              backgroundColor: "#FFFFFF",
              padding: "20px",
              borderRadius: "12px",
              width: "340px",
              border: "1px solid #E7E5E4",
              fontFamily: "sans-serif",
            }}
          >
            <h3 style={{ fontSize: "14px", fontWeight: "800", margin: "0 0 12px 0", color: "#1C1917" }}>
              Edit Kategori Tiket
            </h3>

            {editFormError && (
              <div
                role="alert"
                style={{
                  backgroundColor: "#FEF2F2",
                  border: "1px solid #FCA5A5",
                  color: "#B91C1C",
                  padding: "8px 10px",
                  borderRadius: "6px",
                  fontSize: "11px",
                  marginBottom: "10px",
                }}
              >
                {editFormError}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "11px" }}>
              <label>
                <span style={{ display: "block", marginBottom: "4px", fontWeight: "700" }}>
                  Nama Kategori
                </span>
                <input
                  value={editCategory.title}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const sanitized = raw.replace(/[^A-Za-z\s]/g, "");
                    setEditCategory({ ...editCategory, title: sanitized });
                    if (raw !== sanitized) {
                      setEditFormError("Nama kategori tiket hanya boleh menggunakan huruf saja.");
                    } else if (editFormError) {
                      setEditFormError("");
                    }
                  }}
                  style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #CCC", boxSizing: "border-box" }}
                />
              </label>
              <label>
                <span style={{ display: "block", marginBottom: "4px", fontWeight: "700" }}>
                  Harga per Orang (Rp)
                </span>
                <input
                  type="number"
                  min={0}
                  value={Number.isFinite(editCategory.price) ? editCategory.price : ""}
                  onChange={(e) => {
                    setEditCategory({
                      ...editCategory,
                      price: e.target.value === "" ? NaN : Number(e.target.value),
                    });
                    if (editFormError) setEditFormError("");
                  }}
                  style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #CCC", boxSizing: "border-box" }}
                />
              </label>
              <label>
                <span style={{ display: "block", marginBottom: "4px", fontWeight: "700" }}>
                  Kuota Harian
                </span>
                <input
                  type="number"
                  min={1}
                  value={Number.isFinite(editCategory.kuota) ? editCategory.kuota : ""}
                  onChange={(e) => {
                    setEditCategory({
                      ...editCategory,
                      kuota: e.target.value === "" ? NaN : Number(e.target.value),
                    });
                    if (editFormError) setEditFormError("");
                  }}
                  style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #CCC", boxSizing: "border-box" }}
                />
              </label>
            </div>

            <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  flex: 1,
                  padding: "8px",
                  backgroundColor: "#224229",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "6px",
                  cursor: saving ? "not-allowed" : "pointer",
                  fontSize: "11px",
                  fontWeight: "700",
                  opacity: saving ? 0.6 : 1,
                }}
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditCategory(null);
                  setEditFormError("");
                }}
                style={{
                  flex: 1,
                  padding: "8px",
                  backgroundColor: "#FAFAF9",
                  color: "#44403C",
                  border: "1px solid #E7E5E4",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "11px",
                }}
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Hapus Kategori Tiket?"
        itemName={deleteTarget?.title || deleteTarget?.badge}
        description="Yakin Anda ingin menghapus kategori tiket ini? Kategori juga akan terhapus dari aplikasi pengunjung."
        loading={saving}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDeleteCategory}
      />
    </div>
  );
}