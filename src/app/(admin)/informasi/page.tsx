import type { Metadata } from "next";
import InfoCenter from "@/components/admin/InfoCenter";

export const metadata: Metadata = {
  title: "Pusat Informasi — Admin Museum Brawijaya",
};

export default function PusatInformasiPage() {
  return <InfoCenter />;
}
