"use client";

import React, { useState, useEffect } from "react";
import { Search, MessageSquare, Pin, Edit3, Trash2, Plus, Sparkles, Download, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { ChatProvider, useChatContext } from "@/contexts/ChatContext";
import { useRouter } from "next/navigation";

function AskLoopSidebar() {
  const { conversations, activeChatId, setActiveChatId, createNewChat, deleteChat, togglePinChat, renameChat } = useChatContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchHistory, setSearchHistory] = useState("");
  const [isRenamingId, setIsRenamingId] = useState<string>("");
  const [renameValue, setRenameValue] = useState("");
  const router = useRouter();

  // Filter conversations list by search
  const filteredHistoryList = conversations.filter(c => {
    const q = searchHistory.toLowerCase().trim();
    if (!q) return true;
    return (
      c.title.toLowerCase().includes(q) ||
      c.messages.some(m => m.content.toLowerCase().includes(q))
    );
  });

  const pinnedChats = filteredHistoryList.filter(c => c.isPinned);
  const unpinnedChats = filteredHistoryList.filter(c => !c.isPinned);

  const startRename = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRenamingId(id);
    setRenameValue(currentTitle);
  };

  const submitRename = (id: string) => {
    renameChat(id, renameValue);
    setIsRenamingId("");
  };

  const activeChat = conversations.find(c => c.id === activeChatId);

  const handleChatClick = (id: string) => {
    setActiveChatId(id);
    router.push(`/ask-loop/chat/${id}`);
  };

  const handleNewChat = () => {
    const newId = createNewChat();
    router.push(`/ask-loop/chat/${newId}`);
  };

  const exportConversation = (format: string) => {
    // Basic export logic placeholder (to be handled correctly)
    if (!activeChat) return;
    const text = activeChat.messages.map(m => `**${m.role.toUpperCase()}**\n${m.content}`).join("\n\n---\n\n");
    const blob = new Blob([text], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `LOOP_AI_Chat_${activeChat.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <AnimatePresence initial={false}>
        {isSidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0 bg-white dark:bg-dark-card border-r border-slate-200 dark:border-dark-border flex flex-col h-full z-10"
          >
            {/* Header: New Chat */}
            <div className="p-4 border-b border-slate-100 dark:border-dark-border flex items-center justify-between gap-2.5">
              <button 
                onClick={handleNewChat}
                className="flex-1 flex items-center justify-center gap-2 border border-indigo-200 hover:border-indigo-400 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-650 px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm transition dark:bg-indigo-950/40 dark:border-indigo-900 dark:text-indigo-400 dark:hover:bg-indigo-950/80"
              >
                <Plus className="h-4 w-4" />
                <span>New Chat</span>
              </button>
              
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 border border-slate-200 dark:border-dark-border rounded-xl hover:bg-slate-50 dark:hover:bg-dark-hover text-slate-500 hover:text-slate-700 shadow-sm"
                title="Collapse sidebar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Search filter input */}
            <div className="px-4 py-3 border-b border-slate-100 dark:border-dark-border">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search AI history..."
                  value={searchHistory}
                  onChange={(e) => setSearchHistory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl py-1.5 pl-9 pr-4 text-xs font-semibold text-slate-700 dark:text-slate-200 placeholder-slate-400 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* List: Scrollable history */}
            <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4 custom-scrollbar">
              {filteredHistoryList.length === 0 ? (
                <div className="text-center py-10 px-3 text-slate-400">
                  <MessageSquare className="h-6 w-6 mx-auto mb-2 text-slate-300 dark:text-slate-800" />
                  <p className="text-[11px] font-semibold">No conversations found</p>
                </div>
              ) : (
                <>
                  {/* Pinned conversations */}
                  {pinnedChats.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-[9.5px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-dark-muted px-2.5">
                        Pinned
                      </p>
                      {pinnedChats.map((chat) => (
                        <div
                          key={chat.id}
                          onClick={() => handleChatClick(chat.id)}
                          className={`group flex items-center justify-between gap-2 px-3 py-2 rounded-xl cursor-pointer transition ${
                            activeChatId === chat.id
                              ? "bg-slate-100 dark:bg-dark-elevated text-slate-900 dark:text-slate-50"
                              : "text-slate-655 hover:bg-slate-50 dark:text-slate-350 dark:hover:bg-dark-hover/40"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <MessageSquare className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                            {isRenamingId === chat.id ? (
                              <input
                                type="text"
                                value={renameValue}
                                onChange={(e) => setRenameValue(e.target.value)}
                                onBlur={() => submitRename(chat.id)}
                                onKeyDown={(e) => e.key === "Enter" && submitRename(chat.id)}
                                autoFocus
                                className="flex-1 bg-white border border-slate-300 rounded px-1 text-xs py-0.5 text-slate-900 outline-none"
                              />
                            ) : (
                              <span className="text-[11.5px] font-bold truncate">{chat.title}</span>
                            )}
                          </div>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={(e) => { e.stopPropagation(); togglePinChat(chat.id); }}
                              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500"
                              title="Unpin"
                            >
                              <Pin className="h-3 w-3 text-indigo-650" />
                            </button>
                            <button 
                              onClick={(e) => startRename(chat.id, chat.title, e)}
                              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500"
                              title="Rename"
                            >
                              <Edit3 className="h-3 w-3" />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); deleteChat(chat.id); }}
                              className="p-1 hover:bg-slate-200 dark:hover:bg-rose-950/60 rounded text-slate-500 hover:text-rose-500"
                              title="Delete"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Recents conversations */}
                  <div className="space-y-1">
                    <p className="text-[9.5px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-dark-muted px-2.5">
                      Conversations
                    </p>
                    {unpinnedChats.map((chat) => (
                      <div
                        key={chat.id}
                        onClick={() => handleChatClick(chat.id)}
                        className={`group flex items-center justify-between gap-2 px-3 py-2 rounded-xl cursor-pointer transition ${
                          activeChatId === chat.id
                            ? "bg-slate-100 dark:bg-dark-elevated text-slate-900 dark:text-slate-50"
                            : "text-slate-655 hover:bg-slate-50 dark:text-slate-350 dark:hover:bg-dark-hover/40"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <MessageSquare className="h-4 w-4 text-slate-400 dark:text-slate-550 flex-shrink-0" />
                          {isRenamingId === chat.id ? (
                            <input
                              type="text"
                              value={renameValue}
                              onChange={(e) => setRenameValue(e.target.value)}
                              onBlur={() => submitRename(chat.id)}
                              onKeyDown={(e) => e.key === "Enter" && submitRename(chat.id)}
                              autoFocus
                              className="flex-1 bg-white border border-slate-300 rounded px-1 text-xs py-0.5 text-slate-900 outline-none"
                            />
                          ) : (
                            <span className="text-[11.5px] font-bold truncate">{chat.title}</span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => { e.stopPropagation(); togglePinChat(chat.id); }}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-450 hover:text-indigo-650"
                            title="Pin to top"
                          >
                            <Pin className="h-3 w-3" />
                          </button>
                          <button 
                            onClick={(e) => startRename(chat.id, chat.title, e)}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-450"
                            title="Rename"
                          >
                            <Edit3 className="h-3 w-3" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); deleteChat(chat.id); }}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-rose-950/60 rounded text-slate-450 hover:text-rose-500"
                            title="Delete"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button if sidebar is hidden */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="absolute left-4 top-4 z-20 p-2 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-500 hover:text-slate-700 shadow-sm"
          title="Open history sidebar"
        >
          <MessageSquare className="h-4 w-4" />
        </button>
      )}
    </>
  );
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { activeChatId, conversations } = useChatContext();
  const activeChat = conversations.find(c => c.id === activeChatId);

  const exportConversation = (format: string) => {
    if (!activeChat) return;
    const text = activeChat.messages.map(m => `**${m.role.toUpperCase()}**\n${m.content}`).join("\n\n---\n\n");
    const blob = new Blob([text], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `LOOP_AI_Chat_${activeChat.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex border border-slate-200 dark:border-dark-border rounded-2xl bg-slate-50 dark:bg-dark-bg overflow-hidden h-[calc(100vh-170px)] shadow-sm relative">
      <AskLoopSidebar />

      {/* 2. RIGHT PANEL: CHAT WINDOW */}
      <div className="flex-1 flex flex-col bg-slate-50 dark:bg-dark-bg h-full overflow-hidden w-full relative z-0">
        
        {/* Chat header area */}
        <div className="bg-white dark:bg-dark-card px-6 py-3 border-b border-slate-200 dark:border-dark-border flex items-center justify-between z-10 relative">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-slate-50 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-indigo-500" />
                <span>Ask LOOP AI</span>
              </h2>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-550">
                Active workspace insights engine
              </p>
            </div>
          </div>

          {activeChat && activeChat.messages.length > 0 && (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => exportConversation("md")}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card hover:bg-slate-50 dark:hover:bg-dark-hover text-slate-655 dark:text-slate-350 text-[10.5px] font-bold rounded-lg shadow-sm"
                title="Export conversation as Markdown file"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export Chat</span>
              </button>
            </div>
          )}
        </div>

        {/* Dynamic routing injects Welcome Screen or Active Chat here */}
        <div className="flex-1 overflow-hidden relative">
          {children}
        </div>

      </div>
    </div>
  );
}

export default function AskLoopLayout({ children }: { children: React.ReactNode }) {
  return (
    <ChatProvider>
      <LayoutContent>{children}</LayoutContent>
    </ChatProvider>
  );
}
