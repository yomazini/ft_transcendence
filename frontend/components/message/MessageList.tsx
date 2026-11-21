import { ChatMessage, Citation } from "@/types/chat";
import { MessageBubble } from "./MessageBubble";
import { Sparkles } from "lucide-react";
import { Loader } from "@/components/ui/loader";
import {
  ChatContainerContent,
  ChatContainerRoot,
} from "@/components/ui/chat-container";
import { ScrollButton } from "@/components/ui/scroll-button";

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
    <ChatContainerRoot className="chat-scroll">
      <ChatContainerContent className="chat-content">
        {messages.length === 0 && (
          <div className="chat-empty">
            <div className="chat-empty-icon">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="chat-empty-title">Reddit Intelligence Assistant</h4>
            <p className="chat-empty-text">
              Ask any question about this competitor report. The AI will retrieve
              and cite verified Reddit comments.
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
          <div className="chat-loading">
            <Loader variant="typing" size="sm" />
            <span>Querying pgvector & synthesizing answer</span>
          </div>
        )}
      </ChatContainerContent>

      <div className="chat-scroll-button">
        <ScrollButton />
      </div>
    </ChatContainerRoot>
  );
}
