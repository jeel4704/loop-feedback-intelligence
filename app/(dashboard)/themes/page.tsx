"use client";

import { useEffect, useState } from "react";
import { Button, Card, CardContent, SectionHeader } from "@/components/ui";
import { Tag } from "lucide-react";

interface ThemeItem {
  id: string;
  name: string;
  count: number;
  sentiment: string;
  description: string;
}

export default function ThemesPage() {
  const [themes, setThemes] = useState<ThemeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/themes")
      .then(async (res) => {
        if (!res.ok) throw new Error();
        const data = await res.json();
        setThemes(data.items || []);
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Theme Intelligence"
        title="Track what customers keep talking about"
        description="Theme cards help teams understand frequency, sentiment, and the feedback clusters that need product or support action."
      />

      {loading ? (
        <div className="text-center py-12 text-xs text-slate-500 dark:text-dark-muted font-semibold animate-pulse">
          Loading workspace themes...
        </div>
      ) : themes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-12 text-center shadow-sm max-w-2xl mx-auto">
          <Tag className="h-10 w-10 text-slate-300 dark:text-dark-muted mx-auto mb-4" />
          <h3 className="font-extrabold text-lg text-slate-950 dark:text-white">No themes detected</h3>
          <p className="text-sm text-slate-500 dark:text-dark-muted mt-2 max-w-sm mx-auto font-medium">
            Themes are automatically clustered and extracted once feedback entries are parsed by the AI models.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 items-stretch">
          {themes.map((theme) => (
            <Card key={theme.id} className="flex flex-col hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:hover:shadow-[0_8px_30px_rgba(255,255,255,0.03)] transition-all duration-300 border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card rounded-2xl overflow-hidden group">
              <CardContent className="p-6 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-brand/10 dark:bg-brand/20 p-2.5 rounded-xl border border-brand/20 dark:border-brand/30 group-hover:bg-brand/15 transition-colors">
                    <Tag className="h-4 w-4 text-brand" />
                  </div>
                  <p className="text-[10px] font-black text-brand uppercase tracking-wider bg-brand/10 px-2 py-1 rounded-lg">
                    {theme.count === 0 ? "No feedback available" : `${theme.count} mentions`}
                  </p>
                </div>
                
                <h2 className="text-lg font-bold text-slate-900 dark:text-gray-100 leading-tight">
                  {theme.name}
                </h2>
                
                <p className="mt-2.5 text-sm text-slate-600 dark:text-gray-400 leading-relaxed font-medium flex-1">
                  {theme.description || "No description provided."}
                </p>
                
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-dark-border">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-dark-muted uppercase tracking-wider">Overall Sentiment</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-gray-100">{theme.sentiment}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
