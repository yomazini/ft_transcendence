import { IsEmail, IsIn } from "class-validator";

export class InviteMemberDto {
	/** Email of the person to invite (no account yet). @example 'sara@startup.io' */
	@IsEmail()
	email!: string;

	/** Role given when they accept. @example 'Analyst' */
	@IsIn(['Admin', 'Analyst', 'Viewer'])
	role!: 'Admin'| 'Analyst'| 'Viewer'
}
