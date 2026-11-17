import { IsEmail, IsIn, MaxLength } from "class-validator";

export class InviteMemberDto {
	@IsEmail()
	@MaxLength(254)
	email!: string;

	@IsIn(['Admin', 'Analyst', 'Viewer'])
	role!: 'Admin'| 'Analyst'| 'Viewer'
}
