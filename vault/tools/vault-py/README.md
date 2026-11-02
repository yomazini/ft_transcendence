# HashiCorp Vault

## Description

`HashiCorp Vault` is used to securely store and manage application secrets, such as database credentials, API keys, and session secrets. It provides controlled access to secrets through authentication and policies, allowing services to retrieve only the credentials they need.

## Instruction

### Setup

1. **Environment**: copy `.env.example` to `.env` and fill in the variables your `config.json` uses (see [Configuration](#configuration)). Never commit `.env`. Vault stops at startup with an error if a variable referenced by a secret in `config.json` is empty. Variables that no secret references are ignored.
2. **Persistent data**: the container needs four mounts.

   | Mount | Type | Container path | Contents |
   |---|---|---|---|
   | `vault-data` | named volume | `/vault` | Vault data and config |
   | `./vault/secret` | bind mount | `/secret` | `credentials.json` (unseal key and root token) |
   | `./vault/creds` | bind mount | `/credentials` | one folder per service, `{service-name}/login.json` (AppRole login data) |
   | `./vault/audit` | bind mount | `/audit` | `audit.log` (Vault audit log) |

3. **Run**:

   ```sh
   docker run --name vault -d \
     --cap-add IPC_LOCK \
     --env-file .env \
     -v vault-data:/vault \
     -v ./vault/secret:/secret \
     -v ./vault/creds:/credentials \
     -v ./vault/audit:/audit \
     vault
   ```

   - `--cap-add IPC_LOCK` lets Vault lock its memory so secrets are not swapped to disk.
   - Add `-p 8200:8200` only if you need to reach Vault from the host. Services on the same Docker network reach it at `http://vault:8200`.
   - In `.env`, write values without quotes (`KEY=value`), because `--env-file` keeps quotes as part of the value.

**What happens on every start:** a Python setup program (`vault-py`) runs next to the Vault server and does the following in order:

1. Initializes Vault (first start only) and unseals it.
2. Writes the policies and AppRole roles from `config.json`, and creates a fresh login file for each role.
3. Seeds the secrets from the environment.
4. Enables the file audit log (`/audit/audit.log` in the container, `vault/audit/audit.log` on the host).
5. Marks Vault as ready (the healthcheck waits for this).

It then keeps running and rotates the login files: every quarter of `secret_id_ttl` (1 hour by default) it creates a new `secret_id` for each role and revokes the previous one.

> [!IMPORTANT]
> Secrets are seeded **only if they do not exist yet**. Changing a value in `.env` later does not update the secret already stored in Vault. To change one, write it by hand with `vault kv put secret/<name> ...`, or reset (see below).

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
- Secrets, policies, roles and setup settings: `vault/conf/config.json`

Changes to either file apply after you rebuild the image and restart the container.

Nothing is fixed: the secrets, the environment variables they read, the policies and the roles all come from `config.json`. A variable only has to be set if a secret in `config.json` uses it.

#### Schema

`config.json` is one JSON object with these keys. Unknown keys are rejected everywhere.

| Key | Required | Contains |
|---|---|---|
| `secrets` | yes | list of secrets to store |
| `policies` | yes | list of access policies |
| `roles` | yes | list of AppRole logins, one per service |
| `setting` | no | overrides for the defaults below |

```json
{
  "secrets": [
    {
      "name": "database",
      "values": [
        { "name": "user", "env": "POSTGRES_USER" },
        { "name": "password", "env": "POSTGRES_PASSWORD" }
      ]
    },
    {
      "name": "scraper-svc",
      "values": [
        { "name": "sessions", "env": ["REDDIT_SESSIONS_1", "REDDIT_SESSIONS_2"], "join": "," }
      ]
    }
  ],
  "policies": [
    {
      "name": "scraper-svc",
      "paths": {
        "scraper-svc": ["read"],
        "database": ["read"]
      }
    }
  ],
  "roles": [
    { "name": "scraper-svc", "token_policies": ["scraper-svc"] }
  ]
}
```

##### `secrets`

Each entry creates one secret at `secret/data/{name}`.

| Field | Required | Meaning |
|---|---|---|
| `name` | yes | Secret name, used as its path |
| `values` | yes | List of key/value pairs stored in the secret |

Each item of `values`:

| Field | Required | Meaning |
|---|---|---|
| `name` | yes | Key name inside the secret |
| `env` | yes | Environment variable to read: a string, or a list of strings |
| `join` | only with a list | Separator used to join the values of a list |

- `env` as a string: the value of that variable.
- `env` as a list: the values of all non-empty variables, joined with `join`. `join` is required for a list and not allowed for a string.
- Every key must end up with a non-empty value, otherwise Vault stops at startup. This is the only place where an environment variable becomes required.

##### `policies`

Each entry defines what a role may do.

| Field | Required | Meaning |
|---|---|---|
| `name` | yes | Policy name |
| `paths` | yes | Object: secret `name` → list of capabilities |

- Every key of `paths` must be the `name` of a secret defined in `secrets`. It grants access to `secret/data/{name}`.
- Capabilities: `create`, `read`, `update`, `delete`, `list`, `sudo`, `deny`. Reading a secret needs `read`.
- A secret that no policy mentions is still stored, but no service can read it.

##### `roles`

Each entry creates one AppRole and one login file.

| Field | Required | Meaning |
|---|---|---|
| `name` | yes | Role name, also the folder name of its login file: `/credentials/{name}/login.json` |
| `token_policies` | yes | List of policy names given to the tokens of this role |

Every name in `token_policies` must be the `name` of a policy defined in `policies`.

##### `setting`

All keys are optional. A service only gets a login file if it has an entry in `roles`.

| Key | Default | Meaning |
|---|---|---|
| `token_ttl` | `1h` | Lifetime of a service token |
| `token_max_ttl` | `4h` | Maximum lifetime of a service token |
| `secret_id_ttl` | `4h` | Lifetime of a `secret_id`; it is rotated every quarter of this value |
| `secret_id_num_uses` | `0` | Uses allowed per `secret_id` (`0` = unlimited) |
| `role_credentials_path` | `/credentials/` | Where login files are written |
| `role_file` | `login` | Login file name (`login.json`) |
| `settings_path` | `/secret/credentials.json` | Unseal key and root token file |
| `audit_path` | `/audit` | Audit log folder (mounted from `./vault/audit`) |
| `audit_file` | `audit` | Audit log file name (`audit.log`) |

- Durations use Go syntax (`30m`, `1h`, `4h`).
- `role_file` and `audit_file` must not be empty or contain `/` or `.`.
- `role_credentials_path` and `audit_path` must be existing writable folders, and `settings_path` an existing writable file.

##### Validation

Startup stops with an error if `config.json` is invalid: an unknown key, a policy that references a secret that does not exist, a role that references a policy that does not exist, an `env` list without `join` (or a single `env` with `join`), a malformed duration, a path in `setting` that does not exist or is not writable, or an empty environment variable used by a secret.

> [!NOTE]
> Removing a secret, policy or role from `config.json` does not delete it from Vault. Delete it by hand or reset.

Each service can read **only the paths its policy allows**. Reading any other path returns `permission denied`.

### How to use

1. **Mount your login folder** read-only into your service. Vault creates one folder per role, named after it, and puts `login.json` inside. Mount the whole folder, not the single file, so updates to the file are always visible inside your container. `login.json` contains `role_id` and `secret_id`, which is exactly the body the login request needs.

   ```yaml
   services:
     my-service:
       volumes:
         - ./vault/creds/my-service:/run/vault:ro
   ```

   Here `my-service` is the `name` of the role in `config.json`. Your service then reads `/run/vault/login.json`. Services start only after Vault is healthy, so the folder and file already exist when they start.

2. **Log in** by posting the content of `login.json` to `http://vault:8200/v1/auth/approle/login`. The only part of the response you need is `client_token`:

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

- **Re-read `login.json` every time you log in.** The `secret_id` inside it is replaced about every hour and on every Vault restart. Do not cache the old value.
- **Tokens expire** after about 1 hour (4 hours at most). If a request returns `403`, log in again.
- **Retry the login** a few times with a short delay. Vault may be restarting or still starting up.
- A `permission denied` on a path you are not allowed to read is expected. Do not retry it.
- Never log the `secret_id`, the token, or the secret values.

## Documentation

- [Vault docs](https://developer.hashicorp.com/vault/docs)


## TODO

1. Add symmetric encryption option for more security