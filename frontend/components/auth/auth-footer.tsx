import Link from "next/link";

interface AuthFooterProps {
	text: string;
	linkText: string;
	href: string;
}

export function AuthFooter({
	text,
	linkText,
	href,
}: AuthFooterProps) {
	return (
		<div className="mt-8 border-t pt-6 text-center">

			<p className="text-sm text-muted-foreground">
				{text}{" "}

				<Link
					href={href}
					className="font-semibold text-primary transition-colors hover:underline"
				>
					{linkText}
				</Link>

			</p>

		</div>
	);
}