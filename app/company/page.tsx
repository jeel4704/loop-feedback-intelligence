"use client";

import NextLink from "next/link";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { Badge, Card } from "@/components/ui";
import { Sparkle, ShieldCheck, UserCheck, ArrowRight } from "lucide-react";

export default function CompanyPage() {
  const values = [
    {
      title: "Absolute Integrity",
      desc: "Customer feedback represents trust. We partition and encrypt all workspace intelligence data with zero cross-tenant leakage rules.",
      icon: ShieldCheck,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "Customer Alignment",
      desc: "We exist to remove customer friction. We design tools to make customer pain points clear, actionable, and impossible to ignore.",
      icon: UserCheck,
      color: "text-indigo-600",
      bg: "bg-indigo-50"
    },
    {
      title: "Precision Velocity",
      desc: "Stop doing slow manuals. We build clean pipelines to automate feedback cataloging, grouping, and retrieval instantly.",
      icon: Sparkle,
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    }
  ];

  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-6 pt-20 pb-16 text-center">
        <Badge variant="blue" className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full font-bold text-xs uppercase tracking-wider">
          Our Mission
        </Badge>
        <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
          Voice in. <span className="text-blue-600">Insight out.</span>
        </h1>
        <p className="mt-6 text-slate-600 text-lg sm:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
          At LOOP, we believe that understanding your customers is the only way to build a great product. Our goal is to consolidate scattered feedback into immediate product clarity.
        </p>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <h2 className="text-3xl font-extrabold text-slate-900 text-center mb-12">Core Operating Principles</h2>
        <div className="grid gap-8 lg:grid-cols-3">
          {values.map((val, idx) => {
            const Icon = val.icon;
            return (
              <Card key={idx} className="rounded-[24px] border border-slate-200/60 bg-white p-8 shadow-sm hover:shadow-md hover:translate-y-[-2px] transition-all duration-300 flex flex-col justify-between text-left">
                <div className="space-y-5">
                  <div className={`h-11 w-11 rounded-[14px] ${val.bg} ${val.color} flex items-center justify-center shadow-inner`}>
                    <Icon className="h-5.5 w-5.5" />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900">{val.title}</h3>
                  <p className="text-slate-500 font-semibold text-xs leading-relaxed">{val.desc}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Careers Section */}
      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <div className="rounded-[32px] border border-slate-200/80 bg-white p-8 sm:p-12 shadow-sm text-left space-y-6">
          <Badge variant="blue" className="bg-indigo-50 text-indigo-600 font-bold rounded-full">Careers</Badge>
          <h2 className="text-3xl font-extrabold text-slate-900">Shape the future of NLP analytics</h2>
          <p className="text-slate-600 font-medium leading-relaxed">
            We are looking for builders, designers, and engineers excited about building security-first, multi-tenant AI systems. Explore our active roles and join Northstar Labs.
          </p>
          
          <div className="mt-8 border-t border-slate-100 pt-6 space-y-4">
            {[
              { role: "Senior Fullstack Engineer (Next.js & Postgres)", loc: "San Francisco / Remote" },
              { role: "NLP Machine Learning Researcher (Embeddings & RAG)", loc: "San Francisco / Remote" },
              { role: "Senior Product Designer (Aesthetics & UX)", loc: "SF Office" }
            ].map((job, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group">
                <div>
                  <p className="font-extrabold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">{job.role}</p>
                  <p className="text-[10px] text-slate-400 font-bold mt-1">{job.loc}</p>
                </div>
                <div className="mt-2 sm:mt-0 flex items-center gap-1.5 text-xs text-blue-600 font-bold">
                  <span>Apply Now</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="rounded-[32px] bg-gradient-to-tr from-slate-950 to-slate-900 border border-slate-800 p-8 sm:p-12 text-center text-white shadow-xl">
          <h2 className="text-3xl font-extrabold tracking-tight">Ready to build what matters?</h2>
          <p className="mt-4 text-slate-400 max-w-xl mx-auto font-semibold">
            Consolidate your customer channels today with LOOP AI.
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
