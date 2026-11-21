"use client";

import type { WeeklyData } from "@/components/admin/dashboard/types";

interface GrafikSectionProps {
  weeklyData: WeeklyData[];
}

export default function GrafikSection({ weeklyData }: GrafikSectionProps) {
  const safeData = Array.isArray(weeklyData) ? weeklyData : [];
  const maxVal = Math.max(1, ...safeData.map((item) => Number(item?.val) || 0));

  return (
    <section className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-sm font-bold uppercase">Grafik Kunjungan Mingguan</h2>
        <p className="text-xs text-slate-400">
          Data kunjungan yang dimuat dari endpoint ringkasan dashboard
        </p>
      </div>

      <div className="mt-4 space-y-3">
        {safeData.length === 0 ? (
          <p className="py-6 text-center text-xs text-slate-400">
            Belum ada data grafik mingguan.
          </p>
        ) : (
          safeData.map((item, index) => {
            const label = (item?.day || "").trim() || `Hari ${index + 1}`;
            const val = Math.max(0, Number(item?.val) || 0);
            const widthPercent = Math.min(100, Math.round((val / maxVal) * 100));

            return (
              <div key={`${label}-${index}`} className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="font-semibold text-slate-700">{label}</span>
                  <span className="font-bold text-slate-500">
                    {val.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-[#2D3E33] transition-all"
                    style={{ width: `${widthPercent}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}