import { ReactNode } from "react";

const scrapeTypes =[ 
	{
		type: "post",
		value: "Post",
		placeholder: "https://reddit.com/..."
	},
	{
		type: "test",
		value: "Test",
		placeholder: "Search"
	}
]

function StartJobButton()
{
	return (
		<button>
			Create Job
		</button>
	)
}

function ScrapeInput({placeholder}:{placeholder?: string})
{
	return (
		<input id="input" type="text" placeholder={placeholder} />
	)
}

function ScrapeType()
{
	
	return (
		<div className="flex flex-col gap-3">
			<div className="flex gap-5">
				{ 
					scrapeTypes.map( (type) => ( 
								<button key={type.type} type="button" >
									{type.value}
								</button>
						)
					)
				}
			</div>
			<ScrapeInput />
		</div>
	)
}

function JobContext()
{
	return (
		<textarea placeholder="Context"/>
	)
}

function JobName(  )
{
	return (
		<input id="name" type="text" name="JobName" placeholder="Job name"/>
	)
}

function NewScrapeForm(
	{ 
		className = "flex flex-col item-center justify-center gap-5",
		children 
	} : {
		className?: string,
		children?: ReactNode
	}
)
{
	return (
		<form method="post" className={className}>
			{children}
		</form>
	)
}

export default function NewPage()
{
	return (
		<main className="flex item-center justify-center" >
			<NewScrapeForm  >
				<JobName />
				<JobContext />
				<ScrapeType />
				<StartJobButton />
			</NewScrapeForm>
		</main>
	)
}