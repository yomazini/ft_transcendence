import { ReportDetails } from "@/app/types/report";

export async function getReportById(id: string): Promise<ReportDetails> {
	const response = await fetch(`http://localhost:3003/reporting/${id}`, {
		headers: {
			"org-id": "018f2d90-3b41-7e2a-9f12-111122223333",
		},
	});

	if (!response.ok) {
		throw new Error("Failed to get report");
	}

	return response.json();
}