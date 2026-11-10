import { Clock3, Megaphone } from "lucide-react";
import type { JamOperasional } from "./types";

interface InformationStatsSectionProps {
  loading: boolean;
  activeAnnouncements: number;
  faqCount: number;
  hours: JamOperasional;
}

const cardClass = "overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm";

export default function InformationStatsSection({
  loading,
  activeAnnouncements,
  faqCount,
  hours,
}: InformationStatsSectionProps) {
  return (
    <section aria-label="Ringkasan informasi museum" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className={`${cardClass} flex min-h-20 items-center gap-3 px-4 py-3`}>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
          <Clock3 size={19} strokeWidth={2.8} />
        </span>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Status Operasional Hari Ini</p>
          <p className="mt-0.5 text-lg font-bold text-emerald-700">BUKA <span className="text-xs font-normal text-slate-400">({hours.jam})</span></p>
        </div>
      </div>
      <div className={`${cardClass} flex min-h-20 items-center gap-3 px-4 py-3`}>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
          <Megaphone size={19} fill="currentColor" />
        </span>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Pengumuman Aktif</p>
          <p className="mt-0.5 text-lg font-bold">{loading ? "..." : activeAnnouncements} <span className="text-xs font-normal text-slate-400">Informasi</span></p>
        </div>
      </div>
      <div className={`${cardClass} flex min-h-20 items-center gap-3 px-4 py-3`}>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100">
          <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-blue-700 text-xs font-bold text-white">?</span>
        </span>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">FAQ Terpublikasi</p>
          <p className="mt-0.5 text-lg font-bold">{loading ? "..." : faqCount} <span className="text-xs font-normal text-slate-400">Pertanyaan</span></p>
        </div>
      </div>
    </section>
  );
}
