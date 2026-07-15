"use client";

import React, { useState, useRef } from "react";
import { Sparkles, ArrowRight, Send, Paperclip, Mic } from "lucide-react";
import { useRouter } from "next/navigation";
import { useChatContext } from "@/contexts/ChatContext";

export default function AskLoopWelcomePage() {
  const router = useRouter();
  const { createNewChat, setActiveChatId } = useChatContext();
  const [inputText, setInputText] = useState("");
  const textInputRef = useRef<HTMLTextAreaElement>(null);

  const welcomeCards = [
    { title: "Summarize today's feedback", query: "Summarize today's customer feedback" },
    { title: "Top negative themes this week", query: "What are the top negative themes this week?" },
    { title: "Customer satisfaction report", query: "Generate a customer satisfaction report" },
    { title: "Show trending complaints", query: "Show trending complaints" },
    { title: "Compare month comparison", query: "Compare this month with last month" },
    { title: "Actionable recommendations", query: "Give me actionable recommendations" },
    { title: "How to connect Slack?", query: "How do I connect Slack?" },
    { title: "Workspace permission tiers", query: "How do permissions work?" }
  ];

  const handleSend = (query: string) => {
    const newId = createNewChat(query);
    setActiveChatId(newId);
    
    // We navigate to the chat ID passing the query via search params to auto-send it
    router.push(`/ask-loop/chat/${newId}?q=${encodeURIComponent(query)}`);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (inputText.trim()) handleSend(inputText);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 180)}px`;
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar h-full flex flex-col justify-center">
        <div className="max-w-2xl mx-auto py-8 space-y-8 w-full">
          <div className="text-center space-y-2">
            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto text-indigo-650 dark:text-indigo-400 shadow-sm">
              <Sparkles className="h-7 w-7" />
            </div>
            <h1 className="text-xl font-black text-slate-900 dark:text-slate-50 mt-4 tracking-tight">
              Welcome to Ask LOOP AI
            </h1>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
              Analyze customer feedback, generate insights, discover trends, summarize reports, and manage your workspace using AI.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-[9.5px] font-extrabold uppercase tracking-wider text-slate-450 dark:text-slate-500 text-center">
              Suggested Prompts
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {welcomeCards.map((card, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSend(card.query)}
                  className="border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 p-3.5 rounded-xl cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-900 shadow-sm transition hover:-translate-y-0.5"
                >
                  <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300 leading-normal flex items-center justify-between">
                    <span>{card.query}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Input area at the bottom */}
      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-850">
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

          <div className="flex items-end gap-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus-within:border-indigo-500 rounded-2xl p-2 transition-all duration-150">
            <button 
              className="p-2 hover:bg-slate-200/60 dark:hover:bg-slate-900 rounded-xl text-slate-450 hover:text-slate-655 transition"
            >
              <Paperclip className="h-4 w-4" />
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
              className="p-2 hover:bg-slate-200/60 dark:hover:bg-slate-900 rounded-xl text-slate-450 hover:text-slate-655 transition"
              disabled
            >
              <Mic className="h-4 w-4" />
            </button>
            <button
              onClick={() => { if (inputText.trim()) handleSend(inputText); }}
              disabled={!inputText.trim()}
              className={`p-2 rounded-xl text-white transition shadow-sm ${
                inputText.trim()
                  ? "bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-650"
                  : "bg-slate-250 text-slate-400 dark:bg-slate-900 dark:text-slate-600 cursor-not-allowed"
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
