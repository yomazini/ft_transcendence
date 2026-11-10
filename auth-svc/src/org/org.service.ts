import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { InviteMemberDto, UpdateOrgDto } from './dto';
import { MailService } from 'src/mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import { UpdateMemberDto } from './dto/update-member.dto';
import { BillingService } from './billing.service';
import { TokenDenylist } from '../auth/token-denylist.service';

@Injectable()
export class OrgService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly mail: MailService,
		private readonly jwt: JwtService,
		private readonly billing: BillingService,
		private readonly denylist: TokenDenylist,
	) {}

	async get(id: string, userOrgId: string) {
		if (id !== userOrgId) {
			throw new NotFoundException();
		}
		const org = await this.prisma.organization.findUnique({
			where: {id},
		})
		if (!org) { throw new NotFoundException() }
		return {
			id: org.id,
			name: org.name,
			description: org.description,
			created_at: org.created_at,
		}	
	}

	async update(id: string, dto: UpdateOrgDto, userOrgId: string, role: string) {
		if (id !== userOrgId) { throw new NotFoundException();  /** 404 */}
		if (role !== 'Admin') { throw new ForbiddenException();  /** 403 */}
		const org = await this.prisma.organization.update({
			where: { id }, data:  dto })
		/** @note Prisma skips fields that are undefined, so sending only name changes only the name. */
		return {
			id: org.id,
			name: org.name,
			description: org.description,
			created_at: org.created_at,
		}	
	}

	async delete(id: string, userOrgId: string, role: string) {
		if (id !== userOrgId) { throw new NotFoundException();  /** 404 */}
		if (role !== 'Admin') { throw new ForbiddenException();  /** 403 */}
		
		/** @note Deleting an org also deletes its users: a user with no org cannot log in.*/
		await this.prisma.$transaction(async (tx) => {
			const members = await tx.role_and_organization.findMany({
				where: { org_id: id },
				select: { user_id: true },
			});
			await tx.organization.delete({ where: { id } });
			await tx.user.deleteMany({
			where: { id: { in: members.map((m) => m.user_id) } },
		});
		});
	}

	async list(id: string, userOrgId: string) {
		if (id !== userOrgId) { throw new NotFoundException();  /** 404 */}

		const rows = await this.prisma.role_and_organization.findMany({
			where: { org_id: id },
			include: { user: true },
		})

		const list = rows.map((row) =>({
			email: row.user.email,
			id: row.user.id,
			role: row.role,
			created_at: row.user.created_at,
		}))
		return list;
	}

	async invite(id: string, dto: InviteMemberDto, userOrgId: string, role: string) {
		if (id !== userOrgId) { throw new NotFoundException();  /** 404 */}
		if (role !== 'Admin') { throw new ForbiddenException();  /** 403 */}

		const user = await this.prisma.user.findUnique({
			where: { email: dto.email },
		})
		if (user) { throw new BadRequestException('User already exists'); }

		await this.billing.assertCanAddMember(id);

		const invite_token = await this.jwt.signAsync({
			email: dto.email,
			org_id: id,
			role: dto.role,
			purpose: 'invite'}, { expiresIn: '48h' }
		)

		const link = `${process.env.FRONTEND_URL}/invite/accept#invite_token=${invite_token}`;
		
		await this.mail.sendInvite(dto.email, link);
		return { message: 'Invitation sent'}
	}

	/** change a role */
	async updateMember(id: string, userId: string, dto: UpdateMemberDto, userOrgId: string, role: string) {
		if (id !== userOrgId) { throw new NotFoundException();  /** 404 */}
		if (role !== 'Admin') { throw new ForbiddenException();  /** 403 */}

		const membership = await this.prisma.role_and_organization.findFirst({
				where: {
					user_id: userId,
					org_id: id,
				}
			})
		if (!membership) { throw new NotFoundException() }
		
		if (membership.role === 'Admin' && dto.role !== 'Admin') {
			const admines = await this.prisma.role_and_organization.count({
				where: { org_id: id, role: 'Admin'},
			});
			if (admines === 1) {
				throw new BadRequestException('An organization must keep at least one Admin');
			}
		}

		await this.prisma.role_and_organization.update({
			where: { id: membership.id },
			data: { role: dto.role }
		});

		await this.denylist.revokeUser(userId);
		
		return {
			id: userId,
			role: dto.role,
		}
	}

	async removeMember(id: string, userId: string, userOrgId: string, role: string) {
		if (id !== userOrgId) { throw new NotFoundException();  /** 404 */}
		if (role !== 'Admin') { throw new ForbiddenException();  /** 403 */}

		const membership = await this.prisma.role_and_organization.findFirst({
			where: {
				user_id: userId,
				org_id: id,
			}
		})
		if (!membership) { throw new NotFoundException() }

		if (membership.role === 'Admin') {
			const admins = await this.prisma.role_and_organization.count({
				where: { org_id: id, role: 'Admin' },
			});
			if (admins === 1) {
				throw new BadRequestException('An organization must keep at least one Admin');
			}
		}

		await this.prisma.user.delete({ where: { id: userId } });

		await this.denylist.revokeUser(userId);
	}
}
