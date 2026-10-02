"use client";

import { useMemo, useState } from "react";
import { Bell, CornerUpLeft, MessageSquare, Search, Send, Star, User } from "lucide-react";

interface Review {
  id: number;
  name: string;
  initials: string;
  date: string;
  category: string;
  rating: number;
  comment: string;
  reply: string;
  replyDate: string;
  avatar: string;
}

const initialReviews: Review[] = [
  {
    id: 1,
    name: "Pandu Aji",
    initials: "PA",
    date: "29 Sep 2026",
    category: "Kunjungan Umum",
    rating: 5,
    comment: "Kunjungan yang sangat edukatif! Koleksi artefak sejarah perjuangan tersusun rapi dan penataan informasinya sangat jelas. Pemesanan tiket secara online lewat website ini juga sangat praktis tanpa perlu antre panjang.",
    reply: "Terima kasih mas Pandu atas ulasan positifnya! Kami senang kemudahan reservasi tiket dan fasilitas pameran memberikan pengalaman kunjungan yang berkesan. Sampai jumpa kembali!",
    replyDate: "29 Sep 2026",
    avatar: "bg-amber-700",
  },
  {
    id: 2,
    name: "Rayhan",
    initials: "RY",
    date: "28 Sep 2026",
    category: "Kunjungan Pelajar",
    rating: 4,
    comment: "Sangat bagus untuk edukasi siswa. Namun mohon pencahayaan di area koleksi dokumen sejarah lantai 1 bisa sedikit diterangkan lagi agar teks keterangan lebih nyaman dibaca.",
    reply: "",
    replyDate: "",
    avatar: "bg-blue-700",
  },
  {
    id: 3,
    name: "Jordan",
    initials: "JD",
    date: "25 Sep 2026",
    category: "Wisatawan Mancanegara",
    rating: 5,
    comment: "Great historical museum with rich military collections. Very friendly staff and clean environment!",
    reply: "Thank you so much Jordan! We are glad you enjoyed exploring our historical collections.",
    replyDate: "25 Sep 2026",
    avatar: "bg-emerald-700",
  },
  {
    id: 4,
    name: "Dina Putri",
    initials: "DP",
    date: "22 Sep 2026",
    category: "Kunjungan Umum",
    rating: 5,
    comment: "Museum yang nyaman untuk dikunjungi bersama keluarga. Informasi pada setiap koleksi juga mudah dipahami.",
    reply: "Terima kasih sudah berkunjung bersama keluarga. Kami tunggu kedatangannya kembali.",
    replyDate: "23 Sep 2026",
    avatar: "bg-rose-700",
  },
  {
    id: 5,
    name: "Bima Saputra",
    initials: "BS",
    date: "20 Sep 2026",
    category: "Kunjungan Pelajar",
    rating: 4,
    comment: "Koleksinya lengkap dan petugasnya ramah. Akan lebih baik jika papan petunjuk ditambah di area luar.",
    reply: "Terima kasih atas masukannya. Saran mengenai papan petunjuk sudah kami catat.",
    replyDate: "21 Sep 2026",
    avatar: "bg-indigo-700",
  },
  {
    id: 6,
    name: "Sari Wulandari",
    initials: "SW",
    date: "18 Sep 2026",
    category: "Kunjungan Umum",
    rating: 5,
    comment: "Pengalaman berkunjung yang menyenangkan dan menambah wawasan tentang sejarah perjuangan.",
    reply: "Terima kasih, semoga kunjungan berikutnya sama berkesannya.",
    replyDate: "19 Sep 2026",
    avatar: "bg-teal-700",
  },
];

const cardClass = "rounded-xl border border-slate-200/80 bg-white shadow-sm";

export default function ReviewCenter() {
  const [reviews, setReviews] = useState(initialReviews);
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("Semua Rating");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [currentPage, setCurrentPage] = useState(1);
  const [replyDrafts, setReplyDrafts] = useState<Record<number, string>>({});
  const pageSize = 3;

  const filteredReviews = useMemo(() => reviews.filter((review) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || `${review.name} ${review.comment} ${review.category}`.toLowerCase().includes(query);
    const matchesRating = ratingFilter === "Semua Rating" || review.rating === Number(ratingFilter);
    const matchesStatus = statusFilter === "Semua Status"
      || (statusFilter === "Sudah Dibalas" ? Boolean(review.reply) : !review.reply);
    return matchesSearch && matchesRating && matchesStatus;
  }), [ratingFilter, reviews, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / pageSize));
  const visibleReviews = filteredReviews.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const responseRate = 95;

  const sendReply = (reviewId: number) => {
    const reply = replyDrafts[reviewId]?.trim();
    if (!reply) return;
    setReviews((items) => items.map((item) => item.id === reviewId
      ? { ...item, reply, replyDate: new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date()) }
      : item));
    setReplyDrafts((drafts) => ({ ...drafts, [reviewId]: "" }));
  };

  const resetPage = () => setCurrentPage(1);

  return (
    <div className="-mx-4 -mt-4 min-h-screen bg-[#F5F0E8] font-sans text-slate-800 md:-mx-6 md:-mt-6">
      <header className="flex min-h-[46px] items-center justify-between border-b border-slate-100 bg-white px-5 md:px-6">
        <div>
          <h1 className="text-sm font-bold uppercase leading-tight text-slate-800">Ulasan / Feedback</h1>
          <p className="text-xs leading-tight text-slate-400">Pantau ulasan, masukan, dan kepuasan pengunjung Museum Brawijaya</p>
        </div>
        <div className="flex shrink-0 items-center gap-3 md:gap-5">
          <button aria-label="Notifikasi" className="relative text-slate-700"><Bell size={15} fill="currentColor" /><span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-red-500" /></button>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-white"><User size={13} fill="currentColor" /></span>
            <span className="text-xs font-bold">ADMIN</span>
          </div>
        </div>
      </header>

      <div className="space-y-[18px] p-4 md:p-6">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className={`${cardClass} flex min-h-20 items-center gap-3 px-4 py-3`}>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700"><Star size={19} fill="currentColor" /></span>
            <div><p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Rata-rata Rating</p><p className="mt-0.5 text-lg font-bold leading-none">4.8 <span className="text-xs font-normal text-slate-400">/ 5.0</span></p></div>
          </div>
          <div className={`${cardClass} flex min-h-20 items-center gap-3 px-4 py-3`}>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700"><MessageSquare size={19} fill="currentColor" /></span>
            <div><p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Total Ulasan Masuk</p><p className="mt-0.5 text-lg font-bold leading-none">328 <span className="text-xs font-normal text-slate-400">Ulasan</span></p></div>
          </div>
          <div className={`${cardClass} flex min-h-20 items-center gap-3 px-4 py-3`}>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700"><CornerUpLeft size={19} strokeWidth={2.8} /></span>
            <div><p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Tingkat Respon Admin</p><p className="mt-0.5 text-lg font-bold leading-none text-emerald-700">{responseRate}% <span className="text-xs font-normal text-slate-400">(Telah Dibalas)</span></p></div>
          </div>
        </section>

        <section className={`${cardClass} p-4`}>
          <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-3 md:flex-row md:items-center">
            <div><h2 className="text-sm font-bold uppercase">Daftar Masukan & Ulasan Pengunjung</h2><p className="text-xs text-slate-400">Kelola umpan balik dan berikan tanggapan resmi pengelola museum</p></div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="relative min-w-[180px] flex-1 md:flex-none"><Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" /><input aria-label="Cari ulasan" value={search} onChange={(event) => { setSearch(event.target.value); resetPage(); }} placeholder="Cari Kata Kunci / Nama..." className="h-8 w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-2 text-[11px] outline-none focus:border-slate-400 md:w-[180px]" /></label>
              <select aria-label="Filter rating" value={ratingFilter} onChange={(event) => { setRatingFilter(event.target.value); resetPage(); }} className="h-8 rounded-lg border border-slate-200 bg-slate-50 px-2 text-[11px] text-slate-600"><option>Semua Rating</option><option value="5">5 Bintang</option><option value="4">4 Bintang</option><option value="3">3 Bintang</option><option value="2">2 Bintang</option><option value="1">1 Bintang</option></select>
              <select aria-label="Filter status" value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); resetPage(); }} className="h-8 rounded-lg border border-slate-200 bg-slate-50 px-2 text-[11px] text-slate-600"><option>Semua Status</option><option>Sudah Dibalas</option><option>Belum Dibalas</option></select>
            </div>
          </div>

          <div className="space-y-2.5 pt-3">
            {visibleReviews.length ? visibleReviews.map((review) => (
              <article key={review.id} className="rounded-xl border border-slate-200 bg-white p-3.5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white ${review.avatar}`}>{review.initials}</span>
                    <div className="min-w-0"><h3 className="text-xs font-bold text-slate-800">{review.name}</h3><p className="text-[10px] text-slate-400">Dikirim pada {review.date} • {review.category}</p></div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <div className="flex text-amber-500" aria-label={`${review.rating} dari 5 bintang`}>{Array.from({ length: 5 }, (_, index) => <Star key={index} size={13} fill={index < review.rating ? "currentColor" : "none"} strokeWidth={1.5} />)}</div>
                    <span className={`rounded-full px-2 py-1 text-[8px] font-bold ${review.reply ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{review.reply ? "SUDAH DIBALAS" : "PERLU DIBALAS"}</span>
                  </div>
                </div>
                <p className="mt-2.5 text-[11px] leading-relaxed text-slate-600">&quot;{review.comment}&quot;</p>
                {review.reply ? (
                  <div className="ml-4 mt-2.5 rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2.5">
                    <div className="flex items-center justify-between gap-2"><p className="flex items-center gap-1 text-[10px] font-bold text-[#2D3E33]"><CornerUpLeft size={11} />Balasan Tim Museum Brawijaya</p><span className="text-[9px] text-slate-400">{review.replyDate}</span></div>
                    <p className="mt-1 text-[10px] leading-relaxed text-slate-500">{review.reply}</p>
                  </div>
                ) : (
                  <div className="ml-4 mt-2.5">
                    <textarea aria-label={`Tulis balasan untuk ${review.name}`} value={replyDrafts[review.id] ?? ""} onChange={(event) => setReplyDrafts((drafts) => ({ ...drafts, [review.id]: event.target.value }))} placeholder="Tulis balasan resmi admin di sini..." className="min-h-10 w-full resize-y rounded-lg border border-slate-200 px-2.5 py-2 text-[10px] outline-none placeholder:text-slate-400 focus:border-slate-400" />
                    <div className="mt-1.5 flex justify-end"><button onClick={() => sendReply(review.id)} disabled={!replyDrafts[review.id]?.trim()} className="flex items-center gap-1 rounded-lg bg-[#2D3E33] px-2.5 py-1.5 text-[9px] font-semibold text-white hover:bg-[#233128] disabled:cursor-not-allowed disabled:opacity-50"><Send size={10} />Kirim Balasan</button></div>
                  </div>
                )}
              </article>
            )) : <p className="py-8 text-center text-xs text-slate-400">Tidak ada ulasan yang cocok dengan filter.</p>}
          </div>

          <footer className="mt-3 flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-3 text-[10px] text-slate-500 sm:flex-row">
            <p>Menampilkan {filteredReviews.length ? (currentPage - 1) * pageSize + 1 : 0} - {Math.min(currentPage * pageSize, filteredReviews.length)} dari 328 ulasan</p>
            <div className="flex items-center gap-1.5">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} className="rounded-md border border-slate-200 px-2.5 py-1.5 font-semibold disabled:opacity-50">Sebelumnya</button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => <button key={page} onClick={() => setCurrentPage(page)} className={`h-7 min-w-7 rounded-md px-2 text-[10px] font-bold ${currentPage === page ? "bg-[#2D3E33] text-white" : "border border-slate-200 hover:bg-slate-50"}`}>{page}</button>)}
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} className="rounded-md border border-slate-200 px-2.5 py-1.5 font-semibold disabled:opacity-50">Selanjutnya</button>
            </div>
          </footer>
        </section>
      </div>
    </div>
  );
}