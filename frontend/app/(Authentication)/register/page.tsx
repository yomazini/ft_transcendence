"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AuthFooter } from "@/components/auth/auth-footer";
import { AuthHeader } from "@/components/auth/auth-header";
import { AuthLayout } from "@/components/auth/auth-layout";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
	MIN_PASSWORD_LENGTH,
	isValidEmail,
	register,
	saveToken,
} from "@/lib/auth";
import { AuthCard } from "@/components/auth/auth-card";
import { SocialLogin } from "@/components/auth/social-login";

const MAX_ORG_DESCRIPTION_CHARS = 200;

export default function RegisterPage() {
	const router = useRouter();

	const [orgName, setOrgName] = useState<string>("");
	const [orgDescription, setOrgDescription] = useState<string>("");
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [confirmPassword, setConfirmPassword] = useState<string>("");
	const [terms, setTerms] = useState<boolean>(false);
	const [error, setError] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);

	function validate(): string {
		if (!orgName.trim()) return "Enter your organization name.";
		if (!orgDescription.trim()) return "Describe your organization.";
		if (!isValidEmail(email.trim())) return "Enter a valid email address.";
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
			const { access_token, user } = await register(
				email.trim(),
				password,
				orgName.trim(),
				orgDescription.trim()
			);
			saveToken(access_token, false);
			router.push(`/${user.id}/dashboard`);
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
					title="Create Your Account"
					description="Start transforming customer conversations into actionable insights."
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

					{/* Email */}
					<div className="space-y-2">

						<Label htmlFor="email">
							Email Address
						</Label>

						<Input
							id="email"
							name="email"
							type="email"
							placeholder="john@example.com"
							autoComplete="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							disabled={loading}
							required
						/>
					</div>

					{/* Password */}
					<div className="space-y-2">

						<Label htmlFor="password">
							Password
						</Label>

						<Input
							id="password"
							name="password"
							type="password"
							placeholder="••••••••"
							autoComplete="new-password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							disabled={loading}
							required
						/>
					</div>

					{/* Confirm Password */}

					<div className="space-y-2">

						<Label htmlFor="confirmPassword">
							Confirm Password
						</Label>

						<Input
							id="confirmPassword"
							name="confirmPassword"
							type="password"
							placeholder="••••••••"
							autoComplete="new-password"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							disabled={loading}
							required
						/>

					</div>

					{/* Terms */}
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

					{/* Error (only shown when there is one) */}

					{error && (
						<p role="alert" className="text-sm text-destructive">
							{error}
						</p>
					)}

					{/* Submit */}

					<Button
						type="submit"
						className="w-full"
						size="lg"
						disabled={loading}
					>
						{loading ? "Creating account..." : "Create Account"}
					</Button>

				</form>

				<SocialLogin />

				<AuthFooter
					text="Already have an account?"
					linkText="Sign in"
					href="/login"
				/>
			</AuthCard>
		</AuthLayout>
	);
}
