"use client";

import { useAuthContext } from "@/providers/SessionProvider";

// Hook wrapper for the frontend demo authentication state.
export function useAuth() {
  return useAuthContext();
}
