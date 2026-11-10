import type { ReactNode } from "react";
import {
  Box, ShieldCheck, FileText, Shirt, Eye, Edit, Trash2, RefreshCw,
} from "lucide-react";
import type { KoleksiItem } from "./types";

interface CollectionTableSectionProps {
  loading: boolean;
  items: KoleksiItem[];
  filteredCount: number;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onShowDetail: (item: KoleksiItem) => void;
  onEdit: (item: KoleksiItem) => void;
  onDelete: (id: number) => void;
}

function categoryIcon(category: string): ReactNode {
  if (category === "Kendaraan") return <Box className="h-4 w-4 text-amber-600" />;
  if (category === "Senjata") return <ShieldCheck className="h-4 w-4 text-blue-600" />;
  if (category === "Dokumen") return <FileText className="h-4 w-4 text-purple-600" />;
  if (category === "Pakaian") return <Shirt className="h-4 w-4 text-rose-600" />;
  return <Box className="h-4 w-4 text-slate-400" />;
}

export default function CollectionTableSection({
  loading,
  items,
  filteredCount,
  currentPage,
  totalPages,
  itemsPerPage,
  onPageChange,
  onShowDetail,
  onEdit,
  onDelete,
}: CollectionTableSectionProps) {
  return (
    <section aria-label="Daftar koleksi">
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[700px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="px-4 py-3">No. Inventaris</th>
              <th className="px-4 py-3">Artefak / Koleksi</th>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3">Tahun / Era</th>
              <th className="px-4 py-3">Lokasi Ruang</th>
              <th className="px-4 py-3">Status Display</th>
              <th className="px-4 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-slate-400">
                  <RefreshCw className="mx-auto mb-2 h-5 w-5 animate-spin" />
                  Memuat data dari server...
                </td>
              </tr>
            ) : items.length > 0 ? items.map((item) => (
              <tr key={item.id} className="transition hover:bg-slate-50/50">
                <td className="px-4 py-3 font-semibold text-slate-900">{item.kode}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                      {categoryIcon(item.kategori)}
                    </div>
                    <div className="min-w-0 max-w-[200px]">
                      <p className="truncate font-bold text-slate-800">{item.nama}</p>
                      <p className="truncate text-[11px] text-slate-400">{item.sub_deskripsi}</p>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <span className="inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">{item.kategori}</span>
                </td>
                <td className="whitespace-nowrap px-4 py-3">{item.tahun}</td>
                <td className="whitespace-nowrap px-4 py-3">{item.lokasi}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  <span className={`inline-block rounded-md px-2.5 py-0.5 text-[10px] font-bold tracking-wider ${
                    item.status === "DIPAMERKAN" ? "bg-emerald-100/80 text-emerald-800" :
                    item.status === "RESTORASI" ? "bg-blue-100/80 text-blue-800" : "bg-slate-100 text-slate-600"
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => onShowDetail(item)} className="flex items-center gap-0.5 text-[11px] font-medium text-blue-600 hover:text-blue-800">
                      <Eye className="h-3.5 w-3.5" /> Detail
                    </button>
                    <button onClick={() => onEdit(item)} className="flex items-center gap-0.5 text-[11px] font-medium text-amber-600 hover:text-amber-800">
                      <Edit className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button onClick={() => onDelete(item.id)} className="flex items-center gap-0.5 text-[11px] font-medium text-red-600 hover:text-red-800">
                      <Trash2 className="h-3.5 w-3.5" /> Hapus
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

      <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-500">
        <p>
          Menampilkan {filteredCount ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, filteredCount)} dari {filteredCount} koleksi
        </p>
        <div className="flex items-center gap-1">
          <button
            disabled={currentPage === 1}
            onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
            className="rounded border border-slate-200 bg-white px-2.5 py-1 hover:bg-slate-50 disabled:opacity-50"
          >
            Sebelumnya
          </button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`h-7 w-7 rounded font-bold ${currentPage === page ? "bg-[#1C2D24] text-white" : "border border-slate-200 bg-white hover:bg-slate-50"}`}
            >
              {page}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
            className="rounded border border-slate-200 bg-white px-2.5 py-1 hover:bg-slate-50 disabled:opacity-50"
          >
            Selanjutnya
          </button>
        </div>
      </div>
    </section>
  );
}
