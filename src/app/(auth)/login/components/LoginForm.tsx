"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { setStoredUser } from "@/lib/user-auth";

export default function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError("");

    if (!email.trim()) {
      setLoginError("Email wajib diisi.");
      return;
    }

    if (!password) {
      setLoginError("Password wajib diisi.");
      return;
    }

    setLoading(true);

    try {
      const res = await authApi.login(email.trim(), password);
      if (res && res.data && res.data.token) {
        window.localStorage.setItem("museum-admin-token", res.data.token);
        setStoredUser({
          id: res.data.username || "admin",
          nama: res.data.nama || "Administrator",
          email: email.trim(),
          username: res.data.username,
          role: "ADMIN",
        });

        if (rememberMe) {
          window.localStorage.setItem("museum-admin-email", email.trim());
        } else {
          window.localStorage.removeItem("museum-admin-email");
        }
        router.push("/dashboard");
        return;
      }
    } catch (err: any) {
      // Fallback offline bila backend belum dinyalakan atau error koneksi
      const ADMIN_EMAIL = "admin@museum.com";
      const ADMIN_PASSWORD = "admin123";

      if ((email.trim().toLowerCase() === ADMIN_EMAIL || email.trim().toLowerCase() === "admin") && password === ADMIN_PASSWORD) {
        window.localStorage.setItem("museum-admin-token", "offline-mock-token");
        setStoredUser({
          id: "admin",
          nama: "Administrator Museum",
          email: ADMIN_EMAIL,
          username: "admin",
          role: "ADMIN",
        });
        if (rememberMe) {
          window.localStorage.setItem("museum-admin-email", email.trim());
        }
        router.push("/dashboard");
        return;
      }

      setLoginError(err?.message || "Email atau password salah. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-bg">
      <div className="login-card-container">
        {/* LEFT PANEL: Gambar Museum dengan Rounded Corners & Text di Pojok Kiri Bawah */}
        <div className="login-card-left">
          <Image
            src="/museum-brawijaya.jpg"
            alt="Museum Brawijaya Malang"
            fill
            style={{ objectFit: "cover", objectPosition: "center" }}
            priority
            sizes="50vw"
          />
          <div className="login-image-overlay" />
          <div className="login-image-caption">
            <p className="caption-tag">SISTEM PENGELOLA</p>
            <p className="caption-title">MUSEUM BRAWIJAYA MALANG</p>
          </div>
        </div>

        {/* RIGHT PANEL: Form Login Elegan Sesuai Screenshot */}
        <div className="login-card-right">
          {/* Version tag pojok kanan atas */}
          <span className="version-number">V 1.0.0</span>

          <div className="login-content-box">
            {/* Logo Lingkaran Hijau dengan Ikon Museum Emas */}
            <div className="brand-logo-circle">
              <svg
                viewBox="0 0 24 24"
                width="28"
                height="28"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="logo-icon-svg"
              >
                <path d="M3 21h18M4 18h16M6 18v-7M10 18v-7M14 18v-7M18 18v-7M12 2l10 7H2l10-7z" fill="#C9A84C" stroke="#C9A84C" />
              </svg>
            </div>

            {/* Judul & Subjudul */}
            <h1 className="login-heading-title">SELAMAT DATANG</h1>
            <p className="login-heading-subtitle">
              Masukkan Email dan Password untuk mengakses
            </p>

            {loginError && (
              <div className="login-error-alert">
                {loginError}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="form-clean">
              {/* Field Email */}
              <div className="form-field-group">
                <label htmlFor="email" className="field-uppercase-label">
                  EMAIL
                </label>
                <input
                  id="email"
                  name="email"
                  type="text"
                  autoComplete="username"
                  required
                  placeholder="Masukkan Email Anda..."
                  className="clean-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Field Password */}
              <div className="form-field-group">
                <label htmlFor="password" className="field-uppercase-label">
                  PASSWORD
                </label>
                <div className="clean-input-wrapper">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    placeholder="Masukkan Password Anda..."
                    className="clean-input password-clean-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="password-eye-btn"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Sembunyikan password" : "Lihat password"}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      {showPassword ? (
                        <>
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </>
                      ) : (
                        <>
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </>
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              {/* Remember Me & Lupa Password */}
              <div className="form-clean-options">
                <label className="remember-checkbox-label">
                  <input
                    type="checkbox"
                    name="remember-me"
                    className="remember-native-checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="remember-text-label">Remember Me</span>
                </label>
                <a href="#forgot" className="forgot-password-link">
                  LUPA PASSWORD?
                </a>
              </div>

              {/* Button Masuk */}
              <button
                type="submit"
                className="btn-masuk-darkgreen"
                disabled={loading}
              >
                {loading ? "MEMPROSES..." : "MASUK"}
              </button>
            </form>

            {/* Footer Notice */}
            <p className="login-notice-text">
              Dilarang menyebarluaskan Email dan Password, sesuai dengan kebijakan dan peraturan yang berlaku.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
