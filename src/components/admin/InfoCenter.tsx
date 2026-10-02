"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import {
  Bell,
  Clock3,
  Megaphone,
  Plus,
  Save,
  User,
} from "lucide-react";

interface Announcement {
  id: number;
  title: string;
  description: string;
  category: string;
  date: string;
  status: "AKTIF" | "ARSIP";
}

interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

const initialAnnouncements: Announcement[] = [
  {
    id: 1,
    title: "Jadwal Operasional Khusus Hari Libur Nasional",
    description: "Museum tetap buka pada tanggal merah kecuali hari Senin.",
    category: "Informasi Umum",
    date: "25 Sep 2026",
    status: "AKTIF",
  },
  {
    id: 2,
    title: "Pameran Khusus Artefak Perjuangan Malang Raya",
    description: "Pameran tematik di Gedung Utama Lantai 2.",
    category: "Agenda Event",
    date: "18 Sep 2026",
    status: "AKTIF",
  },
  {
    id: 3,
    title: "Pemeliharaan Area Koleksi Kendaraan Berat",
    description: "Sebagian area luar ruangan ditutup sementara untuk perbaikan.",
    category: "Pemeliharaan",
    date: "02 Sep 2026",
    status: "ARSIP",
  },
];

const initialFaqs: FaqItem[] = [
  {
    id: 1,
    question: "Apakah harus membeli tiket secara online terlebih dahulu?",
    answer: "Pengunjung dapat membeli tiket secara online di situs ini maupun langsung secara OTS di loket.",
  },
  {
    id: 2,
    question: "Apakah diperbolehkan membawa kamera profesional ke dalam area museum?",
    answer: "Diperbolehkan dengan syarat tidak menggunakan flash pada koleksi bersejarah tertentu yang sensitif cahaya.",
  },
];

const inputClass = "mt-1.5 h-8 w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-[11px] text-slate-700 outline-none focus:border-slate-400";
const sectionClass = "overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm";

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" onClick={onClose}>
      <section className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl" onClick={(event) => event.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">{title}</h3>
          <button type="button" onClick={onClose} aria-label="Tutup" className="text-lg leading-none text-slate-400 hover:text-slate-700">×</button>
        </div>
        {children}
      </section>
    </div>
  );
}

export default function InfoCenter() {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [faqs, setFaqs] = useState(initialFaqs);
  const [hours, setHours] = useState({ days: "Selasa - Minggu (Senin Libur)", time: "08:00 - 15:00 WIB", phone: "(0341) 551502" });
  const [hoursSaved, setHoursSaved] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState({ title: "", description: "", category: "Informasi Umum", date: "", status: "AKTIF" as Announcement["status"] });
  const [faqForm, setFaqForm] = useState({ question: "", answer: "" });
  const [editingAnnouncement, setEditingAnnouncement] = useState<number | null>(null);
  const [editingFaq, setEditingFaq] = useState<number | null>(null);
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
  const [faqModalOpen, setFaqModalOpen] = useState(false);

  const activeAnnouncements = announcements.filter((item) => item.status === "AKTIF").length;
  const activeFaqs = faqs.length;

  const openAnnouncement = (item?: Announcement) => {
    setEditingAnnouncement(item?.id ?? null);
    setAnnouncementForm(item
      ? { title: item.title, description: item.description, category: item.category, date: item.date, status: item.status }
      : { title: "", description: "", category: "Informasi Umum", date: "", status: "AKTIF" });
    setAnnouncementModalOpen(true);
  };

  const saveAnnouncement = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (editingAnnouncement !== null) {
      setAnnouncements((items) => items.map((item) => item.id === editingAnnouncement ? { ...item, ...announcementForm } : item));
    } else {
      setAnnouncements((items) => [{ ...announcementForm, id: Date.now() }, ...items]);
    }
    setAnnouncementModalOpen(false);
  };

  const openFaq = (item?: FaqItem) => {
    setEditingFaq(item?.id ?? null);
    setFaqForm(item ? { question: item.question, answer: item.answer } : { question: "", answer: "" });
    setFaqModalOpen(true);
  };

  const saveFaq = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (editingFaq !== null) {
      setFaqs((items) => items.map((item) => item.id === editingFaq ? { ...item, ...faqForm } : item));
    } else {
      setFaqs((items) => [...items, { ...faqForm, id: Date.now() }]);
    }
    setFaqModalOpen(false);
  };

  return (
    <div className="-mx-4 -mt-4 min-h-screen bg-[#F5F0E8] font-sans text-slate-800 md:-mx-6 md:-mt-6">
      <header className="flex min-h-[46px] items-center justify-between border-b border-slate-100 bg-white px-5 md:px-6">
        <div>
          <h1 className="text-sm font-bold uppercase leading-tight text-slate-800">Pusat Informasi</h1>
          <p className="text-xs leading-tight text-slate-400">Kelola jam operasional, pengumuman penting, panduan pengunjung, dan FAQ museum</p>
        </div>
        <div className="flex shrink-0 items-center gap-3 md:gap-5">
          <button aria-label="Notifikasi" className="relative text-amber-500"><Bell size={15} fill="currentColor" /><span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-red-500" /></button>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-white"><User size={13} fill="currentColor" /></span>
            <span className="text-xs font-bold">ADMIN</span>
          </div>
        </div>
      </header>

      <div className="space-y-[18px] p-4 md:p-6">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className={`${sectionClass} flex min-h-20 items-center gap-3 px-4 py-3`}>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700"><Clock3 size={19} strokeWidth={2.8} /></span>
            <div><p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Status Operasional Hari Ini</p><p className="mt-0.5 text-lg font-bold leading-none text-emerald-700">BUKA <span className="text-xs font-normal text-slate-400">(08:00 - 15:00 WIB)</span></p></div>
          </div>
          <div className={`${sectionClass} flex min-h-20 items-center gap-3 px-4 py-3`}>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700"><Megaphone size={19} fill="currentColor" /></span>
            <div><p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Pengumuman Aktif</p><p className="mt-0.5 text-lg font-bold leading-none">{activeAnnouncements} <span className="text-xs font-normal text-slate-400">Informasi</span></p></div>
          </div>
          <div className={`${sectionClass} flex min-h-20 items-center gap-3 px-4 py-3`}>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100"><span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-blue-700 text-xs font-bold leading-none text-white">?</span></span>
            <div><p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">FAQ Terpublikasi</p><p className="mt-0.5 text-lg font-bold leading-none">{activeFaqs} <span className="text-xs font-normal text-slate-400">Pertanyaan</span></p></div>
          </div>
        </section>

        <section className={`${sectionClass} p-4`}>
          <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3">
            <div><h2 className="text-sm font-bold uppercase">Jam Operasional & Kontak Kunjungan</h2><p className="text-xs text-slate-400">Atur informasi operasional yang ditampilkan pada halaman utama website pengunjung</p></div>
            <button onClick={() => { setHoursSaved(true); window.setTimeout(() => setHoursSaved(false), 2000); }} className="flex items-center gap-1.5 rounded-lg bg-[#2D3E33] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#233128]"><Save size={13} />{hoursSaved ? "Tersimpan" : "Simpan Perubahan"}</button>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <label className="text-[11px] font-semibold">Hari Operasional<input value={hours.days} onChange={(event) => setHours({ ...hours, days: event.target.value })} className={inputClass} /></label>
            <label className="text-[11px] font-semibold">Jam Buka - Tutup<input value={hours.time} onChange={(event) => setHours({ ...hours, time: event.target.value })} className={inputClass} /></label>
            <label className="text-[11px] font-semibold">Nomor Telepon / Hotline<input value={hours.phone} onChange={(event) => setHours({ ...hours, phone: event.target.value })} className={inputClass} /></label>
          </div>
        </section>

        <section className={sectionClass}>
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3.5">
            <div><h2 className="text-sm font-bold uppercase">Pengumuman & Agenda Pameran</h2><p className="text-xs text-slate-400">Kelola pemberitahuan resmi untuk pengunjung museum</p></div>
            <button onClick={() => openAnnouncement()} className="flex shrink-0 items-center gap-1 rounded-lg bg-[#2D3E33] px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-[#233128]"><Plus size={13} />Tambah Pengumuman Baru</button>
          </div>
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[620px] border-collapse text-left">
              <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wide text-slate-400"><tr><th className="px-3 py-2.5">Judul Pengumuman</th><th className="px-3 py-2.5">Kategori</th><th className="px-3 py-2.5">Tanggal Rilis</th><th className="px-3 py-2.5">Status Display</th><th className="px-3 py-2.5 text-right">Aksi</th></tr></thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                {announcements.map((item) => <tr key={item.id}>
                  <td className="max-w-[260px] px-3 py-2.5"><p className="truncate font-semibold text-slate-800">{item.title}</p><p className="truncate text-[11px] text-slate-400">{item.description}</p></td>
                  <td className="px-3 py-2.5"><span className={`whitespace-nowrap rounded-md px-2 py-1 text-[10px] font-semibold ${item.category === "Agenda Event" ? "bg-blue-100 text-blue-800" : item.category === "Pemeliharaan" ? "bg-purple-100 text-purple-800" : "bg-amber-100 text-amber-800"}`}>{item.category}</span></td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-slate-600">{item.date}</td>
                  <td className="px-3 py-2.5"><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${item.status === "AKTIF" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{item.status}</span></td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right text-[11px]"><button onClick={() => openAnnouncement(item)} className="mr-2 text-amber-700 hover:underline">Edit</button><button onClick={() => setAnnouncements((items) => items.filter((announcement) => announcement.id !== item.id))} className="text-red-600 hover:underline">Hapus</button></td>
                </tr>)}
              </tbody>
            </table>
          </div>
        </section>

        <section className={`${sectionClass} p-4`}>
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div><h2 className="text-sm font-bold uppercase">Pertanyaan Sering Diajukan (FAQ)</h2><p className="text-xs text-slate-400">Daftar pertanyaan dan jawaban ringkas untuk membantu calon pengunjung</p></div>
            <button onClick={() => openFaq()} className="flex shrink-0 items-center gap-1 rounded-lg bg-[#2D3E33] px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-[#233128]"><Plus size={13} />Tambah FAQ</button>
          </div>
          <div className="space-y-2 pt-3">
            {faqs.map((item) => <article key={item.id} className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2.5">
              <div className="min-w-0"><h3 className="truncate text-[11px] font-bold text-slate-800">{item.question}</h3><p className="mt-0.5 text-[10px] text-slate-500">{item.answer}</p></div>
              <div className="flex shrink-0 gap-2 pt-0.5 text-[11px]"><button onClick={() => openFaq(item)} className="text-amber-700 hover:underline">Edit</button><button onClick={() => setFaqs((items) => items.filter((faq) => faq.id !== item.id))} className="text-red-600 hover:underline">Hapus</button></div>
            </article>)}
          </div>
        </section>
      </div>

      {announcementModalOpen && <Modal title={editingAnnouncement === null ? "Tambah Pengumuman" : "Edit Pengumuman"} onClose={() => setAnnouncementModalOpen(false)}>
        <form onSubmit={saveAnnouncement} className="space-y-3 text-xs">
          <label className="block font-semibold">Judul<input required value={announcementForm.title} onChange={(event) => setAnnouncementForm({ ...announcementForm, title: event.target.value })} className={inputClass} /></label>
          <label className="block font-semibold">Deskripsi<input required value={announcementForm.description} onChange={(event) => setAnnouncementForm({ ...announcementForm, description: event.target.value })} className={inputClass} /></label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block font-semibold">Kategori<select value={announcementForm.category} onChange={(event) => setAnnouncementForm({ ...announcementForm, category: event.target.value })} className={inputClass}><option>Informasi Umum</option><option>Agenda Event</option><option>Pemeliharaan</option></select></label>
            <label className="block font-semibold">Tanggal Rilis<input required value={announcementForm.date} onChange={(event) => setAnnouncementForm({ ...announcementForm, date: event.target.value })} placeholder="25 Sep 2026" className={inputClass} /></label>
          </div>
          <label className="block font-semibold">Status<select value={announcementForm.status} onChange={(event) => setAnnouncementForm({ ...announcementForm, status: event.target.value as Announcement["status"] })} className={inputClass}><option>AKTIF</option><option>ARSIP</option></select></label>
          <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setAnnouncementModalOpen(false)} className="rounded-lg border border-slate-200 px-3 py-2">Batal</button><button type="submit" className="rounded-lg bg-[#2D3E33] px-3 py-2 font-semibold text-white">Simpan</button></div>
        </form>
      </Modal>}

      {faqModalOpen && <Modal title={editingFaq === null ? "Tambah FAQ" : "Edit FAQ"} onClose={() => setFaqModalOpen(false)}>
        <form onSubmit={saveFaq} className="space-y-3 text-xs">
          <label className="block font-semibold">Pertanyaan<input required value={faqForm.question} onChange={(event) => setFaqForm({ ...faqForm, question: event.target.value })} className={inputClass} /></label>
          <label className="block font-semibold">Jawaban<textarea required value={faqForm.answer} onChange={(event) => setFaqForm({ ...faqForm, answer: event.target.value })} className={`${inputClass} min-h-20 py-2`} /></label>
          <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setFaqModalOpen(false)} className="rounded-lg border border-slate-200 px-3 py-2">Batal</button><button type="submit" className="rounded-lg bg-[#2D3E33] px-3 py-2 font-semibold text-white">Simpan</button></div>
        </form>
      </Modal>}
    </div>
  );
}