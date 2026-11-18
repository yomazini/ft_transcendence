import {
	Injectable,
	NotFoundException,
	ForbiddenException,
	ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateApiKeyDto } from '../dto';
import { randomBytes, createHash } from 'crypto';

@Injectable()
export class ApiKeyService {
	constructor(private readonly prisma: PrismaService) {}

	async getKey(id: string, userOrgId: string, role: string) {
		if (id !== userOrgId) {
			throw new NotFoundException();
		}
		if (role !== 'Admin') {
			throw new ForbiddenException();
		}

		const apiKey = await this.prisma.apiKey.findUnique({
			where: { org_id: userOrgId },
			select: {
				id: true,
				prefix: true,
				label: true,
				created_at: true,
				last_used_at: true,
			},
		});
		return { key: apiKey };
	}

	async createKey(id: string,userId: string, userOrgId: string, role: string,
		createKeyDto: CreateApiKeyDto,
	) {
		if (id !== userOrgId) {
			throw new NotFoundException();
		}
		if (role !== 'Admin') {
			throw new ForbiddenException();
		}

		const rawKey = `if_${randomBytes(32).toString('base64url')}`;
		const hash = createHash('sha256').update(rawKey).digest('hex');
		const prefix = rawKey.slice(0, 7);
		try {
			const apiKey = await this.prisma.apiKey.create({
				data: {
					user_id: userId,
					org_id: userOrgId,
					key_hash: hash,
					prefix: prefix,
					label: createKeyDto.label,
				},
				select: {
					id: true,
					prefix: true,
					label: true,
					created_at: true,
				},
			});
			return {
				id: apiKey.id,
				key: rawKey,
				prefix: apiKey.prefix,
				label: apiKey.label,
				created_at: apiKey.created_at,
			};

		} catch (error: any) {
			if (error.code === 'P2002') {
				throw new ConflictException('This organization already has an API key');
			}
			throw error;
		}
	}

	async deleteKey(id: string, userOrgId: string, role: string) {
		if (id !== userOrgId) {
			throw new NotFoundException();
		}
		if (role !== 'Admin') {
			throw new ForbiddenException();
		}

		try {
			await this.prisma.apiKey.delete({ where: { org_id: userOrgId } });

			return {
				revoked: true,
				revoked_at: new Date(),
			}
		} catch(error: any) {
			if (error.code === 'P2025') {
				throw new NotFoundException('record to delete does not exist'); 
			}
			throw error;
		}
	}
}
