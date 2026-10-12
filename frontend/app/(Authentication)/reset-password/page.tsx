"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { resetPassword, MIN_PASSWORD_LENGTH } from "@/lib/auth";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthFooter } from "@/components/auth/auth-footer";
import { AuthHeader } from "@/components/auth/auth-header";
import { AuthLayout } from "@/components/auth/auth-layout";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPasswordPage() {
	const router = useRouter();

	const [resetToken, setResetToken] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [confirmPassword, setConfirmPassword] = useState<string>("");
	const [error, setError] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);

	useEffect(() => {
		const token = new URLSearchParams(window.location.hash.slice(1)).get(
			"reset_token",
		);
		if (!token) {
			router.replace("/forgot-password");
			return;
		}
		setResetToken(token);
	}, [router]);

	async function handleSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		if (password.length < MIN_PASSWORD_LENGTH) {
			setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
			return;
		}
		if (password !== confirmPassword) {
			setError("Passwords do not match.");
			return;
		}

		setError("");
		setLoading(true);
		try {
			await resetPassword(resetToken, password);
			router.replace("/login");
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
					title="Reset Your Password"
					description="Choose a strong password to secure your account."
				/>
				<form className="space-y-6" onSubmit={handleSubmit} noValidate>
					{/* New Password */}

					<div className="space-y-2">
						<Label htmlFor="password">New Password</Label>

						<Input
							id="password"
							type="password"
							placeholder="••••••••"
							autoComplete="new-password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							disabled={loading}
						/>
					</div>

					{/* Confirm Password */}

					<div className="space-y-2">
						<Label htmlFor="confirmPassword">Confirm New Password</Label>

						<Input
							id="confirmPassword"
							type="password"
							placeholder="••••••••"
							autoComplete="new-password"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							disabled={loading}
						/>
					</div>

					{/* Submit */}

					{error && (
						<p role="alert" className="text-sm text-destructive">
							{error}
						</p>
					)}
					<Button
						type="submit"
						size="lg"
						className="w-full"
						disabled={loading || !resetToken}
					>
						{loading ? "Saving..." : "Reset Password"}
					</Button>
				</form>

				<AuthFooter
					text="Remember your password?"
					linkText="Sign in"
					href="/login"
				/>
			</AuthCard>
		</AuthLayout>
	);
}
