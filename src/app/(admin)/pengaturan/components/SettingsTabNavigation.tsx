import { Bell, Clock3, LockKeyhole, Users, type LucideIcon } from "lucide-react";

export type SettingsTab = "profile" | "hours" | "security" | "notifications";

const tabs: { id: SettingsTab; label: string; icon: LucideIcon }[] = [
  { id: "profile", label: "Profil & Akun", icon: Users },
  { id: "hours", label: "Jam Operasional & Tiket", icon: Clock3 },
  { id: "security", label: "Keamanan & Sandi", icon: LockKeyhole },
  { id: "notifications", label: "Notifikasi", icon: Bell },
];

interface SettingsTabNavigationProps {
  activeTab: SettingsTab;
  onChange: (tab: SettingsTab) => void;
}

export default function SettingsTabNavigation({
  activeTab,
  onChange,
}: SettingsTabNavigationProps) {
  return (
    <nav className="flex gap-5 overflow-x-auto border-b border-slate-200" aria-label="Pengaturan">
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={`flex shrink-0 items-center gap-1.5 border-b-2 px-1 py-3 text-[10px] font-bold uppercase tracking-wide ${activeTab === id ? "border-[#2D3E33] text-[#2D3E33]" : "border-transparent text-slate-400 hover:text-slate-700"}`}
        >
          <Icon size={12} fill={id === "profile" || id === "notifications" ? "currentColor" : "none"} />
          {label}
        </button>
      ))}
    </nav>
  );
}
