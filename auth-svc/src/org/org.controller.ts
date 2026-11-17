import { Controller, Get, Req, Body, Param, UseGuards, Post, Patch, Delete, HttpCode } from '@nestjs/common';
import { OrgService } from './org.service';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { InviteMemberDto, UpdateOrgDto } from './dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('orgs')
@ApiBearerAuth()
@Controller('orgs')
export class OrgController {
	constructor(private readonly orgService: OrgService) {}

	@Get(':id')
	@UseGuards(JwtGuard)
	getOrg(@Param('id') id: string, @Req() req) {
		return this.orgService.get(id, req.user.org_id);
	}

	@Patch(':id')
	@UseGuards(JwtGuard)
	updateOrg(@Param('id') id: string, @Body() dto: UpdateOrgDto, @Req() req) {
		return this.orgService.update(id, dto, req.user.org_id, req.user.role);
	}

	@Delete(':id')
	@HttpCode(204)
	@UseGuards(JwtGuard)
	deleteOrg(@Param('id') id:string, @Req() req) {
		return this.orgService.delete(id, req.user.org_id,req.user.role);
	}

	@Get(':id/members')
	@UseGuards(JwtGuard)
	listMembers(@Param('id') id: string, @Req() req) {
		return this.orgService.list(id, req.user.org_id);
	}

	@Post(':id/members')
	@UseGuards(JwtGuard)
	inviteMember(@Param('id') id:string, @Body() dto: InviteMemberDto, @Req() req) {
		return this.orgService.invite(id, dto, req.user.org_id, req.user.role);
	}

	@Patch(':id/members/:userId')
	@UseGuards(JwtGuard)
	updateMember(@Param('id') id:string, @Param('userId') userId: string, @Body() dto: UpdateMemberDto, @Req() req) {
		return this.orgService.updateMember(id, userId, dto, req.user.org_id, req.user.role);
	}

	@Delete(':id/members/:userId')
	@HttpCode(204)
	@UseGuards(JwtGuard)
	removeMember(@Param('id') id: string, @Param('userId') userId: string, @Req() req) {
		return this.orgService.removeMember(id, userId, req.user.org_id, req.user.role);
	}
}
