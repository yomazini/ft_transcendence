export async function DeleteReportById( id : string ) {

	const response = await fetch(`http://localhost:3003/reporting/${id}`, {
		method: "DELETE",
		headers: {
			"org-id": "018f2d90-3b41-7e2a-9f12-111122223333",
		},
	});

	if (!response.ok) {
		throw new Error("Failed to Delet reports");
	}
	
	return (response.json());
}