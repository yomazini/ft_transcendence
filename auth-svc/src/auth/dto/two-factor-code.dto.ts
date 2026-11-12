import { IsString, Matches } from 'class-validator';

export class TwoFactorCodeDto {
	/** The 6-digit code from the authenticator app. @example '123456' */
	@IsString()
	@Matches(/^\d{6}$/, { message: 'code must be 6 digits' })
	code!: string;
}
