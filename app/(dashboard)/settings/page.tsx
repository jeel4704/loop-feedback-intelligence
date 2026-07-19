"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { 
  AlertTriangle, CheckCircle2, XCircle, Building2, User, Sun, 
  Bell, Lock, Key, CreditCard, Cpu, Database, ClipboardList, 
  AlertOctagon, Plus, Trash2, Check, ExternalLink, ShieldCheck 
} from "lucide-react";
import { FormField } from "@/components/forms";
import { Badge, Button, Card, CardContent, Input, SectionHeader } from "@/components/ui";

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const user = session?.user as any;

  // Active tab state
  const [activeTab, setActiveTab] = useState<"general" | "profile" | "appearance" | "notifications" | "security" | "api_keys" | "billing" | "ai_settings" | "backups" | "audit_logs" | "danger_zone">("general");

  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceSlug, setWorkspaceSlug] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  const [workspaceSuccess, setWorkspaceSuccess] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [error, setError] = useState("");
  
  // Independent loading states
  const [workspaceLoading, setWorkspaceLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  // Duplicate logs state
  const [duplicateLogs, setDuplicateLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // Sync user details once session resolves
  useEffect(() => {
    if (user) {
      setWorkspaceName(user.workspaceName || "");
      setWorkspaceSlug(user.workspaceSlug || "");
      setFullName(user.name || "");
      setEmail(user.email || "");

      // If workspace OWNER or ADMIN, load duplicate logs
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
  }, [session]);

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
          slug: workspaceSlug
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update workspace settings.");
      }

      setWorkspaceSuccess(true);

      // Refresh NextAuth session values in client context
      await updateSession({
        ...session,
        user: {
          ...session?.user,
          workspaceName: workspaceName,
          workspaceSlug: workspaceSlug
        }
      });
    } catch (err: any) {
      setError(err.message || "Failed to update workspace settings.");
    } finally {
      setWorkspaceLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setProfileSuccess(false);
    setProfileLoading(true);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "profile",
          fullName
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile.");
      }

      setProfileSuccess(true);

      // Refresh NextAuth session values in client context
      await updateSession({
        ...session,
        user: {
          ...session?.user,
          name: fullName
        }
      });
    } catch (err: any) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setProfileLoading(false);
    }
  };

  // Mock settings lists
  const [apiKeys, setApiKeys] = useState<{id: string, name: string, token: string, expires: string}[]>([
    { id: "key_1", name: "Production Ingestion Link", token: "sk_live_8a92...bc39", expires: "Never" },
    { id: "key_2", name: "Staging Pipeline", token: "sk_test_41b9...7f1a", expires: "Dec 31, 2026" }
  ]);

  const [invoices] = useState([
    { id: "inv_1", date: "Jul 01, 2026", desc: "Enterprise Tier Monthly Subscription", amount: "$499.00", status: "Paid" },
    { id: "inv_2", date: "Jun 01, 2026", desc: "Enterprise Tier Monthly Subscription", amount: "$499.00", status: "Paid" }
  ]);

  // AI settings state
  const [aiProvider, setAiProvider] = useState("claude");
  const [aiTemperature, setAiTemperature] = useState(0.3);
  const [aiSystemPrompt, setAiSystemPrompt] = useState("You are an expert feedback analyst at LOOP. Extract intents and sentiment accurately.");

  const generateApiKey = () => {
    const newKey = {
      id: `key_${Date.now()}`,
      name: "Dynamic API Key Key",
      token: `sk_live_${Math.random().toString(36).substring(2, 6)}...${Math.random().toString(36).substring(2, 6)}`,
      expires: "Never"
    };
    setApiKeys([...apiKeys, newKey]);
  };

  const revokeApiKey = (id: string) => {
    setApiKeys(apiKeys.filter(k => k.id !== id));
  };

  // Left sidebar tab lists
  const sidebarItems = [
    { value: "general", label: "General", icon: Building2 },
    { value: "profile", label: "Profile", icon: User },
    { value: "appearance", label: "Appearance", icon: Sun },
    { value: "notifications", label: "Notifications", icon: Bell },
    { value: "security", label: "Security", icon: Lock },
    { value: "api_keys", label: "API Keys", icon: Key },
    { value: "billing", label: "Billing & Plans", icon: CreditCard },
    { value: "ai_settings", label: "AI Settings", icon: Cpu },
    { value: "backups", label: "Database Backups", icon: Database },
    { value: "audit_logs", label: "Audit Logs", icon: ClipboardList },
    { value: "danger_zone", label: "Danger Zone", icon: AlertOctagon }
  ];

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight">Settings</h1>
        <p className="text-xs font-bold text-slate-500 dark:text-dark-muted mt-1">
          Configure application variables, profiles, subscriptions, AI engines, and credentials.
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs font-semibold text-rose-700 flex items-center gap-2 max-w-xl">
          <XCircle className="h-4.5 w-4.5 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Settings Split Frame */}
      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        
        {/* Settings Left sub-navigation tab list */}
        <div className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 gap-1 border-b md:border-b-0 md:border-r border-slate-200 dark:border-dark-border pr-0 md:pr-4 h-fit scrollbar-none">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isTabActive = activeTab === item.value;
            return (
              <button
                key={item.value}
                onClick={() => setActiveTab(item.value as any)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-extrabold transition-all whitespace-nowrap ${
                  isTabActive
                    ? "bg-[#efeffe] dark:bg-indigo-950/60 text-[#4f46e5] dark:text-indigo-400 font-black shadow-sm"
                    : "text-slate-500 hover:text-slate-700 dark:text-dark-muted dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-dark-elevated/60"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Settings Right view panels switcher */}
        <div className="space-y-6">

          {/* TAB: GENERAL */}
          {activeTab === "general" && (
            <Card className="bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border rounded-2xl shadow-sm">
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-50">General Workspace settings</h3>
                  <p className="text-[11px] text-slate-450 mt-0.5">Manage the workspace name, slug parameters, and localized formats.</p>
                </div>

                <form onSubmit={handleUpdateWorkspace} className="space-y-4 max-w-xl">
                  {workspaceSuccess && (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-700 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Workspace parameters saved successfully!</span>
                    </div>
                  )}

                  <FormField label="Workspace Name">
                    <Input 
                      value={workspaceName} 
                      onChange={(e) => setWorkspaceName(e.target.value)} 
                    />
                  </FormField>
                  
                  <FormField label="Workspace URL Slug">
                    <div className="flex items-center">
                      <span className="bg-slate-100 dark:bg-dark-bg border border-r-0 border-slate-200 dark:border-dark-border rounded-l-xl px-3 py-2 text-xs font-bold text-slate-400">
                        loopai.dev/
                      </span>
                      <Input 
                        value={workspaceSlug} 
                        onChange={(e) => setWorkspaceSlug(e.target.value)} 
                        className="rounded-l-none"
                      />
                    </div>
                  </FormField>

                  <Button type="submit" disabled={workspaceLoading} className="text-xs font-bold">
                    {workspaceLoading ? "Saving..." : "Save parameters"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* TAB: PROFILE */}
          {activeTab === "profile" && (
            <Card className="bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border rounded-2xl shadow-sm">
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-50">User Profile Settings</h3>
                  <p className="text-[11px] text-slate-450 mt-0.5">Update your display avatar details and username parameters.</p>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-xl">
                  {profileSuccess && (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-700 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Profile updated successfully!</span>
                    </div>
                  )}

                  <FormField label="Full Display Name">
                    <Input 
                      value={fullName} 
                      onChange={(e) => setFullName(e.target.value)} 
                    />
                  </FormField>
                  
                  <FormField label="Registered Email (Read Only)">
                    <Input 
                      disabled 
                      value={email} 
                      className="bg-slate-100 border-slate-250 text-slate-400 font-semibold text-xs dark:bg-dark-bg dark:border-dark-border"
                    />
                  </FormField>

                  <Button type="submit" disabled={profileLoading} className="text-xs font-bold">
                    {profileLoading ? "Updating..." : "Update profile"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* TAB: APPEARANCE */}
          {activeTab === "appearance" && (
            <Card className="bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border rounded-2xl shadow-sm">
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-50">Theme & Appearance</h3>
                  <p className="text-[11px] text-slate-450 mt-0.5">Choose light/dark preferences or adjust visual components layout scale.</p>
                </div>

                <div className="space-y-4 text-xs font-bold text-slate-700 dark:text-slate-350">
                  <div className="space-y-2">
                    <p className="text-[10px] font-extrabold text-slate-450 uppercase">Application Theme</p>
                    <div className="flex gap-3">
                      <button className="flex-1 p-3 rounded-xl border border-slate-200 dark:border-dark-border text-center bg-white dark:bg-dark-card">
                        ☀️ Light Theme
                      </button>
                      <button className="flex-1 p-3 rounded-xl border border-slate-200 dark:border-dark-border text-center bg-white dark:bg-dark-card">
                        🌙 Dark Theme
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-dark-border">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded text-indigo-650 accent-indigo-650" />
                      <span>Compact mode (tight layout sizing)</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded text-indigo-650 accent-indigo-650" />
                      <span>Enable UI Animations and motion transitions</span>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB: NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <Card className="bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border rounded-2xl shadow-sm">
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-50">Notifications Rules</h3>
                  <p className="text-[11px] text-slate-450 mt-0.5">Control where and when you receive weekly insight reports or alert hooks.</p>
                </div>

                <div className="space-y-3.5 text-xs font-bold text-slate-700 dark:text-dark-secondaryText">
                  <label className="flex items-center gap-2.5">
                    <input type="checkbox" defaultChecked className="rounded text-indigo-650 accent-indigo-650" />
                    <span>Email me weekly digest summaries of feedback sentiment</span>
                  </label>
                  <label className="flex items-center gap-2.5">
                    <input type="checkbox" defaultChecked className="rounded text-indigo-650 accent-indigo-650" />
                    <span>Slack notifications alerts for critical negative clusters</span>
                  </label>
                  <label className="flex items-center gap-2.5">
                    <input type="checkbox" className="rounded text-indigo-650 accent-indigo-650" />
                    <span>Browser push popups for simulated ingestion tests</span>
                  </label>
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB: SECURITY */}
          {activeTab === "security" && (
            <Card className="bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border rounded-2xl shadow-sm">
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-50">Security & Sessions</h3>
                  <p className="text-[11px] text-slate-450 mt-0.5">Reset authorization passwords or monitor open browser session tokens.</p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="space-y-2 max-w-sm">
                    <p className="font-extrabold text-[10px] text-slate-450 uppercase">Update Account Password</p>
                    <Input type="password" placeholder="Current password..." />
                    <Input type="password" placeholder="New password..." />
                    <Button className="text-xs font-bold mt-1">Update Password</Button>
                  </div>

                  <div className="border-t border-slate-100 dark:border-dark-border pt-4 space-y-2">
                    <p className="font-extrabold text-[10px] text-slate-450 uppercase">Active Session Browser Devices</p>
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-dark-bg border rounded-xl">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-100">Chrome on Windows (Active Session)</p>
                        <p className="text-[10px] text-slate-400">Hyderabad, India • 192.168.1.1</p>
                      </div>
                      <Badge variant="green" className="text-[8px] font-extrabold uppercase">This Device</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB: API KEYS */}
          {activeTab === "api_keys" && (
            <Card className="bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border rounded-2xl shadow-sm">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-50">API Keys Administration</h3>
                    <p className="text-[11px] text-slate-450 mt-0.5">Use custom API keys to programmatically import customer feedback reviews.</p>
                  </div>
                  <Button onClick={generateApiKey} variant="secondary" className="text-xs font-extrabold gap-1 rounded-xl py-1.5 h-8">
                    <Plus className="h-3.5 w-3.5" />
                    <span>Generate key</span>
                  </Button>
                </div>

                <div className="space-y-3">
                  {apiKeys.map((key) => (
                    <div key={key.id} className="flex items-center justify-between border border-slate-200 dark:border-dark-border bg-slate-50/50 dark:bg-dark-bg/20 p-3.5 rounded-2xl">
                      <div className="space-y-0.5">
                        <p className="font-extrabold text-xs text-slate-800 dark:text-slate-150">{key.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <code className="text-[10.5px] font-bold text-slate-500 font-mono bg-slate-100 dark:bg-dark-bg px-1.5 py-0.5 rounded border">{key.token}</code>
                          <span className="text-[9.5px] font-semibold text-slate-400">Expires: {key.expires}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => revokeApiKey(key.id)}
                        className="text-xs text-rose-500 hover:text-rose-600 font-bold px-3 py-1.5 rounded-lg hover:bg-rose-50/50"
                      >
                        Revoke Key
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB: BILLING */}
          {activeTab === "billing" && (
            <div className="space-y-6">
              <Card className="bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border rounded-2xl shadow-sm">
                <CardContent className="p-6 space-y-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-50">Current Billing Plan</h3>
                    <p className="text-[11px] text-slate-450 mt-0.5">Your organization subscription tier limits and renewal scopes details.</p>
                  </div>

                  <div className="border border-indigo-200 dark:border-indigo-900 bg-indigo-50/30 dark:bg-indigo-950/20 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="indigo" className="text-[9px] font-extrabold uppercase px-2">Enterprise Plan</Badge>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-250">$499.00 / month</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-dark-muted">Provides unlimited team users, custom webhook scopes, and Claude-3 classification.</p>
                    </div>
                    <Button variant="secondary" className="text-xs font-extrabold h-9">Downgrade tier</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Invoices table */}
              <Card className="bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border rounded-2xl shadow-sm">
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-xs font-extrabold text-slate-900 dark:text-slate-50 uppercase tracking-widest">Invoices History</h3>
                  
                  <div className="overflow-x-auto text-xs font-bold">
                    <table className="min-w-full divide-y divide-slate-100">
                      <thead>
                        <tr className="text-slate-400 text-left uppercase text-[9.5px]">
                          <th className="py-2.5">Billing Date</th>
                          <th>Invoice Description</th>
                          <th>Paid Sum</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 dark:text-slate-350">
                        {invoices.map((inv) => (
                          <tr key={inv.id} className="hover:bg-slate-50/30">
                            <td className="py-2.5">{inv.date}</td>
                            <td>{inv.desc}</td>
                            <td>{inv.amount}</td>
                            <td>
                              <Badge variant="green" className="text-[8.5px] px-1.5 py-0 uppercase">Paid</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* TAB: AI SETTINGS */}
          {activeTab === "ai_settings" && (
            <Card className="bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border rounded-2xl shadow-sm">
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-50">AI Configuration</h3>
                  <p className="text-[11px] text-slate-450 mt-0.5">Control the semantic tags auto-categorization models and prompt settings.</p>
                </div>

                <div className="space-y-4 max-w-xl text-xs font-bold">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-450 uppercase">Default AI Ingestion Model</label>
                    <select 
                      value={aiProvider}
                      onChange={(e) => setAiProvider(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border text-slate-700 dark:text-dark-secondaryText rounded-xl px-3.5 py-2 focus:outline-none"
                    >
                      <option value="claude">Claude-3.5 Sonnet (Recommended)</option>
                      <option value="gpt-4o">OpenAI GPT-4o</option>
                      <option value="llama-3.3-70b-versatile">Groq LLaMA-3.3 70B</option>
                      <option value="llama-3.1-8b-instant">Groq LLaMA-3.1 8B</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between">
                      <label className="text-[10px] font-extrabold text-slate-450 uppercase">Temperature: {aiTemperature}</label>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="1.0" 
                      step="0.1"
                      value={aiTemperature}
                      onChange={(e) => setAiTemperature(parseFloat(e.target.value))}
                      className="w-full h-1 bg-slate-200 dark:bg-dark-elevated accent-indigo-650 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <label className="text-[10px] font-extrabold text-slate-450 uppercase">Classifier System Instructions</label>
                    <textarea
                      rows={3}
                      value={aiSystemPrompt}
                      onChange={(e) => setAiSystemPrompt(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border text-slate-700 dark:text-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 font-semibold resize-none"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB: BACKUPS */}
          {activeTab === "backups" && (
            <Card className="bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border rounded-2xl shadow-sm">
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-50">Database Backups</h3>
                  <p className="text-[11px] text-slate-450 mt-0.5">Download full workspace metadata backups or schedule automated retention cycles.</p>
                </div>

                <div className="border border-slate-200 dark:border-dark-border bg-slate-50/50 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="font-extrabold text-xs text-slate-800 dark:text-slate-200">Generate Manual Backup</p>
                    <p className="text-[10.5px] text-slate-450 leading-relaxed font-bold">Creates a zip file containing raw SQL feedback inputs, custom reports, and active themes.</p>
                  </div>
                  <button className="text-xs font-bold gap-1 rounded-xl bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 inline-flex items-center">
                    <Database className="h-3.5 w-3.5" />
                    <span>Run Backup</span>
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB: AUDIT LOGS */}
          {activeTab === "audit_logs" && (
            <Card className="col-span-full bg-white dark:bg-dark-card border border-slate-200/85 dark:border-dark-border rounded-2xl shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-dark-border pb-5">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-50">
                      Duplicate Feedback Audit Log
                    </h3>
                    <p className="mt-1 text-[11px] text-slate-500 font-semibold">
                      Lightweight audit records for automatically skipped & merged duplicate items. Only visible to owners and administrators.
                    </p>
                  </div>

                  {duplicateLogs.length > 0 && (
                    <Button
                      variant="secondary"
                      type="button"
                      onClick={() => {
                        const headers = [
                          "Incoming Feedback",
                          "Matched Feedback ID",
                          "Customer",
                          "Similarity Score",
                          "Source Channel",
                          "Detection Method",
                          "Imported By",
                          "Action Taken",
                          "Timestamp"
                        ];
                        const rows = duplicateLogs.map((log: any) => [
                          `"${log.feedbackContent.replace(/"/g, '""')}"`,
                          `"${log.existingFeedbackId}"`,
                          `"${log.customerName}"`,
                          (log.similarityScore || 0).toFixed(2),
                          `"${log.sourceChannel}"`,
                          `"${log.detectionMethod}"`,
                          `"${log.importedBy}"`,
                          `"${log.actionTaken}"`,
                          `"${new Date(log.createdAt).toISOString()}"`
                        ]);
                        const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
                        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.setAttribute("href", url);
                        link.setAttribute("download", "duplicate_audit_logs.csv");
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 dark:bg-dark-elevated"
                    >
                      Export Audit Log (CSV)
                    </Button>
                  )}
                </div>

                {logsLoading ? (
                  <div className="text-center py-8 text-xs text-slate-400 font-semibold">
                    Loading duplicate audit records...
                  </div>
                ) : duplicateLogs.length === 0 ? (
                  <div className="text-center py-10 text-xs text-slate-405 font-semibold">
                    No duplicate feedbacks have been logged yet.
                  </div>
                ) : (
                  <div className="mt-5 overflow-x-auto custom-scrollbar">
                    <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold">
                      <thead className="bg-slate-50 dark:bg-dark-bg text-slate-505 dark:text-dark-muted uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="px-4 py-3 text-left">Timestamp</th>
                          <th className="px-4 py-3 text-left">Incoming Feedback</th>
                          <th className="px-4 py-3 text-left">Matched ID</th>
                          <th className="px-4 py-3 text-left">Customer</th>
                          <th className="px-4 py-3 text-left">Channel</th>
                          <th className="px-4 py-3 text-left">Score</th>
                          <th className="px-4 py-3 text-left">Method</th>
                          <th className="px-4 py-3 text-left">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-dark-card text-slate-750 dark:text-dark-secondaryText">
                        {duplicateLogs.map((log: any) => (
                          <tr key={log.id} className="align-top hover:bg-slate-50/50 dark:hover:bg-dark-hover/40">
                            <td className="px-4 py-3 whitespace-nowrap text-slate-500 font-normal">
                              {new Date(log.createdAt).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 max-w-xs truncate" title={log.feedbackContent}>
                              {log.feedbackContent}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-indigo-650 font-bold">
                              #{log.existingFeedbackId.substring(0, 8)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {log.customerName}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {log.sourceChannel}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-slate-900 dark:text-slate-100 font-extrabold">
                              {Math.round(log.similarityScore * 100)}%
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap font-normal text-slate-500">
                              {log.detectionMethod}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-450 px-2 py-0.5 rounded-full text-[10px] font-extrabold">
                                {log.actionTaken}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* TAB: DANGER ZONE */}
          {activeTab === "danger_zone" && (
            <Card className="bg-white dark:bg-dark-card border border-rose-200 dark:border-rose-950/40 rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-rose-50/50 dark:bg-rose-950/10 px-6 py-4 border-b border-rose-100 dark:border-rose-950/20">
                <h3 className="text-sm font-extrabold text-rose-700 dark:text-rose-400 flex items-center gap-2">
                  <AlertOctagon className="h-5 w-5" />
                  <span>Workspace Danger Zone</span>
                </h3>
                <p className="text-[11px] text-rose-600/80 dark:text-rose-450 mt-0.5">Destructive workspace actions. These parameters cannot be undone.</p>
              </div>

              <CardContent className="p-6 space-y-6 text-xs font-bold">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <p className="text-slate-800 dark:text-slate-200">Delete all customer feedback data</p>
                    <p className="text-[10.5px] text-slate-450 font-normal">Wipe database feedback rows, vector embeddings, and themes tags.</p>
                  </div>
                  <Button variant="danger" className="text-xs font-extrabold rounded-lg">Wipe Feedback Data</Button>
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-slate-100 dark:border-dark-border pt-4">
                  <div className="space-y-0.5">
                    <p className="text-slate-800 dark:text-slate-200">Archive this workspace</p>
                    <p className="text-[10.5px] text-slate-450 font-normal">Freeze billing, deactivate active integrations, and lock member profiles.</p>
                  </div>
                  <Button variant="secondary" className="text-xs font-bold rounded-lg border border-rose-200 hover:bg-rose-50/20 text-rose-500">Archive Workspace</Button>
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}
