"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/tables";
import { Badge, Button, SectionHeader, Input, Select, Card, CardContent } from "@/components/ui";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";

const roleVariant = {
  OWNER: "indigo",
  ADMIN: "blue",
  ANALYST: "indigo",
  VIEWER: "slate"
} as const;

interface Member {
  name: string;
  email: string;
  role: "OWNER" | "ADMIN" | "ANALYST" | "VIEWER";
  workspaceName: string;
}

export default function MembersPage() {
  const { data: session } = useSession();
  const loggedInUserRole = (session?.user as any)?.role || "VIEWER";
  const canInvite = loggedInUserRole === "OWNER" || loggedInUserRole === "ADMIN";

  const [membersList, setMembersList] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  // Invite states
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("ANALYST");
  const [inviteResult, setInviteResult] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchMembers = () => {
    fetch("/api/users")
      .then(async (res) => {
        if (!res.ok) throw new Error();
        const data = await res.json();
        setMembersList(data.items || []);
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInviteResult(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/invitation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate invitation.");
      }

      setInviteResult(data.inviteUrl);
      setInviteEmail("");
      fetchMembers(); // reload list
    } catch (err: any) {
      setError(err.message || "Failed to invite member.");
    } finally {
      setSubmitting(false);
    }
  };

  const rows = membersList.map((member) => {
    const initials = member.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    
    return [
      <div key={`${member.email}-identity`} className="flex items-center gap-3 py-0.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 dark:bg-brand/20 border border-indigo-200 dark:border-brand/30 text-indigo-700 dark:text-brand font-bold text-[11px] uppercase tracking-wider">
          {initials}
        </div>
        <div>
          <p className="font-bold text-[13px] text-slate-950 dark:text-gray-100">{member.name}</p>
          <p className="mt-0.5 text-[11.5px] text-slate-500 dark:text-dark-muted font-medium">{member.email}</p>
        </div>
      </div>,
      <Badge
        key={`${member.email}-role`}
        variant={roleVariant[member.role] || "slate"}
        className="w-fit font-bold uppercase tracking-wider text-[10px]"
      >
        {member.role}
      </Badge>,
      <span key={`${member.email}-scope`} className="text-xs font-semibold text-slate-600 dark:text-dark-secondaryText bg-slate-100 dark:bg-dark-elevated px-2.5 py-1 rounded-md border border-slate-200 dark:border-dark-border">
        {member.workspaceName}
      </span>
    ];
  });

  return (
    <div className="space-y-6 ">
      <SectionHeader 
        eyebrow="Workspace Access"
        title="Manage members and roles"
        description="Invite teammates into the workspace and maintain role-based access for Admin, Analyst, and Viewer users."
        action={
          canInvite && (
            <Button onClick={() => setShowInviteForm(!showInviteForm)} className="bg-slate-950 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-black font-bold">
              {showInviteForm ? "Close Form" : "Invite Member"}
            </Button>
          )
        }
      />

      {/* Invite Member overlay block */}
      {showInviteForm && (
        <Card className="border border-brand/20 dark:border-brand/30 bg-indigo-50/30 dark:bg-brand/10 shadow-sm rounded-2xl overflow-hidden mt-6">
          <CardContent className="p-8">
            <h3 className="font-bold text-lg text-slate-950 dark:text-white">Invite Team Member</h3>
            <p className="text-[13px] text-slate-600 dark:text-gray-300 mt-1 font-medium max-w-2xl">
              Provide the business email and configure the pre-assigned role level. Generated credentials tokens appear in console logs.
            </p>

            {inviteResult ? (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="text-center py-8 max-w-md mx-auto"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.15 }}
                  className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 mb-5 shadow-sm border border-emerald-200 dark:border-emerald-500/30"
                >
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <motion.path
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.4, delay: 0.35, ease: "easeOut" }}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </motion.div>

                <h4 className="text-[15px] font-bold text-slate-900 dark:text-slate-100">
                  Invitation Sent Successfully!
                </h4>
                <p className="text-xs text-slate-500 dark:text-dark-muted mt-2 leading-relaxed font-medium">
                  An email containing the secure activation link has been delivered to the user's inbox. They will be added to the workspace after setting up their account.
                </p>

                <Button
                  onClick={() => {
                    setInviteResult(null);
                    setInviteEmail("");
                  }}
                  className="mt-6 text-xs font-bold text-slate-950 dark:text-white border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-elevated shadow-sm hover:bg-slate-50 dark:hover:bg-dark-hover"
                  variant="secondary"
                >
                  Invite Another Member
                </Button>
              </motion.div>
            ) : (
              <form onSubmit={handleInviteSubmit} className="mt-6 space-y-5 max-w-xl">
                {error && (
                  <div className="rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 p-3 text-xs font-semibold text-rose-700 dark:text-rose-400">
                    {error}
                  </div>
                )}

                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-xs font-bold text-slate-700 dark:text-gray-300">Business Email</span>
                    <Input
                      required
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="teammate@company.com"
                      className="text-[13px] font-medium"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs font-bold text-slate-700 dark:text-gray-300">Assigned Role</span>
                    <Select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                    >
                      <option value="ADMIN">Admin (Full Access)</option>
                      <option value="ANALYST">Analyst (Triage & Analytics)</option>
                      <option value="VIEWER">Viewer (Read-Only)</option>
                    </Select>
                  </label>
                </div>

                <Button type="submit" disabled={submitting} className="bg-brand hover:bg-brand-hover text-white font-bold text-xs mt-2">
                  {submitting ? "Sending invitation..." : "Send Invitation"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-12 text-[13px] text-slate-500 dark:text-dark-muted font-semibold animate-pulse">
          Loading workspace members...
        </div>
      ) : (
        <DataTable
          columns={[
            { key: "member", label: "Member" },
            { key: "role", label: "Role" },
            { key: "scope", label: "Workspace Scope" }
          ]}
          rows={rows}
        />
      )}
    </div>
  );
}
