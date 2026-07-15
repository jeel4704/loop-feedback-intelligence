"use client";

import { useSession } from "next-auth/react";

// Auth hook wrapper to keep component imports consistent.
export function useAuth() {
  return useSession();
}

