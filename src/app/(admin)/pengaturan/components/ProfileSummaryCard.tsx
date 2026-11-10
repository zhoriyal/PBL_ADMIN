import { Camera, User } from "lucide-react";

export default function ProfileSummaryCard({ email }: { email: string }) {
  return (
    <section className="rounded-xl border border-slate-200/80 bg-white px-4 py-5 shadow-sm">
      <div className="flex flex-col items-center text-center">
        <div className="relative flex h-[72px] w-[72px] items-center justify-center rounded-full border-[3px] border-amber-100 bg-slate-900 text-white shadow-sm">
          <User size={30} fill="currentColor" />
          <button type="button" aria-label="Ubah foto profil" className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#2D3E33] text-white">
            <Camera size={11} />
          </button>
        </div>
        <h2 className="mt-3 text-sm font-bold">Administrator Utama</h2>
        <p className="text-[10px] text-slate-400">{email}</p>
        <span className="mt-2 rounded-full bg-amber-100 px-2.5 py-1 text-[8px] font-bold uppercase text-amber-800">Super Admin</span>
      </div>
      <div className="mt-4 space-y-2.5 border-t border-slate-100 pt-4 text-[10px]">
        <p className="flex justify-between gap-2"><span className="text-slate-400">ID Pengelola:</span><strong>ADM-MBW-01</strong></p>
        <p className="flex justify-between gap-2"><span className="text-slate-400">Terakhir Login:</span><strong>Hari ini, 11:34 WIB</strong></p>
        <p className="flex justify-between gap-2"><span className="text-slate-400">Status Akun:</span><strong className="text-emerald-600">Aktif</strong></p>
      </div>
    </section>
  );
}
