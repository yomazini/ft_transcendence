import { authHeaders } from "@/lib/auth";
import { ReportDetails } from "@/app/types/report";

export async function getReportById(id: string): Promise<ReportDetails> {
	const response = await fetch(`/api/reporting/${id}`, {
		headers: authHeaders(),
	});

	if (!response.ok) {
		throw new Error("Failed to get report");
	}

	return response.json();
}