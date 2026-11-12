import { IsJWT, IsString } from 'class-validator'
import { TwoFactorCodeDto } from './two-factor-code.dto';

export class VerifyTwoFactorDto extends TwoFactorCodeDto {
	/** The 5-minute token returned by POST /auth/login when 2FA is on. @example 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' */
	@IsString()
	@IsJWT()
	two_factor_token!: string;
}