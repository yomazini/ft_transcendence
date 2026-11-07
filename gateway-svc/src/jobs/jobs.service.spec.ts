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
