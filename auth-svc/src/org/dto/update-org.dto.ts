import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class UpdateOrgDto {
	/** New name (optional). @example 'Amine Labs' */
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	name?: string;

	/**
	 * New description (optional), 100 to 200 characters.
	 * @example 'Amine Labs helps small online shops understand customer feedback from Reddit to improve pricing, delivery and support every week.'
	 */
	@IsOptional()
	@Length(100, 200)
	@IsString()
	description?: string;
}
