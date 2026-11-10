import { Plus } from "lucide-react";
import type { Announcement } from "./types";

interface AnnouncementsSectionProps {
  loading: boolean;
  announcements: Announcement[];
  onAdd: () => void;
  onEdit: (announcement: Announcement) => void;
  onDelete: (id: number) => void;
}

const sectionClass = "overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm";

export default function AnnouncementsSection({
  loading,
  announcements,
  onAdd,
  onEdit,
  onDelete,
}: AnnouncementsSectionProps) {
  return (
    <section className={sectionClass}>
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3.5">
        <div>
          <h2 className="text-sm font-bold uppercase">Pengumuman & Agenda Pameran</h2>
          <p className="text-xs text-slate-400">Kelola pemberitahuan resmi untuk pengunjung museum</p>
        </div>
        <button onClick={onAdd} className="flex shrink-0 items-center gap-1 rounded-lg bg-[#2D3E33] px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-[#233128]">
          <Plus size={13} />Tambah Pengumuman
        </button>
      </div>
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[620px] border-collapse text-left">
          <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-3 py-2.5">Judul Pengumuman</th>
              <th className="px-3 py-2.5">Kategori</th>
              <th className="px-3 py-2.5">Tanggal Rilis</th>
              <th className="px-3 py-2.5">Status</th>
              <th className="px-3 py-2.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-[11px]">
            {loading ? (
              <tr><td colSpan={5} className="py-6 text-center text-slate-400">Memuat data...</td></tr>
            ) : announcements.map((item) => (
              <tr key={item.id}>
                <td className="max-w-[260px] px-3 py-2.5">
                  <p className="truncate font-semibold text-slate-800">{item.title}</p>
                  <p className="truncate text-slate-400">{item.description}</p>
                </td>
                <td className="px-3 py-2.5">
                  <span className={`whitespace-nowrap rounded-md px-2 py-1 text-[10px] font-semibold ${item.category === "Agenda Event" ? "bg-blue-100 text-blue-800" : item.category === "Pemeliharaan" ? "bg-purple-100 text-purple-800" : "bg-amber-100 text-amber-800"}`}>
                    {item.category}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 text-slate-600">{item.date}</td>
                <td className="px-3 py-2.5">
                  <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${item.status === "AKTIF" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                    {item.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 text-right">
                  <button onClick={() => onEdit(item)} className="mr-2 text-amber-700 hover:underline">Edit</button>
                  <button onClick={() => onDelete(item.id)} className="text-red-600 hover:underline">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
