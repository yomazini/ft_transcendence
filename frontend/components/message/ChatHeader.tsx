import { Sparkles, RotateCcw, X } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ChatHeaderProps {
  jobId: string;
  onReset: () => void;
  onClose?: () => void;
}

export function ChatHeader({ jobId, onReset, onClose }: ChatHeaderProps) {
  return (
    <div className="chat-header">
      <div className="chat-header-brand">
        <div className="chat-header-icon">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <div className="chat-header-title-row">
            <h3 className="chat-header-title">Report Assistant</h3>
            <span className="chat-header-badge">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Online
            </span>
          </div>
          <p className="chat-header-job">
            job: {jobId ? `${jobId.slice(0, 8)}...` : "global"}
          </p>
        </div>
      </div>

      <div className="chat-header-actions">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onReset}
          title="Clear Conversation"
          aria-label="Clear Conversation"
        >
          <RotateCcw />
        </Button>
        {onClose && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            title="Close Assistant"
            aria-label="Close Assistant"
          >
            <X />
          </Button>
        )}
      </div>
    </div>
  );
}
