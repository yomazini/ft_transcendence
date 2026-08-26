import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('Health check', () => {
    it('should return status ok', () => {
      expect(appController.getHealth()).toEqual({
        status: 'ok',
        service: 'gateway-svc',
      });
    });
  });

  describe('Jobs endpoints', () => {
    it('should create a job stub', () => {
      const res = appController.createJob({
        mode: 'subreddit',
        target: 'r/freelance',
      });
      expect(res).toHaveProperty('id');
      expect(res.status).toBe('queued');
      expect(res.target).toBe('r/freelance');
    });

    it('should retrieve job details stub', () => {
      const res = appController.getJob('job-123');
      expect(res.id).toBe('job-123');
      expect(res.status).toBe('done');
    });
  });

  describe('Reports endpoints', () => {
    it('should return SWOT and Blue Ocean report stub', () => {
      const res = appController.getReport('report-123');
      expect(res.id).toBe('report-123');
      expect(res.swot.strengths.length).toBeGreaterThan(0);
      expect(res.blue_ocean.create.length).toBeGreaterThan(0);
    });
  });
});
