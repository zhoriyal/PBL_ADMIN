"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search, Plus, Eye, Edit, Trash2, Box, ShieldCheck, Wrench, FileText, Shirt, X, RefreshCw,
} from "lucide-react";
import { koleksiApi } from "@/lib/api";

interface KoleksiItem {
  id: number;
  kode: string;
  nama: string;
  sub_deskripsi: string;
  deskripsi_lengkap?: string;
  kategori: string;
  tahun: string;
  lokasi: string;
  status: "DIPAMERKAN" | "RESTORASI" | "SIMPAN";
  image_url?: string;
}

interface Stats {
  total: number;
  dipamerkan: number;
  restorasi: number;
  disimpan: number;
}

const emptyForm = { nama: "", sub_deskripsi: "", kategori: "Kendaraan", tahun: "", lokasi: "", status: "DIPAMERKAN" as KoleksiItem["status"] };

export default function KatalogKoleksiPage() {
  const [koleksiList, setKoleksiList] = useState<KoleksiItem[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, dipamerkan: 0, restorasi: 0, disimpan: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Semua Kategori");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDetail, setSelectedDetail] = useState<KoleksiItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<KoleksiItem | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const itemsPerPage = 5;

  // ─── Fetch data dari backend ───────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [koleksiRes, statsRes] = await Promise.all([
        koleksiApi.getAll({ limit: 100 }),
        koleksiApi.getStats(),
      ]);
      setKoleksiList(koleksiRes.data);
      setStats(statsRes.data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal memuat data";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ─── Filter & Pagination ───────────────────────────────────────────────────
  const filteredKoleksi = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return koleksiList.filter((item) => {
      const matchSearch = !q || [item.nama, item.kode, item.sub_deskripsi, item.lokasi].some(v => v?.toLowerCase().includes(q));
      const matchCat = categoryFilter === "Semua Kategori" || item.kategori === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [koleksiList, searchTerm, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredKoleksi.length / itemsPerPage));
  const currentItems = filteredKoleksi.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // ─── Tambah Koleksi ────────────────────────────────────────────────────────
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await koleksiApi.add(formData);
      await fetchData();
      setIsAddModalOpen(false);
      setFormData(emptyForm);
      setCurrentPage(1);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  // ─── Edit Koleksi ──────────────────────────────────────────────────────────
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    setSaving(true);
    try {
      await koleksiApi.update(String(editItem.id), {
        nama: editItem.nama,
        sub_deskripsi: editItem.sub_deskripsi,
        deskripsi_lengkap: editItem.deskripsi_lengkap,
        kategori: editItem.kategori,
        tahun: editItem.tahun,
        lokasi: editItem.lokasi,
        status: editItem.status,
      });
      await fetchData();
      setEditItem(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal menyimpan perubahan");
    } finally {
      setSaving(false);
    }
  };

  // ─── Hapus Koleksi ─────────────────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus koleksi ini?")) return;
    try {
      await koleksiApi.delete(String(id));
      await fetchData();
      setCurrentPage(1);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal menghapus");
    }
  };

  const categoryIcon = (kat: string) => {
    if (kat === "Kendaraan") return <Box className="w-4 h-4 text-amber-600" />;
    if (kat === "Senjata") return <ShieldCheck className="w-4 h-4 text-blue-600" />;
    if (kat === "Dokumen") return <FileText className="w-4 h-4 text-purple-600" />;
    if (kat === "Pakaian") return <Shirt className="w-4 h-4 text-rose-600" />;
    return <Box className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className="w-full space-y-6">
      {/* HEADER */}
      <div className="-mx-4 -mt-4 flex flex-col gap-4 border-b border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between md:-mx-6 md:-mt-6 md:px-6">
        <div>
          <h1 className="text-sm font-bold tracking-tight text-slate-900 uppercase">Katalog Koleksi</h1>
          <p className="text-xs text-slate-500 mt-1">Kelola informasi artefak, benda bersejarah, dan katalog pameran Museum Brawijaya</p>
        </div>
        <button onClick={fetchData} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full" title="Refresh">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* ERROR BANNER */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex justify-between">
          <span>⚠️ {error} — Pastikan backend berjalan di <code>http://localhost:3001</code></span>
          <button onClick={fetchData} className="text-red-500 hover:underline text-xs">Coba Lagi</button>
        </div>
      )}

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg"><Box className="w-5 h-5" /></div>
          <div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Total Koleksi Terdata</p>
            <p className="text-lg font-bold text-slate-800">{loading ? "..." : stats.total} <span className="text-xs font-normal text-slate-500">Item</span></p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg"><ShieldCheck className="w-5 h-5" /></div>
          <div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Koleksi Dipamerkan</p>
            <p className="text-lg font-bold text-slate-800">{loading ? "..." : stats.dipamerkan} <span className="text-xs font-normal text-slate-500">Item</span></p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg"><Wrench className="w-5 h-5" /></div>
          <div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Restorasi / Simpan</p>
            <p className="text-lg font-bold text-slate-800">{loading ? "..." : stats.restorasi + stats.disimpan} <span className="text-xs font-normal text-slate-500">Item</span></p>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Daftar Artefak & Benda Sejarah</h2>
            <p className="text-xs text-slate-500">Data inventaris artefak bersejarah Museum Brawijaya (dari database)</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Cari Koleksi / Kode..." value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400" />
            </div>
            <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
              className="py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none">
              <option>Semua Kategori</option>
              <option>Kendaraan</option><option>Senjata</option><option>Dokumen</option><option>Pakaian</option>
            </select>
            <button onClick={() => { setFormData(emptyForm); setIsAddModalOpen(true); }}
              className="flex items-center gap-1 bg-[#1C2D24] text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[#253d30] transition">
              <Plus className="w-3.5 h-3.5" /> Tambah Koleksi
            </button>
          </div>
        </div>

        {/* TABEL */}
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[700px] text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">No. Inventaris</th>
                <th className="py-3 px-4">Artefak / Koleksi</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Tahun / Era</th>
                <th className="py-3 px-4">Lokasi Ruang</th>
                <th className="py-3 px-4">Status Display</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {loading ? (
                <tr><td colSpan={7} className="py-10 text-center text-slate-400">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />Memuat data dari server...
                </td></tr>
              ) : currentItems.length > 0 ? currentItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition">
                  <td className="py-3 px-4 font-semibold text-slate-900">{item.kode}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">{categoryIcon(item.kategori)}</div>
                      <div className="min-w-0 max-w-[200px]">
                        <p className="font-bold text-slate-800 truncate">{item.nama}</p>
                        <p className="text-[11px] text-slate-400 truncate">{item.sub_deskripsi}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">{item.kategori}</span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">{item.tahun}</td>
                  <td className="py-3 px-4 whitespace-nowrap">{item.lokasi}</td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-wider ${
                      item.status === "DIPAMERKAN" ? "bg-emerald-100/80 text-emerald-800" :
                      item.status === "RESTORASI"  ? "bg-blue-100/80 text-blue-800" : "bg-slate-100 text-slate-600"
                    }`}>{item.status}</span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => setSelectedDetail(item)} className="flex items-center gap-0.5 text-blue-600 hover:text-blue-800 font-medium text-[11px]">
                        <Eye className="w-3.5 h-3.5" /> Detail
                      </button>
                      <button onClick={() => setEditItem({ ...item })} className="flex items-center gap-0.5 text-amber-600 hover:text-amber-800 font-medium text-[11px]">
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="flex items-center gap-0.5 text-red-600 hover:text-red-800 font-medium text-[11px]">
                        <Trash2 className="w-3.5 h-3.5" /> Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={7} className="py-8 text-center text-xs text-slate-400">Tidak ada koleksi yang ditemukan.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <p>Menampilkan {filteredKoleksi.length ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, filteredKoleksi.length)} dari {filteredKoleksi.length} koleksi</p>
          <div className="flex items-center gap-1">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50">Sebelumnya</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button key={page} onClick={() => setCurrentPage(page)} className={`w-7 h-7 rounded font-bold ${currentPage === page ? "bg-[#1C2D24] text-white" : "border border-slate-200 bg-white hover:bg-slate-50"}`}>{page}</button>
            ))}
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50">Selanjutnya</button>
          </div>
        </div>
      </div>

      {/* MODAL DETAIL */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={() => setSelectedDetail(null)}>
          <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedDetail(null)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-700"><X className="h-5 w-5" /></button>
            <h3 className="pr-8 text-lg font-bold text-slate-900">{selectedDetail.nama}</h3>
            <p className="mb-4 text-xs text-slate-400">{selectedDetail.kode}</p>
            <div className="space-y-2 text-xs text-slate-600">
              <p><span className="font-semibold">Kategori:</span> {selectedDetail.kategori}</p>
              <p><span className="font-semibold">Tahun / Era:</span> {selectedDetail.tahun}</p>
              <p><span className="font-semibold">Lokasi:</span> {selectedDetail.lokasi}</p>
              <p><span className="font-semibold">Status:</span> {selectedDetail.status}</p>
              <p className="rounded-lg border border-slate-200 bg-slate-50 p-3 leading-relaxed">
                {selectedDetail.deskripsi_lengkap || selectedDetail.sub_deskripsi}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}>
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsAddModalOpen(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-700"><X className="h-5 w-5" /></button>
            <h3 className="mb-4 pr-8 text-base font-bold uppercase text-slate-900">Tambah Koleksi Baru</h3>
            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <label className="block font-semibold text-slate-700">Nama Koleksi
                <input required value={formData.nama} onChange={e => setFormData({ ...formData, nama: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 font-normal" />
              </label>
              <label className="block font-semibold text-slate-700">Keterangan Singkat
                <input value={formData.sub_deskripsi} onChange={e => setFormData({ ...formData, sub_deskripsi: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 font-normal" />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block font-semibold text-slate-700">Kategori
                  <select value={formData.kategori} onChange={e => setFormData({ ...formData, kategori: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 font-normal">
                    <option>Kendaraan</option><option>Senjata</option><option>Dokumen</option><option>Pakaian</option>
                  </select>
                </label>
                <label className="block font-semibold text-slate-700">Tahun / Era
                  <input value={formData.tahun} onChange={e => setFormData({ ...formData, tahun: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 font-normal" />
                </label>
              </div>
              <label className="block font-semibold text-slate-700">Lokasi Ruang
                <input required value={formData.lokasi} onChange={e => setFormData({ ...formData, lokasi: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 font-normal" />
              </label>
              <label className="block font-semibold text-slate-700">Status
                <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as KoleksiItem["status"] })} className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 font-normal">
                  <option value="DIPAMERKAN">DIPAMERKAN</option><option value="RESTORASI">RESTORASI</option><option value="SIMPAN">SIMPAN</option>
                </select>
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 font-semibold hover:bg-slate-50">Batal</button>
                <button type="submit" disabled={saving} className="rounded-lg bg-[#1C2D24] px-4 py-2 font-semibold text-white hover:bg-[#253d30] disabled:opacity-50">
                  {saving ? "Menyimpan..." : "Simpan Koleksi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT */}
      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={() => setEditItem(null)}>
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <button onClick={() => setEditItem(null)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-700"><X className="h-5 w-5" /></button>
            <h3 className="mb-4 pr-8 text-base font-bold uppercase text-slate-900">Edit Koleksi</h3>
            <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
              <label className="block font-semibold text-slate-700">Nama Koleksi
                <input required value={editItem.nama} onChange={e => setEditItem({ ...editItem, nama: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 font-normal" />
              </label>
              <label className="block font-semibold text-slate-700">Keterangan Singkat
                <input value={editItem.sub_deskripsi} onChange={e => setEditItem({ ...editItem, sub_deskripsi: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 font-normal" />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block font-semibold text-slate-700">Kategori
                  <select value={editItem.kategori} onChange={e => setEditItem({ ...editItem, kategori: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 font-normal">
                    <option>Kendaraan</option><option>Senjata</option><option>Dokumen</option><option>Pakaian</option>
                  </select>
                </label>
                <label className="block font-semibold text-slate-700">Tahun / Era
                  <input value={editItem.tahun} onChange={e => setEditItem({ ...editItem, tahun: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 font-normal" />
                </label>
              </div>
              <label className="block font-semibold text-slate-700">Lokasi Ruang
                <input required value={editItem.lokasi} onChange={e => setEditItem({ ...editItem, lokasi: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 font-normal" />
              </label>
              <label className="block font-semibold text-slate-700">Status
                <select value={editItem.status} onChange={e => setEditItem({ ...editItem, status: e.target.value as KoleksiItem["status"] })} className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 font-normal">
                  <option value="DIPAMERKAN">DIPAMERKAN</option><option value="RESTORASI">RESTORASI</option><option value="SIMPAN">SIMPAN</option>
                </select>
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditItem(null)} className="rounded-lg border border-slate-200 px-4 py-2 font-semibold hover:bg-slate-50">Batal</button>
                <button type="submit" disabled={saving} className="rounded-lg bg-[#1C2D24] px-4 py-2 font-semibold text-white hover:bg-[#253d30] disabled:opacity-50">
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