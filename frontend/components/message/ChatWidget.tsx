import { useState } from "react";
import {
  ChatMessage,
  Citation,
  RagQueryRequest,
  RagQueryResponse,
} from "@/types/chat";
import { ChatHeader } from "./ChatHeader";
import { ChatInput } from "./ChatInput";
import { MessageList } from "./MessageList";
import { CitationModal } from "./CitationModal";

interface ChatWidgetProps {
  jobId?: string;
  apiEndpoint?: string;
  onClose?: () => void;
}

export function ChatWidget({
  jobId = "demo-job-42",
  apiEndpoint = "/api/chat",
  onClose,
}: ChatWidgetProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial-welcome",
      role: "assistant",
      content:
        "Hello! I am your ft_transcendence RAG Assistant. Ask me anything about the customer sentiment, competitor threats, or pricing feedback in this report.",
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
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            job_id: jobId,
            query: queryText,
          } satisfies RagQueryRequest),
        });

        if (res.ok) {
          responseData = await res.json();
        } else {
          throw new Error(`API returned ${res.status}`);
        }
      } catch (err) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        responseData = generateMockRagResponse(jobId, queryText);
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
    } catch (error) {
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
    <div className="flex flex-col h-full bg-white relative">
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

function generateMockRagResponse(
  jobId: string,
  query: string,
): RagQueryResponse {
  return {
    answer: `Regarding "${query}": Based on customer feedback in Reddit threads for report #${jobId}, users express significant dissatisfaction regarding opaque auto-renewals and unexpected price increases. Multiple founders report switching to competitors due to better tier flexibility.`,

    citations: [
      {
        id: "c-101-uuid",
        job_id: jobId,
        text: "The unexpected $50/mo renewal caught me off guard. Their pricing page doesn't mention that the starter discount only lasts 3 months.",
        author: "saas_founder_42",
        upvotes: 94,
        sentiment_score: -0.76,
        created_at: "2026-08-24T12:00:00.000Z",
      },
      {
        id: "c-102-uuid",
        job_id: jobId,
        text: "We migrated our small agency to the competitor because they offer granular seat-based billing without annual lock-in.",
        author: "growth_lead_bob",
        upvotes: 48,
        sentiment_score: 0.62,
        created_at: "2026-08-25T14:30:00.000Z",
      },
    ],
  };
}