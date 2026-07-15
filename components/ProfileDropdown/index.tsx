"use client";

import React from "react";
import { 
  Sparkles, 
  LogOut, 
  ChevronDown 
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useDropdown } from "@/hooks/useDropdown";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

interface MenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href?: string;
  onClick?: () => void;
}

export function ProfileDropdown() {
  const { data: session } = useSession();
  const { isOpen, toggle, ref, close } = useDropdown();

  const user = session?.user as any;
  const userName = user?.name || user?.email?.split("@")[0] || "User";
  const userEmail = user?.email || "user@loopai.dev";
  const userRole = user?.role || "VIEWER";
  const workspaceName = user?.workspaceName || user?.workspaceSlug || "Workspace";

  const initials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

    const menuItems: MenuItem[] = [
    { icon: Sparkles, label: "Appearance", href: "/appearance" },
    { 
      icon: LogOut, 
      label: "Logout", 
      onClick: async () => {
        // Clear all sensitive data on the client side
        localStorage.clear();
        sessionStorage.clear();
        
        // NextAuth sign out, which also clears the session cookie
        await signOut({ callbackUrl: "/" });
      }
    }
  ];

  return (
    <div className="relative inline-block text-left" ref={ref}>
      {/* Clickable Header Trigger */}
      <button
        onClick={toggle}
        className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1.5 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors outline-none focus:ring-2 focus:ring-blue-500/20"
        aria-label="Profile dropdown menu"
      >
        <div className="flex h-7.5 w-7.5 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-[10px] font-bold text-[#4f46e5] dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/60">
          {initials}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-[10px] font-bold text-slate-800 dark:text-slate-200 leading-none truncate max-w-[80px]">
            {userName}
          </p>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
      </button>

      {/* Menu dropdown panel container */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col"
          >
            {/* Header info */}
            <div className="px-4.5 py-3.5 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col select-none">
              <span className="text-[10.5px] font-extrabold text-slate-900 dark:text-slate-50 truncate">
                {userName}
              </span>
              <span className="text-[9.5px] text-slate-400 dark:text-slate-500 font-semibold truncate leading-none mt-0.5">
                {userEmail}
              </span>
              <span className="text-[8.5px] font-extrabold uppercase px-1.5 py-0.5 rounded tracking-widest text-[#4f46e5] dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100/20 dark:border-indigo-900/40 w-fit mt-2">
                {workspaceName}
              </span>
            </div>

            {/* Menu Items */}
            <div className="p-1.5 divide-y divide-slate-100 dark:divide-slate-800/50">
              <div className="space-y-0.5 pb-1">
                {menuItems.slice(0, 1).map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={idx}
                      href={(item.href || "#") as any}
                      onClick={close}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[11px] font-bold text-slate-650 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-350 dark:hover:text-slate-100 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <Icon className="h-4 w-4 text-slate-400 dark:text-slate-500 group-hover:text-slate-655" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="pt-1.5">
                {menuItems.slice(1).map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        close();
                        if (item.onClick) item.onClick();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[11px] font-bold text-rose-500 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 transition-colors"
                    >
                      <Icon className="h-4 w-4 text-rose-400" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
