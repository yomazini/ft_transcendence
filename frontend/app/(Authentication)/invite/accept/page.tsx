"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AuthCard } from "@/components/auth/auth-card";
import { AuthHeader } from "@/components/auth/auth-header";
import { AuthLayout } from "@/components/auth/auth-layout";
import { PasswordInput } from "@/components/auth/password-input";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import { acceptInvite, saveToken, MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH, homePath } from "@/lib/auth";

/** Landing page of the invite email link: /invite/accept#invite_token=<jwt>.
 *  No account exists yet — it is created only when this form is submitted. */
export default function AcceptInvitePage() {
	const router = useRouter();

	const [inviteToken, setInviteToken] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [confirmPassword, setConfirmPassword] = useState<string>("");
	const [terms, setTerms] = useState<boolean>(false);
	const [error, setError] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);

	useEffect(() => {
		const token = new URLSearchParams(window.location.hash.slice(1)).get("invite_token");
		if (!token) {
			router.replace("/login");
			return;
		}
		setInviteToken(token);
	}, [router]);

	function validate(): string {
		if (password.length < MIN_PASSWORD_LENGTH) {
			return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
		}
		if (password !== confirmPassword) return "Passwords do not match.";
		if (!terms) return "You must accept the Terms of Service and Privacy Policy.";
		return "";
	}

	async function handleSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();

		const problem = validate();
		if (problem) {
			setError(problem);
			return;
		}

		setError("");
		setLoading(true);
		try {
			const { access_token, user } = await acceptInvite(inviteToken, password);
			saveToken(access_token, true);
			router.replace(homePath(user.id));
		} catch (err) {
			setError(err instanceof Error ? err.message : "Something went wrong.");
		} finally {
			setLoading(false);
		}
	}

	return (
		<AuthLayout>
			<AuthCard>
				<AuthHeader
					title="Join Your Team"
					description="You have been invited to an organization. Choose a password to create your account."
				/>

				<form className="space-y-6" onSubmit={handleSubmit} noValidate>
					<div className="space-y-2">
						<Label htmlFor="password">
							Password
						</Label>

						<PasswordInput
							id="password"
							maxLength={MAX_PASSWORD_LENGTH}
							name="password"
							placeholder="••••••••"
							autoComplete="new-password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							disabled={loading}
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="confirmPassword">
							Confirm Password
						</Label>

						<PasswordInput
							id="confirmPassword"
							maxLength={MAX_PASSWORD_LENGTH}
							name="confirmPassword"
							placeholder="••••••••"
							autoComplete="new-password"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							disabled={loading}
							required
						/>
					</div>

					<div className="flex items-start space-x-2">
						<Checkbox
							id="terms"
							className="mt-1"
							checked={terms}
							onCheckedChange={(checked) => setTerms(checked)}
							disabled={loading}
						/>
						<Label
							htmlFor="terms"
							className="block font-normal leading-6"
						>
							I agree to the{" "}
							<Link
								href="/terms"
								className="text-primary hover:underline"
							>
								Terms of Service
							</Link>{" "}
							and{" "}
							<Link
								href="/privacy"
								className="text-primary hover:underline"
							>
								Privacy Policy
							</Link>
							.
						</Label>
					</div>

					{error && (
						<p role="alert" className="text-sm text-destructive">
							{error}
						</p>
					)}

					<Button
						type="submit"
						className="w-full"
						size="lg"
						disabled={loading || !inviteToken}
					>
						{loading ? "Creating account..." : "Accept Invitation"}
					</Button>
				</form>
			</AuthCard>
		</AuthLayout>
	);
}
