export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// GET - List all workspaces user has access to
export async function GET() {
  if (process.env.npm_lifecycle_event === "build") return NextResponse.json([]);

  const session = await auth();
  try {
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Get all memberships
    const memberships = await prisma.workspaceMembership.findMany({
      where: { userId },
      include: {
        workspace: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true
                  }
                }
              }
            },
            _count: {
              select: {
                feedback: true,
                reports: true,
                themes: true
              }
            }
          }
        }
      }
    });

    const workspaces = memberships.map(m => {
      const ws = m.workspace;
      const ownerMember = ws.members.find(member => member.role === "OWNER");
      
      return {
        id: ws.id,
        name: ws.name,
        slug: ws.slug,
        owner: ownerMember?.user?.name || "System Admin",
        membersCount: ws.members.length,
        feedbackCount: ws._count.feedback,
        reportsCount: ws._count.reports,
        themesCount: ws._count.themes,
        createdAt: ws.createdAt,
        updatedAt: ws.updatedAt,
        plan: m.role === "OWNER" ? "Enterprise" : "Startup",
        storageUsed: `${(ws._count.feedback * 1.2).toFixed(1)} MB`,
        storageLimit: "10 GB",
        isActive: true
      };
    });

    return NextResponse.json({ workspaces });
  } catch (error) {
    console.error("GET workspaces API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create a new workspace
export async function POST(req: Request) {
  const session = await auth();
  try {
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { name } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Workspace name is required." }, { status: 400 });
    }

    const slug = name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]/g, "") + "-" + Math.floor(1000 + Math.random() * 9000);

    // Create workspace and add owner membership in a single transaction
    const newWorkspace = await prisma.$transaction(async (tx) => {
      const ws = await tx.workspace.create({
        data: { name, slug }
      });

      await tx.workspaceMembership.create({
        data: {
          userId,
          workspaceId: ws.id,
          role: "OWNER"
        }
      });

      // Insert initial activity log
      await tx.activityLog.create({
        data: {
          workspaceId: ws.id,
          label: `Workspace "${name}" was initialized by creator.`,
          timeLabel: "Just now"
        }
      });

      return ws;
    });

    return NextResponse.json({
      message: "Workspace created successfully.",
      workspace: newWorkspace
    });
  } catch (error) {
    console.error("POST create workspace API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
