// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1) Rutas públicas con cacheo en Edge
  if (
    pathname === "/" ||
    pathname.startsWith("/portafolio/") ||
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt" ||
    !pathname.startsWith("/dashboard/") // Excluye /admin de esta regla
  ) {
    const response = NextResponse.next();
    response.headers.set(
      "Cache-Control",
      "stale-while-revalidate=600"
    );
    return response;
  }

  // 2) Protección de rutas /admin
  if (pathname.startsWith("/dashboard")) {
    // Obtiene el JWT desde las cookies
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // Si no hay token, redirige al signin con callbackUrl
    if (!token || !token.role) {
      const signInUrl = new URL("/auth/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", encodeURIComponent(request.url));
      return NextResponse.redirect(signInUrl);
    }

    // Verifica rol de administrador
    if (token.role !== "admin" || !token.role) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // 3) Para todas las demás rutas, simplemente continúa
  return NextResponse.next();
}

// Aplica el middleware solo a estas rutas
export const config = {
  matcher: [
    "/",
    "/portafolio/:path*",
    "/dashboard/:path*",
    "/sitemap.xml",
    "/robots.txt",
  ],
};
