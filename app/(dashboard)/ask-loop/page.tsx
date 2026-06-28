"use client";

import { useState } from "react";
import { demoConversations } from "@/data/conversations";
import { Badge, Button, Card, CardContent, Input, SectionHeader } from "@/components/ui";

export default function AskLoopPage() {
  const [selectedConversation, setSelectedConversation] = useState(
    demoConversations[0]
  );
  const [question, setQuestion] = useState(demoConversations[0].question);

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Ask LOOP"
        title="Ask questions about your customer feedback"
        description="Use natural language to explore sentiment, trending themes, and emerging issues with source-backed answers."
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardContent className="space-y-5 p-6">
            <div className="rounded-3xl bg-slate-50 p-5 dark:bg-slate-900">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {selectedConversation.question}
              </p>
            </div>
            <div className="rounded-3xl bg-blue-600 p-5 text-white">
              <p className="text-sm leading-6">
                {selectedConversation.answer}
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                Example questions
              </p>
              <div className="flex flex-wrap gap-3">
                {demoConversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => {
                      setSelectedConversation(conversation);
                      setQuestion(conversation.question);
                    }}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
                  >
                    {conversation.question}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                placeholder="Ask LOOP a question about your feedback..."
                className="sm:flex-1"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
              />
              <Button
                onClick={() => {
                  const matched =
                    demoConversations.find((item) => item.question === question) ??
                    demoConversations[0];
                  setSelectedConversation(matched);
                }}
              >
                Ask
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-50">
                  Answer Card
                </h3>
                <Badge variant="blue">AI Demo</Badge>
              </div>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                LOOP summarizes the selected question using the mock feedback
                dataset and returns evidence cards below.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-50">
                Source Feedback
              </h3>
              <div className="mt-5 space-y-4">
                {selectedConversation.sources.map((source) => (
                  <div
                    key={source.id}
                    className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-300"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {source.customerLabel}
                      </p>
                      <Badge variant="outline">{source.channel}</Badge>
                    </div>
                    <p className="mt-2">{source.content}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
