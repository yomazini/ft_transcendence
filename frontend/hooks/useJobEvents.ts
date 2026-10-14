import { useEffect, useState } from "react";
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

  useEffect(() => {
    // Same origin as the page: nginx forwards /socket.io/ to gateway-svc.
    const gatewayUrl =
      process.env.NEXT_PUBLIC_GATEWAY_URL || window.location.origin;

    const socket: Socket = io(gatewayUrl, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
    });

    const handleEvent = (data: JobEventPayload) => {
      if (!targetJobId || data.job_id === targetJobId) {
        setStatus(data.status);
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
  }, [targetJobId]);

  return { status, reportId, lastError };
}
