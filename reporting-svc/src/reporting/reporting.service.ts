import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReportingDto } from './dto/create-reporting.dto';
import { UpdateReportingDto } from './dto/update-reporting.dto';
import { ReportingHeadersDto } from './dto/headers/reporting-headers.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ReportingService {

constructor(private readonly prisma: PrismaService) {}

	async findAll(header: ReportingHeadersDto) {
		const organization = await this.prisma.organization.findUnique({
			where : {
				id: header['org-id'],
			}
		})

		if (organization === undefined) {
			throw new NotFoundException('there is no organization with this id');
		}
		const reports = await this.prisma.report.findMany({
			where : {
				job: {
					org_id: header['org-id'],
				}
			}
		})
		if (reports.length === 0)
			return "No report yet";
		return reports;
	}

	async findOne(id: string, header: ReportingHeadersDto) {
		const organization = await this.prisma.organization.findUnique({
			where : {
				id: header['org-id'],
			}
		})

		if (organization === undefined) {
			throw new NotFoundException('there is no organization with this id');
		}
		const reports = await this.prisma.report.findUnique({
			where : {
				id: id,
				job: {
					org_id: header['org-id'],
				},
			}
		})
		if (reports === undefined){
			throw new NotFoundException('there is no report with this id');
		}
		return ;
	}

	update(id: string, updateReportingDto: UpdateReportingDto) {
		return `This action updates a #${id} reporting`;
	}

	async remove(id: string, header: ReportingHeadersDto) {
		const organization = await this.prisma.organization.findUnique({
			where : {
				id: header['org-id'],
			}
		})

		if (organization === undefined) {
			throw new NotFoundException('there is no organization with this id');
		}
		this.prisma.report.delete({
			where : {
				id: id,
				job: {
					org_id: header['org-id'],
				},
			}
		})
	}
}
