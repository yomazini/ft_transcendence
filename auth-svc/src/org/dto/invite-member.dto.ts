import { IsEmail, IsIn } from "class-validator";

export class InviteMemberDto {
	@IsEmail()
	email!: string;

	@IsIn(['Admin', 'Analyst', 'Viewer'])
	role!: 'Admin'| 'Analyst'| 'Viewer'
}