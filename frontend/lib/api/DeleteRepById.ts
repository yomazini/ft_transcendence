import { authHeaders } from "@/lib/auth";
import { toast } from "sonner";

export async function DeleteReportById(id: string) {
	const response = await fetch(`/api/jobs/${id}`, {
		method: "DELETE",
		headers: authHeaders(),
	});

	if (!response.ok) {
		toast.error("Failed To Delete report", {
			duration: 3000,
		});
		throw new Error(`Failed to delete report (${response.status})`);
	}
	toast.success("Success", {
		description: "You delet report",
		duration: 4000,
	});
}