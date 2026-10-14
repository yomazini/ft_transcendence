import { Citation } from "@/types/chat";
import { X, ThumbsUp, MessageSquare } from "lucide-react";

interface CitationModalProps {
  citation: Citation | null;
  onClose: () => void;
}

export function CitationModal({ citation, onClose }: CitationModalProps) {
  if (!citation) return null;

  const sentimentColor =
    citation.sentiment_score === null
      ? "text-gray-600 bg-gray-100"
      : citation.sentiment_score > 0.1
        ? "text-emerald-700 bg-emerald-50 border-emerald-200"
        : citation.sentiment_score < -0.1
          ? "text-rose-700 bg-rose-50 border-rose-200"
          : "text-amber-700 bg-amber-50 border-amber-200";

  const sentimentLabel =
    citation.sentiment_score === null
      ? "Neutral"
      : citation.sentiment_score > 0.1
        ? `Positive (+${(citation.sentiment_score * 100).toFixed(0)}%)`
        : citation.sentiment_score < -0.1
          ? `Negative (${(citation.sentiment_score * 100).toFixed(0)}%)`
          : "Neutral";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-gray-200 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-gray-900 text-sm">
              Source Reddit Comment
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-medium text-gray-700">
              u/{citation.author}
            </span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 font-semibold text-gray-700">
                <ThumbsUp className="w-3.5 h-3.5 text-blue-500" />
                {citation.upvotes} upvotes
              </span>
              <span
                className={`px-2 py-0.5 rounded-full border text-[11px] font-medium ${sentimentColor}`}
              >
                {sentimentLabel}
              </span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-gray-800 leading-relaxed font-sans max-h-60 overflow-y-auto">
            &ldquo;{citation.text}&rdquo;
          </div>

          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Retrieved via pgvector cosine similarity</span>
            <span className="font-mono text-[10px]">
              ID: {citation.id.slice(0, 8)}...
            </span>
          </div>
        </div>

        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
