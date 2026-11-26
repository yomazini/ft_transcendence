import { useState } from "react";
import { authHeaders } from "@/lib/auth";
import { RAG_ENDPOINT } from "@/lib/api/rag";
import {
  ChatMessage,
  Citation,
  RagQueryRequest,
  RagQueryResponse,
} from "@/types/chat";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { CitationModal } from "./CitationModal";

interface ChatWidgetProps {
  jobId?: string;
  apiEndpoint?: string;
  onClose?: () => void;
}
export function ChatWidget({
  jobId = "",
  apiEndpoint = RAG_ENDPOINT,
  onClose,
}: ChatWidgetProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial-welcome",
      role: "assistant",
      content:
        "Hello! I am your InsightFlow RAG Assistant. Ask me anything about the customer sentiment, competitor threats, or pricing feedback in this report.",
      timestamp: "Just now",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);

  const handleSend = async (queryText: string) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: queryText,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      let responseData: RagQueryResponse;

      try {
        const res = await fetch(apiEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders() },
          body: JSON.stringify({
            job_id: jobId,
            query: queryText,
          } satisfies RagQueryRequest),
        });

        if (res.ok) {
          responseData = await res.json();
        } else {
          const data = await res.json().catch(() => null);
          throw new Error(data?.message ?? `API returned ${res.status}`);
        }
      } catch (err) {
        // Say what went wrong instead of inventing an answer.
        responseData = {
          answer: !jobId
            ? "Select a finished job first (Jobs panel or sidebar), then ask about its comments."
            : `I could not answer: ${err instanceof Error ? err.message : "the analysis service is unreachable"}.`,
          citations: [],
        };
      }

      const assistantMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: "assistant",
        content: responseData.answer,
        citations: responseData.citations,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content:
          "⚠️ Failed to retrieve RAG analysis. Please check backend connection.",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: `reset-${Date.now()}`,
        role: "assistant",
        content:
          "Chat cleared. What else would you like to investigate in this report?",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
  };

  return (
    <div className="chat-widget">
      <ChatHeader jobId={jobId} onReset={handleReset} onClose={onClose} />
      <MessageList
        messages={messages}
        isLoading={isLoading}
        onCitationClick={(cit) => setActiveCitation(cit)}
      />
      <ChatInput
        onSend={handleSend}
        isLoading={isLoading}
        onQuickQuery={(q) => handleSend(q)}
      />

      <CitationModal
        citation={activeCitation}
        onClose={() => setActiveCitation(null)}
      />
    </div>
  );
}
