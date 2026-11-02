from hvac import Client
from typing import Any
from time import sleep
from vault_py.VaultConf import VaultConf
from vault_py.VaultSecret import VaultSecret
import durospan, logging

VAULT_ADDR="http://127.0.0.1:8200"

class VaultClient:
	config: VaultConf
	secret: VaultSecret
	client: Client
	status: dict[str, Any]

	def _get_status(self) -> dict[str, Any] | None:
		try:
			status = self.client.sys.read_seal_status()
			return status
		except Exception:
			sleep(1)
			return None

	def __init__(self, file_path:str) -> None:
		self.config = VaultConf.load_config(file_path)
		self.secret = VaultSecret.load(self.config.get_secret_path())
		self.client = Client(VAULT_ADDR)
		status: dict[str, Any] | None = None
		while status is None:
			status = self._get_status()
		self.status = status

	def init_vault(self) -> None:
		logging.getLogger("vault-py").info("initialize vault.")
	
		result = self.client.sys.initialize(
			secret_shares=1,
			secret_threshold=1
		)
		self.secret.unseal_key = result["keys_base64"][0]
		self.secret.token = result["root_token"]
		self.secret.save(self.config.get_secret_path())

	def unseal_vault(self):
		if not self.status["initialized"]:
			self.init_vault()
		logging.getLogger("vault-py").info("unseal vault.")
		self.client.sys.submit_unseal_key(
			key=self.secret.unseal_key
		)
		if self.secret.token:
			self.client.token = self.secret.token


	def create_update_policies(self):
		logging.getLogger("vault-py").info("create/update policies.")
		for policy in self.config.policies:
			logging.getLogger("vault-py").info("create/update %s policy.", policy.name)
			self.client.sys.create_or_update_policy(
				name=policy.name,
				policy=policy.get_policy()
			)

	def is_approle_enabled(self) -> bool:
		auth_methods: list[str] = self.client.sys.list_auth_methods()["data"]
		return "approle/" in auth_methods

	def is_kv_enabled(self) -> bool:
		mounts: list[str] = self.client.sys.list_mounted_secrets_engines()["data"]
		return "secret/" in mounts

	def is_audit_enabled(self) -> bool:
		audits = self.client.sys.list_enabled_audit_devices()["data"]
		return "file/" in audits
		

	def remove_old_role_secret(self, name:str, new_accessor:str):
		accessor = self.secret.roles.get(name, None)
		self.secret.roles[name] = new_accessor
		if accessor is None:
			return
		self.client.auth.approle.destroy_secret_id_accessor(
			role_name=name,
			secret_id_accessor=accessor
		)


	def create_update_roles(self):
		logging.getLogger("vault-py").info("create/update roles.")

		if not self.is_approle_enabled():
			self.client.sys.enable_auth_method(method_type="approle")
		for role in self.config.roles:
			logging.getLogger("vault-py").info("create/update %s role.", role.name)

			self.client.auth.approle.create_or_update_approle(
				role_name=role.name,
				token_policies=role.token_policies,
				token_ttl=self.config.setting.token_ttl,
				token_max_ttl=self.config.setting.token_max_ttl,
				secret_id_ttl=self.config.setting.secret_id_ttl,
				secret_id_num_uses=self.config.setting.secret_id_num_uses
			)
			role_id = self.client.auth.approle.read_role_id(role.name)["data"]["role_id"]
			secret_data = self.client.auth.approle.generate_secret_id(role_name=role.name)
			self.config.save_role_credentials(role.name, role_id, secret_data["data"]["secret_id"])
			self.remove_old_role_secret(role.name, secret_data["data"]["secret_id_accessor"])
			self.secret.save(self.config.get_secret_path())

	def create_update_secrets(self):
		if not self.is_kv_enabled():
			self.client.sys.enable_secrets_engine(
					backend_type="kv",
					path="secret",
					options={"version": "2"}
				)
		logging.getLogger("vault-py").info("create/update secrets.")
		for secret in self.config.secrets:
			logging.getLogger("vault-py").info("create/update %s secret.", secret.name)

			self.client.secrets.kv.v2.create_or_update_secret(
				path=secret.name,
				secret=secret.get_kv(),
				mount_point="secret"
			)

	def create_update_auditlog(self):
		if not self.is_audit_enabled():
			self.client.sys.enable_audit_device(
				device_type="file",
				path="file",
				options={
					"file_path": f"{self.config.setting.audit_path}/{self.config.setting.audit_file}.log"
				}
			)

	def mark_ready(self):
		self.secret.ready = True
		self.secret.save(self.config.get_secret_path())

	def start_rotation(self):
		while True:
			sleep(
				max(
					1,
					durospan.parse_ns(
						self.config.setting.secret_id_ttl,
						dialect="go"
					) // 4_000_000_000
				)
			)
			logging.getLogger("vault-py").info("rotate roles.")
			self.create_update_roles()