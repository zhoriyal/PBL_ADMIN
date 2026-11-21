"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ulasanApi } from "@/lib/api";
import ReviewListSection from "./ReviewListSection";
import ReviewStatsSection from "./ReviewStatsSection";
import type { Review } from "./types";

const MAX_REPLY_LENGTH = 500;

export default function ReviewCenter() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState({ averageRating: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("Semua Rating");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [currentPage, setCurrentPage] = useState(1);
  const [replyDrafts, setReplyDrafts] = useState<Record<number, string>>({});
  const [replyErrors, setReplyErrors] = useState<Record<number, string>>({});
  const [sendingReply, setSendingReply] = useState<number | null>(null);
  const pageSize = 3;

  const fetchReviews = useCallback(
    () =>
      Promise.resolve()
        .then(() => ulasanApi.getAll({ limit: 100 }))
        .then((response) => {
          setReviews(Array.isArray(response?.data) ? response.data : []);
          setStats({
            averageRating: Number(response?.stats?.averageRating) || 0,
            total: Number(response?.stats?.total) || 0,
          });
        })
        .catch((err: unknown) => {
          setError(err instanceof Error ? err.message : "Gagal memuat ulasan");
        })
        .finally(() => {
          setLoading(false);
        }),
    []
  );

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const reloadReviews = async () => {
    setLoading(true);
    setError("");
    await fetchReviews();
  };

  const filteredReviews = useMemo(
    () =>
      reviews.filter((review) => {
        const query = search.trim().toLowerCase();
        const matchesSearch =
          !query ||
          `${review.nama || ""} ${review.comment || ""} ${review.category || ""}`
            .toLowerCase()
            .includes(query);
        const matchesRating =
          ratingFilter === "Semua Rating" || Number(review.rating) === Number(ratingFilter);
        const hasReply = Boolean((review.reply || "").trim());
        const matchesStatus =
          statusFilter === "Semua Status" ||
          (statusFilter === "Sudah Dibalas" ? hasReply : !hasReply);
        return matchesSearch && matchesRating && matchesStatus;
      }),
    [reviews, search, ratingFilter, statusFilter]
  );

  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const visibleReviews = filteredReviews.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize
  );
  const respondedCount = reviews.filter((review) => Boolean((review.reply || "").trim())).length;
  const responseRate =
    reviews.length > 0 ? Math.round((respondedCount / reviews.length) * 100) : 0;

  const handleReplyDraftChange = (reviewId: number, reply: string) => {
    const clampedReply = reply.slice(0, MAX_REPLY_LENGTH);
    setReplyDrafts((drafts) => ({ ...drafts, [reviewId]: clampedReply }));
    if (replyErrors[reviewId]) {
      setReplyErrors((prev) => {
        const next = { ...prev };
        delete next[reviewId];
        return next;
      });
    }
  };

  const sendReply = async (reviewId: number) => {
    const reply = (replyDrafts[reviewId] ?? "").replace(/\s+/g, " ").trim();
    if (!reply) {
      setReplyErrors((prev) => ({
        ...prev,
        [reviewId]: "Balasan ulasan tidak boleh kosong.",
      }));
      return;
    }
    if (reply.length < 2) {
      setReplyErrors((prev) => ({
        ...prev,
        [reviewId]: "Balasan ulasan minimal 2 karakter.",
      }));
      return;
    }
    if (reply.length > MAX_REPLY_LENGTH) {
      setReplyErrors((prev) => ({
        ...prev,
        [reviewId]: `Balasan ulasan maksimal ${MAX_REPLY_LENGTH} karakter.`,
      }));
      return;
    }

    setSuccessMessage("");
    setReplyErrors((prev) => {
      const next = { ...prev };
      delete next[reviewId];
      return next;
    });
    setSendingReply(reviewId);

    try {
      await ulasanApi.reply(reviewId, reply);
      setReplyDrafts((drafts) => ({ ...drafts, [reviewId]: "" }));
      await reloadReviews();
      setSuccessMessage("Balasan ulasan berhasil dikirim.");
    } catch (err: unknown) {
      setReplyErrors((prev) => ({
        ...prev,
        [reviewId]: err instanceof Error ? err.message : "Gagal mengirim balasan.",
      }));
    } finally {
      setSendingReply(null);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F5F0E8] font-sans text-slate-800">
      <div className="space-y-[18px] p-4 md:p-6">
        {error && (
          <div className="flex justify-between rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <span>⚠️ {error}</span>
            <button type="button" onClick={reloadReviews} className="underline">
              Coba Lagi
            </button>
          </div>
        )}

        {successMessage && (
          <div
            role="status"
            className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800"
          >
            {successMessage}
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
          currentPage={safeCurrentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          replyDrafts={replyDrafts}
          sendingReply={sendingReply}
          onSearchChange={(value) => {
            setSearch(value);
            setCurrentPage(1);
          }}
          onRatingFilterChange={(value) => {
            setRatingFilter(value);
            setCurrentPage(1);
          }}
          onStatusFilterChange={(value) => {
            setStatusFilter(value);
            setCurrentPage(1);
          }}
          onPageChange={setCurrentPage}
          onReplyDraftChange={handleReplyDraftChange}
          onSendReply={sendReply}
        />

        {Object.keys(replyErrors).length > 0 && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700"
          >
            {Object.values(replyErrors).join(" ")}
          </div>
        )}
      </div>
    </div>
  );
}