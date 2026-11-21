import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { readFile } from "node:fs/promises";
import { PrismaClientExceptionFilte } from "./prisma-client-exception/prisma-client-exception.filter";

async function getSecrets(token: string) {
	const result = await fetch("http://vault:8200/v1/secret/data/database", {
		method: "GET",
		headers: {
			"X-Vault-Token": token,
		},
	});

	if (!result.ok) {
		throw new Error("can't Get secrets from vault!!!");
	}

	const data = (await result.json()) as DatabaseSecrets;
	return data.data.data;
}

async function getMinioSecrets(token: string) {
	const result = await fetch("http://vault:8200/v1/secret/data/minio", {
		method: "GET",
		headers: {
			"X-Vault-Token": token,
		},
	});

	if (!result.ok) {
		throw new Error("can't Get secrets from vault!!!");
	}

	const data = (await result.json()) as MinioSecrets;
	return data.data.data;
}

interface VaultLoginResponse {
	auth: {
		client_token: string;
	};
}

interface DatabaseSecrets {
	data: {
		data: {
			database: string;
			password: string;
			user: string;
		};
	};
}

interface MinioSecrets {
	data: {
		data: {
			password: string;
			user: string;
			backup_hmac_key: string;
			secret_key: string;
			access_key: string;
		};
	};
}

async function vaultLogin(filePath: string) {
	const buffer = await readFile(filePath);

	const response = await fetch("http://vault:8200/v1/auth/approle/login", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: buffer.toString("utf8"),
	});

	if (!response.ok) {
		throw new Error(`Vault login failed: ${response.status}`);
	}

	const data = (await response.json()) as VaultLoginResponse;
	return data.auth.client_token;
}

async function bootstrap() {
	try {
		const token = await vaultLogin("/run/vault/login.json");
		const result = await getSecrets(token);
		const secoundresult = await getMinioSecrets(token);
		process.env.POSTGRES_USER = result.user;
		process.env.POSTGRES_PASSWORD = result.password;
		process.env.POSTGRES_DB = result.database;
		process.env.MINIO_ROOT_USER = secoundresult.user;
		process.env.MINIO_ROOT_PASSWORD = secoundresult.password;
		process.env.MINIO_ACCESS_KEY = secoundresult.access_key;
		process.env.MINIO_SECRET_KEY = secoundresult.secret_key;
		process.env.BACKUP_HMAC_KEY = secoundresult.backup_hmac_key;
		const databaseUrl = new URL("postgresql://postgres:5432");
		databaseUrl.username = result.user;
		databaseUrl.password = result.password;
		databaseUrl.pathname = `/${encodeURIComponent(result.database)}`;
		process.env.DATABASE_URL = databaseUrl.toString();

	} catch (err){
		console.error("Failed to retrieve Vault secrets:", err);
		process.exit(1);
	}

	const app = await NestFactory.create(AppModule, {abortOnError: false});
	app.useGlobalPipes(new ValidationPipe({transform: true, whitelist: true, forbidNonWhitelisted: false,}));
	app.enableShutdownHooks();
	app.useGlobalFilters(new PrismaClientExceptionFilte());
	const port = process.env.PORT ?? 3003;
	await app.listen(port);
	console.log(`Reporting service is running on port ${port}`);
}
void bootstrap().catch((err: unknown) => {
	console.log("Reporting service failed to start:", err);
	process.exit(1);
});
