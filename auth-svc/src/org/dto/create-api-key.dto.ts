import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateApiKeyDto {
	@IsOptional()
	@IsString()
	@MaxLength(40)
	label?: string;
}
