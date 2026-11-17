import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class UpdateOrgDto {
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	name?: string;

	@IsOptional()
	@Length(100, 200)
	@IsString()
	description?: string;
}
