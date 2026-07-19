"use client";

import React, { useState } from "react";
import { Sun, Moon, Sparkles, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "next-themes";

export default function AppearanceSettingsPage() {
  const { theme, setTheme } = useTheme();
  const [compactMode, setCompactMode] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight">Theme & Appearance</h1>
        <p className="text-xs font-bold text-slate-550 dark:text-dark-muted mt-1">
          Personalize the look, light/dark theme preference, and typography scaling of LOOP.
        </p>
      </div>

      {/* Theme selector options */}
      <div className="grid gap-4 sm:grid-cols-3">
        
        {/* Light */}
        <Card 
          onClick={() => setTheme("light")}
          className={`cursor-pointer bg-white dark:bg-dark-card border transition-all hover:shadow-sm rounded-2xl flex flex-col justify-between overflow-hidden ${
            theme === "light" ? "border-indigo-500 ring-2 ring-indigo-500/10" : "border-slate-200/80 dark:border-dark-border"
          }`}
        >
          <CardContent className="p-4 flex flex-col gap-6 h-full justify-between">
            <div className="flex justify-between items-start">
              <Sun className="h-5 w-5 text-amber-500" />
              {theme === "light" && (
                <div className="h-4 w-4 bg-indigo-500 rounded-full flex items-center justify-center text-white">
                  <Check className="h-2.5 w-2.5" />
                </div>
              )}
            </div>
            <div>
              <p className="text-xs font-extrabold text-slate-900 dark:text-slate-100">Light Mode</p>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Classic clean white interface.</p>
            </div>
          </CardContent>
        </Card>

        {/* Dark */}
        <Card 
          onClick={() => setTheme("dark")}
          className={`cursor-pointer bg-white dark:bg-dark-card border transition-all hover:shadow-sm rounded-2xl flex flex-col justify-between overflow-hidden ${
            theme === "dark" ? "border-indigo-500 ring-2 ring-indigo-500/10" : "border-slate-200/80 dark:border-dark-border"
          }`}
        >
          <CardContent className="p-4 flex flex-col gap-6 h-full justify-between">
            <div className="flex justify-between items-start">
              <Moon className="h-5 w-5 text-indigo-400" />
              {theme === "dark" && (
                <div className="h-4 w-4 bg-indigo-500 rounded-full flex items-center justify-center text-white">
                  <Check className="h-2.5 w-2.5" />
                </div>
              )}
            </div>
            <div>
              <p className="text-xs font-extrabold text-slate-900 dark:text-slate-100">Dark Mode</p>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Vibrant slate gray dark UI.</p>
            </div>
          </CardContent>
        </Card>

        {/* System */}
        <Card 
          onClick={() => setTheme("system")}
          className={`cursor-pointer bg-white dark:bg-dark-card border transition-all hover:shadow-sm rounded-2xl flex flex-col justify-between overflow-hidden ${
            theme === "system" ? "border-indigo-500 ring-2 ring-indigo-500/10" : "border-slate-200/80 dark:border-dark-border"
          }`}
        >
          <CardContent className="p-4 flex flex-col gap-6 h-full justify-between">
            <div className="flex justify-between items-start">
              <Sparkles className="h-5 w-5 text-indigo-500" />
              {theme === "system" && (
                <div className="h-4 w-4 bg-indigo-500 rounded-full flex items-center justify-center text-white">
                  <Check className="h-2.5 w-2.5" />
                </div>
              )}
            </div>
            <div>
              <p className="text-xs font-extrabold text-slate-900 dark:text-slate-100">System Defaults</p>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Sync automatically with your OS settings.</p>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Adjust visual density spacing checkboxes */}
      <Card className="bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border rounded-2xl shadow-sm">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-xs font-extrabold text-slate-950 dark:text-slate-50 uppercase tracking-widest">Interface Spacing & Motion</h3>
          
          <div className="space-y-3.5 text-xs font-bold text-slate-700 dark:text-slate-350">
            <label className="flex items-center gap-2.5 select-none cursor-pointer">
              <input 
                type="checkbox" 
                checked={compactMode}
                onChange={(e) => setCompactMode(e.target.checked)}
                className="rounded text-indigo-650 accent-indigo-650" 
              />
              <span>Enable Compact Mode (reduces margins and list row paddings)</span>
            </label>

            <label className="flex items-center gap-2.5 select-none cursor-pointer pt-3 border-t border-slate-100 dark:border-dark-border">
              <input 
                type="checkbox" 
                checked={animationsEnabled}
                onChange={(e) => setAnimationsEnabled(e.target.checked)}
                className="rounded text-indigo-650 accent-indigo-650" 
              />
              <span>Enable layout transition micro-animations</span>
            </label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
