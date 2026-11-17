import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class ChangeEmailDto {
	@IsEmail()
	new_email!: string;

	@IsString()
	@IsNotEmpty()
	password!: string;
}
