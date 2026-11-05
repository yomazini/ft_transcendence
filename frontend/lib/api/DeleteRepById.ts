import { authHeaders } from "@/lib/auth";

export async function DeleteReportById(id: string) {
	const response = await fetch(`/api/jobs/${id}`, {
		method: "DELETE",
		headers: authHeaders(),
	});

	if (!response.ok) {
		throw new Error(`Failed to delete report (${response.status})`);
	}
}