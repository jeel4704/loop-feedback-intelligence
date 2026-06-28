"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Bell, Building2, ChevronDown, PanelLeft, Search } from "lucide-react";
import { AuthGuard } from "@/components/auth";
import { Avatar, ThemeToggle } from "@/components/common";
import { Badge, Button, Input } from "@/components/ui";
import { demoNotifications } from "@/data/notifications";
import { demoWorkspace } from "@/data/users";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Inbox", href: "/inbox" },
  { label: "Feedback", href: "/feedback" },
  { label: "Themes", href: "/themes" },
  { label: "Trends", href: "/trends" },
  { label: "Ask LOOP", href: "/ask-loop" },
  { label: "Reports", href: "/reports" },
  { label: "Members", href: "/members" },
  { label: "Settings", href: "/settings" }
] as const;

interface DashboardShellProps {
  children: ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(191,219,254,0.45),_transparent_30%),linear-gradient(to_bottom,_#f8fbff,_#eef4ff)] dark:bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.18),_transparent_22%),linear-gradient(to_bottom,_#020617,_#0f172a)]">
        <div className="mx-auto grid min-h-screen max-w-7xl gap-6 px-4 py-4 lg:grid-cols-[260px_1fr] lg:px-6">
        <aside className="rounded-[28px] border border-white/70 bg-slate-950 px-5 py-6 text-slate-100 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.75)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-300">
                Workspace
              </p>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/20 text-lg font-semibold text-blue-100">
                  L
                </div>
                <div>
                  <p className="font-semibold text-white">LOOP</p>
                  <p className="text-sm text-slate-400">{demoWorkspace.name}</p>
                </div>
              </div>
            </div>
            <Button variant="ghost" className="text-slate-300 hover:bg-white/10 hover:text-white">
              <PanelLeft className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <Building2 className="h-4 w-4 text-blue-300" />
              <p className="text-sm font-medium text-white">Multi-tenant active</p>
            </div>
            <p className="mt-2 text-sm text-slate-400">
              Workspace isolation and RBAC-ready access across Admin, Analyst,
              and Viewer roles.
            </p>
          </div>

          <nav className="mt-8 space-y-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between rounded-2xl px-4 py-3 text-sm transition",
                    isActive
                      ? "bg-white text-slate-950 shadow-sm"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <span>{item.label}</span>
                  {isActive ? (
                    <span className="h-2 w-2 rounded-full bg-blue-600" />
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 rounded-2xl border border-blue-400/20 bg-blue-500/10 p-4">
            <Badge variant="blue">AI Classification</Badge>
            <p className="mt-3 text-sm text-slate-300">
              128 feedback items are loaded with theme labels, sentiment, and
              status metadata for the demo workspace.
            </p>
            <Button className="mt-4 w-full bg-white text-slate-950 hover:bg-slate-100">
              Review Queue
            </Button>
          </div>
        </aside>

        <div className="flex min-h-screen flex-col gap-6">
          <header className="rounded-[28px] border border-slate-200/80 bg-white/85 p-4 shadow-sm backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/80">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900">
                <Search className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                <Input
                  aria-label="Search workspace"
                  placeholder="Search feedback, themes, reports..."
                  className="border-0 bg-transparent p-0 shadow-none focus:ring-0 dark:bg-transparent"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="indigo">{demoWorkspace.name}</Badge>
                <Badge variant="outline">{user?.role ?? "Viewer"} Mode</Badge>
                <ThemeToggle />
                <Button variant="secondary" className="gap-2">
                  <Bell className="h-4 w-4" />
                  Alerts
                  <Badge variant="blue" className="ml-1">
                    {demoNotifications.length}
                  </Badge>
                </Button>
                <button className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-left shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <Avatar
                    initials={user?.avatarInitials ?? "LP"}
                    name={user?.name ?? "LOOP User"}
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {user?.name ?? "LOOP User"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {user?.role ?? "VIEWER"}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </button>
                <Button
                  variant="ghost"
                  className="dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
                  onClick={() => {
                    logout();
                    router.replace("/login");
                  }}
                >
                  Logout
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 rounded-[28px] border border-slate-200/80 bg-white/90 p-5 shadow-sm backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/90 sm:p-6">
            {children}
          </main>
        </div>
      </div>
      </div>
    </AuthGuard>
  );
}
