export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// PATCH - Update workspace member role
export async function PATCH(req: Request, { params }: { params: { id: string, memberId: string } }) {
  const session = await auth();
  try {
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const workspaceId = params.id;
    const memberUserId = params.memberId;

    // Check caller permission (OWNER or ADMIN)
    const callerMember = await prisma.workspaceMembership.findFirst({
      where: { userId, workspaceId }
    });

    if (!callerMember || (callerMember.role !== "OWNER" && callerMember.role !== "ADMIN")) {
      return NextResponse.json({ error: "Access denied. Admin rights required." }, { status: 403 });
    }

    // Verify if updating an owner role
    const targetMember = await prisma.workspaceMembership.findUnique({
      where: {
        userId_workspaceId: {
          userId: memberUserId,
          workspaceId
        }
      }
    });

    if (!targetMember) {
      return NextResponse.json({ error: "Member not found in this workspace." }, { status: 404 });
    }

    if (targetMember.role === "OWNER" && callerMember.role !== "OWNER") {
      return NextResponse.json({ error: "Only the OWNER can modify the OWNER role." }, { status: 403 });
    }

    const { role } = await req.json();

    if (!role) {
      return NextResponse.json({ error: "Role type is required." }, { status: 400 });
    }

    const updated = await prisma.workspaceMembership.update({
      where: {
        userId_workspaceId: {
          userId: memberUserId,
          workspaceId
        }
      },
      data: { role: role as any }
    });

    await prisma.activityLog.create({
      data: {
        workspaceId,
        label: `Member role updated to ${role} for user.`,
        timeLabel: "Just now"
      }
    });

    return NextResponse.json({
      message: "Member role updated successfully.",
      membership: updated
    });
  } catch (error) {
    console.error("PATCH update member role API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Remove member from workspace
export async function DELETE(req: Request, { params }: { params: { id: string, memberId: string } }) {
  const session = await auth();
  try {
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const workspaceId = params.id;
    const memberUserId = params.memberId;

    // Check permissions
    const callerMember = await prisma.workspaceMembership.findFirst({
      where: { userId, workspaceId }
    });

    if (!callerMember || (callerMember.role !== "OWNER" && callerMember.role !== "ADMIN")) {
      return NextResponse.json({ error: "Access denied. Admin rights required." }, { status: 403 });
    }

    const targetMember = await prisma.workspaceMembership.findUnique({
      where: {
        userId_workspaceId: {
          userId: memberUserId,
          workspaceId
        }
      }
    });

    if (!targetMember) {
      return NextResponse.json({ error: "Member not found." }, { status: 404 });
    }

    if (targetMember.role === "OWNER") {
      return NextResponse.json({ error: "Workspace OWNER cannot be removed." }, { status: 400 });
    }

    await prisma.workspaceMembership.delete({
      where: {
        userId_workspaceId: {
          userId: memberUserId,
          workspaceId
        }
      }
    });

    await prisma.activityLog.create({
      data: {
        workspaceId,
        label: `Member removed from workspace.`,
        timeLabel: "Just now"
      }
    });

    return NextResponse.json({
      message: "Member removed successfully."
    });
  } catch (error) {
    console.error("DELETE remove member API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
