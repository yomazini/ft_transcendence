"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getToken } from "@/lib/auth";
import { io } from "socket.io-client";

import { listJobs, type JobItem, type JobStatus } from "@/lib/api/jobs";

interface JobEvent {
  job_id: string;
  status: JobStatus;
  error?: string;
}

/** The organization's jobs, kept up to date live: every `job:update` event from
 *  gateway-svc changes the status of the matching row without reloading the list. */
export function useJobsLive() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["jobs"],
    queryFn: listJobs,
  });

  useEffect(() => {
    const socket = io(
      process.env.NEXT_PUBLIC_GATEWAY_URL || window.location.origin,
      {
        transports: ["websocket", "polling"],
        auth: { token: getToken() },
      },
    );

    socket.io.on("reconnect", () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    });

    socket.on("job:update", (event: JobEvent) => {
      const jobs = queryClient.getQueryData<JobItem[]>(["jobs"]);
      if (!jobs?.some((job) => job.id === event.job_id)) {
        queryClient.invalidateQueries({ queryKey: ["jobs"] });
        return;
      }
      queryClient.setQueryData<JobItem[]>(["jobs"], (old) =>
        old?.map((job) =>
          job.id === event.job_id ? { ...job, status: event.status } : job,
        ),
      );
      if (event.status === "done" || event.status === "failed") {
        queryClient.invalidateQueries({ queryKey: ["reports"] });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [queryClient]);

  return { jobs: data ?? [], loading: isLoading, error };
}
