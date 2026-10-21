import { IsNotEmpty, IsString, Length, MinLength } from 'class-validator';

export class Complete42Dto {
	/** Short-lived token from the /auth/42/callback redirect (#signup_token=...). @example '<signup_token from the 42 callback redirect>' */
	@IsString()
	@IsNotEmpty()
	signup_token!: string;

	/** @example 'Amine Labs' */
	@IsString()
	@IsNotEmpty()
	org_name!: string;

	/**
	 * What the organization does, 100 to 200 characters.
	 * @example 'We build a scheduling app for freelance designers and want to know what users say about pricing, onboarding and competitors on Reddit.'
	 */
	@IsString()
	@IsNotEmpty()
	@Length(100, 200)
	org_description!: string;

	/** Lets a 42 user change their password or email later. At least 8 characters. @example 'password123' */
	@IsString()
	@MinLength(8)
	password!: string;
}
