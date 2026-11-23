import logging, sys, os, signal
from vault_py.VaultClient import VaultClient

logging.basicConfig(
	level=logging.INFO,
	format="%(asctime)s\t[%(levelname)s]\t%(message)s",
	datefmt="%Y-%m-%d %H:%M:%S"
)

def main() -> None:
	try:
		client = VaultClient("/config/config.json")
		client.unseal_vault()
		client.create_update_policies()
		client.create_update_roles()
		client.create_update_secrets()
		client.create_update_auditlog()
		client.mark_ready()
	except Exception as e:
		logging.getLogger("vault-py").error("%s", e)
		os.kill(1, signal.SIGTERM)
		sys.exit(1)
	logging.info("exiting bootstrap.")

	 

if __name__ == "__main__":
	main()
