"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Input, Badge, Logo } from "@/components/ui";

function InvitationForm() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [loadingDetails, setLoadingDetails] = useState(true);
  const [workspaceName, setWorkspaceName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [userExists, setUserExists] = useState(false);

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 1. Fetch invitation details
  useEffect(() => {
    if (!token) {
      setError("Invitation token is missing.");
      setLoadingDetails(false);
      return;
    }

    fetch(`/api/auth/invitation?token=${token}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Failed to load invitation.");
        } else {
          setWorkspaceName(data.workspaceName);
          setEmail(data.email);
          setRole(data.role);
          setUserExists(data.userExists);
        }
      })
      .catch(() => {
        setError("Unable to connect to the authentication server.");
      })
      .finally(() => {
        setLoadingDetails(false);
      });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!userExists && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/invitation", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          name: userExists ? undefined : name,
          password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to accept invitation.");
        setLoading(false);
        return;
      }

      setLoading(false);

      // Redirect to Login page with success indicator
      router.push("/login?message=verified");
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
      setLoading(false);
    }
  };

  if (loadingDetails) {
    return (
      <div className="text-center py-8 text-xs font-semibold text-slate-400">
        Loading invitation details...
      </div>
    );
  }

  if (error && !email) {
    return (
      <div className="space-y-6 py-8">
        <div className="rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 p-5 text-sm font-semibold text-rose-700 dark:text-rose-400 text-center">
          {error}
        </div>
        <div className="flex justify-center">
          <Link href="/login">
            <Button variant="secondary" size="sm">Return to Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {/* Workspace & Pre-assigned Locked Role Badge */}
      <div className="rounded-2xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-elevated p-4 space-y-3">
        <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-dark-muted">
          <span>Workspace</span>
          <span className="text-slate-950 dark:text-white uppercase tracking-tight">{workspaceName}</span>
        </div>
        <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-dark-muted">
          <span>Assigned Role</span>
          <Badge variant="blue" className="uppercase">{role}</Badge>
        </div>
        <p className="text-[10px] text-slate-400 dark:text-dark-muted/80 italic">
          * (Your workspace role is locked and pre-assigned by the workspace Owner)
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700">
          {error}
        </div>
      )}

      {userExists ? (
        <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 p-4 mb-4">
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-400 mb-1">Account Exists</p>
          <p className="text-xs text-amber-700 dark:text-amber-500">
            You already have an account with {email}. Please enter your password to confirm and accept this invitation.
          </p>
        </div>
      ) : (
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Full Name
          </span>
          <Input 
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe" 
          />
        </label>
      )}

      {!userExists && (
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-400 dark:text-slate-500">
            Business Email (Read Only)
          </span>
          <Input 
            type="email"
            disabled
            value={email}
            className="bg-slate-100/80 dark:bg-dark-card border-slate-200 dark:border-dark-border text-slate-400 dark:text-slate-500 font-medium"
          />
        </label>
      )}

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
          {userExists ? "Current Password" : "Password"}
        </span>
        <Input 
          type="password" 
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={userExists ? "Enter your current password" : "Create secure password (min 8 chars)"} 
        />
      </label>

      {!userExists && (
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Confirm Password
          </span>
          <Input 
            type="password" 
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter password" 
          />
        </label>
      )}

      <Button type="submit" fullWidth disabled={loading}>
        {loading ? "Processing..." : (userExists ? "Log in & Accept" : "Create Account")}
      </Button>
    </form>
  );
}

export default function InvitePage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-black px-6 py-16 flex items-center justify-center">
      <div className="mx-auto grid max-w-6xl w-full gap-10 lg:grid-cols-[1.2fr_0.9fr] lg:items-center">
        <section className="rounded-[32px] border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-8 text-slate-950 dark:text-white shadow-2xl sm:p-10 flex flex-col justify-center relative overflow-hidden">
          {/* Subtle glow effect */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand/10 dark:bg-brand/20 blur-3xl rounded-full -mr-20 -mt-20 pointer-events-none" />
          
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <Logo variant="horizontal" size="lg" />
          </div>
          <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.15] relative z-10">
            Team Workspace Invitation
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-600 dark:text-dark-muted font-medium relative z-10">
            Join your colleagues in a shared feedback intelligence hub. Monitor customer trends, analyze sentiments, and collaborate.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 relative z-10">
            {[
              "Workspace isolated security protections",
              "Role-based action control models",
              "Collaborative theme labeling workflows",
              "Dynamic Voice of Customer executive briefs"
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-elevated p-4 text-sm font-semibold text-slate-700 dark:text-dark-secondaryText shadow-sm"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[32px] border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-8 shadow-2xl sm:p-10 flex flex-col justify-center relative overflow-hidden">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-brand">
            Accept Invitation
          </p>
          <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
            Join Workspace
          </h2>
          <div className="mt-8 relative z-10">
            <Suspense fallback={<div className="text-xs text-slate-400 font-semibold">Loading invitation form...</div>}>
              <InvitationForm />
            </Suspense>
          </div>
        </section>
      </div>
    </main>
  );
}
