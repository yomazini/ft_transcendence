"use client";

import { useState } from "react";
import { FloatingChatWidget } from "@/components/chat";
import { useJobEvents } from "@/hooks/useJobEvents";

const DEFAULT_SEED_JOB_ID = "fb1e7a06-e9ff-4b64-8e43-a3584c7c5392";

export default function Home() {
  const [targetSubreddit, setTargetSubreddit] = useState("r/freelance");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedJobId, setSubmittedJobId] = useState<string | undefined>(
    undefined,
  );

  const {
    status: liveStatus,
    reportId: liveReportId,
    latestJobId,
  } = useJobEvents(submittedJobId);

  const currentReportJobId =
    submittedJobId || latestJobId || DEFAULT_SEED_JOB_ID;

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "subreddit",
          target: targetSubreddit,
          customer_persona: {
            description: "freelancers and solo developers",
            price_sensitivity: "high",
            top_priority: "transparent pricing and fast support",
          },
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const data = await res.json();
      setSubmittedJobId(data.id);
    } catch {
      setSubmittedJobId(undefined);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = () => {
    switch (liveStatus) {
      case "queued":
        return (
          <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-200 animate-pulse">
            ⏳ BullMQ: Queued
          </span>
        );
      case "running":
        return (
          <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200 animate-pulse">
            ⚙️ Worker: Running NLP & pgvector...
          </span>
        );
      case "done":
        return (
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
            ✅ Pipeline: Synthesis Complete
          </span>
        );
      case "failed":
        return (
          <span className="px-3 py-1 bg-rose-50 text-rose-700 text-xs font-semibold rounded-full border border-rose-200">
            ❌ Pipeline: Job Failed
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full border border-slate-200">
            Idle / Seed Loaded
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
              Social Intelligence & RAG Platform
            </span>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">
              Reddit Sentiment & Strategy Analyzer
            </h1>
            <p className="text-sm text-gray-500 mt-1 font-mono">
              Active Job ID: {currentReportJobId}
            </p>
          </div>
          <div>{getStatusBadge()}</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
            Trigger Full Pipeline (Gateway ➔ Redis ➔ Analysis ➔ Socket.IO)
          </h2>
          <form
            onSubmit={handleCreateJob}
            className="flex flex-col sm:flex-row gap-3"
          >
            <input
              type="text"
              value={targetSubreddit}
              onChange={(e) => setTargetSubreddit(e.target.value)}
              placeholder="e.g. r/freelance or r/localllama"
              className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Dispatching..." : "Submit Analysis Job"}
            </button>
          </form>
          {submittedJobId && (
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-600 font-mono">
              <span>Submitted: {submittedJobId}</span>
              {liveReportId && (
                <span className="text-emerald-600 font-semibold">
                  (Report: {liveReportId.slice(0, 8)}...)
                </span>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-semibold text-emerald-800 text-sm mb-2">
              Strengths (Synthesized)
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Organic user praise for fast customer support and clean API
              documentation.
            </p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-semibold text-rose-800 text-sm mb-2">
              Weaknesses (Synthesized)
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Opaque renewal billing policies and high pricing relative to
              open-source alternatives.
            </p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-xs text-blue-800 flex items-center justify-between">
          <span>
            💡 <strong>RAG Assistant:</strong> Click the floating icon in the
            bottom-right to query Reddit comments and view cited sources.
          </span>
        </div>
      </div>

      <FloatingChatWidget
        jobId={currentReportJobId}
        apiEndpoint="/api/rag/query"
      />
    </div>
  );
}
