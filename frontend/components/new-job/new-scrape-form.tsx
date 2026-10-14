import { ComponentProps } from "react"
import { cn } from "cn";

export type FormProps = ComponentProps<"form">

export function NewScrapeForm(props : FormProps)
{
	return (
		<form {...props} className={cn("flex w-[80%] min-w-[320px] max-w-2xl flex-col gap-5 p-6", props.className)}>
			{props.children}
		</form>
	)
}