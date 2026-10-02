"use client";

import { useState } from "react";
import Image from "next/image";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

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

      {/* RIGHT PANEL — Login Form */}
      <div className="login-right">
        <span className="version-tag">V 1.0.0</span>

        {/* Logo */}
        <div className="museum-logo">
          <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <rect x="6" y="52" width="52" height="5" rx="2" />
            <rect x="10" y="30" width="6" height="22" rx="1" />
            <rect x="22" y="30" width="6" height="22" rx="1" />
            <rect x="36" y="30" width="6" height="22" rx="1" />
            <rect x="48" y="30" width="6" height="22" rx="1" />
            <polygon points="4,30 32,10 60,30" />
          </svg>
        </div>

        {/* Title */}
        <h1 className="login-title">Selamat Datang</h1>
        <p className="login-subtitle">Masukkan Email dan Password untuk mengakses</p>

        {/* Form */}
        <form className="login-form" onSubmit={(e) => e.preventDefault()}>
          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <div className="form-input-wrapper">
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="Masukkan Email Anda..."
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="form-input-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="form-input"
                placeholder="Masukkan Password Anda..."
                style={{ paddingRight: "48px" }}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="form-options">
            <label className="remember-me" htmlFor="remember-me">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember Me</span>
            </label>
            <a href="#" className="forgot-password">Lupa Password?</a>
          </div>

          {/* Submit Button */}
          <button id="btn-login" type="submit" className="btn-masuk">
            Masuk
          </button>
        </form>

        {/* Security Notice */}
        <div className="security-notice">
          <p>
            Dilarang menyebarluaskan Email dan Password, sesuai dengan<br />
            kebijakan dan peraturan yang berlaku.
          </p>
        </div>
      </div>
    </div>
  );
}
