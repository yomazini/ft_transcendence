import { ReactNode } from "react";
import { ScrapeType } from "./scrape-type";

function LabelInput({label, children}:{label?: string,children?: ReactNode})
{
	return (
		<div className="fex flex-col gap-1">
			{label && <p className="text-sm font-medium text-zinc-900">{label}:</p>}
			{children}
		</div>
	)
}

function StartJobButton()
{
	return (
		<button
			className="
				w-1/3
				self-end
				rounded-lg
				bg-orange-500
				px-4 py-2
				font-medium
				text-white
				hover:bg-orange-600
			"
			type="submit"
		>
			Create Job
		</button>
	)
}

function JobContext()
{
	return (
		<LabelInput label="Context">
			<textarea 
				name="context"
				placeholder="Context"
				className="
					w-full
    				min-h-10
    				max-h-40
    				resize-none
    				overflow-y-auto
    				rounded-lg
    				border border-zinc-200
    				bg-white
    				px-3 py-2
    				text-zinc-900
    				placeholder:text-zinc-400
    				outline-none
    				focus:border-zinc-500
    				focus:ring-1
    				focus:ring-zinc-500
				"
			/>
		</LabelInput>
	)
}

function JobName()
{
	return (
		<LabelInput label="Job name">
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
				id="name"
				type="text"
				name="job-name"
				placeholder="Job name"
			/>
		</LabelInput>
	)
}

function NewScrapeForm(
	{ 
		className = "flex w-[80%] min-w-[320px] max-w-2xl flex-col gap-5 p-6",
		children 
	} : {
		className?: string,
		children?: ReactNode
	}
)
{
	return (
		<form method="get" className={className}>
			{children}
		</form>
	)
}

export default function NewPage()
{
	return (
		<div className="flex h-full items-center justify-center" >
			<NewScrapeForm  >
				<h1
					className="
						text-center
						text-5xl
						font-semibold
						text-zinc-900
					"
				>
					New Job
				</h1>
				<JobName />
				<JobContext />
				<ScrapeType />
				<StartJobButton />
			</NewScrapeForm>
		</div>
	)
}