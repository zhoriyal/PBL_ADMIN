"use client";

import { useState, useEffect, useCallback, type FormEvent, type ReactNode } from "react";
import { Bell, Clock3, Megaphone, Plus, RefreshCw, Save, User } from "lucide-react";
import { informasiApi } from "@/lib/api";

interface Announcement {
  id: number;
  title: string;
  description: string;
  category: string;
  date: string;
  status: "AKTIF" | "ARSIP";
}
interface FaqItem { id: number; question: string; answer: string; }
interface JamOperasional { hari: string; jam: string; telepon: string; }

const inputClass = "mt-1.5 h-8 w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-[11px] text-slate-700 outline-none focus:border-slate-400";
const sectionClass = "overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm";

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" onClick={onClose}>
      <section className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">{title}</h3>
          <button type="button" onClick={onClose} className="text-lg leading-none text-slate-400 hover:text-slate-700">×</button>
        </div>
        {children}
      </section>
    </div>
  );
}

export default function InfoCenter() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [hours, setHours] = useState<JamOperasional>({ hari: "Selasa - Minggu (Senin Libur)", jam: "08:00 - 15:00 WIB", telepon: "(0341) 551502" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hoursSaved, setHoursSaved] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState({ title: "", description: "", category: "Informasi Umum", date: "", status: "AKTIF" as Announcement["status"] });
  const [faqForm, setFaqForm] = useState({ question: "", answer: "" });
  const [editingAnnouncement, setEditingAnnouncement] = useState<number | null>(null);
  const [editingFaq, setEditingFaq] = useState<number | null>(null);
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [pRes, fRes, jRes] = await Promise.all([
        informasiApi.getPengumuman(),
        informasiApi.getFaq(),
        informasiApi.getJamOperasional(),
      ]);
      setAnnouncements(pRes.data);
      setFaqs(fRes.data);
      if (jRes.data) setHours({ hari: jRes.data.hari, jam: jRes.data.jam, telepon: jRes.data.telepon });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const activeAnnouncements = announcements.filter(a => a.status === "AKTIF").length;

  const saveHours = async () => {
    setSaving(true);
    try {
      await informasiApi.updateJamOperasional(hours);
      setHoursSaved(true);
      setTimeout(() => setHoursSaved(false), 2500);
    } catch {
      alert("Gagal menyimpan jam operasional");
    } finally { setSaving(false); }
  };

  const openAnnouncement = (item?: Announcement) => {
    setEditingAnnouncement(item?.id ?? null);
    setAnnouncementForm(item
      ? { title: item.title, description: item.description, category: item.category, date: item.date, status: item.status }
      : { title: "", description: "", category: "Informasi Umum", date: "", status: "AKTIF" });
    setAnnouncementModalOpen(true);
  };

  const saveAnnouncement = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingAnnouncement !== null) {
        await informasiApi.updatePengumuman(String(editingAnnouncement), announcementForm);
      } else {
        await informasiApi.addPengumuman(announcementForm);
      }
      await fetchData();
      setAnnouncementModalOpen(false);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally { setSaving(false); }
  };

  const deleteAnnouncement = async (id: number) => {
    if (!confirm("Hapus pengumuman ini?")) return;
    try { await informasiApi.deletePengumuman(String(id)); await fetchData(); }
    catch (err: unknown) { alert(err instanceof Error ? err.message : "Gagal menghapus"); }
  };

  const openFaq = (item?: FaqItem) => {
    setEditingFaq(item?.id ?? null);
    setFaqForm(item ? { question: item.question, answer: item.answer } : { question: "", answer: "" });
    setFaqModalOpen(true);
  };

  const saveFaq = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingFaq !== null) {
        await informasiApi.updateFaq(String(editingFaq), faqForm);
      } else {
        await informasiApi.addFaq(faqForm);
      }
      await fetchData();
      setFaqModalOpen(false);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally { setSaving(false); }
  };

  const deleteFaq = async (id: number) => {
    if (!confirm("Hapus FAQ ini?")) return;
    try { await informasiApi.deleteFaq(String(id)); await fetchData(); }
    catch (err: unknown) { alert(err instanceof Error ? err.message : "Gagal menghapus"); }
  };

  return (
    <div className="w-full min-h-screen bg-[#F5F0E8] font-sans text-slate-800">

      <div className="space-y-[18px] p-4 md:p-6">
        {/* Error */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 flex justify-between">
            <span>⚠️ {error} — Pastikan backend berjalan di <code>http://localhost:3001</code></span>
            <button onClick={fetchData} className="underline">Coba Lagi</button>
          </div>
        )}

        {/* Stats */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className={`${sectionClass} flex min-h-20 items-center gap-3 px-4 py-3`}>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700"><Clock3 size={19} strokeWidth={2.8} /></span>
            <div><p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Status Operasional Hari Ini</p>
              <p className="mt-0.5 text-lg font-bold text-emerald-700">BUKA <span className="text-xs font-normal text-slate-400">({hours.jam})</span></p></div>
          </div>
          <div className={`${sectionClass} flex min-h-20 items-center gap-3 px-4 py-3`}>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700"><Megaphone size={19} fill="currentColor" /></span>
            <div><p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Pengumuman Aktif</p>
              <p className="mt-0.5 text-lg font-bold">{loading ? "..." : activeAnnouncements} <span className="text-xs font-normal text-slate-400">Informasi</span></p></div>
          </div>
          <div className={`${sectionClass} flex min-h-20 items-center gap-3 px-4 py-3`}>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100"><span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-blue-700 text-xs font-bold text-white">?</span></span>
            <div><p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">FAQ Terpublikasi</p>
              <p className="mt-0.5 text-lg font-bold">{loading ? "..." : faqs.length} <span className="text-xs font-normal text-slate-400">Pertanyaan</span></p></div>
          </div>
        </section>

        {/* Jam Operasional */}
        <section className={`${sectionClass} p-4`}>
          <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold uppercase">Jam Operasional & Kontak Kunjungan</h2>
              <p className="text-xs text-slate-400">Atur informasi operasional yang ditampilkan pada halaman utama</p>
            </div>
            <button onClick={saveHours} disabled={saving} className="flex items-center gap-1.5 rounded-lg bg-[#2D3E33] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#233128] disabled:opacity-60">
              <Save size={13} />{saving ? "Menyimpan..." : hoursSaved ? "✓ Tersimpan" : "Simpan Perubahan"}
            </button>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <label className="text-[11px] font-semibold">Hari Operasional<input value={hours.hari} onChange={e => setHours({ ...hours, hari: e.target.value })} className={inputClass} /></label>
            <label className="text-[11px] font-semibold">Jam Buka - Tutup<input value={hours.jam} onChange={e => setHours({ ...hours, jam: e.target.value })} className={inputClass} /></label>
            <label className="text-[11px] font-semibold">Nomor Telepon / Hotline<input value={hours.telepon} onChange={e => setHours({ ...hours, telepon: e.target.value })} className={inputClass} /></label>
          </div>
        </section>

        {/* Pengumuman */}
        <section className={sectionClass}>
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3.5">
            <div><h2 className="text-sm font-bold uppercase">Pengumuman & Agenda Pameran</h2><p className="text-xs text-slate-400">Kelola pemberitahuan resmi untuk pengunjung museum</p></div>
            <button onClick={() => openAnnouncement()} className="flex shrink-0 items-center gap-1 rounded-lg bg-[#2D3E33] px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-[#233128]"><Plus size={13} />Tambah Pengumuman</button>
          </div>
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[620px] border-collapse text-left">
              <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                <tr><th className="px-3 py-2.5">Judul Pengumuman</th><th className="px-3 py-2.5">Kategori</th><th className="px-3 py-2.5">Tanggal Rilis</th><th className="px-3 py-2.5">Status</th><th className="px-3 py-2.5 text-right">Aksi</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {loading ? (
                  <tr><td colSpan={5} className="py-6 text-center text-slate-400">Memuat data...</td></tr>
                ) : announcements.map(item => (
                  <tr key={item.id}>
                    <td className="max-w-[260px] px-3 py-2.5"><p className="truncate font-semibold text-slate-800">{item.title}</p><p className="truncate text-slate-400">{item.description}</p></td>
                    <td className="px-3 py-2.5"><span className={`whitespace-nowrap rounded-md px-2 py-1 text-[10px] font-semibold ${item.category === "Agenda Event" ? "bg-blue-100 text-blue-800" : item.category === "Pemeliharaan" ? "bg-purple-100 text-purple-800" : "bg-amber-100 text-amber-800"}`}>{item.category}</span></td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-slate-600">{item.date}</td>
                    <td className="px-3 py-2.5"><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${item.status === "AKTIF" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{item.status}</span></td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-right">
                      <button onClick={() => openAnnouncement(item)} className="mr-2 text-amber-700 hover:underline">Edit</button>
                      <button onClick={() => deleteAnnouncement(item.id)} className="text-red-600 hover:underline">Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ */}
        <section className={`${sectionClass} p-4`}>
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div><h2 className="text-sm font-bold uppercase">Pertanyaan Sering Diajukan (FAQ)</h2><p className="text-xs text-slate-400">Daftar pertanyaan dan jawaban ringkas untuk calon pengunjung</p></div>
            <button onClick={() => openFaq()} className="flex shrink-0 items-center gap-1 rounded-lg bg-[#2D3E33] px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-[#233128]"><Plus size={13} />Tambah FAQ</button>
          </div>
          <div className="space-y-2 pt-3">
            {loading ? <p className="text-xs text-slate-400">Memuat FAQ...</p> : faqs.map(item => (
              <article key={item.id} className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2.5">
                <div className="min-w-0"><h3 className="truncate text-[11px] font-bold text-slate-800">{item.question}</h3><p className="mt-0.5 text-[10px] text-slate-500">{item.answer}</p></div>
                <div className="flex shrink-0 gap-2 pt-0.5 text-[11px]">
                  <button onClick={() => openFaq(item)} className="text-amber-700 hover:underline">Edit</button>
                  <button onClick={() => deleteFaq(item.id)} className="text-red-600 hover:underline">Hapus</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      {/* Modal Pengumuman */}
      {announcementModalOpen && (
        <Modal title={editingAnnouncement === null ? "Tambah Pengumuman" : "Edit Pengumuman"} onClose={() => setAnnouncementModalOpen(false)}>
          <form onSubmit={saveAnnouncement} className="space-y-3 text-xs">
            <label className="block font-semibold">Judul<input required value={announcementForm.title} onChange={e => setAnnouncementForm({ ...announcementForm, title: e.target.value })} className={inputClass} /></label>
            <label className="block font-semibold">Deskripsi<input value={announcementForm.description} onChange={e => setAnnouncementForm({ ...announcementForm, description: e.target.value })} className={inputClass} /></label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block font-semibold">Kategori
                <select value={announcementForm.category} onChange={e => setAnnouncementForm({ ...announcementForm, category: e.target.value })} className={inputClass}>
                  <option>Informasi Umum</option><option>Agenda Event</option><option>Pemeliharaan</option>
                </select>
              </label>
              <label className="block font-semibold">Tanggal<input required value={announcementForm.date} onChange={e => setAnnouncementForm({ ...announcementForm, date: e.target.value })} placeholder="25 Okt 2026" className={inputClass} /></label>
            </div>
            <label className="block font-semibold">Status
              <select value={announcementForm.status} onChange={e => setAnnouncementForm({ ...announcementForm, status: e.target.value as Announcement["status"] })} className={inputClass}>
                <option>AKTIF</option><option>ARSIP</option>
              </select>
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setAnnouncementModalOpen(false)} className="rounded-lg border border-slate-200 px-3 py-2">Batal</button>
              <button type="submit" disabled={saving} className="rounded-lg bg-[#2D3E33] px-3 py-2 font-semibold text-white disabled:opacity-60">{saving ? "Menyimpan..." : "Simpan"}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal FAQ */}
      {faqModalOpen && (
        <Modal title={editingFaq === null ? "Tambah FAQ" : "Edit FAQ"} onClose={() => setFaqModalOpen(false)}>
          <form onSubmit={saveFaq} className="space-y-3 text-xs">
            <label className="block font-semibold">Pertanyaan<input required value={faqForm.question} onChange={e => setFaqForm({ ...faqForm, question: e.target.value })} className={inputClass} /></label>
            <label className="block font-semibold">Jawaban<textarea required value={faqForm.answer} onChange={e => setFaqForm({ ...faqForm, answer: e.target.value })} className={`${inputClass} min-h-20 py-2`} /></label>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setFaqModalOpen(false)} className="rounded-lg border border-slate-200 px-3 py-2">Batal</button>
              <button type="submit" disabled={saving} className="rounded-lg bg-[#2D3E33] px-3 py-2 font-semibold text-white disabled:opacity-60">{saving ? "Menyimpan..." : "Simpan"}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}