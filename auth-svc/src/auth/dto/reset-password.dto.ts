import { IsNotEmpty, IsString, MinLength } from "class-validator";


export class ResetPasswordDto {
	@IsString()
	@IsNotEmpty()
	reset_token!: string;

	@IsString()
	@MinLength(8)
	new_password!: string;
} 