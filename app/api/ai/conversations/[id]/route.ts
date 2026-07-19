export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { ConversationRepository } from "@/repositories/conversation.repository";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const conversation = await ConversationRepository.getConversationById(params.id, session.user.id);
    if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ conversation });
  } catch (err) {
    console.error("[GET Conversation Details Error]", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await ConversationRepository.deleteConversation(params.id, session.user.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE Conversation Error]", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
