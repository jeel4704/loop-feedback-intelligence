import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { logSecurityEvent, checkLoginRateLimit, recordFailedLogin, clearLoginAttempts } from "@/lib/audit";
import { z } from "zod";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(64)
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;

        // 1. Brute force rate limit check
        const rateCheck = checkLoginRateLimit(email);
        if (rateCheck.blocked) {
          const minutesLeft = Math.ceil(rateCheck.remainingMs / 60000);
          await logSecurityEvent({
            email,
            action: "LOGIN_FAILED",
            detail: `Rate-limited login attempt. Account locked for ${minutesLeft} more minute(s).`
          });
          return null;
        }

        // 2. Fetch user from PostgreSQL
        const user = await prisma.user.findUnique({
          where: { email }
        });

        if (!user || !user.passwordHash) {
          recordFailedLogin(email);
          await logSecurityEvent({
            email,
            action: "LOGIN_FAILED",
            detail: "User not found or no password hash."
          });
          return null;
        }

        // 3. Validate PBKDF2 Password Hash
        const isValid = verifyPassword(password, user.passwordHash);
        if (!isValid) {
          const locked = recordFailedLogin(email);
          await logSecurityEvent({
            email,
            userId: user.id,
            action: locked ? "ACCOUNT_LOCKED" : "LOGIN_FAILED",
            detail: locked
              ? `Account temporarily locked after ${5} failed attempts.`
              : "Invalid password."
          });
          return null;
        }

        // 4. Successful login — clear rate limit records
        clearLoginAttempts(email);

        // 5. Retrieve Workspace membership role
        const membership = await prisma.workspaceMembership.findFirst({
          where: { userId: user.id },
          include: { workspace: true }
        });

        // 6. Audit log the successful login
        await logSecurityEvent({
          email,
          userId: user.id,
          workspaceId: membership?.workspaceId,
          action: "LOGIN_SUCCESS",
          detail: `Successful login for ${user.name || email}.`
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          workspaceId: membership?.workspaceId || null,
          workspaceSlug: membership?.workspace?.slug || null,
          workspaceName: membership?.workspace?.name || null,
          role: membership?.role || null
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.workspaceId = (user as any).workspaceId;
        token.workspaceSlug = (user as any).workspaceSlug;
        token.workspaceName = (user as any).workspaceName;
        token.role = (user as any).role;
      }
      if (trigger === "update" && session?.user) {
        if (session.user.name) token.name = session.user.name;
        if (session.user.workspaceName) token.workspaceName = session.user.workspaceName;
        if (session.user.workspaceSlug) token.workspaceSlug = session.user.workspaceSlug;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).workspaceId = token.workspaceId;
        (session.user as any).workspaceSlug = token.workspaceSlug;
        (session.user as any).workspaceName = token.workspaceName;
        (session.user as any).role = token.role;
      }
      return session;
    }
  }
});
