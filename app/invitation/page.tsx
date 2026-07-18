"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button, Input, Badge, Logo } from "@/components/ui";

function InvitationForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [loadingDetails, setLoadingDetails] = useState(true);
  const [workspaceName, setWorkspaceName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");

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

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      // Direct acceptance of invitation via PUT request (token-only authentication)
      const res = await fetch("/api/auth/invitation", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          name,
          password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to complete account registration.");
        setLoading(false);
        return;
      }

      setLoading(false);

      // Redirect to Login page with success indicator
      router.push("/login?message=verified" as any);
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
      <div className="space-y-4 py-8">
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs font-semibold text-rose-700">
          {error}
        </div>
        <Link href="/" className="text-xs text-blue-600 hover:text-blue-700 font-medium block text-center">
          Go back to Home
        </Link>
      </div>
    );
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {/* Workspace & Pre-assigned Locked Role Badge */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
        <div className="flex justify-between items-center text-xs font-bold text-slate-500">
          <span>Workspace</span>
          <span className="text-slate-800 uppercase tracking-tight">{workspaceName}</span>
        </div>
        <div className="flex justify-between items-center text-xs font-bold text-slate-500">
          <span>Assigned Role</span>
          <Badge variant="blue" className="uppercase">{role}</Badge>
        </div>
        <p className="text-[10px] text-slate-400 italic">
          * (Your workspace role is locked and pre-assigned by the workspace Owner)
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700">
          {error}
        </div>
      )}

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">
          Full Name
        </span>
        <Input 
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jane Doe" 
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-400">
          Business Email (Read Only)
        </span>
        <Input 
          type="email"
          disabled
          value={email}
          className="bg-slate-100/80 border-slate-200 text-slate-400 font-medium"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">
          Password
        </span>
        <Input 
          type="password" 
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Create secure password (min 8 chars)" 
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">
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

      <Button type="submit" fullWidth disabled={loading}>
        {loading ? "Processing..." : "Create Account"}
      </Button>
    </form>
  );
}

export default function InvitationPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.14),_transparent_25%),linear-gradient(to_bottom,_#f8fbff,_#eef2ff)] px-6 py-16">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.2fr_0.9fr]">
        <section className="rounded-[32px] border border-slate-200 bg-slate-950 p-8 text-white shadow-[0_24px_80px_-32px_rgba(15,23,42,0.85)] sm:p-10">
          <div className="flex items-center gap-3 mb-6">
            <Logo variant="horizontal" size="lg" />
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">
            Team Workspace Invitation
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300">
            Join your colleagues in a shared feedback intelligence hub. Monitor customer trends, analyze sentiments, and collaborate.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              "Workspace isolated security protections",
              "Role-based action control models",
              "Collaborative theme labeling workflows",
              "Dynamic Voice of Customer executive briefs"
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-slate-200"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">
            Accept Invitation
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            Create Team Account
          </h2>
          <div className="mt-8">
            <Suspense fallback={<div className="text-xs text-slate-400 font-semibold">Loading invitation form...</div>}>
              <InvitationForm />
            </Suspense>
          </div>
        </section>
      </div>
    </main>
  );
}
