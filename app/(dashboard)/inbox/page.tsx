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
      <div key={item.id} className="space-y-2">
        <p className="font-bold text-xs text-slate-900 dark:text-slate-100">{item.customerName}</p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-normal">{excerpt}</p>
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
      item.source,
      themeName,
      item.sentimentLabel || "Neutral",
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

      <Card>
        <CardContent className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-5">
          <Input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer, quote, or keyword" 
            className="lg:col-span-2 text-xs" 
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
        <div className="text-center py-12 text-xs text-slate-400 font-semibold">
          Loading feedback inbox records...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-slate-200 bg-white p-12 text-center shadow-sm">
          <p className="text-xs text-slate-400">No feedback has been collected yet.</p>
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

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500 font-semibold">
              Showing {Math.min((page - 1) * limit + 1, totalCount)}–{Math.min(page * limit, totalCount)} of {totalCount} records
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => p + 1)}
                disabled={page * limit >= totalCount}
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
