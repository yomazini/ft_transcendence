import { Injectable, NotFoundException } from "@nestjs/common";
import * as Minio from "minio";
import { ConfigService } from "@nestjs/config";
import { basename, join } from "path";
import { createReadStream, existsSync, statSync } from "fs";

@Injectable()
export class MinioService {
	private minioClient: Minio.Client;
	private bucketName: string;
	constructor(private readonly configService: ConfigService) {
		this.minioClient = new Minio.Client({
			endPoint: this.configService.get("MINIO_ENDPOINT") as string,
			port: Number(this.configService.get("MINIO_PORT")),
			useSSL: this.configService.get("MINIO_USE_SSL") === "true",
			accessKey: this.configService.get("MINIO_ACCESS_KEY"),
			secretKey: this.configService.get("MINIO_SECRET_KEY"),
		});
		this.bucketName = this.configService.get("MINIO_BUCKET_NAME") as string;
	}

	async uploadFromDisk(fileName: string): Promise<string> {
		const dir = this.configService.getOrThrow<string>(
			"BACKUP_DIR",
			"/backups",
		);
		const filePath = join(dir, basename(fileName));
		if (!existsSync(filePath)) {
			throw new NotFoundException("File not found");
		}
		const stream = createReadStream(filePath);
		const { size } = statSync(filePath);
		await this.minioClient.putObject(
			this.bucketName,
			fileName,
			stream,
			size,
		);
		return fileName;
	}
}
