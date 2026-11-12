
"use client";

import Strategic from "./Strategic";
import { Lightbulb, Target, Waves } from "lucide-react";
import SectionTitle from "./SectionTitle";
import { useMembers } from "@/hooks/useMembers";
import { Users } from "lucide-react";
import { ReportDetails } from "@/app/types/report";

export default function StrategicUsers({ report, loading } : { report : ReportDetails | null, loading : boolean}) {
	const { members } = useMembers();
	const totalUsers = members.length;
	const admins = members.filter((m) => m.role === "Admin").length;
	const allocatedUsers = admins;

	const totalBars = 80;
	const allocatedBars = totalUsers > 0
		? Math.round((allocatedUsers / totalUsers) * totalBars)
		: 0;

	return (
		// <section className="grid min-w-0 grid-cols-1 gap-4 2xl:grid-cols-3">

			<Strategic report={report} loading={loading}/>

			
		// </section>
	);
}
