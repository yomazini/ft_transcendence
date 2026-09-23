"use client";

import { useState } from "react";

const scrapeTypes =[ 
	{
		type: "post",
		value: "Post",
		placeholder: "https://reddit.com/..."
	},
	{
		type: "subreddit",
		value: "Subreddit",
		placeholder: "https://reddit.com/r/..."
	},
	{
		type: "key-word",
		value: "Key word",
		placeholder: "Search ..."
	},
]

function ScrapeInput({placeholder}:{placeholder?: string})
{
	return (
		<input
			className="
				w-full
				min-h-10
				rounded-lg
				border
				border-zinc-200
				bg-white
				px-3
				py-2
				text-zinc-900
				placeholder:text-zinc-400
				outline-none
				focus:border-zinc-500
				focus:ring-1
				focus:ring-zinc-500
			"
			id="target"
			type="text"
			name="target"
			placeholder={placeholder}
		/>
	)
}

export function ScrapeType()
{
	const [selectedType, setSelectedType] = useState(scrapeTypes[0]);

	return (
		<div className="flex flex-col gap-3">
			<div className="flex gap-2">
				{
					scrapeTypes.map( (type) => {
						const isSelected = selectedType.type === type.type
						return ( 
						<button
							className={ 
								isSelected ? "\
								flex-1\
								rounded-lg\
								border border-zinc-200\
								bg-orange-500\
								px-4 py-2\
								text-sm\
								text-white" : "\
								flex-1\
								rounded-lg\
								border border-zinc-200\
								bg-white\
								px-4 py-2\
								text-sm\
								text-zinc-600\
								hover:bg-orange-500\
								hover:text-white"
							}
							key={type.type}
							type="button"
							onClick={() => setSelectedType(type)}
							>
								{type.value}
							</button>
						)}
					)
				}
			</div>
			<ScrapeInput placeholder={selectedType.placeholder}/>
		</div>
	)
}