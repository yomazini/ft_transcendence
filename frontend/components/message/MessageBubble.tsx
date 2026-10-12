import { ChatMessage, Citation } from "@/types/chat";
import { Bot, User, FileText } from "lucide-react";

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
    <div
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"} items-start`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white shadow-sm ${
          isUser ? "bg-blue-600" : "bg-slate-800"
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4" />
        ) : (
          <Bot className="w-4 h-4 text-cyan-400" />
        )}
      </div>

      <div
        className={`flex flex-col max-w-[82%] ${isUser ? "items-end" : "items-start"}`}
      >
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
            isUser
              ? "bg-blue-600 text-white rounded-tr-none"
              : "bg-white text-gray-800 border border-gray-200/80 rounded-tl-none"
          }`}
        >
          <div className="whitespace-pre-wrap font-sans">{message.content}</div>

          {!isUser && message.citations && message.citations.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-gray-100 flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Sources Retrieved ({message.citations.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {message.citations.map((c, idx) => (
                  <button
                    key={c.id || idx}
                    onClick={() => onCitationClick(c)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-gray-700 border border-gray-200 hover:border-blue-200 transition-all cursor-pointer group"
                    title={`Click to inspect Reddit comment by u/${c.author}`}
                  >
                    <FileText className="w-3 h-3 text-gray-400 group-hover:text-blue-600" />
                    <span>Source #{idx + 1}</span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      ({c.upvotes}↑)
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <span className="text-[10px] text-gray-400 mt-1 px-1">
          {message.timestamp}
        </span>
      </div>
    </div>
  );
}