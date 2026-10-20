import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class AcceptInviteDto {
	/** Token from the invite email link (#invite_token=...), valid 48 hours. @example '<invite_token from the email link>' */
	@IsString()
	@IsNotEmpty()
	invite_token!: string;

	/** Password for the new account, at least 8 characters. @example 'password123' */
	@IsString()
	@MinLength(8)
	password!: string;
}
