"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Building2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { deleteOrg, getOrg, updateOrg, type Organization as Org } from "@/lib/api/members";
import { clearToken } from "@/lib/auth";

const MIN_DESCRIPTION = 100;
const MAX_DESCRIPTION = 200;

export default function Organization({ orgId, isAdmin }: { orgId: string; isAdmin: boolean }) {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [org, setOrg] = useState<Org | null>(null);
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [loadError, setLoadError] = useState("");
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [notice, setNotice] = useState("");
	const [confirmDelete, setConfirmDelete] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [deleteError, setDeleteError] = useState("");

	useEffect(() => {
		let active = true;
		getOrg(orgId)
			.then((data) => {
				if (!active) return;
				setOrg(data);
				setName(data.name);
				setDescription(data.description);
			})
			.catch((err) => {
				if (active) setLoadError(err instanceof Error ? err.message : "Could not load the organization.");
			});
		return () => {
			active = false;
		};
	}, [orgId]);

	const trimmedName = name.trim();
	const trimmedDescription = description.trim();
	const changed = !!org && (trimmedName !== org.name || trimmedDescription !== org.description);

	async function handleSave() {
		setNotice("");
		setError("");
		if (!org) return;
		if (!trimmedName) {
			setError("Enter the organization name.");
			return;
		}
		if (trimmedDescription.length < MIN_DESCRIPTION) {
			setError(`Describe your organization in at least ${MIN_DESCRIPTION} characters.`);
			return;
		}
		const body: { name?: string; description?: string } = {};
		if (trimmedName !== org.name) body.name = trimmedName;
		if (trimmedDescription !== org.description) body.description = trimmedDescription;
		setSaving(true);
		try {
			const updated = await updateOrg(orgId, body);
			setOrg(updated);
			setName(updated.name);
			setDescription(updated.description);
			setNotice("Organization updated.");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not update the organization.");
		} finally {
			setSaving(false);
		}
	}

	async function handleDelete() {
		setDeleteError("");
		if (!confirmDelete) {
			setConfirmDelete(true);
			return;
		}
		setDeleting(true);
		try {
			await deleteOrg(orgId);
			clearToken();
			queryClient.clear();
			router.replace("/login");
		} catch (err) {
			setDeleteError(err instanceof Error ? err.message : "Could not delete the organization.");
			setDeleting(false);
		}
	}

	return (
		<section className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-zinc-900/60">
			<div className="flex items-start gap-3 p-6">
				<Building2 className="mt-1 h-5 w-5 text-violet-600 dark:text-violet-400" />
				<div>
					<h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Organization</h2>
					<p className="text-sm text-muted-foreground">
						{isAdmin ? "Your workspace name and what it does." : "Only an Admin can change these details."}
					</p>
				</div>
			</div>

			<Separator />

			{loadError ? (
				<p role="alert" className="p-6 text-sm text-red-600 dark:text-red-400">{loadError}</p>
			) : (
				<div className="space-y-5 p-6">
					<div className="space-y-2">
						<Label htmlFor="org-name">Organization name</Label>
						<Input
							id="org-name"
							value={name}
							onChange={(e) => { setName(e.target.value); setNotice(""); }}
							disabled={!org || !isAdmin || saving}
							placeholder={org ? "" : "Loading..."}
							className="h-10 rounded-xl border-zinc-200 bg-zinc-50/50 focus-visible:ring-violet-500/20 dark:border-white/10 dark:bg-zinc-800/50"
						/>
					</div>

					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<Label htmlFor="org-description">Description</Label>
							<span
								aria-live="polite"
								className={`text-xs font-medium ${trimmedDescription.length < MIN_DESCRIPTION ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`}
							>
								{trimmedDescription.length}/{MAX_DESCRIPTION}
							</span>
						</div>
						<Textarea
							id="org-description"
							rows={4}
							maxLength={MAX_DESCRIPTION}
							value={description}
							onChange={(e) => { setDescription(e.target.value); setNotice(""); }}
							disabled={!org || !isAdmin || saving}
							className="rounded-xl border-zinc-200 bg-zinc-50/50 focus-visible:ring-violet-500/20 dark:border-white/10 dark:bg-zinc-800/50"
						/>
						{isAdmin && (
							<p className="text-xs text-muted-foreground">
								Between {MIN_DESCRIPTION} and {MAX_DESCRIPTION} characters. Used as context for new analyses. Existing reports don&apos;t change.
							</p>
						)}
					</div>

					{error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
					{notice && <p role="status" className="text-sm text-emerald-600 dark:text-emerald-400">{notice}</p>}

					{isAdmin && (
						<div className="flex justify-end pt-2 [&_button]:rounded-xl [&_button]:bg-violet-600 [&_button]:text-white [&_button]:hover:bg-violet-700">
							<Button onClick={handleSave} disabled={!changed || saving}>
								{saving ? "Saving..." : "Save changes"}
							</Button>
						</div>
					)}
				</div>
			)}

			{isAdmin && !loadError && (
				<>
					<Separator />
					<div className="space-y-4 p-6">
						<div>
							<Label className="text-red-600 dark:text-red-400">Delete organization</Label>
							<p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
								This permanently deletes the organization, <strong>every member&apos;s account</strong>, its jobs and reports. This cannot be undone.
							</p>
						</div>

						{deleteError && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{deleteError}</p>}
						{confirmDelete && !deleteError && (
							<p role="alert" className="text-sm text-red-600 dark:text-red-400">
								Click again to confirm. {org ? `"${org.name}"` : "The organization"} and all its members will be deleted.
							</p>
						)}

						<div className="flex justify-end gap-2 [&_button]:rounded-xl">
							{confirmDelete && (
								<Button variant="outline" onClick={() => setConfirmDelete(false)} disabled={deleting}>
									Cancel
								</Button>
							)}
							<Button variant="destructive" onClick={handleDelete} disabled={!org || deleting}>
								<Trash2 className="h-4 w-4" />
								{deleting ? "Deleting..." : confirmDelete ? "Yes, delete the organization" : "Delete organization"}
							</Button>
						</div>
					</div>
				</>
			)}
		</section>
	);
}
