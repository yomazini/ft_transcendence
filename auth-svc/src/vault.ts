import fs from 'node:fs/promises'

const VAULT = process.env.VAULT_ADDR ?? 'http://vault:8200';

async function login(): Promise<string> {
	const { role_id, secret_id } = JSON.parse(
		await fs.readFile('/run/vault/login.json', 'utf8'),
	);

	/** 
	 * POST /v1/auth/approle/login HTTP/1.1 · Host: vault:8200 · content-type: application/json 
	 * (empty line)
	 * body {
	 * 	{"role_id":"---","secret_id":"---"}
	 * }
	*/
	const res = await fetch(`${VAULT}/v1/auth/approle/login`, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ role_id, secret_id }),
	});
	/**
	 * HTTP/1.1 200 OK . Content-Type: application/json
	 * (empty line)
	 * {"auth":{"client_token":"hvs.CAES…","lease_duration":3600,…}}
	 */

	if (!res.ok) { throw new Error(`vault login ${res.status}`)};
	return (await res.json()).auth.client_token;
};

async function read(path: string, token: string) {
	/**
	 * GET /v1/secret/data/auth-svc HTTP/1.1 · Host: vault:8200 · X-Vault-Token: hvs.CAES…
	 * (no body)
	 */
	const res = await fetch(`${VAULT}/v1/secret/data/${path}`, {
		headers: { 'X-Vault-Token': token },
	});

	/**
	 * HTTP/1.1 200 OK · Content-Type: application/json
	 * (empty line)
	 * { "request_id": "9f…", "lease_duration": 0, "data": { "data": { "forty_two_client_id": 	 	"u-s4t2…", "forty_two_client_secret": "s-s4t2…",
	 */
	if (!res.ok) { throw new Error(`Vault read ${path} ${res.status}`)};
	return (await res.json()).data.data as Record<string, string>;
}

export async function loadVaultSecrets() {
	const client_token = await login();
	const auth = await read('auth-svc', client_token); // FORTYTWO_CLIENT_ID, FORTYTWO_CLIENT_SECRET, MAIL_USER, MAIL_PASS
	const gateway = await read('gateway-svc', client_token); // JWT_SECRET
	const db = await read('database', client_token); // DATABASE_URL

	process.env.JWT_SECRET = gateway.jwt_secret;

	process.env.FORTYTWO_CLIENT_ID = auth.forty_two_client_id;
	process.env.FORTYTWO_CLIENT_SECRET = auth.forty_two_client_secret;
	process.env.MAIL_USER = auth.mail_user;
	process.env.MAIL_PASS = auth.mail_pass;
	process.env.STRIPE_SECRET_KEY = auth.stripe_secret_key;

	// URL = postgresql://USER:PASSWORD@HOST:PORT/DBNAME
	process.env.DATABASE_URL = `postgresql://${db.user}:${encodeURIComponent(db.password)}@postgres:5432/${db.database}`;
	/** @MEHDIJAD @note encodeURIComponent: a password with @ : / # would break the URL (e.g. "p@ss" → "p%40ss") */
}







