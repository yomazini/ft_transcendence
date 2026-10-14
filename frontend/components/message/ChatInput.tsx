import { useState, FormEvent } from "react";
import { Send, Loader2 } from "lucide-react";

interface ChatInputProps {
  onSend: (text: string) => void;
  isLoading: boolean;
  onQuickQuery?: (query: string) => void;
}

export function ChatInput({ onSend, isLoading, onQuickQuery }: ChatInputProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isLoading) return;
    onSend(input.trim());
    setInput("");
  };

  const quickPrompts = [
    "Why are users complaining about pricing?",
    "What competitors are mentioned?",
    "Summarize top customer pain points",
  ];

  return (
    <footer className="p-3 bg-white border-t border-gray-200 flex flex-col gap-2">
      {onQuickQuery && (
        <div className="flex gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              type="button"
              disabled={isLoading}
              onClick={() => onQuickQuery(prompt)}
              className="shrink-0 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors disabled:opacity-50 text-left"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2 items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          placeholder={isLoading ? "AI is generating answer..." : "Ask anything about this report..."}
          className="flex-1 bg-slate-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white p-2.5 rounded-xl shadow-sm transition-all flex items-center justify-center shrink-0 cursor-pointer disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>
    </footer>
  );
}
