import json
from pydantic import BaseModel

CREDS_FILE: str = "/home/ebabkran/goinfre/creds/scraper-svc.json"

class Login(BaseModel):
	role_id: str = ""
	secret_id: str = ""

	
	def load(self) -> None:
		with open(CREDS_FILE, 'r') as f:
			data: dict[str, str] = json.load(f)
		validated: Login = Login.model_validate(data)
		self.role_id = validated.role_id
		self.secret_id = validated.secret_id

