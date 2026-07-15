"use client";

import { useState } from "react";
import { FormField } from "@/components/forms";
import { UploadCard } from "@/components/upload";
import { Button, Card, CardContent, Input, SectionHeader, Select, Textarea } from "@/components/ui";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function FeedbackPage() {
  const [content, setContent] = useState("");
  const [channel, setChannel] = useState("email");
  const [customerLabel, setCustomerLabel] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [duplicateDetails, setDuplicateDetails] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<{ title: string; message: string } | null>(null);

  // Source Simulator states
  const [simLoading, setSimLoading] = useState(false);
  const [simMessage, setSimMessage] = useState("");
  const [simModal, setSimModal] = useState(false);
  const [simDetails, setSimDetails] = useState<any | null>(null);

  const simulateIngestion = async (presetText: string, simChannel: string) => {
    setSimLoading(true);
    setSimMessage("");
    setSimDetails(null);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          content: presetText, 
          channel: simChannel, 
          customerLabel: "System Ingestion" 
        })
      });
      const data = await res.json();
      
      if (res.status === 200 && data.duplicateSkipped) {
        setSimDetails(data);
        setSimModal(true);
        setToast({
          title: "Duplicate Feedback Detected",
          message: "A similar feedback already exists in this workspace. The incoming duplicate was skipped automatically. The existing feedback has been updated by increasing its occurrence count. No duplicate record was created."
        });
      } else if (res.status === 201) {
        setSimMessage(`New feedback ingested successfully from ${simChannel}!`);
      } else {
        setSimMessage(data.error || "Simulation failed.");
      }
    } catch (err: any) {
      setSimMessage(err.message || "Failed to simulate ingestion.");
    } finally {
      setSimLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, channel, customerLabel })
      });

      const data = await res.json();

      if (res.status === 200 && data.duplicateSkipped) {
        setDuplicateDetails(data);
        setShowModal(true);
        setToast({
          title: "Duplicate Feedback Detected",
          message: "A similar feedback already exists in this workspace. The incoming duplicate was skipped automatically. The existing feedback has been updated by increasing its occurrence count. No duplicate record was created."
        });
        setLoading(false);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit feedback.");
      }

      setSuccess(true);
      setContent("");
      setCustomerLabel("");
    } catch (err: any) {
      setError(err.message || "Failed to create feedback record.");
    } finally {
      setLoading(false);
    }
  };

  const handleOverrideSubmit = async () => {
    if (!duplicateDetails) return;
    setError("");
    setSuccess(false);
    setLoading(true);
    setShowModal(false);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          content, 
          channel, 
          customerLabel, 
          override: true,
          duplicateOf: duplicateDetails.existingFeedback.id,
          similarityScore: duplicateDetails.similarityScore
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit feedback with override.");
      }

      setSuccess(true);
      setContent("");
      setCustomerLabel("");
      setDuplicateDetails(null);
    } catch (err: any) {
      setError(err.message || "Failed to submit feedback with override.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Feedback Operations"
        title="Add and import customer feedback"
        description="Capture single feedback entries, bulk upload CSV files, or simulate incoming channel activity for testing."
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-slate-950">Add Feedback</h2>
            
            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
              {success && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-700">
                  Feedback record added successfully! Check your inbox.
                </div>
              )}
              {error && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700">
                  {error}
                </div>
              )}

              <FormField label="Feedback content">
                <Textarea
                  required
                  rows={7}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste the customer message, survey response, or support note here."
                />
              </FormField>

              <div className="grid gap-5 md:grid-cols-2">
                <FormField label="Channel">
                  <Select 
                    value={channel}
                    onChange={(e) => setChannel(e.target.value)}
                  >
                    <option value="Email">Email</option>
                    <option value="Live Chat">Live Chat</option>
                    <option value="Survey">Survey</option>
                    <option value="Support Ticket">Support Ticket</option>
                    <option value="Play Store">Play Store</option>
                    <option value="App Store">App Store</option>
                    <option value="Website">Website</option>
                    <option value="Mobile App">Mobile App</option>
                  </Select>
                </FormField>
                <FormField label="Customer Name (e.g. Ava Stone)">
                  <Input 
                    value={customerLabel}
                    onChange={(e) => setCustomerLabel(e.target.value)}
                    placeholder="Ava Stone - SMB customer" 
                  />
                </FormField>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={loading}>
                  {loading ? "Submitting..." : "Submit feedback"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <UploadCard />

          {/* Ingestion Inbox Simulator Card */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-slate-950">Incoming Ingestion Simulator</h3>
              <p className="mt-2 text-sm text-slate-600">
                Simulate active ingestion channels (Email, Website, Survey, Live Chat) to test Level 1 and Level 2 duplicate detection and auto-merges.
              </p>
              
              <div className="mt-5 space-y-3">
                <button
                  onClick={() => simulateIngestion("The dashboard performance is poor.", "Email")}
                  disabled={simLoading}
                  className="w-full text-left p-3.5 bg-slate-50 border border-slate-200/80 hover:bg-slate-100/70 rounded-xl transition text-xs font-semibold flex items-center justify-between"
                >
                  <div>
                    <span className="bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase mr-2">Email</span>
                    "The dashboard performance is poor."
                  </div>
                  <span className="text-slate-400 font-bold text-[10px]">Test Level 2 →</span>
                </button>

                <button
                  onClick={() => simulateIngestion("the dashboard is slow", "Live Chat")}
                  disabled={simLoading}
                  className="w-full text-left p-3.5 bg-slate-50 border border-slate-200/80 hover:bg-slate-100/70 rounded-xl transition text-xs font-semibold flex items-center justify-between"
                >
                  <div>
                    <span className="bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase mr-2">Live Chat</span>
                    "the dashboard is slow"
                  </div>
                  <span className="text-slate-400 font-bold text-[10px]">Test Level 1 →</span>
                </button>

                <button
                  onClick={() => simulateIngestion("We need dark mode please", "Website")}
                  disabled={simLoading}
                  className="w-full text-left p-3.5 bg-slate-50 border border-slate-200/80 hover:bg-slate-100/70 rounded-xl transition text-xs font-semibold flex items-center justify-between"
                >
                  <div>
                    <span className="bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase mr-2">Website</span>
                    "We need dark mode please"
                  </div>
                  <span className="text-slate-400 font-bold text-[10px]">Test Unique →</span>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {showModal && duplicateDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200/80 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertCircle className="h-5 w-5" />
                <h3 className="text-sm font-bold text-slate-900">Duplicate Feedback Detected</h3>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                A similar feedback already exists. The duplicate submission has been skipped to maintain clean customer feedback data.
              </p>
              
              <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl space-y-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Existing Feedback Content</span>
                  <p className="text-xs text-slate-700 italic leading-relaxed">
                    "{duplicateDetails.existingFeedback.content}"
                  </p>
                </div>

                <div className="border-t border-slate-200/60 pt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs font-semibold text-slate-600">
                  <div>Feedback ID: <span className="text-slate-950 font-extrabold">#FB-{duplicateDetails.existingFeedback.id.substring(0, 8)}</span></div>
                  <div>Theme: <span className="text-indigo-650 font-extrabold">{duplicateDetails.existingFeedback.intent || "General"}</span></div>
                  <div>Status: <span className="text-blue-600 font-bold uppercase">{duplicateDetails.existingFeedback.status || "New"}</span></div>
                  <div>Occurrence Count: <span className="text-slate-950 font-extrabold">{duplicateDetails.existingFeedback.occurrenceCount || 1}</span></div>
                  <div>Last Reported: <span className="text-slate-900 font-bold">{new Date(duplicateDetails.existingFeedback.lastReportedAt).toLocaleDateString()}</span></div>
                  <div>Similarity Score: <span className="text-slate-950 font-bold">{Math.round(duplicateDetails.similarityScore * 100)}%</span></div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-2 justify-end">
              <button 
                onClick={() => setShowModal(false)}
                className="rounded-xl border border-slate-200 bg-white px-4.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 shadow-sm transition"
              >
                Close
              </button>
              
              <Link 
                href="/inbox" 
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4.5 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-sm transition"
              >
                View Existing Feedback
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Simulator Ingestion Inbound Duplicate Warning Modal */}
      {simModal && simDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200/80 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertCircle className="h-5 w-5" />
                <h3 className="text-sm font-bold text-slate-900">Duplicate Feedback Detected</h3>
              </div>
              <button 
                onClick={() => setSimModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                A similar feedback already exists. The duplicate submission has been skipped to maintain clean customer feedback data.
              </p>
              
              <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl space-y-3">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs font-semibold text-slate-600">
                  <div>Feedback ID: <span className="text-slate-950 font-extrabold">#FB-{simDetails.existingFeedback.id.substring(0, 8)}</span></div>
                  <div>Theme: <span className="text-indigo-650 font-extrabold">{simDetails.existingFeedback.intent || "General"}</span></div>
                  <div>Status: <span className="text-blue-600 font-bold uppercase">{simDetails.existingFeedback.status || "New"}</span></div>
                  <div>Occurrence Count: <span className="text-slate-950 font-extrabold">{simDetails.existingFeedback.occurrenceCount || 1}</span></div>
                  <div>Last Reported: <span className="text-slate-900 font-bold">{new Date(simDetails.existingFeedback.lastReportedAt).toLocaleDateString()}</span></div>
                  <div>Similarity Score: <span className="text-slate-950 font-bold">{Math.round(simDetails.similarityScore * 100)}%</span></div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-2 justify-end">
              <button 
                onClick={() => setSimModal(false)}
                className="rounded-xl border border-slate-200 bg-white px-4.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 shadow-sm transition"
              >
                Close
              </button>
              <Link 
                href="/inbox" 
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4.5 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-sm transition"
              >
                View Existing Feedback
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Simulator general notifications toast */}
      {simMessage && (
        <div className="fixed top-6 right-6 z-50 max-w-sm bg-slate-900 text-white rounded-2xl shadow-2xl p-4 flex items-start gap-3 border border-slate-700 animate-in slide-in-from-top-5 duration-200">
          <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-bold">Alert</p>
            <p className="text-[11px] text-slate-300 leading-normal">{simMessage}</p>
          </div>
          <button 
            onClick={() => setSimMessage("")}
            className="text-slate-400 hover:text-white font-bold text-sm ml-auto"
          >
            ×
          </button>
        </div>
      )}

      {/* Enterprise-grade Toast Notification popup */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 max-w-sm bg-slate-900 text-white rounded-2xl shadow-2xl p-4 flex items-start gap-3 border border-slate-700 animate-in slide-in-from-top-5 duration-250">
          <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-bold">{toast.title}</p>
            <p className="text-[11px] text-slate-300 leading-normal">{toast.message}</p>
          </div>
          <button 
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-white font-bold text-sm ml-auto shrink-0"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
