import { NextResponse, type NextRequest } from "next/server";
import { AUTH_TOKEN_COOKIE } from "./lib/auth-constants";

export function proxy(request: NextRequest) {
  const token = request.cookies.get(AUTH_TOKEN_COOKIE)?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/ulasan/:path*",
    "/tiket/:path*",
    "/pengaturan/:path*",
    "/informasi/:path*",
    "/koleksi/:path*",
  ],
};
