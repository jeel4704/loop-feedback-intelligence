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
  X,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown
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
  
  // Persisted collapsible state
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  const user = session?.user as any;
  const userRole = user?.role || "VIEWER";
  const userName = user?.name || user?.email?.split("@")[0] || "User";
  const workspaceName = user?.workspaceName || user?.workspaceSlug || "Workspace";

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("sidebarCollapsed");
    if (stored === "true") setIsCollapsed(true);
  }, []);

  const toggleSidebar = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem("sidebarCollapsed", String(next));
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const initials = userName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "U";

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
    { label: "Workspace", href: "/workspaces", icon: Building2, roles: ["OWNER", "ADMIN"] },
    { label: "Settings", href: "/settings", icon: Settings, roles: ["OWNER", "ADMIN"] }
  ];

  const allowedPrimaryItems = primaryNavItems.filter(item => item.roles.includes(userRole));
  const allowedManageItems = manageNavItems.filter(item => item.roles.includes(userRole));

  const renderNavLinks = (items: typeof primaryNavItems) => (
    <nav className="flex flex-col gap-2 w-full" aria-label="Navigation">
      {items.map((item) => {
        const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/dashboard");
        const Icon = item.icon;

        const linkContent = (
          <Link
            key={item.label}
            href={item.href as any}
            className={cn(
              "flex items-center rounded-xl transition-all duration-250 relative group outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
              isCollapsed ? "justify-center w-11 h-11 mx-auto" : "gap-3 px-3.5 py-2.5 w-full",
              isActive
                ? "bg-gradient-to-br from-[#6C4EFF] to-[#5a3ee6] text-white shadow-[0_4px_15px_rgba(108,78,255,0.25)]"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-[#CFCFCF] dark:hover:bg-[#151515] dark:hover:text-white hover:-translate-y-0.5"
            )}
          >
            {isActive && !isCollapsed && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-2/3 bg-white rounded-r-full" />
            )}
            {isActive && isCollapsed && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-white rounded-r-full" />
            )}
            
            <Icon className={cn(
              "transition-transform duration-250", 
              isCollapsed ? "h-[22px] w-[22px]" : "h-5 w-5",
              isActive ? "text-white" : "group-hover:scale-105"
            )} />
            
            {!isCollapsed && (
              <span className="text-[13.5px] font-medium whitespace-nowrap">{item.label}</span>
            )}
          </Link>
        );

        if (isCollapsed) {
          return (
            <Tooltip key={item.label} content={item.label} position="right">
              {linkContent}
            </Tooltip>
          );
        }

        return linkContent;
      })}
    </nav>
  );

  const renderSidebarContent = (isMobile = false) => {
    const collapsed = isMobile ? false : isCollapsed;
    
    return (
      <div className="flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <div className={cn(
          "flex pb-6 border-b border-slate-200/50 dark:border-[#202020] flex-shrink-0 transition-all duration-300",
          collapsed ? "flex-col items-center gap-4" : "flex-row items-center justify-between"
        )}>
          <Link href="/dashboard" className="transition-opacity hover:opacity-80">
            {collapsed ? (
              <Logo variant="icon" size="md" />
            ) : (
              <div className="flex flex-col">
                <Logo variant="horizontal" size="md" />
                <span className="text-[10px] font-semibold text-slate-500 dark:text-[#CFCFCF] mt-1 uppercase tracking-wider ml-1">
                  {workspaceName}
                </span>
              </div>
            )}
          </Link>
          
          <div className="flex items-center">
            {!isMobile && (
              <button
                onClick={toggleSidebar}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-[#151515] transition-colors"
                title={collapsed ? "Expand Sidebar" : "Hide Sidebar"}
              >
                {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
              </button>
            )}
            
            {isMobile && (
              <button 
                onClick={() => setIsMobileOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#151515] text-slate-400 hover:text-slate-700 dark:text-[#CFCFCF] dark:hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Nav Links */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-6 custom-scrollbar flex flex-col gap-6">
          <div>
            {!collapsed && (
              <p className="text-[10px] font-bold text-slate-400 dark:text-[#666666] uppercase tracking-wider mb-3 px-3.5 select-none">
                Platform
              </p>
            )}
            {renderNavLinks(allowedPrimaryItems)}
          </div>
          
          <div>
            {!collapsed && (
              <p className="text-[10px] font-bold text-slate-400 dark:text-[#666666] uppercase tracking-wider mb-3 px-3.5 select-none mt-2">
                Management
              </p>
            )}
            {collapsed && <div className="h-px w-6 mx-auto bg-slate-200 dark:bg-[#202020] my-4" />}
            {renderNavLinks(allowedManageItems)}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-4 border-t border-slate-200/60 dark:border-[#202020] flex-shrink-0 flex flex-col gap-2">
          
          {/* User Profile */}
          <div className={cn(
            "flex items-center gap-3 p-2 rounded-xl transition-colors cursor-pointer hover:bg-slate-100 dark:hover:bg-[#151515]",
            collapsed ? "justify-center w-11 h-11 mx-auto" : "justify-between w-full"
          )}>
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 dark:bg-[#202020] text-xs font-bold text-slate-700 dark:text-white border border-slate-300 dark:border-[#333333]">
                {initials}
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <p className="text-[13.5px] font-semibold text-slate-900 dark:text-white truncate leading-tight">{userName}</p>
                  <p className="text-[11px] text-slate-500 dark:text-[#CFCFCF] truncate mt-0.5">
                    {userRole === "OWNER" ? "Workspace Owner" : userRole}
                  </p>
                </div>
              )}
            </div>
            {!collapsed && <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />}
          </div>

          {/* Logout Button */}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className={cn(
              "flex items-center text-slate-500 dark:text-[#CFCFCF] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all duration-250 rounded-xl",
              collapsed ? "justify-center w-11 h-11 mx-auto" : "gap-3 px-3.5 py-2.5 w-full"
            )}
            title={collapsed ? "Logout" : undefined}
          >
            <LogOut className={cn("transition-transform duration-250", collapsed ? "h-[22px] w-[22px]" : "h-5 w-5")} />
            {!collapsed && <span className="text-[13.5px] font-medium">Logout</span>}
          </button>
        </div>
      </div>
    );
  };

  if (!mounted) return null; // Avoid hydration mismatch on initial load for localstorage state

  return (
    <div className="min-h-screen bg-white dark:bg-[#000000] flex text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <div className="flex min-h-screen w-full relative">
        
        {/* DESKTOP STICKY SIDEBAR */}
        <motion.aside 
          initial={false}
          animate={{ width: isCollapsed ? 80 : 280 }}
          transition={{ type: "spring", damping: 25, stiffness: 220 }}
          className={cn(
            "h-screen sticky top-0 hidden lg:flex flex-col bg-slate-50 dark:bg-[#0B0B0B] border-r border-slate-200/80 dark:border-dark-border flex-shrink-0 z-20 print:hidden",
            isCollapsed ? "px-3 py-6" : "px-5 py-6"
          )}
        >
          {renderSidebarContent(false)}
        </motion.aside>

        {/* MOBILE SLIDING SIDEBAR DRAWER */}
        <AnimatePresence>
          {isMobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileOpen(false)}
                className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden print:hidden"
              />
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 220 }}
                className="fixed inset-y-0 left-0 z-50 w-[280px] bg-slate-50 dark:bg-[#0B0B0B] border-r border-slate-200/80 dark:border-dark-border/80 flex flex-col px-5 py-6 lg:hidden overflow-hidden print:hidden"
              >
                {renderSidebarContent(true)}
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* CONTENT AREA */}
        <div className="flex-1 flex flex-col min-h-screen min-w-0 bg-white dark:bg-[#000000] overflow-hidden">
          {/* HEADER NAV BAR */}
          <header 
            className={cn(
              "sticky top-0 bg-white/80 dark:bg-[#000000]/80 backdrop-blur-md z-30 px-6 py-4 w-full transition-all duration-200 border-b border-transparent print:hidden",
              isScrolled && "shadow-sm border-slate-200/60 dark:border-dark-border"
            )}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsMobileOpen(true)}
                  className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-dark-hover text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 rounded-xl transition outline-none"
                  aria-label="Open sidebar"
                >
                  <Menu className="h-5 w-5" />
                </button>

                <div className="min-w-0">
                  <h1 className="text-base font-bold text-slate-900 dark:text-slate-50 truncate leading-none">
                    Welcome back, {userName.split(" ")[0]}
                  </h1>
                  <p className="text-[11px] text-slate-500 dark:text-dark-muted font-semibold mt-1">
                    Here's what's happening with your feedback today.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 justify-end">
                <SearchBar />
                <div className="flex items-center gap-1 text-slate-400">
                  <Tooltip content="Toggle Theme" position="bottom">
                    <ThemeSwitcher />
                  </Tooltip>
                </div>
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
