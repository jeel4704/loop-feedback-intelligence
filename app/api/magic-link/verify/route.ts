export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Verify magic‑link token and create Workspace, User and Membership.
 * This route lives under `/api/magic-link/verify` to avoid colliding with
 * NextAuth's `/api/auth/*` catch‑all which expects auth actions.
 */
export async function GET(req: Request) {
  if (process.env.NEXT_BUILD_PHASE === "true" || process.env.npm_lifecycle_event === "build") return NextResponse.json([]);

  try {
    const searchParams = (req.nextUrl?.searchParams || new URL(req.url || 'http://localhost').searchParams);
    const token = searchParams.get("token");
    if (!token) {
      return NextResponse.redirect(new URL("/login?error=invalid_token", req.url));
    }

    const pending = await prisma.pendingUser.findUnique({ where: { token } });
    if (!pending) {
      return NextResponse.redirect(new URL("/login?error=invalid_token", req.url));
    }

    if (pending.usedAt) {
      // Already verified – redirect to login with a positive notification
      return NextResponse.redirect(new URL("/login?message=verified", req.url));
    }
    if (new Date() > pending.expiresAt) {
      return NextResponse.redirect(new URL("/login?error=expired_token", req.url));
    }

    // Build a slug for the workspace – ensure uniqueness.
    const baseSlug = pending.workspaceName
      ?.toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "my-workspace";
    let workspaceSlug = baseSlug;
    const existing = await prisma.workspace.findUnique({ where: { slug: workspaceSlug } });
    if (existing) {
      workspaceSlug = `${workspaceSlug}-${Math.random().toString(36).substr(2, 5)}`;
    }

    await prisma.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({
        data: { name: pending.workspaceName ?? "Unnamed", slug: workspaceSlug },
      });
      const user = await tx.user.create({
        data: {
          name: pending.name ?? "",
          email: pending.email,
          passwordHash: pending.passwordHash,
        },
      });
      await tx.workspaceMembership.create({
        data: { userId: user.id, workspaceId: workspace.id, role: "OWNER" },
      });
      await tx.pendingUser.update({
        where: { token },
        data: { usedAt: new Date() },
      });

      // Migrate existing feedback from preseeded default workspace
      const seededWorkspace = await tx.workspace.findFirst({
        where: { slug: "northstar-labs" }
      });
      if (seededWorkspace && seededWorkspace.id !== workspace.id) {
        await tx.feedback.updateMany({
          where: { workspaceId: seededWorkspace.id },
          data: { workspaceId: workspace.id }
        });
        await tx.theme.updateMany({
          where: { workspaceId: seededWorkspace.id },
          data: { workspaceId: workspace.id }
        });
        await tx.report.updateMany({
          where: { workspaceId: seededWorkspace.id },
          data: { workspaceId: workspace.id }
        });
      }
    });

    // Redirect the user to the sign‑in page after successful verification.
    return NextResponse.redirect(new URL('/login?message=verified', req.url));
  } catch (error: any) {
    console.error("Magic link verification error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
