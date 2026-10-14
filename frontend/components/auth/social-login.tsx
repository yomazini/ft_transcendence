import { Button } from "@/components/ui/button";
import { FORTY_TWO_LOGIN_URL } from "@/lib/auth";

export function SocialLogin() {
	return (
		<div className="mt-8">
			{/* Divider */}
			<div className="relative">
				<div className="absolute inset-0 flex items-center">
					<span className="w-full border-t" />
				</div>
				<div className="relative flex justify-center text-sm uppercase">
					<span className="bg-background px-4 text-muted-foreground">
						Or continue with
					</span>
				</div>
			</div>
			{/* 42 login */}
			<div className="mt-6 grid gap-4">
				{/* Full page navigation to the backend, which starts the OAuth flow
						with 42. A plain <a> (not next/link) because /api/... is not a
						Next.js page. */}
				<Button
					variant="outline"
					className="h-11"
					nativeButton={false}
					render={<a href={FORTY_TWO_LOGIN_URL} />}
				>
					Continue with 42
				</Button>
			</div>

		</div>
	);
}
