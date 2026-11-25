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
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const itemsPerPage = 5;

  const filteredTransactions = transactions.filter(
    (transaction) => filterStatus === "ALL" || transaction.status === filterStatus,
  );
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / itemsPerPage));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedTransactions = filteredTransactions.slice(
    (safeCurrentPage - 1) * itemsPerPage,
    safeCurrentPage * itemsPerPage,
  );
  const startItem = filteredTransactions.length > 0 ? (safeCurrentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = filteredTransactions.length > 0 ? Math.min(safeCurrentPage * itemsPerPage, filteredTransactions.length) : 0;

  return (
    <>
      <section aria-label="Transaksi tiket terbaru" style={{ width: "100%", minWidth: 0, backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #f0f0f0", overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "11px", fontWeight: "bold", color: "#444" }}>TRANSAKSI TIKET TERBARU</span>
            <select
              aria-label="Filter status transaksi"
              value={filterStatus}
              onChange={(event) => {
                setFilterStatus(event.target.value);
                setCurrentPage(1);
              }}
              style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "4px", border: "1px solid #ccc" }}
            >
              <option value="ALL">Semua Status</option>
              <option value="LUNAS">LUNAS</option>
              <option value="MENUNGGU">MENUNGGU</option>
              <option value="PENDING">PENDING</option>
              <option value="BATAL">BATAL</option>
            </select>
          </div>
          <button
            onClick={onExport}
            style={{ padding: "5px 12px", borderRadius: "6px", border: "1px solid #fef3c7", backgroundColor: "#fffbeb", color: "#92400e", fontSize: "11px", fontWeight: "600", cursor: "pointer" }}
          >
            📥 Ekspor Data (CSV)
          </button>
        </div>
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-left text-[11px]">
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
              {paginatedTransactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      padding: "24px",
                      textAlign: "center",
                      color: "#78716C",
                      fontSize: "11px",
                    }}
                  >
                    Tidak ada data transaksi tiket yang sesuai.
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((transaction) => (
                  <tr key={transaction.id} style={{ borderBottom: "1px solid #f9fafb" }}>
                    <td style={{ padding: "12px 18px", fontWeight: "bold", color: "#111" }}>{transaction.id}</td>
                    <td style={{ padding: "12px 18px", color: "#4b5563" }}>{transaction.name}</td>
                    <td style={{ padding: "12px 18px", color: "#4b5563" }}>{transaction.tickets} Tiket</td>
                    <td style={{ padding: "12px 18px", fontWeight: "bold", color: "#111" }}>Rp {transaction.total.toLocaleString("id-ID")}</td>
                    <td style={{ padding: "12px 18px" }}>
                      <span
                        style={{
                          backgroundColor:
                            transaction.status === "LUNAS"
                              ? "#d1fae5"
                              : transaction.status === "BATAL"
                                ? "#fee2e2"
                                : "#fef3c7",
                          color:
                            transaction.status === "LUNAS"
                              ? "#047857"
                              : transaction.status === "BATAL"
                                ? "#dc2626"
                                : "#b45309",
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
                ))
              )}
            </tbody>
          </table>
        </div>

        <div
          style={{
            padding: "12px 18px",
            borderTop: "1px solid #f0f0f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "10px",
            fontSize: "11px",
            color: "#78716C",
          }}
        >
          <span>
            Menampilkan {startItem} - {endItem} dari {filteredTransactions.length} data
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
            <button
              type="button"
              disabled={safeCurrentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              style={{
                padding: "4px 10px",
                border: "1px solid #E7E5E4",
                borderRadius: "6px",
                backgroundColor: "#FFFFFF",
                cursor: safeCurrentPage === 1 ? "not-allowed" : "pointer",
                opacity: safeCurrentPage === 1 ? 0.5 : 1,
              }}
            >
              Sebelumnya
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
              <button
                type="button"
                key={page}
                onClick={() => setCurrentPage(page)}
                style={{
                  padding: "4px 10px",
                  border: safeCurrentPage === page ? "none" : "1px solid #E7E5E4",
                  borderRadius: "6px",
                  backgroundColor: safeCurrentPage === page ? "#224229" : "#FFFFFF",
                  color: safeCurrentPage === page ? "#FFFFFF" : undefined,
                  fontWeight: safeCurrentPage === page ? "700" : undefined,
                  cursor: "pointer",
                }}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              disabled={safeCurrentPage === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              style={{
                padding: "4px 10px",
                border: "1px solid #E7E5E4",
                borderRadius: "6px",
                backgroundColor: "#FFFFFF",
                cursor: safeCurrentPage === totalPages ? "not-allowed" : "pointer",
                opacity: safeCurrentPage === totalPages ? 0.5 : 1,
              }}
            >
              Selanjutnya
            </button>
          </div>
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
