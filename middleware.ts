import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

// Routes that require authentication
const protectedRoutes = ["/dashboard"]

// Public routes (don't require authentication)
const publicRoutes = ["/login", "/recuperar-password", "/api/auth/login"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the route requires authentication
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  // Skip API routes except for auth-related ones
  const isApiRoute = pathname.startsWith("/api/") && !pathname.startsWith("/api/auth/")

  // If it's an API route (except auth routes) or not a protected/public route, continue
  if (isApiRoute || (!isProtectedRoute && !isPublicRoute)) {
    return NextResponse.next()
  }

  // Get token from cookie
  const token = request.cookies.get("auth-token")?.value

  // For protected routes, verify authentication
  if (isProtectedRoute) {
    // If there's no token, redirect to login
    if (!token) {
      const url = new URL("/login", request.url)
      url.searchParams.set("from", pathname)
      return NextResponse.redirect(url)
    }

    try {
      // Verify token
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || "nexius-secret-key")
      await jwtVerify(token, secret)

      // Valid token, continue
      return NextResponse.next()
    } catch (error) {
      // Invalid token, redirect to login
      const url = new URL("/login", request.url)
      url.searchParams.set("from", pathname)
      return NextResponse.redirect(url)
    }
  }

  // For public routes like login, check if already authenticated
  if (isPublicRoute && pathname !== "/api/auth/login") {
    if (token) {
      try {
        // Verify token
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || "nexius-secret-key")
        await jwtVerify(token, secret)

        // If authenticated and going to login, redirect to dashboard
        return NextResponse.redirect(new URL("/dashboard", request.url))
      } catch (error) {
        // Invalid token, continue to public route
        return NextResponse.next()
      }
    }
  }

  // For any other case, continue
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Routes that require authentication
    "/dashboard/:path*",
    // Public routes
    "/login",
    "/recuperar-password",
    // API routes that need authentication checking
    "/api/auth/:path*",
  ],
}
