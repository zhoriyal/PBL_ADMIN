import type { Metadata } from "next";
import ReviewCenter from "@/components/admin/ReviewCenter";

export const metadata: Metadata = {
  title: "Ulasan / Feedback — Admin Museum Brawijaya",
};

export default function UlasanFeedbackPage() {
  return <ReviewCenter />;
}
