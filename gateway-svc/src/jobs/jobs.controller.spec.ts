import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { DatabaseService } from '../database/database.service';
import { EventsGateway } from '../events/events.gateway';
import { Reflector } from '@nestjs/core';

describe('JobsController', () => {
  let controller: JobsController;
  let service: JobsService;

  const mockUser = {
    id: '01111111-1111-7111-8111-111111111111',
    org_id: '018f2d90-3b41-7e2a-9f12-111122223333',
    email: 'test@acme.com',
    role: 'Admin',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot([
          {
            ttl: 60000,
            limit: 20,
          },
        ]),
      ],
      controllers: [JobsController],
      providers: [JobsService, DatabaseService, EventsGateway, Reflector],
    }).compile();

    controller = module.get<JobsController>(JobsController);
    service = module.get<JobsService>(JobsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getHealth', () => {
    it('should return health status', () => {
      const result = controller.getHealth();
      expect(result).toEqual({ status: 'ok', service: 'gateway-svc' });
    });
  });

  describe('createJob', () => {
    it('should create and enqueue a job', async () => {
      const dto = {
        mode: 'subreddit',
        target: 'r/freelance',
        customer_persona: {
          description: 'budget-conscious freelancers',
          price_sensitivity: 'budget',
          top_priority: 'speed',
        },
      };

      const result = await controller.createJob(dto, { user: mockUser });
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.status).toBe('queued');
      expect(result.target).toBe('r/freelance');
    });
  });

  describe('getJob', () => {
    it('should return job details', async () => {
      const jobId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
      const result = await controller.getJob(jobId, { user: mockUser });
      expect(result).toBeDefined();
      expect(result.id).toBe(jobId);
    });
  });

  describe('getReport', () => {
    it('should return SWOT and Blue Ocean report', async () => {
      const jobId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
      const result = await controller.getReport(jobId, { user: mockUser });
      expect(result).toBeDefined();
      expect(result.swot).toBeDefined();
      expect(result.swot.strengths).toBeInstanceOf(Array);
      expect(result.blue_ocean).toBeDefined();
    });
  });
});
