import fs from 'node:fs/promises';

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
  if (!res.ok) throw new Error(`Vault login ${res.status}`);
  return (await res.json()).auth.client_token;
}

async function read(path: string, token: string) {
  const res = await fetch(`${VAULT}/v1/secret/data/${path}`, {
    headers: { 'X-Vault-Token': token },
  });
  if (!res.ok) throw new Error(`Vault read ${path} ${res.status}`);
  return (await res.json()).data.data as Record<string, string>;
}

export async function loadVaultSecrets() {
  const token = await login();
  const db = await read('database', token);
  const gw = await read('gateway-svc', token);
  process.env.POSTGRES_PASSWORD = db.password;
  process.env.JWT_SECRET = gw.jwt_secret;
}
