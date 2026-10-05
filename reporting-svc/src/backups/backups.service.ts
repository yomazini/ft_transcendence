import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as path from 'path';
import * as fs from 'fs';
import { getDbConfig } from './backup.config';
import { spawn } from 'child_process';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BackupStatus } from 'src/generated/prisma/enums';
import { MinioService } from 'src/minio/minio.service';

@Injectable()
export class BackupsService {
	private readonly logger = new Logger(BackupsService.name);
	private readonly backupDir = "/home/osouadi/goinfre/downloads";
	constructor(private readonly prisma: PrismaService, private readonly minioService: MinioService) {
		if (!fs.existsSync(this.backupDir)) {
			fs.mkdirSync(this.backupDir, { recursive: true });
		}
	}

	async createBackup(): Promise<string> {
		const { host, port, database, user, password } = getDbConfig();
		const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
		const fileName = `${database}_${timestamp}.dump`;
		const filePath = path.join(this.backupDir, `${database}_${timestamp}.dump`);
		
		const backupRecord = await this.prisma.backups.create({
			data: {
				fileName: fileName,
				filePath: filePath,
				status: BackupStatus.IN_PROGRESS,
			},
		});

		const args = [
			'-h', host,
			'-p', port,
			'-U', user,
			'-F', 'c',
			'-f', filePath,
			database,
		];

		const env = { ...process.env, PGPASSWORD: password };

		const backup = await new Promise<string>((resolve, reject) => {
			const dump = spawn('pg_dump', args, { env });

			let stderr = '';
			dump.stderr.on('data', (data) => (stderr += data.toString()));

			dump.on('error', async (err) => {
				await this.prisma.backups.update({
					where: {
						id: backupRecord.id,
					},
					data: {
						status: BackupStatus.FAILED,
						errorMessage: `Failed to start pg_dump: ${err.message}`,
					},
				});
				this.logger.error(`Failed to start pg_dump: ${err.message}`);
				reject(err);
			});

			dump.on('close', async (code) => {
				if (code === 0) {
					this.logger.log(`Backup created: ${filePath}`);
					resolve(filePath);
				} else {
					await this.prisma.backups.update({
						where: {
							id: backupRecord.id,
						},
						data: {
							fileName: fileName,
							filePath: filePath,
							status: BackupStatus.FAILED,
							errorMessage: `pg_dump exited with code ${code}: ${stderr}`,
						},
					});
					this.logger.error(`pg_dump failed: ${stderr}`);
					reject(new Error(`pg_dump exited with code ${code}: ${stderr}`));
				}
			});
		});

		const key = await this.minioService.uploadFromDisk(fileName);
		const { size } = fs.statSync(filePath);

		await this.prisma.backups.update({
			where: {
				id: backupRecord.id,
			},
			data: {
				s3Key: key,
				fileSize: size,
				status: BackupStatus.SUCCESS,
			},
		});

		await fs.promises.unlink(filePath).catch(() => {});

		return backup;
	}

	async restoreBackup(backupId: string): Promise<void> {
		// const record = await this.prisma.backups.findUniqueOrThrow({
		// 	where: {
		// 		id: backupId
		// 	},
		// });

		// if (!record.s3Key) {
		// 	throw new BadRequestException('This backup has no file in S3 and cannot be restored');
		// }
		const tempfile = await this.minioService.downloadToDisk(backupId);

		const { host, port, database, user, password } = getDbConfig();

		const restore = await new Promise<void>((resolve, reject) => {
			const proc = spawn('pg_restore', [
				'-h', host,
				'-p', port,
				'-U', user,
				'-d', database,
				'-c',
				tempfile,
			], {
				env: { ...process.env, PGPASSWORD: password },
			});

			let stderr = '';
			proc.stderr.on('data', (data) => (stderr += data.toString()));

			proc.on('error', async (err) => {
				// await this.prisma.backups.update({
				// 	where: {
				// 		id: backupId,
				// 	},
				// 	data: {
				// 		status: BackupStatus.FAILED,
				// 		errorMessage: `Failed to start pg_restore: ${err.message}`,
				// 	}
				// });
				this.logger.error(`Failed to start pg_restore: ${err.message}`);
				reject(err);
			});

			proc.on('close', async (code) => {
				if (code === 0) {
				try {
					// await this.prisma.backups.update({
					// 	where: { id: backupId },
					// 	data: { status: BackupStatus.RESTORED },
					// });
					// this.logger.log(`Restore completed from: ${record.filePath}`);
					resolve();
				} catch (err) {
					// await this.prisma.backups.update({
					// 	where: {
					// 		id: backupId,
					// 	},
					// 	data: {
					// 		status: BackupStatus.FAILED,
					// 		errorMessage: `Failed to start pg_restore: ${err}`,
					// 	}
					// });
					reject(err);
				}
				} else {
					// await this.prisma.backups.update({
					// 	where: {
					// 		id: backupId,
					// 	},
					// 	data: {
					// 		status: BackupStatus.FAILED,
					// 		errorMessage: `pg_restore failed: ${stderr}`,
					// 	}
					// });
					this.logger.error(`pg_restore failed: ${stderr}`);
					reject(new Error(`pg_restore exited with code ${code}: ${stderr}`));
				}
			});
		});

		// await fs.promises.unlink(tempfile).catch(() => {});

		return restore;
	}

	async listBackups() {
		return this.prisma.backups.findMany({ orderBy: { created_at: 'desc' } });
	}

	@Cron(CronExpression.EVERY_10_SECONDS)
	async handleScheduledBackup() {
		try {
			await this.createBackup();
		}
		catch (err) {
			this.logger.error('Scheduled backup failed', err);
		}
	}

}
