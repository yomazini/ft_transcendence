import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/public.decorator';

@ApiTags('Public API Gateway')
@Controller('api')
@UseGuards(ThrottlerGuard, JwtAuthGuard)
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Gateway Health Check' })
  @ApiResponse({ status: 200, description: 'Gateway service is healthy' })
  getHealth() {
    return { status: 'ok', service: 'gateway-svc' };
  }

  @Post('jobs')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiOperation({ summary: 'Submit a new Social Intelligence extraction job' })
  @ApiResponse({ status: 201, description: 'Job enqueued successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized — missing Bearer token' })
  @ApiResponse({ status: 429, description: 'Too Many Requests — Rate limit exceeded' })
  createJob(@Body() body: CreateJobDto, @Req() req: any) {
    return this.jobsService.createJob(body, req.user);
  }

  @Get('jobs/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get job status by ID' })
  @ApiResponse({ status: 200, description: 'Job status retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getJob(@Param('id') id: string, @Req() req: any) {
    return this.jobsService.getJobById(id, req.user);
  }

  @Get('reports/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Fetch synthesized SWOT & Blue Ocean Strategy Report' })
  @ApiResponse({ status: 200, description: 'Report retrieved' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  getReport(@Param('id') id: string, @Req() req: any) {
    return this.jobsService.getReportByJobId(id, req.user);
  }
}
