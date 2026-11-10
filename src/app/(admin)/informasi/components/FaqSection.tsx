import { Plus } from "lucide-react";
import type { FaqItem } from "./types";

interface FaqSectionProps {
  loading: boolean;
  faqs: FaqItem[];
  onAdd: () => void;
  onEdit: (faq: FaqItem) => void;
  onDelete: (id: number) => void;
}

const sectionClass = "overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm";

export default function FaqSection({
  loading,
  faqs,
  onAdd,
  onEdit,
  onDelete,
}: FaqSectionProps) {
  return (
    <section className={`${sectionClass} p-4`}>
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-sm font-bold uppercase">Pertanyaan Sering Diajukan (FAQ)</h2>
          <p className="text-xs text-slate-400">Daftar pertanyaan dan jawaban ringkas untuk calon pengunjung</p>
        </div>
        <button onClick={onAdd} className="flex shrink-0 items-center gap-1 rounded-lg bg-[#2D3E33] px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-[#233128]">
          <Plus size={13} />Tambah FAQ
        </button>
      </div>
      <div className="space-y-2 pt-3">
        {loading ? <p className="text-xs text-slate-400">Memuat FAQ...</p> : faqs.map((item) => (
          <article key={item.id} className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2.5">
            <div className="min-w-0">
              <h3 className="truncate text-[11px] font-bold text-slate-800">{item.question}</h3>
              <p className="mt-0.5 text-[10px] text-slate-500">{item.answer}</p>
            </div>
            <div className="flex shrink-0 gap-2 pt-0.5 text-[11px]">
              <button onClick={() => onEdit(item)} className="text-amber-700 hover:underline">Edit</button>
              <button onClick={() => onDelete(item.id)} className="text-red-600 hover:underline">Hapus</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
