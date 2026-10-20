import { IsNotEmpty, IsString, MinLength } from 'class-validator'

export class ChangePasswordDto {
	/** @example 'password123' */
	@IsString()
	@IsNotEmpty()
	current_password!: string;

	/** At least 8 characters. @example 'newpassword123' */
	@IsString()
	@MinLength(8)
	new_password!: string;
}
