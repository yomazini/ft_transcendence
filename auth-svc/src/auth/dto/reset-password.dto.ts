import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class ResetPasswordDto {
	@IsString()
	@IsNotEmpty()
	reset_token!: string;

	@IsString()
	@MinLength(8)
	@MaxLength(128)
	new_password!: string;
}
