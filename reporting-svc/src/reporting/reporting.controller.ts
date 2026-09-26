import { Controller, Get, Post, Body, Patch, Param, Delete, Headers } from '@nestjs/common';
import { ReportingService } from './reporting.service';
import { UpdateReportingDto } from './dto/update-reporting.dto';
import { ReportingHeadersDto } from './dto/headers/reporting-headers.dto';

@Controller('dashboard')
export class ReportingController {
	constructor(private readonly reportingService: ReportingService) {}

	@Get()
	findAll(@Headers() header: ReportingHeadersDto) {
		return this.reportingService.findAll(header);
	}

	@Get(':id')
	findOne(@Param('id') id: string,
			@Headers() header: ReportingHeadersDto) {
		return this.reportingService.findOne(id, header);
	}

	@Patch(':id')
	update(@Param('id') id: string,
			@Headers() header: ReportingHeadersDto) {
		return this.reportingService.update(id, header);
	}

	@Delete(':id')
	remove(@Param('id') id: string,
			@Headers() header: ReportingHeadersDto) {
		return this.reportingService.remove(id, header);
	}
}
