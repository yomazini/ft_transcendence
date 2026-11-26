import fs from 'node:fs/promises'

const VAULT = process.env.VAULT_ADDR ?? 'http://vault:8200';

async function login(): Promise<string> {
	const { role_id, secret_id } = JSON.parse(
		await fs.readFile('/run/vault/login.json', 'utf8'),
	);

	const res = await fetch(`${VAULT}/v1/auth/approle/login`, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ role_id, secret_id }),
	});

	if (!res.ok) { throw new Error(`vault login ${res.status}`)};
	return (await res.json()).auth.client_token;
};

async function read(path: string, token: string) {
	const res = await fetch(`${VAULT}/v1/secret/data/${path}`, {
		headers: { 'X-Vault-Token': token },
	});

	if (!res.ok) { throw new Error(`Vault read ${path} ${res.status}`)};
	return (await res.json()).data.data as Record<string, string>;
}

export async function loadVaultSecrets() {
	const client_token = await login();
	const auth = await read('auth-svc', client_token);
	const gateway = await read('gateway-svc', client_token);
	const db = await read('database', client_token);

	process.env.JWT_SECRET = gateway.jwt_secret;

	process.env.FORTYTWO_CLIENT_ID = auth.forty_two_client_id;
	process.env.FORTYTWO_CLIENT_SECRET = auth.forty_two_client_secret;
	process.env.MAIL_USER = auth.mail_user;
	process.env.MAIL_PASS = auth.mail_pass;

	process.env.SECRET_KEY = auth.secret_key;
	process.env.SECRET_STRIP_WEBHOOKS = auth.secret_strip_webhooks;

	process.env.DATABASE_URL = `postgresql://${db.user}:${encodeURIComponent(db.password)}@postgres:5432/${db.database}`;
}

