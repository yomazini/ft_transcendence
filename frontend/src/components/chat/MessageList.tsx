import { ChatMessage, Citation } from "@/types/chat";
import { MessageBubble } from "./MessageBubble";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { Bot, Sparkles } from "lucide-react";

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onCitationClick: (citation: Citation) => void;
}

export function MessageList({
  messages,
  isLoading,
  onCitationClick,
}: MessageListProps) {
  const bottomRef = useAutoScroll([messages, isLoading]);

  return (
    <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-slate-50/60">
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-center p-6 text-gray-500 my-auto">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 shadow-inner">
            <Sparkles className="w-6 h-6" />
          </div>
          <h4 className="font-semibold text-gray-800 text-sm mb-1">
            Reddit Intelligence Assistant
          </h4>
          <p className="text-xs text-gray-500 max-w-[240px] leading-relaxed">
            Ask any question about this competitor report. The AI will retrieve
            and cite verified Reddit comments.
          </p>
        </div>
      )}

      {messages.map((msg) => (
        <MessageBubble
          key={msg.id}
          message={msg}
          onCitationClick={onCitationClick}
        />
      ))}

      {isLoading && (
        <div className="flex gap-3 items-center text-gray-500 text-xs italic bg-white p-3 rounded-2xl rounded-tl-none border border-gray-200/60 w-fit shadow-sm">
          <div className="w-6 h-6 rounded-full bg-slate-800 text-cyan-400 flex items-center justify-center shrink-0">
            <Bot className="w-3.5 h-3.5" />
          </div>
          <div className="flex gap-1 items-center">
            <span>Querying pgvector & synthesizing answer</span>
            <span className="flex gap-1 ml-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" />
            </span>
          </div>
        </div>
      )}

      <div ref={bottomRef} className="h-1" />
    </main>
  );
}
