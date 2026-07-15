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
        <div className="text-center py-12 text-xs text-slate-400 font-semibold">
          Loading workspace themes...
        </div>
      ) : themes.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-slate-200 bg-white p-12 text-center shadow-sm">
          <Tag className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-sm text-slate-900">No themes detected</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Themes are automatically clustered and extracted once feedback entries are parsed by the AI models.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {themes.map((theme) => (
            <Card key={theme.id}>
              <CardContent className="p-6">
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">
                  {theme.count} mentions
                </p>
                <h2 className="mt-3 text-lg font-bold text-slate-950">
                  {theme.name}
                </h2>
                <p className="mt-2 text-xs text-slate-500 leading-normal">
                  {theme.description || "No description provided."}
                </p>
                <p className="mt-3 text-xs font-semibold text-slate-700">{theme.sentiment}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
