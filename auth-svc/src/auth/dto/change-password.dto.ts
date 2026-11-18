import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator'

export class ChangePasswordDto {
	@IsString()
	@IsNotEmpty()
	@MaxLength(128)
	current_password!: string;

	@IsString()
	@MinLength(8)
	@MaxLength(128)
	new_password!: string;
}
