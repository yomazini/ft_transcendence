export type ServiceStatus = "healthy" | "unhealthy" | "unavailable";

export interface ServiceItem {
	status: ServiceStatus;
	service: string;
}

export async function getStatus(): Promise<ServiceItem[]> {
	const response = await fetch("/api/status");
	if (!response.ok) {
		throw new Error(`Could not load status (${response.status})`);
	}
	return response.json();
}
