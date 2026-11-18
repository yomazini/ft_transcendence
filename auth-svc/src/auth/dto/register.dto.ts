import { IsEmail, IsNotEmpty, IsString, Length, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterDto {
	@IsEmail()
	@MaxLength(254)
	email!: string;

	@IsString()
	@MinLength(8)
	@MaxLength(128)
	password!: string;

	@Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
	@IsString()
	@IsNotEmpty()
	@MaxLength(50)
	org_name!: string;

	@IsString()
	@IsNotEmpty()
	@Length(100, 200)
	org_description!: string;
}
