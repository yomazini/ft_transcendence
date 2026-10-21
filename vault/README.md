# HashiCorp Vault

## Description

`HashiCorp Vault` is used to securely store and manage application secrets, such as database credentials, API keys, and session secrets. It provides controlled access to secrets through authentication and policies, allowing services to retrieve only the credentials they need.

## Instruction

### Setup

1. **Environment**: copy `.env.example` to `.env` and replace every placeholder with a real value. Never commit `.env`.
2. **Persistent data**: the container needs three mounts.

   | Mount | Type | Container path | Contents |
   |---|---|---|---|
   | `vault-data` | named volume | `/vault` | Vault data and config |
   | `./vault/secret` | bind mount | `/secret` | `credentials.json` (unseal key and root token) |
   | `./vault/creds` | bind mount | `/credentials` | one `{service-name}.json` per service (AppRole login data) |

3. **Run**:

   ```sh
   docker run --name vault -d \
     --cap-add IPC_LOCK \
     --env-file .env \
     -v vault-data:/vault \
     -v ./vault/secret:/secret \
     -v ./vault/creds:/credentials \
     vault
   ```

   - `--cap-add IPC_LOCK` lets Vault lock its memory so secrets are not swapped to disk.
   - Add `-p 8200:8200` only if you need to reach Vault from the host. Services on the same Docker network reach it at `http://vault:8200`.
   - In `.env`, write values without quotes (`KEY=value`), because `--env-file` keeps quotes as part of the value.

**What happens on every start:** Vault initializes itself (first start only), unseals itself, writes the policies and AppRole roles, seeds the secrets from `.env`, and creates a fresh login file for each service.

> [!IMPORTANT]
> Secrets are seeded **only if they do not exist yet**. Changing a value in `.env` later does not update the secret already stored in Vault. To change one, write it by hand with `vault kv put secret/<service> ...`, or reset (see below).

**Reset:** delete the container, the volume, **and** both folders together. Deleting only some of them leaves credential files that no longer match Vault.

```sh
docker rm -f vault
docker volume rm vault-data
sudo rm -rf vault/secret/* vault/creds/*
```

> [!WARNING]
> `credentials.json` in the `/secret` mount holds the unseal key and root token. Keep it separate from the `vault-data` volume: never commit it, and never back it up together with the data. Anyone holding both can unseal Vault.

### Configuration

- Server settings: `vault/conf/server.hcl`
- Service policies: `vault/conf/policies/{service-name}.hcl`

Changes to either file apply after you rebuild the image and restart the container.

These are all the secret paths and what each one holds:

| Path | Key | Source variable |
|---|---|---|
| `secret/data/scraper-svc` | `sessions` | `REDDIT_SESSIONS` |
| `secret/data/database` | `user` | `POSTGRES_USER` |
| | `password` | `POSTGRES_PASSWORD` |
| `secret/data/auth-svc` | `jwt_secret` | `JWT_SECRET` |
| | `forty_two_client_id` | `FORTYTWO_CLIENT_ID` |
| | `forty_two_client_secret` | `FORTYTWO_CLIENT_SECRET` |
| | `mail_user` | `MAIL_USER` |
| | `mail_pass` | `MAIL_PASS` |
| `secret/data/analysis-svc` | `gemini_api_key` | `GEMINI_API_KEY` |
| | `openrouter_api_key` | `OPENROUTER_API_KEY` |
| `secret/data/grafana` | `password` | `GRAFANA_ADMIN_PASSWORD` |
| `secret/data/minio` | `user` | `MINIO_ROOT_USER` |
| | `password` | `MINIO_ROOT_PASSWORD` |

Each service can read **only its own path**. Reading any other path returns `permission denied`.

### How to use

1. **Mount your login file** read-only into your service. Vault creates it as `{service-name}.json` in the credentials bind mount. It contains `role_id` and `secret_id`, which is exactly the body the login request needs.

   ```yaml
   services:
     database:
       volumes:
         - ./vault/creds/database.json:/run/vault/login.json:ro
   ```

   Services start only after Vault is healthy, so the file already exists when they start.

2. **Log in** by posting the file content to `http://vault:8200/v1/auth/approle/login`. The only part of the response you need is `client_token`:

   ```json
   {
     "auth": {
       "client_token": "<CLIENT_TOKEN>"
     }
   }
   ```

3. **Read your secrets** with a `GET` to `http://vault:8200/v1/{secret path}` and the header `X-Vault-Token: <CLIENT_TOKEN>`. The values are under `data.data`:

   ```json
   {
     "data": {
       "data": {
         "<secret>": "<value>"
       }
     }
   }
   ```

Any HTTP client in your service's language works, since both requests are plain HTTP with JSON.

**Rules for services:**

- **Re-read the file every time you log in.** The `secret_id` inside it is replaced about every hour and on every Vault restart. Do not cache the old value.
- **Tokens expire** after about 1 hour (4 hours at most). If a request returns `403`, log in again.
- **Retry the login** a few times with a short delay. Vault may be restarting or still starting up.
- A `permission denied` on a path you are not allowed to read is expected. Do not retry it.
- Never log the `secret_id`, the token, or the secret values.

## Documentation

- [Vault docs](https://developer.hashicorp.com/vault/docs)


## TODO

1. Add symmetric encryption option for more security
2. Switch to python for more security instead of bash