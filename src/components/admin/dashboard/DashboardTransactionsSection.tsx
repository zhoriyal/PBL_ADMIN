"use client";

import { useState } from "react";
import type { Transaction } from "./types";

interface DashboardTransactionsSectionProps {
  transactions: Transaction[];
  onExport: () => void;
}

export default function DashboardTransactionsSection({
  transactions,
  onExport,
}: DashboardTransactionsSectionProps) {
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const filteredTransactions = transactions.filter(
    (transaction) => filterStatus === "ALL" || transaction.status === filterStatus,
  );

  return (
    <>
      <section aria-label="Transaksi tiket terbaru" style={{ width: "100%", minWidth: 0, backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #f0f0f0", overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "11px", fontWeight: "bold", color: "#444" }}>TRANSAKSI TIKET TERBARU</span>
            <select
              aria-label="Filter status transaksi"
              value={filterStatus}
              onChange={(event) => setFilterStatus(event.target.value)}
              style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "4px", border: "1px solid #ccc" }}
            >
              <option value="ALL">Semua Status</option>
              <option value="LUNAS">LUNAS</option>
              <option value="PENDING">PENDING</option>
            </select>
          </div>
          <button
            onClick={onExport}
            style={{ padding: "5px 12px", borderRadius: "6px", border: "1px solid #fef3c7", backgroundColor: "#fffbeb", color: "#92400e", fontSize: "11px", fontWeight: "600", cursor: "pointer" }}
          >
            📥 Ekspor Data (CSV)
          </button>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "11px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f9fafb", color: "#9ca3af", borderBottom: "1px solid #f0f0f0", fontSize: "10px" }}>
                <th style={{ padding: "10px 18px" }}>ID TRANSAKSI</th>
                <th style={{ padding: "10px 18px" }}>NAMA PEMBELI</th>
                <th style={{ padding: "10px 18px" }}>JUMLAH TIKET</th>
                <th style={{ padding: "10px 18px" }}>TOTAL BIAYA</th>
                <th style={{ padding: "10px 18px" }}>STATUS</th>
                <th style={{ padding: "10px 18px", textAlign: "right" }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} style={{ borderBottom: "1px solid #f9fafb" }}>
                  <td style={{ padding: "12px 18px", fontWeight: "bold", color: "#111" }}>{transaction.id}</td>
                  <td style={{ padding: "12px 18px", color: "#4b5563" }}>{transaction.name}</td>
                  <td style={{ padding: "12px 18px", color: "#4b5563" }}>{transaction.tickets} Tiket</td>
                  <td style={{ padding: "12px 18px", fontWeight: "bold", color: "#111" }}>Rp {transaction.total.toLocaleString("id-ID")}</td>
                  <td style={{ padding: "12px 18px" }}>
                    <span
                      style={{
                        backgroundColor: transaction.status === "LUNAS" ? "#d1fae5" : "#fef3c7",
                        color: transaction.status === "LUNAS" ? "#047857" : "#b45309",
                        padding: "2px 8px",
                        borderRadius: "10px",
                        fontSize: "9px",
                        fontWeight: "bold",
                      }}
                    >
                      {transaction.status}
                    </span>
                  </td>
                  <td style={{ padding: "12px 18px", textAlign: "right" }}>
                    <button
                      onClick={() => setSelectedTransaction(transaction)}
                      style={{ color: "#2563eb", fontWeight: "600", border: "none", background: "none", cursor: "pointer", fontSize: "11px" }}
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {selectedTransaction && (
        <div
          role="presentation"
          onClick={() => setSelectedTransaction(null)}
          style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="transaction-detail-title"
            onClick={(event) => event.stopPropagation()}
            style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "12px", width: "320px", border: "1px solid #e2e8f0" }}
          >
            <h3 id="transaction-detail-title" style={{ fontSize: "14px", fontWeight: "bold", margin: "0 0 12px 0" }}>Detail Transaksi</h3>
            <p style={{ fontSize: "11px", margin: "4px 0" }}><strong>ID:</strong> {selectedTransaction.id}</p>
            <p style={{ fontSize: "11px", margin: "4px 0" }}><strong>Nama:</strong> {selectedTransaction.name}</p>
            <p style={{ fontSize: "11px", margin: "4px 0" }}><strong>Jumlah Tiket:</strong> {selectedTransaction.tickets}</p>
            <p style={{ fontSize: "11px", margin: "4px 0" }}><strong>Total:</strong> Rp {selectedTransaction.total.toLocaleString("id-ID")}</p>
            <p style={{ fontSize: "11px", margin: "4px 0" }}><strong>Tanggal:</strong> {selectedTransaction.date}</p>
            <p style={{ fontSize: "11px", margin: "4px 0" }}><strong>Status:</strong> {selectedTransaction.status}</p>
            <button
              onClick={() => setSelectedTransaction(null)}
              style={{ marginTop: "16px", width: "100%", padding: "8px", backgroundColor: "#111", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "11px" }}
            >
              Tutup
            </button>
          </section>
        </div>
      )}
    </>
  );
}
