export type Role = "Admin" | "Analyst" | "Viewer";

/** @note @MEHDIJAD describes the shape of a user object — matches contracts/openapi.yaml's User schema exactly: id, org_id, email, role are required; created_at is optional (the ?). */
export interface User {
	id: string;
	org_id: string;
	email: string;
	role: Role;
	created_at?: string;
}

export interface AuthResponse {
	access_token: string;
	token_type: string;
	user: User;
}

export const MIN_PASSWORD_LENGTH = 8;
export const FORTY_TWO_LOGIN_URL = "/api/auth/42";

/** Constants */

const TOKEN_KEY = "access_token";
/** @note 🤖 this means "text@text.text with no spaces", such as a@b.co.  */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* Validation (the backend must validate again, this is only fast feedback) */
export function isValidEmail(email: string): boolean {
	return EMAIL_PATTERN.test(email);
}

/* ⚠️ API calls */

export function login(
	email: string,
	password: string,
): Promise<AuthResponse> /** this is a return type. It says "this function returns a Promise that will eventually deliver an AuthResponse" */
{
	/** @MEHDIJAD @note ⚠️ it calls a helper post that sends a POST request to a URL with a JSON body, and returns the reply as a Promise. <AuthResponse> tells TypeScript what shape that reply has. */
	return post<AuthResponse>("/api/auth/login", { email, password });

	/** @note  shorthand property syntax: since the variables are already named email and password, this is equivalent to writing { email: email, password: password }. */
}

export function register(
	email: string,
	password: string,
	org_name: string,
	org_description: string,
): Promise<AuthResponse> 
{
	return post<AuthResponse>("/api/auth/signup", {
		email,
		password,
		org_name,
		org_description,
	});
}

export function completeFortyTwoSignup(
	signup_token: string,
	org_name: string,
	org_description: string,
	password: string,
): Promise<AuthResponse> {
	return post<AuthResponse>('/api/auth/42/complete', {
		signup_token,
		org_name,
		org_description: org_description,
		password,
	});
}

/** @note the invited person has no account yet: the invite token from the email link is their proof, and the account is created by this call. */
export function acceptInvite(
	invite_token: string,
	password: string,
): Promise<AuthResponse> {
	return post<AuthResponse>("/api/auth/invite/accept", {
		invite_token,
		password,
	});
}

export function forgotPassword(email: string): Promise<{ message: string }> {
	return post<{ message: string }>("/api/auth/forgot-password", { email });
}

export function resetPassword(
	reset_token: string,
	new_password: string,
): Promise<{ message: string }> {
	return post<{ message: string }>("/api/auth/reset-password", {
		reset_token,
		new_password,
	})
}

/** ⚠️ the one real network call */
async function post<T>(path: string, body: unknown): Promise<T> {
	let response: Response; /** @note Response is a built-in browser type describing a fetch reply. */
	try {
		/** fetch is a built-in browser function that sends an HTTP request. */
		response = await fetch(path, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});
	} catch {
		throw new Error("Could not reach the server. Please try again.");
	}
	/**
	 * this catch only fires for network-level failures: DNS resolution failure, the server being completely unreachable, the browser being offline. A normal HTTP error response (401, 404, 500) does not throw here — fetch resolves successfully even for error status codes; that's handled separately below.
	 */

	/** — parses the response body as JSON, itself returning a Promise, hence the await. */
	const data = await response.json().catch(() => null);
	if (!response.ok) {
		throw new Error(data?.message ?? "Something went wrong. Please try again.");
	}
	return data as T;
}

/** Token storage */
export function saveToken(token: string, remember: boolean): void {
	localStorage.removeItem(TOKEN_KEY);
	sessionStorage.removeItem(TOKEN_KEY);
	const storage = remember ? localStorage : sessionStorage;
	storage.setItem(TOKEN_KEY, token);
}

/** Header to send with every request to a protected route. */
export function authHeaders(): Record<string, string> {
	const token = getToken();
	return token ? { Authorization: `Bearer ${token}` } : {};
}

/** The logged-in user, read from auth-svc (GET /api/auth/me). */
export async function getMe(): Promise<User> {
	const response = await fetch("/api/auth/me", { headers: authHeaders() });
	if (!response.ok) {
		throw new Error("Not logged in");
	}
	return response.json();
}

/** Log out: auth-svc blocks the token, then the browser forgets it.
 *  The token is removed even if the server call fails, so the user is never stuck. */
export async function logout(): Promise<void> {
	try {
		await fetch("/api/auth/logout", { method: "POST", headers: authHeaders() });
	} finally {
		clearToken();
	}
}

/** POST /api/auth/change-password — needs the login token. */
export async function changePassword(current_password: string, new_password: string): Promise<void> {
	const response = await fetch("/api/auth/change-password", {
		method: "POST",
		headers: { "Content-Type": "application/json", ...authHeaders() },
		body: JSON.stringify({ current_password, new_password }),
	});

	const data = await response.json().catch(() => null);
	if (!response.ok) {
		throw new Error(Array.isArray(data?.message) ? data.message.join(", ") : data?.message ?? "Could not change the password");
	}
}

/** PATCH /api/auth/email — needs the login token and the current password. */
export async function changeEmail(new_email: string, password: string): Promise<{ id: string; email: string }> {
	const response = await fetch("/api/auth/email", {
		method: "PATCH",
		headers: { "Content-Type": "application/json", ...authHeaders() },
		body: JSON.stringify({ new_email, password }),
	});

	const data = await response.json().catch(() => null);
	if (!response.ok) {
		throw new Error(Array.isArray(data?.message) ? data.message.join(", ") : data?.message ?? "Could not change the email");
	}
	return data;
}

export async function exportMyData(): Promise<void> {
	const response = await fetch("/api/auth/gdpr/export", {
		method: "POST",
		headers: authHeaders(),
	});

	const data = await response.json().catch(() => null);

	if (!response.ok) {
		throw new Error(data?.message ?? "Could not export your data");
	}

	const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = `insightflow-my-data-${new Date().toISOString().slice(0, 10)}.json`;
	document.body.appendChild(link);
	link.click();
	link.remove();
	URL.revokeObjectURL(url);
}

export async function deleteMyData(password: string): Promise<void> {
	const response = await fetch("/api/auth/gdpr/delete", {
		method: "DELETE",
		headers: {  "Content-Type": "application/json" , ...authHeaders() },
		body: JSON.stringify({ password }),
	});

	if (!response.ok) {
		const data = await response.json().catch(() => null);
		throw new Error(Array.isArray(data?.message) ? data.message.join(", ") : data?.message ?? "Could not delete the account");
	}
	localStorage.removeItem(TOKEN_KEY);
	sessionStorage.removeItem(TOKEN_KEY);
}

export function getToken(): string | null {
	return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);
}

export function clearToken(): void {
	localStorage.removeItem(TOKEN_KEY);
	sessionStorage.removeItem(TOKEN_KEY);
}




