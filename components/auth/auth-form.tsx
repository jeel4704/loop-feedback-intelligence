"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { demoAccounts } from "@/data/users";
import { useAuth } from "@/hooks/useAuth";
import { Badge, Button, Input } from "@/components/ui";

interface AuthFormProps {
  mode: "login" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const isSignup = mode === "signup";
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, error, clearError, isAuthenticated, user } = useAuth();
  const [email, setEmail] = useState(isSignup ? demoAccounts[1].email : "");
  const [password, setPassword] = useState(isSignup ? "password123" : "");
  const [workspaceName, setWorkspaceName] = useState("Acme Technologies");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router, user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearError();
    setIsSubmitting(true);

    const ok = await login({ email, password });

    setIsSubmitting(false);

    if (ok) {
      router.replace(searchParams.get("next") || "/dashboard");
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-950 dark:bg-blue-950/40">
        <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">
          Demo Accounts
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {demoAccounts.map((account) => (
            <button
              key={account.email}
              type="button"
              onClick={() => {
                clearError();
                setEmail(account.email);
                setPassword(account.password);
              }}
              className="rounded-full border border-blue-200 bg-white px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-100 dark:border-blue-900 dark:bg-slate-950 dark:text-blue-200 dark:hover:bg-blue-950/60"
            >
              {account.role}
            </button>
          ))}
        </div>
      </div>

      {isSignup ? (
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Workspace name
          </span>
          <Input
            value={workspaceName}
            onChange={(event) => setWorkspaceName(event.target.value)}
            placeholder="Acme Technologies"
          />
        </label>
      ) : null}

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Email
        </span>
        <Input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@company.com"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Password
        </span>
        <Input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter your password"
        />
      </label>

      {error ? <Badge variant="rose">{error}</Badge> : null}

      <Button type="submit" fullWidth disabled={isSubmitting}>
        {isSubmitting
          ? "Authenticating..."
          : isSignup
            ? "Create workspace"
            : "Sign in"}
      </Button>

      <p className="text-sm text-slate-600 dark:text-slate-400">
        {isSignup ? "Already have an account?" : "New to LOOP?"}{" "}
        <Link
          href={isSignup ? "/login" : "/signup"}
          className="font-medium text-blue-600 hover:text-blue-700"
        >
          {isSignup ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </form>
  );
}
