"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

// Client-side Auth.js session boundary.
export function AppSessionProvider({
  children
}: Readonly<{ children: ReactNode }>) {
  return <SessionProvider>{children}</SessionProvider>;
}
