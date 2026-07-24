import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login"
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      
      // Explicit list of protected routes requiring authentication
      const protectedPrefixes = [
        "/dashboard",
        "/feedback",
        "/analytics",
        "/themes",
        "/ask-loop",
        "/reports",
        "/users",
        "/workspace",
        "/workspaces",
        "/settings",
        "/profile",
        "/account",
        "/notifications",
        "/appearance",
        "/billing",
        "/security",
        "/keyboard-shortcuts",
        "/help-center",
        "/inbox",
        "/members",
        "/trends",
        "/admin"
      ];

      const isProtected = protectedPrefixes.some((prefix) => 
        nextUrl.pathname.startsWith(prefix)
      );

      if (isProtected) {
        if (isLoggedIn) return true;
        return false; // Redirects unauthenticated request to /login page
      }

      return true;
    }
  },
  providers: [] // To be filled in auth.ts with database credentials provider
} satisfies NextAuthConfig;
