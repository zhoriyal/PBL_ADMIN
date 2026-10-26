"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Bell, CornerUpLeft, MessageSquare, RefreshCw, Search, Send, Star, User } from "lucide-react";
import { ulasanApi } from "@/lib/api";

interface Review {
  id: number;
  nama: string;
  avatar_initial: string;
  avatar_color: string;
  category: string;
  rating: number;
  comment: string;
  reply: string;
  reply_date: string;
  created_at: string;
}

const cardClass = "rounded-xl border border-slate-200/80 bg-white shadow-sm";

export default function ReviewCenter() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState({ averageRating: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("Semua Rating");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [currentPage, setCurrentPage] = useState(1);
  const [replyDrafts, setReplyDrafts] = useState<Record<number, string>>({});
  const [sendingReply, setSendingReply] = useState<number | null>(null);
  const pageSize = 3;

  // ─── Fetch dari backend ──────────────────────────────────────────────────
  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await ulasanApi.getAll({ limit: 100 });
      setReviews(res.data);
      setStats(res.stats);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal memuat ulasan");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const filteredReviews = useMemo(() => reviews.filter((r) => {
    const q = search.trim().toLowerCase();
    const matchSearch = !q || `${r.nama} ${r.comment} ${r.category}`.toLowerCase().includes(q);
    const matchRating = ratingFilter === "Semua Rating" || r.rating === Number(ratingFilter);
    const matchStatus = statusFilter === "Semua Status"
      || (statusFilter === "Sudah Dibalas" ? Boolean(r.reply) : !r.reply);
    return matchSearch && matchRating && matchStatus;
  }), [reviews, search, ratingFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / pageSize));
  const visibleReviews = filteredReviews.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const respondedCount = reviews.filter(r => r.reply).length;
  const responseRate = reviews.length > 0 ? Math.round((respondedCount / reviews.length) * 100) : 0;

  // ─── Kirim balasan ────────────────────────────────────────────────────────
  const sendReply = async (reviewId: number) => {
    const reply = replyDrafts[reviewId]?.trim();
    if (!reply) return;
    setSendingReply(reviewId);
    try {
      await ulasanApi.reply(reviewId, reply);
      setReplyDrafts(d => ({ ...d, [reviewId]: "" }));
      await fetchReviews();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal mengirim balasan");
    } finally {
      setSendingReply(null);
    }
  };

  const resetPage = () => setCurrentPage(1);

  return (
    <div className="-mx-4 -mt-4 min-h-screen bg-[#F5F0E8] font-sans text-slate-800 md:-mx-6 md:-mt-6">
      <header className="flex min-h-[46px] items-center justify-between border-b border-slate-100 bg-white px-5 md:px-6">
        <div>
          <h1 className="text-sm font-bold uppercase leading-tight text-slate-800">Ulasan / Feedback</h1>
          <p className="text-xs leading-tight text-slate-400">Pantau ulasan dan kepuasan pengunjung Museum Brawijaya</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <button onClick={fetchReviews} className="text-slate-500 hover:text-slate-700" title="Refresh"><RefreshCw size={14} /></button>
          <button aria-label="Notifikasi" className="relative text-slate-700"><Bell size={15} fill="currentColor" /><span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-red-500" /></button>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-white"><User size={13} fill="currentColor" /></span>
            <span className="text-xs font-bold">ADMIN</span>
          </div>
        </div>
      </header>

      <div className="space-y-[18px] p-4 md:p-6">

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 flex justify-between">
            <span>⚠️ {error} — Pastikan backend berjalan di <code>http://localhost:3001</code></span>
            <button onClick={fetchReviews} className="underline">Coba Lagi</button>
          </div>
        )}

        {/* Stats */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className={`${cardClass} flex min-h-20 items-center gap-3 px-4 py-3`}>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700"><Star size={19} fill="currentColor" /></span>
            <div><p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Rata-rata Rating</p>
              <p className="mt-0.5 text-lg font-bold">{loading ? "..." : stats.averageRating.toFixed(1)} <span className="text-xs font-normal text-slate-400">/ 5.0</span></p></div>
          </div>
          <div className={`${cardClass} flex min-h-20 items-center gap-3 px-4 py-3`}>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700"><MessageSquare size={19} fill="currentColor" /></span>
            <div><p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Total Ulasan Masuk</p>
              <p className="mt-0.5 text-lg font-bold">{loading ? "..." : stats.total} <span className="text-xs font-normal text-slate-400">Ulasan</span></p></div>
          </div>
          <div className={`${cardClass} flex min-h-20 items-center gap-3 px-4 py-3`}>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700"><CornerUpLeft size={19} strokeWidth={2.8} /></span>
            <div><p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Tingkat Respon Admin</p>
              <p className="mt-0.5 text-lg font-bold text-emerald-700">{loading ? "..." : responseRate}% <span className="text-xs font-normal text-slate-400">(Telah Dibalas)</span></p></div>
          </div>
        </section>

        {/* Daftar Ulasan */}
        <section className={`${cardClass} p-4`}>
          <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-3 md:flex-row md:items-center">
            <div>
              <h2 className="text-sm font-bold uppercase">Daftar Masukan & Ulasan Pengunjung</h2>
              <p className="text-xs text-slate-400">Kelola umpan balik dan berikan tanggapan resmi pengelola museum</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="relative min-w-[180px]">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input value={search} onChange={e => { setSearch(e.target.value); resetPage(); }} placeholder="Cari Kata Kunci / Nama..." className="h-8 w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-2 text-[11px] outline-none focus:border-slate-400" />
              </label>
              <select value={ratingFilter} onChange={e => { setRatingFilter(e.target.value); resetPage(); }} className="h-8 rounded-lg border border-slate-200 bg-slate-50 px-2 text-[11px] text-slate-600">
                <option>Semua Rating</option><option value="5">5 Bintang</option><option value="4">4 Bintang</option><option value="3">3 Bintang</option><option value="2">2 Bintang</option><option value="1">1 Bintang</option>
              </select>
              <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); resetPage(); }} className="h-8 rounded-lg border border-slate-200 bg-slate-50 px-2 text-[11px] text-slate-600">
                <option>Semua Status</option><option>Sudah Dibalas</option><option>Belum Dibalas</option>
              </select>
            </div>
          </div>

          <div className="space-y-2.5 pt-3">
            {loading ? (
              <div className="py-10 text-center text-xs text-slate-400"><RefreshCw size={16} className="animate-spin mx-auto mb-2" />Memuat ulasan dari database...</div>
            ) : visibleReviews.length ? visibleReviews.map((review) => (
              <article key={review.id} className="rounded-xl border border-slate-200 bg-white p-3.5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white"
                      style={{ backgroundColor: review.avatar_color }}>{review.avatar_initial}</span>
                    <div>
                      <h3 className="text-xs font-bold text-slate-800">{review.nama}</h3>
                      <p className="text-[10px] text-slate-400">{review.created_at?.slice(0, 10)} • {review.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex text-amber-500">
                      {Array.from({ length: 5 }, (_, i) => <Star key={i} size={13} fill={i < review.rating ? "currentColor" : "none"} strokeWidth={1.5} />)}
                    </div>
                    <span className={`rounded-full px-2 py-1 text-[8px] font-bold ${review.reply ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {review.reply ? "SUDAH DIBALAS" : "PERLU DIBALAS"}
                    </span>
                  </div>
                </div>
                <p className="mt-2.5 text-[11px] leading-relaxed text-slate-600">&quot;{review.comment}&quot;</p>

                {review.reply ? (
                  <div className="ml-4 mt-2.5 rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="flex items-center gap-1 text-[10px] font-bold text-[#2D3E33]"><CornerUpLeft size={11} />Balasan Tim Museum Brawijaya</p>
                      <span className="text-[9px] text-slate-400">{review.reply_date}</span>
                    </div>
                    <p className="mt-1 text-[10px] leading-relaxed text-slate-500">{review.reply}</p>
                  </div>
                ) : (
                  <div className="ml-4 mt-2.5">
                    <textarea value={replyDrafts[review.id] ?? ""} onChange={e => setReplyDrafts(d => ({ ...d, [review.id]: e.target.value }))}
                      placeholder="Tulis balasan resmi admin di sini..." className="min-h-10 w-full resize-y rounded-lg border border-slate-200 px-2.5 py-2 text-[10px] outline-none focus:border-slate-400" />
                    <div className="mt-1.5 flex justify-end">
                      <button onClick={() => sendReply(review.id)} disabled={!replyDrafts[review.id]?.trim() || sendingReply === review.id}
                        className="flex items-center gap-1 rounded-lg bg-[#2D3E33] px-2.5 py-1.5 text-[9px] font-semibold text-white hover:bg-[#233128] disabled:cursor-not-allowed disabled:opacity-50">
                        <Send size={10} />{sendingReply === review.id ? "Mengirim..." : "Kirim Balasan"}
                      </button>
                    </div>
                  </div>
                )}
              </article>
            )) : <p className="py-8 text-center text-xs text-slate-400">Tidak ada ulasan yang cocok dengan filter.</p>}
          </div>

          <footer className="mt-3 flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-3 text-[10px] text-slate-500 sm:flex-row">
            <p>Menampilkan {filteredReviews.length ? (currentPage - 1) * pageSize + 1 : 0} - {Math.min(currentPage * pageSize, filteredReviews.length)} dari {filteredReviews.length} ulasan</p>
            <div className="flex items-center gap-1.5">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="rounded-md border border-slate-200 px-2.5 py-1.5 font-semibold disabled:opacity-50">Sebelumnya</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setCurrentPage(p)} className={`h-7 min-w-7 rounded-md px-2 text-[10px] font-bold ${currentPage === p ? "bg-[#2D3E33] text-white" : "border border-slate-200 hover:bg-slate-50"}`}>{p}</button>
              ))}
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="rounded-md border border-slate-200 px-2.5 py-1.5 font-semibold disabled:opacity-50">Selanjutnya</button>
            </div>
          </footer>
        </section>
      </div>
    </div>
  );
}