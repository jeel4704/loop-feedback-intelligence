"use client";

import { useState } from "react";
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
import { demoFeedback } from "@/data/feedback";
import { demoThemes } from "@/data/themes";

const statusVariant = {
  NEW: "blue",
  REVIEWED: "amber",
  ACTIONED: "green"
} as const;

export default function InboxPage() {
  const [search, setSearch] = useState("");
  const [channel, setChannel] = useState("all");
  const [sentiment, setSentiment] = useState("all");
  const [status, setStatus] = useState("all");
  const [theme, setTheme] = useState("all");
  const [page, setPage] = useState(1);

  const filteredItems = demoFeedback.filter((item) => {
    const matchesSearch =
      item.content.toLowerCase().includes(search.toLowerCase()) ||
      item.customerLabel.toLowerCase().includes(search.toLowerCase());
    const matchesChannel = channel === "all" || item.channel === channel;
    const matchesSentiment = sentiment === "all" || item.sentiment === sentiment;
    const matchesStatus = status === "all" || item.status === status;
    const matchesTheme = theme === "all" || item.theme === theme;

    return (
      matchesSearch &&
      matchesChannel &&
      matchesSentiment &&
      matchesStatus &&
      matchesTheme
    );
  });

  const pageSize = 12;
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const visibleItems = filteredItems.slice(startIndex, startIndex + pageSize);

  const rows = visibleItems.map((item) => [
    <div key={`${item.id}-customer`}>
      <p className="font-medium text-slate-900 dark:text-slate-100">
        {item.customerLabel}
      </p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        {item.content}
      </p>
    </div>,
    item.channel,
    item.theme,
    item.sentiment,
    <Badge
      key={`${item.id}-status`}
      variant={statusVariant[item.status]}
      className="w-fit"
    >
      {item.status}
    </Badge>
  ]);

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Feedback Inbox"
        title="Review incoming customer feedback"
        description="Search, filter, and triage raw customer feedback before turning it into themes, reports, and action items."
      />

      <Card>
        <CardContent className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-5">
          <Input
            placeholder="Search customer, quote, or keyword"
            className="xl:col-span-2"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
          <Select
            value={channel}
            onChange={(event) => {
              setChannel(event.target.value);
              setPage(1);
            }}
          >
            <option value="all">All channels</option>
            <option>Support Ticket</option>
            <option>App Store Review</option>
            <option>NPS Survey</option>
            <option>Sales Call</option>
            <option>Community Forum</option>
            <option>Live Chat</option>
          </Select>
          <Select
            value={sentiment}
            onChange={(event) => {
              setSentiment(event.target.value);
              setPage(1);
            }}
          >
            <option value="all">All sentiment</option>
            <option>Positive</option>
            <option>Neutral</option>
            <option>Negative</option>
          </Select>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
            <Select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
            >
              <option value="all">All status</option>
              <option>NEW</option>
              <option>REVIEWED</option>
              <option>ACTIONED</option>
            </Select>
            <Select
              value={theme}
              onChange={(event) => {
                setTheme(event.target.value);
                setPage(1);
              }}
            >
              <option value="all">All themes</option>
              {demoThemes.map((item) => (
                <option key={item.id}>{item.name}</option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

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
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Showing {visibleItems.length === 0 ? 0 : startIndex + 1}-
          {Math.min(startIndex + pageSize, filteredItems.length)} of{" "}
          {filteredItems.length} feedback records
        </p>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
