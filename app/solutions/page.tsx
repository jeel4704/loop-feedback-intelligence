"use client";

import NextLink from "next/link";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { Badge, Card } from "@/components/ui";
import { BrainCircuit, LineChart, FileSpreadsheet, Lock, ArrowRight, Check, Activity, Search } from "lucide-react";

export default function SolutionsPage() {
  const loopFeatures = [
    {
      title: "AI-Powered Sentiment & Theme Analysis",
      desc: "Stop manually reading through thousands of complaints. LOOP aggregates user feedback and uses advanced AI to automatically assign sentiment scores and group related issues into actionable themes.",
      icon: BrainCircuit,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      points: [
        "Real-time semantic thematic clustering",
        "Automated sentiment scoring (Positive, Neutral, Negative)",
        "Semantic search to find exact contexts instantly"
      ]
    },
    {
      title: "Data Import & CSV Processing",
      desc: "Easily ingest feedback from any source. Import your existing CSV backup databases, spreadsheets, or Intercom data files, map the headers, and begin your analysis in seconds.",
      icon: FileSpreadsheet,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
      points: [
        "Robust CSV auto-parser ingestion",
        "Map custom data fields to LOOP standard metadata",
        "Handle thousands of rows rapidly without timeouts"
      ]
    },
    {
      title: "Dashboard Analytics & Reports",
      desc: "Visualize the voice of the customer. Generate comprehensive reports and monitor trends over time to identify whether recent releases have caused sentiment regressions or improvements.",
      icon: LineChart,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      points: [
        "Live sentiment trend monitoring",
        "Automated VOC (Voice of Customer) reporting",
        "Track volume and issue spikes instantly"
      ]
    },
    {
      title: "Workspace Collaboration & Security",
      desc: "Built for enterprise scale. Isolate your data in secure tenant boundaries with AES-256 encryption. Manage team access securely using precise role-based access control (RBAC).",
      icon: Lock,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      points: [
        "Strict multi-tenant database partitions",
        "AES-256 data encryption at rest and in transit",
        "Admin, Analyst, and Viewer RBAC assignments"
      ]
    }
  ];

  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-6 pt-20 pb-16 text-center">
        <Badge variant="blue" className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full font-bold text-xs uppercase tracking-wider border border-blue-500/20">
          Why LOOP
        </Badge>
        <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
          Customer Feedback <span className="text-blue-500">Intelligence</span>
        </h1>
        <p className="mt-6 text-slate-400 text-lg sm:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
          From AI-driven categorization to enterprise-grade workspace security, LOOP gives you the tools to understand your users perfectly.
        </p>
      </section>

      {/* Solutions blocks */}
      <section className="mx-auto max-w-7xl px-6 py-10 space-y-10">
        <div className="grid gap-8 lg:grid-cols-2">
          {loopFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <Card key={idx} className="rounded-[24px] border border-slate-800 bg-slate-900/50 p-8 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-300 text-left">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className={`h-11 w-11 rounded-[14px] ${feat.bg} ${feat.color} flex items-center justify-center border border-slate-700/50`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-extrabold text-white">{feat.title}</h3>
                  </div>
                  <p className="text-slate-400 font-medium text-sm leading-relaxed">{feat.desc}</p>
                  
                  <ul className="space-y-2.5 pt-2">
                    {feat.points.map((p, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-2.5 text-sm text-slate-300 font-medium">
                        <Check className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="rounded-[32px] bg-gradient-to-tr from-slate-950 to-slate-900 border border-slate-800 p-8 sm:p-12 text-center text-white shadow-xl">
          <h2 className="text-3xl font-extrabold tracking-tight">Ready to understand your customers?</h2>
          <p className="mt-4 text-slate-400 max-w-xl mx-auto font-semibold">
            Deploy your secure workspace in 2 minutes. Start uncovering actionable insights today.
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
