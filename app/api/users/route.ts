import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";
export async function GET() {
  const session = await auth();
  try {
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaceId = (session.user as any).workspaceId;
    if (!workspaceId) {
      return NextResponse.json({ error: "No workspace isolated for session" }, { status: 400 });
    }

    const memberships = await prisma.workspaceMembership.findMany({
      where: { workspaceId },
      include: {
        user: true,
        workspace: true
      },
      orderBy: { createdAt: "asc" }
    });

    const items = memberships.map((m) => ({
      name: m.user.name || m.user.email.split("@")[0],
      email: m.user.email,
      role: m.role,
      workspaceName: m.workspace.name
    }));

    return NextResponse.json({ items }, { status: 200 });
  } catch (error) {
    console.error("Fetch workspace users error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
