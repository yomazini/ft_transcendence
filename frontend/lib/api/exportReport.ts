export async function exportReport( id : string, format : string) {
	const response = await fetch(`http://localhost:3003/reporting/${id}/export?format=${format}`, {
		headers: {
			"org-id": "018f2d90-3b41-7e2a-9f12-111122223333",
		}
	})

	if (!response.ok) {
		throw new Error("you can't export");
	}

	const fileName = "download";
	const blob = await response.blob();
	const objectUrl = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = objectUrl;
	a.download = fileName;
	document.body.appendChild(a);
	a.click();
	a.remove();
	setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
	return response.json();
}