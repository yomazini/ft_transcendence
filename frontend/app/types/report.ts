export interface Report {
	id : string;
	name : string;
}

export type ReportDetails = {
  // Keep all your existing properties here.

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