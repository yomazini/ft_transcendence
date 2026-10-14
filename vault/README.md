# HashiCorp Vault

## Discription

`HashiCorp Vault` is used to securely store and manage application secrets, such as database credentials, API keys, and session secrets. It provides controlled access to secrets through authentication and policies, allowing services to retrieve only the credentials they need.

## Instruction

### Setup

Create a .env file in the project root and configure the following environment variables:

`POSTGRES_USER`: PostgreSQL username.

`POSTGRES_PASSWORD`: PostgreSQL password.

`POSTGRES_DB`: PostgreSQL database name.

`REDDIT_SESSIONS`: Comma-separated list of Reddit session cookies.

`VAULT_DEV_ROOT_TOKEN_ID`: Root token for Vault's development mode.

Replace the placeholder values (changeme) with your own values before running the project.
