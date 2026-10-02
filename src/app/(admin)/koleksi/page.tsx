"use client";

import React, { useMemo, useState } from "react";
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Box,
  ShieldCheck,
  Wrench,
  FileText,
  Shirt,
  X,
} from "lucide-react";

interface KoleksiItem {
  id: string;
  kode: string;
  nama: string;
  subDeskripsi: string;
  kategori: string;
  tahun: string;
  lokasi: string;
  status: "DIPAMERKAN" | "RESTORASI" | "SIMPAN";
  deskripsiLengkap?: string;
}

const INITIAL_DATA: KoleksiItem[] = [
  {
    id: "1",
    kode: "#INV-MB-001",
    nama: "Tank Gerbong Maut",
    subDeskripsi: "Peninggalan Peristiwa 1947",
    kategori: "Kendaraan",
    tahun: "1947",
    lokasi: "Halaman Depan",
    status: "DIPAMERKAN",
  },
  {
    id: "2",
    kode: "#INV-MB-002",
    nama: "Senjata Lengkung Katana",
    subDeskripsi: "Rampasan Tentara Jepang",
    kategori: "Senjata",
    tahun: "1942",
    lokasi: "Gedung Utama (Lantai 1)",
    status: "DIPAMERKAN",
  },
  {
    id: "3",
    kode: "#INV-MB-003",
    nama: "Dokumen Peta Strategi Perang",
    subDeskripsi: "Arsip Otentik Panglima",
    kategori: "Dokumen",
    tahun: "1945",
    lokasi: "Ruang Arsip Khusus",
    status: "RESTORASI",
    deskripsiLengkap: "Dokumen taktik dan denah pertahanan militer era perang kemerdekaan Indonesia.",
  },
  {
    id: "4",
    kode: "#INV-MB-004",
    nama: "Meriam Si Jagur",
    subDeskripsi: "Artileri Berat Pertahanan",
    kategori: "Senjata",
    tahun: "1943",
    lokasi: "Halaman Depan",
    status: "DIPAMERKAN",
  },
  {
    id: "5",
    kode: "#INV-MB-005",
    nama: "Seragam Dinas Jenderal",
    subDeskripsi: "Pakaian Otentik Perwira",
    kategori: "Pakaian",
    tahun: "1950",
    lokasi: "Gedung Utama (Lantai 2)",
    status: "DIPAMERKAN",
  },
];

export default function KatalogKoleksiPage() {
  const [koleksiList, setKoleksiList] = useState<KoleksiItem[]>(INITIAL_DATA);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Semua Kategori");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDetail, setSelectedDetail] = useState<KoleksiItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    nama: "",
    subDeskripsi: "",
    kategori: "Kendaraan",
    tahun: "",
    lokasi: "",
    status: "DIPAMERKAN" as KoleksiItem["status"],
  });
  const itemsPerPage = 3;

  const filteredKoleksi = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return koleksiList.filter((item) => {
      const matchesSearch = [item.nama, item.kode, item.subDeskripsi, item.lokasi]
        .some((value) => value.toLowerCase().includes(normalizedSearch));
      const matchesCategory = categoryFilter === "Semua Kategori" || item.kategori === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [categoryFilter, koleksiList, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredKoleksi.length / itemsPerPage));
  const currentItems = filteredKoleksi.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalKoleksi = koleksiList.length;
  const koleksiDipamerkan = koleksiList.filter((item) => item.status === "DIPAMERKAN").length;
  const koleksiPerawatan = koleksiList.filter((item) => item.status !== "DIPAMERKAN").length;

  const handleAddSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextNumber = koleksiList.reduce((max, item) => {
      const number = Number(item.kode.slice(-3));
      return Number.isFinite(number) ? Math.max(max, number) : max;
    }, 0) + 1;
    const newItem: KoleksiItem = {
      ...formData,
      id: String(Date.now()),
      kode: `#INV-MB-${String(nextNumber).padStart(3, "0")}`,
    };

    setKoleksiList((items) => [newItem, ...items]);
    setCurrentPage(1);
    setSearchTerm("");
    setCategoryFilter("Semua Kategori");
    setIsAddModalOpen(false);
    setFormData({ nama: "", subDeskripsi: "", kategori: "Kendaraan", tahun: "", lokasi: "", status: "DIPAMERKAN" });
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus koleksi ini?")) {
      setKoleksiList((items) => items.filter((item) => item.id !== id));
      setCurrentPage(1);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* HEADER UTAMA */}
      <div className="-mx-4 -mt-4 flex flex-col gap-4 border-b border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between md:-mx-6 md:-mt-6 md:px-6">
        <div>
          <h1 className="text-sm font-bold tracking-tight text-slate-900 uppercase">
            Katalog Koleksi
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kelola informasi artefak, benda bersejarah, dan katalog pameran Museum Brawijaya
          </p>
        </div>
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition">
            <span className="sr-only">Notifikasi</span>
            🔔
          </button>
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-[#2D3E33] text-white flex items-center justify-center font-bold text-xs">
              A
            </div>
            <span className="text-xs font-semibold text-slate-700 hidden sm:inline">
              ADMIN
            </span>
          </div>
        </div>
      </div>

      {/* CARDS STATISTIK (RESPONSIF GRID) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
            <Box className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Total Koleksi Terdata
            </p>
            <p className="text-lg font-bold text-slate-800">
              {totalKoleksi} <span className="text-xs font-normal text-slate-500">Item</span>
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Koleksi Dipamerkan
            </p>
            <p className="text-lg font-bold text-slate-800">
              {koleksiDipamerkan} <span className="text-xs font-normal text-slate-500">Item</span>
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Dalam Restorasi / Simpan
            </p>
            <p className="text-lg font-bold text-slate-800">
              {koleksiPerawatan} <span className="text-xs font-normal text-slate-500">Item</span>
            </p>
          </div>
        </div>
      </div>

      {/* TABLE CONTAINER CARD */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* ACTION BAR (SEARCH & FILTER) */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
              Daftar Artefak & Benda Sejarah
            </h2>
            <p className="text-xs text-slate-500">
              Kelola data inventaris artefak bersejarah Museum Brawijaya
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari Koleksi / Kode..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400"
            >
              <option>Semua Kategori</option>
              <option>Kendaraan</option>
              <option>Senjata</option>
              <option>Dokumen</option>
              <option>Pakaian</option>
            </select>

            <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-1 bg-[#1C2D24] text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[#253d30] transition">
              <Plus className="w-3.5 h-3.5" />
              Tambah Koleksi
            </button>
          </div>
        </div>

        {/* TABEL DENGAN CONTAINER SCROLL HORIZONTAL (MIN-W-[700PX]) */}
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
              {currentItems.length > 0 ? currentItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition">
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    {item.kode}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                        {item.kategori === "Kendaraan" && <Box className="w-4 h-4 text-amber-600" />}
                        {item.kategori === "Senjata" && <ShieldCheck className="w-4 h-4 text-blue-600" />}
                        {item.kategori === "Dokumen" && <FileText className="w-4 h-4 text-purple-600" />}
                        {item.kategori === "Pakaian" && <Shirt className="w-4 h-4 text-rose-600" />}
                      </div>
                      <div className="min-w-0 max-w-[200px]">
                        <p className="font-bold text-slate-800 truncate">{item.nama}</p>
                        <p className="text-[11px] text-slate-400 truncate">{item.subDeskripsi}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                      {item.kategori}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">{item.tahun}</td>
                  <td className="py-3 px-4 whitespace-nowrap">{item.lokasi}</td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-wider ${
                        item.status === "DIPAMERKAN"
                          ? "bg-emerald-100/80 text-emerald-800"
                          : "bg-blue-100/80 text-blue-800"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => setSelectedDetail(item)} className="flex items-center gap-0.5 text-blue-600 hover:text-blue-800 font-medium text-[11px]">
                        <Eye className="w-3.5 h-3.5" /> Detail
                      </button>
                      <button className="flex items-center gap-0.5 text-amber-600 hover:text-amber-800 font-medium text-[11px]">
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="flex items-center gap-0.5 text-red-600 hover:text-red-800 font-medium text-[11px]">
                        <Trash2 className="w-3.5 h-3.5" /> Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-slate-400">
                    Tidak ada koleksi yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION BAR */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <p>
            Menampilkan {filteredKoleksi.length ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, filteredKoleksi.length)} dari {filteredKoleksi.length} koleksi
          </p>
          <div className="flex items-center gap-1">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))} className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50">
              Sebelumnya
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
              <button key={page} onClick={() => setCurrentPage(page)} className={`w-7 h-7 rounded font-bold ${currentPage === page ? "bg-[#1C2D24] text-white" : "border border-slate-200 bg-white hover:bg-slate-50"}`}>
                {page}
              </button>
            ))}
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))} className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50">
              Selanjutnya
            </button>
          </div>
        </div>
      </div>

      {selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={() => setSelectedDetail(null)}>
          <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl" onClick={(event) => event.stopPropagation()}>
            <button aria-label="Tutup detail" onClick={() => setSelectedDetail(null)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-700">
              <X className="h-5 w-5" />
            </button>
            <h3 className="pr-8 text-lg font-bold text-slate-900">{selectedDetail.nama}</h3>
            <p className="mb-5 text-xs text-slate-400">{selectedDetail.kode}</p>
            <div className="space-y-3 text-xs text-slate-600">
              <p><span className="font-semibold">Kategori:</span> {selectedDetail.kategori}</p>
              <p><span className="font-semibold">Tahun / Era:</span> {selectedDetail.tahun}</p>
              <p><span className="font-semibold">Lokasi:</span> {selectedDetail.lokasi}</p>
              <p><span className="font-semibold">Status:</span> {selectedDetail.status}</p>
              <p className="rounded-lg border border-slate-200 bg-slate-50 p-3 leading-relaxed">
                {selectedDetail.deskripsiLengkap || selectedDetail.subDeskripsi}
              </p>
            </div>
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}>
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl" onClick={(event) => event.stopPropagation()}>
            <button aria-label="Tutup formulir" onClick={() => setIsAddModalOpen(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-700">
              <X className="h-5 w-5" />
            </button>
            <h3 className="mb-4 pr-8 text-base font-bold uppercase text-slate-900">Tambah Koleksi Baru</h3>
            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <label className="block font-semibold text-slate-700">Nama Koleksi
                <input required value={formData.nama} onChange={(event) => setFormData({ ...formData, nama: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 font-normal" />
              </label>
              <label className="block font-semibold text-slate-700">Keterangan Singkat
                <input value={formData.subDeskripsi} onChange={(event) => setFormData({ ...formData, subDeskripsi: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 font-normal" />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block font-semibold text-slate-700">Kategori
                  <select value={formData.kategori} onChange={(event) => setFormData({ ...formData, kategori: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 font-normal">
                    <option>Kendaraan</option><option>Senjata</option><option>Dokumen</option><option>Pakaian</option>
                  </select>
                </label>
                <label className="block font-semibold text-slate-700">Tahun / Era
                  <input value={formData.tahun} onChange={(event) => setFormData({ ...formData, tahun: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 font-normal" />
                </label>
              </div>
              <label className="block font-semibold text-slate-700">Lokasi Ruang
                <input required value={formData.lokasi} onChange={(event) => setFormData({ ...formData, lokasi: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 font-normal" />
              </label>
              <label className="block font-semibold text-slate-700">Status
                <select value={formData.status} onChange={(event) => setFormData({ ...formData, status: event.target.value as KoleksiItem["status"] })} className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 font-normal">
                  <option value="DIPAMERKAN">DIPAMERKAN</option><option value="RESTORASI">RESTORASI</option><option value="SIMPAN">SIMPAN</option>
                </select>
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 font-semibold hover:bg-slate-50">Batal</button>
                <button type="submit" className="rounded-lg bg-[#1C2D24] px-4 py-2 font-semibold text-white hover:bg-[#253d30]">Simpan Koleksi</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}