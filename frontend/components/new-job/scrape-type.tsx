"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrapeInput } from "@/components/new-job/scrape-input";
import { LabelInput } from "@/components/new-job/label-input";


const scrapeTypes =[ 
	{
		type: "post",
		value: "Reddit Post",
		placeholder: "https://reddit.com/r/...",
		isPost: true
	},
	{
		type: "subreddit",
		value: "Search Reddit",
		placeholder: "https://reddit.com/r/...",
		isPost: false
	},
]

function ScrapeSearch()
{
	return (
		<div className="flex flex-col gap-5">
			<LabelInput label="Subreddit">
				<ScrapeInput required type="text" name="subbredit" placeholder="Subreddit"/>
			</LabelInput>
			<LabelInput label="Key word">
				<ScrapeInput  type="text" name="keyword" placeholder="Key word"/>
			</LabelInput>
			<LabelInput label="Limit">
				<ScrapeInput min={0} max={100} type="number" name="limit" placeholder="Limit"/>
			</LabelInput>
		</div>
	)
}

export function ScrapeType()
{
	const [selectedType, setSelectedType] = useState(scrapeTypes[0]);

	return (
		<div className="flex flex-col gap-3">
			<input type="hidden" name="mode" value={selectedType.type}/>
			<div className="flex gap-2">
				{
					scrapeTypes.map( (type) => {
						const isSelected = selectedType.type === type.type
						return ( 
						<Button
							className={ 
								isSelected ? "\
								flex-1\
								rounded-sm\
								border border-zinc-200\
								bg-orange-500\
								px-4 py-2\
								text-sm\
								text-white\
								active:!scale-100\
								active:!translate-y-0\
								active:!rotate-0\
								hover:cursor-pointer\
								hover:bg-orange-500\
								hover:text-white\
								hover:cursor-pointer" : "\
								flex-1\
								rounded-lg\
								border border-zinc-200\
								bg-white\
								px-4 py-2\
								text-sm\
								text-zinc-600\
								hover:bg-orange-500\
								hover:text-white\
								hover:cursor-pointer"
							}
							key={type.type}
							type="button"
							onClick={() => setSelectedType(type)}
							>
								{type.value}
							</Button>
						)}
					)
				}
			</div>
			{
				selectedType.isPost ? (
					<LabelInput label="Post URL">
						<ScrapeInput name="url" placeholder={selectedType.placeholder}/>
					</LabelInput>
				) : (
					<ScrapeSearch />
				)
			}
		</div>
	)
}