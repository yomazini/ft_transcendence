import {
    Injectable,
    BadRequestException,
    ForbiddenException,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

import {
    Action,
    Plan,
    RequestStatus,
    Roles,
} from '../../generated/prisma/enums';

import { RequestPlanDto } from './dto/request-plan.dto';
import { ReviewRequestDto } from './dto/review-request.dto';

@Injectable()
export class BillingService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly mail: MailService,
        private readonly config: ConfigService,
    ) { }

    // Verify membership and optionally require organization Admin.
    private async checkMember(
        orgId: string,
        userId: string,
        adminOnly = false,
    ) {
        const membership =
            await this.prisma.role_and_organization.findFirst({
                where: {
                    org_id: orgId,
                    user_id: userId,
                },
            });

        if (!membership) {
            throw new ForbiddenException('Not a member of this organization');
        }

        if (adminOnly && membership.role !== Roles.Admin) {
            throw new ForbiddenException('Only organization admins can manage billing');
        }
    }

    async getBilling(orgId: string, userId: string) {
        await this.checkMember(orgId, userId);

        const organization = await this.prisma.organization.findUnique({
            where: { id: orgId },
            select: {
                id: true,
                name: true,
                plan: true,
                subscription_requests: {
                    orderBy: { created_at: 'desc' },
                    take: 1,
                },
            },
        });

        if (!organization) {
            throw new NotFoundException('Organization not found');
        }

        return organization;
    }

    async requestChange(
        orgId: string,
        userId: string,
        dto: RequestPlanDto,
    ) {
        await this.checkMember(orgId, userId, true);

        const organization = await this.prisma.organization.findUnique({
            where: { id: orgId },
        });

        if (!organization) {
            throw new NotFoundException('Organization not found');
        }

        let targetPlan: Plan;

        if (dto.action === Action.CANCEL) {
            targetPlan = Plan.STARTER;
        } else {
            if (!dto.target_plan) {
                throw new BadRequestException('target_plan is required');
            }

            targetPlan = dto.target_plan;
        }

        const ranks = {
            [Plan.STARTER]: 0,
            [Plan.PRO]: 1,
            [Plan.ENTERPRISE]: 2,
        };

        if (dto.action === Action.UPGRADE &&
            ranks[targetPlan] <= ranks[organization.plan]) {
            throw new BadRequestException('Invalid upgrade');
        }

        if (dto.action === Action.DOWNGRADE &&
            ranks[targetPlan] >= ranks[organization.plan]) {
            throw new BadRequestException('Invalid downgrade');
        }

        if (dto.action === Action.CANCEL &&
            organization.plan === Plan.STARTER) {
            throw new BadRequestException('Already on Starter plan');
        }

        const existing = await this.prisma.subscriptionRequest.findFirst({
            where: {
                org_id: orgId,
                status: RequestStatus.PENDING,
            },
        });

        if (existing) {
            throw new ConflictException('A billing request is already pending');
        }

        const request = await this.prisma.subscriptionRequest.create({
            data: {
                org_id: orgId,
                action: dto.action,
                target_plan: targetPlan,
            },
        });

        const staffEmail = this.config.getOrThrow<string>(
            'BILLING_STAFF_EMAIL',
        );

        const frontendUrl = this.config.getOrThrow<string>(
            'FRONTEND_URL',
        );

        const reviewUrl =
            `${frontendUrl}/staff/billing/${request.id}`;

        await this.mail.sendBillingRequest(
            staffEmail,
            organization.name,
            dto.action,
            organization.plan,
            targetPlan,
            reviewUrl,
        );

        return {
            message: 'Billing request submitted',
            request,
        };
    }

    async reviewRequest(
        id: string,
        dto: ReviewRequestDto,
    ) {
        if (dto.status === RequestStatus.PENDING) {
            throw new BadRequestException('Invalid review status');
        }

        return this.prisma.$transaction(async (tx) => {
            // Claim the pending request atomically so it cannot be
            // approved or rejected twice.
            const claimed = await tx.subscriptionRequest.updateMany({
                where: {
                    id,
                    status: RequestStatus.PENDING,
                },
                data: {
                    status: dto.status,
                },
            });

            if (claimed.count !== 1) {
                throw new ConflictException(
                    'Request not found or already processed',
                );
            }

            const request = await tx.subscriptionRequest.findUniqueOrThrow({
                where: { id },
            });

            if (dto.status === RequestStatus.APPROVED) {
                await tx.organization.update({
                    where: { id: request.org_id },
                    data: {
                        plan: request.target_plan ?? Plan.STARTER,
                    },
                });
            }

            return {
                message: `Request ${dto.status.toLowerCase()}`,
                request,
            };
        });
    }
}