import { prisma } from "@/lib/prisma";
import { MessageRole } from "@prisma/client";

export class ConversationRepository {
  /**
   * Fetch all conversations for a specific workspace and user.
   * Returns a paginated list of chat histories.
   */
  static async getConversationsByWorkspace(workspaceId: string, userId: string, limit = 20, offset = 0) {
    return await prisma.conversation.findMany({
      where: {
        workspaceId,
        userId,
      },
      orderBy: {
        updatedAt: "desc"
      },
      take: limit,
      skip: offset,
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
      }
    });
  }

  /**
   * Fetch a specific conversation with all of its messages and attachments.
   */
  static async getConversationById(conversationId: string, userId: string) {
    return await prisma.conversation.findUnique({
      where: {
        id: conversationId,
        userId: userId // Ensure user owns the conversation
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc"
          },
          include: {
            attachments: true
          }
        }
      }
    });
  }

  /**
   * Create a new conversation session.
   */
  static async createConversation(workspaceId: string, userId: string, initialMessageContent: string) {
    // Generate a quick title based on the first message (or let the AI generate it later in Phase 6)
    const title = initialMessageContent.slice(0, 40) + (initialMessageContent.length > 40 ? "..." : "");

    return await prisma.conversation.create({
      data: {
        title,
        workspaceId,
        userId,
        messages: {
          create: {
            role: MessageRole.USER,
            content: initialMessageContent
          }
        }
      },
      include: {
        messages: true
      }
    });
  }

  /**
   * Add a single message to an existing conversation.
   */
  static async addMessage(conversationId: string, role: MessageRole, content: string, tokens?: number) {
    return await prisma.message.create({
      data: {
        conversationId,
        role,
        content,
        tokens
      }
    });
  }

  /**
   * Delete a conversation.
   */
  static async deleteConversation(conversationId: string, userId: string) {
    // Uses Cascade delete to wipe messages and attachments automatically
    return await prisma.conversation.delete({
      where: {
        id: conversationId,
        userId: userId
      }
    });
  }
}
