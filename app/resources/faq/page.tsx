"use client";

import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { Badge } from "@/components/ui";

export default function FAQPage() {
  return (
    <MarketingLayout>
      <section className="relative mx-auto max-w-4xl px-6 pt-20 pb-32 text-left">
        <Badge variant="blue" className="px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full font-bold text-xs uppercase tracking-wider border border-amber-500/20">
          Guide
        </Badge>
        <h1 className="mt-6 text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
          Frequently Asked Questions
        </h1>
        <p className="mt-6 text-slate-400 text-lg font-medium leading-relaxed">
          Find quick answers to common questions about workspace limits, sentiment algorithms, data retention, and account management.
        </p>
        
        <div className="mt-12 space-y-8 text-slate-300 leading-relaxed">
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">What AI model does LOOP use?</h2>
            <p className="text-slate-400">
              LOOP is designed to be model-agnostic but defaults to utilizing highly capable LLMs (like Claude 3.5 Sonnet, GPT-4o, or Llama 3) for the core sentiment analysis and theme clustering pipelines.
            </p>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">How much data can I import at once?</h2>
            <p className="text-slate-400">
              You can import CSV files containing up to 100,000 rows in a single batch. If you need to import larger datasets, we recommend breaking them up or using our upcoming native integrations.
            </p>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">How does the billing work?</h2>
            <p className="text-slate-400">
              Billing is currently handled at the workspace level and depends on the number of analyzed feedback rows per month. Check the settings panel in your workspace for specific tier limits.
            </p>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
