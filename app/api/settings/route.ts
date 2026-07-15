import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const workspaceId = (session.user as any).workspaceId;

    const { type, name, slug, fullName } = await req.json();

    if (type === "workspace") {
      if (!name || !slug) {
        return NextResponse.json({ error: "Workspace name and slug are required." }, { status: 400 });
      }

      // Check if slug is taken by another workspace
      const existingWorkspace = await prisma.workspace.findFirst({
        where: {
          slug,
          NOT: { id: workspaceId }
        }
      });

      if (existingWorkspace) {
        return NextResponse.json({ error: "This workspace slug is already taken." }, { status: 400 });
      }

      const updatedWorkspace = await prisma.workspace.update({
        where: { id: workspaceId },
        data: { name, slug }
      });

      return NextResponse.json({
        message: "Workspace updated successfully.",
        workspace: updatedWorkspace
      });
    }

    if (type === "profile") {
      if (!fullName) {
        return NextResponse.json({ error: "Full name is required." }, { status: 400 });
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { name: fullName }
      });

      return NextResponse.json({
        message: "Profile updated successfully.",
        user: updatedUser
      });
    }

    return NextResponse.json({ error: "Invalid update type specify workspace or profile." }, { status: 400 });
  } catch (error) {
    console.error("Settings update api error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
