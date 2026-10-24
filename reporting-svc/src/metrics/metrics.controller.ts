import { Controller, Get, Res } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { ApiExcludeController } from '@nestjs/swagger';

@Controller('metrics')
export class MetricsController {
	constructor(
		private readonly metrics: MetricsService,
	) {}

	@Get()
	getMetrics(@Res({ passthrough: true }) res) {
		res.set('Content-Type', this.metrics.register.contentType);
		return this.metrics.register.metrics();
	}
}
