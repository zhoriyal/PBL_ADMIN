import { Box, ShieldCheck, Wrench } from "lucide-react";

interface CollectionStatsSectionProps {
  loading: boolean;
  stats: {
    total: number;
    dipamerkan: number;
    restorasi: number;
    disimpan: number;
  };
}

export default function CollectionStatsSection({ loading, stats }: CollectionStatsSectionProps) {
  const cards = [
    { label: "Total Koleksi Terdata", value: stats.total, icon: <Box className="w-5 h-5" />, iconClass: "bg-amber-50 text-amber-600" },
    { label: "Koleksi Dipamerkan", value: stats.dipamerkan, icon: <ShieldCheck className="w-5 h-5" />, iconClass: "bg-emerald-50 text-emerald-600" },
    { label: "Restorasi / Simpan", value: stats.restorasi + stats.disimpan, icon: <Wrench className="w-5 h-5" />, iconClass: "bg-blue-50 text-blue-600" },
  ];

  return (
    <section aria-label="Statistik koleksi" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <div key={card.label} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className={`rounded-lg p-2.5 ${card.iconClass}`}>{card.icon}</div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">{card.label}</p>
            <p className="text-lg font-bold text-slate-800">
              {loading ? "..." : card.value} <span className="text-xs font-normal text-slate-500">Item</span>
            </p>
          </div>
        </div>
      ))}
    </section>
  );
}
