import { Citation } from "@/types/chat";
import { MessageSquare, ThumbsUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CitationModalProps {
  citation: Citation | null;
  onClose: () => void;
}

export function CitationModal({ citation, onClose }: CitationModalProps) {
  const score = citation?.sentiment_score ?? null;

  const tone =
    score === null || Math.abs(score) <= 0.1
      ? "neutral"
      : score > 0
        ? "positive"
        : "negative";
  const percent = Math.round((score ?? 0) * 100);
  const sentimentClass = `chat-sentiment-${tone}`;
  const sentimentLabel =
    tone === "neutral"
      ? "Neutral"
      : tone === "positive"
        ? `Positive (+${percent}%)`
        : `Negative (${percent}%)`;

  return (
    <Dialog
      open={citation !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="chat-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            Source Reddit Comment
          </DialogTitle>
        </DialogHeader>

        {citation && (
          <>
            <div className="chat-modal-body">
              <div className="chat-modal-meta">
                <span className="font-medium text-foreground">
                  u/{citation.author}
                </span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 font-semibold text-foreground">
                    <ThumbsUp className="w-3.5 h-3.5 text-primary" />
                    {citation.upvotes} upvotes
                  </span>
                  <span className={`chat-sentiment ${sentimentClass}`}>
                    {sentimentLabel}
                  </span>
                </div>
              </div>

              <div className="chat-modal-comment">
                &ldquo;{citation.text}&rdquo;
              </div>

              <div className="chat-modal-footnote">
                <span>Retrieved via pgvector cosine similarity</span>
                <span className="chat-modal-id">
                  ID: {citation.id.slice(0, 8)}...
                </span>
              </div>
            </div>

            <div className="chat-modal-footer">
              <DialogClose render={<Button variant="secondary" />}>
                Close
              </DialogClose>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
