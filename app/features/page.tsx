"use client";

import NextLink from "next/link";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { Badge, Card, CardContent } from "@/components/ui";
import { 
  Shield, Sparkles, Activity, Layers, FileSpreadsheet, 
  Search, BrainCircuit, BarChart3, Inbox, Lock, ArrowRight 
} from "lucide-react";

export default function FeaturesPage() {
  const featureList = [
    {
      title: "AI Semantic Search",
      desc: "Find feedback using meaning and context, not just rigid keyword matches. Type questions naturally and locate direct source issues.",
      icon: Search,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "Real-time Classification",
      desc: "Instantly tag issues by primary domain (Pricing, UI, Performance, Security) the millisecond they land on the server.",
      icon: BrainCircuit,
      color: "text-indigo-600",
      bg: "bg-indigo-50"
    },
    {
      title: "Multi-tenant Isolation",
      desc: "Separate workspace tokens, users, metadata configurations, and settings safely. Perfect for enterprise SaaS infrastructures.",
      icon: Lock,
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    },
    {
      title: "Intelligent Sentiment Analytics",
      desc: "Map sentiment percentages (Positive, Neutral, Negative) dynamically across weeks to spot release regression bugs immediately.",
      icon: Activity,
      color: "text-rose-600",
      bg: "bg-rose-50"
    },
    {
      title: "Thematic Clustering",
      desc: "Group related complaints automatically into core themes. Uncover product bugs or request items you never cataloged.",
      icon: Layers,
      color: "text-amber-600",
      bg: "bg-amber-50"
    },
    {
      title: "Robust CSV Import Parser",
      desc: "Import backup databases, spreadsheets, or Intercom data files. Map headers automatically and start analysis in seconds.",
      icon: FileSpreadsheet,
      color: "text-teal-600",
      bg: "bg-teal-50"
    },
    {
      title: "Role-Based Access (RBAC)",
      desc: "Configure users with Viewer, Analyst, or Admin permissions. Safeguard critical settings while maintaining open analytics sharing.",
      icon: Shield,
      color: "text-purple-600",
      bg: "bg-purple-50"
    },
    {
      title: "Voice-of-Customer Reports",
      desc: "Compile detailed reports of primary user issues. Export results as high-fidelity charts or PDF presentations.",
      icon: BarChart3,
      color: "text-cyan-600",
      bg: "bg-cyan-50"
    }
  ];

  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-6 pt-20 pb-16 text-center">
        <Badge variant="blue" className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full font-bold text-xs uppercase tracking-wider">
          Capabilities
        </Badge>
        <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
          A complete suite of <span className="text-blue-600">AI capabilities</span>
        </h1>
        <p className="mt-6 text-slate-600 text-lg sm:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
          Engineered for scaling research speed, keeping data locked behind enterprise safeguards, and generating automated insights.
        </p>
      </section>

      {/* Feature Grid */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featureList.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <Card key={idx} className="rounded-[20px] border border-slate-200/60 bg-white p-6 shadow-sm hover:shadow-md hover:translate-y-[-2px] transition-all duration-300 flex flex-col justify-between text-left">
                <div>
                  <div className={`h-11 w-11 rounded-[14px] ${feat.bg} ${feat.color} flex items-center justify-center shadow-inner`}>
                    <Icon className="h-5.5 w-5.5" />
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-900 mt-5">{feat.title}</h3>
                  <p className="mt-2.5 text-slate-500 font-semibold text-xs leading-relaxed">{feat.desc}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Security Callout */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="rounded-[32px] border border-slate-200/80 bg-white p-8 sm:p-12 shadow-sm grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6 text-left">
            <Badge variant="blue" className="bg-emerald-50 text-emerald-600 rounded-full font-bold">Enterprise Guarded</Badge>
            <h2 className="text-3xl font-extrabold text-slate-900">Workspace data security is built-in</h2>
            <p className="text-slate-600 font-medium leading-relaxed">
              We encrypt your data both in transit and at rest. Every single workspace database partition operates behind secure tenant barriers, ensuring zero cross-tenant metadata leakage or search overlap.
            </p>
          </div>
          <div className="bg-slate-50 rounded-[24px] p-6 border border-slate-100 flex flex-col justify-center space-y-4">
            <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200/60 shadow-sm text-left">
              <Lock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-bold text-xs text-slate-900">AES-256 Data Encryption</p>
                <p className="text-[10px] text-slate-400 font-semibold">Active for all database records</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200/60 shadow-sm text-left">
              <Shield className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="font-bold text-xs text-slate-900">Tenant Workspace Isolation</p>
                <p className="text-[10px] text-slate-400 font-semibold">Separate schema pools</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="rounded-[32px] bg-gradient-to-tr from-slate-950 to-slate-900 border border-slate-800 p-8 sm:p-12 text-center text-white shadow-xl">
          <h2 className="text-3xl font-extrabold tracking-tight">Experience automated classification</h2>
          <p className="mt-4 text-slate-400 max-w-xl mx-auto font-semibold">
            Deploy your secure workspace in 2 minutes. Start mapping user feedback.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <NextLink
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-[14px] bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-blue-500/25 hover:bg-blue-700 hover:shadow-blue-600/30 transition-all duration-300 hover:translate-y-[-1px]"
            >
              Sign up now
              <ArrowRight className="h-4 w-4" />
            </NextLink>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
