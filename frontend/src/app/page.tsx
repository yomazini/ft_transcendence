"use client";

import { FloatingChatWidget } from "@/components/chat";

export default function Home() {
  const currentReportJobId = "f47ac10b-58cc-4372-a567-0e02b2c3d479";

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex justify-between items-center">
          <div>
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
              Social Intelligence Report
            </span>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">
              r/SaaS Competitor & Sentiment Analysis
            </h1>
            <p className="text-sm text-gray-500 mt-1 font-mono">
              Job ID: {currentReportJobId}
            </p>
          </div>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
            Synthesis Complete
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-semibold text-emerald-800 text-sm mb-2">
              Strengths
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              High organic praise for fast customer support and clean API
              documentation.
            </p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-semibold text-rose-800 text-sm mb-2">
              Weaknesses
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Opaque renewal billing policies and lack of a self-serve starter
              tier.
            </p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-xs text-blue-800 flex items-center justify-between">
          <span>
            💡 <strong>Interactive Assistant:</strong> Click the floating button
            in the bottom-right corner to query Reddit comments and citations.
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
