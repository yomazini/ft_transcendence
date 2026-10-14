import { NextRequest, NextResponse } from "next/server";
import { RagQueryRequest, RagQueryResponse } from "@/types/chat";

export async function POST(req: NextRequest) {
  try {
    const body: RagQueryRequest = await req.json();

    if (!body.job_id || !body.query) {
      return NextResponse.json(
        { error: "Missing required fields: job_id and query" },
        { status: 400 },
      );
    }

    const backendUrl =
      process.env.ANALYSIS_SVC_URL ||
      process.env.NEXT_PUBLIC_ANALYSIS_URL ||
      "http://localhost:8001";

    const response = await fetch(`${backendUrl}/rag/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { error: `Backend service error: ${errText}` },
        { status: response.status },
      );
    }

    const data: RagQueryResponse = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
