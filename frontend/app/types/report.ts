export interface Report {
	id: string;
	name: string;
}

export type SentimentPoint = {
	day: number | string;
	sentiment_score: number;
};

export type ReportItem = string | { point?: string; action?: string; text?: string };

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
