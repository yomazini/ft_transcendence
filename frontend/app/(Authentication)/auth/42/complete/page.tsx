"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { AuthCard } from "@/components/auth/auth-card";
import { AuthHeader } from "@/components/auth/auth-header";
import { AuthLayout } from "@/components/auth/auth-layout";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { completeFortyTwoSignup, saveToken, MIN_PASSWORD_LENGTH } from "@/lib/auth";
import { PasswordInput } from "@/components/auth/password-input";

const MIN_ORG_DESCRIPTION_CHARS = 100;
const MAX_ORG_DESCRIPTION_CHARS = 200;

/** Second half of a first-time 42 signup: /auth/42/complete#signup_token=<jwt>.
 *  No account exists yet — it is created only when this form is submitted. */
export default function FortyTwoCompletePage() {
	const router = useRouter();

	const [signupToken, setSignupToken] = useState<string>("");
	const [orgName, setOrgName] = useState<string>("");
	const [orgDescription, setOrgDescription] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [confirmPassword, setConfirmPassword] = useState<string>("");
	const [error, setError] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);

	useEffect(() => {
		const token = new URLSearchParams(window.location.hash.slice(1)).get("signup_token");
		if (!token) {
			router.replace("/login");
			return;
		}
		setSignupToken(token);
	}, [router]);

	function validate(): string {
		if (!orgName.trim()) return "Enter your organization name.";
		if (orgDescription.trim().length < MIN_ORG_DESCRIPTION_CHARS) {
			return `Describe your organization in at least ${MIN_ORG_DESCRIPTION_CHARS} characters.`;
		}
		if (password.length < MIN_PASSWORD_LENGTH) {
			return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
		}
		if (password !== confirmPassword) return "Passwords do not match.";
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
			const { access_token, user } = await completeFortyTwoSignup(
				signupToken,
				orgName.trim(),
				orgDescription.trim(),
				password,
			);
			saveToken(access_token, true);
			router.replace(`/${user.id}/dashboard`);
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
					title="One Last Step"
					description="Tell us about your organization to finish signing up with 42."
				/>

				<form className="space-y-6" onSubmit={handleSubmit} noValidate>
					<div className="space-y-2">
						<Label htmlFor="orgName">
							Organization Name
						</Label>

						<Input
							id="orgName"
							name="orgName"
							placeholder="Acme Inc."
							autoComplete="organization"
							value={orgName}
							onChange={(e) => setOrgName(e.target.value)}
							disabled={loading}
							required
						/>
					</div>

					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<Label htmlFor="orgDescription">
								Organization Description
							</Label>
							<span aria-live="polite" className="text-xs font-medium text-muted-foreground">
								{orgDescription.length}/{MAX_ORG_DESCRIPTION_CHARS}
							</span>
						</div>

						<Textarea
							id="orgDescription"
							name="orgDescription"
							placeholder="e.g. We help small teams turn customer feedback into weekly action items..."
							rows={10}
							maxLength={MAX_ORG_DESCRIPTION_CHARS}
							value={orgDescription}
							onChange={(e) => setOrgDescription(e.target.value)}
							disabled={loading}
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="password">Password</Label>
						<PasswordInput
							id="password"
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
						<Label htmlFor="confirmPassword">Confirm Password</Label>
						<PasswordInput
							id="confirmPassword"
							name="confirmPassword"
							placeholder="••••••••"
							autoComplete="new-password"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							disabled={loading}
							required
						/>
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
						disabled={loading || !signupToken}
					>
						{loading ? "Creating account..." : "Finish Signup"}
					</Button>
				</form>
			</AuthCard>
		</AuthLayout>
	);
}
