"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ApiNetworkError, authApi, OFFLINE_MOCK_TOKEN, setAuthToken } from "@/lib/api";
import { validateEmail, validatePassword } from "@/lib/validation/auth";
import { setStoredUser } from "@/lib/user-auth";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getStrictEmailError = (rawEmail: string): string => {
  const trimmed = rawEmail.trim();
  if (!trimmed) {
    return "Alamat email wajib diisi.";
  }
  const externalError = validateEmail(trimmed);
  if (externalError) {
    return externalError;
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return "Format alamat email tidak valid.";
  }
  return "";
};

const getStrictPasswordError = (rawPassword: string): string => {
  if (!rawPassword) {
    return "Kata sandi wajib diisi.";
  }
  const externalError = validatePassword(rawPassword);
  if (externalError) {
    return externalError;
  }
  if (rawPassword.length < 6) {
    return "Kata sandi minimal 6 karakter.";
  }
  return "";
};

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

    const trimmedEmail = email.trim();
    const emailErr = getStrictEmailError(trimmedEmail);
    const passErr = getStrictPasswordError(password);

    setFieldErrors({
      email: emailErr,
      password: passErr,
    });

    if (emailErr || passErr) {
      return;
    }

    setLoading(true);

    try {
      const res = await authApi.login(trimmedEmail, password);
      if (!res?.success || !res.data?.token) {
        setLoginError(res?.message || "Login gagal. Periksa email dan password Anda.");
        return;
      }

      setAuthToken(res.data.token);
      setStoredUser({
        id: res.data.id ?? res.data.username ?? "admin",
        nama: res.data.nama || "Administrator",
        email: res.data.email || trimmedEmail,
        username: res.data.username,
        role: res.data.role || "ADMIN",
      });

      document.cookie = `museum-admin-token=${res.data.token}; path=/; max-age=86400`;

      if (rememberMe) {
        window.localStorage.setItem("museum-admin-email", trimmedEmail);
      } else {
        window.localStorage.removeItem("museum-admin-email");
      }
      router.push("/dashboard");
      return;
    } catch (err: unknown) {
      const ADMIN_EMAIL = "admin@museum.com";
      const ADMIN_PASSWORD = "admin123";

      if (
        process.env.NODE_ENV === "development" &&
        err instanceof ApiNetworkError &&
        trimmedEmail.toLowerCase() === ADMIN_EMAIL &&
        password === ADMIN_PASSWORD
      ) {
        setAuthToken(OFFLINE_MOCK_TOKEN);
        setStoredUser({
          id: "admin",
          nama: "Administrator Museum",
          email: ADMIN_EMAIL,
          username: "admin",
          role: "ADMIN",
        });

        document.cookie = `museum-admin-token=${OFFLINE_MOCK_TOKEN}; path=/; max-age=86400`;

        if (rememberMe) {
          window.localStorage.setItem("museum-admin-email", trimmedEmail);
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
    <div className="flex min-h-screen w-full flex-col md:flex-row bg-[#F7F3EA]">
      {/* LEFT PANEL — Museum Image */}
      <div className="relative hidden md:flex md:w-1/2 lg:w-3/5 flex-col justify-end p-8 lg:p-10 overflow-hidden bg-[#2C4A2C]">
        <Image
          src="/museum-brawijaya.jpg"
          alt="Museum Brawijaya Malang"
          fill
          style={{ objectFit: "cover", objectPosition: "center" }}
          priority
          sizes="(max-width: 768px) 0vw, 60vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        <div className="relative z-10 text-white">
          <p className="text-xs uppercase tracking-widest text-[#CBB26A] font-semibold mb-1">
            Sistem Pengelola
          </p>
          <p className="text-2xl lg:text-3xl font-bold">Museum Brawijaya Malang</p>
        </div>
      </div>

      {/* RIGHT PANEL — Compact Form */}
      <div className="flex w-full md:w-1/2 lg:w-2/5 items-center justify-center p-5 sm:p-7 lg:p-10">
        <div className="w-full max-w-[380px] flex flex-col justify-center">
          {/* Mobile Header Banner */}
          <div className="block md:hidden mb-3 text-center">
            <span className="text-xs font-semibold text-[#2C4A2C] uppercase tracking-wider">
              Museum Brawijaya Malang
            </span>
          </div>

          {/* Badge */}
          <div className="mb-3.5 flex justify-center md:justify-start">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-900/15 bg-white/80 px-2.5 py-1 text-[11px] font-medium text-emerald-950 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-800" />
              Sistem Manajemen Internal
            </span>
          </div>

          {/* Heading */}
          <div className="mb-4 text-center md:text-left">
            <h1 className="mb-1 text-2xl font-bold tracking-tight text-[#1A1A1A]">
              Masuk ke Sistem
            </h1>
            <p className="text-xs leading-snug text-[#6B6B6B]">
              Gunakan akun resmi pengelola untuk mengakses panel admin Museum Brawijaya.
            </p>
          </div>

          {/* Form */}
          <form className="flex w-full flex-col gap-3" onSubmit={handleSubmit} noValidate>
            {loginError && (
              <div
                role="alert"
                className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs font-medium text-red-700"
              >
                {loginError}
              </div>
            )}

            {/* Email Field */}
            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-xs font-semibold text-[#1A1A1A]">
                Alamat Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                required
                placeholder="admin@museum.com"
                className="w-full rounded-lg border border-[#D8D0C0] bg-[#F8F4EC] px-3.5 py-2.5 text-sm text-[#1A1A1A] outline-none transition placeholder:text-[#ABA89F] focus:border-[#2C4A2C] focus:ring-2 focus:ring-[#2C4A2C]/15"
                value={email}
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? "email-error" : undefined}
                onChange={(e) => {
                  const value = e.target.value;
                  setEmail(value);
                  if (fieldErrors.email) {
                    setFieldErrors((current) => ({
                      ...current,
                      email: getStrictEmailError(value),
                    }));
                  }
                  setLoginError("");
                }}
                onBlur={() => {
                  setFieldErrors((current) => ({
                    ...current,
                    email: getStrictEmailError(email),
                  }));
                }}
              />
              {fieldErrors.email && (
                <p id="email-error" className="text-[11px] text-red-600" role="alert">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="password" className="text-xs font-semibold text-[#1A1A1A]">
                  Kata Sandi
                </label>
                <a
                  href="#forgot"
                  className="text-[11px] font-semibold text-emerald-900 transition hover:text-emerald-700 hover:underline"
                >
                  Lupa sandi?
                </a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-[#D8D0C0] bg-[#F8F4EC] py-2.5 pl-3.5 pr-10 text-sm text-[#1A1A1A] outline-none transition placeholder:text-[#ABA89F] focus:border-[#2C4A2C] focus:ring-2 focus:ring-[#2C4A2C]/15"
                  value={password}
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={fieldErrors.password ? "password-error" : undefined}
                  onChange={(e) => {
                    const value = e.target.value;
                    setPassword(value);
                    if (fieldErrors.password) {
                      setFieldErrors((current) => ({
                        ...current,
                        password: getStrictPasswordError(value),
                      }));
                    }
                    setLoginError("");
                  }}
                  onBlur={() => {
                    setFieldErrors((current) => ({
                      ...current,
                      password: getStrictPasswordError(password),
                    }));
                  }}
                />
                <button
                  type="button"
                  className="absolute right-2.5 top-1/2 flex -translate-y-1/2 cursor-pointer items-center justify-center rounded p-1 text-slate-500 transition hover:text-emerald-900 focus-visible:outline-2 focus-visible:outline-emerald-800"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="17"
                      height="17"
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
                      width="17"
                      height="17"
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
            <div className="flex items-center pt-0.5">
              <label className="flex cursor-pointer items-center gap-2 text-xs text-[#4B5563]">
                <input
                  type="checkbox"
                  name="remember-me"
                  className="h-3.5 w-3.5 cursor-pointer accent-emerald-900 rounded"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Ingat sesi saya di perangkat ini</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="mt-1 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#2C4A2C] px-4 py-2.5 text-sm font-bold tracking-wide text-white shadow-md transition hover:bg-[#1E3A1E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2C4A2C] disabled:cursor-not-allowed disabled:opacity-70"
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
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </form>

          {/* Footer note */}
          <div className="mt-5 border-t border-[#D8D0C0] pt-3 text-center">
            <p className="text-[11px] text-[#6B6B6B]">
              © {new Date().getFullYear()} Museum Brawijaya Malang. Hak cipta dilindungi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}