"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { validateRegisterInput } from "@/lib/validation/auth";

export default function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "STAFF",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setGeneralError("");
    setSuccessMsg("");

    const validationErrors = validateRegisterInput({
      nama: formData.nama,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      const res = await authApi.register({
        nama: formData.nama.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
      });

      if (res && res.success) {
        setSuccessMsg("Pendaftaran akun berhasil! Mengalihkan ke halaman login...");
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      } else {
        setGeneralError(res?.message || "Pendaftaran gagal.");
      }
    } catch (err: any) {
      setGeneralError(err?.message || "Terjadi kesalahan saat pendaftaran akun.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* LEFT PANEL */}
      <div className="login-left">
        <Image
          src="/museum-brawijaya.jpg"
          alt="Museum Brawijaya Malang"
          fill
          style={{ objectFit: "cover", objectPosition: "center" }}
          priority
          sizes="60vw"
        />
        <div className="login-left-overlay" />
        <div className="login-left-caption">
          <p className="label">Pendaftaran Petugas & Staf</p>
          <p className="museum-name">Museum Brawijaya Malang</p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="login-right">
        <div className="login-form-wrapper">
          <div className="badge-wrapper">
            <span className="badge">
              <span className="badge-dot" />
              Registrasi Akun Baru
            </span>
          </div>

          <div className="heading-group">
            <h1 className="title">Buat Akun Pengelola</h1>
            <p className="subtitle">
              Daftarkan akun staf baru untuk mendapatkan hak akses ke sistem administrasi.
            </p>
          </div>

          {generalError && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: "8px",
                background: "#FEF2F2",
                border: "1px solid #FCA5A5",
                color: "#B91C1C",
                fontSize: "12px",
                fontWeight: 500,
                marginBottom: "14px",
              }}
            >
              {generalError}
            </div>
          )}

          {successMsg && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: "8px",
                background: "#ECFDF5",
                border: "1px solid #6EE7B7",
                color: "#065F46",
                fontSize: "12px",
                fontWeight: 500,
                marginBottom: "14px",
              }}
            >
              {successMsg}
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            {/* Nama Field */}
            <div className="field-group">
              <label htmlFor="nama" className="field-label">
                Nama Lengkap
              </label>
              <div className="input-wrapper">
                <input
                  id="nama"
                  name="nama"
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  className="input-field"
                  value={formData.nama}
                  onChange={handleChange}
                />
              </div>
              {errors.nama && <p className="mt-1 text-[11px] text-red-600">{errors.nama}</p>}
            </div>

            {/* Email Field */}
            <div className="field-group">
              <label htmlFor="email" className="field-label">
                Alamat Email Resmi
              </label>
              <div className="input-wrapper">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="staf@museum.com"
                  className="input-field"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              {errors.email && <p className="mt-1 text-[11px] text-red-600">{errors.email}</p>}
            </div>

            {/* Role Field */}
            <div className="field-group">
              <label htmlFor="role" className="field-label">
                Peran Akun
              </label>
              <div className="input-wrapper">
                <select
                  id="role"
                  name="role"
                  className="input-field cursor-pointer bg-white"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="STAFF">Staf Museum / Loket</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>
            </div>

            {/* Password Field */}
            <div className="field-group">
              <label htmlFor="password" className="field-label">
                Kata Sandi (Minimal 6 karakter)
              </label>
              <div className="input-wrapper">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="input-field password-input"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-[11px] text-red-600">{errors.password}</p>}
            </div>

            {/* Confirm Password Field */}
            <div className="field-group">
              <label htmlFor="confirmPassword" className="field-label">
                Konfirmasi Kata Sandi
              </label>
              <div className="input-wrapper">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="input-field password-input"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-[11px] text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <button type="submit" className="submit-btn mt-2" disabled={loading}>
              <span>{loading ? "Mendaftarkan..." : "Daftar Akun Pengelola"}</span>
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Sudah memiliki akun pengelola?{" "}
            <Link href="/login" className="font-semibold text-emerald-800 hover:underline">
              Masuk di sini
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

