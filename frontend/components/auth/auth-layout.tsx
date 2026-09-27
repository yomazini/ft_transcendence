import Link from "next/link";
import { ReactNode } from "react";

interface AuthLayoutProps {
	children: ReactNode;
}

export function AuthLayout({
	children,
}: AuthLayoutProps) {
	return (
		<main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6 py-12">

			{/* Background decoration */}

			<div className="absolute inset-0 -z-10">
				<div className="absolute left-1/2 top-0 h-[450px] w-[450px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
				<div className="absolute bottom-0 right-0 h-[350px] w-[350px] rounded-full bg-primary/5 blur-3xl" />
				<div className="absolute left-0 top-1/2 h-[300px] w-[300px] rounded-full bg-primary/5 blur-3xl" />
			</div>

			<div className="flex w-full max-w-md flex-col items-center">

				{/* Logo */}

				<Link
					href="/"
					className="mb-10 text-3xl font-bold tracking-tight"
				>
					InsightFlow
				</Link>

				{/* Auth Card */}

				{children}

				{/* Bottom */}

				<p className="mt-8 text-center text-sm text-muted-foreground">
					© {new Date().getFullYear()} InsightFlow. All rights reserved.
				</p>

			</div>

		</main>
	);
}
