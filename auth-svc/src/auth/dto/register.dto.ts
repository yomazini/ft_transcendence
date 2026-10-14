import { IsEmail, IsNotEmpty, IsString, Length, MinLength } from 'class-validator';

export class RegisterDto {
	@IsEmail()
	email!: string;

	@IsString()
	@IsNotEmpty()
	@Length(100, 200)
	org_description!: string;

	@IsString()
	@MinLength(8)
	password!: string;

	@IsString()
	@IsNotEmpty()
	org_name!: string;
}