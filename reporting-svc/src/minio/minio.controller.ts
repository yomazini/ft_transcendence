import { Controller, Get, Post, Param} from '@nestjs/common';
import { MinioService } from './minio.service';

@Controller('minio')
export class MinioController {
	constructor(private readonly minioService: MinioService) {}

	@Post(':fileName')
	uploadFromDisk(@Param('fileName') fileName: string) {
		return this.minioService.uploadFromDisk(fileName);
	}

}
