"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, Mail, Lock, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { changeEmail, changePassword, deleteMyData, exportMyData, isValidEmail, MIN_PASSWORD_LENGTH } from "@/lib/auth";


export default function SettingsProfile() {
	const router = useRouter();
	const [exporting, setExporting] = useState(false);
	const [exportNotice, setExportNotice] = useState("");
	const [exportError, setExportError] = useState("");
	const [deletePassword, setDeletePassword] = useState("");
	const [showDeletePassword, setShowDeletePassword] = useState(false);
	const [confirmDelete, setConfirmDelete] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [deleteError, setDeleteError] = useState("");
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

	async function handlexport() {
		setExportError("");
		setExportNotice("");
		setExporting(true);

		try {
			await exportMyData();
			setExportNotice("Your data was downloaded. A receipt was sent to your email.");
		} catch(err) {
			setExportError(err instanceof Error ? err.message : "Something went wrong.");
		} finally { setExporting(false); }
	}

	async function handleDelete() {
		if (!deletePassword) {
			setDeleteError("Enter your current password.");
			return;
		}

		if (!confirmDelete) {
			setConfirmDelete(true);
			setDeleteError("");
			return;
		}

		setDeleteError("");
		setDeleting(true);

		try {
			await deleteMyData(deletePassword);
			queryClient.clear();
			router.replace("/");
		} catch(err) {
			setDeleteError(err instanceof Error ? err.message : "Something went wrong.");
		} finally {
			setDeleting(false);
			setConfirmDelete(false);
		}
	}

	return (
		<div
			className="mx-auto w-full max-w-4xl space-y-8  border 
			bg-[radial-gradient(#d4d4d4_1px,transparent_1px)] bg-size-[16px_16px]"
		>
			{/* Header */}
			<div className=" border-b p-6 bg-background">
				<h1 className="text-2xl font-semibold">Settings</h1>

				<p className="text-sm text-muted-foreground">
					Manage your account and security settings.
				</p>
			</div>

			{/* Profile */}
			<section className=" border-x-0 border bg-background p-6">
				<div className="p-6">
					<h2 className="text-lg font-semibold">Profile</h2>

					<p className="text-sm text-muted-foreground">
						Manage your account information.
					</p>

					{/* Avatar */}
					<div className="mt-6 flex items-center gap-4">
						<div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
							{initials}
						</div>

						<div>
							<p className="font-medium">{currentEmail}</p>

							<p className="text-sm text-muted-foreground">Your account</p>
						</div>
					</div>
				</div>

				<Separator />

				{/* Email */}
				<div className="space-y-4 p-6">
					<div>
						<Label htmlFor="email">Email address</Label>

						<p className="mt-1 text-sm text-muted-foreground">
							This email is used to access your account.
						</p>
					</div>

					<div className="relative">
						<Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

						<Input
							id="email"
							type="email"
							placeholder={currentEmail}
							value={newEmail}
							onChange={(e) => setNewEmail(e.target.value)}
							disabled={savingEmail}
							className="pl-9"
						/>
					</div>

					{/* Current password, separate from the Password section below */}
					<div className="space-y-2">
						<Label htmlFor="email-password">Current password</Label>

						<div className="relative">
							<Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

							<Input
								id="email-password"
								type={showEmailPassword ? "text" : "password"}
								autoComplete="current-password"
								value={emailPassword}
								onChange={(e) => setEmailPassword(e.target.value)}
								disabled={savingEmail}
								className="pl-9 pr-10"
							/>

							<button
								type="button"
								onClick={() => setShowEmailPassword(!showEmailPassword)}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
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
					{emailNotice && <p role="status" className="text-sm text-green-600">{emailNotice}</p>}
					<div className="flex justify-end pt-2">
						<Button onClick={handleEmailUpdate} disabled={savingEmail}>{savingEmail ? "Saving..." : "Change email"}</Button>
					</div>
				</div>
			</section>

			{/* Password */}
			<section className=" border-x-0 border-b-0  border bg-background p-6">
				<div className="p-6">
					<h2 className="text-lg font-semibold">Password</h2>

					<p className="text-sm text-muted-foreground">
						Update your password to keep your account secure.
					</p>
				</div>

				<Separator />

				<div className="space-y-5 p-6">
					{/* Current password */}
					<div className="space-y-2">
						<Label htmlFor="current-password">Current password</Label>

						<div className="relative">
							<Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

							<Input
								id="current-password"
								type={showCurrent ? "text" : "password"}
								value={currentPassword}
								onChange={(e) => setCurrentPassword(e.target.value)}
								className="pl-9 pr-10"
							/>

							<button
								type="button"
								onClick={() => setShowCurrent(!showCurrent)}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
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
							<Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

							<Input
								id="new-password"
								type={showNew ? "text" : "password"}
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
								className="pl-9 pr-10"
							/>

							<button
								type="button"
								onClick={() => setShowNew(!showNew)}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
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
							<Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

							<Input
								id="confirm-password"
								type={showConfirm ? "text" : "password"}
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								className="pl-9 pr-10"
							/>

							<button
								type="button"
								onClick={() => setShowConfirm(!showConfirm)}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
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
					{passwordNotice && <p role="status" className="text-sm text-green-600">{passwordNotice}</p>}
					<div className="flex justify-end pt-2">
						<Button onClick={handlePasswordUpdate} disabled={savingPassword}>{savingPassword ? "Saving..." : "Update password"}

						</Button>
					</div>
				</div>
			</section>

			{/* GDPR section */}
			<section className=" border-x-0 border-b-0 border bg-background p-6">
				<div className="p-6">
					<h2 className="text-lg font-semibold">Privacy & data</h2>

					<p className="text-sm text-muted-foreground">
						Your rights under the GDPR: get a copy of your data or delete your account.
					</p>
				</div>

				<Separator />

				<div className="space-y-4 p-6">
					<div>
						<Label>Export my data</Label>
						<p className="mt-1 text-sm text-muted-foreground">
							Download everything InsightFlow stores about you as a JSON file.
						</p>
					</div>

					{exportError && <p role="alert" className="text-sm text-destructive">{exportError}</p>}
					{exportNotice && <p role="status" className="text-sm text-green-600">{exportNotice}</p>}

					<div className="flex justify-end">
						<Button variant="outline" onClick={handlexport} disabled={exporting}>
							<Download className="h-4 w-4" />
							{exporting ? "Preparing..." : "Export my data"}
						</Button>
					</div>
				</div>

				<Separator />

				<div className="space-y-4 p-6">
					<div>
						<Label htmlFor="delete-password" className="text-destructive">Delete my account</Label>
						<p className="mt-1 text-sm text-muted-foreground">
							This permanently deletes your account. If you are the only member, your organization is deleted too. This cannot be undone.
						</p>
					</div>

					<div className="relative">
						<Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

						<Input
							id="delete-password"
							type={showDeletePassword ? "text" : "password"}
							autoComplete="current-password"
							placeholder="Current password"
							value={deletePassword}
							onChange={(e) => { setDeletePassword(e.target.value); setConfirmDelete(false); }}
							disabled={deleting}
							className="pl-9 pr-10"
						/>

						<button
							type="button"
							onClick={() => setShowDeletePassword(!showDeletePassword)}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"

						>
							{showDeletePassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
						</button>
					</div>
						{deleteError && <p role="alert" className="text-sm text-destructive">{deleteError}</p>}
						{confirmDelete && !deleteError && (
							<p role="alert" className="text-sm text-destructive">Click again to confirm. Your account will be deleted.</p>
						)}
					
					<div className="flex justify-end gap-2">
						{confirmDelete && (
							<Button variant="outline" onClick={() => setConfirmDelete(false)} disabled={deleting}>Cancel</Button>
						)}
						<Button variant="destructive" onClick={handleDelete} disabled={deleting}>
							<Trash2 className="h-4 w-4" />
							{deleting ? "Deleting..." : confirmDelete ? "Yes, delete my account" : "Delete my account"}
						</Button>
					</div>
				</div>
			</section>
		</div>
	);
}
