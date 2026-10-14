"use client";

import { useState, useEffect } from "react";
import { MessageSquareText, X } from "lucide-react";
import { ChatWidget } from "./ChatWidget";
import { FloatingChatWidgetProps } from "@/types/chat";
export function FloatingChatWidget({
  jobId = "a18f2d90-3b41-4e2a-9f12-987654321abc",
  apiEndpoint = "/api/rag/query",
}: FloatingChatWidgetProps) {
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
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={handleToggle}
          aria-label={isOpen ? "Close AI Assistant" : "Open AI Assistant"}
          className={`group flex items-center justify-center rounded-full shadow-2xl transition-all duration-300 cursor-pointer ${
            isOpen
              ? "w-12 h-12 bg-slate-800 text-white hover:bg-slate-900"
              : "w-14 h-14 bg-gradient-to-tr from-blue-700 to-cyan-500 text-white hover:scale-105 active:scale-95 shadow-blue-500/30"
          }`}
        >
          {isOpen ? (
            <X className="w-5 h-5 transition-transform group-hover:rotate-90" />
          ) : (
            <div className="relative">
              <MessageSquareText className="w-6 h-6 transition-transform group-hover:scale-110" />
              {!hasInteracted && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500 border-2 border-white" />
                </span>
              )}
            </div>
          )}
        </button>
      </div>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-[2px] z-40 transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white shadow-2xl z-50 border-l border-gray-200 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
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
