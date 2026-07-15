import { Suspense } from "react";
import { AuthForm, AuthShell } from "@/components/auth";

export default function SignupPage() {
  return (
    <AuthShell
      title="Sign up"
      description="Create a LOOP workspace and invite your team into a shared feedback intelligence hub."
    >
      <Suspense fallback={<div className="text-xs text-slate-400 font-semibold">Loading registration form...</div>}>
        <AuthForm mode="signup" />
      </Suspense>
    </AuthShell>
  );
}
