"use client";

import React, { useEffect, useState } from "react";
import { DataTable } from "@/components/tables";
import { useSession } from "next-auth/react";
import { 
  Building2, 
  ClipboardList, 
  AlertOctagon, 
  XCircle,
  CheckCircle2,
  Calendar,
  User as UserIcon,
  Globe,
  Briefcase,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";
import { FormField } from "@/components/forms";
import { Button, Card, CardContent, Input } from "@/components/ui";

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const user = session?.user as any;

  // Active tab state
  const [activeTab, setActiveTab] = useState<"general" | "audit_logs" | "danger_zone">("general");
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceDescription, setWorkspaceDescription] = useState("Enterprise Customer Feedback Portal");
  const [companyName, setCompanyName] = useState("Acme Corp");
  const [orgType, setOrgType] = useState("Enterprise SaaS");
  const [industry, setIndustry] = useState("Technology");
  const [timeZone, setTimeZone] = useState("UTC +05:30 IST");
  const [language, setLanguage] = useState("English (US)");
  
  const [error, setError] = useState("");

  const [workspaceSuccess, setWorkspaceSuccess] = useState(false);
  const [workspaceLoading, setWorkspaceLoading] = useState(false);

  // Duplicate logs state
  const [duplicateLogs, setDuplicateLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // Sync user details once session resolves
  useEffect(() => {
    if (user) {
      setWorkspaceName(user.workspaceName || "");
      if (user.companyName) setCompanyName(user.companyName);
      
      const isOwnerOrAdmin = user.role === "OWNER" || user.role === "ADMIN";
      if (isOwnerOrAdmin) {
        setLogsLoading(true);
        fetch("/api/settings/duplicate-logs")
          .then((res) => res.json())
          .then((data) => {
            setDuplicateLogs(data.logs || []);
            setLogsLoading(false);
          })
          .catch((err) => {
            console.error(err);
            setLogsLoading(false);
          });
      }
    }
  }, [user]);

  const handleUpdateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setWorkspaceSuccess(false);
    setWorkspaceLoading(true);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "workspace",
          name: workspaceName,
          slug: user.workspaceSlug // keeping original logic but not in UI
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update workspace settings.");
      }

      setWorkspaceSuccess(true);

      await updateSession({
        ...session,
        user: {
          ...session?.user,
          workspaceName: workspaceName
        }
      });
    } catch (err: any) {
      setError(err.message || "Failed to update workspace settings.");
    } finally {
      setWorkspaceLoading(false);
    }
  };
  const [searchQuery, setSearchQuery] = useState("");
  
  // Settings Search Hotkey
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        document.getElementById("settings-search")?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navGroups = [
    {
      title: "Workspace",
      items: [
        { value: "general", label: "General", icon: Building2 },
      ]
    },
    {
      title: "Data",
      items: [
        { value: "audit_logs", label: "Audit Logs", icon: ClipboardList },
      ]
    },
    {
      title: "System",
      items: [
        { value: "danger_zone", label: "Security", icon: AlertOctagon },
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight">Settings</h1>
        <p className="text-xs font-bold text-slate-500 dark:text-dark-muted mt-1">
          Configure application variables, profiles, subscriptions, and credentials.
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs font-semibold text-rose-700 flex items-center gap-2 max-w-xl">
          <XCircle className="h-4.5 w-4.5 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Settings Split Frame */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        
        {/* Settings Left Column */}
        <div className={`flex flex-col gap-4 shrink-0 ${isSidebarVisible ? "w-full md:w-[260px]" : "w-auto"}`}>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSidebarVisible(!isSidebarVisible)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-dark-elevated transition-colors"
              title={isSidebarVisible ? "Hide Sidebar" : "Show Sidebar"}
            >
              {isSidebarVisible ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
            </button>
            
            {isSidebarVisible && (
              <div className="relative flex-1">
                <input 
                  id="settings-search"
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search settings..."
                  className="w-full enterprise-search-input pl-3 pr-10 py-1.5 rounded-lg text-[13px] font-medium transition-all"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none text-slate-400 dark:text-slate-500">
                  <kbd className="font-sans text-[10px] font-semibold bg-slate-100 dark:bg-dark-hover px-1.5 py-0.5 rounded border border-slate-200 dark:border-dark-border">⌘K</kbd>
                </div>
              </div>
            )}
          </div>
          
          {/* Sub-navigation tab list */}
          {isSidebarVisible && (
            <div className="flex flex-col gap-5 overflow-y-auto pr-1 h-fit custom-scrollbar pb-4">
              {navGroups.map((group) => {
                // Filter items based on search query
                const filteredItems = group.items.filter(item => 
                  item.label.toLowerCase().includes(searchQuery.toLowerCase())
                );
                
                if (filteredItems.length === 0) return null;

                return (
                  <div key={group.title} className="flex flex-col gap-1">
                    <h4 className="text-[10px] font-extrabold text-slate-400 dark:text-dark-muted uppercase tracking-widest px-3 mb-1">
                      {group.title}
                    </h4>
                    {filteredItems.map((item) => {
                      const Icon = item.icon;
                      const isTabActive = activeTab === item.value;
                      return (
                        <button
                          key={item.value}
                          onClick={() => setActiveTab(item.value as any)}
                          className={`flex items-center gap-3 px-3 py-2 rounded-xl text-left text-[13px] font-semibold transition-all duration-300 relative group overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                            isTabActive
                              ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                              : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-dark-muted dark:hover:bg-dark-hover dark:hover:text-white"
                          }`}
                        >
                          <Icon className={`h-4.5 w-4.5 transition-transform duration-300 ${isTabActive ? "text-white" : "group-hover:scale-110"}`} />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Settings Right view panels switcher */}
        <div className="flex-1 w-full space-y-6">

          {/* TAB: GENERAL */}
          {activeTab === "general" && (
            <Card className="bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border rounded-2xl shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 dark:border-dark-border p-6 bg-slate-50/50 dark:bg-dark-elevated/20">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-50">Workspace Details</h3>
                <p className="text-[11px] text-slate-500 dark:text-dark-muted mt-0.5">Manage your organization&apos;s identity and regional defaults.</p>
              </div>

              <CardContent className="p-6">
                <form onSubmit={handleUpdateWorkspace} className="space-y-6 max-w-2xl">
                  {workspaceSuccess && (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-700 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Workspace parameters saved successfully!</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="Workspace Name">
                      <Input 
                        value={workspaceName} 
                        onChange={(e) => setWorkspaceName(e.target.value)} 
                        className="rounded-xl bg-slate-50 dark:bg-dark-input border-slate-200 dark:border-dark-border"
                      />
                    </FormField>

                    <FormField label="Company Name">
                      <Input 
                        value={companyName} 
                        onChange={(e) => setCompanyName(e.target.value)} 
                        className="rounded-xl bg-slate-50 dark:bg-dark-input border-slate-200 dark:border-dark-border"
                      />
                    </FormField>
                  </div>

                  <FormField label="Workspace Description">
                    <Input 
                      value={workspaceDescription} 
                      onChange={(e) => setWorkspaceDescription(e.target.value)} 
                      className="rounded-xl bg-slate-50 dark:bg-dark-input border-slate-200 dark:border-dark-border"
                    />
                  </FormField>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="Organization Type">
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input 
                          value={orgType} 
                          onChange={(e) => setOrgType(e.target.value)} 
                          className="pl-9 rounded-xl bg-slate-50 dark:bg-dark-input border-slate-200 dark:border-dark-border"
                        />
                      </div>
                    </FormField>

                    <FormField label="Industry">
                      <Input 
                        value={industry} 
                        onChange={(e) => setIndustry(e.target.value)} 
                        className="rounded-xl bg-slate-50 dark:bg-dark-input border-slate-200 dark:border-dark-border"
                      />
                    </FormField>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="Default Time Zone">
                      <div className="relative">
                        <Globe className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <select 
                          value={timeZone}
                          onChange={(e) => setTimeZone(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-dark-input border border-slate-200 dark:border-dark-border rounded-xl pl-9 pr-3 py-2 text-sm font-medium focus:ring-2 focus:ring-indigo-500 dark:text-white outline-none appearance-none"
                        >
                          <option>UTC -08:00 Pacific Time</option>
                          <option>UTC -05:00 Eastern Time</option>
                          <option>UTC +00:00 GMT</option>
                          <option>UTC +05:30 IST</option>
                        </select>
                      </div>
                    </FormField>

                    <FormField label="Default Language">
                      <select 
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-dark-input border border-slate-200 dark:border-dark-border rounded-xl px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-indigo-500 dark:text-white outline-none appearance-none"
                      >
                        <option>English (US)</option>
                        <option>English (UK)</option>
                        <option>Spanish</option>
                        <option>French</option>
                      </select>
                    </FormField>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-dark-border">
                    <FormField label="Workspace Created Date">
                      <div className="relative">
                        <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input 
                          value="January 12, 2026" 
                          readOnly
                          className="pl-9 rounded-xl bg-slate-100 dark:bg-slate-900 border-transparent text-slate-500 dark:text-dark-muted cursor-not-allowed"
                        />
                      </div>
                    </FormField>

                    <FormField label="Workspace Owner">
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input 
                          value={user?.name || "Administrator"} 
                          readOnly
                          className="pl-9 rounded-xl bg-slate-100 dark:bg-slate-900 border-transparent text-slate-500 dark:text-dark-muted cursor-not-allowed"
                        />
                      </div>
                    </FormField>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={workspaceLoading} className="text-[13px] font-bold px-6 bg-slate-900 hover:bg-slate-800 text-white dark:bg-indigo-600 dark:hover:bg-indigo-700 rounded-xl transition-all shadow-sm">
                      {workspaceLoading ? "Saving..." : "Save parameters"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* TAB: AUDIT LOGS */}
          {activeTab === "audit_logs" && (
            <Card className="bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border rounded-2xl shadow-sm">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-50">Deduplication Audit Logs</h3>
                    <p className="text-[11px] text-slate-450 mt-0.5">Track every automated feedback merge applied by the ingestion engine.</p>
                  </div>
                  {duplicateLogs.length > 0 && (
                    <Button 
                      variant="secondary" 
                      className="text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 dark:bg-dark-elevated"
                    >
                      Export Audit Log (CSV)
                    </Button>
                  )}
                </div>

                {logsLoading ? (
                  <div className="text-center py-8 text-[13px] text-slate-500 dark:text-dark-muted font-semibold animate-pulse">
                    Loading duplicate audit records...
                  </div>
                ) : duplicateLogs.length === 0 ? (
                  <div className="text-center py-10 text-[13px] text-slate-500 dark:text-dark-muted font-semibold">
                    No duplicate feedbacks have been logged yet.
                  </div>
                ) : (
                  <div className="mt-5">
                    <DataTable
                      columns={[
                        { key: "timestamp", label: "Timestamp" },
                        { key: "incoming", label: "Incoming Feedback" },
                        { key: "customer", label: "Customer" },
                        { key: "channel", label: "Channel" },
                        { key: "score", label: "Similarity %" },
                        { key: "action", label: "Action" }
                      ]}
                      rows={duplicateLogs.map((log: any) => [
                        <span key={`ts-${log.id}`} className="text-slate-500 dark:text-dark-muted font-medium">
                          {new Date(log.createdAt).toLocaleString()}
                        </span>,
                        <div key={`inc-${log.id}`} className="max-w-[200px] truncate" title={log.feedbackContent}>
                          {log.feedbackContent}
                        </div>,
                        <span key={`cust-${log.id}`}>{log.customerName}</span>,
                        <span key={`chan-${log.id}`} className="capitalize">{log.sourceChannel}</span>,
                        <span key={`score-${log.id}`} className="font-mono text-indigo-600 dark:text-indigo-400">
                          {Math.round(log.similarityScore * 100)}%
                        </span>,
                        <span key={`act-${log.id}`} className="text-xs font-bold text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-md whitespace-nowrap">
                          {log.actionTaken}
                        </span>
                      ])}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* TAB: DANGER ZONE */}
          {activeTab === "danger_zone" && (
            <Card className="bg-white dark:bg-dark-card border border-rose-200 dark:border-rose-900/50 rounded-2xl shadow-sm">
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-extrabold text-rose-600 dark:text-rose-500">Danger Zone</h3>
                  <p className="text-[11px] text-slate-500 dark:text-dark-muted mt-0.5">Destructive actions that cannot be reversed.</p>
                </div>

                <div className="bg-rose-50 dark:bg-rose-950/20 rounded-xl border border-rose-200 dark:border-rose-900/30 p-5 flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-rose-900 dark:text-rose-400">Delete Workspace</h4>
                    <p className="text-xs font-medium text-rose-700/80 dark:text-rose-500/80 mt-1 max-w-sm">
                      Permanently delete this workspace, including all feedback, API keys, AI settings, and billing histories.
                    </p>
                  </div>
                  <Button variant="danger" className="text-xs font-bold whitespace-nowrap bg-rose-600 hover:bg-rose-700 text-white rounded-xl">
                    Delete workspace
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}
