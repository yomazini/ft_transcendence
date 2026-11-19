"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { listJobs } from "@/lib/api/jobs";

/** The job whose report the dashboard shows: `?job=<id>` in the URL, otherwise the
 *  newest finished job of the organization (null when there is none yet). */
export function useSelectedJobId(): string | null {
	const fromUrl = useSearchParams().get("job");
	const { data } = useQuery({ queryKey: ["jobs"], queryFn: listJobs, retry: false});
	if (fromUrl) return fromUrl;
	return data?.find((job) => job.status === "done")?.id ?? null;
}
