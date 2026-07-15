"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, CornerDownLeft, Sparkles, FileText, Tags, MessageSquare, Database, Users, Puzzle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";

interface SearchItem {
  id: string;
  category: "Feedback" | "Themes" | "Reports" | "Sources" | "Integrations" | "Users";
  title: string;
  subtitle?: string;
  href: string;
}

const defaultItems: SearchItem[] = [
  { id: "s_1", category: "Feedback", title: "Jira integration request", subtitle: "Mobile App • John", href: "/feedback" },
  { id: "s_2", category: "Feedback", title: "Dashboard loading sluggishly", subtitle: "Website • Alice", href: "/feedback" },
  { id: "s_3", category: "Themes", title: "App Performance issues", subtitle: "11% of feedback", href: "/themes" },
  { id: "s_4", category: "Themes", title: "Dark Mode requests", subtitle: "13% of feedback", href: "/themes" },
  { id: "s_5", category: "Reports", title: "Weekly Feedback Digest", subtitle: "Generated 7/5/2026", href: "/reports" },
  { id: "s_6", category: "Reports", title: "Quarterly Analysis Summary", subtitle: "Completed", href: "/reports" },
  { id: "s_7", category: "Sources", title: "Mobile App Feedback Channel", subtitle: "Active ingestion", href: "/inbox" },
  { id: "s_8", category: "Integrations", title: "Slack workspace connection", subtitle: "Configured", href: "/settings" },
  { id: "s_9", category: "Users", title: "Workspace Members list", subtitle: "2 members", href: "/members" },
];

const categoryIcons = {
  Feedback: MessageSquare,
  Themes: Tags,
  Reports: FileText,
  Sources: Database,
  Integrations: Puzzle,
  Users: Users,
};

export function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Set mounted on client to prevent SSR hydration errors with Portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Sync hotkey Ctrl+K / Cmd+K
  useKeyboardShortcut("k", (e) => {
    e.preventDefault();
    setIsOpen(true);
  }, { ctrlKey: true });

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Click outside to close helper
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

  // Global Escape key dismiss handler
  useEffect(() => {
    const handleGlobalEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleGlobalEscape);
    return () => {
      window.removeEventListener("keydown", handleGlobalEscape);
    };
  }, [isOpen]);

  const filteredItems = defaultItems.filter((item) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.subtitle?.toLowerCase().includes(q)
    );
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        handleSelect(filteredItems[selectedIndex].href);
      }
    }
  };

  const handleSelect = (href: string) => {
    router.push(href as any);
    setIsOpen(false);
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-start justify-center bg-slate-950/40 backdrop-blur-md p-4 pt-[12vh]">
          {/* Click outside backdrop container to close */}
          <div className="absolute inset-0" onClick={() => setIsOpen(false)} />

          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl flex flex-col max-h-[460px] outline-none"
            ref={containerRef}
            onKeyDown={handleKeyDown}
          >
            {/* Search input header */}
            <div className="flex items-center gap-3 border-b border-slate-200/80 dark:border-slate-800/80 px-4 py-3.5">
              <Search className="h-4.5 w-4.5 text-slate-400 dark:text-slate-500" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search feedback, themes, reports..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                className="flex-1 border-0 bg-transparent p-0 text-sm font-semibold text-slate-900 dark:text-slate-50 placeholder-slate-400 outline-none focus:ring-0 focus:outline-none caret-blue-600 dark:caret-blue-400"
              />
              <div className="flex items-center gap-2">
                <kbd className="hidden sm:inline-flex items-center text-[9px] font-extrabold bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 shadow-sm">
                  esc
                </kbd>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-xs font-extrabold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Search Results list body */}
            <div className="flex-1 overflow-y-auto py-2 custom-scrollbar max-h-[300px]">
              {filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 px-4 text-center text-slate-400">
                  <Sparkles className="h-6 w-6 text-slate-300 dark:text-slate-700 mb-2" />
                  <p className="text-xs font-semibold">No results found for "{query}"</p>
                  <p className="text-[10px] mt-0.5">Try searching for keywords like "Jira", "Performance" or "CSV".</p>
                </div>
              ) : (
                <div className="space-y-1 px-2">
                  {filteredItems.map((item, idx) => {
                    const Icon = categoryIcons[item.category];
                    const isSelected = idx === selectedIndex;

                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelect(item.href)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`flex items-center justify-between gap-3 px-3 py-2 rounded-xl cursor-pointer transition-colors duration-150 ${
                          isSelected
                            ? "bg-[#efeffe] text-[#4f46e5] dark:bg-indigo-950/70 dark:text-indigo-300"
                            : "text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon className={`h-4 w-4 ${isSelected ? "text-[#4f46e5] dark:text-indigo-400" : "text-slate-400 dark:text-slate-500"}`} />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold truncate leading-normal">
                              {item.title}
                            </p>
                            {item.subtitle && (
                              <p className={`text-[10px] font-bold truncate leading-none mt-0.5 ${isSelected ? "text-indigo-400/80" : "text-slate-400 dark:text-slate-500"}`}>
                                {item.subtitle}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-[8.5px] font-extrabold uppercase px-1.5 py-0.5 rounded tracking-widest ${
                            isSelected 
                              ? "bg-indigo-200/50 text-[#4f46e5] dark:bg-indigo-900/60 dark:text-indigo-300" 
                              : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                          }`}>
                            {item.category}
                          </span>
                          {isSelected && (
                            <CornerDownLeft className="h-3 w-3 opacity-60" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Command Palette footer helper */}
            <div className="border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 px-4 py-2 flex items-center justify-between text-[9px] font-bold text-slate-400 dark:text-slate-500 select-none">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">↑↓ Navigation</span>
                <span className="flex items-center gap-1">↵ Select</span>
              </div>
              <span>LOOP Search Palette</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {/* Outer Clickable Search Trigger in Navbar */}
      <div 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-1.5 w-52 lg:w-64 cursor-pointer shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 group"
      >
        <Search className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400 group-hover:text-slate-750 dark:group-hover:text-slate-200 transition-colors" />
        <span className="text-[11.5px] font-bold text-slate-500 dark:text-slate-400 select-none group-hover:text-slate-700 dark:group-hover:text-slate-200 flex-1">
          Search workspace...
        </span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[9px] font-extrabold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded-lg shadow-sm">
          <span>ctrl</span><span>k</span>
        </kbd>
      </div>

      {mounted && createPortal(modalContent, document.body)}
    </>
  );
}
