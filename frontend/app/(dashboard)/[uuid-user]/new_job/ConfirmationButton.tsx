import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Role } from "@/lib/auth";
import { ButtonProps } from "@base-ui/react";
import { useState } from "react";

interface RoleButtonProps extends ButtonProps {
	roles: Role[]
	confirmFunc: (name: string) => Promise<void>
	userRole: Role | null
}

export function EditNameButton({roles, confirmFunc, userRole, children, ...props}: RoleButtonProps)
{
	const [name, setName] = useState("")
	if (userRole === null)
		return <></>
	return roles.includes(userRole) ? (
			<Dialog>
				<DialogTrigger render={<Button {...props} variant="ghost" size="icon">{children}</Button>}>
				</DialogTrigger>
				<DialogContent>
    				<DialogHeader>
    					<DialogTitle>Edit name</DialogTitle>
    					<DialogDescription>
    						Change the name of this item.
    					</DialogDescription>
    				</DialogHeader>
					<Input max={40} value={name} placeholder="EnterName" onChange={(val) => setName(val.target.value)}/>
					<DialogFooter>
    					<DialogClose render={<Button variant="outline">Cancel</Button>}>
    					</DialogClose>				
    					<DialogClose render={<Button disabled={name === ""} onClick={async () => {
							await confirmFunc(name);
							setName("")
						}}>Save changes</Button>}>
    					</DialogClose>
    				</DialogFooter>
				</DialogContent>
			</Dialog>
		) : <></>
		
}