export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import { sendInvitationEmail } from "@/lib/email";
import crypto from "crypto";

// 1. GET - Fetch invitation details for display on registration page (Locked Badge)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: { workspace: true }
    });

    if (!invitation) {
      return NextResponse.json({ error: "Invitation not found or invalid" }, { status: 404 });
    }

    if (invitation.acceptedAt) {
      return NextResponse.json({ error: "Invitation has already been accepted" }, { status: 400 });
    }

    if (new Date() > invitation.expiresAt) {
      return NextResponse.json({ error: "Invitation has expired" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: invitation.email },
      select: { id: true }
    });

    return NextResponse.json({
      email: invitation.email,
      workspaceName: invitation.workspace.name,
      role: invitation.role,
      userExists: !!user
    }, { status: 200 });
  } catch (error) {
    console.error("Fetch invitation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// 2. POST - Invite team member (restricted to OWNER or ADMIN)
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (userRole !== "OWNER" && userRole !== "ADMIN") {
      return NextResponse.json({ error: "Only owners and admins can invite users" }, { status: 403 });
    }

    const workspaceId = (session.user as any).workspaceId;
    if (!workspaceId) {
      return NextResponse.json({ error: "User is not assigned to a workspace" }, { status: 400 });
    }

    const { email, role } = await req.json();

    if (!email || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const validRoles = ["ADMIN", "ANALYST", "VIEWER"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role specified" }, { status: 400 });
    }

    // Check if user is already a member
    const existingMembership = await prisma.workspaceMembership.findFirst({
      where: {
        workspaceId,
        user: { email }
      }
    });

    if (existingMembership) {
      return NextResponse.json({ error: "User is already a member of this workspace" }, { status: 400 });
    }

    // Generate secure token and OTP code
    const token = crypto.randomBytes(32).toString("hex");
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours validity

    // Upsert invitation
    await prisma.invitation.upsert({
      where: { token },
      update: {
        email,
        role: role as any,
        code,
        expiresAt
      },
      create: {
        email,
        workspaceId,
        role: role as any,
        token,
        code,
        expiresAt
      }
    });

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId }
    });
    const workspaceName = workspace?.name || "LOOP Workspace";

    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
    const inviteUrl = `${baseUrl}/invite/${token}`;

    // Send invitation email
    await sendInvitationEmail(email, inviteUrl, workspaceName, role);

    console.log(`\n======================================================`);
    console.log(`📬 [TEAM INVITATION] Invitation link generated:`);
    console.log(`🔗 Link: ${inviteUrl}`);
    console.log(`🏢 Workspace ID: ${workspaceId}`);
    console.log(`👥 Target Role: ${role}`);
    console.log(`======================================================\n`);

    return NextResponse.json({ message: "Invitation sent successfully", inviteUrl }, { status: 201 });
  } catch (error) {
    console.error("Invite team member error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// 3. PUT - Accept invitation & create account (Link Verification)
export async function PUT(req: Request) {
  try {
    const { token, name, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Missing required registration parameters" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 });
    }

    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: { workspace: true }
    });

    if (!invitation) {
      return NextResponse.json({ error: "Invitation not found or invalid" }, { status: 404 });
    }

    if (invitation.acceptedAt) {
      return NextResponse.json({ error: "Invitation already accepted" }, { status: 400 });
    }

    if (new Date() > invitation.expiresAt) {
      return NextResponse.json({ error: "Invitation code has expired" }, { status: 400 });
    }

    // Determine if user exists
    const existingUser = await prisma.user.findUnique({ where: { email: invitation.email } });

    if (existingUser) {
      // Existing User Flow: Verify password
      const isValid = verifyPassword(password, existingUser.passwordHash!);
      if (!isValid) {
        return NextResponse.json({ error: "Incorrect password for this existing account." }, { status: 401 });
      }

      await prisma.$transaction(async (tx) => {
        // Create Workspace Membership if not exists
        const membershipExists = await tx.workspaceMembership.findFirst({
          where: { userId: existingUser.id, workspaceId: invitation.workspaceId }
        });

        if (!membershipExists) {
          await tx.workspaceMembership.create({
            data: {
              userId: existingUser.id,
              workspaceId: invitation.workspaceId,
              role: invitation.role
            }
          });
        }

        // Mark invitation as accepted
        await tx.invitation.update({
          where: { id: invitation.id },
          data: { acceptedAt: new Date() }
        });
      });

      return NextResponse.json({ message: "Invitation accepted for existing user" }, { status: 200 });

    } else {
      // New User Flow
      if (!name) {
        return NextResponse.json({ error: "Name is required for new accounts." }, { status: 400 });
      }

      const passwordHash = hashPassword(password);

      await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            name,
            email: invitation.email,
            passwordHash
          }
        });

        await tx.workspaceMembership.create({
          data: {
            userId: newUser.id,
            workspaceId: invitation.workspaceId,
            role: invitation.role
          }
        });

        await tx.invitation.update({
          where: { id: invitation.id },
          data: { acceptedAt: new Date() }
        });
      });

      return NextResponse.json({ message: "Invitation accepted and account registered" }, { status: 200 });
    }
  } catch (error) {
    console.error("Accept invitation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
