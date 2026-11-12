"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
	Check,
	Copy,
	Eye,
	EyeOff,
	KeyRound,
	Loader2,
	Mail,
	Lock,
	User,
	Settings as SettingsIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { changeEmail, changePassword, isValidEmail, MIN_PASSWORD_LENGTH } from "@/lib/auth";
import ApiKey from "@/components/srtting/apiKey";


export default function SettingsProfile() {
	const queryClient = useQueryClient();
	const { user } = useCurrentUser();
	const currentEmail = user?.email ?? "";
	const [newEmail, setNewEmail] = useState("");
	const [emailPassword, setEmailPassword] = useState("");
	const [emailError, setEmailError] = useState("");
	const [emailNotice, setEmailNotice] = useState("");
	const [savingEmail, setSavingEmail] = useState(false);
	const [showEmailPassword, setShowEmailPassword] = useState(false);
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [passwordError, setPasswordError] = useState("");
	const [passwordNotice, setPasswordNotice] = useState("");
	const [savingPassword, setSavingPassword] = useState(false);
	const [showCurrent, setShowCurrent] = useState(false);
	const [showNew, setShowNew] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);



	const initials = currentEmail.slice(0, 2).toUpperCase();

	

	async function handleEmailUpdate() {
		setEmailNotice("");

		const email = newEmail.trim();
		if (!isValidEmail(email)) {
			setEmailError("Enter a valid email address.");
			return;
		}

		if (!emailPassword) {
			setEmailError("Enter your current password.");
			return;
		}

		setEmailError("");
		setSavingEmail(true);

		try {
			await changeEmail(email, emailPassword);
			/** refetch GET /auth/me so the navbar and the profile show the new email */
			await queryClient.invalidateQueries({ queryKey: ["me"] });
			setEmailNotice("Email changed.");
			setNewEmail("");
			setEmailPassword("");
		} catch (err) {
			setEmailError(err instanceof Error ? err.message : "Something went wrong.");
		} finally {
			setSavingEmail(false);
		}
	}

	async function handlePasswordUpdate() {
		setPasswordNotice("");

		if (newPassword.length < MIN_PASSWORD_LENGTH) {
			setPasswordError(`New password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
			return;
		}

		if (newPassword !== confirmPassword) {
			setPasswordError("Passwords do not match.");
			return;
		}

		setPasswordError("");
		setSavingPassword(true);

		try {
			await changePassword(currentPassword, newPassword);
			setPasswordNotice("Password changed.");
			setCurrentPassword("");
			setNewPassword("");
			setConfirmPassword("");
		} catch (err) {
			setPasswordError(err instanceof Error ? err.message : "Something went wrong.");
		} finally {
			setSavingPassword(false);
		}
	}

	return (
		<div className="mx-auto max-w-6xl space-y-6 p-4 pb-12 md:p-8">
			{/* Header */}
			<div>
				<div className="mb-2 flex items-center gap-2 text-violet-600 dark:text-violet-400">
					<SettingsIcon className="h-5 w-5" />

					<span className="text-sm font-medium">Account settings</span>
				</div>

				<h1 className="text-3xl font-bold tracking-tight">Settings</h1>

				<p className="mt-2 text-zinc-500 dark:text-zinc-400">
					Manage your account and security settings.
				</p>
			</div>

			<div className="grid items-start gap-4 md:grid-cols-2">
				{/* Profile */}
				<section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-900/60 sm:p-6">
					<div className="flex items-center gap-2">
						<User className="h-5 w-5 text-violet-600 dark:text-violet-400" />

						<h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Profile</h2>
					</div>

					<p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
						Manage your account information.
					</p>

					{/* Avatar */}
					<div className="mt-5 flex items-center gap-3">
						<div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-violet-100 text-lg font-semibold text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
							{initials}
						</div>

						<div className="min-w-0">
							<p className="truncate text-lg font-bold text-zinc-900 dark:text-zinc-100">{currentEmail}</p>

							<p className="text-sm text-zinc-500 dark:text-zinc-400">Your account</p>
						</div>
					</div>

					<Separator className="my-6 bg-zinc-200 dark:bg-white/10" />

					{/* Email */}
					<div className="space-y-4">
						<div>
							<Label htmlFor="email">Email address</Label>

							<p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
								This email is used to access your account.
							</p>
						</div>

						<div className="relative">
							<Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 dark:text-zinc-400" />

							<Input
								id="email"
								type="email"
								placeholder={currentEmail}
								value={newEmail}
								onChange={(e) => setNewEmail(e.target.value)}
								disabled={savingEmail}
								className="h-10 rounded-xl border-zinc-200 bg-zinc-50/50 pl-9 focus-visible:ring-violet-500/20 dark:border-white/10 dark:bg-zinc-800/50"
							/>
						</div>

						{/* Current password, separate from the Password section */}
						<div className="space-y-2">
							<Label htmlFor="email-password">Current password</Label>

							<div className="relative">
								<Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 dark:text-zinc-400" />

								<Input
									id="email-password"
									type={showEmailPassword ? "text" : "password"}
									autoComplete="current-password"
									value={emailPassword}
									onChange={(e) => setEmailPassword(e.target.value)}
									disabled={savingEmail}
									className="h-10 rounded-xl border-zinc-200 bg-zinc-50/50 pl-9 pr-10 focus-visible:ring-violet-500/20 dark:border-white/10 dark:bg-zinc-800/50"
								/>

								<button
									type="button"
									onClick={() => setShowEmailPassword(!showEmailPassword)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400 hover:text-foreground"
								>
									{showEmailPassword ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</button>
							</div>
						</div>

						{emailError && <p role="alert" className="text-sm text-destructive">{emailError}</p>}
						{emailNotice && <p role="status" className="text-sm text-green-600 dark:text-green-400">{emailNotice}</p>}

						<div className="flex justify-end pt-2">
							<Button
								onClick={handleEmailUpdate}
								disabled={savingEmail}
								className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-violet-600 dark:hover:bg-violet-500"
							>
								{savingEmail ? "Saving..." : "Change email"}
							</Button>
						</div>
					</div>
				</section>

				{/* Password */}
				<section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-900/60 sm:p-6">
					<div className="flex items-center gap-2">
						<Lock className="h-5 w-5 text-violet-600 dark:text-violet-400" />

						<h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Password</h2>
					</div>

					<p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
						Update your password to keep your account secure.
					</p>

					<Separator className="my-6 bg-zinc-200 dark:bg-white/10" />

					<div className="space-y-5">
						{/* Current password */}
						<div className="space-y-2">
							<Label htmlFor="current-password">Current password</Label>

							<div className="relative">
								<Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 dark:text-zinc-400" />

								<Input
									id="current-password"
									type={showCurrent ? "text" : "password"}
									value={currentPassword}
									onChange={(e) => setCurrentPassword(e.target.value)}
									className="h-10 rounded-xl border-zinc-200 bg-zinc-50/50 pl-9 pr-10 focus-visible:ring-violet-500/20 dark:border-white/10 dark:bg-zinc-800/50"
								/>

								<button
									type="button"
									onClick={() => setShowCurrent(!showCurrent)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400 hover:text-foreground"
								>
									{showCurrent ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</button>
							</div>
						</div>

						{/* New password */}
						<div className="space-y-2">
							<Label htmlFor="new-password">New password</Label>

							<div className="relative">
								<Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 dark:text-zinc-400" />

								<Input
									id="new-password"
									type={showNew ? "text" : "password"}
									value={newPassword}
									onChange={(e) => setNewPassword(e.target.value)}
									className="h-10 rounded-xl border-zinc-200 bg-zinc-50/50 pl-9 pr-10 focus-visible:ring-violet-500/20 dark:border-white/10 dark:bg-zinc-800/50"
								/>

								<button
									type="button"
									onClick={() => setShowNew(!showNew)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400 hover:text-foreground"
								>
									{showNew ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</button>
							</div>
						</div>

						{/* Confirm password */}
						<div className="space-y-2">
							<Label htmlFor="confirm-password">Confirm new password</Label>

							<div className="relative">
								<Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 dark:text-zinc-400" />

								<Input
									id="confirm-password"
									type={showConfirm ? "text" : "password"}
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									className="h-10 rounded-xl border-zinc-200 bg-zinc-50/50 pl-9 pr-10 focus-visible:ring-violet-500/20 dark:border-white/10 dark:bg-zinc-800/50"
								/>

								<button
									type="button"
									onClick={() => setShowConfirm(!showConfirm)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400 hover:text-foreground"
								>
									{showConfirm ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</button>
							</div>
						</div>

						{passwordError && <p role="alert" className="text-sm text-destructive">{passwordError}</p>}
						{passwordNotice && <p role="status" className="text-sm text-green-600 dark:text-green-400">{passwordNotice}</p>}

						<div className="flex justify-end pt-2">
							<Button
								onClick={handlePasswordUpdate}
								disabled={savingPassword}
								className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-violet-600 dark:hover:bg-violet-500"
							>
								{savingPassword ? "Saving..." : "Update password"}
							</Button>
						</div>
					</div>
				</section>
			</div>

            {
                user && <ApiKey orgId={user.org_id}/>
            }
		</div>
	);
}