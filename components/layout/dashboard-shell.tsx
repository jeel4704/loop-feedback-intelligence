"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useSession, signOut } from "next-auth/react";
import { 
  LogOut, 
  Home,
  MessageSquare,
  Tags,
  LineChart,
  FileText,
  Sparkles,
  Database,
  Puzzle,
  Users,
  Building2,
  Settings,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui";
import { SearchBar } from "@/components/SearchBar";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import { Tooltip } from "@/components/Tooltip";
import { AnimatePresence, motion } from "framer-motion";

interface DashboardShellProps {
  children: ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const user = session?.user as any;
  const userRole = user?.role || "VIEWER";
  const userName = user?.name || user?.email?.split("@")[0] || "User";
  const workspaceName = user?.workspaceName || user?.workspaceSlug || "Workspace";

  // Watch scroll to show soft shadow under navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Generate initials
  const initials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  // Navigation Items
  const primaryNavItems = [
    { label: "Overview", href: "/dashboard", icon: Home, roles: ["OWNER", "ADMIN", "ANALYST", "VIEWER"] },
    { label: "Feedback", href: "/feedback", icon: MessageSquare, roles: ["OWNER", "ADMIN", "ANALYST"] },
    { label: "Themes", href: "/themes", icon: Tags, roles: ["OWNER", "ADMIN", "ANALYST"] },
    { label: "Trends", href: "/trends", icon: LineChart, roles: ["OWNER", "ADMIN", "ANALYST", "VIEWER"] },
    { label: "Reports", href: "/reports", icon: FileText, roles: ["OWNER", "ADMIN", "ANALYST", "VIEWER"] },
    { label: "Ask LOOP AI", href: "/ask-loop", icon: Sparkles, roles: ["OWNER", "ADMIN", "ANALYST", "VIEWER"] }
  ];

  const manageNavItems = [
    { label: "Sources", href: "/inbox", icon: Database, roles: ["OWNER", "ADMIN", "ANALYST", "VIEWER"] },
    { label: "Users & Roles", href: "/members", icon: Users, roles: ["OWNER", "ADMIN"] },
    { label: "Workspaces", href: "/workspaces", icon: Building2, roles: ["OWNER", "ADMIN"] },
    { label: "Settings", href: "/settings", icon: Settings, roles: ["OWNER", "ADMIN"] }
  ];

  const allowedPrimaryItems = primaryNavItems.filter(item => item.roles.includes(userRole));
  const allowedManageItems = manageNavItems.filter(item => item.roles.includes(userRole));

  const renderNavLinks = () => (
    <div className="space-y-6">
      {/* Primary Nav Section */}
      <nav className="space-y-1" aria-label="Primary navigation">
        {allowedPrimaryItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={item.href as any}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-semibold transition-all duration-300 relative group overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-accent",
                isActive
                  ? "bg-[#efeffe] dark:bg-accent/10 dark:shadow-[0_0_15px_rgba(91,92,255,0.15)] text-[#4f46e5] dark:text-accent font-bold"
                  : "text-slate-655 hover:bg-slate-100/80 dark:text-dark-muted dark:hover:bg-dark-elevated/60 dark:hover:text-dark-text"
              )}
            >
              <Icon className={cn("h-4.5 w-4.5 transition-all duration-300", isActive ? "text-[#4f46e5] dark:text-accent dark:drop-shadow-[0_0_8px_rgba(91,92,255,0.8)]" : "text-slate-405 group-hover:text-slate-600 dark:text-dark-muted dark:group-hover:text-dark-secondaryText group-hover:scale-110")} />
              <span>{item.label}</span>
              {/* Subtle hover indicator dot */}
              {!isActive && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#4f46e5]/40 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
              {/* Active Indicator Line */}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 rounded-r-md bg-[#4f46e5] dark:bg-accent dark:shadow-[0_0_10px_rgba(91,92,255,1)]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Manage Nav Section */}
      <div className="pt-2">
        <p className="text-[10px] font-extrabold text-slate-400 dark:text-dark-muted uppercase tracking-widest mb-2 px-3.5 select-none">
          Manage
        </p>
        <nav className="space-y-1" aria-label="Management navigation">
          {allowedManageItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href as any}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-semibold transition-all duration-300 relative group overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-accent",
                  isActive
                    ? "bg-[#efeffe] dark:bg-accent/10 dark:shadow-[0_0_15px_rgba(91,92,255,0.15)] text-[#4f46e5] dark:text-accent font-bold"
                    : "text-slate-655 hover:bg-slate-100/80 dark:text-dark-muted dark:hover:bg-dark-elevated/60 dark:hover:text-dark-text"
                )}
              >
                <Icon className={cn("h-4.5 w-4.5 transition-all duration-300", isActive ? "text-[#4f46e5] dark:text-accent dark:drop-shadow-[0_0_8px_rgba(91,92,255,0.8)]" : "text-slate-405 group-hover:text-slate-600 dark:text-dark-muted dark:group-hover:text-dark-secondaryText group-hover:scale-110")} />
                <span>{item.label}</span>
                {!isActive && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#4f46e5]/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
                {/* Active Indicator Line */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 rounded-r-md bg-[#4f46e5] dark:bg-accent dark:shadow-[0_0_10px_rgba(91,92,255,1)]" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );

  const renderSidebarContent = (isMobile = false) => (
    <>
      {/* Top sticky logo block */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-200/50 dark:border-dark-border/50 flex-shrink-0">
        <Link href="/dashboard" className="transition-opacity hover:opacity-80">
          <Logo variant="horizontal" size="md" />
        </Link>
        {isMobile && (
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-hover text-slate-400 hover:text-slate-650 dark:text-dark-muted dark:hover:text-slate-250 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Middle scrollable nav links */}
      <div className="flex-1 overflow-y-auto pr-1 py-4 custom-scrollbar">
        {renderNavLinks()}
      </div>

      {/* Bottom sticky items */}
      <div className="pt-6 border-t border-slate-200/60 dark:border-dark-border flex-shrink-0 space-y-5 bg-[#fafbfe] dark:bg-dark-bg">


        {/* User initials & quick Sign out */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-950 text-xs font-bold text-[#4f46e5] dark:text-indigo-400 border border-indigo-200/25">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-slate-50 truncate">{userName}</p>
              <p className="text-[10px] text-slate-405 dark:text-slate-550 font-bold truncate">
                {userRole === "OWNER" ? "Workspace Owner" : userRole}
              </p>
            </div>
          </div>
          <Tooltip content="Sign Out">
            <button 
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-905 transition-colors"
              aria-label="Sign out of loop"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </Tooltip>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#fcfdff] dark:bg-dark-bg flex text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <div className="flex min-h-screen w-full relative">
        {/* DESKTOP STICKY SIDEBAR */}
        <aside className="w-[260px] h-screen sticky top-0 hidden lg:flex flex-col justify-between bg-[#fafbfe] dark:bg-dark-bg px-5 py-6 border-r border-slate-200/80 dark:border-slate-900 flex-shrink-0 z-20 overflow-hidden">
          {renderSidebarContent(false)}
        </aside>

        {/* MOBILE SLIDING SIDEBAR DRAWER */}
        <AnimatePresence>
          {isMobileOpen && (
            <>
              {/* Sliding backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileOpen(false)}
                className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
              />
              {/* Drawer layout */}
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 220 }}
                className="fixed inset-y-0 left-0 z-50 w-[260px] bg-[#fafbfe] dark:bg-dark-bg border-r border-slate-200/80 dark:border-dark-border/80 flex flex-col justify-between px-5 py-6 lg:hidden overflow-hidden"
              >
                {renderSidebarContent(true)}
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Content area right */}
        <div className="flex-1 flex flex-col min-h-screen min-w-0 bg-[#f8fafc] dark:bg-dark-card/30 overflow-hidden">
          {/* HEADER NAV BAR */}
          <header 
            className={cn(
              "sticky top-0 bg-white/80 dark:bg-dark-bg/80 backdrop-blur-md z-30 px-6 py-4 w-full transition-all duration-200 border-b border-slate-200/60 dark:border-slate-900",
              isScrolled && "shadow-sm border-b dark:border-dark-border"
            )}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              {/* Header Title Greeting / Menu Trigger */}
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsMobileOpen(true)}
                  className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-dark-hover text-slate-400 hover:text-slate-655 dark:hover:text-slate-200 rounded-xl transition outline-none"
                  aria-label="Open sidebar"
                >
                  <Menu className="h-5 w-5" />
                </button>

                <div className="min-w-0">
                  <h1 className="text-base font-bold text-slate-900 dark:text-slate-50 truncate leading-none">
                    Welcome back, {userName.split(" ")[0]}
                  </h1>
                  <p className="text-[11px] text-slate-405 dark:text-dark-muted font-semibold mt-1">
                    Here's what's happening with your feedback today.
                  </p>
                </div>
              </div>

              {/* Header Actions items */}
              <div className="flex items-center gap-3.5 justify-end">
                {/* Global Search Component */}
                <SearchBar />

                {/* Navbar Action Icons */}
                <div className="flex items-center gap-1 text-slate-400">

                  <Tooltip content="Toggle Theme" position="bottom">
                    <ThemeSwitcher />
                  </Tooltip>
                </div>

                {/* Profile Dropdown */}
                <ProfileDropdown />
              </div>
            </div>
          </header>

          {/* MAIN VIEW CONTENT CONTAINER */}
          <main className="flex-1 p-6 md:p-8 w-full overflow-y-auto custom-scrollbar focus:outline-none">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
