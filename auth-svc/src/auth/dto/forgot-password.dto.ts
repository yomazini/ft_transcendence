import { IsEmail } from 'class-validator'

export class ForgotPasswordDto {
	/** @example 'amine@startup.io' */
	@IsEmail()
	email!: string;
}
