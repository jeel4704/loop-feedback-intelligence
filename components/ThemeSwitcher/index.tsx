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
      className="p-2 border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card hover:bg-slate-50 dark:hover:bg-dark-hover/80 text-slate-900 dark:text-white rounded-xl shadow-sm transition-all duration-200 outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white/20"
      title={`Switch to ${isDark ? "light" : "dark"} theme`}
      aria-label="Toggle visual theme"
    >
      {isDark ? (
        <Sun className="h-3.5 w-3.5 text-white" />
      ) : (
        <Moon className="h-3.5 w-3.5 text-slate-950" />
      )}
    </button>
  );
}
