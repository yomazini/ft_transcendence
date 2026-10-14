export interface Citation {
  id: string;
  job_id: string;
  text: string;
  author: string;
  upvotes: number;
  sentiment_score: number | null;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  timestamp: string;
}

export interface RagQueryRequest {
  job_id: string;
  query: string;
}

export interface RagQueryResponse {
  answer: string;
  citations: Citation[];
}

export interface FloatingChatWidgetProps {
  jobId?: string;
  apiEndpoint?: string;
  initialMessage?: string;
}
