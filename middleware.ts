import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const AUTH_COOKIE = "auth-token";

async function verifyJWT(token: string | undefined) {
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "nexius-secret-key");
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1) Rutas públicas con cacheo en Edge
  if (
    pathname === "/" ||
    pathname.startsWith("/portafolio/") ||
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt" ||
    !pathname.startsWith("/dashboard/")
  ) {
    const response = NextResponse.next();
    response.headers.set("Cache-Control", "stale-while-revalidate=600");
    return response;
  }

  // 2) Protección de rutas /dashboard
  if (pathname.startsWith("/dashboard")) {
    const token = request.cookies.get(AUTH_COOKIE)?.value;
    const payload = await verifyJWT(token);

    // Verifica rol de administrador (ajusta según tu lógica de roles)
    if (!payload?.role || payload.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // 3) Para todas las demás rutas, simplemente continúa
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/portafolio/:path*",
    "/dashboard/:path*",
    "/sitemap.xml",
    "/robots.txt",
  ],
};