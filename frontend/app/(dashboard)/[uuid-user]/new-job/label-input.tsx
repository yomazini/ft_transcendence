import { ReactNode } from "react"

export function LabelInput({label, children}:{label?: string,children?: ReactNode})
{
	return (
		<div className="fex flex-col gap-1">
			{label && <p className="text-sm font-medium text-zinc-900">{label}:</p>}
			{children}
		</div>
	)
}