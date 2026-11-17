import { IsString, Matches } from 'class-validator';

export class TwoFactorCodeDto {
	@IsString()
	@Matches(/^\d{6}$/, { message: 'code must be 6 digits' })
	code!: string;
}
