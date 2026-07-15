import { prisma } from "@/lib/prisma";

export type SecurityEventType =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED"
  | "LOGOUT"
  | "PASSWORD_CHANGE"
  | "PROFILE_UPDATE"
  | "WORKSPACE_UPDATE"
  | "ROLE_UPDATE"
  | "REPORT_EXPORT"
  | "DATA_IMPORT"
  | "ACCOUNT_LOCKED"
  | "ACCOUNT_UNLOCKED";

interface SecurityEventPayload {
  workspaceId?: string;
  userId?: string;
  email?: string;
  action: SecurityEventType;
  detail?: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Writes a structured security audit event to the ActivityLog table.
 * Used by auth flows, settings mutations, and middleware guards.
 */
export async function logSecurityEvent(payload: SecurityEventPayload): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        workspaceId: payload.workspaceId || "cmr78gg26000414fbs9d92415", // fallback to seed workspace if none
        label: `SECURITY [${payload.action}]: ${payload.detail || payload.email || payload.userId || "unknown"}`,
        timeLabel: "Just now"
      }
    });
  } catch (err) {
    // Audit logging must never break auth flows — fail silently
    console.error("[audit] Failed to log security event:", err);
  }
}

// ============================================================
// In-Memory Login Rate Limiter (Brute Force Protection)
// ============================================================

interface AttemptRecord {
  count: number;
  firstAttempt: number;
  lockedUntil: number | null;
}

const loginAttempts = new Map<string, AttemptRecord>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Checks if an email is currently rate-limited.
 * Returns { blocked: true, remainingMs } if locked, or { blocked: false }.
 */
export function checkLoginRateLimit(email: string): { blocked: boolean; remainingMs: number } {
  const key = email.toLowerCase().trim();
  const record = loginAttempts.get(key);

  if (!record) {
    return { blocked: false, remainingMs: 0 };
  }

  // Check if currently locked out
  if (record.lockedUntil && Date.now() < record.lockedUntil) {
    return { blocked: true, remainingMs: record.lockedUntil - Date.now() };
  }

  // If lockout has expired, reset
  if (record.lockedUntil && Date.now() >= record.lockedUntil) {
    loginAttempts.delete(key);
    return { blocked: false, remainingMs: 0 };
  }

  // If window has expired, reset
  if (Date.now() - record.firstAttempt > WINDOW_MS) {
    loginAttempts.delete(key);
    return { blocked: false, remainingMs: 0 };
  }

  return { blocked: false, remainingMs: 0 };
}

/**
 * Records a failed login attempt. Returns true if the account is now locked.
 */
export function recordFailedLogin(email: string): boolean {
  const key = email.toLowerCase().trim();
  const now = Date.now();
  let record = loginAttempts.get(key);

  if (!record || now - record.firstAttempt > WINDOW_MS) {
    record = { count: 1, firstAttempt: now, lockedUntil: null };
    loginAttempts.set(key, record);
    return false;
  }

  record.count++;

  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_MS;
    loginAttempts.set(key, record);
    return true;
  }

  loginAttempts.set(key, record);
  return false;
}

/**
 * Clears failed attempt records on successful login.
 */
export function clearLoginAttempts(email: string): void {
  loginAttempts.delete(email.toLowerCase().trim());
}
