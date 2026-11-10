"use client";

import { useState, useEffect, useCallback, type FormEvent, type ReactNode } from "react";
import { informasiApi } from "@/lib/api";
import AnnouncementsSection from "./AnnouncementsSection";
import FaqSection from "./FaqSection";
import InformationStatsSection from "./InformationStatsSection";
import OperatingHoursSection from "./OperatingHoursSection";
import type { Announcement, FaqItem, JamOperasional } from "./types";

const inputClass = "mt-1.5 h-8 w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-[11px] text-slate-700 outline-none focus:border-slate-400";
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

  const fetchData = useCallback(() => Promise.resolve().then(() => Promise.all([
    informasiApi.getPengumuman(),
    informasiApi.getFaq(),
    informasiApi.getJamOperasional(),
  ])).then(([pRes, fRes, jRes]) => {
    setAnnouncements(pRes.data);
    setFaqs(fRes.data);
    if (jRes.data) setHours({ hari: jRes.data.hari, jam: jRes.data.jam, telepon: jRes.data.telepon });
  }).catch((err: unknown) => {
    setError(err instanceof Error ? err.message : "Gagal memuat data");
  }).finally(() => {
    setLoading(false);
  }), []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const reloadData = async () => {
    setLoading(true);
    setError("");
    await fetchData();
  };

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
      await reloadData();
      setAnnouncementModalOpen(false);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally { setSaving(false); }
  };

  const deleteAnnouncement = async (id: number) => {
    if (!confirm("Hapus pengumuman ini?")) return;
    try { await informasiApi.deletePengumuman(String(id)); await reloadData(); }
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
      await reloadData();
      setFaqModalOpen(false);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally { setSaving(false); }
  };

  const deleteFaq = async (id: number) => {
    if (!confirm("Hapus FAQ ini?")) return;
    try { await informasiApi.deleteFaq(String(id)); await reloadData(); }
    catch (err: unknown) { alert(err instanceof Error ? err.message : "Gagal menghapus"); }
  };

  return (
    <div className="w-full min-h-screen bg-[#F5F0E8] font-sans text-slate-800">

      <div className="space-y-[18px] p-4 md:p-6">
        {/* Error */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 flex justify-between">
            <span>⚠️ {error} — Pastikan backend berjalan di <code>http://localhost:3001</code></span>
            <button onClick={reloadData} className="underline">Coba Lagi</button>
          </div>
        )}

        <InformationStatsSection
          loading={loading}
          activeAnnouncements={activeAnnouncements}
          faqCount={faqs.length}
          hours={hours}
        />

        <OperatingHoursSection
          hours={hours}
          saving={saving}
          hoursSaved={hoursSaved}
          onChange={setHours}
          onSave={saveHours}
        />

        <AnnouncementsSection
          loading={loading}
          announcements={announcements}
          onAdd={() => openAnnouncement()}
          onEdit={openAnnouncement}
          onDelete={deleteAnnouncement}
        />
        <FaqSection
          loading={loading}
          faqs={faqs}
          onAdd={() => openFaq()}
          onEdit={openFaq}
          onDelete={deleteFaq}
        />
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