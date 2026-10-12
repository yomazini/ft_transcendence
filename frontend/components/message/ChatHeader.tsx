import { Sparkles, RotateCcw, X } from "lucide-react";

interface ChatHeaderProps {
  jobId: string;
  onReset: () => void;
  onClose?: () => void;
}

export function ChatHeader({ jobId, onReset, onClose }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-10">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-md">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 text-sm leading-tight">
              Report Assistant
            </h3>
            <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Online
            </span>
          </div>
          <p className="text-[11px] text-gray-400 font-mono">
            job: {jobId ? `${jobId.slice(0, 8)}...` : "global"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={onReset}
          title="Clear Conversation"
          className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        {onClose && (
          <button
            onClick={onClose}
            title="Close Assistant"
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}