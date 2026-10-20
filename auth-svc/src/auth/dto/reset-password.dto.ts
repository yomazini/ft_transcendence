import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class ResetPasswordDto {
	/** Token from the reset email link (#reset_token=...), valid 15 minutes. @example '<reset_token from the email link>' */
	@IsString()
	@IsNotEmpty()
	reset_token!: string;

	/** At least 8 characters. @example 'newpassword123' */
	@IsString()
	@MinLength(8)
	new_password!: string;
}
