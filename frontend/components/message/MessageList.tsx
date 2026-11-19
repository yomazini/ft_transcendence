import { ChatMessage, Citation } from "@/types/chat";
import { MessageBubble } from "./MessageBubble";
import { Sparkles } from "lucide-react";
import { Loader } from "@/components/ui/loader";
import { ChatContainerContent, ChatContainerRoot } from "../ui/chat-container";
import { ScrollButton } from "../ui/scroll-button";

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
  return (
    <ChatContainerRoot className="relative flex-1 bg-slate-50/60">
      <ChatContainerContent className="gap-4 p-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 text-gray-500 my-auto">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 shadow-inner">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-gray-800 text-sm mb-1">
              Reddit Intelligence Assistant
            </h4>
            <p className="text-xs text-gray-500 max-w-[240px] leading-relaxed">
              Ask any question about this competitor report. The AI will
              retrieve and cite verified Reddit comments.
            </p>
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            onCitationClick={onCitationClick}
          />
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-gray-500 text-xs italic">
            <Loader variant="typing" size="sm" />
            <span>Querying pgvector & synthesizing answer</span>
          </div>
        )}
      </ChatContainerContent>

      <div className="absolute bottom-4 right-4">
        <ScrollButton />
      </div>
    </ChatContainerRoot>
  );
}
