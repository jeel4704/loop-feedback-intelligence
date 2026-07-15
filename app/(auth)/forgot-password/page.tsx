"use client";

import { useState } from "react";
import { AuthShell } from "@/components/auth";
import { Button, Input } from "@/components/ui";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [devResetUrl, setDevResetUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setDevResetUrl("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "Failed to send reset link.");
      } else {
        setMessage(data.message);
        if (data.resetUrl) {
          setDevResetUrl(data.resetUrl);
        }
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Reset Password"
      description="Enter your email to receive a password reset link."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs font-semibold text-rose-400">
            {error}
          </div>
        )}

        {message && (
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs text-emerald-400 font-semibold flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500 flex-shrink-0" />
            {message}
          </div>
        )}

        {devResetUrl && (
          <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-4 text-xs font-semibold text-blue-400 space-y-2 mt-4">
            <p className="font-bold">SMTP bypassed in local dev mode. Copy or click the link below to reset instantly:</p>
            <a 
              href={devResetUrl}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-3 py-1.5 rounded-lg text-center transition"
            >
              Reset Password
            </a>
          </div>
        )}

        {!message && (
          <>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-300">
                Email
              </span>
              <Input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com" 
                autoComplete="email"
              />
            </label>

            <Button type="submit" fullWidth disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </>
        )}
        
        <p className="text-sm text-slate-400">
          Remembered your password?{" "}
          <Link
            href="/login"
            className="font-semibold text-blue-500 hover:text-blue-400 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
