"use client";

import NextLink from "next/link";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { Badge, Button, Card, CardContent } from "@/components/ui";
import { ArrowRight, Sparkles, BrainCircuit, Globe, ArrowDownRight, Check } from "lucide-react";

export default function ProductPage() {
  return (
    <MarketingLayout>
      {/* Hero Header */}
      <section className="relative mx-auto max-w-7xl px-6 pt-20 pb-16 text-center">
        <Badge variant="blue" className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full font-bold text-xs uppercase tracking-wider">
          The Platform
        </Badge>
        <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
          The complete feedback <span className="text-blue-600">intelligence engine</span>
        </h1>
        <p className="mt-6 text-slate-600 text-lg sm:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
          From unstructured chat scripts and review emails to centralized, actionable product decisions. LOOP automates classification, clustering, and root-cause mapping in real-time.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <NextLink
            href="/signup"
            className="inline-flex items-center justify-center gap-2 rounded-[14px] bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-blue-500/25 hover:bg-blue-700 hover:shadow-blue-600/30 transition-all duration-300 hover:translate-y-[-1px]"
          >
            Start Free Trial
            <ArrowRight className="h-4 w-4" />
          </NextLink>
        </div>
      </section>

      {/* Feature Blocks */}
      <section className="mx-auto max-w-7xl px-6 py-16 space-y-24">
        {/* Section 1 */}
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6 text-left">
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
              <Globe className="h-5 w-5" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Omnichannel Feedback Ingestion
            </h2>
            <p className="text-slate-600 font-medium leading-relaxed">
              Consolidate support tickets, Slack feedback threads, app store reviews, and NPS survey data in one single repository. Connect your existing apps with our easy webhook listeners and native APIs.
            </p>
            <ul className="space-y-3 font-semibold text-slate-700">
              <li className="flex items-center gap-2">
                <Check className="h-4.5 w-4.5 text-emerald-500" />
                <span>Automatic CSV & Spreadsheet importer parser</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4.5 w-4.5 text-emerald-500" />
                <span>Native SDK integrations for Javascript and Python</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4.5 w-4.5 text-emerald-500" />
                <span>Slack & Microsoft Teams sync listeners</span>
              </li>
            </ul>
          </div>
          <div className="bg-slate-100 rounded-[24px] p-6 border border-slate-200/60 shadow-inner">
            <Card className="rounded-[16px] border-none shadow-md overflow-hidden bg-white p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="font-bold text-xs text-slate-900">Active Connectors</span>
                <span className="px-2 py-0.5 rounded-full text-[8.5px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">System Healthy</span>
              </div>
              <div className="space-y-2.5">
                {[
                  { name: "Zendesk Connector", status: "Connected", desc: "Syncing tickets every 5m" },
                  { name: "App Store API", status: "Connected", desc: "Syncing weekly reviews" },
                  { name: "Custom API Endpoint", status: "Idle", desc: "Listening for webhook calls" }
                ].map((conn, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                    <div className="text-left">
                      <p className="font-bold text-xs text-slate-900">{conn.name}</p>
                      <p className="text-[10px] text-slate-400 font-semibold">{conn.desc}</p>
                    </div>
                    <span className="text-[9px] font-bold text-emerald-600">{conn.status}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Section 2 */}
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="lg:order-2 space-y-6 text-left">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Autonomous NLP Classification
            </h2>
            <p className="text-slate-600 font-medium leading-relaxed">
              Every single ticket or chat thread goes through our custom AI model which instantly runs semantic categorization, sentiment score mapping, and primary intent identification.
            </p>
            <ul className="space-y-3 font-semibold text-slate-700">
              <li className="flex items-center gap-2">
                <Check className="h-4.5 w-4.5 text-emerald-500" />
                <span>99.2% Accuracy on customer sentiment classification</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4.5 w-4.5 text-emerald-500" />
                <span>Custom tag rules to configure custom enterprise tags</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4.5 w-4.5 text-emerald-500" />
                <span>Dynamic confidence score threshold adjustments</span>
              </li>
            </ul>
          </div>
          <div className="bg-slate-100 rounded-[24px] p-6 border border-slate-200/60 shadow-inner">
            <Card className="rounded-[16px] border-none shadow-md overflow-hidden bg-white p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="font-bold text-xs text-slate-900">Classification Model</span>
                <Badge variant="blue">Claude 3.5 Sonnet</Badge>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-indigo-50/30 border border-indigo-100 rounded-xl text-left">
                  <p className="text-[10px] font-bold text-slate-400">Incoming Raw Text</p>
                  <p className="text-xs text-slate-700 font-semibold mt-1">"The checkout flow throws a weird 500 error when I select PayPal."</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="px-2 py-1 rounded bg-rose-50 border border-rose-200 text-rose-600 font-bold text-[9px] uppercase">Negative</div>
                  <div className="px-2 py-1 rounded bg-blue-50 border border-blue-200 text-blue-600 font-bold text-[9px] uppercase">Checkout Bug</div>
                  <div className="px-2 py-1 rounded bg-amber-50 border border-amber-200 text-amber-600 font-bold text-[9px] uppercase">Payment Flow</div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Section 3 */}
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6 text-left">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Grounded AI RAG Intelligence
            </h2>
            <p className="text-slate-600 font-medium leading-relaxed">
              Don't read thousands of feedback rows yourself. Use Ask LOOP to query your database. Get prompt responses grounded with real data citations, customer quotes, and count figures.
            </p>
            <ul className="space-y-3 font-semibold text-slate-700">
              <li className="flex items-center gap-2">
                <Check className="h-4.5 w-4.5 text-emerald-500" />
                <span>Interactive AI Chat panel with citation links</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4.5 w-4.5 text-emerald-500" />
                <span>Auto-generated weekly Voice-of-Customer PDF briefs</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4.5 w-4.5 text-emerald-500" />
                <span>Embeddings integration supported via pgvector database</span>
              </li>
            </ul>
          </div>
          <div className="bg-slate-100 rounded-[24px] p-6 border border-slate-200/60 shadow-inner">
            <Card className="rounded-[16px] border-none shadow-md overflow-hidden bg-white p-6 space-y-4">
              <div className="flex items-center gap-2 text-left border-b border-slate-100 pb-3">
                <Sparkles className="h-4.5 w-4.5 text-blue-600" />
                <span className="font-extrabold text-xs text-slate-900">Ask LOOP AI</span>
              </div>
              <div className="space-y-3">
                <div className="p-2.5 bg-blue-50/20 rounded-xl text-left border border-slate-100">
                  <p className="text-[9px] font-bold text-blue-600">PROMPT</p>
                  <p className="text-xs text-slate-700 font-bold mt-0.5">"What are users complaining about regarding pricing?"</p>
                </div>
                <div className="p-2.5 bg-emerald-50/10 rounded-xl text-left border border-emerald-100">
                  <p className="text-[9px] font-bold text-emerald-600">AI RESPONSE</p>
                  <p className="text-[11px] text-slate-600 font-semibold mt-0.5 leading-relaxed">
                    Users are concerned with the **Pro Tier limits** (specifically seating limits). There were 14 distinct tickets complaining that they want a mid-level team plan.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="rounded-[32px] bg-gradient-to-tr from-slate-950 to-slate-900 border border-slate-800 p-8 sm:p-12 text-center text-white shadow-xl">
          <h2 className="text-3xl font-extrabold tracking-tight">Ready to centralize customer insight?</h2>
          <p className="mt-4 text-slate-400 max-w-xl mx-auto font-semibold">
            Join thousands of product managers scaling security and velocity with LOOP AI.
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
