import { ComponentProps } from "react"
import { cn } from "cn"

export function ScrapeInput(props: ComponentProps<"input">)
{
	return (
		<input
			{...props}
			className={
                cn(
                    "\
				        w-full\
				        min-h-10\
				        rounded-lg\
				        border\
				        border-zinc-200\
				        bg-white\
				        px-3\
				        py-2\
				        text-zinc-900\
				        placeholder:text-zinc-400\
				        outline-none\
				        focus:border-zinc-500\
				        focus:ring-1\
				        focus:ring-zinc-500\
			        "
                , props.className)
            }
		/>
	)
}