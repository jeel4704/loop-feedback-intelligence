"use client";

import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { Badge } from "@/components/ui";

export default function CSVImportGuidePage() {
  return (
    <MarketingLayout>
      <section className="relative mx-auto max-w-4xl px-6 pt-20 pb-32 text-left">
        <Badge variant="blue" className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full font-bold text-xs uppercase tracking-wider border border-emerald-500/20">
          Guide
        </Badge>
        <h1 className="mt-6 text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
          CSV Import Guide
        </h1>
        <p className="mt-6 text-slate-400 text-lg font-medium leading-relaxed">
          Step-by-step instructions on formatting your feedback data, mapping headers correctly, and importing thousands of rows into LOOP.
        </p>
        
        <div className="mt-12 space-y-8 text-slate-300 leading-relaxed">
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">1. Format your CSV</h2>
            <p className="text-slate-400">
              Ensure your CSV file contains a column for the primary feedback text. Optional columns include customer email, name, date, and source (e.g., Intercom, Zendesk, App Store).
            </p>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">2. Uploading the File</h2>
            <p className="text-slate-400">
              Go to the <strong>Inbox</strong> page and click <strong>Import CSV</strong>. Select your formatted file. Our robust parser can handle files with up to 100,000 rows without timing out.
            </p>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">3. Mapping Headers</h2>
            <p className="text-slate-400">
              The wizard will ask you to map your CSV columns to LOOP's standard fields. Select the column that represents "Feedback Content" and map any available metadata. Once complete, click Import to start analyzing.
            </p>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
