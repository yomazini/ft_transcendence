import json, os, durospan
from pydantic import BaseModel, ConfigDict, Field, model_validator
from enum import StrEnum
from typing import cast

class Capability(StrEnum):
    CREATE = "create"
    READ = "read"
    UPDATE = "update"
    DELETE = "delete"
    LIST = "list"
    SUDO = "sudo"
    DENY = "deny"

class StrictModel(BaseModel):
	model_config = ConfigDict(extra="forbid")

class Setting(StrictModel):
	audit_path:str = "/audit"
	role_credentials_path: str = "/credentials/"
	settings_path:str = "/secret/credentials.json"
	role_file:str = "login"
	audit_file:str = "audit"
	token_ttl:str = "1h"
	token_max_ttl:str = "4h"
	secret_id_ttl:str = "4h"
	secret_id_num_uses:int = 0

	@model_validator(mode="after")
	def validate_data(self):
		if not os.path.isdir(self.role_credentials_path) or not os.access(self.role_credentials_path, os.W_OK):
			raise ValueError(f"role_credentials_path {self.role_credentials_path} doesn't exist or permission denied")

		if not os.path.isdir(self.audit_path) or not os.access(self.audit_path, os.W_OK):
			raise ValueError(f"audit_path {self.audit_path} doesn't exist or permission denied")

		if not os.access(self.settings_path, os.W_OK):
			raise ValueError(f"settings_path {self.settings_path} doesn't exist or permission denied")

		if "/" in self.audit_file or "." in self.audit_file or self.audit_file == "":
			raise ValueError(f"audit_file {self.audit_file} shouldn't be empty or have a '/' and/or '.'")

		if "/" in self.role_file or "." in self.role_file or self.role_file == "":
			raise ValueError(f"role_file {self.role_file} shouldn't be empty or have a '/' and/or '.'")

		durospan.parse_ns(self.token_ttl, dialect="go")
		durospan.parse_ns(self.token_max_ttl, dialect="go")
		durospan.parse_ns(self.secret_id_ttl, dialect="go")

		return self


class SecretKeyValue(StrictModel):
	name: str
	env: list[str] | str
	join: str | None = None

	@model_validator(mode="after")
	def validate_join(self):
		if isinstance(self.env, list) and self.join is None:
			raise ValueError("join is required when env is a list")

		if isinstance(self.env, str) and self.join is not None:
			raise ValueError("join is only allowed when env is a list")

		return self

	def get_env_value(self) -> str:
		if isinstance(self.env, str):
			return (os.getenv(self.env, ""))
		l: list[str] = []
		for i in self.env:
			val = os.getenv(i)
			if val:
				l.append(val)
		return (cast(str, self.join).join(l))

class Secret(StrictModel):
	name:str
	values: list[SecretKeyValue]

	def get_kv(self) -> dict[str, str]:
		d:dict[str, str] = {}
		for secret in self.values:
			val = secret.get_env_value()
			if val == "":
				raise RuntimeError("Empty envirement variable(s)")
			d[secret.name] = val
		return d

class Policy(StrictModel):
	name:str
	paths: dict[str, list[Capability]]

	def get_policy(self) -> str:
		data = {"path": {}}
		for k, v in self.paths.items():
			data["path"][f"secret/data/{k}"] = {
				"capabilities": v
			}
		return json.dumps(data)


class Role(StrictModel):
	name: str
	token_policies: list[str]

class VaultConf(StrictModel):
	setting: Setting = Field(default_factory=Setting)
	secrets: list[Secret]
	policies: list[Policy]
	roles: list[Role]

	@model_validator(mode="after")
	def validate_data(self):
		secrets_names = [secret.name for secret in self.secrets]
		policies_names = [policy.name for policy in self.policies]
	
		for policy in self.policies:
			if not all(item in secrets_names for item in policy.paths.keys()):
				raise ValueError(f"{policy.name} has a secret that doesn't exist")

		for role in self.roles:
			if not all(item in policies_names for item in role.token_policies):
				raise ValueError(f"{role.name} has a policy that doesn't exist")

		return self

	def get_secret_path(self):
		return (self.setting.settings_path)

	def save_role_credentials(self, name:str, role_id:str, secret_id:str):
		os.makedirs(f"{self.setting.role_credentials_path}/{name}/", exist_ok=True)
		with open(f"{self.setting.role_credentials_path}/{name}/{self.setting.role_file}.json", "w") as f:
			json.dump(
				{
					"role_id": role_id,
					"secret_id": secret_id
				},
				f,
				indent=4
			)

	@classmethod
	def load_config(cls, path: str) -> "VaultConf":
	    with open(path, "r") as f:
	        return cls.model_validate(json.load(f))
		