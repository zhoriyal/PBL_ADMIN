"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { validateEmail, validatePassword } from "@/lib/validation/auth";
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

    const emailErr = validateEmail(email);
    if (emailErr) {
      setLoginError(emailErr);
      return;
    }

    const passErr = validatePassword(password);
    if (passErr) {
      setLoginError(passErr);
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
      // Fallback offline bila backend belum dinyalakan
      const ADMIN_EMAIL = "admin@museum.com";
      const ADMIN_PASSWORD = "admin123";

      if (email.trim() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
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
    <div className="login-container">
      {/* LEFT PANEL — Museum Image */}
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
          <p className="label">Sistem Pengelola</p>
          <p className="museum-name">Museum Brawijaya Malang</p>
        </div>
      </div>

      {/* RIGHT PANEL — Form */}
      <div className="login-right">
        <div className="login-form-wrapper">
          {/* Badge */}
          <div className="badge-wrapper">
            <span className="badge">
              <span className="badge-dot" />
              Sistem Manajemen Internal
            </span>
          </div>

          {/* Heading */}
          <div className="heading-group">
            <h1 className="title">Masuk ke Sistem</h1>
            <p className="subtitle">
              Gunakan akun resmi pengelola untuk mengakses panel admin Museum Brawijaya.
            </p>
          </div>

          {/* Form */}
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            {loginError && (
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
                {loginError}
              </div>
            )}

            {/* Email Field */}
            <div className="field-group">
              <label htmlFor="email" className="field-label">
                Alamat Email / Username
              </label>
              <div className="input-wrapper">
                <input
                  id="email"
                  name="email"
                  type="text"
                  autoComplete="username"
                  required
                  placeholder="admin@museum.com"
                  className="input-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="field-group">
              <div className="label-row">
                <label htmlFor="password" className="field-label">
                  Kata Sandi
                </label>
                <a href="#forgot" className="forgot-link">
                  Lupa sandi?
                </a>
              </div>
              <div className="input-wrapper">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className="input-field password-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="remember-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="remember-me"
                  className="checkbox-input"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="checkbox-custom" />
                <span className="checkbox-text">Ingat sesi saya di perangkat ini</span>
              </label>
            </div>

            {/* Submit Button */}
            <button type="submit" className="submit-btn" disabled={loading}>
              <span>{loading ? "Memverifikasi..." : "Masuk ke Panel Admin"}</span>
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
                aria-hidden="true"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </form>

          {/* Link to Register */}
          <div className="mt-6 text-center text-xs text-slate-500">
            Belum punya akun pengelola?{" "}
            <Link href="/register" className="font-semibold text-emerald-800 hover:underline">
              Daftar akun baru
            </Link>
          </div>

          {/* Footer note */}
          <div className="login-footer">
            <p className="copyright">
              © {new Date().getFullYear()} Museum Brawijaya Malang. Hak cipta dilindungi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

