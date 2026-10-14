import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

export type JobStatus = "idle" | "queued" | "running" | "done" | "failed";

export interface JobEventPayload {
  job_id: string;
  status: "queued" | "running" | "done" | "failed";
  report_id?: string;
  error?: string;
}

export function useJobEvents(targetJobId?: string) {
  const [status, setStatus] = useState<JobStatus>("idle");
  const [reportId, setReportId] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [latestJobId, setLatestJobId] = useState<string | null>(null);

  const targetRef = useRef<string | undefined>(targetJobId);

  useEffect(() => {
    targetRef.current = targetJobId;
  }, [targetJobId]);

  useEffect(() => {
    const gatewayUrl =
      process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:3001";

    const socket: Socket = io(gatewayUrl, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 10,
    });

    const handleEvent = (data: JobEventPayload) => {
      const currentTarget = targetRef.current;
      if (!currentTarget || data.job_id === currentTarget) {
        setStatus(data.status);
        setLatestJobId(data.job_id);
        if (data.report_id) {
          setReportId(data.report_id);
        }
        if (data.error) {
          setLastError(data.error);
        }
      }
    };

    socket.on("job:queued", handleEvent);
    socket.on("job:running", handleEvent);
    socket.on("job:done", handleEvent);
    socket.on("job:failed", handleEvent);
    socket.on("job:update", handleEvent);

    return () => {
      socket.disconnect();
    };
  }, []);

  return { status, reportId, lastError, latestJobId };
}
