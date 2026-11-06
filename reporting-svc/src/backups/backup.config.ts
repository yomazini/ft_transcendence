import { parse } from "pg-connection-string";

export function getDbConfig() {
	const databaseUrl = process.env.DATABASE_URL;

	if (!databaseUrl) {
		throw new Error("DATABASE_URL is not defined");
	}

	const config = parse(databaseUrl);

	if (!config.host) {
		throw new Error("Database host is missing");
	}

	if (!config.database) {
		throw new Error("Database name is missing");
	}

	if (!config.user) {
		throw new Error("Database user is missing");
	}

	if (!config.password) {
		throw new Error("Database password is missing");
	}

	return {
		host: config.host,
		port: config.port ?? "5432",
		database: config.database,
		user: config.user,
		password: config.password,
	};
}
