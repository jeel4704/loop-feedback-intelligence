export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request,  context: { params: { id: string } }) {
  const params = context?.params || ({} as any);
  const session = await auth();
  try {
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const workspaceId = params.id;

    // Check permissions
    const member = await prisma.workspaceMembership.findFirst({
      where: { userId, workspaceId }
    });

    if (!member || (member.role !== "OWNER" && member.role !== "ADMIN")) {
      return NextResponse.json({ error: "Access denied. Admin rights required." }, { status: 403 });
    }

    const { email, role } = await req.json();

    if (!email || !role) {
      return NextResponse.json({ error: "Email and role are required fields." }, { status: 400 });
    }

    // Find if user exists
    let targetUser = await prisma.user.findUnique({
      where: { email }
    });

    // If target user doesn't exist, create a placeholder user
    if (!targetUser) {
      targetUser = await prisma.user.create({
        data: {
          email,
          name: email.split("@")[0]
        }
      });
    }

    // Check if membership already exists
    const existingMembership = await prisma.workspaceMembership.findFirst({
      where: { userId: targetUser.id, workspaceId }
    });

    if (existingMembership) {
      return NextResponse.json({ error: "User is already a member of this workspace." }, { status: 400 });
    }

    // Create membership
    const newMembership = await prisma.workspaceMembership.create({
      data: {
        userId: targetUser.id,
        workspaceId,
        role: role as any
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        workspaceId,
        label: `Invitation sent to ${email} as ${role}.`,
        timeLabel: "Just now"
      }
    });

    return NextResponse.json({
      message: "Member invited successfully.",
      membership: newMembership
    });
  } catch (error) {
    console.error("POST invite member API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
