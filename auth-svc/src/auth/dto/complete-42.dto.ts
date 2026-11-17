import { IsNotEmpty, IsString, Length, MinLength } from 'class-validator';

export class Complete42Dto {
	@IsString()
	@IsNotEmpty()
	signup_token!: string;

	@IsString()
	@IsNotEmpty()
	org_name!: string;

	@IsString()
	@IsNotEmpty()
	@Length(100, 200)
	org_description!: string;

	@IsString()
	@MinLength(8)
	password!: string;
}
