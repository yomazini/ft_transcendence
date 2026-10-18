import {
    Controller,
    Get,
    Post,
    Patch,
    Param,
    Body,
    Req,
    UseGuards,
} from '@nestjs/common';

import { BillingService } from './billing.service';
import { RequestPlanDto } from './dto/request-plan.dto';
import { ReviewRequestDto } from './dto/review-request.dto';

// Replace with your existing authentication guard.
import { JwtGuard } from '../auth/guard/jwt.guard';

@Controller('billing')
@UseGuards(JwtGuard)
export class BillingController {
    constructor(private readonly billing: BillingService) { }

    @Get(':orgId')
    getBilling(
        @Param('orgId') orgId: string,
        @Req() req: any,
    ) {
        return this.billing.getBilling(orgId, req.user.id);
    }

    @Post(':orgId/request')
    requestChange(
        @Param('orgId') orgId: string,
        @Req() req: any,
        @Body() dto: RequestPlanDto,
    ) {
        return this.billing.requestChange(
            orgId,
            req.user.id,
            dto,
        );
    }

    @Patch('requests/:id')
    reviewRequest(
        @Param('id') id: string,
        @Body() dto: ReviewRequestDto,
    ) {
        return this.billing.reviewRequest(id, dto);
    }
}