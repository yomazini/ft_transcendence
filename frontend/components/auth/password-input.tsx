"use client";

import { useState, type ComponentProps } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "cn";

import { Input } from "@/components/ui/input";

/** A password field with a show / hide button.
 *  Same props as <Input>, without `type` (the component switches it itself). */
export function PasswordInput({
	className,
	disabled,
	...props
}: Omit<ComponentProps<typeof Input>, "type">) {
	const [visible, setVisible] = useState<boolean>(false);

	return (
		<div className="relative">
			<Input
				type={visible ? "text" : "password"}
				className={cn("pr-9", className)}
				disabled={disabled}
				{...props}
			/>

			{/* type="button" so a click never submits the form */}
			<button
				type="button"
				onClick={() => setVisible((current) => !current)}
				aria-label={visible ? "Hide password" : "Show password"}
				aria-pressed={visible}
				disabled={disabled}
				className="absolute inset-y-0 right-0 flex w-9 items-center justify-center rounded-r-lg text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
			>
				{visible ? (
					<EyeOff className="size-4" aria-hidden="true" />
				) : (
					<Eye className="size-4" aria-hidden="true" />
				)}
			</button>
		</div>
	);
}
