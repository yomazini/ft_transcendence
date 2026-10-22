export interface Report {
	id : string;
	name : string;
}

/** One point of the sentiment chart: a day of the month (or a date string) and its score. */
export type SentimentPoint = {
	day: number | string;
	sentiment_score: number;
};

export type ReportItem = string | { point?: string; action?: string; text?: string };

export type ReportDetails = {
  // Keep all your existing properties here.

  result?: SentimentPoint[];

  swot: {
	strengths: ReportItem[];
	weaknesses: ReportItem[];
	opportunities: ReportItem[];
	threats: ReportItem[];
  };

  // As written by analysis-svc: the four actions are under `strategy`.
  // Keep the top-level arrays for older/mocked responses.
  blue_ocean: {
	factors?: Record<string, { importance: number; satisfaction: number }>;
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
  };

  conclusion?: string;
};

// export interface ReportDetails extends Report {
// 	// extra fields only in the detail response
// }