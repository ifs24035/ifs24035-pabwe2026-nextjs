import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "delcom_session";

/**
 * Mengalihkan pengunjung yang belum masuk ke halaman login di sisi edge.
 *
 * Sebelumnya pengalihan hanya terjadi di sisi klien sehingga browser terlanjur
 * mengunduh seluruh bundel dashboard, sempat menampilkan status pemuatan, lalu
 * baru berpindah ke /auth/login. Cookie penanda sesi ditulis oleh apiHelper
 * bersamaan dengan penyimpanan token di localStorage.
 */
export function middleware(request: NextRequest) {
  const hasSession = request.cookies.get(SESSION_COOKIE)?.value === "1";

  if (hasSession) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/auth/login", request.url));
}

export const config = {
  matcher: ["/", "/users/:path*", "/profile/:path*", "/posts/:path*"],
};
