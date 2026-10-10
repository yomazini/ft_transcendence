import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateOrgDto } from './dto';

@Injectable()
export class OrgService {
	constructor(private readonly prisma: PrismaService) {}

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
}
