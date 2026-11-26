import { Edit, Plus, Trash2 } from "lucide-react";
import type { Announcement } from "./types";

interface AnnouncementsSectionProps {
  loading: boolean;
  announcements: Announcement[];
  onAdd: () => void;
  onEdit: (announcement: Announcement) => void;
  onDelete: (id: number) => void;
}

const sectionClass =
  "overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm";

export default function AnnouncementsSection({
  loading,
  announcements,
  onAdd,
  onEdit,
  onDelete,
}: AnnouncementsSectionProps) {
  const safeAnnouncements = Array.isArray(announcements) ? announcements : [];

  return (
    <section className={sectionClass}>
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3.5">
        <div>
          <h2 className="text-sm font-bold uppercase">
            Pengumuman & Agenda Pameran
          </h2>
          <p className="text-xs text-slate-400">
            Kelola pemberitahuan resmi untuk pengunjung museum
          </p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="flex shrink-0 items-center gap-1 rounded-lg bg-[#2D3E33] px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-[#233128]"
        >
          <Plus size={13} />
          Tambah Pengumuman
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
              <tr>
                <td colSpan={5} className="py-6 text-center text-slate-400">
                  Memuat data...
                </td>
              </tr>
            ) : safeAnnouncements.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-slate-400">
                  Belum ada data pengumuman atau agenda pameran.
                </td>
              </tr>
            ) : (
              safeAnnouncements.map((item) => {
                const categoryClass =
                  item.category === "Agenda Event"
                    ? "bg-blue-100 text-blue-800"
                    : item.category === "Pemeliharaan"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-amber-100 text-amber-800";

                const isActive = item.status === "AKTIF";

                return (
                  <tr key={item.id}>
                    <td className="max-w-[260px] px-3 py-2.5">
                      <p className="truncate font-semibold text-slate-800">
                        {item.title || "Tanpa Judul"}
                      </p>
                      <p className="truncate text-slate-400">
                        {item.description || "-"}
                      </p>
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`whitespace-nowrap rounded-md px-2 py-1 text-[10px] font-semibold ${categoryClass}`}
                      >
                        {item.category || "Umum"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-slate-600">
                      {item.date || "-"}
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] font-bold ${
                          isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {item.status || "NONAKTIF"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onEdit(item)}
                          aria-label={`Edit ${item.title || "pengumuman"}`}
                          className="flex items-center gap-0.5 text-[11px] font-medium text-amber-600 hover:text-amber-800"
                        >
                          <Edit className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(item.id)}
                          aria-label={`Hapus ${item.title || "pengumuman"}`}
                          className="flex items-center gap-0.5 text-[11px] font-medium text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}