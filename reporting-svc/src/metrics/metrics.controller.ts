import { Controller, Get, Res } from "@nestjs/common";
import { MetricsService } from "./metrics.service";
import type { Response } from "express";

@Controller("metrics")
export class MetricsController {
	constructor(private readonly metrics: MetricsService) {}

	@Get()
	getMetrics(@Res({ passthrough: true }) res: Response) {
		res.set("Content-Type", this.metrics.register.contentType);
		return this.metrics.register.metrics();
	}
}
