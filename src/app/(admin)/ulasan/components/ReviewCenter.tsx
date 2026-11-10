"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ulasanApi } from "@/lib/api";
import ReviewListSection from "./ReviewListSection";
import ReviewStatsSection from "./ReviewStatsSection";
import type { Review } from "./types";

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

  const fetchReviews = useCallback(() => Promise.resolve()
    .then(() => ulasanApi.getAll({ limit: 100 }))
    .then((response) => {
      setReviews(response.data);
      setStats(response.stats);
    })
    .catch((error: unknown) => {
      setError(error instanceof Error ? error.message : "Gagal memuat ulasan");
    })
    .finally(() => {
      setLoading(false);
    }), []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const reloadReviews = async () => {
    setLoading(true);
    setError("");
    await fetchReviews();
  };

  const filteredReviews = useMemo(() => reviews.filter((review) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || `${review.nama} ${review.comment} ${review.category}`.toLowerCase().includes(query);
    const matchesRating = ratingFilter === "Semua Rating" || review.rating === Number(ratingFilter);
    const matchesStatus = statusFilter === "Semua Status"
      || (statusFilter === "Sudah Dibalas" ? Boolean(review.reply) : !review.reply);
    return matchesSearch && matchesRating && matchesStatus;
  }), [reviews, search, ratingFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / pageSize));
  const visibleReviews = filteredReviews.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const respondedCount = reviews.filter((review) => review.reply).length;
  const responseRate = reviews.length > 0 ? Math.round((respondedCount / reviews.length) * 100) : 0;

  const sendReply = async (reviewId: number) => {
    const reply = replyDrafts[reviewId]?.trim();
    if (!reply) return;
    setSendingReply(reviewId);
    try {
      await ulasanApi.reply(reviewId, reply);
      setReplyDrafts((drafts) => ({ ...drafts, [reviewId]: "" }));
      await reloadReviews();
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : "Gagal mengirim balasan");
    } finally {
      setSendingReply(null);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F5F0E8] font-sans text-slate-800">
      <div className="space-y-[18px] p-4 md:p-6">
        {error && (
          <div className="flex justify-between rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <span>⚠️ {error} — Pastikan backend berjalan di <code>http://localhost:3001</code></span>
            <button onClick={reloadReviews} className="underline">Coba Lagi</button>
          </div>
        )}

        <ReviewStatsSection
          loading={loading}
          averageRating={stats.averageRating}
          totalReviews={stats.total}
          responseRate={responseRate}
        />
        <ReviewListSection
          loading={loading}
          reviews={visibleReviews}
          filteredCount={filteredReviews.length}
          search={search}
          ratingFilter={ratingFilter}
          statusFilter={statusFilter}
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          replyDrafts={replyDrafts}
          sendingReply={sendingReply}
          onSearchChange={(value) => { setSearch(value); setCurrentPage(1); }}
          onRatingFilterChange={(value) => { setRatingFilter(value); setCurrentPage(1); }}
          onStatusFilterChange={(value) => { setStatusFilter(value); setCurrentPage(1); }}
          onPageChange={setCurrentPage}
          onReplyDraftChange={(reviewId, reply) => setReplyDrafts((drafts) => ({ ...drafts, [reviewId]: reply }))}
          onSendReply={sendReply}
        />
      </div>
    </div>
  );
}
