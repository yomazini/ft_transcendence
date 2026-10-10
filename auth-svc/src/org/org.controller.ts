import { Controller, Get, Req, Body, Param, UseGuards, Patch, Delete, HttpCode } from '@nestjs/common';
import { OrgService } from './org.service';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { UpdateOrgDto } from './dto';

@Controller('orgs')
export class OrgController {
	constructor(private readonly orgService: OrgService) {}

	@Get(':id') /** GET /orgs/:id */
	@UseGuards(JwtGuard)
	getOrg(@Param('id') id: string, @Req() req) {
		return this.orgService.get(id, req.user.org_id);
	}

	@Patch(':id') /** PATCH /orgs/:id */
	@UseGuards(JwtGuard)
	updateOrg(@Param('id') id: string, @Body() dto: UpdateOrgDto, @Req() req) {
		return this.orgService.update(id, dto, req.user.org_id, req.user.role);
	}

	@Delete(':id') /** DELETE /orgs/:id */
	@HttpCode(204)
	@UseGuards(JwtGuard)
	deleteOrg(@Param('id') id:string, @Req() req) {
		return this.orgService.delete(id, req.user.org_id,req.user.role);
	}
}
