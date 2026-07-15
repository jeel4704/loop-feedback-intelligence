"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthShell } from "@/components/auth";
import { Button } from "@/components/ui";
import { PasswordToggleInput, PasswordStrengthMeter, PASSWORD_RULES } from "@/components/auth/auth-form";
import { ShieldCheck, X, Check } from "lucide-react";
import Link from "next/link";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing password reset token.");
    }
  }, [token]);

  const allPasswordRulesPass = useMemo(
    () => PASSWORD_RULES.every((rule) => rule.test(newPassword)),
    [newPassword]
  );
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  
  const submitDisabled = !token || !allPasswordRulesPass || !passwordsMatch || loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitDisabled) return;

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword })
      });

      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "Failed to reset password.");
      } else {
        setMessage(data.message);
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (message) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-6 text-sm text-emerald-400 font-semibold flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-emerald-500 flex-shrink-0" />
          {message}
        </div>
        <Button onClick={() => router.replace("/login")} fullWidth>
          Return to Login
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs font-semibold text-rose-400">
          {error}
        </div>
      )}

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-300">
          New Password
        </span>
        <PasswordToggleInput
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Create secure password"
        />
        <PasswordStrengthMeter password={newPassword} />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-300">
          Confirm New Password
        </span>
        <PasswordToggleInput
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-enter password"
        />
        {confirmPassword && !passwordsMatch && (
          <p className="mt-1 text-[10px] font-bold text-rose-500 flex items-center gap-1">
            <X className="h-3 w-3" /> Passwords do not match
          </p>
        )}
        {passwordsMatch && (
          <p className="mt-1 text-[10px] font-bold text-emerald-600 flex items-center gap-1">
            <Check className="h-3 w-3" /> Passwords match
          </p>
        )}
      </label>

      <Button type="submit" fullWidth disabled={submitDisabled}>
        {loading ? "Resetting..." : "Reset Password"}
      </Button>
      
      <p className="text-sm text-slate-400">
        Changed your mind?{" "}
        <Link
          href="/login"
          className="font-semibold text-blue-500 hover:text-blue-400 transition-colors"
        >
          Return to Login
        </Link>
      </p>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Create New Password"
      description="Enter a new password for your LOOP account."
    >
      <Suspense fallback={<div className="text-sm text-slate-400">Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
