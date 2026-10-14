import { Injectable } from '@nestjs/common';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import path, { extname } from 'path';
import 'multer';
import { createReadStream, createWriteStream } from 'fs';
import { Upload } from '@aws-sdk/lib-storage';
import { pipeline, Readable } from 'stream';
import * as os from 'os';

@Injectable()
export class S3Service {
	// private readonly s3Client: S3Client;
	// private readonly bucket: string;

	// constructor(private readonly configService: ConfigService) {
	// 	this.s3Client = new S3Client({
	// 		region: configService.getOrThrow<string>('aws.region'),
	// 		credentials: {
	// 			accessKeyId: configService.getOrThrow<string>('aws.accessKeyId'),
	// 			secretAccessKey: configService.getOrThrow<string>('aws.secretAccessKey'),
	// 		},
	// 	});

	// 	this.bucket = configService.getOrThrow<string>('aws.s3BucketName');
	// }

	// private buildKey(fileName: string, folder = 'uploads'): string {
	// 	return `${folder}/${randomUUID()}${extname(fileName).toLowerCase()}`;
	// }

	// async uploadFile(filePath: string, folder?: string): Promise<string> {
	// 	const key = this.buildKey(path.basename(filePath), folder);

	// 	await new Upload({
	// 		client: this.s3Client,
	// 		params: {
	// 			Bucket: this.bucket,
	// 			Key: key,
	// 			Body: createReadStream(filePath),
	// 			ContentType: 'application/octet-stream', 
	// 		},
	// 	}).done();

	// 	return key;
	// }

	// async downloadToPath(key: string): Promise<string> {
	// 	const res = await this.s3Client.send(
	// 		new GetObjectCommand({ Bucket: this.bucket, Key: key }),
	// 	);

	// 	const tmpPath = path.join(os.tmpdir(), path.basename(key));
	// 	await pipeline(res.Body as Readable, createWriteStream(tmpPath));

	// 	return tmpPath;
	// }

}
