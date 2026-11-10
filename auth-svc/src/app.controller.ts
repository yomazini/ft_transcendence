import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { ApiOperation } from '@nestjs/swagger';
import { PrismaService } from './prisma/prisma.service';

@ApiTags('health')
@Controller()
export class AppController {
	constructor(private readonly prismaService: PrismaService) {}

	@Get('health')
	@ApiOperation({ summary: 'Auth Health Check' })
	@ApiResponse({ status: 200, description: 'Auth service is healthy' })
	@ApiResponse({ status: 503, description: 'Auth service is unhealthy' })
	async getHealth() {
		try {
			await this.prismaService.$queryRaw`SELECT 1`;
		return { status: 'ok', service: 'auth-svc' };
		} catch {
			throw new ServiceUnavailableException({
			status: 'error',
			service: 'auth-svc',
			});
		}
	}
}
