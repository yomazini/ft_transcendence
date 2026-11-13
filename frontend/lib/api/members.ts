import { authHeaders, type Role } from "@/lib/auth";

/** Member routes of auth-svc (nginx /api/orgs/ -> auth-svc). The org id must be the
 *  caller's own: auth-svc answers 404 for any other, and 403 to a non-Admin changing things. */
export interface Member {
	id: string;
	email: string;
	role: Role;
	created_at: string;
}

async function send<T>(path: string, init: RequestInit = {}): Promise<T> {
	const response = await fetch(path, {
		...init,
		headers: { "Content-Type": "application/json", ...authHeaders(), ...(init.headers ?? {}) },
	});
	if (response.status === 204) return undefined as T;
	const data = await response.json().catch(() => null);
	if (!response.ok) {
		const message = Array.isArray(data?.message) ? data.message.join(", ") : data?.message;
		throw new Error(message ?? `Request failed (${response.status})`);
	}
	return data as T;
}

export const getMembers = (orgId: string) => send<Member[]>(`/api/orgs/${orgId}/members`);

export const inviteMember = (orgId: string, email: string, role: Role) =>
	send<{ message: string }>(`/api/orgs/${orgId}/members`, { method: "POST", body: JSON.stringify({ email, role }) });

export const changeRole = (orgId: string, userId: string, role: Role) =>
	send<{ id: string; role: Role }>(`/api/orgs/${orgId}/members/${userId}`, { method: "PATCH", body: JSON.stringify({ role }) });

export const removeMember = (orgId: string, userId: string) =>
	send<void>(`/api/orgs/${orgId}/members/${userId}`, { method: "DELETE" });

export interface Organization {
	id: string;
	name: string;
	description: string;
	created_at?: string;
}

export const getOrg = (orgId: string) => send<Organization>(`/api/orgs/${orgId}`);

export const updateOrg = (orgId: string, body: { name?: string; description?: string }) =>
	send<Organization>(`/api/orgs/${orgId}`, { method: "PATCH", body: JSON.stringify(body) });

export const deleteOrg = (orgId: string) =>
	send<void>(`/api/orgs/${orgId}`, { method: "DELETE" });
