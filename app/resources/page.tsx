"use client";

import NextLink from "next/link";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { Badge, Card } from "@/components/ui";
import { BookOpen, FileSpreadsheet, MessageSquarePlus, LifeBuoy, ArrowRight, ShieldCheck, FileText } from "lucide-react";

export default function ResourcesPage() {
  const resourceCards = [
    {
      title: "Getting Started Guide",
      desc: "Learn how to set up your workspace, configure your initial project settings, and invite your team members to collaborate.",
      icon: BookOpen,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      link: "/resources/getting-started"
    },
    {
      title: "CSV Import Guide",
      desc: "Step-by-step instructions on formatting your feedback data, mapping headers correctly, and importing thousands of rows into LOOP.",
      icon: FileSpreadsheet,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      link: "/resources/csv-import"
    },
    {
      title: "Ask LOOP AI Guide",
      desc: "Master the semantic search capabilities of Ask LOOP AI. Learn how to query your feedback data for instant, accurate insights.",
      icon: MessageSquarePlus,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
      link: "/resources/ask-loop-ai"
    },
    {
      title: "Security & Privacy",
      desc: "Detailed documentation on our AES-256 encryption, multi-tenant database isolation, and Role-Based Access Control (RBAC).",
      icon: ShieldCheck,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      link: "/resources/security-privacy"
    },
    {
      title: "Frequently Asked Questions",
      desc: "Find quick answers to common questions about workspace limits, sentiment algorithms, data retention, and account management.",
      icon: LifeBuoy,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      link: "/resources/faq"
    },
    {
      title: "Release Notes",
      desc: "Stay up to date with the latest features, improvements, and AI model upgrades added to the LOOP platform.",
      icon: FileText,
      color: "text-teal-500",
      bg: "bg-teal-500/10",
      link: "/resources/release-notes"
    }
  ];

  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-6 pt-20 pb-16 text-center">
        <Badge variant="blue" className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full font-bold text-xs uppercase tracking-wider border border-blue-500/20">
          Resources Hub
        </Badge>
        <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
          Build smarter with <span className="text-blue-500">LOOP</span>
        </h1>
        <p className="mt-6 text-slate-400 text-lg sm:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
          Everything you need to set up your workspace, import your data, and start generating actionable intelligence.
        </p>
      </section>

      {/* Grid */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {resourceCards.map((res, idx) => {
            const Icon = res.icon;
            return (
              <Card key={idx} className="rounded-[24px] border border-slate-800 bg-slate-900/50 p-8 shadow-sm hover:shadow-md hover:translate-y-[-2px] transition-all duration-300 flex flex-col justify-between text-left">
                <div className="space-y-5">
                  <div className={`h-11 w-11 rounded-[14px] ${res.bg} ${res.color} flex items-center justify-center border border-slate-700/50`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-extrabold text-white">{res.title}</h3>
                  <p className="text-slate-400 font-medium text-sm leading-relaxed">{res.desc}</p>
                </div>
                <NextLink href={res.link as any} className="mt-8 border-t border-slate-800/60 pt-5 flex items-center justify-between text-blue-500 font-bold text-sm cursor-pointer group">
                  <span>Read Guide</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </NextLink>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Support CTA */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="rounded-[32px] bg-gradient-to-tr from-slate-950 to-slate-900 border border-slate-800 p-8 sm:p-12 text-center text-white shadow-xl">
          <h2 className="text-3xl font-extrabold tracking-tight">Need further assistance?</h2>
          <p className="mt-4 text-slate-400 max-w-xl mx-auto font-semibold">
            Our support team is ready to help you configure your data imports and optimize your AI feedback pipelines.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <NextLink
              href="/company"
              className="inline-flex items-center justify-center gap-2 rounded-[14px] bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-blue-500/25 hover:bg-blue-700 hover:shadow-blue-600/30 transition-all duration-300 hover:translate-y-[-1px]"
            >
              Contact Support
              <ArrowRight className="h-4 w-4" />
            </NextLink>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
