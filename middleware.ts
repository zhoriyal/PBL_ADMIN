import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Daftar rute admin yang ingin diproteksi (tidak boleh diakses tanpa login)
  const protectedRoutes = ['/dashboard', '/tiket', '/koleksi', '/informasi', '/ulasan', '/pengaturan'];

  // Cek apakah URL yang diakses termasuk rute yang diproteksi
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtected) {
    // Memeriksa token autentikasi dari cookies browser
    const token = request.cookies.get('museum-admin-token')?.value;

    // Jika tidak ada token, tendang/redirect paksa kembali ke halaman /login
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// Konfigurasi rute mana saja yang akan diawasi oleh middleware
export const config = {
  matcher: ['/dashboard/:path*', '/tiket/:path*', '/koleksi/:path*', '/informasi/:path*', '/ulasan/:path*', '/pengaturan/:path*'],
};