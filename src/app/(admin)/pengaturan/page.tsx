import type { Metadata } from "next";
import SettingsCenter from "@/components/admin/SettingsCenter";

export const metadata: Metadata = {
  title: "Pengaturan — Admin Museum Brawijaya",
};

export default function PengaturanPage() {
  return <SettingsCenter />;
}
