import { Edit, Plus, Trash2 } from "lucide-react";
import type { FaqItem } from "./types";

interface FaqSectionProps {
  loading: boolean;
  faqs: FaqItem[];
  onAdd: () => void;
  onEdit: (faq: FaqItem) => void;
  onDelete: (id: number) => void;
}

const sectionClass =
  "overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm";

export default function FaqSection({
  loading,
  faqs,
  onAdd,
  onEdit,
  onDelete,
}: FaqSectionProps) {
  const safeFaqs = Array.isArray(faqs) ? faqs : [];

  return (
    <section className={`${sectionClass} p-4`}>
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-sm font-bold uppercase">
            Pertanyaan Sering Diajukan (FAQ)
          </h2>
          <p className="text-xs text-slate-400">
            Daftar pertanyaan dan jawaban ringkas untuk calon pengunjung
          </p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="flex shrink-0 items-center gap-1 rounded-lg bg-[#2D3E33] px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-[#233128]"
        >
          <Plus size={13} />
          Tambah FAQ
        </button>
      </div>

      <div className="space-y-2 pt-3">
        {loading ? (
          <p className="text-xs text-slate-400">Memuat FAQ...</p>
        ) : safeFaqs.length === 0 ? (
          <p className="text-xs text-slate-400">
            Belum ada data FAQ yang tersedia.
          </p>
        ) : (
          safeFaqs.map((item) => (
            <article
              key={item.id}
              className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2.5"
            >
              <div className="min-w-0">
                <h3 className="truncate text-[11px] font-bold text-slate-800">
                  {item.question || "Pertanyaan Tanpa Judul"}
                </h3>
                <p className="mt-0.5 text-[10px] text-slate-500">
                  {item.answer || "-"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => onEdit(item)}
                  aria-label={`Edit ${item.question || "FAQ"}`}
                  className="flex items-center gap-0.5 text-[11px] font-medium text-amber-600 hover:text-amber-800"
                >
                  <Edit className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(item.id)}
                  aria-label={`Hapus ${item.question || "FAQ"}`}
                  className="flex items-center gap-0.5 text-[11px] font-medium text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Hapus
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}