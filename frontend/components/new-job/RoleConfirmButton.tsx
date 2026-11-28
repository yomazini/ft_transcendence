import {
	Dialog,
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
	DialogClose
} from "@/components/ui/dialog";

import { TriangleAlert } from "lucide-react";
import { ReactElement, ReactNode } from "react";

import { Role } from "@/lib/auth";

interface RoleConfirmButtonProps {
	trigger: ReactElement;
	cancel: ReactElement;
	confirm: ReactElement;
	children?: ReactNode;
	title?: string;
	description?: string;
	role: Role | null;
	roles: Role[];
	danger?: boolean;
}

export function RoleConfirmButton({role, roles, trigger, cancel, confirm, title, description, children, danger = false}: RoleConfirmButtonProps)
{
	if (role === null || !roles.includes(role))
		return (<></>)
	return (
		<Dialog> 
			<DialogTrigger render={trigger}>
			</DialogTrigger>
			<DialogContent className={danger ? "border-2 border-red-800 shadow-xl shadow-red-950/20" : ""}>
				<DialogHeader>
					{title && <DialogTitle>{danger && <TriangleAlert/>}{title}</DialogTitle>}
					{description && (<DialogDescription>{description}</DialogDescription>)}
				</DialogHeader>
				{children}
				<DialogFooter>
					<DialogClose render={cancel}/>			
					<DialogClose render={confirm}/>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
		
}