export async function getReportById( id : string ) {
	const report = await fetch(`http://localhost:3003/reporting/${id}`, {
						headers: {
							"org-id": "018f2d90-3b41-7e2a-9f12-111122223333",
						}
	});

	if (!report.ok) {
		throw new Error("Failed to get reports");
	}

	return report.json();
}