import { IsNotEmpty, IsString } from 'class-validator'

export class DeleteAccountDto {
	/** Current password, asked again to confirm the deletion. @example 'password123' */
	@IsString()
	@IsNotEmpty()
	password!: string;
}
