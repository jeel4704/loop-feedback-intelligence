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
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 px-6 py-16 flex items-center justify-center">
      <div className="mx-auto grid max-w-6xl w-full gap-10 lg:grid-cols-[1.2fr_0.9fr]">
        {/* Left Column - Branding & Info */}
        <section className="rounded-[32px] border border-slate-800/60 bg-slate-900/40 p-8 text-white shadow-2xl backdrop-blur-sm sm:p-10 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center h-14 w-14 rounded-2xl border border-slate-700 bg-slate-800 shadow-inner">
              <span className="font-extrabold text-2xl text-blue-500">L</span>
            </div>
            <span className="font-extrabold text-2xl text-white tracking-tight">LOOP</span>
          </div>
          <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.15]">
            Customer Feedback <span className="text-blue-500">Intelligence</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-400 font-medium">
            Ingest customer feedback, classify it with AI, monitor trends,
            and turn raw conversations into decision-ready Voice of Customer
            reporting.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {[
              "Multi-tenant workspace isolation",
              "Role-based access for Admin, Analyst, Viewer",
              "Ask LOOP with source-backed answers",
              "AI-assisted theme detection and reporting"
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-sm font-semibold text-slate-300 shadow-sm"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        {/* Right Column - Form */}
        <section className="rounded-[32px] border border-slate-800 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-md sm:p-10 flex flex-col justify-center">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-blue-500">
            {title}
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white">
            {description}
          </h2>
          <div className="mt-8">{children}</div>
        </section>
      </div>
    </main>
  );
}

