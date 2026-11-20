"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Search, Plus, Trash2, X } from "lucide-react";
import { aiApi, ApiNetworkError, koleksiApi, storageApi } from "@/lib/api";
import CollectionStatsSection from "./components/CollectionStatsSection";
import CollectionTableSection from "./components/CollectionTableSection";
import type { KoleksiItem, KoleksiStatus } from "./components/types";

interface Stats {
  total: number;
  dipamerkan: number;
  restorasi: number;
  disimpan: number;
}

const VALID_CATEGORIES = ["Kendaraan", "Senjata", "Dokumen", "Pakaian"] as const;
const VALID_STATUSES: KoleksiStatus[] = ["DIPAMERKAN", "RESTORASI", "SIMPAN"];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const emptyForm = {
  nama: "",
  sub_deskripsi: "",
  deskripsi_lengkap: "",
  kategori: "Kendaraan",
  tahun: "",
  lokasi: "",
  status: "DIPAMERKAN" as KoleksiStatus,
  image_url: "",
};

const validateKoleksiInput = (input: {
  nama: string;
  lokasi: string;
  kategori: string;
  status: string;
  tahun?: string;
}): string => {
  const trimmedNama = (input.nama || "").trim();
  const trimmedLokasi = (input.lokasi || "").trim();
  const trimmedTahun = (input.tahun || "").trim();

  if (!trimmedNama) {
    return "Nama koleksi wajib diisi.";
  }
  if (trimmedNama.length < 2) {
    return "Nama koleksi minimal 2 karakter.";
  }
  if (!VALID_CATEGORIES.includes(input.kategori as (typeof VALID_CATEGORIES)[number])) {
    return "Kategori koleksi tidak valid.";
  }
  if (trimmedTahun && trimmedTahun.length > 50) {
    return "Tahun / era maksimal 50 karakter.";
  }
  if (!trimmedLokasi) {
    return "Lokasi ruang wajib diisi.";
  }
  if (trimmedLokasi.length < 2) {
    return "Lokasi ruang minimal 2 karakter.";
  }
  if (!VALID_STATUSES.includes(input.status as KoleksiStatus)) {
    return "Status koleksi tidak valid.";
  }
  return "";
};

export default function KatalogKoleksiPage() {
  const [koleksiList, setKoleksiList] = useState<KoleksiItem[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, dipamerkan: 0, restorasi: 0, disimpan: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Semua Kategori");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDetail, setSelectedDetail] = useState<KoleksiItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addError, setAddError] = useState("");
  const [editItem, setEditItem] = useState<KoleksiItem | null>(null);
  const [editError, setEditError] = useState("");
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const itemsPerPage = 5;

  // ─── Upload Foto Koleksi ──────────────────────────────────────────────────
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      const msg = "File harus berupa gambar (JPG, PNG, WEBP, dll.).";
      if (isEdit) setEditError(msg);
      else setAddError(msg);
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      const msg = "Ukuran foto maksimal 5 MB.";
      if (isEdit) setEditError(msg);
      else setAddError(msg);
      return;
    }

    if (isEdit) setEditError("");
    else setAddError("");

    setUploadingImage(true);
    try {
      const uploaded = await storageApi.uploadCollectionImage(file);

      if (isEdit) {
        setEditItem((prev) => (prev ? { ...prev, image_url: uploaded.url } : null));
      } else {
        setFormData((prev) => ({ ...prev, image_url: uploaded.url }));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mengunggah foto koleksi.";
      if (isEdit) setEditError(msg);
      else setAddError(msg);
    } finally {
      setUploadingImage(false);
    }
  };

  // ─── Fetch data dari backend ───────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [koleksiRes, statsRes] = await Promise.all([
        koleksiApi.getAll({ limit: 100 }),
        koleksiApi.getStats().catch(() => null),
      ]);
      setKoleksiList(Array.isArray(koleksiRes?.data) ? koleksiRes.data : []);
      const statsData = statsRes?.data ?? koleksiRes?.stats;
      if (statsData) {
        setStats({
          total: Number(statsData.total) || 0,
          dipamerkan: Number(statsData.dipamerkan) || 0,
          restorasi: Number(statsData.restorasi) || 0,
          disimpan: Number(statsData.disimpan) || 0,
        });
      }
    } catch (err: unknown) {
      if (err instanceof ApiNetworkError) {
        setError("Backend tidak dapat dijangkau. Pastikan server backend sudah menyala.");
      } else if (err instanceof Error) {
        if (err.message.includes("belum dikonfigurasi")) {
          setError("URL backend belum dikonfigurasi (NEXT_PUBLIC_API_URL).");
        } else {
          setError(`Gagal memuat data koleksi: ${err.message}`);
        }
      } else {
        setError("Terjadi kesalahan saat memuat data koleksi.");
      }
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

  // ─── Filter & Pagination ───────────────────────────────────────────────────
  const filteredKoleksi = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return koleksiList.filter((item) => {
      const matchSearch =
        !q ||
        [item.nama, item.kode, item.sub_deskripsi, item.lokasi].some((v) =>
          v?.toLowerCase().includes(q)
        );
      const matchCat = categoryFilter === "Semua Kategori" || item.kategori === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [koleksiList, searchTerm, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredKoleksi.length / itemsPerPage));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const currentItems = filteredKoleksi.slice(
    (safeCurrentPage - 1) * itemsPerPage,
    safeCurrentPage * itemsPerPage
  );

  // ─── Tambah Koleksi ────────────────────────────────────────────────────────
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError("");
    setSuccessMessage("");

    const validationMsg = validateKoleksiInput({
      nama: formData.nama,
      lokasi: formData.lokasi,
      kategori: formData.kategori,
      status: formData.status,
      tahun: formData.tahun,
    });
    if (validationMsg) {
      setAddError(validationMsg);
      return;
    }

    setSaving(true);
    try {
      await koleksiApi.add({
        ...formData,
        nama: formData.nama.trim(),
        sub_deskripsi: formData.sub_deskripsi.trim(),
        deskripsi_lengkap: formData.deskripsi_lengkap.trim(),
        tahun: formData.tahun.trim(),
        lokasi: formData.lokasi.trim(),
        image_url: formData.image_url.trim(),
      });
      await fetchData();
      setIsAddModalOpen(false);
      setAddError("");
      setFormData(emptyForm);
      setCurrentPage(1);
      setSuccessMessage("Koleksi baru berhasil ditambahkan.");
    } catch (err: unknown) {
      setAddError(err instanceof Error ? err.message : "Gagal menyimpan koleksi.");
    } finally {
      setSaving(false);
    }
  };

  // ─── Edit Koleksi ──────────────────────────────────────────────────────────
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    setEditError("");
    setSuccessMessage("");

    const validationMsg = validateKoleksiInput({
      nama: editItem.nama,
      lokasi: editItem.lokasi,
      kategori: editItem.kategori,
      status: editItem.status,
      tahun: editItem.tahun,
    });
    if (validationMsg) {
      setEditError(validationMsg);
      return;
    }

    setSaving(true);
    try {
      await koleksiApi.update(String(editItem.id), {
        nama: editItem.nama.trim(),
        sub_deskripsi: (editItem.sub_deskripsi || "").trim(),
        deskripsi_lengkap: (editItem.deskripsi_lengkap || "").trim(),
        kategori: editItem.kategori,
        tahun: (editItem.tahun || "").trim(),
        lokasi: editItem.lokasi.trim(),
        status: editItem.status,
        image_url: (editItem.image_url || "").trim(),
      });
      await fetchData();
      setEditItem(null);
      setEditError("");
      setSuccessMessage("Perubahan koleksi berhasil disimpan.");
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : "Gagal menyimpan perubahan.");
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateDescription = async (isEdit: boolean) => {
    const title = (isEdit ? editItem?.nama : formData.nama)?.trim() ?? "";
    const category = isEdit ? editItem?.kategori ?? "" : formData.kategori;
    if (!title) {
      const msg = "Isi nama koleksi terlebih dahulu sebelum membuat deskripsi dengan AI.";
      if (isEdit) setEditError(msg);
      else setAddError(msg);
      return;
    }

    if (isEdit) setEditError("");
    else setAddError("");

    setGeneratingDescription(true);
    try {
      const { description } = await aiApi.generateDescription({ title, category });
      if (isEdit) {
        setEditItem((prev) => (prev ? { ...prev, deskripsi_lengkap: description } : null));
      } else {
        setFormData((prev) => ({ ...prev, deskripsi_lengkap: description }));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal membuat deskripsi dengan AI.";
      if (isEdit) setEditError(msg);
      else setAddError(msg);
    } finally {
      setGeneratingDescription(false);
    }
  };

  // ─── Hapus Koleksi ─────────────────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus koleksi ini?")) return;
    setSuccessMessage("");
    try {
      await koleksiApi.delete(String(id));
      await fetchData();
      setCurrentPage(1);
      setSuccessMessage("Koleksi berhasil dihapus.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal menghapus koleksi.");
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* ERROR BANNER */}
      {error && (
        <div className="flex justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>⚠️ {error}</span>
          <button type="button" onClick={fetchData} className="text-xs text-red-500 hover:underline">
            Coba Lagi
          </button>
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800"
        >
          {successMessage}
        </div>
      )}

      <CollectionStatsSection loading={loading} stats={stats} />

      {/* TABLE */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-200 p-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-800">
              Daftar Artefak & Benda Sejarah
            </h2>
            <p className="text-xs text-slate-500">
              Data inventaris artefak bersejarah Museum Brawijaya (dari database)
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[200px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari Koleksi / Kode..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs focus:outline-none"
            >
              <option>Semua Kategori</option>
              <option>Kendaraan</option>
              <option>Senjata</option>
              <option>Dokumen</option>
              <option>Pakaian</option>
            </select>
            <button
              type="button"
              onClick={() => {
                setFormData(emptyForm);
                setAddError("");
                setIsAddModalOpen(true);
              }}
              className="flex items-center gap-1 rounded-lg bg-[#1C2D24] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#253d30]"
            >
              <Plus className="h-3.5 w-3.5" /> Tambah Koleksi
            </button>
          </div>
        </div>

        <CollectionTableSection
          loading={loading}
          items={currentItems}
          filteredCount={filteredKoleksi.length}
          currentPage={safeCurrentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onShowDetail={setSelectedDetail}
          onEdit={(item) => {
            setEditError("");
            setEditItem({ ...item });
          }}
          onDelete={handleDelete}
        />
      </div>

      {/* MODAL DETAIL */}
      {selectedDetail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={() => setSelectedDetail(null)}
        >
          <div
            className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedDetail(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="pr-8 text-lg font-bold text-slate-900">{selectedDetail.nama}</h3>
            <p className="mb-4 text-xs text-slate-400">{selectedDetail.kode}</p>
            <div className="space-y-2 text-xs text-slate-600">
              <p>
                <span className="font-semibold">Kategori:</span> {selectedDetail.kategori}
              </p>
              <p>
                <span className="font-semibold">Tahun / Era:</span> {selectedDetail.tahun || "-"}
              </p>
              <p>
                <span className="font-semibold">Lokasi:</span> {selectedDetail.lokasi}
              </p>
              <p>
                <span className="font-semibold">Status:</span> {selectedDetail.status}
              </p>
              <p className="rounded-lg border border-slate-200 bg-slate-50 p-3 leading-relaxed">
                {selectedDetail.deskripsi_lengkap || selectedDetail.sub_deskripsi || "-"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={() => {
            setIsAddModalOpen(false);
            setAddError("");
          }}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setAddError("");
              }}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="mb-4 pr-8 text-base font-bold uppercase text-slate-900">
              Tambah Koleksi Baru
            </h3>

            {addError && (
              <div
                role="alert"
                className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700"
              >
                {addError}
              </div>
            )}

            <form onSubmit={handleAddSubmit} noValidate className="space-y-3 text-xs">
              <label className="block font-semibold text-slate-700">
                Nama Koleksi
                <input
                  value={formData.nama}
                  onChange={(e) => {
                    setFormData({ ...formData, nama: e.target.value });
                    if (addError) setAddError("");
                  }}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 font-normal"
                />
              </label>
              <label className="block font-semibold text-slate-700">
                Keterangan Singkat
                <input
                  value={formData.sub_deskripsi}
                  onChange={(e) => setFormData({ ...formData, sub_deskripsi: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 font-normal"
                />
              </label>
              <div>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <label htmlFor="add-collection-description" className="font-semibold text-slate-700">
                    Deskripsi Lengkap
                  </label>
                  <button
                    type="button"
                    onClick={() => handleGenerateDescription(false)}
                    disabled={generatingDescription}
                    className="rounded-lg border border-emerald-200 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {generatingDescription ? "Sedang membuat..." : "✨ Buat Deskripsi dengan AI"}
                  </button>
                </div>
                <textarea
                  id="add-collection-description"
                  rows={4}
                  value={formData.deskripsi_lengkap}
                  onChange={(e) => setFormData({ ...formData, deskripsi_lengkap: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 font-normal"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="block font-semibold text-slate-700">
                  Kategori
                  <select
                    value={formData.kategori}
                    onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 font-normal"
                  >
                    <option>Kendaraan</option>
                    <option>Senjata</option>
                    <option>Dokumen</option>
                    <option>Pakaian</option>
                  </select>
                </label>
                <label className="block font-semibold text-slate-700">
                  Tahun / Era
                  <input
                    value={formData.tahun}
                    onChange={(e) => {
                      setFormData({ ...formData, tahun: e.target.value });
                      if (addError) setAddError("");
                    }}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 font-normal"
                  />
                </label>
              </div>
              <label className="block font-semibold text-slate-700">
                Lokasi Ruang
                <input
                  value={formData.lokasi}
                  onChange={(e) => {
                    setFormData({ ...formData, lokasi: e.target.value });
                    if (addError) setAddError("");
                  }}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 font-normal"
                />
              </label>
              <label className="block font-semibold text-slate-700">
                Status
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as KoleksiStatus })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 font-normal"
                >
                  <option value="DIPAMERKAN">DIPAMERKAN</option>
                  <option value="RESTORASI">RESTORASI</option>
                  <option value="SIMPAN">SIMPAN</option>
                </select>
              </label>

              {/* Upload Foto Koleksi */}
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50/70 p-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="block font-semibold text-slate-700">Unggah Foto Koleksi</span>
                  {formData.image_url && (
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, image_url: "" }))}
                      className="flex items-center gap-0.5 text-[11px] text-red-600 hover:underline"
                    >
                      <Trash2 className="h-3 w-3" /> Hapus Foto
                    </button>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, false)}
                  disabled={uploadingImage}
                  className="w-full cursor-pointer text-xs text-slate-500 file:mr-3 file:rounded-md file:border-0 file:bg-emerald-900 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-emerald-950"
                />
                {uploadingImage && (
                  <p className="mt-1 text-[11px] text-amber-600">Mengunggah gambar...</p>
                )}
                {formData.image_url && (
                  <div className="mt-2 flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="h-16 w-16 rounded-md border border-slate-200 object-cover"
                    />
                    <span className="text-[11px] font-medium text-emerald-700">
                      ✓ Gambar terpilih
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setAddError("");
                  }}
                  className="rounded-lg border border-slate-200 px-4 py-2 font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingImage}
                  className="rounded-lg bg-[#1C2D24] px-4 py-2 font-semibold text-white hover:bg-[#253d30] disabled:opacity-50"
                >
                  {saving ? "Menyimpan..." : "Simpan Koleksi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT */}
      {editItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={() => {
            setEditItem(null);
            setEditError("");
          }}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => {
                setEditItem(null);
                setEditError("");
              }}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="mb-4 pr-8 text-base font-bold uppercase text-slate-900">
              Edit Koleksi
            </h3>

            {editError && (
              <div
                role="alert"
                className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700"
              >
                {editError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} noValidate className="space-y-3 text-xs">
              <label className="block font-semibold text-slate-700">
                Nama Koleksi
                <input
                  value={editItem.nama}
                  onChange={(e) => {
                    setEditItem({ ...editItem, nama: e.target.value });
                    if (editError) setEditError("");
                  }}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 font-normal"
                />
              </label>
              <label className="block font-semibold text-slate-700">
                Keterangan Singkat
                <input
                  value={editItem.sub_deskripsi}
                  onChange={(e) => setEditItem({ ...editItem, sub_deskripsi: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 font-normal"
                />
              </label>
              <div>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <label htmlFor="edit-collection-description" className="font-semibold text-slate-700">
                    Deskripsi Lengkap
                  </label>
                  <button
                    type="button"
                    onClick={() => handleGenerateDescription(true)}
                    disabled={generatingDescription}
                    className="rounded-lg border border-emerald-200 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {generatingDescription ? "Sedang membuat..." : "✨ Buat Deskripsi dengan AI"}
                  </button>
                </div>
                <textarea
                  id="edit-collection-description"
                  rows={4}
                  value={editItem.deskripsi_lengkap ?? ""}
                  onChange={(e) => setEditItem({ ...editItem, deskripsi_lengkap: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 font-normal"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="block font-semibold text-slate-700">
                  Kategori
                  <select
                    value={editItem.kategori}
                    onChange={(e) => setEditItem({ ...editItem, kategori: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 font-normal"
                  >
                    <option>Kendaraan</option>
                    <option>Senjata</option>
                    <option>Dokumen</option>
                    <option>Pakaian</option>
                  </select>
                </label>
                <label className="block font-semibold text-slate-700">
                  Tahun / Era
                  <input
                    value={editItem.tahun}
                    onChange={(e) => {
                      setEditItem({ ...editItem, tahun: e.target.value });
                      if (editError) setEditError("");
                    }}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 font-normal"
                  />
                </label>
              </div>
              <label className="block font-semibold text-slate-700">
                Lokasi Ruang
                <input
                  value={editItem.lokasi}
                  onChange={(e) => {
                    setEditItem({ ...editItem, lokasi: e.target.value });
                    if (editError) setEditError("");
                  }}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 font-normal"
                />
              </label>
              <label className="block font-semibold text-slate-700">
                Status
                <select
                  value={editItem.status}
                  onChange={(e) =>
                    setEditItem({ ...editItem, status: e.target.value as KoleksiStatus })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 font-normal"
                >
                  <option value="DIPAMERKAN">DIPAMERKAN</option>
                  <option value="RESTORASI">RESTORASI</option>
                  <option value="SIMPAN">SIMPAN</option>
                </select>
              </label>

              {/* Upload / Ganti / Hapus Foto Koleksi */}
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50/70 p-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="block font-semibold text-slate-700">Foto Koleksi</span>
                  {editItem.image_url && (
                    <button
                      type="button"
                      onClick={() =>
                        setEditItem((prev) => (prev ? { ...prev, image_url: "" } : null))
                      }
                      className="flex items-center gap-0.5 text-[11px] text-red-600 hover:underline"
                    >
                      <Trash2 className="h-3 w-3" /> Hapus Foto
                    </button>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, true)}
                  disabled={uploadingImage}
                  className="w-full cursor-pointer text-xs text-slate-500 file:mr-3 file:rounded-md file:border-0 file:bg-emerald-900 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-emerald-950"
                />
                {uploadingImage && (
                  <p className="mt-1 text-[11px] text-amber-600">Mengunggah gambar...</p>
                )}
                {editItem.image_url && (
                  <div className="mt-2 flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={editItem.image_url}
                      alt="Preview"
                      className="h-16 w-16 rounded-md border border-slate-200 object-cover"
                    />
                    <span className="text-[11px] font-medium text-emerald-700">
                      ✓ Foto saat ini terpasang
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditItem(null);
                    setEditError("");
                  }}
                  className="rounded-lg border border-slate-200 px-4 py-2 font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingImage}
                  className="rounded-lg bg-[#1C2D24] px-4 py-2 font-semibold text-white hover:bg-[#253d30] disabled:opacity-50"
                >
                  {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}