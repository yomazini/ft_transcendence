function getFileName(res: Response, fallback = 'download'): string {
	const cd = res.headers.get('Content-Disposition');

	console.log(res.headers.get('Content-Disposition'));
	
	if (!cd) return fallback;
	
	// filename*=UTF-8''name.csv (encoded, used for non-ASCII names)
	const utf8 = cd.match(/filename\*=UTF-8''([^;]+)/i);
	if (utf8) return decodeURIComponent(utf8[1]);

	// filename="name.csv" or filename=name.csv
	const plain = cd.match(/filename="?([^";]+)"?/i);
	return plain ? plain[1] : fallback;
}

export async function exportReport( id : string, format : string) {
	const response = await fetch(`http://localhost:3003/reporting/${id}/export?format=${format}`, {
		headers: {
			"org-id": "018f2d90-3b41-7e2a-9f12-111122223333",
		}
	})

	if (!response.ok) {
		throw new Error("you can't export");
	}

	const fileName = getFileName(response);
	const blob = await response.blob();          // blob.type = the Content-Type from the server
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