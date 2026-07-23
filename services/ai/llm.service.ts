import { createGroq } from "@ai-sdk/groq";
import { generateText, streamText } from "ai";
import { PromptBuilder } from "./prompt.builder";

interface ChatRequest {
  messages: any[];
  systemContext: {
    user: any;
    workspace: any;
    additionalContext?: string;
  };
  onFinish?: (event: any) => Promise<void> | void;
}

export class LLMService {
  private static getGroqProvider() {
    return createGroq({
      apiKey: process.env.GROQ_API_KEY || "dummy-key-to-bypass-build-check",
    });
  }

  /**
   * The default model used for AI Assistant chats.
   * Fetches dynamically from environment variables, defaults to LLaMA 3.3.
   */
  private static getModelName(): string {
    return process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
  }

  /**
   * Processes a non-streaming chat request.
   */
  static async generateChatResponse({ messages, systemContext }: ChatRequest) {
    const systemPrompt = PromptBuilder.buildSystemPrompt(systemContext);
    const modelId = this.getModelName();
    const groq = this.getGroqProvider();

    const { text, usage } = await generateText({
      model: groq(modelId),
      system: systemPrompt,
      messages,
      temperature: 0.2, // Keep responses analytical and grounded
    });

    const anyUsage = usage as any;

    return {
      text,
      usage: {
        promptTokens: anyUsage?.promptTokens || 0,
        completionTokens: anyUsage?.completionTokens || 0,
        totalTokens: anyUsage?.totalTokens || 0,
        model: modelId
      }
    };
  }

  /**
   * Processes a streaming chat request (SSE).
   */
  static async streamChatResponse({ messages, systemContext, onFinish }: ChatRequest) {
    const systemPrompt = PromptBuilder.buildSystemPrompt(systemContext);
    const modelId = this.getModelName();
    const groq = this.getGroqProvider();

    const stream = await streamText({
      model: groq(modelId),
      system: systemPrompt,
      messages,
      temperature: 0.2,
      onFinish,
    });

    return {
      stream,
      model: modelId
    };
  }
}
