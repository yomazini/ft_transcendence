import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class ChangeEmailDto {
	/** @example 'amine.new@startup.io' */
	@IsEmail()
	new_email!: string;

	/** Current password, asked again to confirm. @example 'password123' */
	@IsString()
	@IsNotEmpty()
	password!: string;
}
