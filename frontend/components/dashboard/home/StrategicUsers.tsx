
"use client";

import Strategic from "./Strategic";
import { ReportDetails } from "@/app/types/report";

export default function StrategicUsers({ report, loading } : { report : ReportDetails | null, loading : boolean}) {
	return (
			<Strategic report={report} loading={loading}/>
	);
}
