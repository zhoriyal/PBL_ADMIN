"use client";

import { useState, type FormEvent } from "react";
import {
  Bell,
  Camera,
  Clock3,
  LockKeyhole,
  Save,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";

type SettingsTab = "profile" | "hours" | "security" | "notifications";

const tabs: { id: SettingsTab; label: string; icon: typeof User }[] = [
  { id: "profile", label: "Profil & Akun", icon: Users },
  { id: "hours", label: "Jam Operasional & Tiket", icon: Clock3 },
  { id: "security", label: "Keamanan & Sandi", icon: LockKeyhole },
  { id: "notifications", label: "Notifikasi", icon: Bell },
];

const fieldClass = "mt-1.5 h-8 w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-[11px] font-normal text-slate-700 outline-none focus:border-slate-400";
const panelClass = "rounded-xl border border-slate-200/80 bg-white shadow-sm";

export default function SettingsCenter() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState({
    name: "Pandu Aji Setiawan",
    role: "Kepala Administrator Sistem",
    email: "admin@museum.brawijaya.or.id",
    phone: "+62 812-3456-7890",
    capacity: "1000",
    status: "Buka Normal",
    openingDays: "Selasa - Minggu (Senin Libur)",
    openingHours: "08:00 - 15:00 WIB",
    ticketPrice: "10000",
  });
  const [security, setSecurity] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [notifications, setNotifications] = useState({ reviews: true, bookings: true, announcements: false, system: true });

  const saveSettings = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  const updateProfile = (key: keyof typeof profile, value: string) => {
    setProfile((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className="-mx-4 -mt-4 min-h-screen bg-[#F5F0E8] font-sans text-slate-800 md:-mx-6 md:-mt-6">
      <header className="flex min-h-[46px] items-center justify-between border-b border-slate-100 bg-white px-5 md:px-6">
        <div>
          <h1 className="text-sm font-bold uppercase leading-tight text-slate-800">Pengaturan Sistem</h1>
          <p className="text-xs leading-tight text-slate-400">Kelola profil pengelola, konfigurasi operasional, dan keamanan sistem museum</p>
        </div>
        <div className="flex shrink-0 items-center gap-3 md:gap-5">
          <button aria-label="Notifikasi" className="relative text-slate-700"><Bell size={15} fill="currentColor" /><span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-red-500" /></button>
          <div className="flex items-center gap-2"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-white"><User size={13} fill="currentColor" /></span><span className="text-xs font-bold">ADMIN</span></div>
        </div>
      </header>

      <div className="px-4 md:px-6">
        <nav className="flex gap-5 overflow-x-auto border-b border-slate-200" aria-label="Pengaturan">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)} className={`flex shrink-0 items-center gap-1.5 border-b-2 px-1 py-3 text-[10px] font-bold uppercase tracking-wide ${activeTab === id ? "border-[#2D3E33] text-[#2D3E33]" : "border-transparent text-slate-400 hover:text-slate-700"}`}>
              <Icon size={12} fill={id === "profile" || id === "notifications" ? "currentColor" : "none"} />{label}
            </button>
          ))}
        </nav>

        {activeTab === "profile" && (
          <div className="grid grid-cols-1 gap-4 py-4 lg:grid-cols-[220px_minmax(0,1fr)]">
            <section className={`${panelClass} px-4 py-5`}>
              <div className="flex flex-col items-center text-center">
                <div className="relative flex h-[72px] w-[72px] items-center justify-center rounded-full border-[3px] border-amber-100 bg-slate-900 text-white shadow-sm"><User size={30} fill="currentColor" /><button aria-label="Ubah foto profil" className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#2D3E33] text-white"><Camera size={11} /></button></div>
                <h2 className="mt-3 text-sm font-bold">Administrator Utama</h2>
                <p className="text-[10px] text-slate-400">{profile.email}</p>
                <span className="mt-2 rounded-full bg-amber-100 px-2.5 py-1 text-[8px] font-bold uppercase text-amber-800">Super Admin</span>
              </div>
              <div className="mt-4 space-y-2.5 border-t border-slate-100 pt-4 text-[10px]">
                <p className="flex justify-between gap-2"><span className="text-slate-400">ID Pengelola:</span><strong>ADM-MBW-01</strong></p>
                <p className="flex justify-between gap-2"><span className="text-slate-400">Terakhir Login:</span><strong>Hari ini, 11:34 WIB</strong></p>
                <p className="flex justify-between gap-2"><span className="text-slate-400">Status Akun:</span><strong className="text-emerald-600">Aktif</strong></p>
              </div>
            </section>

            <form onSubmit={saveSettings} className={`${panelClass} p-4`}>
              <div className="border-b border-slate-100 pb-3"><h2 className="text-[11px] font-bold uppercase">Informasi Akun & Pengelola</h2><p className="text-[9px] text-slate-400">Perbarui data diri dan kontak resmi pengelola museum</p></div>
              <div className="mt-3 grid grid-cols-1 gap-x-3 gap-y-2.5 sm:grid-cols-2">
                <label className="text-[9px] font-semibold">Nama Lengkap Admin<input value={profile.name} onChange={(event) => updateProfile("name", event.target.value)} className={fieldClass} /></label>
                <label className="text-[9px] font-semibold">Jabatan / Peran<input value={profile.role} onChange={(event) => updateProfile("role", event.target.value)} className={fieldClass} /></label>
                <label className="text-[9px] font-semibold">Alamat Email Resmi<input type="email" value={profile.email} onChange={(event) => updateProfile("email", event.target.value)} className={fieldClass} /></label>
                <label className="text-[9px] font-semibold">Nomor Telepon / WhatsApp<input value={profile.phone} onChange={(event) => updateProfile("phone", event.target.value)} className={fieldClass} /></label>
              </div>
              <div className="mt-3 border-t border-slate-100 pt-3"><h3 className="text-[10px] font-bold uppercase">Pengaturan Kuota & Operasional Ringkas</h3></div>
              <div className="mt-2 grid grid-cols-1 gap-x-3 gap-y-2.5 sm:grid-cols-2">
                <label className="text-[9px] font-semibold">Kapasitas Maksimal Pengunjung / Hari<input type="number" min="1" value={profile.capacity} onChange={(event) => updateProfile("capacity", event.target.value)} className={fieldClass} /></label>
                <label className="text-[9px] font-semibold">Status Operasional Museum<input value={profile.status} onChange={(event) => updateProfile("status", event.target.value)} className={fieldClass} /></label>
              </div>
              <div className="mt-3 flex justify-end gap-2 border-t border-slate-100 pt-3"><button type="button" onClick={() => setProfile({ name: "Pandu Aji Setiawan", role: "Kepala Administrator Sistem", email: "admin@museum.brawijaya.or.id", phone: "+62 812-3456-7890", capacity: "1000", status: "Buka Normal", openingDays: "Selasa - Minggu (Senin Libur)", openingHours: "08:00 - 15:00 WIB", ticketPrice: "10000" })} className="rounded-lg border border-slate-200 px-3 py-1.5 text-[9px] font-semibold text-slate-600">Batal</button><button type="submit" className="flex items-center gap-1 rounded-lg bg-[#2D3E33] px-3 py-1.5 text-[9px] font-semibold text-white"><Save size={11} />{saved ? "Tersimpan" : "Simpan Perubahan"}</button></div>
            </form>
          </div>
        )}

        {activeTab === "hours" && (
          <form onSubmit={saveSettings} className={`${panelClass} my-4 max-w-3xl p-4`}>
            <div className="mb-4 border-b border-slate-100 pb-3"><h2 className="text-sm font-bold uppercase">Jam Operasional & Tiket</h2><p className="text-xs text-slate-400">Atur jadwal kunjungan dan harga tiket museum</p></div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="text-xs font-semibold">Hari Operasional<input value={profile.openingDays} onChange={(event) => updateProfile("openingDays", event.target.value)} className={fieldClass} /></label>
              <label className="text-xs font-semibold">Jam Buka - Tutup<input value={profile.openingHours} onChange={(event) => updateProfile("openingHours", event.target.value)} className={fieldClass} /></label>
              <label className="text-xs font-semibold">Kapasitas Pengunjung / Hari<input type="number" value={profile.capacity} onChange={(event) => updateProfile("capacity", event.target.value)} className={fieldClass} /></label>
              <label className="text-xs font-semibold">Harga Tiket Reguler<input type="number" value={profile.ticketPrice} onChange={(event) => updateProfile("ticketPrice", event.target.value)} className={fieldClass} /></label>
            </div>
            <div className="mt-4 flex justify-end"><button type="submit" className="flex items-center gap-1 rounded-lg bg-[#2D3E33] px-3 py-2 text-xs font-semibold text-white"><Save size={13} />{saved ? "Tersimpan" : "Simpan Perubahan"}</button></div>
          </form>
        )}

        {activeTab === "security" && (
          <form onSubmit={(event) => { event.preventDefault(); setSecurity({ currentPassword: "", newPassword: "", confirmPassword: "" }); setSaved(true); window.setTimeout(() => setSaved(false), 2000); }} className={`${panelClass} my-4 max-w-xl p-4`}>
            <div className="mb-4 border-b border-slate-100 pb-3"><h2 className="text-sm font-bold uppercase">Keamanan & Sandi</h2><p className="text-xs text-slate-400">Perbarui kata sandi untuk menjaga keamanan akun</p></div>
            <div className="space-y-3"><label className="block text-xs font-semibold">Kata Sandi Saat Ini<input required type="password" value={security.currentPassword} onChange={(event) => setSecurity({ ...security, currentPassword: event.target.value })} className={fieldClass} /></label><label className="block text-xs font-semibold">Kata Sandi Baru<input required minLength={8} type="password" value={security.newPassword} onChange={(event) => setSecurity({ ...security, newPassword: event.target.value })} className={fieldClass} /></label><label className="block text-xs font-semibold">Konfirmasi Kata Sandi Baru<input required minLength={8} type="password" value={security.confirmPassword} onChange={(event) => setSecurity({ ...security, confirmPassword: event.target.value })} className={fieldClass} /></label></div>
            <div className="mt-4 flex justify-end"><button type="submit" disabled={!security.newPassword || security.newPassword !== security.confirmPassword} className="flex items-center gap-1 rounded-lg bg-[#2D3E33] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"><ShieldCheck size={13} />{saved ? "Tersimpan" : "Perbarui Sandi"}</button></div>
          </form>
        )}

        {activeTab === "notifications" && (
          <form onSubmit={saveSettings} className={`${panelClass} my-4 max-w-2xl p-4`}>
            <div className="mb-3 border-b border-slate-100 pb-3"><h2 className="text-sm font-bold uppercase">Preferensi Notifikasi</h2><p className="text-xs text-slate-400">Pilih notifikasi yang ingin diterima oleh admin</p></div>
            <div className="divide-y divide-slate-100">
              {([["reviews", "Ulasan pengunjung", "Pemberitahuan saat ada ulasan atau masukan baru."], ["bookings", "Pemesanan tiket", "Pemberitahuan transaksi dan pemesanan tiket."], ["announcements", "Pengumuman", "Pengingat untuk agenda dan pengumuman museum."], ["system", "Keamanan sistem", "Pemberitahuan penting mengenai akun dan sistem."]] as const).map(([key, label, description]) => (
                <label key={key} className="flex cursor-pointer items-center justify-between gap-4 py-3"><span><span className="block text-xs font-semibold">{label}</span><span className="text-[11px] text-slate-400">{description}</span></span><input type="checkbox" checked={notifications[key]} onChange={(event) => setNotifications({ ...notifications, [key]: event.target.checked })} className="h-4 w-4 accent-[#2D3E33]" /></label>
              ))}
            </div>
            <div className="mt-3 flex justify-end border-t border-slate-100 pt-3"><button type="submit" className="flex items-center gap-1 rounded-lg bg-[#2D3E33] px-3 py-2 text-xs font-semibold text-white"><Save size={13} />{saved ? "Tersimpan" : "Simpan Perubahan"}</button></div>
          </form>
        )}
      </div>
    </div>
  );
}