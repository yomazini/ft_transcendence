export async function getReports() {

	const response = await fetch("http://localhost:3003/reporting", {
		headers: {
			"org-id": "018f2d90-3b41-7e2a-9f12-111122223333",
		},
	});

	if (!response.ok) {
		throw new Error("Failed to get reports");
	}

	return response.json();
}