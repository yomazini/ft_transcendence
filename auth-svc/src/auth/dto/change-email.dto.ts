import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class ChangeEmailDto {
	@IsEmail()
	@MaxLength(254)
	new_email!: string;

	@IsString()
	@IsNotEmpty()
	@MaxLength(128)
	password!: string;
}
