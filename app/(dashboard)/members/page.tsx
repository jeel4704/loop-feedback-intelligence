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

  const rows = membersList.map((member) => [
    <div key={`${member.email}-identity`}>
      <p className="font-bold text-xs text-slate-900">{member.name}</p>
      <p className="mt-1 text-[11px] text-slate-500">{member.email}</p>
    </div>,
    <Badge
      key={`${member.email}-role`}
      variant={roleVariant[member.role] || "slate"}
      className="w-fit font-bold"
    >
      {member.role}
    </Badge>,
    <span key={`${member.email}-scope`} className="text-xs font-semibold text-slate-500">
      {member.workspaceName}
    </span>
  ]);

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Workspace Access"
        title="Manage members and roles"
        description="Invite teammates into the workspace and maintain role-based access for Admin, Analyst, and Viewer users."
        action={
          canInvite && (
            <Button onClick={() => setShowInviteForm(!showInviteForm)}>
              {showInviteForm ? "Close Form" : "Invite Member"}
            </Button>
          )
        }
      />

      {/* Invite Member overlay block */}
      {showInviteForm && (
        <Card className="border border-blue-100 bg-blue-50/10">
          <CardContent className="p-6">
            <h3 className="font-bold text-sm text-slate-900">Invite Team Member</h3>
            <p className="text-xs text-slate-500 mt-1">
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
                  className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 mb-5 shadow-sm"
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

                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Invitation Sent Successfully!
                </h4>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  An email containing the secure activation link has been delivered to the user's inbox. They will be added to the workspace after setting up their account.
                </p>

                <Button
                  onClick={() => {
                    setInviteResult(null);
                    setInviteEmail("");
                  }}
                  className="mt-6 text-xs bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200"
                  variant="secondary"
                >
                  Invite Another Member
                </Button>
              </motion.div>
            ) : (
              <form onSubmit={handleInviteSubmit} className="mt-4 space-y-4 max-w-xl">
                {error && (
                  <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700">
                    {error}
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-xs font-medium text-slate-700">Business Email</span>
                    <Input
                      required
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="teammate@company.com"
                      className="text-xs"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs font-medium text-slate-700">Assigned Role</span>
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

                <Button type="submit" disabled={submitting}>
                  {submitting ? "Sending invitation..." : "Send Invitation"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-12 text-xs text-slate-400 font-semibold">
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
