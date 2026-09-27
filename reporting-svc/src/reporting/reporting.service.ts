import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateReportingDto } from './dto/create-reporting.dto';
import { UpdateReportingDto } from './dto/update-reporting.dto';
import { ReportingHeadersDto } from './dto/headers/reporting-headers.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { map } from 'rxjs';

@Injectable()
export class ReportingService {

constructor(private readonly prisma: PrismaService) {}

	async findAll(header: ReportingHeadersDto) {
		if (!header['org-id']) {
			throw new BadRequestException('org-id header is required');
		}
		const organization = await this.prisma.organization.findUnique({
			where : {
				id: header['org-id'],
			}
		})

		if (!organization) {
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
		if (!header['org-id']) {
			throw new NotFoundException('there is no organization with this id');
		}

		const organization = await this.prisma.organization.findUnique({
			where: {
				id: header['org-id'],
			},
		});

		if (!organization) {
			throw new NotFoundException('there is no organization with this id');
		}

		const report = await this.prisma.report.findFirst({
			where: {
				job_id: id,
				job: {
					org_id: header['org-id'],
				},
			},
			include: {
				job: {
					include: {
						comments: {
							select: {
								sentiment_score: true,
								created_at: true,
							},
						},
					},
				},
			},
		});
		if (!report) {
			throw new NotFoundException('there is no report with this id');
		}

		const monthly = new Map<string, {total: number, count: number}>();
		for (const comment of report.job.comments)
		{
			const date = new Date(comment.created_at);

			const month = date.getUTCFullYear() + "-" + String(date.getUTCMonth() + 1).padStart(2, "0");
			console.log(month);
			const current = monthly.get(month);
			if (current){
				current.total += comment.sentiment_score;
				current.count++;
			} else {
				monthly.set(month, {
					total: comment.sentiment_score,
					count: 1,
				});
			}
		}
		const resoult = Array.from(monthly.entries()).map(([month, data]) => ({
			month,
			sentiment_score: data.total / data.count,
		}));

		const {job, ...reportdata} = report;
		const response = {
			...reportdata,
			resoult,
		}
		return response;
	}

	update(id: string, updateReportingDto: UpdateReportingDto) {
		return `This action updates a #${id} reporting`;
	}

	async remove(id: string, header: ReportingHeadersDto) {
		if (!header['org-id']) {
			throw new BadRequestException('org-id header is required');
		}
		const organization = await this.prisma.organization.findUnique({
			where : {
				id: header['org-id'],
			}
		})

		if (!organization) {
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
