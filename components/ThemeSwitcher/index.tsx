"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon, Laptop } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

export function ThemeSwitcher() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Mount checklist to prevent hydration flickering mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-[38px] w-[38px] rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-card animate-pulse" />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="p-2 border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card hover:bg-slate-50 dark:hover:bg-dark-hover/80 text-slate-500 hover:text-slate-750 dark:text-dark-muted dark:hover:text-slate-200 rounded-xl shadow-sm transition-all duration-200 outline-none focus:ring-2 focus:ring-indigo-500/20"
      title={`Switch to ${isDark ? "light" : "dark"} theme`}
      aria-label="Toggle visual theme"
    >
      {isDark ? (
        <Sun className="h-4.5 w-4.5 text-amber-500" />
      ) : (
        <Moon className="h-4.5 w-4.5 text-slate-500" />
      )}
    </button>
  );
}
