import { ChatMessage, Citation } from "@/types/chat";
import { Bot, User, FileText } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Message, MessageContent } from "@/components/ui/message";

interface MessageBubbleProps {
  message: ChatMessage;
  onCitationClick: (citation: Citation) => void;
}

export function MessageBubble({
  message,
  onCitationClick,
}: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <Message
      className={isUser ? "chat-message chat-message-user" : "chat-message"}
    >
      <Avatar className="chat-avatar">
        <AvatarFallback className="chat-avatar-fallback">
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </AvatarFallback>
      </Avatar>

      <div className="chat-message-body">
        <MessageContent markdown={!isUser} className="chat-bubble">
          {message.content}
        </MessageContent>

        {!isUser && message.citations && message.citations.length > 0 && (
          <div className="chat-citations">
            <span className="chat-citations-label">
              Sources Retrieved ({message.citations.length})
            </span>
            <div className="chat-citations-list">
              {message.citations.map((c, idx) => (
                <Button
                  key={c.id}
                  type="button"
                  variant="secondary"
                  size="xs"
                  onClick={() => onCitationClick(c)}
                  className="chat-citation"
                  title={`Click to inspect Reddit comment by u/${c.author}`}
                >
                  <FileText className="w-3 h-3" />
                  <span>Source #{idx + 1}</span>
                  <span className="chat-citation-index">({c.upvotes}↑)</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        <span className="chat-timestamp">{message.timestamp}</span>
      </div>
    </Message>
  );
}
