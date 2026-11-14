import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { Public } from '../auth/public.decorator';
import { ApiExcludeController } from '@nestjs/swagger';
import { register } from './metrics';

@ApiExcludeController()
@Controller('metrics')
export class MetricsController {
  @Public()
  @Get()
  async metrics(@Res() res: Response) {
    res.setHeader('Content-Type', register.contentType);
    res.end(await register.metrics());
  }
}
