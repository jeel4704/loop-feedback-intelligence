export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let workspaceId = (session.user as any).workspaceId;
    if (!workspaceId) {
      const membership = await prisma.workspaceMembership.findFirst({
        where: { userId: session.user.id }
      });
      if (membership) workspaceId = membership.workspaceId;
    }

    if (!workspaceId) {
      return NextResponse.json({ error: "No workspace found" }, { status: 400 });
    }

    const imports = await prisma.import.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    return NextResponse.json(imports);
  } catch (error) {
    console.error("Failed to fetch import history:", error);
    return NextResponse.json({ error: "Failed to fetch import history" }, { status: 500 });
  }
}
