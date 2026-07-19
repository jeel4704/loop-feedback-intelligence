"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button, Input } from "@/components/ui";
import { Eye, EyeOff, Check, X, ShieldCheck } from "lucide-react";

interface AuthFormProps {
  mode: "login" | "signup";
}

// ============================================================
// Password strength validation rules
// ============================================================
export const PASSWORD_RULES = [
  { key: "minLength", label: "Minimum 8 characters", test: (p: string) => p.length >= 8 },
  { key: "maxLength", label: "Maximum 64 characters", test: (p: string) => p.length <= 64 },
  { key: "uppercase", label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { key: "lowercase", label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { key: "number", label: "One number", test: (p: string) => /\d/.test(p) },
  { key: "special", label: "One special character", test: (p: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(p) }
];

export function PasswordToggleInput({
  value,
  onChange,
  placeholder,
  required = true
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  required?: boolean;
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <Input
        type={showPassword ? "text" : "password"}
        required={required}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="pr-10"
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-0.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        aria-label={showPassword ? "Hide password" : "Show password"}
        tabIndex={-1}
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4 transition-transform duration-150" />
        ) : (
          <Eye className="h-4 w-4 transition-transform duration-150" />
        )}
      </button>
    </div>
  );
}

export function PasswordStrengthMeter({ password }: { password: string }) {
  const results = PASSWORD_RULES.map((rule) => ({
    ...rule,
    passed: rule.test(password)
  }));

  const passedCount = results.filter((r) => r.passed).length;
  const total = results.length;
  const percentage = total > 0 ? (passedCount / total) * 100 : 0;

  let strengthLabel = "Weak";
  let strengthColor = "bg-rose-500";
  if (percentage >= 100) {
    strengthLabel = "Strong";
    strengthColor = "bg-emerald-500";
  } else if (percentage >= 66) {
    strengthLabel = "Good";
    strengthColor = "bg-amber-500";
  } else if (percentage >= 33) {
    strengthLabel = "Fair";
    strengthColor = "bg-orange-500";
  }

  if (!password) return null;

  return (
    <div className="space-y-2.5 mt-2">
      {/* Strength bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Password Strength</span>
          <span className={`text-[10px] font-extrabold uppercase tracking-wider ${
            percentage >= 100 ? "text-emerald-600" : percentage >= 66 ? "text-amber-600" : "text-rose-600"
          }`}>
            {strengthLabel}
          </span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 dark:bg-dark-elevated rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${strengthColor}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Rule checklist */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {results.map((rule) => (
          <div key={rule.key} className="flex items-center gap-1.5">
            {rule.passed ? (
              <Check className="h-3 w-3 text-emerald-500 flex-shrink-0" />
            ) : (
              <X className="h-3 w-3 text-slate-300 dark:text-slate-600 flex-shrink-0" />
            )}
            <span className={`text-[10px] font-semibold ${
              rule.passed ? "text-emerald-700 dark:text-emerald-400" : "text-slate-400 dark:text-dark-muted"
            }`}>
              {rule.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AuthForm({ mode }: AuthFormProps) {
  const isSignup = mode === "signup";
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");

  // State fields
  const [workspaceName, setWorkspaceName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [error, setError] = useState(
    errorParam === "unauthorized"
      ? "You need to sign in to access your workspace."
      : errorParam === "forbidden"
      ? "You do not have permission to access that resource."
      : errorParam === "invalid_token"
      ? "This verification link is invalid or has expired."
      : errorParam === "expired_token"
      ? "This verification link has expired. Please sign up again."
      : errorParam === "CredentialsSignin" || errorParam === "CallbackRouteError"
      ? "Invalid email or password. Please check your credentials."
      : ""
  );
  const messageParam = searchParams.get("message");
  const [success, setSuccess] = useState(
    messageParam === "verified" ? "Email successfully verified! You can now sign in." : ""
  );
  const [loading, setLoading] = useState(false);
  const [devVerificationUrl, setDevVerificationUrl] = useState("");

  // Signup validation state
  const allPasswordRulesPass = useMemo(
    () => PASSWORD_RULES.every((rule) => rule.test(password)),
    [password]
  );
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const signupDisabled =
    isSignup &&
    (!allPasswordRulesPass || !passwordsMatch || !acceptTerms || !name || !workspaceName || !email || loading);

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isSignup) {
      if (!allPasswordRulesPass) {
        setError("Password does not meet all strength requirements.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      if (!acceptTerms) {
        setError("You must accept the terms & conditions.");
        return;
      }
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/magic-link/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, workspaceName, email, password, purpose: "SIGNUP" })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to initiate verification.");
        setLoading(false);
        return;
      }

      setLoading(false);
      if (data.verificationUrl) {
        setDevVerificationUrl(data.verificationUrl);
        setSuccess("Workspace created! Please verify below.");
      } else {
        setSuccess("Verification email sent. Please check your inbox to complete signup.");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // In NextAuth v5, redirect: false with Credentials can sometimes hang or throw unexpectedly.
      // We'll let NextAuth handle the redirect natively.
      await signIn("credentials", {
        email,
        password,
        redirectTo: "/dashboard" // v5 uses redirectTo
      });
      // The code below might not execute if the page unloads, but we'll reset loading just in case
      setLoading(false);
    } catch (err: any) {
      console.error("Login error caught:", err);
      // NextAuth v5 throws NEXT_REDIRECT errors, we shouldn't catch them as generic errors
      if (err?.message?.includes('NEXT_REDIRECT')) {
        return;
      }
      setError("Invalid email or password, or an unexpected error occurred.");
      setLoading(false);
    }
  };

  // ============================================================
  // Login Form
  // ============================================================
  if (!isSignup) {
    return (
      <form className="space-y-5" onSubmit={handleLoginSubmit}>
        {success && (
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs text-emerald-400 font-semibold flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500 flex-shrink-0" />
            {success}
          </div>
        )}
        {error && (
          <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs text-rose-400 space-y-3">
            <p className="font-semibold">{error}</p>
            {errorParam === "unauthorized" && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setError("")}
                  className="rounded-lg bg-rose-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-rose-700 transition-colors shadow-lg shadow-rose-500/20"
                >
                  Login
                </button>
                <Link
                  href="/signup"
                  className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-slate-700 transition-colors shadow-lg"
                >
                  Create Workspace
                </Link>
              </div>
            )}
          </div>
        )}

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

        <label className="block">
          <div className="mb-2 flex items-center justify-between">
            <span className="block text-sm font-medium text-slate-300">
              Password
            </span>
            <Link href="/forgot-password" className="text-[11px] font-semibold text-blue-500 hover:text-blue-400">
              Forgot password?
            </Link>
          </div>
          <PasswordToggleInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
        </label>

        <Button type="submit" fullWidth disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </Button>

        <p className="text-sm text-slate-400">
          New to LOOP?{" "}
          <Link
            href="/signup"
            className="font-semibold text-blue-500 hover:text-blue-400 transition-colors"
          >
            Create an account
          </Link>
        </p>
      </form>
    );
  }

  // ============================================================
  // Signup Form
  // ============================================================
  return (
    <form className="space-y-5" onSubmit={handleSendMagicLink}>
      {error && (
        <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs font-semibold text-rose-400">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs font-semibold text-emerald-400">
          {success}
        </div>
      )}

      {devVerificationUrl && (
        <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-4 text-xs font-semibold text-blue-400 space-y-2">
          <p className="font-bold">SMTP bypassed in local dev mode. Copy or click the link below to verify instantly:</p>
          <a 
            href={devVerificationUrl}
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-3 py-1.5 rounded-lg text-center transition"
          >
            Verify Email & Activate Workspace
          </a>
        </div>
      )}

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-300">
          Full Name
        </span>
        <Input 
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jane Doe"
          autoComplete="name"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-300">
          Workspace Name
        </span>
        <Input 
          required
          value={workspaceName}
          onChange={(e) => setWorkspaceName(e.target.value)}
          placeholder="Acme Technologies"
          autoComplete="organization"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-300">
          Business Email
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

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-300">
          Password
        </span>
        <PasswordToggleInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Create secure password"
        />
        <PasswordStrengthMeter password={password} />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-300">
          Confirm Password
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

      <label className="flex items-start gap-3 select-none">
        <input 
          type="checkbox"
          checked={acceptTerms}
          onChange={(e) => setAcceptTerms(e.target.checked)}
          className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-xs text-slate-400 leading-normal">
          I accept the <Link href={"/terms" as any} className="text-blue-500 underline font-semibold">Terms & Conditions</Link> and the <Link href={"/privacy" as any} className="text-blue-500 underline font-semibold">Privacy Policy</Link>.
        </span>
      </label>

      <Button type="submit" fullWidth disabled={signupDisabled}>
        {loading ? "Processing..." : "Create Workspace"}
      </Button>

      <p className="text-sm text-slate-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-blue-500 hover:text-blue-400 transition-colors"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
