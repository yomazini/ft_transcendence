import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateApiKeyDto {
	/** Name to recognise the key (optional), at most 40 characters. @example 'Nightly export' */
	@IsOptional()
	@IsString()
	@MaxLength(40)
	label?: string;
}
