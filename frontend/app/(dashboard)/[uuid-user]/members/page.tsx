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
		<main className="mx-auto w-full max-w-[1730px] space-y-3 p-3 sm:p-5 lg:p-6">
			<section className="border p-5 sm:p-6">
				<h1 className="text-lg font-semibold">Members</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					People in your organization and their role.
					{!isAdmin && " Only an Admin can invite or change members."}
				</p>

				{isAdmin && (
					<form className="mt-4 flex flex-col gap-3 sm:flex-row" onSubmit={handleInvite} noValidate>
						<Input
							aria-label="Email to invite"
							type="email"
							placeholder="teammate@example.com"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							disabled={invite.isPending}
							className="sm:flex-1"
						/>
						<select
							aria-label="Role of the invited member"
							className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
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
						<Button type="submit" disabled={invite.isPending}>
							<UserPlus className="size-4" />
							{invite.isPending ? "Sending..." : "Invite"}
						</Button>
					</form>
				)}

				{notice && (
					<p role="status" className="mt-3 text-sm text-green-600">
						{notice}
					</p>
				)}
				{problem && (
					<p role="alert" className="mt-3 text-sm text-destructive">
						{problem}
					</p>
				)}
			</section>

			<section className="border p-5 sm:p-6">
				{loading ? (
					<p className="text-sm text-muted-foreground">Loading members...</p>
				) : error ? (
					<p className="text-sm text-destructive">{error.message}</p>
				) : (
					<ul className="divide-y">
						{members.map((member) => {
							const isMe = member.id === me?.id;
							return (
								<li key={member.id} className="flex items-center gap-3 py-3 text-sm">
									<span className="min-w-0 flex-1 truncate">
										{member.email}
										{isMe && <span className="ml-2 text-xs text-muted-foreground">(you)</span>}
									</span>
									<span className="hidden text-xs text-muted-foreground sm:inline">
										joined {new Date(member.created_at).toLocaleDateString()}
									</span>
									{isAdmin ? (
										<select
											aria-label={`Role of ${member.email}`}
											className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm"
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
										<span className="w-20 text-right text-xs font-medium">{member.role}</span>
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
