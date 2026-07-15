"use client";

import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { Badge } from "@/components/ui";

export default function SecurityPrivacyPage() {
  return (
    <MarketingLayout>
      <section className="relative mx-auto max-w-4xl px-6 pt-20 pb-32 text-left">
        <Badge variant="blue" className="px-3 py-1 bg-rose-500/10 text-rose-500 rounded-full font-bold text-xs uppercase tracking-wider border border-rose-500/20">
          Guide
        </Badge>
        <h1 className="mt-6 text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
          Security & Privacy
        </h1>
        <p className="mt-6 text-slate-400 text-lg font-medium leading-relaxed">
          Detailed documentation on our AES-256 encryption, multi-tenant database isolation, and Role-Based Access Control (RBAC).
        </p>
        
        <div className="mt-12 space-y-8 text-slate-300 leading-relaxed">
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">1. Data Encryption</h2>
            <p className="text-slate-400">
              All data ingested into LOOP is encrypted both in transit (using TLS 1.3) and at rest (using AES-256). We ensure that your customer data is safeguarded at every step.
            </p>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">2. Tenant Isolation</h2>
            <p className="text-slate-400">
              LOOP operates on a strict multi-tenant architecture. Every workspace's data is logically separated at the database level using Postgres Row Level Security (RLS), guaranteeing zero cross-tenant leakage.
            </p>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">3. Role-Based Access Control</h2>
            <p className="text-slate-400">
              Admins have full control over their workspace settings and data imports. Analysts can generate reports and categorize feedback, while Viewers have read-only access to dashboards and insights.
            </p>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
