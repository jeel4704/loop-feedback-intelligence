"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Loader2, ArrowRight, Copy, ThumbsUp, ThumbsDown, RotateCcw, Send, Paperclip, Mic } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Badge } from "@/components/ui/badge";
import { useAIChat } from "@/hooks/useAIChat";
import { useChatContext } from "@/contexts/ChatContext";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";
import { useSearchParams } from "next/navigation";

const loadingSteps = [
  "Analyzing customer feedback...",
  "Extracting emerging themes...",
  "Generating product insights...",
  "Preparing recommendations..."
];

function ChatPageContent({ params }: { params: { id: string } }) {
  const { id } = params;
  const { messages, isLoading, error, sendMessage, chatEndRef } = useAIChat(id);
  const { conversations, setConversations } = useChatContext();
  const searchParams = useSearchParams();
  
  const [inputText, setInputText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const textInputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeChat = conversations.find(c => c.id === id);

  // Loading animation keys
  const [loadingStep, setLoadingStep] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingSteps.length);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  // Handle auto-send from search query (Welcome Screen prompt click)
  useEffect(() => {
    const q = searchParams.get("q");
    if (q && messages.length === 0 && !isLoading) {
      sendMessage(q);
      // Remove query param without triggering navigation
      window.history.replaceState(null, '', `/ask-loop/chat/${id}`);
    }
  }, [searchParams, messages.length, isLoading, sendMessage, id]);

  useKeyboardShortcut("k", (e) => {
    e.preventDefault();
    textInputRef.current?.focus();
  }, { ctrlKey: true });

  const handleSend = async (customQuery?: string) => {
    const query = (customQuery || inputText).trim();
    if (!query || isLoading) return;
    setInputText("");
    await sendMessage(query);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 180)}px`;
  };

  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleMessageFeedback = (msgId: string, type: "like" | "dislike") => {
    setConversations(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          messages: c.messages.map(m => m.id === msgId ? { ...m, feedback: type } : m)
        };
      }
      return c;
    }));
  };

  const triggerSmartAction = (action: string, label: string) => {
    console.log(`Action triggered: ${action}`);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/ai/upload", {
        method: "POST",
        body: formData
      });
      if (!res.ok) {
        alert("Upload failed");
        return;
      }
      const data = await res.json();
      setInputText(prev => prev + `\n\n[Attached File: ${data.fileName}]\n${data.extractedText}\n\n`);
    } catch (err) {
      console.error(err);
      alert("Failed to upload file");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((message) => {
            const isUser = message.role === "user";
            return (
              <div
                key={message.id}
                className={`flex gap-4 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="h-8 w-8 rounded-full bg-slate-900 dark:bg-white flex items-center justify-center flex-shrink-0 mt-1 shadow-sm border border-slate-700 dark:border-slate-200">
                    <Sparkles className="h-4 w-4 text-white dark:text-slate-900" />
                  </div>
                )}

                <div className="space-y-2 max-w-[85%]">
                  <div
                    className={`rounded-2xl p-4 shadow-md border ${
                      isUser
                        ? "bg-brand text-white shadow-md dark:shadow-[0_0_15px_rgba(91,92,255,0.2)]"
                        : "bg-white border border-slate-200/80 dark:bg-[#111111] dark:border-[#262626] text-slate-800 dark:text-white"
                    }`}
                  >
                    <div className="text-xs font-semibold leading-relaxed markdown-content prose prose-sm prose-slate dark:prose-invert max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                      </ReactMarkdown>
                    </div>

                    {message.citations && message.citations.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-dark-border space-y-2">
                        <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-dark-muted">
                          Sources & Citations
                        </p>
                        <div className="grid gap-2">
                          {message.citations.map((cite) => (
                            <div 
                              key={cite.id}
                              className="p-2.5 rounded-lg bg-slate-50 dark:bg-dark-bg border border-slate-150 dark:border-slate-900 text-[10.5px]"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-slate-900 dark:text-slate-100">{cite.customer}</span>
                                <Badge variant={cite.sentiment === "positive" ? "green" : "rose"} className="text-[8px] px-1 py-0 shadow-none uppercase font-extrabold">
                                  {cite.sentiment}
                                </Badge>
                              </div>
                              <p className="text-slate-600 dark:text-dark-muted italic">"{cite.quote}"</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-4 px-2">
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-600">
                      {message.timestamp}
                    </span>

                    {!isUser && !message.isStreaming && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopyMessage(message.content)}
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded transition"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleMessageFeedback(message.id, "like")}
                          className={`p-1 rounded transition ${
                            message.feedback === "like"
                              ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20"
                              : "text-slate-400 hover:text-slate-655"
                          }`}
                        >
                          <ThumbsUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleMessageFeedback(message.id, "dislike")}
                          className={`p-1 rounded transition ${
                            message.feedback === "dislike"
                              ? "text-rose-600 bg-rose-50 dark:bg-rose-950/20"
                              : "text-slate-400 hover:text-slate-655"
                          }`}
                        >
                          <ThumbsDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleSend(messages[messages.length - 2]?.content)}
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded transition"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {isUser && (
                  <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center border border-indigo-200 dark:border-indigo-800 flex-shrink-0 mt-1 shadow-sm">
                    <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300">ME</span>
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-4 items-start justify-start">
              <div className="h-8 w-8 rounded-full bg-slate-900 dark:bg-white flex items-center justify-center flex-shrink-0 mt-1 shadow-sm border border-slate-700 dark:border-slate-200 animate-pulse">
                <Loader2 className="h-4 w-4 text-white dark:text-slate-900 animate-spin" />
              </div>
              <div className="space-y-1 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border p-4 rounded-2xl shadow-sm max-w-[80%]">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                  </span>
                  <span className="text-[11.5px] font-extrabold text-slate-500 dark:text-dark-muted animate-pulse">
                    {loadingSteps[loadingStep]}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>

      <div className="p-4 bg-white dark:bg-dark-card border-t border-slate-200 dark:border-dark-border">
        <div className="max-w-3xl mx-auto space-y-2">
          <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 select-none">
            <div className="flex items-center gap-3">
              <span>Enter to send</span>
              <span>Shift + Enter for new line</span>
            </div>
            <div className="flex items-center gap-3">
              <span>Ctrl + L to clear</span>
              <span>Ctrl + K to focus</span>
            </div>
          </div>

          <div className={`flex items-end gap-2 border rounded-2xl p-2 transition-all duration-150 ${
            isUploading 
              ? "border-slate-300 bg-slate-100 dark:border-dark-border dark:bg-dark-elevated opacity-70"
              : "border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-bg focus-within:border-indigo-500"
          }`}>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload}
              className="hidden" 
              accept=".csv,.txt,.json"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-2 hover:bg-slate-200/60 dark:hover:bg-dark-elevated rounded-xl text-slate-450 hover:text-slate-655 transition"
              disabled={isUploading}
            >
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
            </button>
            <textarea
              ref={textInputRef}
              value={inputText}
              onChange={handleTextareaChange}
              onKeyDown={handleInputKeyDown}
              placeholder="Ask LOOP AI anything about your customer feedback..."
              rows={1}
              className="flex-1 resize-none bg-transparent py-1.5 px-2 text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder-slate-450 outline-none focus:ring-0 focus:outline-none max-h-[160px] custom-scrollbar focus:ring-offset-0 border-0"
            />
            <button 
              className="p-2 hover:bg-slate-200/60 dark:hover:bg-dark-elevated rounded-xl text-slate-450 hover:text-slate-655 transition"
              disabled
            >
              <Mic className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !inputText.trim()}
              className={`p-2 rounded-xl text-white transition shadow-sm ${
                inputText.trim() && !isLoading
                  ? "bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-650"
                  : "bg-slate-250 text-slate-400 dark:bg-dark-card dark:text-slate-600 cursor-not-allowed"
              }`}
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage({ params }: { params: { id: string } }) {
  return (
    <React.Suspense fallback={<div className="p-8 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>}>
      <ChatPageContent params={params} />
    </React.Suspense>
  );
}
