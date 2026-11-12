import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UpdateJobDto } from './dto/update-job.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiSecurity,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ApiKeyThrottlerGuard } from '../auth/api-key-throttler.guard';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { RagQueryDto } from './dto/rag-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/public.decorator';
import { RolesGuard } from '../auth/roles.guards';
import { Roles } from '../auth/roles.decorators';
import { RequeueJobDto } from './dto/requeueJob.dto';

@ApiTags('Public API Gateway')
@ApiSecurity('api-key')
@Controller('api')
@UseGuards(ApiKeyThrottlerGuard, JwtAuthGuard, RolesGuard)
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
  @Roles('Admin', 'Analyst')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiOperation({ summary: 'Submit a new Social Intelligence extraction job' })
  @ApiResponse({ status: 201, description: 'Job enqueued successfully' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized — missing Bearer token',
  })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests — Rate limit exceeded',
  })
  createJob(@Body() body: CreateJobDto, @Req() req: any) {
    return this.jobsService.createJob(
      body,
      req.user,
      req.headers?.authorization,
    );
  }

  @Post('jobs/requeue')
  @HttpCode(HttpStatus.OK)
  @Roles('Admin', 'Analyst')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Queue an existing job again' })
  @ApiResponse({ status: 200, description: 'Job queued' })
  @ApiResponse({ status: 409, description: 'Job is running' })
  requeueJob(@Body() dto: RequeueJobDto, @Req() req: any) {
    return this.jobsService.requeueJob(dto.id, req.user);
  }

  @Put('jobs/:id')
  @Roles('Admin', 'Analyst')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a job target/mode/persona' })
  @ApiResponse({ status: 200, description: 'Job updated' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  updateJob(
    @Param('id') id: string,
    @Body() body: UpdateJobDto,
    @Req() req: any,
  ) {
    return this.jobsService.updateJob(id, body, req.user);
  }

  @Delete('jobs/:id')
  @Roles('Admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a job and its comments/report' })
  @ApiResponse({ status: 204, description: 'Job deleted' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async deleteJob(@Param('id') id: string, @Req() req: any): Promise<void> {
    await this.jobsService.deleteJob(id, req.user);
  }

  @Post('rag/query')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @ApiOperation({ summary: "Ask a question about one job's comments (RAG)" })
  @ApiResponse({ status: 200, description: 'Answer with cited comments' })
  @ApiResponse({
    status: 404,
    description: 'Job not found, or no analyzed comments yet',
  })
  ragQuery(@Body() body: RagQueryDto, @Req() req: any) {
    return this.jobsService.ragQuery(body.job_id, body.query, req.user);
  }

  @Get('jobs')
  @ApiBearerAuth()
  @ApiOperation({
    summary: "List the caller's organization jobs with their status",
  })
  @ApiResponse({ status: 200, description: 'Jobs, newest first' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  listJobs(@Req() req: any) {
    return this.jobsService.listJobs(req.user);
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
  @ApiOperation({
    summary: 'Fetch the latest SWOT & Blue Ocean Strategy Report for a job',
  })
  @ApiResponse({ status: 200, description: 'Report retrieved' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  getReport(@Param('id') id: string, @Req() req: any) {
    return this.jobsService.getReportByJobId(id, req.user);
  }
}
