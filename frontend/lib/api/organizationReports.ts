import { authHeaders } from "@/lib/auth";

export async function getReports() {

	const response = await fetch("/api/reporting", {
		headers: authHeaders(),
	});

	if (response.status === 404) {
		return []; // reporting-svc answers 404 when the organization has no jobs yet
	}
	if (!response.ok) {
		throw new Error("Failed to get reports");
	}

	return response.json();
}