import { CornerUpLeft, RefreshCw, Search, Send, Star } from "lucide-react";
import type { Review } from "./types";

interface ReviewListSectionProps {
  loading: boolean;
  reviews: Review[];
  filteredCount: number;
  search: string;
  ratingFilter: string;
  statusFilter: string;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  replyDrafts: Record<number, string>;
  sendingReply: number | null;
  onSearchChange: (value: string) => void;
  onRatingFilterChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onReplyDraftChange: (reviewId: number, reply: string) => void;
  onSendReply: (reviewId: number) => void;
}

const cardClass = "rounded-xl border border-slate-200/80 bg-white shadow-sm";

export default function ReviewListSection({
  loading,
  reviews,
  filteredCount,
  search,
  ratingFilter,
  statusFilter,
  currentPage,
  totalPages,
  pageSize,
  replyDrafts,
  sendingReply,
  onSearchChange,
  onRatingFilterChange,
  onStatusFilterChange,
  onPageChange,
  onReplyDraftChange,
  onSendReply,
}: ReviewListSectionProps) {
  return (
    <section className={`${cardClass} p-4`}>
      <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-3 md:flex-row md:items-center">
        <div>
          <h2 className="text-sm font-bold uppercase">Daftar Masukan & Ulasan Pengunjung</h2>
          <p className="text-xs text-slate-400">Kelola umpan balik dan berikan tanggapan resmi pengelola museum</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative min-w-[180px]">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Cari Kata Kunci / Nama..."
              className="h-8 w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-2 text-[11px] outline-none focus:border-slate-400"
            />
          </label>
          <select
            value={ratingFilter}
            onChange={(event) => onRatingFilterChange(event.target.value)}
            className="h-8 rounded-lg border border-slate-200 bg-slate-50 px-2 text-[11px] text-slate-600"
          >
            <option>Semua Rating</option>
            <option value="5">5 Bintang</option>
            <option value="4">4 Bintang</option>
            <option value="3">3 Bintang</option>
            <option value="2">2 Bintang</option>
            <option value="1">1 Bintang</option>
          </select>
          <select
            value={statusFilter}
            onChange={(event) => onStatusFilterChange(event.target.value)}
            className="h-8 rounded-lg border border-slate-200 bg-slate-50 px-2 text-[11px] text-slate-600"
          >
            <option>Semua Status</option>
            <option>Sudah Dibalas</option>
            <option>Belum Dibalas</option>
          </select>
        </div>
      </div>

      <div className="space-y-2.5 pt-3">
        {loading ? (
          <div className="py-10 text-center text-xs text-slate-400">
            <RefreshCw size={16} className="mx-auto mb-2 animate-spin" />
            Memuat ulasan dari database...
          </div>
        ) : reviews.length ? reviews.map((review) => (
          <article key={review.id} className="rounded-xl border border-slate-200 bg-white p-3.5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white" style={{ backgroundColor: review.avatar_color }}>
                  {review.avatar_initial}
                </span>
                <div>
                  <h3 className="text-xs font-bold text-slate-800">{review.nama}</h3>
                  <p className="text-[10px] text-slate-400">{review.created_at?.slice(0, 10)} • {review.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex text-amber-500">
                  {Array.from({ length: 5 }, (_, index) => (
                    <Star key={index} size={13} fill={index < review.rating ? "currentColor" : "none"} strokeWidth={1.5} />
                  ))}
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
                <textarea
                  value={replyDrafts[review.id] ?? ""}
                  onChange={(event) => onReplyDraftChange(review.id, event.target.value)}
                  placeholder="Tulis balasan resmi admin di sini..."
                  className="min-h-10 w-full resize-y rounded-lg border border-slate-200 px-2.5 py-2 text-[10px] outline-none focus:border-slate-400"
                />
                <div className="mt-1.5 flex justify-end">
                  <button
                    type="button"
                    onClick={() => onSendReply(review.id)}
                    disabled={!replyDrafts[review.id]?.trim() || sendingReply === review.id}
                    className="flex items-center gap-1 rounded-lg bg-[#2D3E33] px-2.5 py-1.5 text-[9px] font-semibold text-white hover:bg-[#233128] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Send size={10} />{sendingReply === review.id ? "Mengirim..." : "Kirim Balasan"}
                  </button>
                </div>
              </div>
            )}
          </article>
        )) : <p className="py-8 text-center text-xs text-slate-400">Tidak ada ulasan yang cocok dengan filter.</p>}
      </div>

      <footer className="mt-3 flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-3 text-[10px] text-slate-500 sm:flex-row">
        <p>Menampilkan {filteredCount ? (currentPage - 1) * pageSize + 1 : 0} - {Math.min(currentPage * pageSize, filteredCount)} dari {filteredCount} ulasan</p>
        <div className="flex items-center gap-1.5">
          <button type="button" disabled={currentPage === 1} onClick={() => onPageChange(Math.max(currentPage - 1, 1))} className="rounded-md border border-slate-200 px-2.5 py-1.5 font-semibold disabled:opacity-50">Sebelumnya</button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
            <button type="button" key={page} onClick={() => onPageChange(page)} className={`h-7 min-w-7 rounded-md px-2 text-[10px] font-bold ${currentPage === page ? "bg-[#2D3E33] text-white" : "border border-slate-200 hover:bg-slate-50"}`}>
              {page}
            </button>
          ))}
          <button type="button" disabled={currentPage === totalPages} onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} className="rounded-md border border-slate-200 px-2.5 py-1.5 font-semibold disabled:opacity-50">Selanjutnya</button>
        </div>
      </footer>
    </section>
  );
}
