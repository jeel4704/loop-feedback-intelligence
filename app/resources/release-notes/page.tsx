"use client";

import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { Badge } from "@/components/ui";

export default function ReleaseNotesPage() {
  return (
    <MarketingLayout>
      <section className="relative mx-auto max-w-4xl px-6 pt-20 pb-32 text-left">
        <Badge variant="blue" className="px-3 py-1 bg-teal-500/10 text-teal-500 rounded-full font-bold text-xs uppercase tracking-wider border border-teal-500/20">
          Guide
        </Badge>
        <h1 className="mt-6 text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
          Release Notes
        </h1>
        <p className="mt-6 text-slate-400 text-lg font-medium leading-relaxed">
          Stay up to date with the latest features, improvements, and AI model upgrades added to the LOOP platform.
        </p>
        
        <div className="mt-12 space-y-8 text-slate-300 leading-relaxed">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">v1.2.0 - Advanced Semantic Search</h2>
            <p className="text-xs text-teal-500 font-bold mb-4">Released: October 2026</p>
            <p className="text-slate-400">
              Introduced "Ask LOOP AI", a fully RAG-based search engine for your workspace. You can now use natural language queries to instantly pinpoint feedback issues without relying on rigid keyword filters.
            </p>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">v1.1.0 - Thematic Clustering Upgrades</h2>
            <p className="text-xs text-teal-500 font-bold mb-4">Released: September 2026</p>
            <p className="text-slate-400">
              Upgraded our underlying LLM processing pipelines to significantly improve the accuracy of automatic theme clustering, reducing false positives by 40%.
            </p>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">v1.0.0 - General Availability</h2>
            <p className="text-xs text-teal-500 font-bold mb-4">Released: August 2026</p>
            <p className="text-slate-400">
              LOOP is officially out of beta. Complete with CSV imports, real-time sentiment analysis, multi-tenant RBAC workspaces, and live dashboard analytics.
            </p>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
