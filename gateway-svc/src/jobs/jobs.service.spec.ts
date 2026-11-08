import { ConflictException } from '@nestjs/common';
import { JobsService } from './jobs.service';

describe('JobsService.deleteJob', () => {
  const user = { id: 'u-1', org_id: 'o-1', role: 'Admin' };
  const runningJob = {
    id: 'j-1',
    org_id: 'o-1',
    status: 'running',
  } as any;

  it('rejects deleting a running job without touching the DB', async () => {
    const database = { deleteJob: jest.fn() };
    const service = new JobsService(database as any, {} as any);
    jest.spyOn(service, 'getJobById').mockResolvedValue(runningJob);

    await expect(service.deleteJob('j-1', user)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(database.deleteJob).not.toHaveBeenCalled();
  });

  it('removes a queued scrape job before deleting the row', async () => {
    const database = { deleteJob: jest.fn() };
    const service = new JobsService(database as any, {} as any);
    jest.spyOn(service, 'getJobById').mockResolvedValue({
      ...runningJob,
      status: 'Queued',
    });
    (service as any).scrapeQueue = {
      remove: jest.fn().mockResolvedValue(1),
      getJobs: jest.fn(),
    };

    await service.deleteJob('j-1', user);

    expect((service as any).scrapeQueue.remove).toHaveBeenCalledWith('j-1');
    expect(database.deleteJob).toHaveBeenCalledWith('j-1', 'o-1');
  });

  it('deletes failed and done jobs without touching the queue', async () => {
    const database = { deleteJob: jest.fn() };
    const service = new JobsService(database as any, {} as any);
    jest.spyOn(service, 'getJobById').mockResolvedValue({
      ...runningJob,
      status: 'failed',
    });
    (service as any).scrapeQueue = undefined;

    await service.deleteJob('j-1', user);

    expect(database.deleteJob).toHaveBeenCalledWith('j-1', 'o-1');
  });
});

describe('JobsService.requeueJob', () => {
  const user = { id: 'u-1', org_id: 'o-1', role: 'Admin' };
  const doneJob = {
    id: 'j-1',
    org_id: 'o-1',
    created_by: 'u-1',
    target: 'r/test',
    mode: 'Post',
    status: 'done',
    customer_persona: { description: 'test' },
  } as any;

  it('clears old comments and report before queueing a done job', async () => {
    const database = {
      clearJobAnalysis: jest.fn().mockResolvedValue(undefined),
      updateJobStatus: jest.fn().mockResolvedValue(undefined),
    };
    const events = { broadcastJobStatus: jest.fn() };
    const service = new JobsService(database as any, events as any);
    jest.spyOn(service, 'getJobById').mockResolvedValue(doneJob);
    (service as any).scrapeQueue = {
      add: jest.fn().mockResolvedValue({ id: 'queue-1' }),
    };

    await service.requeueJob('j-1', user);

    expect(database.clearJobAnalysis).toHaveBeenCalledWith('j-1');
    expect((service as any).scrapeQueue.add).toHaveBeenCalledWith(
      'scrape',
      expect.objectContaining({ id: 'j-1', target: 'r/test' }),
      expect.objectContaining({
        attempts: 3,
        jobId: expect.stringMatching(/^j-1-\d+$/),
      }),
    );
    expect(database.updateJobStatus).toHaveBeenCalledWith('j-1', 'Queued');
    expect(events.broadcastJobStatus).toHaveBeenCalledWith('j-1', 'queued');
  });

  it('rejects a running job', async () => {
    const database = {
      clearJobAnalysis: jest.fn(),
      updateJobStatus: jest.fn(),
    };
    const service = new JobsService(database as any, {} as any);
    jest.spyOn(service, 'getJobById').mockResolvedValue({
      ...doneJob,
      status: 'running',
    });

    await expect(service.requeueJob('j-1', user)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(database.clearJobAnalysis).not.toHaveBeenCalled();
  });

  it('removes the old queue entry for a queued job', async () => {
    const database = {
      clearJobAnalysis: jest.fn(),
      updateJobStatus: jest.fn().mockResolvedValue(undefined),
    };
    const events = { broadcastJobStatus: jest.fn() };
    const service = new JobsService(database as any, events as any);
    jest.spyOn(service, 'getJobById').mockResolvedValue({
      ...doneJob,
      status: 'queued',
    });
    (service as any).scrapeQueue = {
      remove: jest.fn().mockResolvedValue(1),
      getJobs: jest.fn(),
      add: jest.fn().mockResolvedValue({ id: 'queue-2' }),
    };

    await service.requeueJob('j-1', user);

    expect((service as any).scrapeQueue.remove).toHaveBeenCalledWith('j-1');
    expect(database.clearJobAnalysis).not.toHaveBeenCalled();
  });
});
