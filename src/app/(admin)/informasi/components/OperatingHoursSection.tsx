import { Save } from "lucide-react";
import type { JamOperasional } from "./types";

interface OperatingHoursSectionProps {
  hours: JamOperasional;
  saving: boolean;
  hoursSaved: boolean;
  onChange: (hours: JamOperasional) => void;
  onSave: () => void;
}

const inputClass = "mt-1.5 h-8 w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-[11px] text-slate-700 outline-none focus:border-slate-400";
const sectionClass = "overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm";

export default function OperatingHoursSection({
  hours,
  saving,
  hoursSaved,
  onChange,
  onSave,
}: OperatingHoursSectionProps) {
  return (
    <section className={`${sectionClass} p-4`}>
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-sm font-bold uppercase">Jam Operasional & Kontak Kunjungan</h2>
          <p className="text-xs text-slate-400">Atur informasi operasional yang ditampilkan pada halaman utama</p>
        </div>
        <button onClick={onSave} disabled={saving} className="flex items-center gap-1.5 rounded-lg bg-[#2D3E33] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#233128] disabled:opacity-60">
          <Save size={13} />{saving ? "Menyimpan..." : hoursSaved ? "✓ Tersimpan" : "Simpan Perubahan"}
        </button>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="text-[11px] font-semibold">Hari Operasional
          <input value={hours.hari} onChange={(event) => onChange({ ...hours, hari: event.target.value })} className={inputClass} />
        </label>
        <label className="text-[11px] font-semibold">Jam Buka - Tutup
          <input value={hours.jam} onChange={(event) => onChange({ ...hours, jam: event.target.value })} className={inputClass} />
        </label>
        <label className="text-[11px] font-semibold">Nomor Telepon / Hotline
          <input value={hours.telepon} onChange={(event) => onChange({ ...hours, telepon: event.target.value })} className={inputClass} />
        </label>
      </div>
    </section>
  );
}
