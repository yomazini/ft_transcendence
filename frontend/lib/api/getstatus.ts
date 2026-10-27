import { authHeaders } from "@/lib/auth";

export type ServiceStatus = "healthy" | "unhealthy";

export interface ServiceItem {
	status: ServiceStatus;
	service: string;
}

export async function getStatus() : Promise<ServiceItem[]> { 
	//
	// const response = await fetch("/api/status", { headers: authHeaders() });
	// if (!response.ok) {
	// 	throw new Error(`Could not load status (${response.status})`);
	// }
	// return response.json();
	const services : ServiceItem[] = [
  { "service": "gateway-svc", "status": "healthy" },
  { "service": "auth-svc", "status": "healthy" },
  { "service": "reporting-svc", "status": "unhealthy" },
  { "service": "scraper-svc", "status": "healthy" },
  { "service": "analysis-svc", "status": "healthy" }
]

	return (services)
}
