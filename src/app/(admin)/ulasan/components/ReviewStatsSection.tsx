import { CornerUpLeft, MessageSquare, Star } from "lucide-react";

interface ReviewStatsSectionProps {
  loading: boolean;
  averageRating: number;
  totalReviews: number;
  responseRate: number;
}

const cardClass = "rounded-xl border border-slate-200/80 bg-white shadow-sm";

export default function ReviewStatsSection({
  loading,
  averageRating,
  totalReviews,
  responseRate,
}: ReviewStatsSectionProps) {
  return (
    <section aria-label="Statistik ulasan" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className={`${cardClass} flex min-h-20 items-center gap-3 px-4 py-3`}>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700"><Star size={19} fill="currentColor" /></span>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Rata-rata Rating</p>
          <p className="mt-0.5 text-lg font-bold">{loading ? "..." : averageRating.toFixed(1)} <span className="text-xs font-normal text-slate-400">/ 5.0</span></p>
        </div>
      </div>
      <div className={`${cardClass} flex min-h-20 items-center gap-3 px-4 py-3`}>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700"><MessageSquare size={19} fill="currentColor" /></span>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Total Ulasan Masuk</p>
          <p className="mt-0.5 text-lg font-bold">{loading ? "..." : totalReviews} <span className="text-xs font-normal text-slate-400">Ulasan</span></p>
        </div>
      </div>
      <div className={`${cardClass} flex min-h-20 items-center gap-3 px-4 py-3`}>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700"><CornerUpLeft size={19} strokeWidth={2.8} /></span>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Tingkat Respon Admin</p>
          <p className="mt-0.5 text-lg font-bold text-emerald-700">{loading ? "..." : responseRate}% <span className="text-xs font-normal text-slate-400">(Telah Dibalas)</span></p>
        </div>
      </div>
    </section>
  );
}
