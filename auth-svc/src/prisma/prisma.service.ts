import { Injectable } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Prisma } from '../../generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
	constructor() {
		const adapter = new PrismaPg({
			connectionString: process.env.DATABASE_URL!,
		});
		super({ adapter });
	}

	async lock_organization(tx: Prisma.TransactionClient, orgId: string) {
		await tx.$executeRaw(Prisma.sql`SELECT pg_advisory_xact_lock(hashtext(${orgId}))`);
	}
}
