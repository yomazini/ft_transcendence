import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class AcceptInviteDto {

	@IsString()
	@IsNotEmpty()
	invite_token!: string;

	@IsString()
	@MinLength(8)
	password!: string;
}