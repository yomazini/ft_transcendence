import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as path from 'path';
import * as fs from 'fs';
import { getDbConfig } from './backup.config';
import { spawn } from 'child_process';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class BackupsService {
	private readonly logger = new Logger(BackupsService.name);
	private readonly backupDir = path.resolve(__dirname, '../../../../backups');
	constructor(private readonly prisma: PrismaService) {
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
				fileName,
				filePath,
			},
		});
		return new Promise((resolve, reject) => {
			const dump = spawn('pg_dump', [
				'-h', host,
				'-p', port,
				'-U', user,
				'-F', 'c',
				'-f', filePath,
				database,
			], {
				env: {
					...process.env, PGPASSWORD: password
				},
			});

			let stderr = '';
			dump.stderr.on('data', (data) => (stderr += data.toString()));

			dump.on('close', (code) => {
				if (code === 0) {
					this.logger.log(`Backup created: ${filePath}`);
					resolve(filePath);
				} else {
					this.logger.error(`pg_dump failed: ${stderr}`);
					reject(new Error(`pg_dump exited with code ${code}: ${stderr}`));
				}
			});
		});
	}

	async restoreBackup(backupId: string): Promise<void> {
		const record = await this.prisma.backups.findUniqueOrThrow({
			where: {
				id: backupId
			},
		});

		const { host, port, database, user, password } = getDbConfig();

		return new Promise((resolve, reject) => {
			const restore = spawn('pg_restore', [
				'-h', host,
				'-p', port,
				'-U', user,
				'-d', database,
				'-c',
				record.filePath,
			], {
				env: { ...process.env, PGPASSWORD: password },
			});

			let stderr = '';
			restore.stderr.on('data', (data) => (stderr += data.toString()));

			restore.on('close', async (code) => {
				if (code === 0) {
				await this.prisma.backups.update({
					where: {
						id: backupId
					},
					data: {
						status: 'RESTORED',
					},
				});
				this.logger.log(`Restore completed from: ${record.filePath}`);
				resolve();
				} else {
				this.logger.error(`pg_restore failed: ${stderr}`);
				reject(new Error(`pg_restore exited with code ${code}: ${stderr}`));
				}
			});
		});
	}

	async listBackups() {
		return this.prisma.backups.findMany({ orderBy: { created_at: 'desc' } });
	}

	@Cron(CronExpression.EVERY_DAY_AT_2AM)
	async handleScheduledBackup() {
		this.logger.log('Running scheduled backup...');
		try {
			await this.createBackup();
		}
		catch (err) {
			this.logger.error('Scheduled backup failed', err);
		}
	}

	@Cron(CronExpression.EVERY_DAY_AT_2AM)
	async pruneOldBackups() {
		const keep = 7;
		const old = await this.prisma.backups.findMany({
			where: {
				status: 'SUCCESS'
			},
			orderBy: {
				created_at: 'desc'
			},
			skip: keep,
		});

		for (const backup of old) {
			try {
				if (fs.existsSync(backup.filePath)) fs.unlinkSync(backup.filePath);
					await this.prisma.backups.delete({
						where: {
							id: backup.id
						}
				});
			} catch (err) {
				this.logger.warn(`Failed to prune backup ${backup.id}: ${err}`);
			}
		}
	}
}
