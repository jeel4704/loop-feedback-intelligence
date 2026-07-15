"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  isStreaming?: boolean;
  citations?: { id: string; customer: string; quote: string; sentiment: string }[];
  suggestedActions?: { label: string; action: string }[];
  followUpSuggestions?: string[];
  feedback?: "like" | "dislike" | null;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: string;
  isPinned: boolean;
}

interface ChatContextType {
  conversations: Conversation[];
  activeChatId: string | null;
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  setActiveChatId: (id: string | null) => void;
  createNewChat: (initialQuery?: string) => string;
  deleteChat: (id: string) => Promise<void>;
  togglePinChat: (id: string) => void;
  renameChat: (id: string, newTitle: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  // Sync activeChatId with URL params based on /chat/[id]
  useEffect(() => {
    if (pathname.includes("/ask-loop/chat/")) {
      const parts = pathname.split("/");
      const id = parts[parts.length - 1];
      if (id && id !== activeChatId) {
        setActiveChatId(id);
      }
    } else if (pathname === "/ask-loop") {
      setActiveChatId(null);
    }
  }, [pathname]);

  // Load history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/ai/conversations");
        if (res.ok) {
          const data = await res.json();
          if (data.conversations) {
            const dbConvs: Conversation[] = data.conversations.map((c: any) => ({
              id: c.id,
              title: c.title || "New Chat",
              messages: [], 
              updatedAt: c.updatedAt,
              isPinned: false
            }));
            setConversations(dbConvs);
          }
        }
      } catch (err) {
        console.error("Failed loading chat history:", err);
      }
    };
    fetchHistory();
  }, []);

  const createNewChat = (initialQuery?: string) => {
    const newChat: Conversation = {
      id: `chat_${Date.now()}`,
      title: initialQuery ? (initialQuery.length > 25 ? `${initialQuery.substring(0, 25)}...` : initialQuery) : "New AI Conversation",
      messages: [],
      updatedAt: new Date().toISOString(),
      isPinned: false
    };
    setConversations(prev => [newChat, ...prev]);
    return newChat.id;
  };

  const deleteChat = async (id: string) => {
    const filtered = conversations.filter(c => c.id !== id);
    setConversations(filtered);
    
    if (activeChatId === id) {
      router.push("/ask-loop");
    }

    if (!id.startsWith("chat_")) {
      await fetch(`/api/ai/conversations/${id}`, { method: "DELETE" }).catch(console.error);
    }
  };

  const togglePinChat = (id: string) => {
    setConversations(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, isPinned: !c.isPinned } : c);
      return updated.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return 0;
      });
    });
  };

  const renameChat = (id: string, newTitle: string) => {
    if (newTitle.trim()) {
      setConversations(prev => prev.map(c => 
        c.id === id ? { ...c, title: newTitle.trim() } : c
      ));
    }
  };

  return (
    <ChatContext.Provider value={{
      conversations,
      activeChatId,
      setConversations,
      setActiveChatId,
      createNewChat,
      deleteChat,
      togglePinChat,
      renameChat
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
}
