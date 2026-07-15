"use client";

import NextLink from "next/link";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { Badge, Card } from "@/components/ui";
import { BookOpen, Code, ShieldCheck, HeartHandshake, ArrowRight } from "lucide-react";

export default function ResourcesPage() {
  const resourceCards = [
    {
      title: "Documentation Hub",
      desc: "Learn how to setup connectors, configure semantic rules, auto-generate sentiment scores, and prioritize your dashboard feed.",
      icon: BookOpen,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "Developer API Reference",
      desc: "Explore our REST endpoints, webhook delivery logs, native javascript and python SDK models, and code implementation snippets.",
      icon: Code,
      color: "text-indigo-600",
      bg: "bg-indigo-50"
    },
    {
      title: "Security & Privacy Vault",
      desc: "Download our SOC 2 Type II audit report briefs, read workspace isolation safeguarding protocols, and review GDPR compliance standards.",
      icon: ShieldCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    },
    {
      title: "Customer Support Case Studies",
      desc: "Read how product managers and support engineers slash ticket queues, align roadmaps, and save 15+ engineering hours weekly.",
      icon: HeartHandshake,
      color: "text-rose-600",
      bg: "bg-rose-50"
    }
  ];

  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-6 pt-20 pb-16 text-center">
        <Badge variant="blue" className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full font-bold text-xs uppercase tracking-wider">
          Resources Hub
        </Badge>
        <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
          Build smarter with <span className="text-blue-600">LOOP resources</span>
        </h1>
        <p className="mt-6 text-slate-600 text-lg sm:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
          Unlock API libraries, detailed implementation blueprints, case study briefs, and platform setup user guides.
        </p>
      </section>

      {/* Grid */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-8 sm:grid-cols-2">
          {resourceCards.map((res, idx) => {
            const Icon = res.icon;
            return (
              <Card key={idx} className="rounded-[24px] border border-slate-200/60 bg-white p-8 shadow-sm hover:shadow-md hover:translate-y-[-2px] transition-all duration-300 flex flex-col justify-between text-left">
                <div className="space-y-5">
                  <div className={`h-11 w-11 rounded-[14px] ${res.bg} ${res.color} flex items-center justify-center shadow-inner`}>
                    <Icon className="h-5.5 w-5.5" />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900">{res.title}</h3>
                  <p className="text-slate-500 font-semibold text-xs leading-relaxed">{res.desc}</p>
                </div>
                <div className="mt-8 border-t border-slate-100 pt-5 flex items-center justify-between text-blue-600 font-bold text-xs cursor-pointer group">
                  <span>Explore Repository</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="rounded-[32px] bg-slate-950 border border-slate-800 p-8 sm:p-12 text-center text-white shadow-xl">
          <h2 className="text-3xl font-extrabold tracking-tight">Stay updated with AI Customer Intelligence</h2>
          <p className="mt-4 text-slate-400 max-w-xl mx-auto font-semibold">
            Get our monthly brief of NLP advances, feedback prioritization practices, and case study updates.
          </p>
          <div className="mt-8 max-w-md mx-auto flex gap-3">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="flex-1 rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <button className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
