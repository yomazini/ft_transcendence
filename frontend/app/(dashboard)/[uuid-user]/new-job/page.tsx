import { Button } from "@/components/ui/button";
import { ScrapeType } from "@/components/new-job/scrape-type";
import { NewScrapeForm } from "@/components/new-job/new-scrape-form";

export default function NewPage()
{
	return (
		<div className="flex h-full items-center justify-center" >
			<NewScrapeForm method="post" >
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
				<ScrapeType />
				<Button
					className="
						w-1/3
						self-end
						rounded-lg
						bg-orange-500
						px-4 py-2
						font-medium
						text-white
						hover:bg-orange-600
						hover:cursor-pointer
					"
					type="submit"
				>
					Create Job
				</Button>
			</NewScrapeForm>
		</div>
	)
}