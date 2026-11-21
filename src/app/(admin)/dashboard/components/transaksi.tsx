"use client";

import type { Transaction } from "@/components/admin/dashboard/types";

interface TransaksiSectionProps {
  transactions: Transaction[];
  onExport?: () => void;
}

export default function TransaksiSection({
  transactions,
  onExport,
}: TransaksiSectionProps) {
  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
        <div>
          <h2 className="text-sm font-bold uppercase">Transaksi Terbaru</h2>
          <p className="text-xs text-slate-400">
            Daftar transaksi tiket pengunjung dari sistem
          </p>
        </div>
        {onExport && (
          <button
            type="button"
            onClick={onExport}
            className="rounded-lg bg-[#2D3E33] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#233128]"
          >
            Export CSV
          </button>
        )}
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[540px] border-collapse text-left">
          <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-3 py-2.5">ID / Pembeli</th>
              <th className="px-3 py-2.5">Tiket</th>
              <th className="px-3 py-2.5">Total</th>
              <th className="px-3 py-2.5">Status</th>
              <th className="px-3 py-2.5">Tanggal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-[11px]">
            {safeTransactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-slate-400">
                  Belum ada data transaksi.
                </td>
              </tr>
            ) : (
              safeTransactions.map((trx) => {
                const status = ((trx?.status || "").trim() || "PENDING").toUpperCase();
                const isPaid = status === "LUNAS" || status === "PAID" || status === "BERHASIL";

                return (
                  <tr key={trx.id}>
                    <td className="px-3 py-2.5">
                      <p className="font-semibold text-slate-800">
                        {(trx?.name || "").trim() || "Pengunjung"}
                      </p>
                      <p className="text-[10px] text-slate-400">{trx.id}</p>
                    </td>
                    <td className="px-3 py-2.5 text-slate-600">
                      {(Number(trx?.tickets) || 0).toLocaleString("id-ID")}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 font-semibold text-slate-800">
                      Rp {(Number(trx?.total) || 0).toLocaleString("id-ID")}
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          isPaid
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-slate-600">
                      {(trx?.date || "").trim() || "-"}
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