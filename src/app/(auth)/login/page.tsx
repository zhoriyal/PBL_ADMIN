import LoginForm from "@/components/login/LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login Admin — Sistem Pengelola Museum Brawijaya Malang",
  description: "Halaman login admin untuk Sistem Pengelola Museum Brawijaya Malang.",
};

export default function LoginPage() {
  return <LoginForm />;
}
