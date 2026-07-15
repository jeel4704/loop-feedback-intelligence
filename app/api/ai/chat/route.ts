import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { LLMService } from "@/services/ai/llm.service";
import { ContextService } from "@/services/ai/context.service";
import { ConversationRepository } from "@/repositories/conversation.repository";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { IntentValidator } from "@/services/ai/intent.validator";

export const maxDuration = 60; // Allow Vercel Edge longer execution time for LLMs
// Ensure this route is dynamic and supports streaming
export const dynamic = "force-dynamic";

const chatRequestSchema = z.object({
  messages: z.array(z.any()), // Can be more strictly typed with CoreMessage if needed
  workspaceId: z.string().cuid().optional(),
  conversationId: z.string().cuid().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = session.user as any;

    // 2. Enforce Rate Limiting (15 requests per 1 minute per user)
    const { success } = rateLimit(user.id, 15, 60 * 1000);
    if (!success) {
      return NextResponse.json({ 
        error: "Rate limit exceeded. Please wait a minute before sending more queries." 
      }, { status: 429 });
    }

    // 3. Validate request body
    const body = await req.json();
    const parsed = chatRequestSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request payload", details: parsed.error }, { status: 400 });
    }

    const { messages, conversationId } = parsed.data;
    let { workspaceId } = parsed.data;

    // Fallback: If no workspaceId provided, grab the user's first workspace
    if (!workspaceId) {
      const firstMembership = await prisma.workspaceMembership.findFirst({
        where: { userId: user.id }
      });
      if (firstMembership) {
        workspaceId = firstMembership.workspaceId;
      } else {
        return NextResponse.json({ error: "No workspace associated with user" }, { status: 403 });
      }
    }

    const dbWorkspace = await prisma.workspace.findUnique({
      where: { id: workspaceId }
    });

    if (!dbWorkspace) {
      return NextResponse.json({ error: "Workspace not found or unauthorized" }, { status: 403 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id }
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 4. Save User Message to Database
    const lastUserMessage = messages[messages.length - 1]?.content || "Empty Message";
    let activeConversationId = conversationId;
    let isNewConversation = false;

    if (!activeConversationId || activeConversationId.startsWith("chat_")) {
      // It's a temporary client-side ID or missing, so create a real DB conversation
      const newChat = await ConversationRepository.createConversation(
        dbWorkspace.id,
        dbUser.id,
        lastUserMessage
      );
      activeConversationId = newChat.id;
      isNewConversation = true;
    } else {
      // Existing DB conversation
      await ConversationRepository.addMessage(activeConversationId, "USER", lastUserMessage);
    }

    // 4.5 INTENT VALIDATION LAYER
    if (!IntentValidator.isLoopIntent(lastUserMessage)) {
      // Off-topic: Reject without hitting LLM
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          controller.enqueue(encoder.encode(IntentValidator.refusalMessage));
          controller.close();
          // Save the rejection message
          await ConversationRepository.addMessage(activeConversationId, "ASSISTANT", IntentValidator.refusalMessage, 0);
        }
      });
      
      const response = new NextResponse(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
      if (isNewConversation) {
        response.headers.set("X-Conversation-Id", activeConversationId);
      }
      return response;
    }

    // Fetch real RAG context for this workspace using exact SQL aggregations
    const workspaceContext = await ContextService.getWorkspaceContext(dbWorkspace.id, lastUserMessage);

    // 5. Trigger AI Stream
    const { stream, model } = await LLMService.streamChatResponse({
      messages,
      systemContext: {
        user: dbUser,
        workspace: dbWorkspace,
        additionalContext: workspaceContext 
      },
      onFinish: async ({ text, usage }) => {
        // Automatically save the AI's response to the database once the stream completes
        await ConversationRepository.addMessage(activeConversationId, "ASSISTANT", text, usage?.totalTokens);
      }
    });

    // 6. Return the streaming response directly to the client
    const response = stream.toTextStreamResponse();
    
    // Inject the real database conversation ID so the client can update its optimistic UI
    if (isNewConversation) {
      response.headers.set("X-Conversation-Id", activeConversationId);
    }
    
    return response;

  } catch (error) {
    console.error("[Chat API Error]:", error);
    return NextResponse.json(
      { error: "Internal Server Error while communicating with AI provider." }, 
      { status: 500 }
    );
  }
}
