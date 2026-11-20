"use client";

import { useState, useEffect } from "react";
import { MessageSquareText, X } from "lucide-react";
import { ChatWidget } from "./ChatWidget";
import { FloatingChatWidgetProps } from "@/types/chat";
import { useSelectedJobId } from "@/hooks/useSelectedJob";
import { RAG_ENDPOINT } from "@/lib/api/rag";

export function FloatingChatWidget({
  jobId: jobIdProp,
  apiEndpoint = RAG_ENDPOINT,
}: FloatingChatWidgetProps) {
  // The chat answers about the job shown on the dashboard (?job=… or the newest finished one).
  const selectedJobId = useSelectedJobId();
  const jobId = jobIdProp ?? selectedJobId ?? "";
  const [isOpen, setIsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
    setHasInteracted(true);
  };

  return (
    <>
      <div className="chat-launcher-wrap">
        <button
          type="button"
          onClick={handleToggle}
          aria-label={isOpen ? "Close AI Assistant" : "Open AI Assistant"}
          className={`chat-launcher group ${
            isOpen ? "chat-launcher-open" : "chat-launcher-closed"
          }`}
        >
          {isOpen ? (
            <X className="chat-launcher-x" />
          ) : (
            <div className="relative">
              <MessageSquareText className="chat-launcher-icon" />
              {!hasInteracted && (
                <span className="chat-ping">
                  <span className="chat-ping-ring" />
                  <span className="chat-ping-dot" />
                </span>
              )}
            </div>
          )}
        </button>
      </div>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="chat-backdrop"
          aria-hidden="true"
        />
      )}

      <aside
        className={`chat-drawer ${
          isOpen ? "chat-drawer-open" : "chat-drawer-closed"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="AI Assistant Drawer"
      >
        <ChatWidget
          jobId={jobId}
          apiEndpoint={apiEndpoint}
          onClose={() => setIsOpen(false)}
        />
      </aside>
    </>
  );
}

export default FloatingChatWidget;
