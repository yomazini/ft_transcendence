import { IsEmail, IsNotEmpty, IsString, Length, MinLength } from 'class-validator';

export class RegisterDto {
	/** @example 'amine@startup.io' */
	@IsEmail()
	email!: string;

	/** At least 8 characters. @example 'password123' */
	@IsString()
	@MinLength(8)
	password!: string;

	/** @example 'Amine Labs' */
	@IsString()
	@IsNotEmpty()
	org_name!: string;

	/**
	 * What the organization does, 100 to 200 characters (context for the AI reports).
	 * @example 'We build a scheduling app for freelance designers and want to know what users say about pricing, onboarding and competitors on Reddit.'
	 */
	@IsString()
	@IsNotEmpty()
	@Length(100, 200)
	org_description!: string;
}
