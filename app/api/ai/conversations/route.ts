import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { ConversationRepository } from "@/repositories/conversation.repository";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Defaulting to the user's first workspace if none passed via query
    const url = new URL(req.url);
    let workspaceId = url.searchParams.get("workspaceId");

    if (!workspaceId) {
      const membership = await prisma.workspaceMembership.findFirst({
        where: { userId: session.user.id }
      });
      if (membership) workspaceId = membership.workspaceId;
    }

    if (!workspaceId) {
       return NextResponse.json({ conversations: [] });
    }

    const conversations = await ConversationRepository.getConversationsByWorkspace(
      workspaceId,
      session.user.id
    );

    return NextResponse.json({ conversations });
  } catch (err) {
    console.error("[GET Conversations API Error]", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
