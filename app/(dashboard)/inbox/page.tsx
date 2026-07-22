"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/tables";
import {
  Badge,
  Button,
  Card,
  CardContent,
  Input,
  SectionHeader,
  Select
} from "@/components/ui";

const statusVariant = {
  NEW: "blue",
  REVIEWED: "amber",
  ACTIONED: "green"
} as const;

interface FeedbackItem {
  id: string;
  customerName: string;
  customerEmail: string;
  content: string;
  source: string;
  status: string;
  sentimentLabel: string;
  createdAt: string;
  themes: { theme: { name: string } }[];
}

export default function InboxPage() {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState("");
  const [channel, setChannel] = useState("all");
  const [sentiment, setSentiment] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 50;

  useEffect(() => {
    setLoading(true);
    const query = new URLSearchParams();
    if (channel !== "all") query.set("channel", channel);
    if (sentiment !== "all") query.set("sentiment", sentiment);
    if (statusFilter !== "all") query.set("status", statusFilter);
    if (search) query.set("search", search);
    query.set("page", page.toString());
    query.set("limit", limit.toString());

    fetch(`/api/feedback?${query.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setItems(data.items || []);
        setTotalCount(data.total || 0);
        setLoading(false);
      });
  }, [channel, sentiment, statusFilter, search, page]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [channel, sentiment, statusFilter, search]);

  const handleResolve = async (feedbackId: string, resolution: "MERGE" | "KEEP") => {
    try {
      const res = await fetch("/api/feedback/resolve-duplicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedbackId, resolution })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to resolve duplicate.");
        return;
      }

      // Re-fetch inbox items
      const query = new URLSearchParams();
      if (channel !== "all") query.set("channel", channel);
      if (sentiment !== "all") query.set("sentiment", sentiment);
      if (statusFilter !== "all") query.set("status", statusFilter);

      const refreshedRes = await fetch(`/api/feedback?${query.toString()}`);
      const refreshedData = await refreshedRes.json();
      setItems(refreshedData.items || []);
    } catch (err: any) {
      console.error(err);
    }
  };

  const rows = items.map((item) => {
    const themeName = item.themes?.[0]?.theme?.name || "Uncategorized";
    const excerpt = item.content.length > 120 ? item.content.substring(0, 120) + "..." : item.content;

    const s = (item.status || "New").toLowerCase();
    let variant: "blue" | "amber" | "green" = "blue";
    if (s === "closed" || s === "resolved" || s === "actioned") {
      variant = "green";
    } else if (s === "in review" || s === "reviewed" || s === "possible duplicate") {
      variant = "amber";
    }

    return [
      <div key={item.id} className="space-y-2 py-1">
        <p className="font-bold text-[13px] text-slate-950 dark:text-gray-100">{item.customerName}</p>
        <p className="mt-1 text-xs text-slate-600 dark:text-dark-muted leading-relaxed line-clamp-2">{excerpt}</p>
        {s === "possible duplicate" && (
          <div className="flex items-center gap-2 mt-2 bg-amber-50/50 border border-amber-100 p-2 rounded-xl w-fit">
            <span className="text-[10px] font-bold text-amber-700">Possible Duplicate:</span>
            <button
              onClick={() => handleResolve(item.id, "MERGE")}
              className="text-[10px] font-extrabold text-white bg-amber-600 hover:bg-amber-700 px-2 py-0.5 rounded transition"
            >
              Merge
            </button>
            <button
              onClick={() => handleResolve(item.id, "KEEP")}
              className="text-[10px] font-extrabold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-2 py-0.5 rounded transition"
            >
              Keep Unique
            </button>
          </div>
        )}
      </div>,
      <div key={`${item.id}-source`} className="flex items-center gap-2">
        <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-dark-elevated text-[11px] font-bold text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-dark-border">
          {item.source}
        </span>
      </div>,
      <span key={`${item.id}-theme`} className="text-[13px] font-semibold text-slate-800 dark:text-gray-200">{themeName}</span>,
      <div key={`${item.id}-sentiment`} className="flex items-center gap-1.5">
        <div className={`w-1.5 h-1.5 rounded-full ${
          item.sentimentLabel === 'Positive' ? 'bg-emerald-500' :
          item.sentimentLabel === 'Negative' ? 'bg-rose-500' :
          'bg-slate-400'
        }`} />
        <span className="text-[12px] font-bold text-slate-700 dark:text-gray-300">
          {item.sentimentLabel || "Neutral"}
        </span>
      </div>,
      <Badge
        key={`${item.id}-status`}
        variant={variant}
        className="w-fit font-bold uppercase"
      >
        {item.status || "NEW"}
      </Badge>
    ];
  });

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Feedback Inbox"
        title="Review incoming customer feedback"
        description="Search, filter, and triage raw customer feedback before turning it into themes, reports, and action items."
      />

      <Card className="border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-5">
          <Input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer, quote, or keyword" 
            className="lg:col-span-2 text-[13px] font-medium" 
          />
          <Select 
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
          >
            <option value="all">All channels</option>
            <option value="Email">Email</option>
            <option value="Live Chat">Live Chat</option>
            <option value="Survey">Survey</option>
            <option value="Support Ticket">Support Ticket</option>
            <option value="Play Store">Play Store</option>
            <option value="App Store">App Store</option>
            <option value="Website">Website</option>
            <option value="Mobile App">Mobile App</option>
          </Select>
          <Select 
            value={sentiment}
            onChange={(e) => setSentiment(e.target.value)}
          >
            <option value="all">All sentiment</option>
            <option value="Positive">Positive</option>
            <option value="Neutral">Neutral</option>
            <option value="Negative">Negative</option>
          </Select>
          <Select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="New">New</option>
            <option value="Possible Duplicate">Possible Duplicate</option>
            <option value="Reviewed">Reviewed</option>
            <option value="Actioned">Actioned</option>
          </Select>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-12 text-[13px] text-slate-500 dark:text-dark-muted font-semibold animate-pulse">
          Loading feedback inbox records...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-12 text-center shadow-sm max-w-2xl mx-auto mt-8">
          <div className="bg-slate-50 dark:bg-dark-elevated w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-dark-border">
            <span className="text-2xl">📥</span>
          </div>
          <h3 className="font-extrabold text-lg text-slate-950 dark:text-white">No feedback collected yet</h3>
          <p className="text-[13px] text-slate-500 dark:text-dark-muted mt-2 font-medium">When you ingest feedback via email, surveys, or integrations, it will appear here.</p>
        </div>
      ) : (
        <>
          <DataTable
            columns={[
              { key: "customer", label: "Customer Feedback" },
              { key: "channel", label: "Channel" },
              { key: "theme", label: "Theme" },
              { key: "sentiment", label: "Sentiment" },
              { key: "status", label: "Status" }
            ]}
            rows={rows}
          />

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-dark-card p-4 rounded-2xl border border-slate-200 dark:border-dark-border shadow-sm">
            <p className="text-[13px] text-slate-500 dark:text-dark-muted font-semibold">
              Showing <span className="text-slate-950 dark:text-gray-200">{Math.min((page - 1) * limit + 1, totalCount)}</span> to <span className="text-slate-950 dark:text-gray-200">{Math.min(page * limit, totalCount)}</span> of <span className="text-slate-950 dark:text-gray-200">{totalCount}</span> records
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="text-xs font-bold text-slate-700 dark:text-gray-300 hover:text-brand dark:hover:text-brand hover:bg-slate-100 dark:hover:bg-dark-hover border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-elevated shadow-sm"
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                onClick={() => setPage(p => p + 1)}
                disabled={page * limit >= totalCount}
                className="text-xs font-bold text-slate-700 dark:text-gray-300 hover:text-brand dark:hover:text-brand hover:bg-slate-100 dark:hover:bg-dark-hover border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-elevated shadow-sm"
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
