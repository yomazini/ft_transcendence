"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AuthCard } from "@/components/auth/auth-card";
import { AuthFooter } from "@/components/auth/auth-footer";
import { AuthHeader } from "@/components/auth/auth-header";
import { AuthLayout } from "@/components/auth/auth-layout";
import { PasswordInput } from "@/components/auth/password-input";
import { SocialLogin } from "@/components/auth/social-login";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { login, saveToken } from "@/lib/auth";

export default function LoginPage() {
	/** @line asks Next.js for the router object and keeps it in router var */
	const router = useRouter();

	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [remember, setRemember] = useState<boolean>(false);
	const [error, setError] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);

	/** @note function runs when the form is submitted. It is defined inside */
	async function handleSubmit(e: FormEvent<HTMLFormElement>) {
		/** @note stop the browser from reloading the page */
		e.preventDefault();

		/** clears any old error message at the start of a new attempt. */
		setError("");
		if (!email.trim() || !password) {
			setError("Enter your email and password.");
			return;
		}
		setLoading(true);

		try {
			/** calls the helper login from lib/auth.ts, It sends the credentials to the backend */
			const { access_token, user } = await login(email.trim(), password);
			/** ⚠️ keeps the JWT in the browser so later requests can use it */
			saveToken(access_token, remember);
			/** moves to the dashboard page without reloading the app
			 * + adds the new URL to the browser history and shows the page.
			 */
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
					title="Welcome Back"
					description="Sign in to your InsightFlow account to continue."
				/>

				<form className="space-y-6" onSubmit={handleSubmit} noValidate>
					{/* email */}
					<div className="space-y-2">
						<Label htmlFor="email">Email Address</Label>
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
						<div className="flex items-center justify-between">
							<Label htmlFor="password">Password</Label>
							<Link
								href="/forgot-password"
								className="text-sm text-primary hover:underline"
							>
								Forgot password?
							</Link>
						</div>
						<PasswordInput
							id="password"
							name="password"
							placeholder="••••••••"
							autoComplete="current-password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							disabled={loading}
							required
						/>
					</div>

					{/* Remember */}

					<div className="flex items-center space-x-2">
						<Checkbox
							id="remember"
							checked={remember}
							onCheckedChange={(checked) => setRemember(checked)}
							disabled={loading}
						/>

						<Label htmlFor="remember" className="font-normal">
							Remember me
						</Label>
					</div>

					{/* ❗⚠️ Error (only shown when there is one) */}

					{error && (
						<p role="alert" className="text-sm text-destructive">
							{error}
						</p>
					)}

					{/* Submit */}
					<Button type="submit" className="w-full" size="lg" disabled={loading}>
						{loading ? "Signing in..." : "Sign In"}
					</Button>
				</form>

				<SocialLogin />

				<AuthFooter
					text="Don't have an account?"
					linkText="Create one"
					href="/register"
				/>
			</AuthCard>
		</AuthLayout>
	);
}