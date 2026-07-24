import { Suspense } from "react";
import { AuthForm, AuthShell } from "@/components/auth";
import InvitationClient from "@/components/auth/invitation-client";

export default function LoginPage({ searchParams }: { searchParams: { inviteToken?: string } }) {
  if (searchParams?.inviteToken) {
    return <InvitationClient token={searchParams.inviteToken} />;
  }

  return (
    <AuthShell
      title="Login"
      description="Sign in to continue reviewing customer feedback across your workspace."
    >
      <Suspense fallback={<div className="text-xs text-slate-400 font-semibold">Loading authentication form...</div>}>
        <AuthForm mode="login" />
      </Suspense>
    </AuthShell>
  );
}
