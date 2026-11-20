"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  PromptInput,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/ui/prompt-input";

interface ChatInputProps {
  onSend: (text: string) => void;
  isLoading: boolean;
  onQuickQuery?: (query: string) => void;
}

export function ChatInput({ onSend, isLoading, onQuickQuery }: ChatInputProps) {
  const [input, setInput] = useState("");

  const handleSubmit = () => {
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
    <footer className="chat-footer">
      {onQuickQuery && (
        <div className="chat-quick-list">
          {quickPrompts.map((prompt, i) => (
            <Button
              key={i}
              type="button"
              variant="secondary"
              size="xs"
              disabled={isLoading}
              onClick={() => onQuickQuery(prompt)}
              className="chat-quick"
            >
              {prompt}
            </Button>
          ))}
        </div>
      )}

      <PromptInput
        value={input}
        onValueChange={setInput}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        disabled={isLoading}
        maxHeight={160}
        className="chat-input"
      >
        <PromptInputTextarea
          placeholder={
            isLoading
              ? "AI is generating answer..."
              : "Ask anything about this report..."
          }
        />
        <PromptInputActions className="chat-send">
          <Button
            type="button"
            size="icon-sm"
            onClick={handleSubmit}
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <Send />}
          </Button>
        </PromptInputActions>
      </PromptInput>
    </footer>
  );
}
