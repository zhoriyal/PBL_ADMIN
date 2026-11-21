"use client";

import { useState, useEffect, useCallback, type FormEvent, type ReactNode } from "react";
import { ApiNetworkError, informasiApi } from "@/lib/api";
import AnnouncementsSection from "./AnnouncementsSection";
import FaqSection from "./FaqSection";
import InformationStatsSection from "./InformationStatsSection";
import OperatingHoursSection from "./OperatingHoursSection";
import type { Announcement, FaqItem, JamOperasional } from "./types";

const VALID_CATEGORIES = ["Informasi Umum", "Agenda Event", "Pemeliharaan"] as const;
const VALID_ANNOUNCEMENT_STATUSES: Announcement["status"][] = ["AKTIF", "ARSIP"];

const inputClass =
  "mt-1.5 h-8 w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-[11px] text-slate-700 outline-none focus:border-slate-400";

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
      onClick={onClose}
    >
      <section
        className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-lg leading-none text-slate-400 hover:text-slate-700"
          >
            ×
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

const validateAnnouncementForm = (input: {
  title: string;
  description: string;
  category: string;
  date: string;
  status: string;
}): string => {
  const trimmedTitle = (input.title || "").trim();
  const trimmedDate = (input.date || "").trim();

  if (!trimmedTitle) {
    return "Judul pengumuman wajib diisi.";
  }
  if (trimmedTitle.length < 3) {
    return "Judul pengumuman minimal 3 karakter.";
  }
  if (!VALID_CATEGORIES.includes(input.category as (typeof VALID_CATEGORIES)[number])) {
    return "Kategori pengumuman tidak valid.";
  }
  if (!trimmedDate) {
    return "Tanggal rilis pengumuman wajib diisi.";
  }
  if (!VALID_ANNOUNCEMENT_STATUSES.includes(input.status as Announcement["status"])) {
    return "Status pengumuman tidak valid.";
  }
  return "";
};

const validateFaqForm = (input: { question: string; answer: string }): string => {
  const trimmedQuestion = (input.question || "").trim();
  const trimmedAnswer = (input.answer || "").trim();

  if (!trimmedQuestion) {
    return "Pertanyaan FAQ wajib diisi.";
  }
  if (trimmedQuestion.length < 3) {
    return "Pertanyaan FAQ minimal 3 karakter.";
  }
  if (!trimmedAnswer) {
    return "Jawaban FAQ wajib diisi.";
  }
  if (trimmedAnswer.length < 3) {
    return "Jawaban FAQ minimal 3 karakter.";
  }
  return "";
};

const validateOperatingHours = (input: JamOperasional): string => {
  if (!(input.hari || "").trim()) {
    return "Hari operasional wajib diisi.";
  }
  if (!(input.jam || "").trim()) {
    return "Jam operasional wajib diisi.";
  }
  if (!(input.telepon || "").trim()) {
    return "Nomor telepon / kontak informasi wajib diisi.";
  }
  return "";
};

export default function InfoCenter() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [hours, setHours] = useState<JamOperasional>({
    hari: "Selasa - Minggu (Senin Libur)",
    jam: "08:00 - 15:00 WIB",
    telepon: "(0341) 551502",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hoursSaved, setHoursSaved] = useState(false);

  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    description: "",
    category: "Informasi Umum",
    date: "",
    status: "AKTIF" as Announcement["status"],
  });
  const [announcementError, setAnnouncementError] = useState("");

  const [faqForm, setFaqForm] = useState({ question: "", answer: "" });
  const [faqError, setFaqError] = useState("");

  const [editingAnnouncement, setEditingAnnouncement] = useState<number | null>(null);
  const [editingFaq, setEditingFaq] = useState<number | null>(null);
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(
    () =>
      Promise.resolve()
        .then(() =>
          Promise.all([
            informasiApi.getPengumuman(),
            informasiApi.getFaq(),
            informasiApi.getJamOperasional(),
          ])
        )
        .then(([pRes, fRes, jRes]) => {
          setAnnouncements(Array.isArray(pRes?.data) ? pRes.data : []);
          setFaqs(Array.isArray(fRes?.data) ? fRes.data : []);
          if (jRes?.data) {
            setHours({
              hari: jRes.data.hari ?? "",
              jam: jRes.data.jam ?? "",
              telepon: jRes.data.telepon ?? "",
            });
          }
        })
        .catch((err: unknown) => {
          if (err instanceof ApiNetworkError) {
            setError("Backend tidak dapat dijangkau. Pastikan server backend sudah menyala.");
          } else if (err instanceof Error) {
            if (err.message.includes("belum dikonfigurasi")) {
              setError("URL backend belum dikonfigurasi (NEXT_PUBLIC_API_URL).");
            } else {
              setError(`Gagal memuat data pusat informasi: ${err.message}`);
            }
          } else {
            setError("Gagal memuat data pusat informasi.");
          }
        })
        .finally(() => {
          setLoading(false);
        }),
    []
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const reloadData = async () => {
    setLoading(true);
    setError("");
    await fetchData();
  };

  const activeAnnouncements = announcements.filter((a) => a.status === "AKTIF").length;

  const saveHours = async () => {
    const trimmedHours: JamOperasional = {
      hari: (hours.hari || "").trim(),
      jam: (hours.jam || "").trim(),
      telepon: (hours.telepon || "").trim(),
    };
    const validationMsg = validateOperatingHours(trimmedHours);
    if (validationMsg) {
      setError(validationMsg);
      return;
    }

    setError("");
    setSaving(true);
    try {
      await informasiApi.updateJamOperasional(trimmedHours);
      setHours(trimmedHours);
      setHoursSaved(true);
      setTimeout(() => setHoursSaved(false), 2500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan jam operasional");
    } finally {
      setSaving(false);
    }
  };

  const openAnnouncement = (item?: Announcement) => {
    setAnnouncementError("");
    setEditingAnnouncement(item?.id ?? null);
    setAnnouncementForm(
      item
        ? {
            title: item.title ?? "",
            description: item.description ?? "",
            category: item.category || "Informasi Umum",
            date: item.date ?? "",
            status: item.status || "AKTIF",
          }
        : {
            title: "",
            description: "",
            category: "Informasi Umum",
            date: "",
            status: "AKTIF",
          }
    );
    setAnnouncementModalOpen(true);
  };

  const saveAnnouncement = async (e: FormEvent) => {
    e.preventDefault();
    setAnnouncementError("");

    const validationMsg = validateAnnouncementForm(announcementForm);
    if (validationMsg) {
      setAnnouncementError(validationMsg);
      return;
    }

    const payload = {
      ...announcementForm,
      title: announcementForm.title.trim(),
      description: announcementForm.description.trim(),
      date: announcementForm.date.trim(),
    };

    setSaving(true);
    try {
      if (editingAnnouncement !== null) {
        await informasiApi.updatePengumuman(String(editingAnnouncement), payload);
      } else {
        await informasiApi.addPengumuman(payload);
      }
      await reloadData();
      setAnnouncementModalOpen(false);
      setAnnouncementError("");
    } catch (err: unknown) {
      setAnnouncementError(err instanceof Error ? err.message : "Gagal menyimpan pengumuman.");
    } finally {
      setSaving(false);
    }
  };

  const deleteAnnouncement = async (id: number) => {
    if (!confirm("Hapus pengumuman ini?")) return;
    try {
      await informasiApi.deletePengumuman(String(id));
      await reloadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal menghapus pengumuman.");
    }
  };

  const openFaq = (item?: FaqItem) => {
    setFaqError("");
    setEditingFaq(item?.id ?? null);
    setFaqForm(
      item
        ? { question: item.question ?? "", answer: item.answer ?? "" }
        : { question: "", answer: "" }
    );
    setFaqModalOpen(true);
  };

  const saveFaq = async (e: FormEvent) => {
    e.preventDefault();
    setFaqError("");

    const validationMsg = validateFaqForm(faqForm);
    if (validationMsg) {
      setFaqError(validationMsg);
      return;
    }

    const payload = {
      question: faqForm.question.trim(),
      answer: faqForm.answer.trim(),
    };

    setSaving(true);
    try {
      if (editingFaq !== null) {
        await informasiApi.updateFaq(String(editingFaq), payload);
      } else {
        await informasiApi.addFaq(payload);
      }
      await reloadData();
      setFaqModalOpen(false);
      setFaqError("");
    } catch (err: unknown) {
      setFaqError(err instanceof Error ? err.message : "Gagal menyimpan FAQ.");
    } finally {
      setSaving(false);
    }
  };

  const deleteFaq = async (id: number) => {
    if (!confirm("Hapus FAQ ini?")) return;
    try {
      await informasiApi.deleteFaq(String(id));
      await reloadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal menghapus FAQ.");
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F5F0E8] font-sans text-slate-800">
      <div className="space-y-[18px] p-4 md:p-6">
        {/* Error */}
        {error && (
          <div className="flex justify-between rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <span>⚠️ {error}</span>
            <button type="button" onClick={reloadData} className="underline">
              Coba Lagi
            </button>
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
          onChange={(nextHours) => {
            setHours(nextHours);
            if (error) setError("");
          }}
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
        <Modal
          title={editingAnnouncement === null ? "Tambah Pengumuman" : "Edit Pengumuman"}
          onClose={() => {
            setAnnouncementModalOpen(false);
            setAnnouncementError("");
          }}
        >
          {announcementError && (
            <div
              role="alert"
              className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700"
            >
              {announcementError}
            </div>
          )}

          <form onSubmit={saveAnnouncement} noValidate className="space-y-3 text-xs">
            <label className="block font-semibold">
              Judul
              <input
                value={announcementForm.title}
                onChange={(e) => {
                  setAnnouncementForm({ ...announcementForm, title: e.target.value });
                  if (announcementError) setAnnouncementError("");
                }}
                className={inputClass}
              />
            </label>
            <label className="block font-semibold">
              Deskripsi
              <input
                value={announcementForm.description}
                onChange={(e) =>
                  setAnnouncementForm({ ...announcementForm, description: e.target.value })
                }
                className={inputClass}
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block font-semibold">
                Kategori
                <select
                  value={announcementForm.category}
                  onChange={(e) =>
                    setAnnouncementForm({ ...announcementForm, category: e.target.value })
                  }
                  className={inputClass}
                >
                  <option>Informasi Umum</option>
                  <option>Agenda Event</option>
                  <option>Pemeliharaan</option>
                </select>
              </label>
              <label className="block font-semibold">
                Tanggal
                <input
                  value={announcementForm.date}
                  onChange={(e) => {
                    setAnnouncementForm({ ...announcementForm, date: e.target.value });
                    if (announcementError) setAnnouncementError("");
                  }}
                  placeholder="25 Okt 2026"
                  className={inputClass}
                />
              </label>
            </div>
            <label className="block font-semibold">
              Status
              <select
                value={announcementForm.status}
                onChange={(e) =>
                  setAnnouncementForm({
                    ...announcementForm,
                    status: e.target.value as Announcement["status"],
                  })
                }
                className={inputClass}
              >
                <option>AKTIF</option>
                <option>ARSIP</option>
              </select>
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setAnnouncementModalOpen(false);
                  setAnnouncementError("");
                }}
                className="rounded-lg border border-slate-200 px-3 py-2"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-[#2D3E33] px-3 py-2 font-semibold text-white disabled:opacity-60"
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal FAQ */}
      {faqModalOpen && (
        <Modal
          title={editingFaq === null ? "Tambah FAQ" : "Edit FAQ"}
          onClose={() => {
            setFaqModalOpen(false);
            setFaqError("");
          }}
        >
          {faqError && (
            <div
              role="alert"
              className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700"
            >
              {faqError}
            </div>
          )}

          <form onSubmit={saveFaq} noValidate className="space-y-3 text-xs">
            <label className="block font-semibold">
              Pertanyaan
              <input
                value={faqForm.question}
                onChange={(e) => {
                  setFaqForm({ ...faqForm, question: e.target.value });
                  if (faqError) setFaqError("");
                }}
                className={inputClass}
              />
            </label>
            <label className="block font-semibold">
              Jawaban
              <textarea
                value={faqForm.answer}
                onChange={(e) => {
                  setFaqForm({ ...faqForm, answer: e.target.value });
                  if (faqError) setFaqError("");
                }}
                className={`${inputClass} min-h-20 py-2`}
              />
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setFaqModalOpen(false);
                  setFaqError("");
                }}
                className="rounded-lg border border-slate-200 px-3 py-2"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-[#2D3E33] px-3 py-2 font-semibold text-white disabled:opacity-60"
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}