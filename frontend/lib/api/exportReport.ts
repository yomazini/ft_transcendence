import { authHeaders } from "@/lib/auth";

export async function exportReport( id : string | null, format : string) {
	if (id === null)
		throw new Error("you can't export ,you shod select job firs");
	const response = await fetch(`/api/reporting/${id}/export?format=${format}`, {
		headers: authHeaders(),
	})
	if (!response.ok) {
		throw new Error("you can't export");
	}

	const blob = await response.blob();
	const objectUrl = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = objectUrl;
	a.download = "download";
	document.body.appendChild(a);
	a.click();
	a.remove();
	setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
	return blob;
}