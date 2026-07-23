import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { ConversationRepository } from "@/repositories/conversation.repository";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (process.env.NEXT_BUILD_PHASE === "true" || process.env.npm_lifecycle_event === "build") return NextResponse.json([]);

  // Move auth() outside try/catch so Next.js can catch its internal DynamicServerError during build!
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {

    // Defaulting to the user's first workspace if none passed via query
    let workspaceId = (req.nextUrl?.searchParams || new URL(req.url || 'http://localhost').searchParams).get("workspaceId");

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
