"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
<<<<<<< HEAD
import { authApi } from "@/lib/api";
=======
import { ApiNetworkError, authApi, OFFLINE_MOCK_TOKEN, setAuthToken } from "@/lib/api";
import { validateEmail, validatePassword } from "@/lib/validation/auth";
>>>>>>> bcf79bfe6fe60e77957d0e2ccf2734df9699f6e6
import { setStoredUser } from "@/lib/user-auth";

export default function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError("");

<<<<<<< HEAD
    if (!email.trim()) {
      setLoginError("Email wajib diisi.");
      return;
    }

    if (!password) {
      setLoginError("Password wajib diisi.");
=======
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    setFieldErrors({
      email: emailErr || "",
      password: passErr || "",
    });
    if (emailErr || passErr) {
>>>>>>> bcf79bfe6fe60e77957d0e2ccf2734df9699f6e6
      return;
    }

    setLoading(true);

    try {
      const res = await authApi.login(email.trim(), password);
      if (!res?.success || !res.data?.token) {
        setLoginError(res?.message || "Login gagal. Periksa email dan password Anda.");
        return;
      }
<<<<<<< HEAD
    } catch (err: any) {
      // Fallback offline bila backend belum dinyalakan atau error koneksi
      const ADMIN_EMAIL = "admin@museum.com";
      const ADMIN_PASSWORD = "admin123";

      if ((email.trim().toLowerCase() === ADMIN_EMAIL || email.trim().toLowerCase() === "admin") && password === ADMIN_PASSWORD) {
        window.localStorage.setItem("museum-admin-token", "offline-mock-token");
=======

      setAuthToken(res.data.token);
      setStoredUser({
        id: res.data.id ?? res.data.username ?? "admin",
        nama: res.data.nama || "Administrator",
        email: res.data.email || email.trim(),
        username: res.data.username,
        role: res.data.role || "ADMIN",
      });

      if (rememberMe) {
        window.localStorage.setItem("museum-admin-email", email.trim());
      } else {
        window.localStorage.removeItem("museum-admin-email");
      }
      router.push("/dashboard");
      return;
    } catch (err: unknown) {
      // Mock login hanya tersedia untuk development ketika backend tidak dapat dijangkau.
      const ADMIN_EMAIL = "admin@museum.com";
      const ADMIN_PASSWORD = "admin123";

      if (
        process.env.NODE_ENV === "development" &&
        err instanceof ApiNetworkError &&
        email.trim().toLowerCase() === ADMIN_EMAIL &&
        password === ADMIN_PASSWORD
      ) {
        setAuthToken(OFFLINE_MOCK_TOKEN);
>>>>>>> bcf79bfe6fe60e77957d0e2ccf2734df9699f6e6
        setStoredUser({
          id: "admin",
          nama: "Administrator Museum",
          email: ADMIN_EMAIL,
          username: "admin",
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

      setLoginError(err instanceof Error ? err.message : "Email atau password salah. Silakan coba lagi.");
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

<<<<<<< HEAD
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
=======
      {/* RIGHT PANEL — Form */}
      <div className="login-right">
        <div className="login-form-wrapper w-full max-w-[368px]">
          {/* Badge */}
          <div className="badge-wrapper mb-7 flex justify-center">
            <span className="badge inline-flex items-center gap-2 rounded-full border border-emerald-900/15 bg-white/70 px-3 py-1.5 text-xs font-medium text-emerald-950">
              <span className="badge-dot h-2 w-2 rounded-full bg-emerald-800" />
              Sistem Manajemen Internal
            </span>
          </div>

          {/* Heading */}
          <div className="heading-group mb-8 text-center">
            <h1 className="title mb-2 text-3xl font-bold tracking-wide text-[#1A1A1A]">Masuk ke Sistem</h1>
            <p className="subtitle text-sm leading-relaxed text-[#6B6B6B]">
              Gunakan akun resmi pengelola untuk mengakses panel admin Museum Brawijaya.
            </p>
          </div>

          {/* Form */}
          <form className="login-form flex w-full flex-col gap-5" onSubmit={handleSubmit} noValidate>
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
>>>>>>> bcf79bfe6fe60e77957d0e2ccf2734df9699f6e6
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

<<<<<<< HEAD
            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="form-clean">
              {/* Field Email */}
              <div className="form-field-group">
                <label htmlFor="email" className="field-uppercase-label">
                  EMAIL
                </label>
=======
            {/* Email Field */}
            <div className="field-group flex flex-col gap-2">
              <label htmlFor="email" className="field-label text-sm font-semibold text-[#1A1A1A]">
                Alamat Email
              </label>
              <div className="input-wrapper relative">
>>>>>>> bcf79bfe6fe60e77957d0e2ccf2734df9699f6e6
                <input
                  id="email"
                  name="email"
                  type="text"
                  autoComplete="username"
                  required
<<<<<<< HEAD
                  placeholder="Masukkan Email Anda..."
                  className="clean-input"
=======
                  placeholder="admin@museum.com"
                  className="input-field w-full rounded-lg border border-[#D8D0C0] bg-[#F8F4EC] px-4 py-3 text-sm text-[#1A1A1A] outline-none transition placeholder:text-[#ABA89F] focus:border-[#2C4A2C] focus:ring-2 focus:ring-[#2C4A2C]/15"
>>>>>>> bcf79bfe6fe60e77957d0e2ccf2734df9699f6e6
                  value={email}
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={fieldErrors.email ? "email-error" : undefined}
                  onChange={(e) => {
                    const value = e.target.value;
                    setEmail(value);
                    setFieldErrors((current) => ({
                      ...current,
                      email: value ? validateEmail(value) || "" : "",
                    }));
                    setLoginError("");
                  }}
                />
              </div>
<<<<<<< HEAD

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
=======
              {fieldErrors.email && (
                <p id="email-error" className="text-[11px] text-red-600" role="alert">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="field-group flex flex-col gap-2">
              <div className="label-row flex items-center justify-between gap-4">
                <label htmlFor="password" className="field-label text-sm font-semibold text-[#1A1A1A]">
                  Kata Sandi
                </label>
                <a href="#forgot" className="forgot-link text-xs font-semibold text-emerald-900 transition hover:text-emerald-700 hover:underline">
                  Lupa sandi?
                </a>
              </div>
              <div className="input-wrapper relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className="input-field password-input w-full rounded-lg border border-[#D8D0C0] bg-[#F8F4EC] py-3 pl-4 pr-12 text-sm text-[#1A1A1A] outline-none transition placeholder:text-[#ABA89F] focus:border-[#2C4A2C] focus:ring-2 focus:ring-[#2C4A2C]/15"
                  value={password}
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={fieldErrors.password ? "password-error" : undefined}
                  onChange={(e) => {
                    const value = e.target.value;
                    setPassword(value);
                    setFieldErrors((current) => ({
                      ...current,
                      password: value ? validatePassword(value) || "" : "",
                    }));
                    setLoginError("");
                  }}
                />
                <button
                  type="button"
                  className="toggle-password-btn absolute right-3 top-1/2 flex -translate-y-1/2 cursor-pointer items-center justify-center rounded p-1 text-slate-500 transition hover:text-emerald-900 focus-visible:outline-2 focus-visible:outline-emerald-800"
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
              {fieldErrors.password && (
                <p id="password-error" className="text-[11px] text-red-600" role="alert">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Remember Me */}
            <div className="remember-row -mt-1">
              <label className="checkbox-label flex cursor-pointer items-center gap-2 text-xs text-[#4B5563]">
                <input
                  type="checkbox"
                  name="remember-me"
                  className="checkbox-input h-4 w-4 cursor-pointer accent-emerald-900"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="checkbox-text">Ingat sesi saya di perangkat ini</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="submit-btn flex w-full cursor-pointer items-center justify-center gap-3 rounded-lg bg-[#2C4A2C] px-4 py-3.5 text-sm font-bold tracking-wide text-white shadow-md transition hover:bg-[#1E3A1E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2C4A2C] disabled:cursor-not-allowed disabled:opacity-70"
              disabled={loading}
            >
              <span>{loading ? "Memverifikasi..." : "Login"}</span>
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
>>>>>>> bcf79bfe6fe60e77957d0e2ccf2734df9699f6e6
              >
                {loading ? "MEMPROSES..." : "MASUK"}
              </button>
            </form>

<<<<<<< HEAD
            {/* Footer Notice */}
            <p className="login-notice-text">
              Dilarang menyebarluaskan Email dan Password, sesuai dengan kebijakan dan peraturan yang berlaku.
=======
          {/* Link to Register */}
          <div className="mt-6 text-center text-xs text-slate-500">
            Belum punya akun pengelola?{" "}
            <Link href="/register" className="font-semibold text-emerald-800 hover:underline">
              Daftar akun baru
            </Link>
          </div>

          {/* Footer note */}
          <div className="login-footer mt-8 border-t border-[#D8D0C0] pt-4 text-center">
            <p className="copyright text-xs text-[#6B6B6B]">
              © {new Date().getFullYear()} Museum Brawijaya Malang. Hak cipta dilindungi.
>>>>>>> bcf79bfe6fe60e77957d0e2ccf2734df9699f6e6
            </p>
          </div>
        </div>
      </div>
    </div>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> bcf79bfe6fe60e77957d0e2ccf2734df9699f6e6
