import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Req, UseGuards } from '@nestjs/common';
import { ApiKeyService } from './api-key.service';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CreateApiKeyDto } from '../dto';

@ApiTags('orgs')
@ApiBearerAuth()
@Controller('orgs')
export class ApiKeyController {
	constructor(private readonly apiKeyService: ApiKeyService ) {}

	@Get(':id/api-key')
	@UseGuards(JwtGuard)
	getApiKey(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
		return this.apiKeyService.getKey(id, req.user.org_id, req.user.role)
	}

	@Post(':id/api-key')
	@UseGuards(JwtGuard)
	createApiKey(@Param('id', ParseUUIDPipe) id: string, @Req() req, @Body() createApiKeyDto: CreateApiKeyDto) {
		return this.apiKeyService.createKey(id, req.user.sub, req.user.org_id, req.user.role, createApiKeyDto);
	}

	@Delete(':id/api-key')
	@UseGuards(JwtGuard)
	deleteApiKey(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
		return this.apiKeyService.deleteKey(id, req.user.org_id, req.user.role);
	}
}
