"use client";

import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { Badge } from "@/components/ui";

export default function AskLoopAIGuidePage() {
  return (
    <MarketingLayout>
      <section className="relative mx-auto max-w-4xl px-6 pt-20 pb-32 text-left">
        <Badge variant="blue" className="px-3 py-1 bg-indigo-500/10 text-indigo-500 rounded-full font-bold text-xs uppercase tracking-wider border border-indigo-500/20">
          Guide
        </Badge>
        <h1 className="mt-6 text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
          Ask LOOP AI Guide
        </h1>
        <p className="mt-6 text-slate-400 text-lg font-medium leading-relaxed">
          Master the semantic search capabilities of Ask LOOP AI. Learn how to query your feedback data for instant, accurate insights.
        </p>
        
        <div className="mt-12 space-y-8 text-slate-300 leading-relaxed">
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">1. Semantic Searching</h2>
            <p className="text-slate-400">
              Unlike traditional keyword search, Ask LOOP AI uses semantic embeddings to understand the context of your questions. You can ask natural questions like <em>"Why are users churning on the pro plan?"</em>
            </p>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">2. Using Filters</h2>
            <p className="text-slate-400">
              You can combine natural language queries with hard filters. For example, search for "payment bugs" and apply a filter to only include feedback from the past 30 days or specifically from "Enterprise" users.
            </p>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">3. Generating Reports</h2>
            <p className="text-slate-400">
              Once you find the insights you need, use the <strong>Save to Report</strong> button to compile the quotes and AI-generated summaries into a shareable Voice of Customer document.
            </p>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
