import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
	/** @example 'amine@startup.io' */
	@IsEmail()
	email!: string;

	/** @example 'password123' */
	@IsString()
	@IsNotEmpty()
	password!: string;
}
