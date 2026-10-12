import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateReportingDto } from './dto/update-reporting.dto';
import { ReportingHeadersDto } from './dto/headers/reporting-headers.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Parser } from '@json2csv/plainjs/index.js';
	import * as ExcelJS from 'exceljs';


@Injectable()
export class ReportingService {

	constructor(private readonly prisma: PrismaService) {}

	buildCsv(data: any): string {
		const cell = (v: unknown) => {
			if (v === null || v === undefined) return '';
			if (v instanceof Date) return v.toISOString();
			if (typeof v === 'object') return JSON.stringify(v);
			return v;
		};

		const summary: Record<string, unknown> = {};
		for (const [key, value] of Object.entries(data)) {
			if (!Array.isArray(value)) summary[key] = cell(value);
		}

		const comments: Record<string, unknown>[] = data.comments ?? [];
		if (comments.length === 0) return new Parser().parse([summary]);

		const rows = comments.map((c) => ({
			...summary,
			...Object.fromEntries(
				Object.entries(c).map(([k, v]) => [`comment_${k}`, cell(v)]),
			),
		}));

		return new Parser().parse(rows);
	}


	async buildXlsx(data: any): Promise<Buffer> {
		const wb = new ExcelJS.Workbook();

		const summary = wb.addWorksheet('Summary');
		summary.columns = [
			{ header: 'Field', key: 'field', width: 25 },
			{ header: 'Value', key: 'value', width: 80 },
		];

		const cell = (v: unknown) => {
			if (v === null || v === undefined) return '';
			if (v instanceof Date) return v;
			if (typeof v === 'object') return JSON.stringify(v, null, 2);
			return v as string | number | boolean;
		};

		for (const [key, value] of Object.entries(data)) {
			const isTable =
				Array.isArray(value) && value.length > 0 && typeof value[0] === 'object';

			if (isTable) {
				const rows = value as Record<string, unknown>[];
				const sheet = wb.addWorksheet(key.slice(0, 31));

				const keys = [...new Set(rows.flatMap((r) => Object.keys(r)))];
				sheet.columns = keys.map((k) => ({ header: k, key: k, width: 25 }));
				sheet.addRows(
					rows.map((r) => Object.fromEntries(keys.map((k) => [k, cell(r[k])]))),
				);
				sheet.getRow(1).font = { bold: true };
			} else {
				summary.addRow({ field: key, value: cell(value) });
			}
		}

		summary.getRow(1).font = { bold: true };
		summary.getColumn('value').alignment = { wrapText: true, vertical: 'top' };

		return Buffer.from(await wb.xlsx.writeBuffer());
	}

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
		const jobs = await this.prisma.job.findMany({
			where: {
				org_id: header['org-id'],
		},
		select: {
			id: true,
		},
		});
		if (jobs.length === 0) {
			throw new NotFoundException('there is no job');
		}
		return jobs;
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
		const oJob = await this.prisma.job.findFirst({
			where: { id, org_id: header['org-id'] },
			select: { id: true },
		});

		if (!oJob) {
			throw new NotFoundException('Job not found');
		}

		const report = await this.prisma.report.findFirst({
			where: {
				job_id: id,
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

			const day = date.toLocaleString("en-US", {
				month: "short",
				day: "numeric",
				timeZone: "UTC",
			});
			const current = monthly.get(day);
			if (current){
				current.total += Number(comment.sentiment_score ?? 0);
				current.count++;
			} else {
				monthly.set(day, {
					total: Number(comment.sentiment_score ?? 0),
					count: 1,
				});
			}
		}
		const result = Array.from(monthly.entries()).sort(([dayA], [dayB]) => {
			const dateA = new Date(`${dayA} 2026`);
			const dateB = new Date(`${dayB} 2026`);

			return dateA.getTime() - dateB.getTime();
		}).map(([day, data]) => ({
			day,
			sentiment_score: data.total / data.count,
		}));
		const {job, ...reportdata} = report;
		const response = {
			...reportdata,
			result,
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
			where: {
				id: header['org-id'],
			},
		});

		if (!organization) {
			throw new NotFoundException('there is no organization with this id');
		}
		const oJob = await this.prisma.job.findFirst({
			where: { id, org_id: header['org-id'] },
			select: { id: true },
		});

		if (!oJob) {
			throw new NotFoundException('Job not found');
		}

		await this.prisma.job.delete({
			where: {
				id: id,
				org_id: header['org-id'],
			},
		});
	}

	async exportReport(id: string, header: ReportingHeadersDto) {
		if (!header['org-id']) {
			throw new BadRequestException('org-id header is required');
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
			},
			select: {
				swot: true,
				blue_ocean: true,
				job: {
					select: {
						target: true,
						mode: true,
						org_id: true,
						comments: {
							select: {
								sentiment_score: true,
								created_at: true,
								text: true,
								upvotes: true,
								author: true,
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

			const day = date.toLocaleString("en-US", {
				month: "short",
				day: "numeric",
				timeZone: "UTC",
			});
			const current = monthly.get(day);
			if (current){
				current.total += Number(comment.sentiment_score ?? 0);
				current.count++;
			} else {
				monthly.set(day, {
					total: Number(comment.sentiment_score ?? 0),
					count: 1,
				});
			}
		}
		const VADER = Array.from(monthly.entries()).sort(([dayA], [dayB]) => {
			const dateA = new Date(`${dayA} 2026`);
			const dateB = new Date(`${dayB} 2026`);

			return dateA.getTime() - dateB.getTime();
		}).map(([day, data]) => ({
			day,
			sentiment_score: data.total / data.count,
		}));

		let sum = 0;
		for (const vader of VADER) {
			sum += vader.sentiment_score;
		}

		const { job, ...reportdata } = report;
		const { comments, ...jobinfo } = job;

		const Total = VADER.length ? sum / VADER.length : 0;

		return {
			...reportdata,
			...jobinfo,
			comments,
			VADER,
			Total,
		};
	}
}
