import { Controller, Get, Post, Param } from '@nestjs/common';
import { BackupsService } from './backups.service';

@Controller('backups')
export class BackupsController {
	constructor(private readonly backupsService: BackupsService) {}

	@Post('create')
	async create() {
		const filePath = await this.backupsService.createBackup();
		return { message: 'Backup created', filePath };
	}

}
