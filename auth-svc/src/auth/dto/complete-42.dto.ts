import { IsNotEmpty, IsString, Length, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class Complete42Dto {
	@IsString()
	@IsNotEmpty()
	signup_token!: string;

	@Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
	@IsString()
	@IsNotEmpty()
	@MaxLength(50)
	org_name!: string;

	@IsString()
	@IsNotEmpty()
	@Length(100, 200)
	org_description!: string;

	@IsString()
	@MinLength(8)
	@MaxLength(128)
	password!: string;
}
