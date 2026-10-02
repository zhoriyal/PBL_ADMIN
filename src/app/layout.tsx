import type { Metadata } from "next";
import { EB_Garamond } from "next/font/google";
import "./globals.css";

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Admin Login — Sistem Pengelola Museum Brawijaya Malang",
  description: "Halaman login admin untuk Sistem Pengelola Museum Brawijaya Malang.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={ebGaramond.variable}>
      <body>{children}</body>
    </html>
  );
}
