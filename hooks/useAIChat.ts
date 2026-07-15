"use client";

import { useState, useRef, useEffect } from "react";
import { Message, useChatContext } from "@/contexts/ChatContext";
import { useRouter } from "next/navigation";

export function useAIChat(chatId: string) {
  const { conversations, setConversations, setActiveChatId } = useChatContext();
  const router = useRouter();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Load full chat on mount or when ID changes
  useEffect(() => {
    if (!chatId || chatId.startsWith("chat_")) {
      // It's a new unsaved chat, just sync local state
      const chat = conversations.find(c => c.id === chatId);
      if (chat) {
         setMessages(chat.messages);
      }
      return;
    }

    const loadChat = async () => {
      try {
        const res = await fetch(`/api/ai/conversations/${chatId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.conversation) {
            const mappedMessages: Message[] = data.conversation.messages.map((m: any) => ({
              id: m.id,
              role: m.role.toLowerCase(),
              content: m.content,
              timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }));
            setMessages(mappedMessages);
            
            // Sync with global history
            setConversations(prev => prev.map(c => 
              c.id === chatId ? { ...c, messages: mappedMessages } : c
            ));
          }
        }
      } catch (err) {
        console.error("Failed loading chat:", err);
        setError(err as Error);
      }
    };
    loadChat();
  }, [chatId]);

  // Auto-scroll effect
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    let currentChatId = chatId;
    
    const userMsg: Message = {
      id: `msg_user_${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Optimistic UI updates
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setError(null);

    // Sync title dynamically
    setConversations(prev => prev.map(c => {
      if (c.id === currentChatId) {
        return {
          ...c,
          title: c.title === "New AI Conversation" ? (content.length > 25 ? `${content.substring(0, 25)}...` : content) : c.title,
          updatedAt: new Date().toISOString()
        };
      }
      return c;
    }));

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          conversationId: currentChatId.startsWith("chat_") ? undefined : currentChatId,
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!res.ok) throw new Error("API Failure connection");
      if (!res.body) throw new Error("No response body");

      // Handle DB real ID upgrade for new chats
      const realDbId = res.headers.get("X-Conversation-Id");
      if (realDbId && currentChatId !== realDbId) {
        setConversations(prev => prev.map(c => 
          c.id === currentChatId ? { ...c, id: realDbId } : c
        ));
        setActiveChatId(realDbId);
        currentChatId = realDbId;
        router.push(`/ask-loop/chat/${realDbId}`); // URL navigation exactly as requested
      }

      setIsLoading(false); // End loading phase to start streaming phase

      const aiMsgId = `msg_ai_${Date.now()}`;
      setMessages(prev => [...prev, {
        id: aiMsgId,
        role: "assistant",
        content: "",
        isStreaming: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullAnswer = "";

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, isStreaming: false } : m));
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        
        // Vercel AI Data Stream cleaner
        const lines = chunk.split('\n').filter(Boolean);
        for (const line of lines) {
          if (line.startsWith('0:')) {
            try {
              const text = JSON.parse(line.substring(2));
              fullAnswer += text;
            } catch {
              fullAnswer += line;
            }
          } else {
            fullAnswer += line;
          }
        }

        setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, content: fullAnswer, isStreaming: true } : m));
      }

    } catch (err) {
      console.error("Stream failed:", err);
      setIsLoading(false);
      setError(err as Error);
      setMessages(prev => [...prev, {
        id: `msg_ai_err_${Date.now()}`,
        role: "assistant",
        content: "⚠️ **Network Failure / API Timeout**\nCould not contact Ask LOOP AI server. Please verify your connection status and click regenerate.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }
  };

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    chatEndRef
  };
}
