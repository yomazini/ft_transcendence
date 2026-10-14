export interface Report {
	id : string;
	name : string;
}

/** One point of the sentiment chart: a day of the month (or a date string) and its score. */
export type SentimentPoint = {
	day: number | string;
	sentiment_score: number;
};

export type ReportDetails = {
  // Keep all your existing properties here.

  result?: SentimentPoint[];

  swot: {
	strengths: string[];
	weaknesses: string[];
	opportunities: string[];
	threats: string[];
  };

  blue_ocean: {
	eliminate: string[];
	reduce: string[];
	raise: string[];
	create: string[];
  };
};

// export interface ReportDetails extends Report {
// 	// extra fields only in the detail response
// }