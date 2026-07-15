"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  ArrowLeft, 
  Sparkles, 
  TrendingUp, 
  Inbox, 
  BarChart3, 
  Tag, 
  HelpCircle, 
  FileText, 
  Shield, 
  Play, 
  SlidersHorizontal,
  Search,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui";

// Mock data definitions for isolation
const demoStats = [
  { label: "Total Feedback", value: "2,418", delta: "+12% vs last month", tone: "blue" },
  { label: "Negative Feedback", value: "312", delta: "-8% this week", tone: "rose" },
  { label: "New This Week", value: "184", delta: "41 imported today", tone: "indigo" },
  { label: "Active Themes", value: "26", delta: "5 trending upward", tone: "green" }
];

const demoInbox = [
  {
    id: "fb-1",
    customerName: "Ava Stone",
    customerEmail: "ava@innovatetech.com",
    channel: "Email",
    theme: "Onboarding friction",
    intent: "Bug",
    sentiment: "Negative",
    sentimentScore: -0.75,
    createdAt: "10 mins ago",
    excerpt: "The setup flow asked for too many configuration steps before I could import my customer feedback files.",
    reason: "Complex multi-stage setup forms are stalling customer onboarding."
  },
  {
    id: "fb-2",
    customerName: "Leo Reed",
    customerEmail: "leo@acmecorp.com",
    channel: "Chat",
    theme: "Support speed",
    intent: "Praise",
    sentiment: "Positive",
    sentimentScore: 0.95,
    createdAt: "1 hour ago",
    excerpt: "The technical support team resolved my webhook auth settings issue in under five minutes. Superb help!",
    reason: "Outstanding support response and webhook documentation clarity."
  },
  {
    id: "fb-3",
    customerName: "Mia Patel",
    customerEmail: "mia@devopsflow.net",
    channel: "Survey",
    theme: "Reports & Exports",
    intent: "Feature Request",
    sentiment: "Neutral",
    sentimentScore: 0.1,
    createdAt: "5 hours ago",
    excerpt: "It would be super helpful if monthly VOC summaries could be scheduled to auto-email our PM lists.",
    reason: "Requests for automatic email delivery of monthly trends reports."
  },
  {
    id: "fb-4",
    customerName: "Noah Kim",
    customerEmail: "noah@startuplab.co",
    channel: "API",
    theme: "Billing clarity",
    intent: "Question",
    sentiment: "Negative",
    sentimentScore: -0.4,
    createdAt: "1 day ago",
    excerpt: "We hit our workspace seats threshold. The upgrade options card does not show itemized VAT taxes.",
    reason: "Lack of billing invoice details for VAT items during upgrades."
  },
  {
    id: "fb-5",
    customerName: "Emma Davis",
    customerEmail: "emma@cyberdyne.org",
    channel: "Email",
    theme: "Performance & UI",
    intent: "Bug",
    sentiment: "Negative",
    sentimentScore: -0.8,
    createdAt: "2 days ago",
    excerpt: "The workspace page crashed with a white screen when I selected bulk-update on 100 rows.",
    reason: "Frontend memory crash during bulk row selection update."
  }
];

const presetQuestions = [
  {
    q: "Summarize top complaints about onboarding",
    a: "Based on recent feedback, users (such as Ava Stone) find the initial onboarding flow has too many configuration steps before feedback files can be imported. This creates onboarding friction and stalls initial usage."
  },
  {
    q: "Are there any billing-related inquiries?",
    a: "Yes, Noah Kim (StartupLab) reported confusion regarding pricing options when hitting the workspace seating limits, specifically highlighting that VAT details are not displayed clearly on invoice upgrade screens."
  },
  {
    q: "Show me recent positive feedback",
    a: "The most notable positive sentiment comes from Leo Reed, who praised the speed of the support team in resolving webhook authentication errors in under 5 minutes."
  }
];

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "inbox" | "ask" | "reports">("overview");
  
  // Inbox state
  const [selectedSentiment, setSelectedSentiment] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedFeedback, setSelectedFeedback] = useState<typeof demoInbox[0] | null>(demoInbox[0]);

  // Ask LOOP state
  const [askQuery, setAskQuery] = useState<string>("");
  const [askAnswer, setAskAnswer] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);

  // Filtered feedback computed
  const filteredInbox = demoInbox.filter((item) => {
    const matchesSentiment = selectedSentiment === "All" || item.sentiment === selectedSentiment;
    const matchesSearch = 
      item.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.theme.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSentiment && matchesSearch;
  });

  const triggerAsk = (q: string, a: string) => {
    setAskQuery(q);
    setIsTyping(true);
    setAskAnswer("");
    setTimeout(() => {
      setAskAnswer(a);
      setIsTyping(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Product Tour banner */}
      <div className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between text-xs font-semibold shadow-md z-30">
        <div className="flex items-center gap-2">
          <span className="bg-blue-500 text-white text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold animate-pulse">
            Interactive Demo
          </span>
          <span className="text-slate-300">
            This showcase uses mock client data and operates offline for security.
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/" className="text-slate-300 hover:text-white flex items-center gap-1 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
          </Link>
          <Link href="/signup" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors">
            Get Started
          </Link>
        </div>
      </div>

      {/* Main Dashboard Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-slate-200 bg-white p-4 space-y-6 flex flex-col justify-between hidden md:flex">
          <div className="space-y-6">
            <div className="flex items-center gap-2 px-2 py-1">
              <Image 
                src="/logo.jpg" 
                alt="LOOP Logo" 
                width={36} 
                height={36} 
                className="rounded-lg border border-slate-200" 
              />
              <div>
                <span className="font-extrabold text-sm text-slate-900 block leading-none">Northstar Labs</span>
                <span className="text-[10px] text-slate-400">Demo Workspace</span>
              </div>
            </div>

            <nav className="space-y-1">
              {[
                { id: "overview", label: "Overview", icon: BarChart3 },
                { id: "inbox", label: "Feedback Inbox", icon: Inbox, count: filteredInbox.length },
                { id: "ask", label: "Ask LOOP Assistant", icon: Sparkles },
                { id: "reports", label: "VOC Reports", icon: FileText }
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      active 
                        ? "bg-blue-50 text-blue-600" 
                        : "text-slate-600 hover:bg-slate-100/70"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${active ? "text-blue-600" : "text-slate-400"}`} />
                      <span>{tab.label}</span>
                    </div>
                    {tab.count !== undefined && (
                      <span className={`px-1.5 py-0.2 text-[9px] rounded-full font-bold ${active ? "bg-blue-200 text-blue-800" : "bg-slate-100 text-slate-500"}`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
              <Shield className="h-3 w-3 text-blue-500" /> Security Isolated
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Real analytics require secure tenant authentication. Ready to build?
            </p>
            <Link 
              href="/signup" 
              className="mt-2.5 block text-center w-full bg-blue-600 text-white rounded-lg py-1.5 text-[10px] font-bold hover:bg-blue-700 transition-colors"
            >
              Sign Up For Free
            </Link>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 flex flex-col overflow-y-auto bg-slate-50">
          {/* Dashboard Header */}
          <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-slate-900">
                {activeTab === "overview" && "Analytics Overview"}
                {activeTab === "inbox" && "Feedback Inbox"}
                {activeTab === "ask" && "Ask LOOP Semantic Assistant"}
                {activeTab === "reports" && "Voice of Customer Reports"}
              </h1>
              <p className="text-xs text-slate-500">
                {activeTab === "overview" && "Monitor real-time feedback volume, sentiment distribution, and emerging trends."}
                {activeTab === "inbox" && "Ingest, query, and classify multi-channel feedback records."}
                {activeTab === "ask" && "Ask direct questions to analyze customer intent and get structured answers."}
                {activeTab === "reports" && "Review automatically drafted executive briefs based on customer suggestions."}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-500">Demo Mode</span>
              <div className="h-2 w-2 rounded-full bg-green-500" />
            </div>
          </header>

          <div className="p-6 flex-1">
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Stats grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {demoStats.map((stat) => (
                    <div key={stat.label} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
                      <span className="text-xs font-medium text-slate-400 block mb-1">{stat.label}</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-slate-900 tracking-tight">{stat.value}</span>
                        <span className="text-[10px] font-semibold text-emerald-600">{stat.delta}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Dashboard mock graphs */}
                <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm min-h-[300px] flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Feedback Volume Trend</h3>
                      <span className="text-[10px] text-slate-400 font-semibold">Weekly</span>
                    </div>
                    {/* Simulated Chart Bars */}
                    <div className="flex items-end justify-between gap-2 h-44 mt-4 px-2">
                      {[48, 64, 58, 82, 71, 36, 29].map((val, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                          <div 
                            style={{ height: `${(val / 100) * 160}px` }}
                            className="w-full rounded-t bg-gradient-to-t from-blue-500 to-blue-600 hover:opacity-90 transition-all duration-300 relative group"
                          >
                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                              {val}
                            </span>
                          </div>
                          <span className="text-[10px] font-semibold text-slate-400">
                            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][idx]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Sentiment Distribution</h3>
                      <div className="space-y-4 mt-6">
                        {[
                          { label: "Positive", value: "54%", count: 1305, color: "bg-blue-600" },
                          { label: "Neutral", value: "28%", count: 677, color: "bg-slate-300" },
                          { label: "Negative", value: "18%", count: 436, color: "bg-rose-500" }
                        ].map((s) => (
                          <div key={s.label} className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold text-slate-700">
                              <span>{s.label}</span>
                              <span className="text-slate-400">{s.value} ({s.count})</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div className={`${s.color} h-full`} style={{ width: s.value }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Trending themes cards */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Top Feedback Issues</h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    {[
                      { title: "Support Speed & Latency", trend: "+24% this week", color: "text-rose-500", text: "Users complaining of delay in custom domain configurations." },
                      { title: "Onboarding Complexity", trend: "Stable volume", color: "text-slate-500", text: "First-time setup wizard has excessive data input steps." },
                      { title: "Pricing & Limits transparency", trend: "+11% this week", color: "text-indigo-500", text: "Analyst seats upgrade rules lack clear tax summaries." }
                    ].map((theme, i) => (
                      <div key={i} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-2">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-xs text-slate-800">{theme.title}</h4>
                          <span className={`text-[9px] font-extrabold uppercase ${theme.color}`}>{theme.trend}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">{theme.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* INBOX TAB */}
            {activeTab === "inbox" && (
              <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] h-[540px] items-stretch">
                {/* Left: Table List */}
                <div className="bg-white border border-slate-200/80 rounded-2xl flex flex-col overflow-hidden shadow-sm">
                  {/* Filter tools */}
                  <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search customer feedback..."
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-1.5 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex gap-2">
                      {["All", "Positive", "Neutral", "Negative"].map((sent) => (
                        <button
                          key={sent}
                          onClick={() => setSelectedSentiment(sent)}
                          className={`px-3 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                            selectedSentiment === sent
                              ? "bg-slate-900 border-slate-900 text-white"
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {sent}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* List Body */}
                  <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                    {filteredInbox.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 text-xs">
                        No feedback records matches filters.
                      </div>
                    ) : (
                      filteredInbox.map((item) => (
                        <div 
                          key={item.id}
                          onClick={() => setSelectedFeedback(item)}
                          className={`p-4 text-left cursor-pointer transition-colors ${
                            selectedFeedback?.id === item.id 
                              ? "bg-blue-50/50" 
                              : "hover:bg-slate-50/30"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-bold text-xs text-slate-900">{item.customerName}</span>
                            <span className="text-[9px] text-slate-400">{item.createdAt}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                            {item.excerpt}
                          </p>
                          <div className="mt-2.5 flex flex-wrap gap-1.5">
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[8px] font-bold text-slate-600 uppercase">
                              {item.channel}
                            </span>
                            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[8px] font-bold text-blue-600">
                              {item.theme}
                            </span>
                            <span className={`rounded-full px-2 py-0.5 text-[8px] font-bold uppercase ${
                              item.sentiment === "Positive" 
                                ? "bg-emerald-50 text-emerald-700" 
                                : item.sentiment === "Negative" 
                                ? "bg-rose-50 text-rose-700" 
                                : "bg-amber-50 text-amber-700"
                            }`}>
                              {item.sentiment}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Right: Detailed Card */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm overflow-y-auto flex flex-col justify-between">
                  {selectedFeedback ? (
                    <div className="space-y-6">
                      {/* Customer info */}
                      <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">{selectedFeedback.customerName}</h4>
                          <span className="text-[10px] text-slate-400 block">{selectedFeedback.customerEmail}</span>
                        </div>
                        <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[9px] font-bold text-blue-700 uppercase">
                          {selectedFeedback.intent}
                        </span>
                      </div>

                      {/* Content block */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Original Feedback</span>
                        <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                          {selectedFeedback.excerpt}
                        </p>
                      </div>

                      {/* AI Reason explanation */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1 text-blue-600">
                          <Sparkles className="h-3 w-3" /> Claude AI Root Cause
                        </span>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                          {selectedFeedback.reason}
                        </p>
                      </div>

                      {/* Tags & Metadata metrics */}
                      <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-[11px] font-semibold text-slate-500">
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase block mb-1">Sentiment Rating</span>
                          <span className={selectedFeedback.sentimentScore > 0 ? "text-emerald-600" : "text-rose-600"}>
                            {selectedFeedback.sentimentScore > 0 ? "+" : ""}{selectedFeedback.sentimentScore} ({selectedFeedback.sentiment})
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase block mb-1">Theme Ingestion</span>
                          <span className="text-slate-800">{selectedFeedback.theme}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                      Select a feedback row to view advanced AI extraction.
                    </div>
                  )}

                  <div className="border-t border-slate-100 pt-4 flex gap-2">
                    <Button variant="secondary" className="w-full text-xs py-1.5" onClick={() => alert("Static mock tour - modifications are disabled.")}>
                      Add Tag
                    </Button>
                    <Button variant="secondary" className="w-full text-xs py-1.5" onClick={() => alert("Static mock tour - modifications are disabled.")}>
                      Reclassify Sentiment
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* ASK TAB */}
            {activeTab === "ask" && (
              <div className="max-w-3xl mx-auto bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 space-y-6">
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex gap-3 text-xs text-blue-800 leading-relaxed">
                  <Sparkles className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  <div>
                    <span className="font-bold block mb-0.5">Semantic Semantic Assistant (pgvector RAG)</span>
                    Select a preset query below to test how natural language requests instantly parse the 120-item database mock values to return answer summaries with quote citations.
                  </div>
                </div>

                {/* Preset clickers */}
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Test Queries</span>
                  <div className="flex flex-col gap-2">
                    {presetQuestions.map((pq, idx) => (
                      <button
                        key={idx}
                        onClick={() => triggerAsk(pq.q, pq.a)}
                        className="w-full text-left p-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-between"
                      >
                        <span>{pq.q}</span>
                        <Play className="h-3 w-3 text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chat window */}
                {askQuery && (
                  <div className="border-t border-slate-100 pt-6 space-y-4">
                    <div className="flex justify-end">
                      <div className="bg-slate-100 rounded-2xl px-4 py-2 text-xs font-semibold text-slate-800 max-w-[80%]">
                        {askQuery}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                        <Sparkles className="h-3.5 w-3.5" />
                      </div>
                      <div className="bg-blue-50/50 rounded-2xl border border-blue-50 p-4 text-xs text-slate-700 leading-relaxed max-w-[80%]">
                        {isTyping ? (
                          <div className="flex gap-1.5 items-center py-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                          </div>
                        ) : (
                          <>
                            <p>{askAnswer}</p>
                            <div className="mt-3 pt-3 border-t border-blue-100/50 text-[10px] text-slate-400 font-semibold flex items-center gap-1.5">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Cited 3 feedback source citations
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* REPORTS TAB */}
            {activeTab === "reports" && (
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <span className="bg-emerald-100 text-emerald-800 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase">
                        Ready
                      </span>
                      <h2 className="text-base font-bold text-slate-900 mt-1.5">Q2 Core VOC Priorities Summary</h2>
                      <span className="text-[10px] text-slate-400">Generated on June 29, 2026</span>
                    </div>
                    <Button variant="secondary" className="py-1.5 text-xs" onClick={() => alert("Static mock tour - PDF exporting is disabled.")}>
                      Download Brief
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Executive Summary</span>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        High user feedback volume was detected around UI complexity and customer support responsiveness. Support remains our top positive praise category, while onboarding workflow steps are generating the highest volume of friction reports.
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 pt-2">
                      <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl space-y-2">
                        <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block">Positive Highlights</span>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          Technical help responsiveness scored outstanding satisfaction levels, specifically around quick resolution speeds.
                        </p>
                      </div>
                      <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-2xl space-y-2">
                        <span className="text-[10px] font-extrabold text-rose-800 uppercase tracking-wider block">Identified Complaints</span>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          Friction points on multi-stage wizard setups during customer configuration files imports.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 pt-4">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Recommended Actions</span>
                      <ul className="space-y-2">
                        {[
                          "Simplify the onboarding import config fields into a drag-and-drop CSV template.",
                          "Ensure tax specifications are detailed transparently on subscription seats upgrade checkout options.",
                          "Fix memory leaks on the bulk row tag updater endpoints to stop browser rendering crash exceptions."
                        ].map((action, i) => (
                          <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                            <span className="h-5 w-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <span className="mt-0.5">{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
