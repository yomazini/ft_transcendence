import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as path from 'path';
import * as fs from 'fs';
import { getDbConfig } from './backup.config';
import { spawn } from 'child_process';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BackupStatus } from 'src/generated/prisma/enums';
import { MinioService } from 'src/minio/minio.service';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import { MetricsService } from 'src/metrics/metrics.service';

@Injectable()
export class BackupsService {
	private readonly logger = new Logger(BackupsService.name);
	constructor(private readonly prisma: PrismaService, private readonly minioService: MinioService, private readonly configService: ConfigService, private readonly metrics: MetricsService) {
		if (!fs.existsSync(this.configService.getOrThrow<string>("BACKUP_DIR", "/backups"))) {
			fs.mkdirSync(this.configService.getOrThrow<string>("BACKUP_DIR", "/backups"), { recursive: true });
		}
	}

	private runPgDump(o: {
		host: string; port: string; user: string; password: string;
		database: string; filePath: string;
	}): Promise<void> {

		const dump = new Promise<void>((resolve, reject) => {
			const args = ['-h', o.host, '-p', o.port, '-U', o.user, '-F', 'c', '-f', o.filePath, o.database];
			const dump = spawn('pg_dump', args, { env: { ...process.env, PGPASSWORD: o.password } });

			let stderr = '';
			dump.stderr.on('data', (d) => (stderr += d.toString()));
			dump.on('error', (err) => reject(new Error(`Failed to start pg_dump: ${err.message}`)));
			dump.on('close', (code) =>
				code === 0 ? resolve() : reject(new Error(`pg_dump exited with code ${code}: ${stderr}`)),
			);
		});
		return dump;
	}

	private Hmac(filePath: string): Promise<string> {

		const sha =  new Promise<string>((resolve, reject) => {
			const hash = createHmac('sha256', this.configService.getOrThrow<string>("BACKUP_HMAC_KEY"));
			fs.createReadStream(filePath)
				.on('error', reject)
				.on('data', (chunk) => hash.update(chunk))
				.on('end', () => resolve(hash.digest('hex')));
		});
		return sha;
	}

	async createBackup(): Promise<string> {
		const { host, port, database, user, password } = getDbConfig();
		const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
		const fileName = `${database}_${timestamp}.dump`;
		const filePath = path.join(this.configService.getOrThrow<string>("BACKUP_DIR", "/backups"), `${database}_${timestamp}.dump`);
		const shaPath = `${filePath}.hmac`;
		
		const backupRecord = await this.prisma.backups.create({
			data: {
				fileName: fileName,
				filePath: filePath,
				status: BackupStatus.IN_PROGRESS,
			},
		});

		try {
			await this.runPgDump({host, port: String(port), user, password, database, filePath});
			const hash = await this.Hmac(filePath);
			await fs.promises.writeFile(shaPath, `${hash}  ${fileName}\n`);

			const s3Key = await this.minioService.uploadFromDisk(fileName);
			await this.minioService.uploadFromDisk(`${fileName}.hmac`);
			const { size } = await fs.promises.stat(filePath);

			await this.prisma.backups.update({
				where: { id: backupRecord.id },
				data: { s3Key, fileSize: size, status: BackupStatus.SUCCESS },
			});

			this.logger.log(`Backup created: ${fileName}`);
			return s3Key;
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			this.logger.error(`Backup failed: ${message}`);
			await this.prisma.backups.update({
				where: { id: backupRecord.id },
				data: { status: BackupStatus.FAILED, errorMessage: message },
			}).catch((e) => this.logger.error(`Failed to record failure: ${e.message}`));
			throw err;
		} finally {
			await fs.promises.unlink(filePath).catch(() => {});
			await fs.promises.unlink(shaPath).catch(() => {});
		}
	}

	@Cron(CronExpression.EVERY_DAY_AT_10AM)
	async handleScheduledBackup() {
		const currentTime = performance.now();
		try {
			await this.createBackup();
			this.metrics.lastBackup.set(Date.now() / 1000);
			this.metrics.backupTotale.inc();
		}
		catch (err) {
			this.logger.error('Scheduled backup failed', err);
		} finally {
			this.metrics.backupDuration.observe(Math.floor(Date.now() / 1000) - currentTime);
		}
	}

}
