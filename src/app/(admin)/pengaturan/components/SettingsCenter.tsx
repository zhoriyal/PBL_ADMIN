"use client";

import { useState, type FormEvent } from "react";
import { Save, ShieldCheck } from "lucide-react";
import {
  sanitizeDigitsOnly,
  sanitizeLettersOnly,
  isValidDigitsOnly,
  isValidLettersOnly,
} from "@/lib/inputValidation";
import SettingsTabNavigation, { type SettingsTab } from "./SettingsTabNavigation";
import ProfileSummaryCard from "./ProfileSummaryCard";

const fieldClass =
  "mt-1.5 h-8 w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-[11px] font-normal text-slate-700 outline-none focus:border-slate-400";
const panelClass = "rounded-xl border border-slate-200/80 bg-white shadow-sm";

const DEFAULT_PROFILE = {
  name: "Pandu Aji Setiawan",
  role: "Kepala Administrator Sistem",
  email: "admin@museum.brawijaya.or.id",
  phone: "081234567890",
  capacity: "1000",
  status: "Buka Normal",
};

const isValidEmail = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const parsePositiveInt = (value: string): number => {
  const trimmed = (value ?? "").trim();
  if (!trimmed || !isValidDigitsOnly(trimmed)) return Number.NaN;
  return Number(trimmed);
};

export default function SettingsCenter() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [saved, setSaved] = useState(false);
  const [formError, setFormError] = useState("");
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [notifications, setNotifications] = useState({
    reviews: true,
    bookings: true,
    announcements: false,
    system: true,
  });

  const triggerSavedBanner = () => {
    setFormError("");
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  const updateProfile = (key: keyof typeof profile, value: string) => {
    const sanitizedValue =
      key === "name" || key === "role" || key === "status"
        ? sanitizeLettersOnly(value)
        : key === "phone" || key === "capacity"
          ? sanitizeDigitsOnly(value)
          : value;

    setProfile((current) => ({ ...current, [key]: sanitizedValue }));
    if (formError) setFormError("");
  };

  const handleTabChange = (tab: SettingsTab) => {
    setActiveTab(tab);
    setFormError("");
    setSaved(false);
  };

  const saveProfileSettings = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = (profile.name || "").trim();
    const trimmedRole = (profile.role || "").trim();
    const trimmedEmail = (profile.email || "").trim();
    const trimmedPhone = (profile.phone || "").trim();
    const trimmedStatus = (profile.status || "").trim();
    const parsedCapacity = parsePositiveInt(profile.capacity);

    if (!isValidLettersOnly(trimmedName) || trimmedName.length < 2) {
      setFormError("Nama lengkap admin hanya boleh berisi huruf (minimal 2 karakter).");
      return;
    }
    if (!isValidLettersOnly(trimmedRole)) {
      setFormError("Jabatan / peran hanya boleh berisi huruf.");
      return;
    }
    if (!trimmedEmail || !isValidEmail(trimmedEmail)) {
      setFormError("Format alamat email resmi tidak valid.");
      return;
    }
    if (!isValidDigitsOnly(trimmedPhone)) {
      setFormError("Nomor telepon / WhatsApp hanya boleh berisi angka.");
      return;
    }
    if (!Number.isInteger(parsedCapacity) || parsedCapacity < 1) {
      setFormError("Kapasitas maksimal pengunjung per hari hanya boleh berisi angka minimal 1.");
      return;
    }
    if (!isValidLettersOnly(trimmedStatus)) {
      setFormError("Status operasional museum hanya boleh berisi huruf.");
      return;
    }

    setProfile((current) => ({
      ...current,
      name: trimmedName,
      role: trimmedRole,
      email: trimmedEmail,
      phone: trimmedPhone,
      capacity: String(parsedCapacity),
      status: trimmedStatus,
    }));
    triggerSavedBanner();
  };

  const saveSecuritySettings = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const currentPwd = (security.currentPassword || "").trim();
    const newPwd = (security.newPassword || "").trim();
    const confirmPwd = (security.confirmPassword || "").trim();

    if (!currentPwd) {
      setFormError("Kata sandi saat ini wajib diisi.");
      return;
    }
    if (newPwd.length < 8) {
      setFormError("Kata sandi baru minimal 8 karakter.");
      return;
    }
    if (newPwd !== confirmPwd) {
      setFormError("Konfirmasi kata sandi baru tidak cocok.");
      return;
    }

    setSecurity({ currentPassword: "", newPassword: "", confirmPassword: "" });
    triggerSavedBanner();
  };

  const saveNotificationSettings = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    triggerSavedBanner();
  };

  return (
    <div className="min-h-screen w-full bg-[#F5F0E8] font-sans text-slate-800">
      <div className="px-4 md:px-6">
        <SettingsTabNavigation activeTab={activeTab} onChange={handleTabChange} />

        {formError && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-medium text-red-700"
          >
            {formError}
          </div>
        )}

        {saved && !formError && (
          <div
            role="status"
            className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-800"
          >
            Perubahan pengaturan berhasil disimpan.
          </div>
        )}

        {activeTab === "profile" && (
          <div className="grid grid-cols-1 gap-4 py-4 lg:grid-cols-[220px_minmax(0,1fr)]">
            <ProfileSummaryCard email={profile.email} />

            <form onSubmit={saveProfileSettings} noValidate className={`${panelClass} p-4`}>
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-[11px] font-bold uppercase">
                  Informasi Akun & Pengelola
                </h2>
                <p className="text-[9px] text-slate-400">
                  Perbarui data diri dan kontak resmi pengelola museum
                </p>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-x-3 gap-y-2.5 sm:grid-cols-2">
                <label className="text-[9px] font-semibold">
                  Nama Lengkap Admin
                  <input
                    value={profile.name}
                    onChange={(event) => updateProfile("name", event.target.value)}
                    className={fieldClass}
                  />
                </label>
                <label className="text-[9px] font-semibold">
                  Jabatan / Peran
                  <input
                    value={profile.role}
                    onChange={(event) => updateProfile("role", event.target.value)}
                    className={fieldClass}
                  />
                </label>
                <label className="text-[9px] font-semibold">
                  Alamat Email Resmi
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(event) => updateProfile("email", event.target.value)}
                    className={fieldClass}
                  />
                </label>
                <label className="text-[9px] font-semibold">
                  Nomor Telepon / WhatsApp
                  <input
                    inputMode="tel"
                    value={profile.phone}
                    onChange={(event) => updateProfile("phone", event.target.value)}
                    className={fieldClass}
                  />
                </label>
              </div>
              <div className="mt-3 border-t border-slate-100 pt-3">
                <h3 className="text-[10px] font-bold uppercase">
                  Pengaturan Kuota & Operasional Ringkas
                </h3>
              </div>
              <div className="mt-2 grid grid-cols-1 gap-x-3 gap-y-2.5 sm:grid-cols-2">
                <label className="text-[9px] font-semibold">
                  Kapasitas Maksimal Pengunjung / Hari
                  <input
                    type="text"
                    inputMode="numeric"
                    value={profile.capacity}
                    onChange={(event) => updateProfile("capacity", event.target.value)}
                    className={fieldClass}
                  />
                </label>
                <label className="text-[9px] font-semibold">
                  Status Operasional Museum
                  <input
                    value={profile.status}
                    onChange={(event) => updateProfile("status", event.target.value)}
                    className={fieldClass}
                  />
                </label>
              </div>
              <div className="mt-3 flex justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setProfile(DEFAULT_PROFILE);
                    setFormError("");
                  }}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-[9px] font-semibold text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1 rounded-lg bg-[#2D3E33] px-3 py-1.5 text-[9px] font-semibold text-white"
                >
                  <Save size={11} />
                  {saved ? "Tersimpan" : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === "security" && (
          <form
            onSubmit={saveSecuritySettings}
            noValidate
            className={`${panelClass} my-4 max-w-xl p-4`}
          >
            <div className="mb-4 border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold uppercase">Keamanan & Sandi</h2>
              <p className="text-xs text-slate-400">
                Perbarui kata sandi untuk menjaga keamanan akun
              </p>
            </div>
            <div className="space-y-3">
              <label className="block text-xs font-semibold">
                Kata Sandi Saat Ini
                <input
                  type="password"
                  value={security.currentPassword}
                  onChange={(event) => {
                    setSecurity({ ...security, currentPassword: event.target.value });
                    if (formError) setFormError("");
                  }}
                  className={fieldClass}
                />
              </label>
              <label className="block text-xs font-semibold">
                Kata Sandi Baru
                <input
                  type="password"
                  value={security.newPassword}
                  onChange={(event) => {
                    setSecurity({ ...security, newPassword: event.target.value });
                    if (formError) setFormError("");
                  }}
                  className={fieldClass}
                />
              </label>
              <label className="block text-xs font-semibold">
                Konfirmasi Kata Sandi Baru
                <input
                  type="password"
                  value={security.confirmPassword}
                  onChange={(event) => {
                    setSecurity({ ...security, confirmPassword: event.target.value });
                    if (formError) setFormError("");
                  }}
                  className={fieldClass}
                />
              </label>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-1 rounded-lg bg-[#2D3E33] px-3 py-2 text-xs font-semibold text-white"
              >
                <ShieldCheck size={13} />
                {saved ? "Tersimpan" : "Perbarui Sandi"}
              </button>
            </div>
          </form>
        )}

        {activeTab === "notifications" && (
          <form
            onSubmit={saveNotificationSettings}
            noValidate
            className={`${panelClass} my-4 max-w-2xl p-4`}
          >
            <div className="mb-3 border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold uppercase">
                Preferensi Notifikasi
              </h2>
              <p className="text-xs text-slate-400">
                Pilih notifikasi yang ingin diterima oleh admin
              </p>
            </div>
            <div className="divide-y divide-slate-100">
              {(
                [
                  [
                    "reviews",
                    "Ulasan pengunjung",
                    "Pemberitahuan saat ada ulasan atau masukan baru.",
                  ],
                  [
                    "bookings",
                    "Pemesanan tiket",
                    "Pemberitahuan transaksi dan pemesanan tiket.",
                  ],
                  [
                    "announcements",
                    "Pengumuman",
                    "Pengingat untuk agenda dan pengumuman museum.",
                  ],
                  [
                    "system",
                    "Keamanan sistem",
                    "Pemberitahuan penting mengenai akun dan sistem.",
                  ],
                ] as const
              ).map(([key, label, description]) => (
                <label
                  key={key}
                  className="flex cursor-pointer items-center justify-between gap-4 py-3"
                >
                  <span>
                    <span className="block text-xs font-semibold">{label}</span>
                    <span className="text-[11px] text-slate-400">
                      {description}
                    </span>
                  </span>
                  <input
                    type="checkbox"
                    checked={notifications[key]}
                    onChange={(event) =>
                      setNotifications({
                        ...notifications,
                        [key]: event.target.checked,
                      })
                    }
                    className="h-4 w-4 accent-[#2D3E33]"
                  />
                </label>
              ))}
            </div>
            <div className="mt-3 flex justify-end border-t border-slate-100 pt-3">
              <button
                type="submit"
                className="flex items-center gap-1 rounded-lg bg-[#2D3E33] px-3 py-2 text-xs font-semibold text-white"
              >
                <Save size={13} />
                {saved ? "Tersimpan" : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}