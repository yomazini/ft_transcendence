import { ForbiddenException } from '@nestjs/common';
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

    // Unit tests do not call auth-svc; use a deterministic plan.
    jest
      .spyOn(service as any, 'getPlanLimit')
      .mockResolvedValue({ plan: 'free', maxJobs: 5 });

    // createJob now fails fast when the queue is unavailable.
    (service as any).scrapeQueue = {
      add: jest.fn().mockResolvedValue({ id: 'queue-job-1' }),
    };
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
      expect(result.status).toBe('Queued');
      expect(result.target).toBe('r/freelance');
    });

    it('rejects the job when the plan limit is reached', async () => {
      jest
        .spyOn((service as any).databaseService, 'saveJobWithLimit')
        .mockResolvedValue(false);

      await expect(
        controller.createJob(
          {
            mode: 'post',
            target: 'https://www.reddit.com/r/test/comments/x/y/',
          },
          { user: mockUser },
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('uses the organization description when no persona is sent', async () => {
      const database = (service as any).databaseService;
      const spy = jest
        .spyOn(database, 'findOrganizationDescription')
        .mockResolvedValue('We build scheduling software for freelancers');

      const result = await controller.createJob(
        { mode: 'post', target: 'https://www.reddit.com/r/test/comments/x/y/' },
        { user: mockUser },
      );

      expect(result.customer_persona.description).toBe(
        'We build scheduling software for freelancers',
      );
      spy.mockRestore();
    });
  });

  describe('getJob', () => {
    it('should return a created job', async () => {
      const created = await controller.createJob(
        { mode: 'post', target: 'https://www.reddit.com/r/test/comments/x/y/' },
        { user: mockUser },
      );

      const result = await controller.getJob(created.id, { user: mockUser });
      expect(result).toBeDefined();
      expect(result.id).toBe(created.id);
    });
  });

  describe('getReport', () => {
    it('should return the report for a created job', async () => {
      const database = (service as any).databaseService;
      const created = await controller.createJob(
        { mode: 'post', target: 'https://www.reddit.com/r/test/comments/x/y/' },
        { user: mockUser },
      );

      const spy = jest.spyOn(database, 'findReportByJobId').mockResolvedValue({
        id: 'report-1',
        job_id: created.id,
        swot: { strengths: ['Fast support'] },
        blue_ocean: { factors: {} },
        conclusion: 'Good product.',
        created_at: new Date().toISOString(),
      });

      const result = await controller.getReport(created.id, { user: mockUser });
      expect(result).toBeDefined();
      expect(result.swot.strengths).toBeInstanceOf(Array);
      expect(result.blue_ocean).toBeDefined();
      spy.mockRestore();
    });
  });

  describe('listReports', () => {
    it('returns all reports for a job, newest first', async () => {
      const database = (service as any).databaseService;
      const created = await controller.createJob(
        { mode: 'post', target: 'https://www.reddit.com/r/test/comments/x/y/' },
        { user: mockUser },
      );
      const reports = [
        {
          id: 'report-2',
          job_id: created.id,
          swot: { strengths: [] },
          blue_ocean: { factors: {} },
          conclusion: 'Nov 2',
          created_at: new Date().toISOString(),
        },
        {
          id: 'report-1',
          job_id: created.id,
          swot: { strengths: [] },
          blue_ocean: { factors: {} },
          conclusion: 'Nov 1',
          created_at: new Date(0).toISOString(),
        },
      ];
      const spy = jest
        .spyOn(database, 'findReportsByJobId')
        .mockResolvedValue(reports);

      const result = await controller.listReports(created.id, {
        user: mockUser,
      });

      expect(result).toHaveLength(2);
      expect(result[0].conclusion).toBe('Nov 2');
      spy.mockRestore();
    });
  });

  describe('EventsGateway', () => {
    it('should emit job:done and job:update events to the org room', async () => {
      const database = {
        findJobById: jest
          .fn()
          .mockResolvedValue({ id: 'job-123', org_id: 'org-1' }),
      } as any;
      const gateway = new EventsGateway(database);
      const emitMock = jest.fn();
      const toMock = jest.fn().mockReturnValue({ emit: emitMock });
      gateway.server = { to: toMock } as any;

      await gateway.broadcastJobStatus('job-123', 'done', {
        report_id: 'rep-456',
      });

      expect(toMock).toHaveBeenCalledWith('org-1');
      expect(emitMock).toHaveBeenCalledWith('job:done', {
        job_id: 'job-123',
        status: 'done',
        report_id: 'rep-456',
      });
      expect(emitMock).toHaveBeenCalledWith('job:update', {
        job_id: 'job-123',
        status: 'done',
        report_id: 'rep-456',
      });
    });
  });
});
