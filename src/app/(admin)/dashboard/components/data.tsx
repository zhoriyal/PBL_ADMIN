"use client";

import { Banknote, Landmark, Ticket } from "lucide-react";

interface DataSectionProps {
  ticketsSold: number;
  revenue: number;
  collectionCount: number;
}

export default function DataSection({
  ticketsSold,
  revenue,
  collectionCount,
}: DataSectionProps) {
  const safeTickets = Number(ticketsSold) || 0;
  const safeRevenue = Number(revenue) || 0;
  const safeCollection = Number(collectionCount) || 0;

  return (
    <section
      aria-label="Ringkasan statistik dashboard"
      className="grid grid-cols-1 gap-4 sm:grid-cols-3"
    >
      <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
          <Ticket size={19} />
        </span>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
            Tiket Terjual Hari Ini
          </p>
          <p className="mt-0.5 text-lg font-bold text-slate-800">
            {safeTickets.toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
          <Banknote size={19} />
        </span>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
            Pendapatan Hari Ini
          </p>
          <p className="mt-0.5 text-lg font-bold text-slate-800">
            Rp {safeRevenue.toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
          <Landmark size={19} />
        </span>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
            Total Koleksi
          </p>
          <p className="mt-0.5 text-lg font-bold text-slate-800">
            {safeCollection.toLocaleString("id-ID")}
          </p>
        </div>
      </div>
    </section>
  );
}