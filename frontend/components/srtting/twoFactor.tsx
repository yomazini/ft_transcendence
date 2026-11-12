"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Check, Copy, ShieldCheck, ShieldOff } from "lucide-react";

import { OtpInput } from "@/components/auth/otp-input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { disableTwoFactor, enableTwoFactor, setupTwoFactor } from "@/lib/auth";

type Setup = { qr_code: string; secret: string };

export default function TwoFactor({ enabled }: { enabled: boolean }) {
	const queryClient = useQueryClient();
	const [setup, setSetup] = useState<Setup | null>(null);
	const [code, setCode] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [notice, setNotice] = useState("");
	const [copied, setCopied] = useState(false);

	function reset() {
		setCode("");
		setError("");
	}

	async function refreshUser() {
		await queryClient.invalidateQueries({ queryKey: ["me"] });
	}

	async function handleStart() {
		reset();
		setNotice("");
		setLoading(true);
		try {
			const { qr_code, otpauth_url } = await setupTwoFactor();
			const secret = new URL(otpauth_url).searchParams.get("secret") ?? "";
			setSetup({ qr_code, secret });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Something went wrong.");
		} finally {
			setLoading(false);
		}
	}

	async function handleEnable() {
		setError("");
		if (code.length !== 6) {
			setError("Enter the 6-digit code from your authenticator app.");
			return;
		}
		setLoading(true);
		try {
			await enableTwoFactor(code);
			setSetup(null);
			reset();
			setNotice("Two-factor authentication is on. You'll be asked for a code at each login.");
			await refreshUser();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Something went wrong.");
			setCode("");
		} finally {
			setLoading(false);
		}
	}

	async function handleDisable() {
		setError("");
		if (code.length !== 6) {
			setError("Enter the 6-digit code from your authenticator app.");
			return;
		}
		setLoading(true);
		try {
			await disableTwoFactor(code);
			reset();
			setNotice("Two-factor authentication is off.");
			await refreshUser();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Something went wrong.");
			setCode("");
		} finally {
			setLoading(false);
		}
	}

	async function copySecret() {
		if (!setup) return;
		await navigator.clipboard.writeText(setup.secret);
		setCopied(true);
		setTimeout(() => setCopied(false), 1500);
	}

	return (
		<section className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-zinc-900/60">
			<div className="flex items-start justify-between gap-4 p-6">
				<div>
					<h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Two-factor authentication</h2>
					<p className="text-sm text-muted-foreground">
						Ask for a 6-digit code from an authenticator app (Google Authenticator, Authy, 1Password) at each login.
					</p>
				</div>
				{enabled ? (
					<span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
						<ShieldCheck className="h-3.5 w-3.5" /> On
					</span>
				) : (
					<span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-white/5 dark:text-zinc-400">
						<ShieldOff className="h-3.5 w-3.5" /> Off
					</span>
				)}
			</div>

			<Separator />

			<div className="space-y-5 p-6">
				{!enabled && !setup && (
					<div className="flex justify-end [&_button]:rounded-xl [&_button]:bg-violet-600 [&_button]:text-white [&_button]:hover:bg-violet-700">
						<Button onClick={handleStart} disabled={loading}>
							{loading ? "Preparing..." : "Turn on 2FA"}
						</Button>
					</div>
				)}

				{!enabled && setup && (
					<div className="space-y-5">
						<div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img
								src={setup.qr_code}
								alt="QR code to scan with your authenticator app"
								className="h-44 w-44 rounded-xl border border-zinc-200 bg-white p-2 dark:border-white/10"
							/>
							<div className="space-y-3 text-sm">
								<p className="font-medium text-zinc-900 dark:text-zinc-100">1. Scan this QR code with your authenticator app.</p>
								<p className="text-muted-foreground">Can&apos;t scan it? Enter this key by hand:</p>
								<div className="flex items-center gap-2">
									<code className="rounded-lg border border-zinc-200 bg-zinc-50/50 px-3 py-1.5 font-mono text-xs tracking-wider dark:border-white/10 dark:bg-zinc-800/50">
										{setup.secret}
									</code>
									<button
										type="button"
										onClick={copySecret}
										className="text-zinc-400 hover:text-violet-600 dark:hover:text-violet-400"
										aria-label="Copy the key"
									>
										{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
									</button>
								</div>
								<p className="font-medium text-zinc-900 dark:text-zinc-100">2. Enter the 6-digit code the app shows.</p>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="enable-code" className="sr-only">Code from the app</Label>
							<OtpInput id="enable-code" value={code} onChange={setCode} disabled={loading} />
						</div>

						{error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}

						<div className="flex justify-end gap-2 [&_button]:rounded-xl">
							<Button variant="outline" onClick={() => { setSetup(null); reset(); }} disabled={loading}>
								Cancel
							</Button>
							<Button
								onClick={handleEnable}
								disabled={loading || code.length !== 6}
								className="bg-violet-600 text-white hover:bg-violet-700"
							>
								{loading ? "Checking..." : "Confirm and turn on"}
							</Button>
						</div>
					</div>
				)}

				{enabled && (
					<div className="space-y-4">
						<div>
							<Label htmlFor="disable-code">Turn off 2FA</Label>
							<p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
								Enter a code from your authenticator app to confirm. The key is deleted, so turning it on again needs a new QR code.
							</p>
						</div>
						<OtpInput id="disable-code" value={code} onChange={setCode} disabled={loading} />
						{error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
						<div className="flex justify-end [&_button]:rounded-xl">
							<Button variant="outline" onClick={handleDisable} disabled={loading || code.length !== 6}>
								{loading ? "Checking..." : "Turn off 2FA"}
							</Button>
						</div>
					</div>
				)}

				{notice && !error && <p role="status" className="text-sm text-emerald-600 dark:text-emerald-400">{notice}</p>}
			</div>
		</section>
	);
}
