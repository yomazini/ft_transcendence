import { IsNotEmpty, IsOptional, IsString, Length, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateOrgDto {
	@IsOptional()
	@Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
	@IsString()
	@IsNotEmpty()
	@MaxLength(50)
	name?: string;

	@IsOptional()
	@Length(100, 200)
	@IsString()
	description?: string;
}
