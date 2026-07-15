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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.14),_transparent_25%),linear-gradient(to_bottom,_#f8fbff,_#eef2ff)] px-6 py-16">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.2fr_0.9fr]">
        <section className="rounded-[32px] border border-slate-200 bg-slate-950 p-8 text-white shadow-[0_24px_80px_-32px_rgba(15,23,42,0.85)] sm:p-10">
          <div className="flex items-center gap-3 mb-6">
            <Image 
              src="/logo.jpg" 
              alt="LOOP Logo" 
              width={56}
              height={56}
              className="rounded-2xl border border-slate-800 bg-white p-1.5 shadow-md"
            />
            <span className="font-bold text-xl text-white tracking-tight">LOOP</span>
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">
            AI Customer Feedback Intelligence Platform
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300">
            Ingest customer feedback, classify it with AI, monitor trends,
            and turn raw conversations into decision-ready Voice of Customer
            reporting.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              "Multi-tenant workspace isolation",
              "Role-based access for Admin, Analyst, Viewer",
              "Ask LOOP with source-backed answers",
              "AI-assisted theme detection and reporting"
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200"
              >
                {item}
              </div>
            ))}
          </div>

        </section>

        <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">
            {title}
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            {description}
          </h2>
          <div className="mt-8">{children}</div>
        </section>
      </div>
    </main>
  );
}

