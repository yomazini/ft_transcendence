import { authHeaders } from "@/lib/auth";
import { ReportDetails } from "@/app/types/report";
import { toast } from "sonner";

export async function getReportById(id: string): Promise<ReportDetails> {
	const response = await fetch(`/api/reporting/${id}`, {
		headers: authHeaders(),
	});

	if (!response.ok) {
		toast.error("Failed to get report", {
			description: "Failed to get report",
			duration: 4000,
		});
		throw new Error("Failed to get report");
	}

	toast.success("Report loaded successfully", {
		duration: 3000,
	});
	return (await response.json());
}