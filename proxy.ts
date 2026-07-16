import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Define which routes require authentication
  const protectedRoutes = ["/dashboard", "/me", "/editor"];
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

  // 2. Define routes that logged-in users shouldn't see
  const authRoutes = ["/login", "/register"];
  const isAuthRoute = authRoutes.includes(pathname);

  // 3. Look for the httpOnly cookie you set in the login route
  const refreshToken = req.cookies.get("refresh_token")?.value;

  // 4. Redirect logged-out users trying to access protected pages
  if (isProtected && !refreshToken) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 5. Redirect logged-in users trying to access login/register
  if (isAuthRoute && refreshToken) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

// 6. Optimize proxy performance to ignore static files and APIs
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};