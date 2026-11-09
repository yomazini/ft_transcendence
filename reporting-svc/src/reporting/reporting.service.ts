import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { ReportingHeadersDto } from "./dto/headers/reporting-headers.dto";
import { PrismaService } from "src/prisma/prisma.service";
import * as ExcelJS from "exceljs";

type CSVRow = {
	section: string;
	category: string;
	name: string;
	value: string | number | null;
	description: string;
};

type SentimentPoint = {
	day: number | string;
	sentiment_score: number | null;
};

type ReportItem =
	| string
	| { point?: string; action?: string; text?: string; description?: string };

export type ReportDetails = {
	result?: SentimentPoint[];

	swot: {
		strengths: ReportItem[];
		weaknesses: ReportItem[];
		opportunities: ReportItem[];
		threats: ReportItem[];
	};

	blue_ocean: {
		factors?: Record<string, { importance: number; satisfaction: number }>;
		features?: {
			name: string;
			priority: string;
			justification: string;
		}[];
		strategy?: {
			eliminate: ReportItem[];
			reduce: ReportItem[];
			raise: ReportItem[];
			create: ReportItem[];
		};
		eliminate?: ReportItem[];
		reduce?: ReportItem[];
		raise?: ReportItem[];
		create?: ReportItem[];
		weakest_suggestion?: string;
	};
	conclusion?: string;
};

function getSow(data: ReportDetails): CSVRow[] {
	const rouws = Object.entries(data.swot).flatMap(([title, items]) =>
		items.map((item) => {
			const description = (item: ReportItem) => {
				if (typeof item === "string") return item;
				return String(
					item.point ??
						item.text ??
						item.action ??
						item.description ??
						JSON.stringify(item),
				);
			};
			return {
				section: "SWOT",
				category: title,
				name: "",
				value: "",
				description: description(item),
			};
		}),
	);
	return rouws;
}

function getFeatures(data: ReportDetails): CSVRow[] {
	if (!data.blue_ocean.features) return [];

	return data.blue_ocean.features.map((item) => ({
		section: "BlueOcean",
		category: "features",
		name: item.name,
		value: item.priority,
		description: item.justification,
	}));
}

function getResult(data: ReportDetails): CSVRow[] {
	if (!data.result) return [];

	return data.result.map((item) => ({
		section: "Result",
		category: "Result",
		name: "",
		value: item.sentiment_score,
		description: `Date: ${item.day}`,
	}));
}

function getFactors(data: ReportDetails): CSVRow[] {
	if (!data.blue_ocean.factors) return [];

	return Object.entries(data.blue_ocean.factors).map(([name, item]) => ({
		section: "Blue Ocean",
		category: "Factors",
		name,
		value: item.importance,
		description: `Satisfaction: ${item.satisfaction}`,
	}));
}

function getBlueOcean(data: ReportDetails): CSVRow[] {
	const blueOcean = data.blue_ocean;

	const strategy = blueOcean.strategy ?? {
		eliminate: blueOcean.eliminate ?? [],
		reduce: blueOcean.reduce ?? [],
		raise: blueOcean.raise ?? [],
		create: blueOcean.create ?? [],
	};

	return Object.entries(strategy).flatMap(([title, items]) => {
		const description = (item: ReportItem) => {
			if (typeof item === "string") return item;
			return String(
				item.point ??
					item.text ??
					item.action ??
					item.description ??
					JSON.stringify(item),
			);
		};
		return items.map((item) => ({
			section: "BlueOcean",
			category: title,
			name: title,
			value: "",
			description: description(item),
		}));
	});
}

function getWeakestSuggestion(data: ReportDetails): CSVRow[] {
	if (!data.blue_ocean.weakest_suggestion) return [];

	return [
		{
			section: "Blue Ocean",
			category: "WeakestSuggestion",
			name: "",
			value: "",
			description: data.blue_ocean.weakest_suggestion,
		},
	];
}

function getConclusion(data: ReportDetails): CSVRow[] {
	if (!data.conclusion) return [];

	return [
		{
			section: "Conclusion",
			category: "Conclusion",
			name: "",
			value: "",
			description: data.conclusion,
		},
	];
}

function getRows(data: ReportDetails): CSVRow[] {
	return [
		...getResult(data),
		...getSow(data),
		...getFactors(data),
		...getFeatures(data),
		...getBlueOcean(data),
		...getWeakestSuggestion(data),
		...getConclusion(data),
	];
}

function addEscape(value: string | number): string {
	const text = String(value ?? "");
	return `"${text.replace(/"/g, '""')}"`;
}

@Injectable()
export class ReportingService {
	constructor(private readonly prisma: PrismaService) {}

	async ReportsSentimentsEx(id: string): Promise<SentimentPoint[] | null> {
		const allReports = await this.prisma.report.findMany({
			where: {
				job_id: id,
			},
			select: {
				sentiment_score: true,
				created_at: true,
			},
			orderBy: [{ created_at: "desc" }, { id: "desc" }],
		});
		if (allReports.length === 0) {
			throw new NotFoundException(
				"There is no report with this ID, or this report has no comments.",
			);
		}
		const result = allReports.map((item) => {
			const reportSentiment: SentimentPoint = {
				day: item.created_at.toISOString(),
				sentiment_score: item.sentiment_score ?? 0,
			};
			return reportSentiment;
		});
		return result;
	}

	async ReportsSentiments(id: string): Promise<SentimentPoint[] | null> {
		const allReports = await this.prisma.report.findMany({
			where: {
				job_id: id,
			},
			select: {
				sentiment_score: true,
				created_at: true,
			},
			orderBy: [{ created_at: "desc" }, { id: "desc" }],
		});
		if (allReports.length === 0) {
			throw new NotFoundException(
				"There is no report with this ID, or this report has no comments.",
			);
		}
		const daily = new Map<string, SentimentPoint>();
		for (const report of allReports) {
			const day = report.created_at.toISOString().slice(0, 10);

			if (!daily.has(day)) {
				daily.set(day, {
					day,
					sentiment_score: report.sentiment_score ?? 0,
				});
			}
		}
		return Array.from(daily.values());
	}

	async getLastReport(id: string, ex: boolean): Promise<ReportDetails> {
		const lastReport = await this.prisma.report.findFirst({
			where: {
				job_id: id,
			},
			select: {
				id: true,
				swot: true,
				blue_ocean: true,
				conclusion: true,
				sentiment_score: true,
				created_at: true,
				job: {
					select: {
						comments: {
							select: {
								sentiment_score: true,
							},
						},
					},
				},
			},
			orderBy: [{ created_at: "desc" }, { id: "desc" }],
		});
		if (!lastReport) {
			throw new NotFoundException(
				"There is no report with this ID, or this report has no comments.",
			);
		}
		if (lastReport.sentiment_score === null) {
			const counter = {
				total: 0,
				count: 0,
			};
			for (const comment of lastReport.job.comments) {
				counter.total += comment.sentiment_score ?? 0;
				counter.count++;
			}
			const date = new Date(lastReport.created_at);
			const day = date.toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
				timeZone: "UTC",
			});
			await this.prisma.report.update({
				where: {
					id: lastReport.id,
				},
				data: {
					sentiment_score:
						counter.total / (counter.count > 0 ? counter.count : 1),
				},
			});
		}
		const result = {
			result: (ex === true
				? await this.ReportsSentimentsEx(id)
				: await this.ReportsSentiments(id)) as ReportDetails["result"],
			swot: lastReport.swot as ReportDetails["swot"],
			blue_ocean: lastReport.blue_ocean as ReportDetails["blue_ocean"],
			conclusion: lastReport?.conclusion ?? undefined,
		};
		console.log(result);
		return result;
	}

	buildCsv(data: ReportDetails): string {
		const rows = getRows(data);
		const headers: (keyof CSVRow)[] = [
			"section",
			"category",
			"name",
			"value",
			"description",
		];
		const result = rows.map((items) => {
			return headers
				.map((key) => {
					return addEscape(items[key] ?? "");
				})
				.join(",");
		});
		return [headers.join(","), ...result].join("\r\n");
	}

	async buildXlsx(data: ReportDetails): Promise<Buffer> {
		const rows = getRows(data);

		const Workbook = new ExcelJS.Workbook();
		const worksheet = Workbook.addWorksheet("Report");

		worksheet.columns = [
			{ header: "Section", key: "section", width: 20 },
			{ header: "category", key: "category", width: 20 },
			{ header: "Name", key: "name", width: 30 },
			{ header: "Value", key: "value", width: 20 },
			{ header: "Description", key: "description", width: 50 },
		];
		worksheet.addRows(rows);
		const buffer = await Workbook.xlsx.writeBuffer();

		return Buffer.from(buffer);
	}

	async findAll(header: ReportingHeadersDto) {
		if (!header["org-id"]) {
			throw new BadRequestException("org-id header is required");
		}
		const organization = await this.prisma.organization.findUnique({
			where: {
				id: header["org-id"],
			},
		});

		if (!organization) {
			throw new NotFoundException(
				"there is no organization with this id",
			);
		}
		const jobs = await this.prisma.job.findMany({
			where: {
				org_id: header["org-id"],
			},
			select: {
				target: true,
			},
		});
		if (jobs.length === 0) {
			throw new NotFoundException("there is no job");
		}
		return jobs;
	}

	async findOne(id: string, header: ReportingHeadersDto) {
		if (!header["org-id"]) {
			throw new NotFoundException(
				"there is no organization with this id",
			);
		}

		const organization = await this.prisma.organization.findUnique({
			where: {
				id: header["org-id"],
			},
		});

		if (!organization) {
			throw new NotFoundException(
				"there is no organization with this id",
			);
		}
		const oJob = await this.prisma.job.findFirst({
			where: { id, org_id: header["org-id"] },
		});

		if (!oJob) {
			throw new NotFoundException("Job not found");
		}

		return await this.getLastReport(id, false);
	}

	async exportReport(
		id: string,
		header: ReportingHeadersDto,
	): Promise<ReportDetails> {
		if (!header["org-id"]) {
			throw new BadRequestException("org-id header is required");
		}

		const organization = await this.prisma.organization.findUnique({
			where: {
				id: header["org-id"],
			},
		});

		if (!organization) {
			throw new NotFoundException(
				"there is no organization with this id",
			);
		}

		const oJob = await this.prisma.job.findFirst({
			where: { id, org_id: header["org-id"] },
		});

		if (!oJob) {
			throw new NotFoundException("Job not found");
		}

		return await this.getLastReport(id, true);
	}
}
