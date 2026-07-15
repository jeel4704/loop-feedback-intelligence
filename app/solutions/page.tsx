"use client";

import NextLink from "next/link";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { Badge, Card, CardContent } from "@/components/ui";
import { BrainCircuit, Laptop, Users, Shield, ArrowRight, Check } from "lucide-react";

export default function SolutionsPage() {
  const solutions = [
    {
      role: "Product Managers",
      desc: "Stop guessing feature priorities. Cluster support complaints automatically, search customer quotes semantically, and build evidence-backed product roadmaps.",
      icon: Laptop,
      color: "text-blue-600",
      bg: "bg-blue-50",
      points: [
        "Semantic thematic clustering",
        "Release regression bug alerts",
        "Evidence-backed feature prioritization lists"
      ]
    },
    {
      role: "Customer Success",
      desc: "Detect account churning indicators early. Loop aggregates user feedback from multiple channels, analyzing shifts in sentiment scores to flag VIP issues.",
      icon: Users,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      points: [
        "NPS comment classification pipelines",
        "VIP account sentiment regression alert logs",
        "Automated customer feedback briefs"
      ]
    },
    {
      role: "Customer Support Ops",
      desc: "Slash ticket queue times and reduce agent burnout. Automatically tag and route ticket intent categories to the right dev team in real-time.",
      icon: BrainCircuit,
      color: "text-rose-600",
      bg: "bg-rose-50",
      points: [
        "Instant NLP category routing",
        "Automatic support ticket summaries",
        "CSV logs auto parser ingestion"
      ]
    },
    {
      role: "Enterprise Security Leaders",
      desc: "Consolidate customer insights safely. Clean data partitions, AES-256 vault configurations, and RBAC policies guarantee full regulatory compliance.",
      icon: Shield,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      points: [
        "Isolated multi-tenant database partitions",
        "Admin, Analyst, and Viewer role restrictions",
        "Comprehensive API token vault management"
      ]
    }
  ];

  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-6 pt-20 pb-16 text-center">
        <Badge variant="blue" className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full font-bold text-xs uppercase tracking-wider">
          Industries & Teams
        </Badge>
        <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
          Built for teams who <span className="text-blue-600">value clarity</span>
        </h1>
        <p className="mt-6 text-slate-600 text-lg sm:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
          Whether you are building the core product, managing support workflows, or securing customer records, LOOP aligns your team.
        </p>
      </section>

      {/* Solutions blocks */}
      <section className="mx-auto max-w-7xl px-6 py-10 space-y-10">
        <div className="grid gap-8 lg:grid-cols-2">
          {solutions.map((sol, idx) => {
            const Icon = sol.icon;
            return (
              <Card key={idx} className="rounded-[24px] border border-slate-200/60 bg-white p-8 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-300 text-left">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className={`h-11 w-11 rounded-[14px] ${sol.bg} ${sol.color} flex items-center justify-center shadow-inner`}>
                      <Icon className="h-5.5 w-5.5" />
                    </div>
                    <h3 className="text-xl font-extrabold text-slate-900">{sol.role}</h3>
                  </div>
                  <p className="text-slate-500 font-semibold text-xs leading-relaxed">{sol.desc}</p>
                  
                  <ul className="space-y-2.5 pt-2">
                    {sol.points.map((p, pIdx) => (
                      <li key={pIdx} className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
                        <Check className="h-4.5 w-4.5 text-emerald-500 flex-shrink-0" />
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
          <h2 className="text-3xl font-extrabold tracking-tight">Ready to align your organization?</h2>
          <p className="mt-4 text-slate-400 max-w-xl mx-auto font-semibold">
            Choose a solution that fits your workspace size. Start making databased decisions.
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
