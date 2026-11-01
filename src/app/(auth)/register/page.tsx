import RegisterForm from "./components/RegisterForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daftar Akun Pengelola — Museum Brawijaya Malang",
  description: "Pendaftaran akun petugas dan pengelola Museum Brawijaya Malang.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}

