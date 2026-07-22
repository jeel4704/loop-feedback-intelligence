import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

// Pages accessible to everyone (not protected)
const publicPaths = [
  "/",
  "/login",
  "/signup",
  "/verify-otp",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
  "/invitation",
  "/privacy",
  "/terms",
  "/contact",
  "/product",
  "/features",
  "/solutions",
  "/pricing",
  "/resources",
  "/company",
  "/demo"
];

// Auth pages that authenticated users must NOT access
const authOnlyPaths = ["/login", "/signup"];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const user = req.auth?.user as any;
  const pathname = nextUrl.pathname;

  const isPublic = publicPaths.includes(pathname) || pathname.startsWith("/invitation-accept");
  const isAuthPage = authOnlyPaths.includes(pathname);

  // ============================================================
  // 1. Redirect authenticated users AWAY from login/signup
  //    This prevents browser back button from exposing login page
  // ============================================================
  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl.origin));
  }

  // ============================================================
  // 2. Redirect unauthenticated users to login for protected routes
  // ============================================================
  if (!isPublic && !isLoggedIn) {
    const redirectUrl = new URL("/login", nextUrl.origin);
    redirectUrl.searchParams.set("error", "unauthorized");
    return NextResponse.redirect(redirectUrl);
  }

  // ============================================================
  // 3. Role-Based Access Control (RBAC)
  // ============================================================
  if (isLoggedIn && !isPublic) {
    const role = user?.role; // OWNER, ADMIN, ANALYST, VIEWER

    // VIEWER restrictions — cannot access admin/management pages
    if (role === "VIEWER") {
      const viewerForbidden = [
        "/users",
        "/settings",
        "/workspace",
        "/admin",
        "/members",
        "/billing",
        "/security"
      ];
      if (viewerForbidden.some((prefix) => pathname.startsWith(prefix))) {
        const redirectUrl = new URL("/dashboard", nextUrl.origin);
        redirectUrl.searchParams.set("error", "forbidden");
        return NextResponse.redirect(redirectUrl);
      }
    }

    // ANALYST restrictions — cannot access user management, billing, members
    if (role === "ANALYST") {
      const analystForbidden = [
        "/users",
        "/workspace/billing",
        "/admin",
        "/members",
        "/billing"
      ];
      if (analystForbidden.some((prefix) => pathname.startsWith(prefix))) {
        const redirectUrl = new URL("/dashboard", nextUrl.origin);
        redirectUrl.searchParams.set("error", "forbidden");
        return NextResponse.redirect(redirectUrl);
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|logo.jpg|logo.png).*)"]
};
