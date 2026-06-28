import type { AuthUser, DemoCredential } from "@/types/auth";

export const DEMO_SESSION_STORAGE_KEY = "loop-demo-session";

export function sanitizeDemoUser(user: DemoCredential): AuthUser {
  const { password: _password, ...safeUser } = user;
  return safeUser;
}

