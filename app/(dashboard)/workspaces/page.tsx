"use client";

import React, { useEffect, useState } from "react";
import { 
  Building2, Plus, Users, Settings, Trash2, Search, 
  Check, CreditCard, HardDrive, ShieldCheck, X, Activity, 
  ArrowLeft, RefreshCw, AlertTriangle, FileText, CheckCircle2, 
  ExternalLink, Mail, ArrowUpRight 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface WorkspaceSummary {
  id: string;
  name: string;
  slug: string;
  owner: string;
  membersCount: number;
  feedbackCount: number;
  reportsCount: number;
  themesCount: number;
  createdAt: string;
  plan: string;
  storageUsed: string;
  storageLimit: string;
  isActive: boolean;
  status?: string;
}

interface WorkspaceDetails {
  workspace: WorkspaceSummary;
  statistics: {
    totalFeedback: number;
    positiveFeedback: number;
    negativeFeedback: number;
    neutralFeedback: number;
    totalReports: number;
    totalThemes: number;
    connectedIntegrations: number;
  };
  members: {
    id: string;
    name: string;
    email: string;
    role: string;
    joinedDate: string;
    status: string;
  }[];
  reports: {
    id: string;
    title: string;
    status: string;
    createdAt: string;
    createdBy: string;
  }[];
  themes: {
    id: string;
    name: string;
    feedbackCount: number;
    createdAt: string;
  }[];
  activities: {
    id: string;
    action: string;
    relativeTime: string;
    createdAt: string;
  }[];
  charts: {
    trend: { date: string; count: number }[];
    sources: { source: string; count: number }[];
    sentiments: { label: string; count: number }[];
  };
  integrations: {
    name: string;
    status: string;
    health: string;
    connectedBy: string;
    date: string;
  }[];
  imports: {
    filename: string;
    rows: number;
    failed: number;
    status: string;
    date: string;
  }[];
}

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<WorkspaceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  
  // Selected workspace console state
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
  const [details, setDetails] = useState<WorkspaceDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<"overview" | "members" | "reports" | "activities" | "integrations" | "imports" | "danger_zone">("overview");

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // Form states
  const [newWsName, setNewWsName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("ANALYST");

  // Editing role state
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [newMemberRole, setNewMemberRole] = useState("ANALYST");

  // Rename selected workspace state
  const [renameName, setRenameName] = useState("");
  const [renameSlug, setRenameSlug] = useState("");

  // Auto-dismiss toast
  const triggerToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch all workspaces list
  const fetchWorkspaces = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/workspace");
      if (!res.ok) throw new Error("Failed to fetch workspaces list.");
      const data = await res.json();
      setWorkspaces(data.workspaces || []);
    } catch (err: any) {
      setError(err.message || "An error occurred while loading workspaces.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch selected workspace dynamic details
  const fetchWorkspaceDetails = async (id: string) => {
    setDetailsLoading(true);
    try {
      const res = await fetch(`/api/workspace/${id}`);
      if (!res.ok) throw new Error("Failed to load workspace parameters.");
      const data = await res.json();
      setDetails(data);
      setRenameName(data.workspace.name);
      setRenameSlug(data.workspace.slug);
    } catch (err: any) {
      triggerToast(err.message || "Error loading organization parameters.", "error");
    } finally {
      setDetailsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  useEffect(() => {
    if (selectedWorkspaceId) {
      fetchWorkspaceDetails(selectedWorkspaceId);
    } else {
      setDetails(null);
    }
  }, [selectedWorkspaceId]);

  // Create Workspace POST API
  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) return;

    try {
      const res = await fetch("/api/workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newWsName })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create workspace.");
      
      triggerToast("Workspace created successfully!");
      setShowCreateModal(false);
      setNewWsName("");
      fetchWorkspaces();
    } catch (err: any) {
      triggerToast(err.message || "Failed to create workspace.", "error");
    }
  };

  // Invite Member POST API
  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkspaceId || !inviteEmail.trim()) return;

    try {
      const res = await fetch(`/api/workspace/${selectedWorkspaceId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send invitation.");

      triggerToast(`Invitation sent to ${inviteEmail}!`);
      setShowInviteModal(false);
      setInviteEmail("");
      fetchWorkspaceDetails(selectedWorkspaceId);
    } catch (err: any) {
      triggerToast(err.message || "Failed to send invitation.", "error");
    }
  };

  // Update Member Role PATCH API
  const handleUpdateMemberRole = async (memberId: string) => {
    if (!selectedWorkspaceId) return;

    try {
      const res = await fetch(`/api/workspace/${selectedWorkspaceId}/member/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newMemberRole })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update role.");

      triggerToast("Member role updated successfully!");
      setEditingMemberId(null);
      fetchWorkspaceDetails(selectedWorkspaceId);
    } catch (err: any) {
      triggerToast(err.message || "Failed to update role.", "error");
    }
  };

  // Remove Member DELETE API
  const handleRemoveMember = async (memberId: string) => {
    if (!selectedWorkspaceId || !confirm("Are you sure you want to remove this member?")) return;

    try {
      const res = await fetch(`/api/workspace/${selectedWorkspaceId}/member/${memberId}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to remove member.");

      triggerToast("Member removed successfully.");
      fetchWorkspaceDetails(selectedWorkspaceId);
    } catch (err: any) {
      triggerToast(err.message || "Failed to remove member.", "error");
    }
  };

  // Update Workspace Metadata PUT API
  const handleUpdateWorkspaceDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkspaceId) return;

    try {
      const res = await fetch(`/api/workspace/${selectedWorkspaceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: renameName, slug: renameSlug })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update workspace details.");

      triggerToast("Workspace details updated successfully!");
      fetchWorkspaces();
      fetchWorkspaceDetails(selectedWorkspaceId);
    } catch (err: any) {
      triggerToast(err.message || "Failed to update workspace.", "error");
    }
  };

  // Delete Workspace DELETE API
  const handleDeleteWorkspace = async () => {
    if (!selectedWorkspaceId || !confirm("CRITICAL WARNING: This will permanently delete this workspace and all associated feedback, themes, and reports. Are you sure?")) return;

    try {
      const res = await fetch(`/api/workspace/${selectedWorkspaceId}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete workspace.");

      triggerToast("Workspace deleted successfully.");
      setSelectedWorkspaceId(null);
      fetchWorkspaces();
    } catch (err: any) {
      triggerToast(err.message || "Failed to delete workspace.", "error");
    }
  };

  // Filters workspaces list
  const filteredWorkspaces = workspaces.filter(ws => 
    ws.name.toLowerCase().includes(search.toLowerCase()) ||
    ws.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toast Alert popups */}
      {toastMessage && (
        <div className={`fixed right-6 top-6 z-[999] flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-xs font-extrabold animate-in fade-in slide-in-from-top-4 ${
          toastType === "success" 
            ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/90 dark:border-emerald-800 dark:text-emerald-450" 
            : "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/90 dark:border-rose-800 dark:text-rose-450"
        }`}>
          {toastType === "success" ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <AlertTriangle className="h-4 w-4 text-rose-500" />}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* VIEW: MAIN WORKSPACES SELECTION GRID */}
      {!selectedWorkspaceId ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight">Workspaces</h1>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
                Select a workspace to manage collaborators, visualize sentiment statistics, or configure organization rules.
              </p>
            </div>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="h-9 text-xs font-extrabold gap-1.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Create Workspace</span>
            </Button>
          </div>

          {/* Error fallback */}
          {error && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs font-semibold text-rose-700 flex items-center gap-2 max-w-xl">
              <AlertTriangle className="h-4 w-4 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Search Controls */}
          <div className="flex items-center justify-between gap-3 border border-slate-200/80 dark:border-slate-850 bg-white dark:bg-slate-900 p-3.5 rounded-2xl shadow-sm">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search workspaces by name or slug..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl py-1.5 pl-9 pr-4 text-xs font-semibold text-slate-700 dark:text-slate-200 placeholder-slate-400 outline-none focus:border-indigo-500"
              />
            </div>
            <p className="text-[10px] font-extrabold text-slate-400">Total: {filteredWorkspaces.length} workspaces</p>
          </div>

          {/* Workspaces List Skeleton / Grid */}
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((s) => (
                <div key={s} className="h-48 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 animate-pulse p-5 space-y-4">
                  <div className="flex gap-3">
                    <div className="h-10 w-10 bg-slate-100 dark:bg-slate-800 rounded-xl" />
                    <div className="space-y-1.5 flex-1 pt-1">
                      <div className="h-3 w-2/3 bg-slate-100 dark:bg-slate-800 rounded" />
                      <div className="h-2 w-1/3 bg-slate-100 dark:bg-slate-800 rounded" />
                    </div>
                  </div>
                  <div className="space-y-2 pt-2">
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded" />
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredWorkspaces.length === 0 ? (
            <Card className="border-dashed py-14 text-center">
              <CardContent className="space-y-2">
                <Building2 className="h-10 w-10 text-slate-300 mx-auto" />
                <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-200">No workspaces available</h3>
                <p className="text-[11px] text-slate-500 font-medium">Create a new workspace using the button above to begin importing customer feedback.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredWorkspaces.map((ws) => (
                <Card key={ws.id} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden flex flex-col justify-between">
                  <div className="p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-200/60 dark:border-slate-800 flex items-center justify-center font-black text-slate-700 dark:text-slate-350">
                          {ws.name[0]}
                        </div>
                        <div>
                          <h3 className="text-xs font-extrabold text-slate-900 dark:text-slate-50">{ws.name}</h3>
                          <p className="text-[9.5px] font-bold text-slate-400 font-mono mt-0.5">/{ws.slug}</p>
                        </div>
                      </div>
                      <Badge variant="indigo" className="text-[8.5px] font-extrabold px-1.5 py-0 uppercase">
                        {ws.plan}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-[11px] font-bold text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-850">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Workspace Owner</span>
                        <span className="text-slate-850 dark:text-slate-300">{ws.owner}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Total Members</span>
                        <span className="text-slate-850 dark:text-slate-300">{ws.membersCount} collaborators</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Feedback Logged</span>
                        <span className="text-slate-855 dark:text-slate-300 font-extrabold text-indigo-650">{ws.feedbackCount} items</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50/50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-850 px-4 py-3 flex items-center justify-between">
                    <span className="text-[9.5px] font-bold text-slate-405">Created {new Date(ws.createdAt).toLocaleDateString()}</span>
                    <button 
                      onClick={() => setSelectedWorkspaceId(ws.id)}
                      className="h-7 px-3 text-[10px] font-extrabold rounded-lg bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition inline-flex items-center justify-center shadow-sm"
                    >
                      Manage
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* VIEW: DETAIL WORKSPACE MANAGEMENT CONSOLE */
        <div className="space-y-6">
          {/* Top Back Action navigation header */}
          <div className="flex items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            <button 
              onClick={() => setSelectedWorkspaceId(null)}
              className="flex items-center gap-1 text-xs font-extrabold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Workspaces</span>
            </button>

            {details && (
              <div className="flex items-center gap-2">
                <Badge variant="indigo" className="text-[9.5px] font-extrabold uppercase px-2">
                  Plan: {details.workspace.plan}
                </Badge>
                <Badge variant="slate" className="text-[9.5px] font-extrabold uppercase px-2 bg-slate-100 text-slate-655 dark:bg-slate-800 dark:text-slate-300">
                  Status: {details.workspace.status}
                </Badge>
              </div>
            )}
          </div>

          {detailsLoading || !details ? (
            <div className="space-y-6">
              {/* Header skeleton */}
              <div className="space-y-2">
                <div className="h-6 w-1/4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                <div className="h-3 w-1/3 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
              </div>

              {/* Stats cards skeleton */}
              <div className="grid gap-4 sm:grid-cols-4">
                {[1, 2, 3, 4].map(s => (
                  <div key={s} className="h-20 bg-white dark:bg-slate-900 border rounded-2xl animate-pulse" />
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Workspace detailed header summary */}
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight flex items-center gap-2">
                  <Building2 className="h-6 w-6 text-indigo-500" />
                  <span>{details.workspace.name}</span>
                </h1>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
                  Owner: <span className="text-slate-700 dark:text-slate-300 font-extrabold">{details.workspace.owner}</span> • Created on {new Date(details.workspace.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Statistics Grid */}
              <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                <Card className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-855 rounded-2xl shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase">Total Feedback</p>
                    <h3 className="text-xl font-black text-slate-900 dark:text-slate-50 mt-1">{details.statistics.totalFeedback}</h3>
                    <p className="text-[9px] font-bold text-slate-400 mt-0.5">Direct Database rows</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-855 rounded-2xl shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-[10px] font-extrabold text-slate-450 uppercase text-emerald-600">Positive sentiment</p>
                    <h3 className="text-xl font-black text-slate-900 dark:text-slate-50 mt-1">{details.statistics.positiveFeedback}</h3>
                    <p className="text-[9px] font-bold text-slate-400 mt-0.5">Score label logs</p>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-855 rounded-2xl shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-[10px] font-extrabold text-slate-455 uppercase text-rose-600">Negative sentiment</p>
                    <h3 className="text-xl font-black text-slate-900 dark:text-slate-50 mt-1">{details.statistics.negativeFeedback}</h3>
                    <p className="text-[9px] font-bold text-slate-400 mt-0.5">Requires resolution</p>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-855 rounded-2xl shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase">Active Themes</p>
                    <h3 className="text-xl font-black text-slate-900 dark:text-slate-50 mt-1">{details.statistics.totalThemes}</h3>
                    <p className="text-[9px] font-bold text-slate-450 mt-0.5">Semantic groups</p>
                  </CardContent>
                </Card>
              </div>

              {/* Sub-tab view selection controller */}
              <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2">
                {(["overview", "members", "reports", "activities", "integrations", "imports", "danger_zone"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveSubTab(tab)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all uppercase tracking-wider ${
                      activeSubTab === tab 
                        ? "bg-[#efeffe] dark:bg-indigo-950/60 text-[#4f46e5] dark:text-indigo-400 shadow-sm"
                        : "text-slate-550 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    }`}
                  >
                    {tab.replace("_", " ")}
                  </button>
                ))}
              </div>

              {/* SUB TAB VIEW: OVERVIEW */}
              {activeSubTab === "overview" && (
                <div className="grid gap-6 md:grid-cols-[1fr_300px]">
                  
                  {/* Left Column: Charts visualization */}
                  <div className="space-y-6">
                    <Card className="bg-white dark:bg-slate-900 border border-slate-200/85 dark:border-slate-850 rounded-2xl shadow-sm">
                      <CardContent className="p-6 space-y-4">
                        <h3 className="text-xs font-extrabold text-slate-900 dark:text-slate-50 uppercase tracking-widest">Feedback Ingestion Trend (7 Days)</h3>
                        
                        {/* Custom robust SVG Line chart points */}
                        <div className="h-56 w-full flex items-end justify-between gap-1.5 pt-4">
                          {details.charts.trend.length === 0 ? (
                            <div className="w-full text-center text-xs text-slate-400 font-semibold py-12">No recent ingestion trends logged.</div>
                          ) : (
                            details.charts.trend.map((point, index) => {
                              const maxVal = Math.max(...details.charts.trend.map(p => p.count), 1);
                              const heightPct = Math.max((point.count / maxVal) * 100, 8); // Minimum 8% bar height for visibility
                              return (
                                <div key={point.date} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                                  <div className="text-[10px] font-black text-slate-800 dark:text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {point.count}
                                  </div>
                                  <div 
                                    style={{ height: `${heightPct}%` }}
                                    className="w-full bg-indigo-500 dark:bg-indigo-600 rounded-t-lg group-hover:bg-[#4f46e5] transition-all duration-300"
                                  />
                                  <div className="text-[9px] font-bold text-slate-405 group-hover:text-slate-700 whitespace-nowrap overflow-hidden text-ellipsis w-full text-center">
                                    {new Date(point.date).toLocaleDateString(undefined, { weekday: "short" })}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Sentiment Analysis distribution ratios */}
                    <Card className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 rounded-2xl shadow-sm">
                      <CardContent className="p-6 space-y-4">
                        <h3 className="text-xs font-extrabold text-slate-900 dark:text-slate-50 uppercase tracking-widest">Sentiment breakdown distribution</h3>
                        
                        <div className="space-y-4 pt-2 text-xs font-bold">
                          <div>
                            <div className="flex justify-between text-slate-655 dark:text-slate-400 mb-1.5">
                              <span>Positive (Good)</span>
                              <span>{details.statistics.positiveFeedback} items</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                              <div 
                                style={{ width: `${(details.statistics.positiveFeedback / (details.statistics.totalFeedback || 1)) * 100}%` }}
                                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between text-slate-655 dark:text-slate-400 mb-1.5">
                              <span>Negative (Action required)</span>
                              <span>{details.statistics.negativeFeedback} items</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                              <div 
                                style={{ width: `${(details.statistics.negativeFeedback / (details.statistics.totalFeedback || 1)) * 100}%` }}
                                className="bg-rose-500 h-full rounded-full transition-all duration-500"
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-slate-655 dark:text-slate-400 mb-1.5">
                              <span>Neutral / Unclassified</span>
                              <span>{details.statistics.neutralFeedback} items</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                              <div 
                                style={{ width: `${(details.statistics.neutralFeedback / (details.statistics.totalFeedback || 1)) * 100}%` }}
                                className="bg-slate-400 h-full rounded-full transition-all duration-500"
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right Column: Organization resources & settings summary */}
                  <div className="space-y-6">
                    <Card className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 rounded-2xl shadow-sm">
                      <CardContent className="p-4 space-y-4">
                        <h3 className="text-xs font-extrabold text-slate-900 dark:text-slate-50 uppercase tracking-widest flex items-center gap-2">
                          <HardDrive className="h-4 w-4 text-indigo-500" />
                          <span>Resources Allocation</span>
                        </h3>

                        <div className="space-y-4">
                          <div className="space-y-1.5 text-xs font-bold">
                            <div className="flex justify-between text-slate-500">
                              <span>Plan Storage Used</span>
                              <span className="text-slate-800 dark:text-slate-200">{details.workspace.storageUsed}</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                              <div className="bg-indigo-650 h-full w-[2.5%] rounded-full" />
                            </div>
                          </div>

                          <div className="space-y-1.5 text-xs font-bold pt-1 border-t border-slate-100 dark:border-slate-850">
                            <p className="text-[10px] uppercase font-extrabold text-slate-455">Organization settings</p>
                            <form onSubmit={handleUpdateWorkspaceDetails} className="space-y-3">
                              <div className="space-y-1">
                                <span className="text-[9px] uppercase font-bold text-slate-400">Rename workspace</span>
                                <input
                                  type="text"
                                  value={renameName}
                                  onChange={(e) => setRenameName(e.target.value)}
                                  className="w-full bg-slate-50 dark:bg-slate-955 border rounded-lg px-2.5 py-1.5 text-xs font-bold outline-none"
                                />
                              </div>
                              <div className="space-y-1">
                                <span className="text-[9px] uppercase font-bold text-slate-400">URL Slug</span>
                                <input
                                  type="text"
                                  value={renameSlug}
                                  onChange={(e) => setRenameSlug(e.target.value)}
                                  className="w-full bg-slate-50 dark:bg-slate-955 border rounded-lg px-2.5 py-1.5 text-xs font-mono outline-none"
                                />
                              </div>
                              <button type="submit" className="w-full text-xs font-bold py-1.5 h-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition flex items-center justify-center">
                                Save updates
                              </button>
                            </form>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* SUB TAB VIEW: MEMBERS */}
              {activeSubTab === "members" && (
                <Card className="bg-white dark:bg-slate-900 border border-slate-200/85 dark:border-slate-850 rounded-2xl shadow-sm">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-xs font-extrabold text-slate-900 dark:text-slate-50 uppercase tracking-widest">Active Workspace Collaborators</h3>
                        <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Control role definitions, edit permission access scopes, or add new reviewers.</p>
                      </div>
                      <button onClick={() => setShowInviteModal(true)} className="text-xs font-extrabold gap-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 transition inline-flex items-center justify-center">
                        <Plus className="h-3.5 w-3.5" />
                        <span>Invite member</span>
                      </button>
                    </div>

                    <div className="overflow-x-auto text-xs font-semibold">
                      <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
                        <thead className="bg-slate-50 dark:bg-slate-955 text-slate-455 dark:text-slate-400 uppercase tracking-wider text-[10px]">
                          <tr>
                            <th className="px-4 py-3 text-left">Collaborator</th>
                            <th className="px-4 py-3 text-left">Email Address</th>
                            <th className="px-4 py-3 text-left">Role Type</th>
                            <th className="px-4 py-3 text-left">Joined Date</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                          {details.members.map((m) => (
                            <tr key={m.id} className="hover:bg-slate-50/50">
                              <td className="px-4 py-3 flex items-center gap-2">
                                <div className="h-7 w-7 rounded-full bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center font-extrabold text-xs text-indigo-650 dark:text-indigo-400">
                                  {m.name[0]}
                                </div>
                                <span className="font-extrabold">{m.name}</span>
                              </td>
                              <td className="px-4 py-3">{m.email}</td>
                              <td className="px-4 py-3">
                                {editingMemberId === m.id ? (
                                  <div className="flex items-center gap-1.5">
                                    <select 
                                      value={newMemberRole}
                                      onChange={(e) => setNewMemberRole(e.target.value)}
                                      className="bg-white dark:bg-slate-900 border rounded px-1.5 py-0.5"
                                    >
                                      <option value="ADMIN">ADMIN</option>
                                      <option value="ANALYST">ANALYST</option>
                                      <option value="VIEWER">VIEWER</option>
                                    </select>
                                    <button 
                                      onClick={() => handleUpdateMemberRole(m.id)}
                                      className="p-1 text-emerald-600 hover:text-emerald-700"
                                    >
                                      <Check className="h-3.5 w-3.5" />
                                    </button>
                                    <button 
                                      onClick={() => setEditingMemberId(null)}
                                      className="p-1 text-rose-600 hover:text-rose-700"
                                    >
                                      <X className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <span 
                                    onClick={() => {
                                      setEditingMemberId(m.id);
                                      setNewMemberRole(m.role);
                                    }}
                                    className="cursor-pointer border-b border-dashed border-slate-400 hover:text-[#4f46e5]"
                                  >
                                    {m.role}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-slate-500 font-normal">{new Date(m.joinedDate).toLocaleDateString()}</td>
                              <td className="px-4 py-3 text-right">
                                {m.role !== "OWNER" && (
                                  <button 
                                    onClick={() => handleRemoveMember(m.id)}
                                    className="p-1 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* SUB TAB VIEW: REPORTS */}
              {activeSubTab === "reports" && (
                <Card className="bg-white dark:bg-slate-900 border border-slate-200/85 dark:border-slate-850 rounded-2xl shadow-sm">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="text-xs font-extrabold text-slate-900 dark:text-slate-50 uppercase tracking-widest">Workspace Insights Reports</h3>
                    
                    {details.reports.length === 0 ? (
                      <div className="text-center py-10 text-xs text-slate-405 font-semibold">
                        <FileText className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                        <span>No reports generated inside this workspace yet.</span>
                      </div>
                    ) : (
                      <div className="overflow-x-auto text-xs font-semibold">
                        <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
                          <thead className="bg-slate-50 dark:bg-slate-955 text-slate-455 uppercase tracking-wider text-[10px]">
                            <tr>
                              <th className="px-4 py-3 text-left">Report Document</th>
                              <th className="px-4 py-3 text-left">Status</th>
                              <th className="px-4 py-3 text-left">Compiled By</th>
                              <th className="px-4 py-3 text-left">Created Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                            {details.reports.map((r) => (
                              <tr key={r.id} className="hover:bg-slate-50/50">
                                <td className="px-4 py-3 flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-indigo-500" />
                                  <span className="font-extrabold">{r.title}</span>
                                </td>
                                <td className="px-4 py-3">
                                  <Badge variant={r.status === "READY" ? "green" : "slate"} className="text-[8px] font-extrabold uppercase px-1.5 py-0">
                                    {r.status}
                                  </Badge>
                                </td>
                                <td className="px-4 py-3 text-slate-500">{r.createdBy}</td>
                                <td className="px-4 py-3 text-slate-450 font-normal">{new Date(r.createdAt).toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* SUB TAB VIEW: ACTIVITIES */}
              {activeSubTab === "activities" && (
                <Card className="bg-white dark:bg-slate-900 border border-slate-200/85 dark:border-slate-850 rounded-2xl shadow-sm">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="text-xs font-extrabold text-slate-900 dark:text-slate-50 uppercase tracking-widest flex items-center gap-2">
                      <Activity className="h-4 w-4 text-indigo-500 animate-pulse" />
                      <span>Workspace Audit Logs Stream</span>
                    </h3>

                    <div className="space-y-4 pt-2">
                      {details.activities.length === 0 ? (
                        <p className="text-center text-xs text-slate-400 py-10 font-bold">No active logs generated.</p>
                      ) : (
                        details.activities.map((act) => (
                          <div key={act.id} className="flex gap-3 items-start text-xs border-b border-slate-50 dark:border-slate-850 pb-3">
                            <div className="h-2 w-2 rounded-full bg-indigo-500 mt-1.5" />
                            <div className="flex-1">
                              <p className="font-bold text-slate-800 dark:text-slate-200">{act.action}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{act.relativeTime} • {new Date(act.createdAt).toLocaleString()}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* SUB TAB VIEW: INTEGRATIONS */}
              {activeSubTab === "integrations" && (
                <Card className="bg-white dark:bg-slate-900 border border-slate-200/85 dark:border-slate-850 rounded-2xl shadow-sm">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="text-xs font-extrabold text-slate-900 dark:text-slate-50 uppercase tracking-widest">Workspace Connected Integrations</h3>
                    
                    <div className="grid gap-4 sm:grid-cols-2">
                      {details.integrations.map((int) => (
                        <div key={int.name} className="border rounded-2xl p-4 flex justify-between items-start bg-slate-50/50 dark:bg-slate-950/20">
                          <div className="space-y-1">
                            <p className="text-xs font-extrabold text-slate-850 dark:text-slate-100">{int.name}</p>
                            <p className="text-[10px] font-bold text-slate-400">Connected by {int.connectedBy} on {int.date}</p>
                            <div className="flex items-center gap-1.5 pt-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              <span className="text-[9.5px] font-extrabold text-emerald-600 uppercase">{int.health}</span>
                            </div>
                          </div>

                          <Badge variant="indigo" className="text-[8.5px] font-extrabold px-1.5 py-0">
                            {int.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* SUB TAB VIEW: IMPORTS */}
              {activeSubTab === "imports" && (
                <Card className="bg-white dark:bg-slate-900 border border-slate-200/85 dark:border-slate-850 rounded-2xl shadow-sm">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="text-xs font-extrabold text-slate-900 dark:text-slate-50 uppercase tracking-widest">Recent Ingestion Imports (CSV)</h3>
                    
                    <div className="overflow-x-auto text-xs font-semibold">
                      <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
                        <thead className="bg-slate-50 dark:bg-slate-955 text-slate-455 uppercase tracking-wider text-[10px]">
                          <tr>
                            <th className="px-4 py-3 text-left">CSV File Imported</th>
                            <th className="px-4 py-3 text-left">Rows Successfully Loaded</th>
                            <th className="px-4 py-3 text-left">Failed Rows</th>
                            <th className="px-4 py-3 text-left">Execution Status</th>
                            <th className="px-4 py-3 text-left">Upload Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                          {details.imports.map((imp) => (
                            <tr key={imp.filename} className="hover:bg-slate-50/50">
                              <td className="px-4 py-3 font-mono text-slate-855 dark:text-slate-200">{imp.filename}</td>
                              <td className="px-4 py-3">{imp.rows} lines</td>
                              <td className="px-4 py-3 text-rose-500">{imp.failed} failed</td>
                              <td className="px-4 py-3">
                                <Badge variant={imp.status === "Success" ? "green" : "amber"} className="text-[8px] font-extrabold px-1.5 py-0 uppercase">
                                  {imp.status}
                                </Badge>
                              </td>
                              <td className="px-4 py-3 text-slate-500 font-normal">{imp.date}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* SUB TAB VIEW: DANGER ZONE */}
              {activeSubTab === "danger_zone" && (
                <Card className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-950/40 rounded-2xl shadow-sm overflow-hidden">
                  <div className="bg-rose-50/50 dark:bg-rose-955/10 px-6 py-4 border-b border-rose-100 dark:border-rose-950/20">
                    <h3 className="text-sm font-extrabold text-rose-700 dark:text-rose-455">Workspace Danger Zone</h3>
                    <p className="text-[11px] text-rose-600/80 dark:text-rose-500 mt-0.5">Destructive administrative actions. Operations are irreversible.</p>
                  </div>

                  <CardContent className="p-6 space-y-6 text-xs font-bold">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-0.5">
                        <p className="text-slate-800 dark:text-slate-200">Delete Loop Workspace Account</p>
                        <p className="text-[10.5px] text-slate-455 font-normal">Purges SQL databases references, reports documents, and all team memberships parameters.</p>
                      </div>
                      <button 
                        onClick={handleDeleteWorkspace}
                        className="h-8 px-4 text-xs font-extrabold rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition inline-flex items-center justify-center shadow-sm"
                      >
                        Delete Workspace
                      </button>
                    </div>
                  </CardContent>
                </Card>
              )}

            </div>
          )}

        </div>
      )}

      {/* MODAL: Create Workspace dialog */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="absolute inset-0" onClick={() => setShowCreateModal(false)} />
          
          <form 
            onSubmit={handleCreateWorkspace}
            className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl p-6 w-full max-w-md space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-850">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-indigo-500" />
                <span>Create Workspace Org</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setShowCreateModal(false)} 
                className="p-1 hover:bg-slate-100 rounded text-slate-450"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="text-[10px] font-extrabold text-slate-450 uppercase">Workspace Name</label>
              <input
                type="text"
                placeholder="Acme feedback Hub"
                value={newWsName}
                onChange={(e) => setNewWsName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 font-semibold text-xs focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-850">
              <button 
                type="button" 
                onClick={() => setShowCreateModal(false)} 
                className="text-xs font-bold text-slate-505 hover:text-slate-705 px-3 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={!newWsName.trim()}
                className="text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: Invite Member Dialog */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="absolute inset-0" onClick={() => setShowInviteModal(false)} />
          
          <form 
            onSubmit={handleInviteMember}
            className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl p-6 w-full max-w-md space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-850">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                <Mail className="h-4 w-4 text-indigo-500" />
                <span>Invite Workspace Collaborator</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setShowInviteModal(false)} 
                className="p-1 hover:bg-slate-100 rounded text-slate-450"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-450 uppercase">Email Address</label>
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 font-semibold text-xs focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-450 uppercase">Select Role Scope</label>
                <select 
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 rounded-xl text-xs font-bold px-3 py-2 focus:outline-none"
                >
                  <option value="ADMIN">ADMIN (Workspace settings & members)</option>
                  <option value="ANALYST">ANALYST (Deduplication & feeds review)</option>
                  <option value="VIEWER">VIEWER (Read-only dashboard charts)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-850">
              <button 
                type="button" 
                onClick={() => setShowInviteModal(false)} 
                className="text-xs font-bold text-slate-505 hover:text-slate-705 px-3 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={!inviteEmail.trim() || !inviteEmail.includes("@")}
                className="text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg"
              >
                Send Invitation
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
