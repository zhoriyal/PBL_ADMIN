"use client";

import { useEffect, useState } from "react";
import { dashboardApi } from "@/lib/api";
import DashboardSummarySection from "@/components/admin/dashboard/DashboardSummarySection";
import DashboardInsightsSection from "@/components/admin/dashboard/DashboardInsightsSection";
import DashboardTransactionsSection from "@/components/admin/dashboard/DashboardTransactionsSection";
import type { Review, Transaction, WeeklyData } from "@/components/admin/dashboard/types";

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: "#MB-20261002-01", name: "Pandu Aji", tickets: 2, total: 20000, status: "LUNAS", date: "2026-10-02" },
    { id: "#MB-20261002-02", name: "Setiawan", tickets: 1, total: 10000, status: "LUNAS", date: "2026-10-02" },
    { id: "#MB-20261001-03", name: "Rayhan", tickets: 3, total: 30000, status: "LUNAS", date: "2026-10-01" },
    { id: "#MB-20261001-04", name: "Jordan", tickets: 2, total: 20000, status: "PENDING", date: "2026-10-01" },
  ]);
  const [reviews, setReviews] = useState<Review[]>([
    { id: "1", user: "Pengunjung #12", rating: 5.0, comment: "Koleksi sejarahnya sangat lengkap dan informatif!", date: "2 Okt 2026" },
    { id: "2", user: "Pengunjung #09", rating: 4.5, comment: "Pemesanan tiket online via web mobile sangat praktis.", date: "1 Okt 2026" },
  ]);
  const [katalogCount, setKatalogCount] = useState(48);
  const [tiketTerjualHariIni, setTiketTerjualHariIni] = useState(0);
  const [pendapatanHariIni, setPendapatanHariIni] = useState(0);
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([
    { day: "Sen", val: 40 },
    { day: "Sel", val: 65 },
    { day: "Rab", val: 30 },
    { day: "Kam", val: 85 },
    { day: "Jum", val: 120 },
    { day: "Sab", val: 142 },
    { day: "Ming", val: 95 },
  ]);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const res = await dashboardApi.getSummary();
        if (res.success && res.data) {
          const data = res.data;
          setTiketTerjualHariIni(data.terjualHariIni || 0);
          setPendapatanHariIni(data.pendapatanHariIni || 0);
          setKatalogCount(data.totalKoleksi || 0);
          if (data.transactions?.length) setTransactions(data.transactions);
          if (data.reviews?.length) setReviews(data.reviews);
          if (data.weeklyData?.length) setWeeklyData(data.weeklyData);
        }
      } catch (error) {
        console.warn("Using offline fallback dashboard data", error);
      }
    }

    fetchSummary();
  }, []);

  const exportToCSV = () => {
    const today = new Date().toISOString().slice(0, 10);
    const headers = "ID Transaksi,Nama Pembeli,Jumlah Tiket,Total Biaya,Status,Tanggal\n";
    const rows = transactions.map(
      (transaction) =>
        `${transaction.id},${transaction.name},${transaction.tickets},${transaction.total},${transaction.status},${transaction.date}`,
    );
    const blob = new Blob([headers + rows.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Laporan_Transaksi_Museum_${today}.csv`;
    link.click();
  };

  return (
    <div className="w-full min-w-0" style={{ fontFamily: "sans-serif", color: "#333", padding: "16px 8px", position: "relative" }}>
      <DashboardSummarySection
        ticketsSold={tiketTerjualHariIni}
        revenue={pendapatanHariIni}
        collectionCount={katalogCount}
      />
      <DashboardInsightsSection weeklyData={weeklyData} reviews={reviews} />
      <DashboardTransactionsSection transactions={transactions} onExport={exportToCSV} />
    </div>
  );
}
