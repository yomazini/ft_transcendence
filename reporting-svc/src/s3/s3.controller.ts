import { Controller, UploadedFile, } from '@nestjs/common';
import { S3Service } from './s3.service';

@Controller('uploads')
export class UploadController {
	constructor(private readonly s3Service: S3Service) {}
	// @Post()
	async uploadFile(@UploadedFile() file: Express.Multer.File) {
		// const key = await this.s3Service.uploadFile(file);
		// const url = await this.s3Service.getDownloadUrl(key);

		// return { key, url };
	}
}
