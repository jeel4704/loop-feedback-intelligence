"use client";

import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { Badge } from "@/components/ui";

export default function GettingStartedPage() {
  return (
    <MarketingLayout>
      <section className="relative mx-auto max-w-4xl px-6 pt-20 pb-32 text-left">
        <Badge variant="blue" className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full font-bold text-xs uppercase tracking-wider border border-blue-500/20">
          Guide
        </Badge>
        <h1 className="mt-6 text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
          Getting Started Guide
        </h1>
        <p className="mt-6 text-slate-400 text-lg font-medium leading-relaxed">
          Welcome to LOOP! This guide will help you set up your workspace, configure your initial project settings, and invite your team members to collaborate.
        </p>
        
        <div className="mt-12 space-y-8 text-slate-300 leading-relaxed">
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">1. Setting up your Workspace</h2>
            <p className="text-slate-400">
              When you first log in, you will be prompted to create a new workspace. Choose a name that represents your company or project. Your workspace acts as an isolated environment for all your feedback data.
            </p>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">2. Inviting Team Members</h2>
            <p className="text-slate-400">
              Navigate to the <strong>Settings</strong> menu and select <strong>Members</strong>. Here you can invite colleagues via email and assign them specific roles (Admin, Analyst, or Viewer) using our Role-Based Access Control (RBAC) system.
            </p>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">3. Next Steps</h2>
            <p className="text-slate-400">
              Now that your workspace is ready, the next step is to bring your data in. Check out our CSV Import Guide to learn how to ingest your historical feedback data.
            </p>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
