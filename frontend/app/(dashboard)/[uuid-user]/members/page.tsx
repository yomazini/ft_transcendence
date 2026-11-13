
"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMembers } from "@/hooks/useMembers";
import { changeRole, inviteMember, removeMember } from "@/lib/api/members";
import { isValidEmail, type Role } from "@/lib/auth";

const ROLES: Role[] = ["Admin", "Analyst", "Viewer"];

/** Organization members: everyone can see the list; only an Admin can invite,
 *  change a role or remove someone (auth-svc enforces it, the page only hides the controls). */
export default function MembersPage() {
	const queryClient = useQueryClient();
	const { members, loading, error, orgId, me } = useMembers();
	const isAdmin = me?.role === "Admin";

	const [email, setEmail] = useState<string>("");
	const [role, setRole] = useState<Role>("Viewer");
	const [notice, setNotice] = useState<string>("");
	const [problem, setProblem] = useState<string>("");

	const refresh = () => queryClient.invalidateQueries({ queryKey: ["members"] });
	const onError = (err: Error) => {
		setNotice("");
		setProblem(err.message);
	};

	const invite = useMutation({
		mutationFn: () => inviteMember(orgId as string, email.trim(), role),
		onSuccess: () => {
			setProblem("");
			setNotice(`Invitation sent to ${email.trim()}.`);
			setEmail("");
		},
		onError,
	});
	const updateRole = useMutation({
		mutationFn: (v: { userId: string; role: Role }) => changeRole(orgId as string, v.userId, v.role),
		onSuccess: () => {
			setProblem("");
			refresh();
		},
		onError,
	});
	const remove = useMutation({
		mutationFn: (userId: string) => removeMember(orgId as string, userId),
		onSuccess: () => {
			setProblem("");
			refresh();
		},
		onError,
	});

	function handleInvite(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		if (!isValidEmail(email.trim())) {
			setProblem("Enter a valid email address.");
			return;
		}
		invite.mutate();
	}

	return (
		<main className="page-d"> {/*mx-auto w-full max-w-9xl space-y-5 p-4 sm:p-5 lg:p-6*/}
			<section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-900/60 sm:p-6">
				<h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-white">
					Members
				</h1>
				<p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
					People in your organization and their role.
					{!isAdmin && " Only an Admin can invite or change members."}
				</p>

				{isAdmin && (
					<form className="mt-6 flex flex-col gap-3 sm:flex-row" onSubmit={handleInvite} noValidate>
						<Input
							aria-label="Email to invite"
							type="email"
							placeholder="teammate@example.com"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							disabled={invite.isPending}
							className="h-10 rounded-xl border-zinc-200 bg-zinc-50/50 text-zinc-900 placeholder:text-zinc-400 focus-visible:border-violet-400 focus-visible:ring-violet-500/20 dark:border-white/10 dark:bg-zinc-800/50 dark:text-zinc-100 sm:flex-1"
						/>
						<select
							aria-label="Role of the invited member"
							className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700 outline-none focus:border-violet-400 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-200"
							value={role}
							onChange={(e) => setRole(e.target.value as Role)}
							disabled={invite.isPending}
						>
							{ROLES.map((r) => (
								<option key={r} value={r}>
									{r}
								</option>
							))}
						</select>
						<Button
							type="submit"
							disabled={invite.isPending}
							className="h-10 gap-2 rounded-xl bg-violet-600 px-5 text-white hover:bg-violet-700 dark:bg-violet-600 dark:hover:bg-violet-500"
						>
							<UserPlus className="size-4" />
							{invite.isPending ? "Sending..." : "Invite"}
						</Button>
					</form>
				)}

				{notice && (
					<p role="status" className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
						{notice}
					</p>
				)}
				{problem && (
					<p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
						{problem}
					</p>
				)}
			</section>

			<section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-900/60 sm:p-6">
				{loading ? (
					<p className="text-sm text-zinc-500 dark:text-zinc-400">Loading members...</p>
				) : error ? (
					<p className="text-sm text-red-600 dark:text-red-400">{error.message}</p>
				) : (
					<ul className="divide-y divide-zinc-100 dark:divide-white/10">
						{members.map((member) => {
							const isMe = member.id === me?.id;
							return (
								<li key={member.id} className="flex items-center gap-3 py-4 text-sm">
									<span className="min-w-0 flex-1 truncate font-medium text-zinc-800 dark:text-zinc-200">
										{member.email}
										{isMe && <span className="ml-2 text-xs font-normal text-violet-600 dark:text-violet-400">(you)</span>}
									</span>
									<span className="hidden text-xs text-zinc-500 dark:text-zinc-400 sm:inline">
										joined {new Date(member.created_at).toLocaleDateString()}
									</span>
									{isAdmin ? (
										<select
											aria-label={`Role of ${member.email}`}
											className="h-9 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-700 outline-none focus:border-violet-400 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-200"
											value={member.role}
											onChange={(e) => updateRole.mutate({ userId: member.id, role: e.target.value as Role })}
											disabled={updateRole.isPending}
										>
											{ROLES.map((r) => (
												<option key={r} value={r}>
													{r}
												</option>
											))}
										</select>
									) : (
										<span className="w-20 text-right text-xs font-medium text-zinc-600 dark:text-zinc-300">{member.role}</span>
									)}
									{isAdmin && !isMe && (
										<Button
											variant="ghost"
											size="icon"
											aria-label={`Remove ${member.email}`}
											onClick={() => {
												if (window.confirm(`Remove ${member.email}? Their account will be deleted.`)) {
													remove.mutate(member.id);
												}
											}}
											disabled={remove.isPending}
											className="rounded-lg text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
										>
											<Trash2 className="size-4 text-destructive" />
										</Button>
									)}
								</li>
							);
						})}
					</ul>
				)}
			</section>
		</main>
	);
}
