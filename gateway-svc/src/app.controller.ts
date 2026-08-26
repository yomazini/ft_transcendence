import { Controller, Get, Post, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';

export interface CreateJobDto {
  mode: 'keyword' | 'subreddit' | 'post' | 'user';
  target: string;
  customer_persona?: {
    description?: string;
    price_sensitivity?: 'budget' | 'mid-market' | 'premium';
    top_priority?: string;
  };
}

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  getHealth() {
    return { status: 'ok', service: 'gateway-svc' };
  }

  @Post('jobs')
  @HttpCode(HttpStatus.CREATED)
  createJob(@Body() body: CreateJobDto) {
    return {
      id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      org_id: '7ca24e12-8812-4211-9a1c-1f482d88efa1',
      created_by: '1ea34f12-3312-4111-8a1c-2f382d77efa3',
      mode: body.mode || 'subreddit',
      target: body.target || 'r/freelance',
      customer_persona: body.customer_persona || {
        description: 'budget-conscious college students',
        price_sensitivity: 'budget',
        top_priority: 'speed',
      },
      status: 'queued',
      created_at: new Date().toISOString(),
    };
  }

  @Get('jobs/:id')
  getJob(@Param('id') id: string) {
    return {
      id,
      org_id: '7ca24e12-8812-4211-9a1c-1f482d88efa1',
      created_by: '1ea34f12-3312-4111-8a1c-2f382d77efa3',
      mode: 'subreddit',
      target: 'r/freelance',
      status: 'done',
      created_at: new Date().toISOString(),
    };
  }

  @Get('reports/:id')
  getReport(@Param('id') id: string) {
    return {
      id,
      job_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      swot: {
        strengths: ['Strong organic community engagement', 'Clear user pain points identified'],
        weaknesses: ['High competitor brand loyalty', 'Pricing complaints in lower tiers'],
        opportunities: ['Demand for automated micro-SaaS reporting', 'Unserved niche in EU region'],
        threats: ['Fast-moving incumbents with API lock-in'],
      },
      blue_ocean: {
        eliminate: ['Manual survey calls', 'Bloated enterprise setup wizards'],
        reduce: ['Report generation latency', 'Cost per analyzed post'],
        raise: ['Actionable sentiment resolution', 'Traceability to original comments'],
        create: ['One-click executive SWOT synthesis', 'Interactive pgvector semantic chat'],
      },
      created_at: new Date().toISOString(),
    };
  }
}
