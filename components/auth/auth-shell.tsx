import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

interface AuthShellProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function AuthShell({ title, description, children }: AuthShellProps) {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-black px-6 py-16 flex items-center justify-center">
      <div className="mx-auto grid max-w-6xl w-full gap-10 lg:grid-cols-[1.2fr_0.9fr]">
        {/* Left Column - Branding & Info */}
        <section className="rounded-[32px] border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-8 text-slate-950 dark:text-white shadow-2xl sm:p-10 flex flex-col justify-center relative overflow-hidden">
          {/* Subtle glow effect in the corner for premium feel */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand/10 dark:bg-brand/20 blur-3xl rounded-full -mr-20 -mt-20 pointer-events-none" />
          
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="flex items-center justify-center h-14 w-14 rounded-2xl border border-slate-200 dark:border-dark-border bg-slate-100 dark:bg-dark-elevated shadow-inner">
              <span className="font-extrabold text-2xl text-brand">L</span>
            </div>
            <span className="font-extrabold text-2xl text-slate-950 dark:text-white tracking-tight">LOOP</span>
          </div>
          <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.15] relative z-10">
            Customer Feedback <span className="text-brand">Intelligence</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-600 dark:text-dark-muted font-medium relative z-10">
            Ingest customer feedback, classify it with AI, monitor trends,
            and turn raw conversations into decision-ready Voice of Customer
            reporting.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 relative z-10">
            {[
              "Multi-tenant workspace isolation",
              "Role-based access for Admin, Analyst, Viewer",
              "Ask LOOP with source-backed answers",
              "AI-assisted theme detection and reporting"
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-elevated p-4 text-sm font-semibold text-slate-700 dark:text-dark-secondaryText shadow-sm"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        {/* Right Column - Form */}
        <section className="rounded-[32px] border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-8 shadow-2xl sm:p-10 flex flex-col justify-center relative overflow-hidden">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-brand">
            {title}
          </p>
          <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
            {description}
          </h2>
          <div className="mt-8 relative z-10">{children}</div>
        </section>
      </div>
    </main>
  );
}

