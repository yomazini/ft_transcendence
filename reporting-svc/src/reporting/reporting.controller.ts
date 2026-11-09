import {
	Controller,
	Get,
	Param,
	Headers,
	Query,
	Res,
	StreamableFile,
	BadRequestException,
} from "@nestjs/common";
import { ReportingService } from "./reporting.service";
import { ReportingHeadersDto } from "./dto/headers/reporting-headers.dto";
import type { Response } from "express";
import { MetricsService } from "src/metrics/metrics.service";

@Controller("reporting")
export class ReportingController {
	constructor(
		private readonly reportingService: ReportingService,
		private readonly metrics: MetricsService,
	) {}

	@Get()
	findAll(@Headers() header: ReportingHeadersDto) {
		return this.reportingService.findAll(header);
	}

	@Get(":id/export")
	async exportReport(
		@Param("id") id: string,
		@Headers() header: ReportingHeadersDto,
		@Query("format") format: string = "JSON",
		@Res({ passthrough: true }) res: Response,
	) {
		const fmt = format.toUpperCase();

		if (!["JSON", "CSV", "XLSX"].includes(fmt)) {
			throw new BadRequestException("format must be JSON, CSV or XLSX");
		}
		this.metrics.totalExport.inc({ format });
		const data = await this.reportingService.exportReport(id, header);
		switch (fmt) {
			case "JSON":
				res.set({
					"Content-Type": "application/json",
					"Content-Disposition": `attachment; filename="report-${id}.json"`,
				});
				this.metrics.totalExport.inc({ format });
				return new StreamableFile(
					Buffer.from(JSON.stringify(data, null, 2)),
				);

			case "CSV":
				res.set({
					"Content-Type": "text/csv; charset=utf-8",
					"Content-Disposition": `attachment; filename="report-${id}.csv"`,
				});
				this.metrics.totalExport.inc({ format });
				return new StreamableFile(
					Buffer.from(
						"\uFEFF" + this.reportingService.buildCsv(data),
					),
				);

			case "XLSX":
				res.set({
					"Content-Type":
						"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
					"Content-Disposition": `attachment; filename="report-${id}.xlsx"`,
				});
				this.metrics.totalExport.inc({ format });
				return new StreamableFile(
					await this.reportingService.buildXlsx(data),
				);
		}
	}

	@Get(":id")
	findOne(@Param("id") id: string, @Headers() header: ReportingHeadersDto) {
		return this.reportingService.findOne(id, header);
	}
}
