// Same-origin in production (nginx -> gateway). In dev, point this at nginx
// or the gateway explicitly with NEXT_PUBLIC_GATEWAY_URL.
const gateway = (process.env.NEXT_PUBLIC_GATEWAY_URL ?? "").replace(/\/$/, "");

export const RAG_ENDPOINT = `${gateway}/api/rag/query`;
