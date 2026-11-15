import { Button } from "@/components/ui/button";
import { Role } from "@/lib/auth";
import { ButtonProps } from "@base-ui/react";

interface RoleButtonProps extends ButtonProps {
	roles: Role[]
	userRole: Role | null
}

export function RoleButton({roles, userRole, children, ...props}: RoleButtonProps)
{
	if (userRole === null)
		return <></>
	return roles.includes(userRole) ? (
			<Button {...props} variant="ghost" size="icon">
				{children}
			</Button>
		) : <></>
		
}