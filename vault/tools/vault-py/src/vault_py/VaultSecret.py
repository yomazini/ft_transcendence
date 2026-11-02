import json, os
from pydantic import BaseModel, ConfigDict

class VaultSecret(BaseModel):
	model_config = ConfigDict(extra="forbid")
	unseal_key: str | None
	token: str | None
	roles: dict[str,str]
	ready: bool


	def save(self, file_path:str) -> None:
		tmp = f"{file_path}.tmp"
		with open(tmp, "w") as f:
			json.dump(
				{
					'unseal_key': self.unseal_key,
					"token": self.token,
					"roles": self.roles,
					"ready": self.ready
				},
				f,
				indent=4
			)
		os.replace(tmp, file_path)

	@classmethod
	def load(cls, file_path) -> "VaultSecret":
		with open(file_path, "r") as f:
			data = cls.model_validate(json.load(f))
		return data