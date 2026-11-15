import { Injectable } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Prisma } from '../../generated/prisma/client';

/** @line @Injectable() marks this class as something NestJS can create and hand to other classes automatically. Without it, Nest won't let you inject it into a constructor. */

/**
 * @note
 * line15: the ! tells TypeScript "trust me, this exists" since process.env.X is normally typed as possibly undefined.

*/
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
