"use client";

import Strategic from "./Strategic";
import { Lightbulb, Target, Waves } from "lucide-react";
import SectionTitle from "./SectionTitle";
import { useMembers } from "@/hooks/useMembers";
import { Users } from "lucide-react";



export default function StrategicUsers() {
	const { members } = useMembers();
	const totalUsers = members.length;
	const admins = members.filter((m) => m.role === "Admin").length;
	const allocatedUsers = admins;

	const totalBars = 80;
	const allocatedBars = totalUsers > 0
		? Math.round((allocatedUsers / totalUsers) * totalBars)
		: 0;


	return (
		<section className="grid min-w-0 grid-cols-1 overflow-hidden border 2xl:grid-cols-3">


			<Strategic />

			<div className="min-w-0 border-t 2xl:border-l 2xl:border-t-0">
				<SectionTitle icon={Lightbulb}>Key Insights</SectionTitle>
				<div className=" px-4 ">
					<div className="flex justify-between items-center  pt-3">
						<p className="text-2xl font-semibold tracking-tight sm:text-3xl flex items-center ">
							<Users className="size-5 mr-2" /> {totalUsers}
						</p>
						<p className="text-sm text-muted-foreground">
							<span className="font-medium text-emerald-600">{admins}</span>
							<span className="ml-2">admin{admins === 1 ? "" : "s"}</span>
						</p>
					</div>
					<div className="flex flex-col items-center gap-5 ">

						<div className="relative size-56">
							<svg viewBox="0 0 240 240" className="size-full">
								{Array.from({ length: totalBars }).map((_, i) => {
									const angle = (i / totalBars) * 360;

									return (
										<line
											key={i}
											x1="120"
											y1="24"
											x2="120"
											y2="37"
											stroke={
												i < allocatedBars ? "#171717" : "#d4d4d4"
											}
											strokeWidth="2.8"
											strokeLinecap="round"
											transform={`rotate(${angle} 120 120)`}
											className="transition-colors duration-300"
										/>
									);
								})}
							</svg>

							<div className="absolute inset-0 flex flex-col items-center justify-center">
								<div className="mb-2 flex size-9 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
									<Users className="size-4" />
								</div>

								<span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
									Total Users
								</span>

								<span className="text-3xl font-bold tracking-tight">
									{totalUsers}
								</span>
							</div>
						</div>


					</div>
					<div className="flex gap-4 text-xs justify-center ">
						<div className="flex items-center gap-2">
							<span className="size-2 rounded-full bg-neutral-900" />
							Admins
						</div>
						<div className="flex items-center gap-2">
							<span className="size-2 rounded-full bg-neutral-500" />
							Others
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}
