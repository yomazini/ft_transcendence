"use client";

import { useState, type FormEvent } from "react";
import { forgotPassword, isValidEmail, MAX_EMAIL_LENGTH } from "@/lib/auth";

import Link from "next/link";

import { AuthCard } from "@/components/auth/auth-card";
import { AuthFooter } from "@/components/auth/auth-footer";
import { AuthHeader } from "@/components/auth/auth-header";
import { AuthLayout } from "@/components/auth/auth-layout";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
	const [email, setEmail] = useState<string>("")
	const [error, setError] = useState<string>("");
	const [message, setMessage] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);

	async function handleSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		if (!isValidEmail(email.trim())) {
			setError("Enter a valid email address.");
			return;
		}
		setError("");
		setLoading(true);
		try {
			const result = await forgotPassword(email.trim());
			setMessage(result.message);
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
					title="Forgot Your Password?"
					description="Enter the email address associated with your account and we'll send you a link to reset your password."
				/>

				<form className="space-y-6" onSubmit={handleSubmit} noValidate>

					{/* Email */}

					<div className="space-y-2">

						<Label htmlFor="email">
							Email Address
						</Label>

						<Input
							id="email"
							maxLength={MAX_EMAIL_LENGTH}
							type="email"
							placeholder="john@example.com"
							autoComplete="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							disabled={loading}
						/>

					</div>

					{/* Submit */}
					{error && <p role="alert" className="text-sm text-destructive">{error}</p>}
					{message && <p role="status" className="text-sm text-muted-foreground">{message}</p>}

					<Button
						type="submit"
						size="lg"
						className="w-full"
						disabled={loading}
					>
						{loading ? "Sending..." : "Send Reset Link"}
					</Button>

				</form>

				{/* Extra Help */}

				<div className="mt-6 rounded-2xl border bg-muted/30 p-4 text-center">

					<p className="text-sm leading-6 text-muted-foreground">
						Remember to check your spam or junk folder if you don't receive
						the email within a few minutes.
					</p>

				</div>

				<AuthFooter
					text="Remember your password?"
					linkText="Sign in"
					href="/login"
				/>
			</AuthCard>
		</AuthLayout>
	);
}

